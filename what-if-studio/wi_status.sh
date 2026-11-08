#!/bin/bash
cd ~/what-if/what-if-studio
SLUG="$1"
if pgrep -f "run_episode.sh $SLUG" > /dev/null; then echo "render: RUNNING"; else echo "render: not running"; fi
grep -o -E "(Rendered|Encoded) [0-9]+/[0-9]+" run.log | tail -1
ls -lh "out/$SLUG/final.mp4" 2>&1 | cut -c1-90
rclone lsl yes:videos 2>/dev/null | grep "$SLUG.mp4" || echo "not on Drive yet"
tail -n 1 watch.log 2>/dev/null
free -h | sed -n 2p
df -h ~ | tail -1
