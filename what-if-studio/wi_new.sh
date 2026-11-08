#!/bin/bash
cd ~/what-if/what-if-studio
set -a; source ~/pipeline.env; set +a
PACK="$1"; TOPIC="$2"; SECS="$3"; CTA="$4"; SLUG="$5"
if [ -z "$SLUG" ]; then echo 'usage: bash wi_new.sh pack "topic" seconds "cta or none" slug'; exit 1; fi
rm -rf ~/pip_tmp/remotion-* /tmp/remotion-*
FREE=$(df --output=avail -BG ~ | tail -1 | tr -dc 0-9)
echo "disk free: ${FREE} GB"
if [ "$FREE" -lt 5 ]; then echo "less than 5 GB free, clear space first"; exit 1; fi
python3 ~/what-if/.claude/skills/what-if-animation/scripts/make_brief.py "$PACK" "$TOPIC" "$SECS" "$CTA" > "brief_$SLUG.md" || { echo "make_brief failed"; exit 1; }
cat lessons.md >> "brief_$SLUG.md"
sed -i "s/SLUG/$SLUG/g" "brief_$SLUG.md"
rclone copyto "brief_$SLUG.md" "yes:videos/brief_$SLUG.md" 2>/dev/null
echo "brief ready: brief_$SLUG.md ($(wc -c < brief_$SLUG.md) bytes), uploaded to Drive videos"
echo "NEXT: give it to a fresh Claude, ask for $SLUG.zip, save it in Drive videos, then run: bash wi_go.sh $SLUG"
