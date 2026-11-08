---
name: video-pipeline
description: Make a finished animated video from one topic line. A format pack sets the script shape, length, shot grammar and sound. Packs - what-if (tested), explainer, listicle, story, promo (all others are untested drafts). Pipeline - script, ElevenLabs voice, shot list, storyboard, Remotion/SVG animation, sound, master to -14 LUFS. Use for "make a what if video about X", "make an explainer on X", or "make a promo for the pipeline".
---

# Animated video pipeline: the complete brief

Self-contained. Everything Claude needs is here: the bundle layout, what is missing, the pipeline, the episode.json
schema, the cue grammar, the format packs, and the full text of every reference. Do not ask the user to resend files
listed as present.

## 0. How to start (every time)

1. Pick the format pack from the request. "What if..." = what-if. "How does X work" = explainer. "N things about X" = listicle.
   A short narrative = story. "Promote / sell the pipeline" = promo. If unclear, ask ONE question.
2. List what is on disk (see "Files present" at the end, plus `ls` in the studio).
3. Say ONCE, in a short list, what is missing and what it blocks. Then carry on with everything not blocked.
4. Never say a step ran unless a command ran and printed output. Never invent a file, a number or a render.
5. If the pack is marked UNTESTED, say so in one line and treat the first episode as a prototype.

## 1. Bundle layout (the zip is FLAT, map it like this)

| In the zip | Belongs at |
|---|---|
| engine/ | src/engine/ |
| glimpse60/ (reference episode) | src/episodes/glimpse60/ |
| Root.tsx, index.ts, studio.config.ts | src/ |
| wi.py, plan.py (and any other *.py) | scripts/ , run from the STUDIO folder with wi.py beside them |
| references/*.md | the skill's references/ |
| <slug>/episode.json, narration.txt | src/episodes/<slug>/ |
| words.json, timeline.json (written by scripts) | src/episodes/<slug>/ |

Studio folder = the one with src/episodes and package.json. Scripts run from there: `python scripts/plan.py <slug>`.
Audio: public/<slug>/ (voice.wav, sfx.wav, music.wav). Renders and review: out/<slug>/. Sound cache: library/sfx/.

## 2. Known gaps in the bundle (state them, never hide them)

- Missing scripts: voice.py, stills.mjs, board.py, sfx.py, mixcheck.py, motiongrid.py, master.py. They block voice, stills,
  sound generation, mix check and mastering. Write one only if the user asks, from the spec in the references.
- Missing project files: package.json, src/episodes/index.ts (registry), src/shorts, src/CastSheet,
  src/episodes/glimpse/shots (glimpse60 imports it). Without them `npx remotion` will not build.
- Missing examples: rewind, copy-paste, glimpse. glimpse60 is the only working reference.
- Engine sets: study, stairwell, classroom, rooftop, kitchen, schematic, bedroom. There is NO street set. Build it with the
  room kit (references/kit.md, "Adding to the kit") or move those shots.

## 3. The pipeline (run from the studio folder)

1 Script  2 Voice  3 Shot list  4 Storyboard stills  5 Self-check  6 Animate  7 Sound  8 Master.
1. Script: write episode.json and narration.txt (identical text). Work every number in `science` first. Check set names,
   cue words, and that beats run forward in time.
2. Voice: `python scripts/voice.py <slug>` writes public/<slug>/voice.wav and words.json. Count characters and check the
   credit rate first. Needs ELEVENLABS_API_KEY (environment or .env). Never print it.
3. Shot list: `python scripts/plan.py <slug>` resolves cues, writes timeline.json and out/<slug>/shotlist.md, prints the
   pace. Fix every "!" line.
4. Stills of every shot at its key frame. 5. Run the look self-check (references/look.md) BEFORE any video render.
6. Animate in src/episodes/<slug>/shots.tsx with the kit (references/kit.md); register in src/episodes/index.ts and add
   src/episodes/<slug>/index.tsx (pattern: glimpse60/index.tsx).
7. Sound: sfx.py then mixcheck.py (references/sound.md). 8. Master: master.py to -14 LUFS, true peak under -1 dBTP.
Report credits used at hand-over.

## 4. episode.json schema

Required: id (PascalCase), slug, pack, topic, title ["LINE 1","LINE 2"], accent, script [{beat, text}], science,
cast, shots, edit, tail, fx, sound. what-if also needs power {word, rule, look}.
Optional: format, minutes, style, fps (30), lead (2), end ("<cue>"), reuse_from, shot.reuse (a note only).
- science: [{claim, working, source}] for EVERY number or factual claim in the script (all packs).
- shots: [{id:"S1", size, set, key, note}]. No two neighbouring shots share a size and angle.
- edit: [{shot, at, look?, reverse?, from?, to?}] one per cut, in time order, first at frame 0.
  A word cut lands `lead` frames before the word. reverse plays the shot clock backwards from `from` to `to`.
- fx: [{at, ...}] flashes and shakes. sound: {clips:{name:[prompt,seconds]}, events:[[cue,clip,gain,"onset"|"peak",untilCue?]],
  repeats, music, music_alt, levels:{sfx_lu, music_lu}}.
Cue grammar (edit.at, fx.at, sound cues):
  word / word#2 (2nd occurrence)   word+3 (3 frames after)   S3+2 (2 frames after shot S3's first segment)
  S3#2+2 (its second segment)      +18 (after previous cut, edit only)   s:4.2 (seconds)   f:126 (frame)
Cue words must exist in the script and contain no hyphen or plus sign. Case and apostrophes are ignored.

## 5. Hard rules (all packs)

- Original characters only (Pip, Mo, sis, mom, suit). No real people, no third-party brands or famous characters.
  The user's OWN brand is allowed in the promo pack.
- Never name other creators or channels, and never say or imply other creators make videos with this pipeline or Claude.
- Every number is worked out in `science` first. Never round one into a different claim. Never invent a statistic.
- A hit that illustrates a word lands in the pause AFTER it (4 to 6 frames later), never on it.
- Never promise income, views or virality. Never use "viral formula". Say "made with this pipeline".
- Never bundle or print anyone's API key. Buyers use their own ElevenLabs and Claude access.
- Remind the user once, when relevant, to check licences for Remotion, ElevenLabs voice use and Anthropic's terms
  before selling. Claude is not a lawyer.
- Before hand-over verify: every set exists, every sound clip is used, every cue word is in the script, narration.txt equals
  the script text, beats run forward in time, the pace report has no "!" left.

## 6. Format packs

Every pack = a script shape + a length + shot grammar + sound plan. The engine, cue grammar, kit and mastering are shared.
Pace target for every pack: 27+ cuts a minute, no hold over about 3 s without action inside (plan.py warns at 4 s).
Speech runs about 2.7 to 3 words a second. Count words before the voice call.

### Pack: what-if (TESTED)
Seven beats: 1 cold open, 2 premise and rules, 3 the fun part, 4 the cost with a real fact ("That's real."),
5 someone powerful notices, 6 a moral choice with family at stake, 7 cliffhanger.
Lengths: short 15-25 s (45-65 words, beats 1-4, 5-7 folded into the last line); 60 s (100-180 words); long about 5 min
(800-900 words, all seven beats, "format":"long","minutes":5). Needs `power`. Full rules: references/formula.md.

### Pack: explainer (UNTESTED draft)
Hook (a surprising true claim, 5 s) / the question / the simple model (one diagram built on screen) / the twist that breaks
the simple model / the real answer with a number / one line takeaway.
60-90 s, 160-250 words. Second person or plain narrator, present tense, short sentences. One idea per shot, the schematic set
and kit diagrams do most of the work. Every fact in `science`. End on what the viewer can now notice.

### Pack: listicle (UNTESTED draft)
Hook promising N items / item 1..N, each 8-12 s: claim, one picture, one number / the best item last / call to comment.
45-90 s. Order items weakest to strongest. Each item must read in a single shot with no on-screen text.

### Pack: story (UNTESTED draft)
Setup (who wants what) / inciting incident / two escalations / turn / short resolution or cliffhanger.
30-90 s. Cast from the rig, 2 locations at most, every line is a picture, one reveal. No real people or brands.

### Pack: promo (UNTESTED draft, for the user's own pipeline)
30-45 s, about 90-130 words. Hook with the pain (hours editing one video) / one topic line typed / the pipeline stages shown
doing real work (script, voice, shot list, storyboard, render) / a finished clip from a real episode / what the buyer gets
and what they supply themselves (their own keys) / call to action. Show only real output from this pipeline. State no
earnings, no view counts, no "viral". Name nothing from other creators.


# LEGACY ORIGINAL BRIEF (the what-if pack above is the authority; this fills gaps)


# What If animation

One topic line in, a finished 15-25 second episode out. Every frame is SVG that Claude writes (rendered by
Remotion); the voice and the sound come from ElevenLabs. Two examples ship in `studio/src/episodes/`, both ready to
render: `rewind` ("What if you could rewind 10 seconds?", the proof clip: shots played backwards as the power) and
`copy-paste` ("What if you could copy and paste anything?", the skill's first full run: a new kitchen set, a
schematic for the science beat, a cliffhanger blackout). Read the one closest to your topic before you start.

| File | What's in it |
|---|---|
| `references/formula.md` | The seven-beat What If formula, the 15-25 s shape, script rules, choosing a topic |
| `references/look.md` | The measured look, pace, shot vocabulary, and the storyboard and motion checklists |
| `references/kit.md` | The building blocks: engine, cast, sets, room kit, light, UI, looks, and how to add each |
| `references/sound.md` | Writing sound events, prompts, levels, costs |
| `references/traps.md` | Everything that cost time on the two example episodes |
| `studio/` | The Remotion project: copy it once, then every episode lives in it |
| `scripts/` | voice, plan, stills, board, sfx, mixcheck, motiongrid, master (Python 3.9+ and Node) |

## Rules

- **Original characters only.** Pip (the hero, look B) and Mo (his friend) are ours, and so are the sister, mum and
  the suit on the rig. Never a channel's own hero, and nothing that resembles a famous cartoon character: check every
  new look on the cast sheet (Mo's first hat was dropped for drifting toward one).
- **Original stories.** The formula is shared; the episode isn't anyone else's. Don't remake a channel's title.
- **Never claim the viral channels are made with Claude** or any other tool. Nobody has said how they're made.
- **Keys by name only.** `ELEVENLABS_API_KEY`, from the environment or a `.env`
  above the studio. Never print, paste or hardcode a key.
- **Report the ElevenLabs credits** of every run: the scripts log them to `out/<slug>/costs.json` and `master.py`
  totals them in `report.json`. The voice's cost is read from the account's history (exact); sound clips don't show
  there, so their cost comes from the account counter, which can lag: re-read it before you report. Say the number
  when you hand the episode over. The copy-paste run cost 152 credits (78 for the voice, 74 for 12 new clips).
- **Storyboard before animation.** No video render until the stills pass the self-check (step 5) and, when the person
  is in the loop, they've seen the board.
- **Every fact is real.** A number in the script is worked out and sourced in the episode's `science` field first.

## Setup (once per machine)

Needs Node 18+, ffmpeg and ffprobe on the PATH, Python 3.9+ with `numpy` and `Pillow`, and an ElevenLabs key.

```bash
cp -r <skill>/studio ./what-if-studio && cd what-if-studio && npm install
```

Everything below runs from that studio folder; `<skill>` is this skill's folder. To work offline or in your own
brand face, put a display font in `public/fonts/` and set `titleFont` in `src/studio.config.ts` (the default title
face, Bricolage Grotesque, and the UI faces load from Google Fonts at render time). To update an existing studio to
a newer engine, copy `<skill>/studio/src/engine` over its `src/engine`.

## The pipeline

Work through the steps in order. Each ends on something you look at before the next.

### 1. Script

Read `references/formula.md`. Search YouTube for the premise first: if a What If channel already has that exact
episode, change the power or the rule. From the topic line, decide the power's word, its rule, three escalating
demos and the turn (one real fact with a number). Write `src/episodes/<slug>/episode.json` with `id` (PascalCase,
the composition name), `slug`, `topic`, `title` (two lines), `script` (one entry per beat) and `science` (each fact:
the claim, the working, the source). 45 to 65 words. Read it aloud at pace: every line must be a picture.

### 2. Voice

```bash
python <skill>/scripts/voice.py <slug>
```

One ElevenLabs take with character timestamps (the 356-character copy-paste take cost 78 credits), then the pauses
cut to the genre's pace: `public/<slug>/voice.wav` and `src/episodes/<slug>/words.json`. Check the length (15-25 s)
and the word times it prints. Retune pauses with `gaps` in `episode.json` and re-run: the take is cached, so that's free. Change a word
and it calls the API again.

### 3. Shot list

Design one shot per picture in the script (usually 9 to 14), varying the size and angle every cut (wide, insert,
medium, close-up, over the shoulder, high, low; see `references/look.md`). Add to `episode.json`:

- `shots`: `{ "id": "S1", "size": "medium", "set": "kitchen", "key": 14, "note": "what we see" }` (`key` is the
  frame of the shot's own clock the storyboard shows)
- `edit`: `{ "shot": "S1", "at": "cookie" }` per cut, cued on the word it lands on (`plan.py` lists the cue forms;
  `reverse`, `from`, `to` and `look` for powers that bend a shot's clock)
- `fx`: one-frame flashes and shakes, `{ "at": "S3+2", "kind": "flash" }`

```bash
python <skill>/scripts/plan.py <slug>
```

It writes `timeline.json` and `out/<slug>/shotlist.md` and prints the pace. Aim for 27+ cuts a minute in the
opening and no static shot over about 3 s; fix what it flags before drawing anything.

### 4. Storyboard

Read `references/kit.md` for the building blocks. Write `src/episodes/<slug>/shots.tsx`, one component per shot,
each a pure function of its clock `t` (copy the patterns in the two examples' `shots.tsx`), and `index.tsx` (the
episode and its power look), then add the episode to `src/episodes/index.ts`. At this step each shot only needs to
be right at its `key` frame. When a topic needs a place the library lacks, build it with the room kit and add it to
`src/engine/sets/` (and to the skill's copy) so the next episode has it, as the copy-paste run did with the kitchen
and the schematic. A new character or costume: add the look, then check it on the cast sheet
(`npx remotion still src/index.ts Cast out/cast.png`).

```bash
npx tsc --noEmit
node <skill>/scripts/stills.mjs <slug>
python <skill>/scripts/board.py <slug>
```

`out/<slug>/storyboard.jpg`: one captioned still per shot.

### 5. Self-check the stills

Look at the storyboard, then open every still in `out/<slug>/board/` at full size, and run the storyboard checklist
in `references/look.md` honestly, shot by shot. Write down what fails, fix it, re-render just those shots
(`stills.mjs <slug> S3 S7`), rebuild the sheet and look again. Repeat until it passes. Check `references/traps.md`
for the failure you're seeing before inventing a fix. If the person is in the loop, show them the board now and
take their notes before animating.

### 6. Animate

Bring each shot to life from its key pose: `poseAt` keys with anticipation, holds and overshoot, `faceAt` for
expressions, camera moves with `kf`, the power's look, the `fx`. Then render a draft and check the motion:

```bash
python <skill>/scripts/master.py <slug>
python <skill>/scripts/motiongrid.py <slug> S2 S5
node <skill>/scripts/stills.mjs <slug> --frames 120 240
```

Read the grids like a flipbook against the motion checklist in `references/look.md`; fix and re-render until it
reads.

### 7. Sound

Read `references/sound.md`. Add `sound` to `episode.json`: the clips (prompt and length), one event per visible
action cued to its shot, ambiences per location, the music bed and the levels. Check what the library already has,
then generate:

```bash
python <skill>/scripts/sfx.py <slug> --dry
python <skill>/scripts/sfx.py <slug>
```

It prints the credits it used and sets the stem volumes in `timeline.json`. Then check that every word stays clear:

```bash
python <skill>/scripts/mixcheck.py <slug>
```

It lists the moments, while a word is being spoken, where effects or music come within 3 dB of the voice. A hit that
illustrates a word lands in the pause just after it, never on it; a bed (a hum, a drone) under a key line comes down;
if most of the stem crowds the voice, lower `sfx_lu`. Re-run sfx.py and the check until only deliberate overlaps
remain (a title boom, a turn).

### 8. Master and hand over

```bash
python <skill>/scripts/master.py <slug>
```

Renders, brings the mix to -14 LUFS with peaks under -1 dBTP, and writes `out/<slug>/report.json` (length, loudness,
pace, credits). Watch the final file once through with sound. Hand over `out/<slug>/<slug>-final.mp4` and
`out/<slug>/storyboard.jpg`, with the length, the ElevenLabs credits used, and anything you'd still improve.

## Where an episode lives

| Path | What |
|---|---|
| `src/episodes/<slug>/episode.json` | Everything you write: script, science, shots, edit, fx, sound |
| `src/episodes/<slug>/shots.tsx`, `index.tsx` | The drawing: one component per shot, the power's look |
| `src/episodes/<slug>/words.json`, `timeline.json` | Written by voice.py and plan.py (sfx.py adds the volumes) |
| `public/<slug>/` | voice.wav, sfx.wav, music.wav |
| `out/<slug>/` | board stills, storyboard.jpg, shotlist.md, motion grids, renders, costs.json, report.json |
| `library/sfx/` | Every generated sound clip, shared by all episodes |

# REFERENCE: formula.md

# The script: the seven-beat What If formula

Distilled from the shared structure of popular What If scripts. The full episodes run 7 to 10 minutes and hit all seven beats;
the skill makes a 15 to 25 second episode, which is the cold open of one: beats 1 to 4 in full, 5 to 7 folded into
the last line.

## The seven beats

1. **Cold open in the middle of the action.** A flash-forward to the climax, or three or four quick demos of the
   power.
2. **The premise and its rules.** What changed overnight, and the rules it comes with.
3. **The fun part.** Escalating wins in everyday life.
4. **The not-so-fun part.** The cost, with real science and real numbers woven into the story ("That's real.").
5. **Someone powerful notices.** A man in a suit, robbers, a government.
6. **A moral choice with family at stake,** usually a little sister.
7. **Cliffhanger.** "Part 1 of 2", a question for the comments, sometimes an "is any of this real?" section and
   sourced science notes in the description.

Recurring cast: you (second person), a best friend, a little sister, mum. In our cast: Pip is "you", Mo is the best
friend, and `sis`, `mom` and `suit` are on the rig for beats 5 and 6.

## The 15 to 25 second shape

| Beat | Seconds | What it does | Example (rewind) |
|---|---|---|---|
| 1. Cold open | 0 to 11 | Three quick demos: a small everyday problem, the power, the win. The power's word is said every time. | "You knock your coffee off the desk. Rewind. You catch it." x3 |
| 2. Premise | 11 to 15 | The title card says it: "What if you could ...?", plus one rule. | "What if you could rewind ten seconds, any time you want?" |
| 3. Fun | 1 to 2 s | One line, or one more escalation. | "Sounds amazing." |
| 4 to 7. The turn | last 2 to 6 s | The cost, ideally one real fact with a number and "That's real.", then a line that leaves a question open. | "It's about to ruin your life." |

A longer cut (40 to 60 s) adds beat 4 properly (the fact, then its consequence on screen), the suit noticing (5)
and the sister in danger (6), and ends on "Part 1".

## Writing rules

- **Second person, present tense, short sentences.** Three to eight words. "Copy a cookie. Paste." beats "Imagine if
  you were able to duplicate a cookie."
- **Every line is a picture.** Each demo has to read in one shot with no text on screen: a mug, a stair, a quiz, a
  cookie, a friend. If a line needs a caption to be understood, rewrite the line.
- **The power has a word, a sound and a look.** "Rewind" plus tape whirr plus a stopwatch counting back; "Copy...
  Paste" plus a selection box plus a pop. Say the word in every demo, so the viewer learns the grammar by the third.
- **Escalate the demos.** Small and selfish, then useful, then a little uncanny (a cookie, the homework, your best
  friend). The third demo should make the viewer slightly uneasy: it sets up the turn.
- **One real fact in the turn, with a number, checked.** Work the arithmetic, write it in the episode's `science`
  field with its source, and only then put it in the script. "That's real." goes straight after it. Never invent a
  number, never round one into a different claim.
- **End on a question or a threat,** never a resolution: "So where are yours coming from?", "It's about to ruin
  your life."
- **Length:** 45 to 65 words lands at 15 to 25 seconds after voice.py tightens the pauses (about 2.7 words a
  second). Count before you call the voice: every character costs credits.
- **The title card** is the premise, in capitals: line 1 `WHAT IF YOU COULD`, line 2 the power in four words or
  fewer with a question mark. One word of line 2 can pulse as the accent (`10`, `ANYTHING`).

## Choosing a topic

- An everyday power with clear rules and a hidden cost works best: time (rewind, pause, skip), copies, senses (hear
  thoughts, see an hour ahead), body (never sleep, 10x reaction), money, luck.
- The cost should come from real science (energy, biology, physics, economics), so beat 4 can teach something true.
- Don't remake a channel's episode: search YouTube for the premise first, and if a What If channel already has that
  exact title, pick a different power or a different rule. Most everyday powers have been done somewhere (copy-paste
  turned up a comedy short and a "Copy Powers" episode); the story, the rule and the turn are what make it ours.
  The formula is shared; the stories are ours.
- No real people, no brands, no famous characters, nothing that resembles one.

## episode.json: the script part

The copy-paste example (`studio/src/episodes/copy-paste/episode.json`), 61 words, 23 s:

```json
"topic": "What if you could copy and paste anything?",
"title": ["WHAT IF YOU COULD", "COPY AND PASTE ANYTHING?"],
"script": [
  {"beat": "1 cold open, demo 1 (small and selfish)", "text": "Copy a cookie. Paste. Free cookies, forever."},
  {"beat": "1 cold open, demo 2 (useful)", "text": "Copy your homework. Paste. Done."},
  {"beat": "1 cold open, demo 3 (a little uncanny)", "text": "Copy your best friend. Paste. Okay, that's weird."},
  {"beat": "2 the premise (title card)", "text": "What if you could copy and paste anything?"},
  {"beat": "4 the turn: the cost, one real fact", "text": "One catch: a copy can't come from nothing. One cookie, made from pure energy, needs every power plant on Earth running for over ten minutes. That's real."},
  {"beat": "5-7 folded into a question", "text": "So where are yours coming from?"}
],
"science": [
  {"claim": "One cookie made from pure energy needs every power plant on Earth running for over ten minutes.",
   "working": "A 30 g cookie: E = mc^2 = 2.70e15 J. World electricity, 29,925 TWh in 2023 = 3.4e12 W on average. 2.70e15 / 3.4e12 = about 13 minutes. Over ten minutes holds above about 24 g; the schematic states the 30 g.",
   "source": "mass-energy equivalence; Ember, Global Electricity Review 2024"}
]
```

`voice.py` joins the beats' text with spaces and sends it as one take, so the read flows; the beats are for you and
for the storyboard.

# REFERENCE: look.md

# The look: what the genre does, and the self-check

Pace and light targets for this genre, measured with ffmpeg scene detection on public examples. We learn the technique (timing, camera grammar, light); every character, set and story stays
our own. Nothing confirms how the viral channels make their videos, so never say or imply they're made with Claude
or any other tool.

## Pace

| | The genre | Our target for 15-25 s |
|---|---|---|
| Cuts per minute, opening | about 27 (first 90 s) | 27 or more; the cold open can run 40-70 with reversals |
| Median shot | 2.7 s in the opening | 0.7 to 3 s |
| Long holds | up to about 12 s, always with action inside | nothing static over about 3 s |

- Cuts come from **changing shot size**, not from motion: wide, then a macro insert, then a medium, then a close-up
  of a hand, then a reaction. No two neighbouring shots share a size and angle.
- The opening runs about twice as fast as the rest. Cut on the word: `plan.py` lands each cut 2 frames before its
  cue word.

## Light does most of the work

- A dusk palette: purple to orange sky, a low sun with soft rays behind the subject.
- **Every light comes from something you can see:** a window with the sun in it, a pendant, a wall light, a desk
  lamp, string lights, a lit doorway, city windows. Pools of light, dark corners.
- Muted, mid-dark walls (`S3` palette), so the practicals read; then `LightVeil` sinks the mid-tones further and
  leaves holes where the light falls.
- A warm rim light on every character edge, on the side facing the light (`rimId="rimR"` or `"rimL"`;
  `"rimRed"` for the turn).
- Haze, dust in the beams (`Dust`), soft bokeh. Depth of field: foreground objects blurred dark (`Foreground`),
  the middle sharp, the background soft on close-ups (`blur16` on a scaled-up set).
- Grain on twos and a soft vignette finish the frame (the engine's `Grade`).

## Shot vocabulary

- **Establishing wide:** the whole lit room, the character small in it.
- **Medium** (waist up, camera zoom about 1.6 to 2) and **close-up** (head; 3 to 4.5 for an extreme close-up).
- **Macro insert:** an object huge in frame, shallow focus (a mug, a cookie, a hand), often a high or top-down angle.
- **Over the shoulder:** a big, dark, blurred foreground figure filling a third of the frame.
- **High angle / top-down** (looking down at a desk, a landing) and **low angle** (looking up at a character against
  the sky: the rooftop's `low` prop).
- **Schematic** for the science beat: a dark grid, line icons, labels in the mono face, numbers counting.
- **Title card:** a wide establishing shot with the title over it, small first line, big second line.

## Characters

- Mostly three-quarter or profile (`yaw`), rarely face-on; the face slides toward the side they face.
- They animate very little: holds are near-still, with small hand changes. Expressions swap instantly through a
  blink (`faceAt`), never morph.
- Life comes from around them: a one-frame flash on an impact, focus rings, a timer, floating labels, dust, steam,
  a swaying lamp, a slow push-in.
- One hero who never changes. Every costume is a `Look` on the one rig, so it can't drift.

## On-screen text

Almost none. The title card, and small UI readouts in the mono face (a timer, a chip naming the power, a short
label). No speech bubbles, no "HA HA", no captions of the voice.

## The storyboard self-check (step 5)

Look at `storyboard.jpg`, then open every still at full size. Fix anything that fails, re-render those shots, look
again. Only a board that passes goes to animation.

1. **One read in a second.** At phone size the subject and the action are clear. If it needs the voice to make
   sense, reframe it.
2. **Sizes change.** No two neighbours share a size and angle; the board has wides, inserts, mediums, close-ups and
   at least one high or low angle.
3. **Light from a source.** Every shot has a visible practical or sunlight, and the subject sits in or against a
   pool of it. Mid-tones are dark; nothing is evenly lit.
4. **The character pops.** The face is the brightest, sharpest thing in its area; the rim light is on the lit side;
   no dark limb on a dark wall.
5. **Depth.** A blurred dark foreground in about a third of the shots; soft backgrounds on close-ups.
6. **The world is full.** Wides show 20 or more designed objects; no empty wall, no floating furniture. Everything
   that stands has legs and a contact shadow.
7. **Perspective holds.** Objects sit on their surfaces, at the right scale for the character, toward the room's
   vanishing point.
8. **Acting matches the line.** The expression and pose say the line without the voice; the hand that moves is the
   near one (with `yaw < 0` the far arm hides behind the body).
9. **Continuity.** Same costume, same set layout, same props in the same places across shots of one place.
10. **Only the title and readouts as text,** spelled right, inside the frame.
11. **Ours.** Nothing resembles a famous character, a channel's hero or a brand.

## The motion check (step 6)

Pull frame grids of every action shot with `motiongrid.py` and read them like a flipbook.

- Anticipation before a big move (a crouch before a step, a wind-up before a grab), a hold of 2 frames on the beat
  where the character realises, overshoot and settle on landings and catches.
- Nothing static for more than about a second: something always moves (dust, steam, a sway, a push-in).
- The action lands on its word, within about 3 frames.
- Reversals read backwards (every move derives from `t`, so it does).
- No pops: a prop never jumps between frames unless it's meant to (a paste, a flash).

# REFERENCE: kit.md

# The kit: building blocks for shots

Everything imports from one place: `import { Study, Hero, poseAt, Marquee, ... } from '../../engine';`. The world is
1920 x 1080 units; a shot draws in world units and frames them with a camera.

## A shot

```tsx
export const S4: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 900, y: 712, yaw: 0.45, look: 0.6, armR: { a: 14, b: -6 } } },
    { f: 6, p: { armR: { a: 70, b: 0 } }, ease: easeOut }, // the reach
    { f: 9, p: { armR: { a: 62, b: -4 } } }, // overshoot, settle
  ]);
  const face = faceAt(t, [[0, 'neutral'], [8, 'smug']]); // swaps through a blink
  return (
    <g transform={camT(kf(t, [[0, 980], [len, 960]]), 580, kf(t, [[0, 1.75], [len, 1.9]]))}>
      {/* offset t so the set's dust and sways don't restart at every cut */}
      <Study t={t + 80} id="s4" />
      <Hero look={LOOKS.pipHood} pose={{ ...pose, ...face }} rimId="rimR" shadow={0} />
      <Desk x0={520} x1={1300} y={700} />
      <Foreground blur={10}>{/* a dark shape near camera */}</Foreground>
    </g>
  );
};
```

- `t` is the shot's own clock in frames, `len` how long it runs, `f` the global frame. Draw only from these, never
  from state or `Math.random` (scatter with `rnd(seed, i)`), so the engine can play a shot backwards or hold it.
- Draw order is depth: the set, things behind the character, the character, things in front, then `Foreground`.
- Camera: `camT(cx, cy, zoom)` centres the world point (cx, cy). Wides about 0.75 to 1.1, mediums 1.6 to 2,
  close-ups 3 to 4.5. Move it with `kf` for a push-in or a follow; shake inside a shot with `shake(t, from)`.

## The engine (`episode.tsx`)

- `defineEpisode(id, { timeline, shots, looks, grain, vignette })` makes the `<Id>` and `<Id>Board` compositions.
- A **look** is a power's visual while it runs: `{ grade: (lv) => cssFilter, jitter, Overlay: ({ f, lv, p, n }) => svg }`.
  `p` runs 0 to 1 through the look's run, `n` counts the runs. The rewind look: desaturate, jitter, tape lines, a
  REWIND chip and a stopwatch counting back (see `episodes/rewind/index.tsx`).
- `fx` in `episode.json`: `flash` (one frame, then 35% the next; `color`, `o`) and `shake` (`len`, `amp`).

## The cast (`rig.tsx`)

One rig, a costume per character (`LOOKS`): `pip` (A, mustard jacket), `pipHood` (B, the hero: dark hoodie, mustard
drawstrings), `pipInk` (C, dark head), `mo` (the friend: curls, olive jacket, headphones), `sis` (the little sister:
bunches with coral bands, teal; draw her at about 0.7 of Pip's scale), `mom` (a bob, a rose cardigan), `suit` (the
man in a suit: combed hair, charcoal suit, red tie). Render the cast sheet with
`npx remotion still src/index.ts Cast out/cast.png`.

`<Hero look pose rimId shadow />` (alias `Actor`). The **pose**:

| Field | What |
|---|---|
| `x, y, scale` | the hip point in world units; feet are `LEG_LEN * scale` below it |
| `yaw` | -1 profile facing left, 0 front, 1 profile facing right; the body narrows and the face slides |
| `facing` | 1 or -1: which way legs swing forward |
| `tilt`, `spin`, `headTilt` | lean at the hips, whole-body rotation about the chest (tumbles), head tilt |
| `armL, armR, legL, legR` | `{ a, b }`: upper segment angle from straight down, bend of the lower segment (degrees) |
| `handL, handR` | `'open'` (mitten with a thumb) or `'point'` |
| `expr` | neutral, happy, smug, shock, worried, oops, cool, dizzy, tired (heavy lids, dark rings) |
| `blink, look, glasses` | 0..1 eyelids (1 draws a shut lid's curve: blinks and sleep), -1..1 eye direction, 0..1 shades dropping on |
| `squash` | + squashes (landing), - stretches (jump), about the feet |
| `sway` | how far loose things (drawstrings, bunches) swing |
| `glint`, `glintColor` | 0..1 the eyes light up in the power's colour (default cyan); set it after `poseAt`, it isn't interpolated |

Helpers: `poseAt(t, keys)` (eased keys, faces hold until their key), `faceAt(t, [[f, expr]...])` (a blink at each
swap), `walkPose(x, phase, ground, scale, extra, facing)` (phase about 0.6 a frame; `ground` a number or a function
like `hipGround`), `joints(pose)` and `toWorld(pose, point)` (where a hand is, to attach a prop), `reachAngle(pose,
target)` (the arm angle that points at a world point).

## Props (`props.tsx`)

`Cat` (moods sleep, alert, peek; the tail never stops), `Mug` (with steam), `Cookie` (side view, `bite`),
`CookieTop` (from above), `CookieStack`, `Plate` and `PlateTop`, `Paper` (from above: `done` with ticks and a grade,
`fill` writes it in, or blank), `PaperStack`. For night episodes: `AlarmClock` (a digital bedside clock, `text` on its
display), `WallCalendar` (a month, `crossed` days with red crosses, the next one drawing on with `drawing`;
`calendarDay` gives a day's cell for a hand holding the marker), `OpenBook` (`turn` flips a page), `BookFlat`,
`BookTower`, `LaptopBack` (a lid from behind, its screen light spilling round it). From the preview run:
`PizzaSlice` (from above, x y the tip, `bite` eats back from the tip, `drip` hangs cheese; squash it in y for a
three-quarter view), `PizzaBox` (open and empty, `lid` stands the lid up), `Phone` (dark and glossy, or `on` with an
incoming call: `caller`, `buzz`), `PaperBall`. Add props here when an episode needs them, drawn in the same style:
flat fills, a darker shade on the side away from the light, a warm rim line on the lit edge, a contact shadow.

For inserts, `Tabletop` (`furnish.tsx`) fills the frame with a surface seen from high above (wood or stone), its lit
front edge at `edge` and the floor blurred below; push `edge` past 1080 for a straight top-down shot. Put props on it
in screen coordinates and bring a character's arm in from the side of frame where they are in the neighbouring shots
(the dark sleeve and the mitten, scaled up: see `S2` and `S4` in `episodes/copy-paste/shots.tsx`).

## Sets

Each set is a component taking the shot clock `t` (for dust, sways, flicker) and an `id`. Offset `t` per shot so
idle motion carries across cuts.

| Set | Coordinates and parts | Props |
|---|---|---|
| `Study` (`sets/study.tsx`) | `STUDY = makeRoom({980,500}, back 530-1430 x 335-740)`. `night` puts the moon in the window and turns the pendant off (the `Desk` lamp becomes the light); `shelf` (0..1) empties the bookcase, books flying from `STUDY_SHELF_V`. Window 782-1178 x 380-606 with the sun at (1085, 596); bookcase on the left wall, door and print on the right, pendant at u 0.32 w 0.42, wall light on the left. `Desk x0 x1 y` stands mid-room (the proof clip: x0 560, x1 1360, y 700, Pip behind it at hips (960, 712) scale 1). | `veil` (0.28 for a wide that must show the floor) |
| `Stairwell` (`sets/stairwell.tsx`) | Side-on: 7 steps of 150 x 70 down to the right from a landing at y 420 (`SW`). `stepTop(x)`, `hipGround(x)`. Lit doorway upper left, arched window lower right, lantern, sconces. `Banister` is the near layer, drawn after the characters. Walk at scale 0.9. | |
| `Classroom` (`sets/classroom.tsx`) | `CLS = makeRoom({900,470}, back 300-1500 x 130-720)`. Board 426-1054 x 196-524, windows on the left wall, two rows of desks with `Kid`s from behind. `SchoolDesk x` is the hero's desk (y 750); the proof clip's Pip stood at (1260, 760), yaw -0.35. `Kid` with `turn` and `laugh` works as a blurred foreground figure for over-the-shoulder shots. | `board` (your own chalk), `solved`, `wrong`, `laugh` |
| `Rooftop` (`sets/rooftop.tsx`) | Parapet at y 790, deck below (feet at about y 820). The sun at (`sunX`, `sunY`), r 170, optionally a clock (`clock`, `spin`, `crack`). City in three depths, string lights between poles at x 140 and 1780. | `red` (the turn's red sky), `lightsOut`, `blackout` (city windows go dark in a sweep from the left), `cityLit` (more lit windows: about 2.5 for a blackout), `low` (camera lower: the city and roof drop by `low`, so feet go lower too) |
| `Kitchen` (`sets/kitchen.tsx`) | Built with the room kit: `KITCHEN = makeRoom({960,500}, back 500-1420 x 330-745, 3.4)`. Counter run along the back wall with a sink under the window (sun at 860, 530), hob and kettle, splashback, open shelves with jars, fridge on the right, wall cabinets and a wall light on the left, two pendants. Characters stand behind the island at w 0.4 (`stand(KITCHEN, u, 0.4)`), then draw `KitchenIsland` (with two bar stools) so it hides their legs; `islandTop(u, d)` is a point on its top. | `veil`, `red` |
| `Bedroom` (`sets/bedroom.tsx`) | At night, built with the room kit: `BEDROOM = makeRoom({940,500}, back 480-1440 x 320-742, 3.4)`. Bed in the back left corner (headboard on the back wall, u 0.03-0.4, foot at w 0.47), nightstand with the lamp (`LAMP`) and the clock, `WINDOW` 1070-1330 x 374-600 onto the moon and the lit city, fairy lights and posters over the bed, `CAL` (the wall calendar), a dresser under the window, wardrobe on the right wall, door ajar on the left with the hall light, rug, beanbag, trainers. In bed: draw it with `duvet={false}`, then the character at `bedSit(u)`, then `BedDuvet` (with `knees`) over their legs. `bedTop(u, w)` is a point on the mattress. | `clock`, `lamp` (0..1: flicker it, kill it), `crossed` (the calendar), `veil` |
| `Schematic` (`sets/schematic.tsx`) | The science beat's ground: a dark blueprint grid with registration marks. On it: `DrawOn` (a path drawing on), `Arrow`, `SchLabel` (mono, pops on), `CountUp` (a number counting, with commas), `PlantIcon` (tower, wind, solar, dam, factory; lit orange when `on`). `SCH` holds its colours. | |

## The room kit (`room.tsx`, `furnish.tsx`)

For a new interior, in this order:

1. `const R = makeRoom(vp, { x0, x1, y0, y1 }, depth)`: the back wall's box on screen, the vanishing point, how deep
   the room is (3.2 to 3.5). A point in the room is `R.P(u, v, w)`: u across 0..1, v down 0..1, w toward camera
   0..1 (0 on the back wall). `R.Q([[u, v, w], ...])` gives polygon points.
2. `<RoomShell r={R} id floor="boards" | "tiles" wall side floorC />`: ceiling, walls, floor, texture, corners, trim.
3. Light sources: `<BackWindow r id t x0 x1 y0 y1 sun cols curtains />`, `<Pendant r u w t />`, `<WallLight r u v w />`.
4. Furniture: `<Box r u={[u0,u1]} v={[v0,v1]} w={[w0,w1]} front top side rim />` draws only the faces this camera
   sees; `<FloorShadow r u w />` under it. Small things go on top of boxes at `R.P(u, v0, w)`.
5. Dressing: `<FloorPlant r u w />`, `<WallFrame x y w h art />`, `<WallClock x y />`, books, jars, rugs.
6. Finish: `<LightVeil id lights={[[x, y, radius], ...]} o={0.42} />` with a hole at each light (`pendantLight(R, u,
   w)` gives a pendant's), then the glows again on top (`Glow`), then `Dust` in the brightest beam.
7. Characters: `stand(R, u, w)` gives the hip point and scale for someone standing at floor point (u, w).

## Light and atmosphere (`light.tsx`, `kit.tsx`)

`Glow` (screen-blended radial light: warm, cool, red), `Cone` (a lamp's soft cone), `LightVeil` (the contrast
pass), `Dust` (specks in a beam), `WallTexture`, `RoomCorners`, `SkyView` (a window onto the dusk: sky, sun, far
city; `night` for a deep blue sky, stars, the moon where the sun was, the city lit; `BackWindow` takes `night` too).
`DuskSky`, `Sun`, `Rays`, `Haze`, `Bokeh`, `Shaft`, `Skyline`, `Foreground` (blur 3, 6, 10 or 16), and for night
`NightSky`, `Moon`, `Stars`. Filters for characters: `rimR`, `rimL`, `rimRed`, and `rimBlue`, `rimBlueL` for
moonlight and screen light.

## UI and marks (`ui.tsx`)

All in the mono face on a dark translucent pill, cream text, orange for the live value.

| Block | Use |
|---|---|
| `TitleCard t lines accent accentT` | the premise over a wide, inside the camera group |
| `HudChip f label icon` | names the power while it runs (rewind, pause, copy, paste, skip, dot) |
| `Dial p readout` | a stopwatch, a countdown, a battery |
| `Gauge x y p label` | a level going up or down (energy, money, risk) |
| `Tag x y t text mark` | a short answer or value, with a cross or a tick drawn on |
| `Marquee x y w h t label` | a selection box with marching ants: picking a thing out of the world |
| `PasteIn x y t` | wraps anything that appears from nowhere: it pops in with an overshoot, a glow and an opening ring |
| `Toast x y t text` | a small notice that pops in and out (COPIED, SAVED) |
| `FloatLabel x y t text` | "x10", "+1" rising and fading |
| `FocusRings`, `DizzyStars`, `Sparkle` | a realisation, a daze, a glint |
| `TapeLines f` | VHS lines for time powers (full frame, in a look's overlay) |
| `FONT.title / ui / hand` | the three faces |

## Adding to the kit

- **A set:** build it with the room kit in `src/engine/sets/<name>.tsx`, export it from `engine/index.ts`, document
  its coordinates in the table above, and copy it into the skill's `studio/src/engine/sets/` so it ships.
- **A character:** a new `Look` in `LOOKS` (colours, plus an `extra` piece if it needs one, drawn in `Hero`), checked
  on the cast sheet for contrast on the dark sets and for resemblance to anything famous.
- **A power look:** in the episode's `index.tsx`; move it to `ui.tsx` once a second episode wants it.

# REFERENCE: sound.md

# Sound

The genre is dense with sound: every visible action has its own effect, ambience fills every gap, a light music bed
runs under the cold open and cuts out at the turn. All of it comes from ElevenLabs' sound generation, cached in
`library/sfx/`, so a clip is paid for once and reused by every later episode.

## Writing the events

One event per visible action, cued to the shot it happens in, so retiming the voice never breaks the sync:

```json
"events": [
  ["S2+6", "glass_tink", 0.5],                    cue, clip, gain (0..1, clips are peak-levelled first)
  ["S3+2", "whoosh", 0.4, "peak"],                "peak": the clip's loudest moment lands on the cue (whooshes, booms)
  ["S1", "kitchen_tone", 0.12, "onset", "S6"],    an ambience from S1 cut (with a fade) where S6 starts
  ["paste+2", "pop", 0.5]                         or cue on a word
]
```

- **A hit that illustrates a word lands in the pause after it, never on it.** The copy-paste run first put each
  paste's pop on the word "Paste" and covered it; moved four to six frames later, into the gap, the word reads and
  the pop lands as the answer to it. Move the picture with it (the copy appears with its sound).
- **Align by the attack, not the file start:** `onset` (default) finds where the clip actually starts sounding. A hit
  on the frame of the visible impact; a whoosh with `peak` on the frame of the fastest movement.
- **Layers for each beat:** the action (a step, a catch), the power (its signature sound every time it's used), the
  reaction (a laugh, a gasp, a sparkle), and the room (an ambience per location, cut at the location change).
- **The power's sound** is the episode's signature: the same clip every time, so the viewer hears the rule.
- **The turn** gets a low hit (drone or boom) on its first frame, the music cut on the same frame, and one detail
  sound repeated (bulbs dying, lights switching off) through `repeats`.
- **Silence is a tool:** cut the music a beat before the title boom or the turn so the hit lands in a gap.

## Prompts that work

Describe the physical source, the material and the length: "a ceramic coffee mug smashing on a wooden floor, shards
scattering and liquid splash" beats "smash sound". Add "cartoon" for exaggerated comedy sounds (a tiptoe, dizzy
birds), "short" for one-shots, "no voices" for ambiences. Durations: 0.5 to 1.6 s for hits, 2 to 12 s for
ambiences, the episode's length for the music bed ("playful quirky cartoon background music, pizzicato strings,
glockenspiel and soft bass, light and curious, 110 bpm, no vocals").

Check the library first (`python <skill>/scripts/sfx.py <slug> --dry` lists what's cached): reuse a clip by giving
it the same name, prompt and length.

## Levels

`sfx.py` measures the voice and each stem and sets their volumes in the mix:

- effects stem: `sfx_lu` LU against the voice, integrated. The default, +1.5, is about where the approved proof clip
  sat (+1.9); the copy-paste run settled at -1.5 after the mix check. The stem is sparse, so its gated loudness reads
  high: these numbers sound denser than they look.
- music bed: `music_lu` (default -9.5) LU against the voice.
- The whole effects stem is levelled to `sfx_lu`, so lowering one event's gain makes the others louder. Lower events
  to change the balance inside the stem; lower `sfx_lu` to give the voice more room overall.
- The final mix is brought to -14 LUFS with true peaks under -1 dBTP by `master.py`.

Then run `mixcheck.py`: it lists the spoken moments where effects or music come within 3 dB of the voice. Fix the
words that matter (the fact, the last line) by moving a hit into the pause after the word or lowering it; a title
boom or a drone on the turn can stay. The proof clip had 30 such moments at 0 dB; copy-paste shipped with 14.

## Costs

The voice's exact cost is in the account's generation history, which `voice.py` reads: the 356-character copy-paste
take cost 78 credits (about 0.22 a character on this account; the proof clip's 280-character takes cost 61 and 62).
By 29 Oct 2026 the same voice and model cost about 0.44 a character (the 358-character preview-minute take: 158), so
count the characters and re-check the rate before the call.
Sound clips don't appear in the history, so `sfx.py` reads the account counter before and after, and the counter can
lag: re-read it before you report a number, or check the usage page. The copy-paste run's 12 new clips (13.5 s in
all) moved the counter by 74 credits. The proof clip's sound cost more (775 credits for five clips including 19 s of
ambience), so long ambiences are where the cost is: reuse `room_tone` and `roof_wind` from the library.

# REFERENCE: traps.md

# Traps

Every one of these cost real time on the proof clip or the copy-paste run. Check the list before building a set, a
shot or a character.

## Drawing

- **Dark limbs vanish on dark sets.** Navy limbs on a navy wall disappeared. Limbs are light with a dark outline, or
  the body is dark and catches a rim light (look B, the hoodie) with the head the brightest thing.
- **Stair sides are one continuous piece:** a sawtooth top and a stringer board along the underside. Alternating
  fills per step read as stacked boxes.
- **Wall texture stays faint.** The `g3wall` filter at its set strength; stronger reads as mould.
- **Furniture needs legs and contact shadows.** Desks without legs floated; every standing thing gets an ellipse of
  shadow where it meets the floor.
- **Mid-ground characters must sit inside the crop** of every shot that uses the set, not just the wide.
- **LightVeil strength:** about 0.28 in a wide that must show the floor, 0.42 to 0.5 elsewhere. At 0.52 the first
  wide went so dark the floor vanished.
- **The raised hand is the near one.** With `yaw < 0` the far arm hides behind the hood: raise `armL`.
- **Over-the-shoulder needs a big foreground figure,** about a third of the frame, dark and blurred (`blur16`). A
  small one reads as a mistake.
- **Characters must stay ours.** Mo's first hat (a teal beanie with a yellow pom-pom) drifted toward a famous
  cartoon's; it became curly hair and headphones. Check every new look's silhouette on the cast sheet.
- **Props near a hand get read as the hand.** In copy-paste's top-down desk shot a ruler sat where the arm came in
  and read as a thin beige arm. Keep a clear space round hands, and scale an arm that enters an insert up hard (a
  sleeve 100 to 130 wide, the mitten at 4.5 to 5).
- **Hands come from where the character is.** In an insert, the arm enters from the side of frame where that
  character stands in the neighbouring shots (the far side of the desk is the top of a top-down frame).
- **A big room's light holes must be small.** A LightVeil hole the size of the back wall lights it evenly and the
  room goes flat and grey; keep each hole about the size of its pool of light (the kitchen window: 430, not 720).
- **Nothing bright competes with the face.** A light-grey fridge was as bright as Pip's head; props sit a step
  darker than the character.
- **A blackout needs lights to switch off.** The rooftop's city has few lit windows by default; raise `cityLit`
  (about 2.5) or the sweep is invisible.
- **Long titles:** line 2 over about 20 characters needs `size` 88 to 100 to keep margins (more if you set a
  wider title face than the default).
- **Things that count must match the night.** A calendar's crosses, a clock, a pile that grows: the first demo of
  "skip sleep" showed nine crossed days on night one. Set the count per shot (`crossed={0}`).
- **Front-on sitting doesn't read.** Legs swing in the facing direction, so a seated figure facing camera looks like
  it's standing in front of the furniture. Seat characters in profile: thighs forward (`a` about 80), shins back
  down (`b` about -80), hips on the edge.
- **Focus rings scale with the camera.** At zoom 2 they fill the frame; wrap them in a `scale(0.4)` about the head.
- **Unique ids.** A set that draws gradients, masks or clip paths takes an `id` prop; give each shot its own (`sh4`),
  and a different one again if the same set renders twice in one frame (a blurred copy behind a close-up).
- **A hand can't touch the head.** The head is drawn after the arms, so a mitten raised to a temple or a mouth
  disappears behind it, and an arm raised beside the head reads as a wave. In a close-up, leave the rig's arms down
  and draw the arm yourself after the character: a sleeve path from off frame and a mitten at the prop, as the inserts
  in `episodes/copy-paste/shots.tsx` do (that's how the preview run fed Mo a slice and put a phone to Pip's ear). In a
  medium, act it with the head and a jolt instead.
- **A grade on a whole shot needs a screen-sized filter box.** Filter the outer group with `filterUnits="userSpaceOnUse"`
  and a 0..1920 x 0..1080 region: the default box is the content's, and sets draw far past the frame.
- **A colour grade lifts black.** The preview look's matrix turned a black screen navy; draw true black outside the
  graded group.

## Motion

- **Everything derives from the shot's clock `t`.** No `Math.random`, no state, no global frame inside a shot: a
  reversed or held segment must draw the same frame for the same `t`. Scatter with `rnd(seed, i)`.
- **Faces swap, they don't morph.** Use `faceAt` keys; `poseAt` holds the earlier face until its key lands.
- **A walk on stairs uses `hipGround`,** not `stepTop`, or the hips jump step by step.
- **Lands and catches** need the prop to follow the hand exactly: compute the hand with `toWorld(pose,
  joints(pose).armR.end)` and attach the prop there (the proof clip's catch).

## Sound

- **A pop on a word covers the word.** Land illustrative hits in the pause after their word (see `sound.md`).
- **Beds bury facts.** A rising hum under the science line masked it; beds under key lines stay low (0.1 to 0.15).
- **A hit's tail runs into the next word.** A 0.6 s beep after "Midnight" still sounded under "Skip": give short
  hits an `until` cue at the next shot. Time the picture's action into the pause too (the skip episode snaps awake
  about 10 frames into each skip shot, after the word).
- **Levelling is per stem.** `sfx.py` levels the whole effects stem, so lowering one event raises the rest.
- **mixcheck's windows are 0.4 s,** longer than most pauses, so a hit placed correctly in the 0.3 s after a word
  still gets flagged with it. When a flag sits on a word's last syllable, check that word in 0.1 s windows before
  moving anything: a fricative tail ("face", "catch") under a bed or a hit that follows it is not a covered word.

## Pipeline

- **Storyboard first.** A still renders in about two seconds, a full 23 s episode in about two and a half minutes.
  Iterate on stills.
- **Never cut to an empty frame.** Whatever a shot builds, something is already on at its first frame (start a pop at
  `t + 3`, not `t - 1`).
- **plan.py lists only audio that exists:** a missing `staticFile` fails the render.
- **Cue words can't contain a hyphen or a plus:** cue the next word, or use `s:` / `f:`.
- **Google Fonts need a connection** at render time. Set a local title face in `studio.config.ts` to work offline.
- **Windows:** `master.py` calls `npx.cmd`; Remotion downloads its own headless Chrome on the first render (about
  110 MB, once).
- **ElevenLabs costs:** the voice's exact cost is in the history; sound clips only move the account counter, which
  can lag. Re-read it before reporting.
- **Remotion Studio can't drag these shots around:** they're computed from the timeline, so retime in
  `episode.json` and re-run `plan.py`.

# SCRIPT DOCSTRINGS (what each script reads, writes and takes)

## /home/ec2-user/what-if/.claude/skills/what-if-animation/../what-if-animation/scripts/board.py
Step 4: the storyboard sheet. Lays the board stills out as one captioned contact sheet: shot number and size, start
time, the words over it, and the note. This is what gets reviewed (by you, then by the person) before any animation.

python <skill>/scripts/board.py <slug> [--cols 3]
Reads  out/<slug>/board/<shot>.png (from stills.mjs) and src/episodes/<slug>/timeline.json
Writes out/<slug>/storyboard.jpg

## /home/ec2-user/what-if/.claude/skills/what-if-animation/../what-if-animation/scripts/master.py
Step 8: the master. Renders the episode, then brings the mix to -14 LUFS with true peaks under -1 dBTP (two-pass
loudnorm, video copied untouched), measures the result and writes the report.

python <skill>/scripts/master.py <slug> [--skip-render] [--concurrency 6]
Writes out/<slug>/<slug>-raw.mp4, out/<slug>/<slug>-final.mp4 and out/<slug>/report.json

## /home/ec2-user/what-if/.claude/skills/what-if-animation/../what-if-animation/scripts/mixcheck.py
Step 7 check: is the voice clear of the effects and the music? Measures the three stems at their mix volumes in
0.4 s windows and lists the moments, while someone is speaking, where effects or music come within `margin` dB of the
voice. Fix a flagged moment by lowering that event's gain in episode.json, then re-run sfx.py.

python <skill>/scripts/mixcheck.py <slug> [--margin 3]

## /home/ec2-user/what-if/.claude/skills/what-if-animation/../what-if-animation/scripts/plan.py
Step 3: the shot list on the voice. Resolves the edit's cues against the word timings and writes the timeline.

python <skill>/scripts/plan.py <slug>
Reads  src/episodes/<slug>/episode.json (shots, edit, fx) and words.json (from voice.py)
Writes src/episodes/<slug>/timeline.json (the engine reads it) and out/<slug>/shotlist.md, and prints the pace.

An edit entry:  {"shot": "S4", "at": "homework", "look": "copy"}
  at       when the cut lands: a word ("homework", "paste#2" = its 2nd occurrence after the previous cut), "+18" (frames
           after the previous cut), "s:4.2", "f:126". A word cut lands `lead` frames (default 2) before the word.
  reverse  true plays the shot's clock backwards, from where it was last seen ("from") to "to" (default 0)
  from     the shot's clock at the cut (default 0 forward)
  look     a power look the episode defines (rewind, copy...): grade and overlay while it runs
The episode ends `tail` seconds (default 0.9) after the last word, or at "end": "<cue>".

## /home/ec2-user/what-if/.claude/skills/what-if-animation/../what-if-animation/scripts/sfx.py
Step 7: sound. Generates the episode's sound effects and music bed with ElevenLabs, lines each hit up on its frame,
mixes the effects and music stems, and sets their levels against the voice.

python <skill>/scripts/sfx.py <slug> [--dry]
Reads  src/episodes/<slug>/episode.json "sound", timeline.json and words.json
Writes public/<slug>/sfx.wav and music.wav, sets their volumes in timeline.json, prints the credits it used.
--dry lists the clips it would generate (and what is already in the library) without calling the API.

"sound": {
  "clips":   {"name": ["prompt", seconds], ...}       generated once, cached in library/sfx/ by name + prompt + length
  "events":  [[cue, clip, gain, align, until], ...]   align "onset" (default: the attack lands on the cue) or "peak"
                                                        (the loudest moment does, for whooshes and booms); until = a cue
                                                        where the clip is cut with a short fade
  "repeats": [{"at": cue, "clip": name, "n": 15, "every": 2, "gain": [lo, hi], "pitch": [lo, hi]}]
                                                        one clip many times, each pitched a little differently
  "music":   {"clip": name, "until": cue, "reverse_looks": ["rewind"], "from": cue}
                                                        the bed starts at "from" (default 0), cut at "until"; during a look
                                                        listed in reverse_looks it plays what just played, backwards
  "levels":  {"sfx_lu": 1.5, "music_lu": -9.5}         integrated loudness of each stem against the voice's
}
Cues are the same as in plan.py: "S3+2", "f:46", "s:1.5", "paste+3".

## /home/ec2-user/what-if/.claude/skills/what-if-animation/../what-if-animation/scripts/voice.py
Step 2: the voice. ElevenLabs text-to-speech with character timestamps, then the pauses tightened to the genre's pace.

python <skill>/scripts/voice.py <slug> [--force]
Reads  src/episodes/<slug>/episode.json  (script, voice, gaps)
Writes public/<slug>/voice_raw.mp3, public/<slug>/voice.wav (tightened), src/episodes/<slug>/words.json (word timings
       after tightening, used by plan.py) and out/<slug>/words_raw.json. Prints the credits it used.
The API is only called when the text or the voice settings change (cached by a hash), so re-running to retune the
gaps is free.

episode.json "voice" (all optional): {"id": "TX3LPaxmHKxFdv7VOQHJ", "model": "eleven_multilingual_v2",
  "settings": {"stability": 0.4, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": true}}
episode.json "gaps" (seconds, all optional): {"word": 0.12, "comma": 0.2, "sentence": 0.3, "question": 0.45,
  "pairs": {"anything|One": 0.6}}  -> every pause longer than its limit is cut to the limit, from its middle.

## /home/ec2-user/what-if/.claude/skills/what-if-animation/../what-if-animation/scripts/wi.py
Shared helpers for the What If animation scripts: paths, the API key, credits, cues, audio files.

Every script runs from the studio folder (the copy of studio/ where you ran npm install) and takes the episode slug:
    python <skill>/scripts/plan.py copy-paste
Episode files:  src/episodes/<slug>/episode.json (you write it), words.json + timeline.json (the scripts write them)
Audio:          public/<slug>/voice.wav, sfx.wav, music.wav
Renders/review: out/<slug>/
Sound library:  library/sfx/ (generated clips, cached by name + prompt + length, shared by every episode)

## /home/ec2-user/what-if/.claude/skills/what-if-animation/scripts/board.py
Step 4: the storyboard sheet. Lays the board stills out as one captioned contact sheet: shot number and size, start
time, the words over it, and the note. This is what gets reviewed (by you, then by the person) before any animation.

python <skill>/scripts/board.py <slug> [--cols 3]
Reads  out/<slug>/board/<shot>.png (from stills.mjs) and src/episodes/<slug>/timeline.json
Writes out/<slug>/storyboard.jpg

## /home/ec2-user/what-if/.claude/skills/what-if-animation/scripts/master.py
Step 8: the master. Renders the episode, then brings the mix to -14 LUFS with true peaks under -1 dBTP (two-pass
loudnorm, video copied untouched), measures the result and writes the report.

python <skill>/scripts/master.py <slug> [--skip-render] [--concurrency 6]
Writes out/<slug>/<slug>-raw.mp4, out/<slug>/<slug>-final.mp4 and out/<slug>/report.json

## /home/ec2-user/what-if/.claude/skills/what-if-animation/scripts/mixcheck.py
Step 7 check: is the voice clear of the effects and the music? Measures the three stems at their mix volumes in
0.4 s windows and lists the moments, while someone is speaking, where effects or music come within `margin` dB of the
voice. Fix a flagged moment by lowering that event's gain in episode.json, then re-run sfx.py.

python <skill>/scripts/mixcheck.py <slug> [--margin 3]

## /home/ec2-user/what-if/.claude/skills/what-if-animation/scripts/plan.py
Step 3: the shot list on the voice. Resolves the edit's cues against the word timings and writes the timeline.

python <skill>/scripts/plan.py <slug>
Reads  src/episodes/<slug>/episode.json (shots, edit, fx) and words.json (from voice.py)
Writes src/episodes/<slug>/timeline.json (the engine reads it) and out/<slug>/shotlist.md, and prints the pace.

An edit entry:  {"shot": "S4", "at": "homework", "look": "copy"}
  at       when the cut lands: a word ("homework", "paste#2" = its 2nd occurrence after the previous cut), "+18" (frames
           after the previous cut), "s:4.2", "f:126". A word cut lands `lead` frames (default 2) before the word.
  reverse  true plays the shot's clock backwards, from where it was last seen ("from") to "to" (default 0)
  from     the shot's clock at the cut (default 0 forward)
  look     a power look the episode defines (rewind, copy...): grade and overlay while it runs
The episode ends `tail` seconds (default 0.9) after the last word, or at "end": "<cue>".

## /home/ec2-user/what-if/.claude/skills/what-if-animation/scripts/sfx.py
Step 7: sound. Generates the episode's sound effects and music bed with ElevenLabs, lines each hit up on its frame,
mixes the effects and music stems, and sets their levels against the voice.

python <skill>/scripts/sfx.py <slug> [--dry]
Reads  src/episodes/<slug>/episode.json "sound", timeline.json and words.json
Writes public/<slug>/sfx.wav and music.wav, sets their volumes in timeline.json, prints the credits it used.
--dry lists the clips it would generate (and what is already in the library) without calling the API.

"sound": {
  "clips":   {"name": ["prompt", seconds], ...}       generated once, cached in library/sfx/ by name + prompt + length
  "events":  [[cue, clip, gain, align, until], ...]   align "onset" (default: the attack lands on the cue) or "peak"
                                                        (the loudest moment does, for whooshes and booms); until = a cue
                                                        where the clip is cut with a short fade
  "repeats": [{"at": cue, "clip": name, "n": 15, "every": 2, "gain": [lo, hi], "pitch": [lo, hi]}]
                                                        one clip many times, each pitched a little differently
  "music":   {"clip": name, "until": cue, "reverse_looks": ["rewind"], "from": cue}
                                                        the bed starts at "from" (default 0), cut at "until"; during a look
                                                        listed in reverse_looks it plays what just played, backwards
  "levels":  {"sfx_lu": 1.5, "music_lu": -9.5}         integrated loudness of each stem against the voice's
}
Cues are the same as in plan.py: "S3+2", "f:46", "s:1.5", "paste+3".

## /home/ec2-user/what-if/.claude/skills/what-if-animation/scripts/voice.py
Step 2: the voice. ElevenLabs text-to-speech with character timestamps, then the pauses tightened to the genre's pace.

python <skill>/scripts/voice.py <slug> [--force]
Reads  src/episodes/<slug>/episode.json  (script, voice, gaps)
Writes public/<slug>/voice_raw.mp3, public/<slug>/voice.wav (tightened), src/episodes/<slug>/words.json (word timings
       after tightening, used by plan.py) and out/<slug>/words_raw.json. Prints the credits it used.
The API is only called when the text or the voice settings change (cached by a hash), so re-running to retune the
gaps is free.

episode.json "voice" (all optional): {"id": "TX3LPaxmHKxFdv7VOQHJ", "model": "eleven_multilingual_v2",
  "settings": {"stability": 0.4, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": true}}
episode.json "gaps" (seconds, all optional): {"word": 0.12, "comma": 0.2, "sentence": 0.3, "question": 0.45,
  "pairs": {"anything|One": 0.6}}  -> every pause longer than its limit is cut to the limit, from its middle.

## /home/ec2-user/what-if/.claude/skills/what-if-animation/scripts/wi.py
Shared helpers for the What If animation scripts: paths, the API key, credits, cues, audio files.

Every script runs from the studio folder (the copy of studio/ where you ran npm install) and takes the episode slug:
    python <skill>/scripts/plan.py copy-paste
Episode files:  src/episodes/<slug>/episode.json (you write it), words.json + timeline.json (the scripts write them)
Audio:          public/<slug>/voice.wav, sfx.wav, music.wav
Renders/review: out/<slug>/
Sound library:  library/sfx/ (generated clips, cached by name + prompt + length, shared by every episode)


# FILES PRESENT WHEN THIS BRIEF WAS BUILT
```
/home/ec2-user/what-if/.claude/skills/what-if-animation
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/HEAD
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/config
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/description
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/hooks
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/hooks/applypatch-msg.sample
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/hooks/commit-msg.sample
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/hooks/fsmonitor-watchman.sample
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/hooks/post-update.sample
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/hooks/pre-applypatch.sample
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/hooks/pre-commit.sample
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/hooks/pre-merge-commit.sample
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/hooks/pre-push.sample
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/hooks/pre-rebase.sample
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/hooks/pre-receive.sample
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/hooks/prepare-commit-msg.sample
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/hooks/push-to-checkout.sample
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/hooks/sendemail-validate.sample
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/hooks/update.sample
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/index
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/info
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/info/exclude
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/logs
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/logs/HEAD
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/logs/refs
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/objects
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/objects/info
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/objects/pack
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/packed-refs
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/refs
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/refs/heads
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/refs/remotes
/home/ec2-user/what-if/.claude/skills/what-if-animation/.git/refs/tags
/home/ec2-user/what-if/.claude/skills/what-if-animation/.gitignore
/home/ec2-user/what-if/.claude/skills/what-if-animation/LICENSE
/home/ec2-user/what-if/.claude/skills/what-if-animation/README.md
/home/ec2-user/what-if/.claude/skills/what-if-animation/SKILL.md
/home/ec2-user/what-if/.claude/skills/what-if-animation/SKILL.md.new
/home/ec2-user/what-if/.claude/skills/what-if-animation/opencode
/home/ec2-user/what-if/.claude/skills/what-if-animation/opencode/commands
/home/ec2-user/what-if/.claude/skills/what-if-animation/opencode/commands/what-if.md
/home/ec2-user/what-if/.claude/skills/what-if-animation/references
/home/ec2-user/what-if/.claude/skills/what-if-animation/references/formula.md
/home/ec2-user/what-if/.claude/skills/what-if-animation/references/kit.md
/home/ec2-user/what-if/.claude/skills/what-if-animation/references/look.md
/home/ec2-user/what-if/.claude/skills/what-if-animation/references/sound.md
/home/ec2-user/what-if/.claude/skills/what-if-animation/references/traps.md
/home/ec2-user/what-if/.claude/skills/what-if-animation/scripts
/home/ec2-user/what-if/.claude/skills/what-if-animation/scripts/__pycache__
/home/ec2-user/what-if/.claude/skills/what-if-animation/scripts/__pycache__/wi.cpython-39.pyc
/home/ec2-user/what-if/.claude/skills/what-if-animation/scripts/board.py
/home/ec2-user/what-if/.claude/skills/what-if-animation/scripts/master.py
/home/ec2-user/what-if/.claude/skills/what-if-animation/scripts/mixcheck.py
/home/ec2-user/what-if/.claude/skills/what-if-animation/scripts/motiongrid.py
/home/ec2-user/what-if/.claude/skills/what-if-animation/scripts/plan.py
/home/ec2-user/what-if/.claude/skills/what-if-animation/scripts/sfx.py
/home/ec2-user/what-if/.claude/skills/what-if-animation/scripts/stills.mjs
/home/ec2-user/what-if/.claude/skills/what-if-animation/scripts/voice.py
/home/ec2-user/what-if/.claude/skills/what-if-animation/scripts/wi.py
/home/ec2-user/what-if/.claude/skills/what-if-animation/studio
/home/ec2-user/what-if/.claude/skills/what-if-animation/studio/.gitignore
/home/ec2-user/what-if/.claude/skills/what-if-animation/studio/library
/home/ec2-user/what-if/.claude/skills/what-if-animation/studio/library/sfx
/home/ec2-user/what-if/.claude/skills/what-if-animation/studio/package-lock.json
/home/ec2-user/what-if/.claude/skills/what-if-animation/studio/package.json
/home/ec2-user/what-if/.claude/skills/what-if-animation/studio/public
/home/ec2-user/what-if/.claude/skills/what-if-animation/studio/public/copy-paste
/home/ec2-user/what-if/.claude/skills/what-if-animation/studio/public/rewind
/home/ec2-user/what-if/.claude/skills/what-if-animation/studio/remotion.config.ts
/home/ec2-user/what-if/.claude/skills/what-if-animation/studio/src
/home/ec2-user/what-if/.claude/skills/what-if-animation/studio/src/CastSheet.tsx
/home/ec2-user/what-if/.claude/skills/what-if-animation/studio/src/Root.tsx
/home/ec2-user/what-if/.claude/skills/what-if-animation/studio/src/engine
/home/ec2-user/what-if/.claude/skills/what-if-animation/studio/src/episodes
/home/ec2-user/what-if/.claude/skills/what-if-animation/studio/src/index.ts
/home/ec2-user/what-if/.claude/skills/what-if-animation/studio/src/studio.config.ts
/home/ec2-user/what-if/.claude/skills/what-if-animation/studio/tsconfig.json
```

# Brief-driven workflow (the user hands a topic, Claude writes everything creative)
1. python scripts/make_brief.py what-if "What if you could ..." 60 "none" > brief.md   (packs: what-if, explainer, listicle, story, promo)
2. Give brief.md to a fresh Claude. Save its whole reply as reply.txt.
3. python scripts/split_reply.py reply.txt <slug>      writes episode.json, narration.txt, shots.tsx, index.tsx
4. python scripts/check_episode.py <slug>              fix every FAIL before spending voice credits
5. The machine does the rest: voice.py, plan.py, sfx.py, render, master. (voice.py, sfx.py, master.py are not in the bundle.)

# UPDATE 2 (supersedes the earlier workflow and the "Known gaps" list)
Claude writes EVERYTHING, including voice.py, sfx.py, master.py, the registry, RUN.sh and package.json.new, and delivers one zip.
The VM only unzips and runs. Workflow:
1. python scripts/make_brief.py what-if "<topic>" 60 "none" > brief.md      (run it inside the studio or anywhere under ~/what-if)
2. Give brief.md to a fresh Claude. It returns <slug>.zip.
3. cd <studio> && unzip -o <slug>.zip && bash RUN.sh dry     (checks the episode and counts voice characters; spends nothing)
4. bash RUN.sh                                                (voice, plan, sound, render, master -> out/<slug>/final.mp4)
Scripts of mine moved to unused_drafts/ are NOT part of the pipeline.
