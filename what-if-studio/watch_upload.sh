#!/bin/bash
SLUG="$1"
cd ~/what-if/what-if-studio
set -a; source ~/pipeline.env; set +a
while pgrep -f "run_episode.sh $SLUG" > /dev/null; do sleep 30; done
sleep 10
F="out/$SLUG/final.mp4"
if [ ! -s "$F" ]; then
  echo "$(date) FAILED: $F missing, render did not finish" >> watch.log
  exit 1
fi
if rclone lsl yes:videos 2>/dev/null | grep -q "$SLUG.mp4"; then
  echo "$(date) already on Drive, nothing to do" >> watch.log
  exit 0
fi
if rclone copyto "$F" "yes:videos/$SLUG.mp4" 2>> watch.log; then
  echo "$(date) UPLOADED $SLUG.mp4" >> watch.log
else
  echo "$(date) FAILED: upload error" >> watch.log
  exit 1
fi
