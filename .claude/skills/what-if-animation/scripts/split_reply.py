"""python scripts/split_reply.py reply.txt <slug>   Run from the studio folder. Writes each === FILE: name === block to src/episodes/<slug>/"""
import pathlib, re, sys
txt = open(sys.argv[1], encoding='utf-8-sig').read()
out = pathlib.Path('src/episodes') / sys.argv[2]; out.mkdir(parents=True, exist_ok=True)
parts = re.split(r'^=== FILE: (\S+) ===[ \t]*$', txt, flags=re.M)
n = 0
for name, body in zip(parts[1::2], parts[2::2]):
    if '/' in name or '\\' in name or '..' in name: sys.exit('bad file name: ' + name)
    body = re.sub(r'^=== END ===[ \t]*$', '', body, flags=re.M).strip()
    body = re.sub(r'^```\w*\n', '', body); body = re.sub(r'\n```$', '', body)
    (out / name).write_text(body + '\n', encoding='utf-8'); print('wrote', out / name); n += 1
if not n: sys.exit('no === FILE: blocks found')
