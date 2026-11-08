"""python scripts/sfx.py <slug> [--dry]
Step 7. Generates the sound clips (ElevenLabs sound generation, cached in library/sfx/), places every event on its frame,
and writes public/<slug>/sfx.wav and music.wav, then sets the stem volumes in timeline.json.
Run after voice.py and plan.py. Reads episode.json "sound", timeline.json, words.json."""
import sys, time
import numpy as np
import wi

SR = wi.SR


def gen_clip(name, prompt, secs):
    p = wi.clip_path(name, prompt, secs)
    if p.exists():
        return p, False
    secs = max(0.5, min(30.0, float(secs)))
    data = wi.api('/v1/sound-generation', {'text': prompt, 'duration_seconds': secs, 'prompt_influence': 0.4})
    p.write_bytes(data)
    return p, True


def load_clip(p):
    x = wi.decode(p)
    pk = np.abs(x).max()
    return x / pk if pk > 0 else x


def onset_index(x, thr=0.08):
    i = np.where(np.abs(x) > thr)[0]
    return int(i[0]) if len(i) else 0


def put(buf, x, at):
    """Mix x into buf starting at sample `at` (negative starts are cut)."""
    if at < 0:
        x = x[-at:]
        at = 0
    n = min(len(x), len(buf) - at)
    if n > 0:
        buf[at:at + n] += x[:n]


def pitch(x, f):
    if abs(f - 1) < 1e-3:
        return x
    idx = np.arange(0, len(x) - 1, f)
    return np.interp(idx, np.arange(len(x)), x)


def fade(x, a, b):
    x = x.copy()
    a, b = min(a, len(x)), min(b, len(x))
    if a:
        x[:a] *= np.linspace(0, 1, a)
    if b:
        x[len(x) - b:] *= np.linspace(1, 0, b)
    return x


def loop_to(x, n, xf=int(0.25 * SR)):
    """Loop x (crossfaded) until it is n samples long."""
    if len(x) >= n:
        return x[:n]
    xf = min(xf, len(x) // 3)
    out = x.copy()
    while len(out) < n:
        a, b = out[-xf:], x[:xf]
        mix = a * np.linspace(1, 0, xf) + b * np.linspace(0, 1, xf)
        out = np.concatenate([out[:-xf], mix, x[xf:]])
    return out[:n]


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    slug = sys.argv[1]
    dry = '--dry' in sys.argv
    ep = wi.load_episode(slug)
    snd = ep.get('sound') or {}
    clips = snd.get('clips', {})
    missing = [n for n, (pr, s) in clips.items() if not wi.clip_path(n, pr, s).exists()]
    print(f'{len(clips)} clips, {len(missing)} not cached yet: {", ".join(missing) or "none"}')
    if dry:
        return
    used_names = {e[1] for e in snd.get('events', [])} | {r['clip'] for r in snd.get('repeats', [])}
    for m in (snd.get('music'), snd.get('music_alt')):
        if m:
            used_names.add(m['clip'])
    unused = [n for n in clips if n not in used_names]
    if unused:
        print('  ! clips defined but never used:', ', '.join(unused))
    t0 = time.time()
    before = None
    if missing:
        try:
            before = wi.credits_used()[0]
        except Exception:
            before = None
    paths, mono = {}, {}
    for n, (pr, s) in clips.items():
        p, fresh = gen_clip(n, pr, s)
        paths[n] = p
        if fresh:
            print(f'  generated {n} ({s} s)')
        mono[n] = load_clip(p)
    if missing and before is not None:
        time.sleep(4)
        try:
            after = wi.credits_used()[0]
            wi.log_cost(slug, 'sound', max(0, after - before), f'{len(missing)} new clips (account counter, can lag)')
        except Exception:
            pass

    tl = wi.load_json(wi.ep_dir(slug) / 'timeline.json')
    if not tl:
        sys.exit('No timeline.json: run plan.py first.')
    words = wi.load_json(wi.ep_dir(slug) / 'words.json', [])
    fps = tl['fps']
    ids = list(dict.fromkeys(s['shot'] for s in tl['segments']))
    N = int((tl['total'] / fps + 0.5) * SR)
    R = lambda cue: wi.resolve(cue, words, fps, tl['segments'], ids)
    fx = np.zeros(N)

    for ev in snd.get('events', []):
        cue, name, gain = ev[0], ev[1], ev[2]
        mode = ev[3] if len(ev) > 3 else 'onset'
        until = ev[4] if len(ev) > 4 else None
        x = mono[name]
        a = int(R(cue) / fps * SR)
        if until:
            n = int(R(until) / fps * SR) - a
            if n > 0:
                put(fx, fade(loop_to(x, n), int(0.15 * SR), int(0.25 * SR)) * gain, a)
            continue
        k = int(np.argmax(np.abs(x))) if mode == 'peak' else onset_index(x)
        put(fx, x * gain, a - k)

    for r in snd.get('repeats', []):
        x = mono[r['clip']]
        a0 = R(r['at'])
        lo_g, hi_g = r.get('gain', [0.3, 0.3])
        lo_p, hi_p = r.get('pitch', [1, 1])
        n = int(r['n'])
        for i in range(n):
            u = i / max(1, n - 1)
            y = pitch(x, lo_p + (hi_p - lo_p) * u)
            put(fx, y * (lo_g + (hi_g - lo_g) * u), int((a0 + i * r['every']) / fps * SR) - onset_index(y))

    music = np.zeros(N)
    for m in (snd.get('music'), snd.get('music_alt')):
        if not m:
            continue
        a = int(R(m['from']) / fps * SR) if m.get('from') else 0
        z = int(R(m['until']) / fps * SR) if m.get('until') else N
        z = min(z, N)
        if z > a:
            bed = fade(loop_to(mono[m['clip']], z - a), int(0.4 * SR), int(0.5 * SR))
            put(music, bed, a)

    pub = wi.pub_dir(slug)
    voice = wi.stem(slug, 'voice')
    if voice is None:
        sys.exit('No voice.wav: run voice.py first.')
    lv, _ = wi.loudness(voice)
    voice_vol = 0.8
    lv_eff = lv + 20 * np.log10(voice_vol)
    lv_cfg = snd.get('levels', {})
    audio = {'voice': f'{slug}/{voice.name}', 'voiceVol': voice_vol}
    for name, buf, lu in (('sfx', fx, lv_cfg.get('sfx_lu', -6)), ('music', music, lv_cfg.get('music_lu', -12))):
        if not np.abs(buf).max() > 0:
            print(f'  {name}: empty, skipped')
            continue
        buf = buf / max(1.0, np.abs(buf).max() / 0.95)
        wi.write_wav(pub / f'{name}.wav', buf)
        ls, _ = wi.loudness(pub / f'{name}.wav')
        vol = 10 ** ((lv_eff + lu - ls) / 20)
        if vol > 1:
            wi.write_wav(pub / f'{name}.wav', np.clip(buf * vol, -0.99, 0.99))
            vol = 1.0
        audio[name] = f'{slug}/{name}.wav'
        audio[f'{name}Vol'] = round(float(vol), 4)
        print(f'  {name}: stem {ls:.1f} LUFS, volume {vol:.3f}, target {lu:+.1f} LU against the voice')
    tl['audio'] = audio
    wi.save_json(wi.ep_dir(slug) / 'timeline.json', tl)
    print('timeline.json audio updated')


main()
