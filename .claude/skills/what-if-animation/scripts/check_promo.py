"""python scripts/check_promo.py <slug>   Hand-over checks for an episode. Prints FAIL lines and exits 1 if any."""
import json, pathlib, re, sys
slug = sys.argv[1]
d = pathlib.Path('src/episodes') / slug
ep = json.loads((d / 'episode.json').read_text(encoding='utf-8'))
fails, notes = [], []
norm = lambda w: re.sub(r"[^\w']", '', w.lower().replace('’', "'"))
text = ' '.join(b['text'].replace('*', '') for b in ep['script'])
words = [norm(w) for w in text.split()]
nar = (d / 'narration.txt').read_text(encoding='utf-8').strip() if (d / 'narration.txt').exists() else None
if nar is None or ' '.join(nar.split()) != ' '.join(text.split()):
    fails.append('narration.txt does not equal the script text')
src = (d / 'shots.tsx').read_text(encoding='utf-8')
exported = set(re.findall(r'export const (S\d+)\b', src))
ids = [s['id'] for s in ep['shots']]
for i in ids:
    if i not in exported:
        fails.append(f'shot {i} is not exported from shots.tsx')
reg = (d / 'index.tsx').read_text(encoding='utf-8') if (d / 'index.tsx').exists() else ''
if not reg:
    fails.append('index.tsx is missing')
CUE = re.compile(r'^(?P<base>[^+\-#]+?)(?:#\d+)?(?:[+-]\d+)?$')
def check_cue(c, where, allow_plus=False):
    c = str(c)
    if c.startswith(('f:', 's:')) or (allow_plus and c.startswith('+')):
        return
    m = CUE.match(c)
    if not m:
        fails.append(f'{where}: bad cue "{c}"'); return
    b = m['base']
    if re.fullmatch(r'S\d+', b):
        if b not in ids: fails.append(f'{where}: cue "{c}" names an unknown shot')
    elif norm(b) not in words:
        fails.append(f'{where}: cue word "{b}" is not in the script')
for e in ep['edit']:
    if e['shot'] not in ids: fails.append(f'edit uses unknown shot {e["shot"]}')
    check_cue(e['at'], f'edit {e["shot"]}', True)
if [e['shot'] for e in ep['edit']] != ids:
    notes.append('edit order differs from the shot list order')
for f in ep.get('fx', []): check_cue(f['at'], 'fx')
snd = ep.get('sound', {})
used = set()
for ev in snd.get('events', []):
    check_cue(ev[0], 'sound event'); used.add(ev[1])
    if ev[1] not in snd.get('clips', {}): fails.append(f'sound event uses unknown clip {ev[1]}')
    if len(ev) > 4: check_cue(ev[4], 'sound until')
for r in snd.get('repeats', []):
    check_cue(r['at'], 'sound repeat'); used.add(r['clip'])
for k in ('music', 'music_alt'):
    if snd.get(k): used.add(snd[k]['clip'])
for c, (pr, secs) in snd.get('clips', {}).items():
    if c not in used: fails.append(f'sound clip {c} is never used')
    if secs < 0.5 or secs > 30: notes.append(f'clip {c}: {secs} s is outside the API range 0.5-30 and will be clamped')
if not ep.get('science'): fails.append('science is empty')
if any(re.search(r'viral|guarantee|earn|income|views', b['text'], re.I) for b in ep['script']):
    fails.append('script contains a banned claim word (viral, guarantee, earn, income, views)')
print(f'{len(ep["script"])} lines, {len(words)} words, {len(ids)} shots, {len(snd.get("events", []))} sound events')
for n in notes: print('note:', n)
for f in fails: print('FAIL:', f)
sys.exit(1 if fails else 0)
