"""python scripts/catalog_sfx.py    (run from the studio folder)
Builds library/sfx/catalog.json from every episode's sound.clips: name, prompt, seconds, loudness, which episodes use it."""
import json
import wi

cat = {}
for f in sorted((wi.STUDIO / 'src' / 'episodes').glob('*/episode.json')):
    try:
        d = json.loads(f.read_text(encoding='utf-8-sig'))
    except Exception:
        continue
    for name, v in ((d.get('sound') or {}).get('clips') or {}).items():
        try:
            prompt, secs = v[0], v[1]
        except Exception:
            continue
        e = cat.setdefault((name, prompt, secs), {'name': name, 'prompt': prompt, 'secs': secs, 'used_in': []})
        e['used_in'].append(f.parent.name)
out = []
for (name, prompt, secs), e in cat.items():
    p = wi.clip_path(name, prompt, secs)
    e['file'] = p.name
    e['cached'] = p.exists()
    if e['cached']:
        l, pk = wi.loudness(p)
        e['lufs'] = round(l, 1) if l != float('-inf') else None
        e['peak'] = round(pk, 1) if pk != float('-inf') else None
    out.append(e)
wi.LIB.mkdir(parents=True, exist_ok=True)
(wi.LIB / 'catalog.json').write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding='utf-8')
print('catalog: %d clips (%d cached)' % (len(out), sum(e['cached'] for e in out)))
