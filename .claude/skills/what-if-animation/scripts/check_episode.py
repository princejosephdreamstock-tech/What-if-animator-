"""python scripts/check_episode.py <slug>   Run from the studio folder. Checks the files Claude wrote before voice and render."""
import json, pathlib, re, sys
slug = sys.argv[1]; ep = pathlib.Path('src/episodes') / slug; bad = []
fail = lambda m: bad.append('FAIL ' + m); warn = lambda m: bad.append('WARN ' + m)
try: d = json.load(open(ep / 'episode.json', encoding='utf-8-sig'))
except Exception as e: sys.exit('FAIL episode.json: %s' % e)
for k in ('id', 'slug', 'topic', 'title', 'script', 'science', 'cast', 'shots', 'edit', 'tail', 'fx', 'sound'):
    if k not in d: fail('missing key ' + k)
if d.get('slug') != slug: fail('slug in episode.json is %r, expected %r' % (d.get('slug'), slug))
if re.search('[\u2014\u2013]', json.dumps(d, ensure_ascii=False)): fail('em or en dash in episode.json')
script = [s.get('text', '') for s in d.get('script', [])]
norm = lambda w: re.sub(r"[^\w']", '', w.lower().replace('\u2019', "'"))
words = {norm(w) for w in ' '.join(script).replace('*', '').split()}
ws = lambda s: ' '.join(s.split())
np_ = ep / 'narration.txt'
if np_.exists():
    ln = [l.strip() for l in np_.read_text(encoding='utf-8-sig').splitlines() if l.strip() and not re.fullmatch(r'\[.*\]', l.strip())]
    if ws(' '.join(ln)) != ws(' '.join(script)): fail('narration.txt differs from the script text')
else: fail('narration.txt missing')
nw = sum(len(t.split()) for t in script); print('%d script lines, %d words, about %.0f s' % (len(script), nw, nw / 2.8))
for i, t in enumerate(script, 1):
    if not 3 <= len(t.split()) <= 30: warn('script line %d has %d words' % (i, len(t.split())))
shots = d.get('shots', []); ids = [s.get('id') for s in shots]
for x in {i for i in ids if ids.count(i) > 1}: fail('duplicate shot id ' + str(x))
sd = next((p for p in [pathlib.Path('src/engine/sets'), pathlib.Path('engine/sets')] if p.exists()), None)
if sd:
    sets = {p.stem for p in sd.glob('*.tsx')}
    for s in shots:
        if s.get('set') not in sets: fail('shot %s uses set %r, which is not in the kit (%s)' % (s.get('id'), s.get('set'), ', '.join(sorted(sets))))
else: warn('no engine/sets folder found, sets not checked')
CUE = re.compile(r'^(?P<b>[^+\-#]+?)(?:#(?P<n>\d+))?(?P<o>[+-]\d+)?$')
def cue(c, where, shots_ok):
    c = str(c).strip()
    if c.startswith(('f:', 's:', '+')): return
    m = CUE.match(c)
    if not m: return fail('%s: bad cue %r' % (where, c))
    b = m['b']
    if shots_ok and b in ids: return
    if norm(b) not in words: fail('%s: cue word %r is not in the script' % (where, c))
for k, e in enumerate(d.get('edit', [])):
    if e.get('shot') not in ids: fail('edit %d uses unknown shot %s' % (k, e.get('shot')))
    cue(e.get('at', ''), 'edit %d' % k, False)
used = {e.get('shot') for e in d.get('edit', [])}
for i in ids:
    if i not in used: warn('shot %s is defined but not in the edit' % i)
for k, e in enumerate(d.get('fx', [])): cue(e.get('at', ''), 'fx %d' % k, True)
snd = d.get('sound', {}); clips = set(snd.get('clips', {})); usedc = set()
for k, e in enumerate(snd.get('events', [])):
    cue(e[0], 'sound event %d' % k, True)
    if e[1] not in clips: fail('sound event %d uses undefined clip %s' % (k, e[1]))
    usedc.add(e[1])
    if len(e) > 4: cue(e[4], 'sound event %d until' % k, True)
for r in snd.get('repeats', []):
    if isinstance(r, dict) and r.get('clip'): usedc.add(r['clip'])
for key in ('music', 'music_alt'):
    if isinstance(snd.get(key), dict) and snd[key].get('clip'): usedc.add(snd[key]['clip'])
for c in clips - usedc: warn('sound clip %s is defined but never used' % c)
sp = ep / 'shots.tsx'
if sp.exists():
    t = sp.read_text(encoding='utf-8')
    for s in shots:
        if not re.search(r'export\s+(?:const|function)\s+%s\b' % re.escape(str(s.get('id'))), t):
            (warn if s.get('reuse') else fail)('shot %s has no export in shots.tsx' % s.get('id'))
else: fail('shots.tsx missing')
ip = ep / 'index.tsx'
if not ip.exists(): fail('index.tsx missing')
elif 'defineEpisode' not in ip.read_text(encoding='utf-8'): fail('index.tsx does not call defineEpisode')
print('\n'.join(bad)); f = [b for b in bad if b.startswith('FAIL')]
print('OK' if not f else '%d FAIL: fix and rerun' % len(f)); sys.exit(1 if f else 0)
