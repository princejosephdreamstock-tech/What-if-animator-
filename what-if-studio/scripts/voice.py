"""python scripts/voice.py <slug> [--dry]
Step 2. Records every script[].text with ElevenLabs (one call per line, cached), trims the silence at each line's ends,
joins the lines with pauses and writes public/<slug>/voice.wav and src/episodes/<slug>/words.json.
Env (or a .env above the studio): ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, optional ELEVENLABS_MODEL.
episode.json: script[].pause (seconds after that line, overrides the gap), "gap": seconds or {"sentence": 0.3, "other": 0.12}."""
import base64, hashlib, json, os, re, sys, time
import numpy as np
import wi

SR = wi.SR


def env_value(name, default=None):
    if os.environ.get(name):
        return os.environ[name]
    for d in [wi.STUDIO, *wi.STUDIO.parents]:
        p = d / '.env'
        if p.exists():
            for line in wi.read_env(p).splitlines():
                if line.strip().startswith(name + '='):
                    return line.split('=', 1)[1].strip().strip('"').strip("'")
    return default


def clean(t):
    return re.sub(r'\s+', ' ', t.replace('*', '')).strip()


def words_from_alignment(al, text):
    chars = al['characters']
    st, en = al['character_start_times_seconds'], al['character_end_times_seconds']
    out, cur = [], None
    for i, ch in enumerate(chars):
        if ch.isspace():
            if cur:
                out.append(cur)
                cur = None
            continue
        if cur is None:
            cur = {'w': ch, 's': st[i], 'e': en[i]}
        else:
            cur['w'] += ch
            cur['e'] = en[i]
    if cur:
        out.append(cur)
    if len(out) != len(text.split()):
        print(f'  ! word count differs for a line ({len(out)} timed, {len(text.split())} in the text); using the timed words')
    return out


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    slug = sys.argv[1]
    dry = '--dry' in sys.argv
    ep = wi.load_episode(slug)
    lines = [(clean(b['text']), b) for b in ep['script']]
    chars = sum(len(t) for t, _ in lines)
    voice_id = env_value('ELEVENLABS_VOICE_ID') or (ep.get('voice') or {}).get('id')
    model = env_value('ELEVENLABS_MODEL', 'eleven_multilingual_v2')
    vo = wi.pub_dir(slug) / 'vo'
    vo.mkdir(exist_ok=True)

    def key(t):
        return hashlib.sha1(f'{voice_id}|{model}|{t}'.encode()).hexdigest()[:10]

    todo = [t for t, _ in lines if not (vo / f'{key(t)}.json').exists()]
    new_chars = sum(len(t) for t in todo)
    print(f'{len(lines)} lines, {chars} characters; {len(todo)} lines ({new_chars} characters) still to record')
    if dry:
        return
    if not voice_id:
        sys.exit('No voice: set ELEVENLABS_VOICE_ID in the environment or a .env file.')
    t0 = time.time()
    for t in todo:
        raw = wi.api(f'/v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128', {'text': t, 'model_id': model})
        r = json.loads(raw)
        (vo / f'{key(t)}.mp3').write_bytes(base64.b64decode(r['audio_base64']))
        (vo / f'{key(t)}.json').write_text(json.dumps(r['alignment']), encoding='utf-8')
        print('  recorded:', t[:60])
    if todo:
        used, n = wi.spent_since(t0, expect=len(todo))
        wi.log_cost(slug, 'voice', used, f'{new_chars} chars, {n} items')

    gap_cfg = ep.get('gap')
    g_sent = gap_cfg if isinstance(gap_cfg, (int, float)) else (gap_cfg or {}).get('sentence', 0.30)
    g_other = gap_cfg if isinstance(gap_cfg, (int, float)) else (gap_cfg or {}).get('other', 0.12)
    INTRO = ep.get('intro', 0.2)  # seconds of silence before the first word
    parts, words, clock = [np.zeros(int(INTRO * SR))], [], INTRO
    for t, b in lines:
        x = wi.decode(vo / f'{key(t)}.mp3')
        al = json.loads((vo / f'{key(t)}.json').read_text(encoding='utf-8'))
        loud = np.where(np.abs(x) > 0.01)[0]
        a = max(0, (loud[0] if len(loud) else 0) - int(0.03 * SR))
        z = min(len(x), (loud[-1] if len(loud) else len(x)) + int(0.07 * SR))
        seg = x[a:z]
        for w in words_from_alignment(al, t):
            words.append({'w': w['w'], 's': round(clock + w['s'] - a / SR, 3), 'e': round(clock + w['e'] - a / SR, 3)})
        parts.append(seg)
        clock += len(seg) / SR
        pause = b.get('pause', g_sent if t[-1:] in '.?!' else g_other)
        parts.append(np.zeros(int(pause * SR)))
        clock += pause
    y = np.concatenate(parts)
    wi.write_wav(wi.pub_dir(slug) / 'voice.wav', y, peak=0.9)
    wi.save_json(wi.ep_dir(slug) / 'words.json', words)
    print(f'voice.wav {len(y) / SR:.1f} s, {len(words)} words; last word ends {words[-1]["e"]:.1f} s')


main()
