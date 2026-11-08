#!/bin/bash
# usage: send_claude.sh <slug>
set -e
SLUG=${1:?usage: send_claude.sh <slug>}
R=~/what-if; W=$(mktemp -d); O=$R/claude_upload; mkdir -p "$O"
BRIEF=$(find ~ -path "*/briefs/$SLUG.md" -not -path '*/node_modules/*' | head -1)
CTX=$(find ~ -name wi_context.zip -not -path '*/node_modules/*' | head -1)
PACK=$(find ~ -name "${SLUG}_pack.zip" -not -path '*/node_modules/*' | head -1)
[ -f "$BRIEF" ] || { echo "no brief for $SLUG"; exit 1; }
[ -f "$CTX" ] || { echo "no wi_context.zip"; exit 1; }
cp "$BRIEF" "$W/$SLUG.md"
mkdir -p "$W/context" && unzip -qo "$CTX" -d "$W/context"
[ -f "$PACK" ] && { mkdir -p "$W/pack" && unzip -qo "$PACK" -d "$W/pack"; }
( cd "$W" && zip -qr "$O/${SLUG}_upload.zip" . )
rclone copyto "$O/${SLUG}_upload.zip" yes:claude_brief/${SLUG}_upload.zip 2>/dev/null && echo "SENT yes:claude_brief/${SLUG}_upload.zip"
echo
echo "=== GIVE CLAUDE ONE FILE: $O/${SLUG}_upload.zip ==="
echo "=== PASTE THIS MESSAGE WITH IT ==="
echo "Unzip it. Read $SLUG.md and follow it exactly. Write every file it asks for and return them as ${SLUG}_pack.zip. Files only."
echo "=== THEN: put ${SLUG}_pack.zip in yes:wid_packs/ and run: wid get, wid check ==="
