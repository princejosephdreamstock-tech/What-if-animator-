import json, re, sys, pathlib, shutil
slug = sys.argv[1]
fix = '--fix' in sys.argv
p = pathlib.Path('src/episodes') / slug
f = p / 'episode.json'
raw = f.read_text(encoding='utf-8')
ep = json.loads(raw)
norm = lambda w: re.sub(r"[^\w']", '', w.lower().replace('\u2019', "'"))
text = ' '.join(b['text'].replace('*', '') for b in ep['script'])
words = [norm(w) for w in text.split()]
(p / 'narration.txt').write_text(text + '\n', encoding='utf-8')
print('narration.txt rebuilt from episode.json,', len(words), 'words')
names = {'\u2014': 'em dash', '\u2013': 'en dash'}
for t in ['\u2014', '\u2013', 'storyboard', 'viral', 'passive income', 'get rich']:
    if t in raw.lower():
        print('WARN: found', names.get(t, t))
for n, v in ep.get('sound', {}).get('clips', {}).items():
    if v[1] > 30:
        print('NOTE: clip', n, v[1], 's will be clamped to 30 s')

def find(t, start, nth):
    seen = 0
    for i in range(start, len(words)):
        if words[i] == norm(t):
            seen += 1
            if seen == nth:
                return i
    seen = 0
    for i in range(len(words)):
        if words[i] == norm(t):
            seen += 1
            if seen == nth and i >= start:
                return i
    return None

prev, bad, changed = 0, 0, 0
for e in ep['edit']:
    at = str(e.get('at', ''))
    if at.startswith(('f:', 's:', '+')):
        continue
    base, off = (at.split('+', 1) + [''])[:2] if '+' in at else (at, '')
    w, n = (base.split('#')[0], int(base.split('#')[1])) if '#' in base else (base, 1)
    i = find(w, prev, n)
    if i is None and fix and n > 1:
        for m in range(n - 1, 0, -1):
            i = find(w, prev, m)
            if i is not None:
                new = w + (f'#{m}' if m > 1 else '') + (f'+{off}' if off else '')
                print('FIXED', e['shot'], at, '->', new)
                e['at'] = new
                changed += 1
                break
    if i is None:
        print('FAIL', e['shot'], 'cue', repr(at), 'not found after word', prev)
        bad += 1
        continue
    prev = i + 1
if changed:
    shutil.copy(f, str(f) + '.pre_fix')
    f.write_text(json.dumps(ep, indent=1, ensure_ascii=False), encoding='utf-8')
print('cues:', 'ALL OK' if not bad else f'{bad} FAILED', f'({changed} fixed)')
sys.exit(1 if bad else 0)
