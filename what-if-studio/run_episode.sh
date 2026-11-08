#!/bin/bash
# bash run_episode.sh <slug> [dry]    run from the studio folder
# dry: checks the episode and counts voice characters (spends nothing).
# full: voice, plan, sound, render, master -> out/<slug>/final.mp4; uploads if RCLONE_DEST is set (e.g. yes:videos)
set -e
SLUG=${1:?usage: bash run_episode.sh <slug> [dry]}; MODE=$2
cd "$(dirname "$0")"
EP=src/episodes/$SLUG
[ -f $EP/episode.json ] || { echo "STOP: $EP/episode.json not found (unzip the episode here first)"; exit 1; }
ID=$(python3 -c "import json;print(json.load(open('$EP/episode.json'))['id'])")
EXPORT=$(grep -oE 'export const [A-Za-z0-9_]+ *= *defineEpisode' $EP/index.tsx 2>/dev/null | head -1 | awk '{print $3}')
[ -n "$EXPORT" ] || { echo "STOP: $EP/index.tsx must contain: export const <name> = defineEpisode(...)"; exit 1; }
mkdir -p scripts
SK=$(ls -d ~/what-if/.claude/skills/what-if-animation/scripts 2>/dev/null || true)
for f in wi.py plan.py voice.py sfx.py master.py check_promo.py check_audibility.py catalog_sfx.py; do
  if [ ! -f scripts/$f ]; then
    if [ -n "$SK" ] && [ -f "$SK/$f" ]; then cp "$SK/$f" scripts/; else echo "STOP: scripts/$f is missing"; exit 1; fi
  fi
done
if [ ! -d node_modules ]; then
  if [ -f package.json ]; then npm install; else echo "STOP: no package.json in the studio"; exit 1; fi
fi
SLUG=$SLUG EXPORT=$EXPORT python3 - <<'PY'
import os, pathlib, re
slug, exp = os.environ['SLUG'], os.environ['EXPORT']
p = pathlib.Path('src/episodes/index.ts')
s = p.read_text(encoding='utf-8') if p.exists() else "export const EPISODES = [];\n"
if f"from './{slug}'" in s:
    print('registry: already there')
else:
    imports = list(re.finditer(r"^import .*$", s, re.M))
    line = f"import {{ {exp} }} from './{slug}';"
    s = (s[:imports[-1].end()] + "\n" + line + s[imports[-1].end():]) if imports else line + "\n" + s
    s = re.sub(r"(export const EPISODES\s*(?::[^=]+)?=\s*\[)([^\]]*?)(,?\s*)\]", lambda m: m.group(1) + m.group(2).rstrip() + (", " if m.group(2).strip() else "") + exp + "]", s, count=1)
    p.write_text(s, encoding='utf-8'); print('registry: added', slug)
PY
python3 - <<'PY'
import os, pathlib
need = ['ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID']
have = {k for k in need if os.environ.get(k)}
for d in [pathlib.Path.cwd(), *pathlib.Path.cwd().parents]:
    e = d / '.env'
    if e.exists():
        for line in e.read_text(encoding='utf-8-sig', errors='ignore').splitlines():
            for k in need:
                if line.strip().startswith(k + '=') and line.split('=', 1)[1].strip(): have.add(k)
miss = [k for k in need if k not in have]
if miss: raise SystemExit('STOP: set ' + ' and '.join(miss) + ' in the environment or a .env file (values are never printed).')
print('keys: found')
PY
python3 scripts/check_promo.py $SLUG
python3 scripts/voice.py $SLUG --dry
if [ "$MODE" = "dry" ]; then echo "dry run finished, nothing spent"; exit 0; fi
python3 scripts/voice.py $SLUG
python3 scripts/plan.py $SLUG
python3 scripts/sfx.py $SLUG
python3 scripts/check_audibility.py $SLUG || true
python3 scripts/catalog_sfx.py || true
mkdir -p out/$SLUG
npx remotion render src/index.ts $ID out/$SLUG/video.mp4 --muted --concurrency=${REMOTION_CONCURRENCY:-1}
python3 scripts/master.py $SLUG
rm -rf "${TMPDIR:-/tmp}"/remotion-* 2>/dev/null || true
if [ -n "$RCLONE_DEST" ]; then rclone copyto out/$SLUG/final.mp4 "$RCLONE_DEST/$SLUG.mp4" -P && echo UPLOADED; fi
echo "DONE: $(pwd)/out/$SLUG/final.mp4"
