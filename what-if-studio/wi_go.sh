#!/bin/bash
cd ~/what-if/what-if-studio
set -a; source ~/pipeline.env; set +a
SLUG="$1"; MODE="${2:-dry}"
if [ -z "$SLUG" ]; then echo "usage: bash wi_go.sh slug [real]"; exit 1; fi
rm -rf ~/pip_tmp/remotion-* /tmp/remotion-*
rclone copy "yes:videos/$SLUG.zip" . 2>/dev/null
if [ ! -f "$SLUG.zip" ]; then echo "no $SLUG.zip here or in Drive videos"; exit 1; fi
unzip -o "$SLUG.zip" > /dev/null
python3 wi_check.py "$SLUG" --fix || { echo "fix the FAIL lines, then run again"; exit 1; }
OUT=$(bash run_episode.sh "$SLUG" dry 2>&1)
echo "$OUT" | cut -c1-170 | tail -6
echo "$OUT" | grep -q "dry run finished" || { echo "dry run did not pass"; exit 1; }
if [ "$MODE" != "real" ]; then echo "dry run passed. For the real render: bash wi_go.sh $SLUG real"; exit 0; fi
if pgrep -f "run_episode.sh" > /dev/null; then echo "a render is already running, wait for it"; exit 1; fi
FREE=$(df --output=avail -BG ~ | tail -1 | tr -dc 0-9)
if [ "$FREE" -lt 5 ]; then echo "only ${FREE} GB free, clear space first"; exit 1; fi
RCLONE_DEST=yes:videos setsid nohup bash run_episode.sh "$SLUG" < /dev/null > run.log 2>&1 &
if [ -f watch_upload.sh ]; then setsid nohup bash watch_upload.sh "$SLUG" < /dev/null > /dev/null 2>&1 & fi
echo "render started. Check with: bash wi_status.sh $SLUG"
