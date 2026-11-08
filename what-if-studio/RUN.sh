#!/bin/bash
# bash RUN.sh dry   checks the episode and counts the voice characters. Spends nothing.
# bash RUN.sh       voice, plan, sound, render, master -> out/promo/final.mp4
set -e
SLUG=promo; ID=PromoPipeline
cd "$(dirname "$0")"
mkdir -p scripts
SK=$(ls -d ~/what-if/.claude/skills/what-if-animation/scripts 2>/dev/null || find ~ -type d -path '*what-if-animation/scripts' -not -path '*/node_modules/*' 2>/dev/null | head -1)
for f in wi.py plan.py check_episode.py; do
  [ -f scripts/$f ] || { [ -n "$SK" ] && [ -f "$SK/$f" ] && cp "$SK/$f" scripts/ || echo "note: $f not found (looked in ${SK:-nowhere})"; }
done
[ -f scripts/wi.py ] && [ -f scripts/plan.py ] || { echo "STOP: scripts/wi.py and scripts/plan.py are missing. Copy them from the skill's scripts folder."; exit 1; }
[ -f package.json ] || cp package.json.new package.json
[ -d node_modules ] || npm install
[ -d src/episodes ] || { echo "STOP: run this from the studio folder (the one with src/episodes)."; exit 1; }

# registry: add the episode once (keeps what is already there)
python3 - <<'PY'
import pathlib, re
p = pathlib.Path('src/episodes/index.ts')
s = p.read_text(encoding='utf-8') if p.exists() else "export const EPISODES = [];\n"
if "from './promo'" not in s:
    imports = list(re.finditer(r"^import .*$", s, re.M))
    line = "import { promo } from './promo';"
    s = (s[:imports[-1].end()] + "\n" + line + s[imports[-1].end():]) if imports else line + "\n" + s
    s = re.sub(r"(export const EPISODES\s*(?::[^=]+)?=\s*\[)([^\]]*?)(,?\s*)\]", lambda m: m.group(1) + m.group(2).rstrip() + (", " if m.group(2).strip() else "") + "promo]", s, count=1)
    p.write_text(s, encoding='utf-8'); print('registry: promo added')
else:
    print('registry: promo already there')
sh = pathlib.Path('src/shorts.ts'); shd = pathlib.Path('src/shorts')
if not sh.exists() and not shd.exists() and 'SHORT_IDS' in pathlib.Path('src/Root.tsx').read_text(encoding='utf-8'):
    sh.write_text("export const SHORT_IDS: string[] = [];\n"); print('created src/shorts.ts')
PY

# keys: by name only, never printed
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
if miss:
    raise SystemExit('STOP: set ' + ' and '.join(miss) + ' in the environment or a .env file (values are never printed).')
print('keys: found')
PY

python3 scripts/check_promo.py $SLUG
[ -f scripts/check_episode.py ] && { python3 scripts/check_episode.py $SLUG || echo "note: check_episode.py reported issues above; it targets other packs, check_promo.py is the one that gates this run."; }
python3 scripts/voice.py $SLUG --dry
[ "$1" = "dry" ] && { echo "dry run finished, nothing spent"; exit 0; }

python3 scripts/voice.py $SLUG
python3 scripts/plan.py $SLUG
python3 scripts/sfx.py $SLUG
mkdir -p out/$SLUG
npx remotion render src/index.ts $ID out/$SLUG/video.mp4 --muted --concurrency=${REMOTION_CONCURRENCY:-2}
python3 scripts/master.py $SLUG
echo "DONE: $(pwd)/out/$SLUG/final.mp4"
