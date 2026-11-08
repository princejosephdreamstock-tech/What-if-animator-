
## RULES FROM PAST RUNS (follow exactly)
1. narration.txt is ONE line: every script line text joined with single spaces. No line breaks between beats.
2. Cues in episode.json edit: use a plain word that appears once after the previous cue. A #N cue counts matches only AFTER the previous cue's word, not from the start of the script. Use #N only if the word really repeats later.
3. One cue word per shot, in script order, each strictly after the previous one.
4. Cue words must be words that are actually spoken. Do not cue on words you removed.
5. Sound clip length max 30 seconds. The API clamps anything longer.
6. Only claim what this studio really does. It has no storyboard step and no stills check. Never mention tools that are not in the studio.
7. No income, views or virality claims. Never imply other channels use this pipeline. No viral formula.
8. No em dashes or en dashes anywhere, including JSON strings.
9. Do not write scripts. Return only src/episodes/SLUG/episode.json, narration.txt, shots.tsx and index.tsx in a zip.
10. If a line changes after delivery, change episode.json first, then rebuild narration.txt from it.
