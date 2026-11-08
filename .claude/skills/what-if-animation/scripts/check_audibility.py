"""python scripts/check_audibility.py <slug>    (run from the studio folder, after sfx.py)
Measures whether each sound event is audible. For every event it compares the loudness of (voice + music) with and without
the sfx stem in a short window at the cue (0.3 s, or 0.6 s for a bed). Core cues should add 4 dB or more, texture 1 to 3 dB.
Advisory only: it never stops a run."""
import sys
import numpy as np
import wi

SR = wi.SR
if len(sys.argv) < 2:
    sys.exit(__doc__)
slug = sys.argv[1]
ep = wi.load_episode(slug)
snd = ep.get('sound', {})
tl = wi.load_json(wi.ep_dir(slug) / 'timeline.json')
words = wi.load_json(wi.ep_dir(slug) / 'words.json', [])
if not tl or not words:
    sys.exit('Need timeline.json and words.json: run voice.py and plan.py first.')
au = tl.get('audio', {})
stems = {k: wi.stem(slug, k) for k in ('voice', 'sfx', 'music')}
if not stems['voice'] or not stems['sfx']:
    sys.exit('Need public/%s/voice and sfx stems: run voice.py and sfx.py first.' % slug)


def load(k):
    p = stems[k]
    return wi.decode(p) * float(au.get(k + 'Vol', 1.0)) if p else np.zeros(1)


v, s, m = load('voice'), load('sfx'), load('music')
n = max(len(v), len(s), len(m))
v, s, m = (np.pad(x, (0, n - len(x))) for x in (v, s, m))
base, mix = v + m, v + m + s
db = lambda x: 10 * np.log10(float(np.mean(x ** 2)) + 1e-12)
fps = tl['fps']
ids = list(dict.fromkeys(g['shot'] for g in tl['segments']))
rows = []
for ev in snd.get('events', []):
    cue, name = ev[0], ev[1]
    mode = ev[3] if len(ev) > 3 else 'onset'
    until = ev[4] if len(ev) > 4 else None
    t = wi.resolve(cue, words, fps, tl['segments'], ids) / fps
    a = int(max(0.0, t - (0.04 if mode == 'peak' else 0.0)) * SR)
    b = min(n, a + int((0.6 if until else 0.3) * SR))
    if b - a < 100:
        continue
    rows.append((t, str(cue), name, db(mix[a:b]) - db(base[a:b])))
verdict = lambda d: 'ok' if d >= 4 else ('texture' if d >= 1 else 'INAUDIBLE')
for t, cue, name, d in sorted(rows):
    print('%6.2fs  %-16s %-18s %+5.1f dB  %s' % (t, cue[:16], name[:18], d, verdict(d)))
bad = [r for r in rows if r[3] < 1]
print('\n%d events: %d ok, %d texture, %d inaudible' % (len(rows), sum(r[3] >= 4 for r in rows), sum(1 <= r[3] < 4 for r in rows), len(bad)))
if rows and len(bad) / len(rows) > 0.4:
    print('Most cues are masked by the voice. Raise sound.levels.sfx_lu by about 3 and rerun sfx.py.')
elif bad:
    print('Raise the gain of the inaudible cues you want to keep, or cut them. Cues fully under speech never measure: leave them in word gaps or delete them.')
