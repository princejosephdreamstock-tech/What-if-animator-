# BRIEF: build one complete animated video as a ZIP

You are writing a complete episode for a faceless YouTube channel: flat vector SVG scenes animated with Remotion, built from a ready kit of characters, sets and props. You write EVERYTHING: the narration, the shots, the cuts, the sound plan, the shot code, and every pipeline script that does not exist yet. You package it all in ONE zip. The user's VM does nothing creative: it unzips your zip and runs `bash RUN.sh`, which records the voice, renders and stitches. A machine reads your files, so the exact formats matter more than anything else.

You cannot call ElevenLabs or render here, so write the code carefully and test what you can offline (see the self-check).

## Topic
your topic

## Format pack: what-if (tested)
ONE MINUTE, 100 to 180 words. Cold open demos, premise, the fun part, beat 4 in full (the real fact, then its consequence shown on screen), the suit notices (5), the sister is in danger (6), ends on "Part 1". Needs a "power" field.

## Length
About 60 seconds, so about 168 spoken words.

## Call to action
none
(If this says none: no call to action and no contact details. Never invent a link, number or handle.)

## The VM (facts)
- The studio folder is where the zip is unzipped (`unzip -o <slug>.zip`). It has src/engine, src/Root.tsx, src/studio.config.ts. Python 3 with numpy, Node, npm, ffmpeg.
- The skill scripts folder is /home/ec2-user/what-if/.claude/skills/what-if-animation/scripts . It already holds wi.py and plan.py (sources below). Never put them in the zip and never edit them. RUN.sh copies them into scripts/.
- Remotion 4.x with React 18 and TypeScript. The studio may not have package.json: include package.json.new (remotion, @remotion/cli and the other @remotion packages at ONE pinned version, react, react-dom, typescript, @types/react) and RUN.sh installs it only if no package.json exists.

## Deliverable: <slug>.zip (build it with your file tools, then show it with present_files)
Paths inside the zip are relative to the studio folder:
- src/episodes/<slug>/episode.json, narration.txt, shots.tsx, index.tsx
- src/episodes/index.ts: the registry with ONLY your episode (the other episode folders are not on the VM). Pattern: `import { x } from './<slug>'; export const EPISODES = [x];`
- src/index.ts (registerRoot(Root) from './Root'), src/shorts.ts (`export const SHORT_IDS: string[] = [];`), src/CastSheet.tsx (a minimal stub component): Root.tsx imports these three and they may be missing.
- scripts/voice.py, scripts/sfx.py, scripts/master.py: YOU write these, to the contract in the "machine" reference below.
- package.json.new, RUN.sh (spec in the machine reference).
Import only from the engine (the exports are listed below) and your own files. Never import another episode (../glimpse is not on the VM).

## episode.json
Keys: id (PascalCase), slug, pack, topic, title ["LINE 1","LINE 2"], accent, script, science, cast, shots, edit, tail, fx, sound. A "power" {word, rule, look} is required for what-if only. Optional: format, minutes, fps, lead, end, gap.
- script: [{"beat","text"}]. Each text is one spoken line, 6 to 18 words, written to be heard: short sentences, plain words, second person, present tense. One idea per line, every line showable as one picture. The first line is a hook.
- science: [{"claim","working","source"}] for EVERY number or fact in the script. Work the arithmetic. Never invent a statistic or promise results.
- shots: [{"id":"S1","size","set","key","note"}]. "set" must be a set that exists in the engine (listed below). No two neighbouring shots share a size and angle.
- edit: [{"shot","at"}] one per cut, in time order, the first at frame 0. A word cut lands 2 frames before the word.
- fx: [{"at", ...}]. sound: {"clips":{name:[prompt,seconds]},"events","repeats","music","music_alt","levels"} as defined in the sound and machine references.
Cue grammar: word, word#2 (second occurrence, counting from the previous cue's word; write plain word when it is spoken once after the previous cue), word+3 (3 frames after), S3+2 (2 frames after shot S3 starts; fx and sound only), +18 (after the previous cut; edit only), s:4.2, f:126. Each shot's cue word must be spoken after the previous shot's cue word. A cue word must be spoken in the script and contain no hyphen or plus sign.
narration.txt holds the same words as script[].text, one line per row, no tags.
shots.tsx exports one component per shot id (export const S1 ... Sn), built only from the engine kit. index.tsx must contain `export const <name> = defineEpisode('<Id>', {...})` in the pattern of the worked example, with <Id> equal to episode.json "id".

## Hard rules
- Original characters only (Pip is "you", Mo the best friend, sis, mom, suit). No real people, no third party brands or famous characters.
- Never name other creators or channels. Never imply any channel uses this pipeline or Claude.
- A hit that illustrates a word lands in the pause AFTER it (4 to 6 frames later), never on it.
- Pace: 27 or more cuts a minute, no hold over about 3 s without action in it. Cut by changing shot size.
- Never put a key, token or password in any file. No em dashes or en dashes anywhere.

## Self-check (do it with your tools BEFORE you hand over)
1. Make a scratch studio: scripts/wi.py and scripts/plan.py written EXACTLY from the sources below, your episode under src/episodes/<slug>/, and a FAKE words.json (every script word, 0.35 s apart, {"w","s","e"}). Run `python3 scripts/plan.py <slug>` from the scratch studio. Fix everything it reports until the pace report prints.
2. `python3 -m py_compile` on every script, `bash -n RUN.sh`, `python3 -c "import json; json.load(open(...))"` on episode.json.
3. Cross-check: every shot id has an export and an edit entry; every shot set exists in the engine list; every cue word is spoken; narration.txt equals the script; every sound event uses a defined clip and every clip is used; every number in the script is in science.
4. `unzip -l <slug>.zip` shows every path above.

## Reply
Build and verify the zip, present it, then answer in 8 lines or fewer: what is inside, any assumption you made, the voice characters and total sound-clip seconds this will cost, and anything you could not verify. If you have no file tools, say so in one line and stop.

----- BEGIN REFERENCE: machine.md -----
# The machine contract (YOU write the scripts that implement this, into the zip)

Everything runs from the STUDIO folder (the one with src/episodes). Scripts go in scripts/ beside wi.py and plan.py and use
`from wi import ...` (sources are in this brief; never edit them, never put them in the zip). Never print an API key.
Env (or .env, read with wi.read_env): ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, optional ELEVENLABS_MODEL (default eleven_multilingual_v2).

## voice.py <slug> [--dry]
- Reads src/episodes/<slug>/episode.json. One ElevenLabs call per script[].text (strip *stars*). Cache each line in public/<slug>/vo/ keyed by
  a hash of voice+model+text, so a rerun costs nothing.
- API: POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128, header xi-api-key,
  JSON body {"text","model_id"}. The reply has audio_base64 and alignment{characters, character_start_times_seconds,
  character_end_times_seconds}. Use wi.api for the call.
- Trim silence at each line's ends (keep about 30 ms before, 70 ms after), join with a pause: 0.30 s after . ? ! else 0.12 s
  (episode.json "gap" overrides), start with 0.2 s of silence.
- Write public/<slug>/voice.wav (wi.write_wav, peak 0.9) and src/episodes/<slug>/words.json = [{"w","s","e"}], seconds on the FINAL
  joined timeline, one entry per spoken word (split on whitespace). plan.py reads exactly this.
- --dry prints the line count and characters to record, and exits without a call. Log credits with wi.spent_since and wi.log_cost.

## sfx.py <slug> [--dry]   (runs after voice.py and plan.py; reads timeline.json and words.json)
- For each sound.clips entry name: [prompt, seconds], generate once with POST /v1/sound-generation (JSON {"text","duration_seconds",
  "prompt_influence"}; the reply is audio bytes). Verify the request shape against the current ElevenLabs docs if you can browse.
  Cache with wi.clip_path(name, prompt, secs). Peak-level every clip before gain.
- Cue to frame: wi.resolve(cue, words, fps, timeline["segments"], shot_ids).
- events [cue, clip, gain, mode?, untilCue?]: mode "onset" (default) puts the first audible moment on the cue, "peak" puts the loudest
  moment on it. With untilCue the clip is a bed: loop it (crossfade) and fade it out to fill cue..untilCue.
- repeats [{at, clip, n, every (frames), gain [from,to], pitch [from,to] (optional)}]: n copies every N frames, gain and pitch ramped.
- music {clip, from?, until?} and music_alt {clip, from, until}: a looped bed, 0.4 s fade in, 0.5 s fade out.
- Write public/<slug>/sfx.wav and music.wav (mono 44.1 kHz). Set timeline.json audio: {voice, sfx, music: "<slug>/<file>", voiceVol,
  sfxVol, musicVol}. plan.py keeps keys ending in Vol. Volumes: measure with wi.loudness so the sfx stem sits sound.levels.sfx_lu LU
  and music sits sound.levels.music_lu LU against the voice (default voiceVol 0.8).
- --dry lists which clips are not yet cached.

## master.py <slug>
- Mix voice, sfx, music at the timeline.json volumes (ffmpeg amix normalize=0), master to -14 LUFS, true peak -1 dBTP (loudnorm), write
  out/<slug>/mix.wav. If out/<slug>/video.mp4 (a SILENT render) exists, mux out/<slug>/final.mp4 (copy video, aac 320k, -shortest).

## RUN.sh (bash, set -e, slug fixed inside)
1. cd to its own folder. Make scripts/ if needed; copy wi.py, plan.py and check_episode.py from the skill scripts folder given in this
   brief if they are not in scripts/ yet. [ -f package.json ] || cp package.json.new package.json. [ -d node_modules ] || npm install.
2. Stop with a clear message if ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID is not set (environment or .env). Never print them.
3. python3 scripts/check_episode.py <slug>, then voice.py <slug> --dry, then (unless "bash RUN.sh dry") voice.py, plan.py, sfx.py,
   npx remotion render src/index.ts <Id> out/<slug>/video.mp4 --muted, master.py. Print the path of final.mp4.
----- END -----

----- BEGIN REFERENCE: formula.md -----
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
----- END -----

----- BEGIN REFERENCE: look.md -----
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
----- END -----

----- BEGIN REFERENCE: kit.md -----
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
----- END -----

----- BEGIN REFERENCE: sound.md -----
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
----- END -----

----- BEGIN REFERENCE: traps.md -----
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
----- END -----

----- BEGIN ENGINE: src/engine/ files -----
anim.ts
episode.tsx
fonts.ts
furnish.tsx
index.ts
kit.tsx
light.tsx
props.tsx
rig.tsx
room.tsx
sets/bedroom.tsx
sets/classroom.tsx
sets/kitchen.tsx
sets/rooftop.tsx
sets/schematic.tsx
sets/stairwell.tsx
sets/study.tsx
ui.tsx
----- END -----

----- BEGIN ENGINE: src/engine/index.ts (the exports you may import) -----
// Everything an episode builds with, in one import: import { Study, Hero, poseAt, Marquee, ... } from '../../engine';
export * from './anim';
export * from './rig';
export * from './props';
export * from './kit';
export * from './light';
export * from './room';
export * from './furnish';
export * from './ui';
export * from './fonts';
export * from './episode';
export * from './sets/study';
export * from './sets/stairwell';
export * from './sets/classroom';
export * from './sets/rooftop';
export * from './sets/kitchen';
export * from './sets/schematic';
export * from './sets/bedroom';
----- END -----

----- BEGIN FILE: src/Root.tsx -----
import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { EPISODES } from './episodes';
import { CastSheet } from './CastSheet';

// Every episode gets two compositions: <Id> (the film) and <Id>Board (one frame per shot, at its key frame, for the
// storyboard). Cast renders the cast sheet.
//   npx remotion studio src/index.ts --port 3430

export const Root: React.FC = () => {
  const common = { width: STUDIO.width, height: STUDIO.height, fps: STUDIO.fps };
  return (
    <>
      {EPISODES.map((e) => (
        <React.Fragment key={e.id}>
          <Composition id={e.id} component={e.Main} durationInFrames={Math.max(1, e.total)} {...common} />
          <Composition id={`${e.id}Board`} component={e.Board} durationInFrames={Math.max(1, e.shotCount)} {...common} />
        </React.Fragment>
      ))}
      <Composition id="Cast" component={CastSheet} durationInFrames={1} {...common} />
    </>
  );
};
----- END -----

----- BEGIN SOURCE: scripts/wi.py (already on the VM, do not edit, do not zip) -----
"""Shared helpers for the What If animation scripts: paths, the API key, credits, cues, audio files.

Every script runs from the studio folder (the copy of studio/ where you ran npm install) and takes the episode slug:
    python <skill>/scripts/plan.py copy-paste
Episode files:  src/episodes/<slug>/episode.json (you write it), words.json + timeline.json (the scripts write them)
Audio:          public/<slug>/voice.wav, sfx.wav, music.wav
Renders/review: out/<slug>/
Sound library:  library/sfx/ (generated clips, cached by name + prompt + length, shared by every episode)
"""
import hashlib, json, os, pathlib, re, subprocess, sys, time, urllib.request, wave

import numpy as np

SR = 44100
sys.stdout.reconfigure(encoding='utf-8')
STUDIO = pathlib.Path.cwd()
if not (STUDIO / 'src' / 'episodes').exists():
    raise SystemExit('Run this from the studio folder (the one with src/episodes and package.json).')
LIB = STUDIO / 'library' / 'sfx'


# ---------------------------------------------------------------- paths
def ep_dir(slug):
    return STUDIO / 'src' / 'episodes' / slug


def pub_dir(slug):
    d = STUDIO / 'public' / slug
    d.mkdir(parents=True, exist_ok=True)
    return d


def out_dir(slug):
    d = STUDIO / 'out' / slug
    d.mkdir(parents=True, exist_ok=True)
    return d


def stem(slug, name):
    """An audio stem in public/<slug>/: name.wav, or name.mp3 (the shipped examples), or None."""
    for ext in ('wav', 'mp3'):
        q = STUDIO / 'public' / slug / f'{name}.{ext}'
        if q.exists():
            return q
    return None


def load_episode(slug):
    p = ep_dir(slug) / 'episode.json'
    if not p.exists():
        raise SystemExit(f'No episode.json at {p}')
    return json.loads(p.read_text(encoding='utf-8'))


def load_json(p, default=None):
    p = pathlib.Path(p)
    return json.loads(p.read_text(encoding='utf-8')) if p.exists() else default


def save_json(p, data):
    pathlib.Path(p).write_text(json.dumps(data, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')


# ---------------------------------------------------------------- the key and credits
KEY_NAMES = ['ELEVENLABS_API_KEY']


def read_env(p):
    """A .env as text, however it was saved: UTF-8 with or without a BOM, or UTF-16 (Windows PowerShell's `>`)."""
    raw = p.read_bytes()
    if raw[:2] in (b'\xff\xfe', b'\xfe\xff'):
        return raw.decode('utf-16', errors='ignore')
    return raw.decode('utf-8-sig', errors='ignore')


def api_key():
    """The ElevenLabs key, by name only: from the environment, or the nearest .env above the studio. Never printed."""
    for n in KEY_NAMES:
        if os.environ.get(n):
            return os.environ[n]
    for d in [STUDIO, *STUDIO.parents]:
        p = d / '.env'
        if p.exists():
            for line in read_env(p).splitlines():
                for n in KEY_NAMES:
                    if line.strip().startswith(n + '='):
                        return line.split('=', 1)[1].strip().strip('"').strip("'")
    raise SystemExit(f'No ElevenLabs key: set one of {KEY_NAMES} in the environment or a .env file.')


def api(path, body=None, timeout=180):
    req = urllib.request.Request('https://api.elevenlabs.io' + path, headers={'xi-api-key': api_key(), 'Content-Type': 'application/json'})
    if body is not None:
        req.data = json.dumps(body).encode()
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def credits_used():
    """Characters/credits used so far this billing period (ElevenLabs' counter; it can lag by minutes)."""
    s = json.loads(api('/v1/user/subscription'))
    return s['character_count'], s['character_limit']


def spent_since(t0, expect=1, tries=6):
    """Credits spent since unix time t0, read from the account's generation history, which records each item's exact
    cost (the subscription counter lags). Waits a little for `expect` items to appear. Returns (credits, items)."""
    items = []
    for i in range(tries):
        h = json.loads(api('/v1/history?page_size=100'))
        items = [it for it in h.get('history', []) if it.get('date_unix', 0) >= int(t0) - 2]
        if len(items) >= expect:
            break
        time.sleep(2 + 2 * i)
    used = sum((it.get('character_count_change_to') or 0) - (it.get('character_count_change_from') or 0) for it in items)
    return used, len(items)


def log_cost(slug, step, used, note=''):
    """Append a cost line to out/<slug>/costs.json and print the running total for the episode."""
    p = out_dir(slug) / 'costs.json'
    rows = load_json(p, [])
    rows.append({'step': step, 'credits': used, 'note': note})
    save_json(p, rows)
    total = sum(r['credits'] for r in rows)
    print(f'ElevenLabs: {step} used {used} credits{f" ({note})" if note else ""}; this episode so far: {total}')


# ---------------------------------------------------------------- words and cues
def norm(w):
    return re.sub(r"[^\w']", '', w.lower().replace('’', "'"))


def word_frame(words, fps, i):
    return round(words[i]['s'] * fps)


def find_word(words, target, start=0, nth=1):
    t = norm(target)
    seen = 0
    for i in range(start, len(words)):
        if norm(words[i]['w']) == t:
            seen += 1
            if seen == nth:
                return i
    raise SystemExit(f'Cue word "{target}" (#{nth}) not found after word {start}. Words: ' + ' '.join(w['w'] for w in words))


CUE = re.compile(r'^(?P<base>[^+\-#]+?)(?:#(?P<nth>\d+))?(?P<off>[+-]\d+)?$')


def resolve(cue, words, fps, segments=None, shot_ids=()):
    """A cue to a global frame. Forms:
    f:123      an absolute frame          s:4.2     seconds
    S3+2       2 frames after the start of shot S3's first segment (S3#2+2: its second segment; S3-4 before it)
    word+3     3 frames after the word starts (word#2: its second occurrence)
    """
    cue = str(cue).strip()
    if cue.startswith('f:'):
        return int(round(float(cue[2:])))
    if cue.startswith('s:'):
        return int(round(float(cue[2:]) * fps))
    m = CUE.match(cue)
    if not m:
        raise SystemExit(f'Bad cue "{cue}"')
    base, nth, off = m['base'], int(m['nth'] or 1), int(m['off'] or 0)
    if segments is not None and base in shot_ids:
        segs = [s for s in segments if s['shot'] == base]
        if len(segs) < nth:
            raise SystemExit(f'Cue "{cue}": shot {base} has only {len(segs)} segment(s)')
        return segs[nth - 1]['a'] + off
    return word_frame(words, fps, find_word(words, base, 0, nth)) + off


# ---------------------------------------------------------------- audio
def decode(path):
    """Any audio file to mono float64 at 44.1 kHz."""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def write_wav(path, x, peak=None):
    if peak is not None:
        x = x / max(1e-9, np.abs(x).max()) * peak
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


def loudness(path_or_args):
    """Integrated loudness (LUFS) and true peak (dBTP) of a file, via ffmpeg's ebur128."""
    args = path_or_args if isinstance(path_or_args, list) else ['-i', str(path_or_args)]
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', *args, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8', errors='ignore')
    txt = r.stderr
    summ = txt[txt.rfind('Summary:'):]
    i = re.search(r'I:\s+(-?[\d.]+|-inf) LUFS', summ)
    p = re.search(r'Peak:\s+(-?[\d.]+|-inf) dBFS', summ)
    f = lambda m: float(m.group(1)) if m and m.group(1) != '-inf' else float('-inf')
    return f(i), f(p)


def clip_path(name, prompt, secs):
    h = hashlib.sha1(f'{prompt}|{secs}'.encode()).hexdigest()[:8]
    LIB.mkdir(parents=True, exist_ok=True)
    return LIB / f'{name}-{h}.mp3'
----- END -----

----- BEGIN SOURCE: scripts/plan.py (already on the VM, do not edit, do not zip) -----
"""Step 3: the shot list on the voice. Resolves the edit's cues against the word timings and writes the timeline.

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
"""
import statistics, sys

from wi import ep_dir, load_episode, load_json, out_dir, resolve, save_json, find_word, stem

slug = sys.argv[1]
ep = load_episode(slug)
FPS = ep.get('fps', 30)
LEAD = ep.get('lead', 2)
words = load_json(ep_dir(slug) / 'words.json', [])
if not words and any(not str(e['at']).startswith(('f:', 's:', '+')) for e in ep['edit']):
    raise SystemExit('No words.json yet: run voice.py first (or use f:/s: cues).')
shots = {s['id']: s for s in ep['shots']}

# ---------------------------------------------------------------- cut points
starts, wi_prev, prev = [], 0, 0
for k, e in enumerate(ep['edit']):
    if e['shot'] not in shots:
        raise SystemExit(f'Edit entry {k} uses unknown shot {e["shot"]}')
    at = str(e['at'])
    if at.startswith(('f:', 's:')):
        a = resolve(at, words, FPS)
    elif at.startswith('+'):
        a = prev + int(at[1:])
    else:
        base, _, off = at.partition('+') if '+' in at else (at, '', '0')
        if '#' in base:
            w, n = base.split('#')
            i = find_word(words, w, wi_prev, int(n))
        else:
            i = find_word(words, base, wi_prev)
        wi_prev = i + 1
        a = max(0, round(words[i]['s'] * FPS) - LEAD + int(off or 0))
    if k == 0:
        a = 0
    if a <= prev and k > 0:
        raise SystemExit(f'Edit entry {k} ({e["shot"]} at {at}) starts at frame {a}, not after the previous cut ({prev})')
    starts.append(a)
    prev = a
end = resolve(ep['end'], words, FPS) if 'end' in ep else round((words[-1]['e'] + ep.get('tail', 0.9)) * FPS)
if end <= starts[-1]:
    raise SystemExit(f'The last shot starts at {starts[-1]} but the episode ends at {end}')

# ---------------------------------------------------------------- segments and shot clocks
segments, last_clock = [], {}
for k, e in enumerate(ep['edit']):
    a, b = starts[k], starts[k + 1] if k + 1 < len(starts) else end
    if e.get('reverse'):
        t0 = e.get('from', last_clock.get(e['shot'], b - a))
        t1 = e.get('to', 0)
    else:
        t0 = e.get('from', 0)
        t1 = t0 + (b - a)
    last_clock[e['shot']] = t1
    line = ' '.join(w['w'] + w.get('p', '').strip() for w in words if a <= round(w['s'] * FPS) + LEAD < b)
    seg = {'shot': e['shot'], 'a': a, 'b': b, 't0': t0, 't1': t1, 'line': line}
    if e.get('look'):
        seg['look'] = e['look']
    segments.append(seg)

ids = list(dict.fromkeys(s['shot'] for s in segments))
for sid in shots:
    if sid not in ids:
        print(f'note: shot {sid} is defined but not in the edit')
info = []
for sid in ids:
    segs = [s for s in segments if s['shot'] == sid]
    fwd = [s for s in segs if s['t1'] >= s['t0']]
    length = max([s['t1'] for s in fwd] + [s['t0'] for s in segs])
    d = shots[sid]
    first = segs[0]
    info.append({
        'id': sid, 'size': d.get('size', ''), 'key': d.get('key', (first['b'] - first['a']) // 2), 'len': length, 'first': first['a'],
        'line': first['line'], 'note': d.get('note', ''),
    })

# ---------------------------------------------------------------- fx, audio
fx = []
for e in ep.get('fx', []):
    item = {k: v for k, v in e.items() if k != 'at'}
    item['f'] = resolve(e['at'], words, FPS, segments, ids)
    fx.append(item)
old = load_json(ep_dir(slug) / 'timeline.json', {}) or {}
audio = {k: v for k, v in old.get('audio', {}).items() if k.endswith('Vol')}
for k in ['voice', 'sfx', 'music']:
    f = stem(slug, k)
    if f:
        audio[k] = f'{slug}/{f.name}'
title = ep.get('title', ['', ''])
tl = {'slug': slug, 'title': ' '.join(title) if isinstance(title, list) else title, 'fps': FPS, 'total': end, 'segments': segments, 'shots': info, 'fx': fx, 'audio': audio}
save_json(ep_dir(slug) / 'timeline.json', tl)

# ---------------------------------------------------------------- the pace report and the shot list
cuts = [s['a'] for s in segments[1:]]
lens = [(s['b'] - s['a']) / FPS for s in segments]
dur = end / FPS
first10 = len([c for c in cuts if c < 10 * FPS])
per_min = len(cuts) / dur * 60
print(f'{len(segments)} segments, {len(ids)} shots, {dur:.1f} s ({end} frames)')
print(f'pace: {per_min:.0f} cuts/min overall, {first10 / min(10, dur) * 60:.0f} cuts/min in the first 10 s; median shot {statistics.median(lens):.1f} s, longest {max(lens):.1f} s')
if per_min < 24:
    print('  ! slower than the genre opening (about 27 cuts a minute): split long shots or cut on more words')
for s in segments:
    if (s['b'] - s['a']) / FPS > 4:
        print(f'  ! {s["shot"]} holds {(s["b"] - s["a"]) / FPS:.1f} s: give it action inside (a move, a light change, a push in) or split it')
rows = ['| # | Shot | Size | In | Length | Clock | Look | Words |', '|---|---|---|---|---|---|---|---|']
for k, s in enumerate(segments):
    d = shots[s['shot']]
    clock = f"{s['t0']:.0f}→{s['t1']:.0f}" + (' (back)' if s['t1'] < s['t0'] else '')
    rows.append(f"| {k + 1} | {s['shot']} | {d.get('size', '')} | {s['a'] / FPS:.2f} s | {(s['b'] - s['a']) / FPS:.2f} s | {clock} | {s.get('look', '')} | {s['line']} |")
md = f"# {tl['title']}: shot list\n\n{dur:.1f} s, {len(segments)} segments, {per_min:.0f} cuts/min\n\n" + '\n'.join(rows) + '\n'
(out_dir(slug) / 'shotlist.md').write_text(md, encoding='utf-8')
print(md)
----- END -----

----- BEGIN WORKED EXAMPLE: episode.json -----
{
"id":"Glimpse60",
"slug":"glimpse60",
"topic":"What if you could see one minute ahead?",
"title":["WHAT IF YOU COULD","GLIMPSE ONE MINUTE AHEAD?"],
"accent":"ONE MINUTE",
"power":{"word":"Glimpse.","rule":"see exactly sixty seconds into the future, any time you want","look":"a cyan selection box with marching ants draws around the future moment; a GLIMPSE chip pulses; the frame holds a ghost image of what's coming"},
"script":[
{"beat":"1 cold open, demo 1 (small and selfish)","text":"Coffee tips. Glimpse. You catch it."},
{"beat":"1 cold open, demo 2 (useful)","text":"Bus pulls off. Glimpse. You make it."},
{"beat":"1 cold open, demo 3 (a little uncanny)","text":"Friend speaks. Glimpse. You said it first."},
{"beat":"1 cold open, demo 4 (petty)","text":"Phone buzzes. Glimpse. It's mum. You let it ring."},
{"beat":"2 the premise (title card)","text":"What if you could glimpse one minute ahead?"},
{"beat":"3 the fun part, escalating","text":"Sounds amazing. Honestly, it does. You win every argument. You dodge every puddle. You ace every test. You're basically a wizard."},
{"beat":"4 the turn: the cost, two real facts and the sum","text":"But here's the catch. A glimpse isn't free. Your brain is two percent of your body weight, and it burns a fifth of all your energy. Twenty watts, nonstop. About a dim light bulb. Now run a whole minute of life in one second. Every single time you glimpse. Sixty times the power. Twelve hundred watts. A space heater, running inside your skull. That's real."},
{"beat":"5-7 the cost bites, folded into a question","text":"At first, a headache. A dull, pounding one. Then the world stutters. Like a video that won't load. Then the glimpses won't stop. One after another after another. Your head is hot. Your vision is white. Your ears are ringing. So what happens when the power fails?"}
],
"science":[
{"claim":"Your brain is two percent of your body, and burns a fifth of your energy.","working":"The adult brain weighs about 1.4 kg of roughly 70 kg of body weight (about 2%), yet uses about 20% of the body's resting energy.","source":"Raichle & Gusnard, 'Appraising the brain's energy budget', PNAS 2002"},
{"claim":"Twenty watts, nonstop. Run a minute of life in one second: sixty times the power, twelve hundred watts. A space heater inside your skull.","working":"The brain runs on about 20 W (about 20% of a ~100 W resting body). Assumption for the premise: living 60 seconds in 1 second takes 60 times the work, so 60 x 20 W = 1,200 W. A typical space heater draws 750 to 1,500 W. The 60x is the episode's back-of-envelope assumption, not a measurement.","source":"Raichle & Gusnard, PNAS 2002 (about 20 W); typical space heater ratings 750-1,500 W"}
],
"cast":["pipHood","mo"],
"shots":[
{"id":"S1","size":"medium","set":"kitchen","key":18,"note":"Pip at the island, coffee mug tipping over the edge"},
{"id":"S2","size":"macro insert, high angle","set":"kitchen (island top)","key":10,"note":"the mug caught mid-air, a cyan selection box around it, GLIMPSE chip"},
{"id":"S3","size":"wide","set":"kitchen","key":24,"note":"Pip sets the mug down, exhales; cat on the counter looks up"},
{"id":"S4","size":"medium wide","set":"stairwell (upper landing)","key":20,"note":"bus visible through the doorway pulling away; Pip sprints into frame"},
{"id":"S5","size":"close-up","set":"stairwell (upper landing)","key":14,"note":"Pip's eyes, a cyan GLIMPSE chip pulses, a ghost bus door holds in the reflection"},
{"id":"S6","size":"low angle, medium","set":"stairwell (upper landing)","key":22,"note":"Pip catches the bus door, hauls himself on; the bus lurches forward"},
{"id":"S7","size":"medium","set":"study","key":18,"note":"Mo at the desk turns to speak; Pip's hand already raising"},
{"id":"S8","size":"two-shot","set":"study","key":20,"note":"Mo's mouth opens, Pip's voice comes out first; both freeze, staring"},
{"id":"S9","size":"macro insert, top-down","set":"desk (tabletop)","key":14,"note":"the phone buzzes on the desk, MUM calling"},
{"id":"S10","size":"close-up","set":"study","key":12,"note":"Pip's eyes, a cyan box round the call to come, the future holds"},
{"id":"S11","size":"medium","set":"study","key":16,"note":"Pip leans back, smug, the phone buzzing unanswered"},
{"id":"S12","size":"title, wide","set":"rooftop","key":52,"note":"the premise over the city at dusk; Pip on the parapet, a faint cyan afterimage trailing his hand"},
{"id":"S13","size":"medium, low angle","set":"rooftop","key":16,"note":"Pip looks at his hand, the afterimage fading; he smiles, then frowns"},
{"id":"S14","size":"two-shot","set":"study","key":14,"note":"Mo argues, Pip leans back with his arms folded"},
{"id":"S15","size":"wide","set":"street","key":24,"note":"Pip hops clean over a puddle the box had already drawn round"},
{"id":"S16","size":"macro insert, top-down","set":"desk (tabletop)","key":16,"note":"the blank paper is boxed, the A+ pops in"},
{"id":"S17","size":"medium, low angle","set":"rooftop","key":16,"note":"arms up, sparkles all round: basically a wizard"},
{"id":"S18","size":"close-up","set":"rooftop","key":14,"note":"But here's the catch: Pip, uneasy"},
{"id":"S19","size":"schematic","set":"schematic","key":22,"note":"a body outline, the brain lit: 2% of your body"},
{"id":"S20","size":"schematic","set":"schematic","key":30,"note":"two bars: 2% of the weight, 20% of the energy"},
{"id":"S21","size":"schematic","set":"schematic","key":24,"note":"the brain, a warm glow: 20 W, nonstop"},
{"id":"S22","size":"schematic","set":"schematic","key":24,"note":"a dial runs one minute in one second"},
{"id":"S23","size":"schematic","set":"schematic","key":20,"note":"x 60, huge, glowing"},
{"id":"S24","size":"schematic","set":"schematic","key":40,"note":"a space heater inside a skull, 1,200 W counting up"},
{"id":"S25","size":"extreme close-up","set":"rooftop","key":14,"note":"Pip, worried; the cyan rim light shifts to red, the sky begins to turn"},
{"id":"S26","size":"medium","set":"rooftop","key":16,"note":"a headache: his hand to his head, stars circling"},
{"id":"S27","size":"medium","set":"rooftop","key":16,"note":"the world stutters: jittering ghosts, the city flickers"},
{"id":"S28","size":"close-up","set":"rooftop","key":14,"note":"the glimpses won't stop: boxes flicker all round him"},
{"id":"S29","size":"extreme close-up","set":"rooftop","key":20,"note":"his head is hot, his vision white: the frame bleaches out"},
{"id":"S30","size":"wide, low angle","set":"rooftop","key":48,"note":"the city's lights go out in a sweep toward him, string lights die one by one, the sky goes red"}
],
"edit":[
{"shot":"S1","at":"Coffee"},
{"shot":"S2","at":"Glimpse","look":"glimpse"},
{"shot":"S3","at":"You"},
{"shot":"S4","at":"Bus"},
{"shot":"S5","at":"Glimpse","look":"glimpse"},
{"shot":"S6","at":"You"},
{"shot":"S7","at":"Friend"},
{"shot":"S8","at":"Glimpse","look":"glimpse"},
{"shot":"S9","at":"Phone"},
{"shot":"S10","at":"Glimpse","look":"glimpse"},
{"shot":"S11","at":"It's"},
{"shot":"S12","at":"What"},
{"shot":"S13","at":"Sounds"},
{"shot":"S14","at":"win"},
{"shot":"S15","at":"dodge"},
{"shot":"S16","at":"ace"},
{"shot":"S17","at":"basically"},
{"shot":"S18","at":"But"},
{"shot":"S19","at":"Your"},
{"shot":"S20","at":"burns"},
{"shot":"S21","at":"Twenty"},
{"shot":"S22","at":"Now"},
{"shot":"S23","at":"Sixty"},
{"shot":"S24","at":"Twelve"},
{"shot":"S25","at":"That's"},
{"shot":"S26","at":"At"},
{"shot":"S27","at":"Then"},
{"shot":"S28","at":"Then"},
{"shot":"S29","at":"Your"},
{"shot":"S30","at":"So"}
],
"tail":1.0,
"fx":[
{"at":"S2+8","kind":"flash","color":"#00F5FF","o":0.5},
{"at":"S5+6","kind":"flash","color":"#00F5FF","o":0.4},
{"at":"S8+10","kind":"flash","color":"#00F5FF","o":0.45},
{"at":"S10+8","kind":"flash","color":"#00F5FF","o":0.4},
{"at":"S12","kind":"flash","color":"#FFF3DC"},
{"at":"S27","kind":"shake","len":10,"amp":10},
{"at":"S29","kind":"flash","color":"#FF3344","o":0.4},
{"at":"S30","kind":"flash","color":"#FF3344"},
{"at":"S30","kind":"shake","len":12,"amp":12}
],
"sound":{
"clips":{
"sparkle":["a short bright magical sparkle twinkle, cartoon",0.8],
"pop":["a cartoon speech bubble pop, short and bright",0.5],
"cat_chirp":["a cat making a short curious chirp meow",0.6],
"title_boom":["a cinematic whoosh rising into a deep boom impact",1.6],
"drone_hit":["a dark ominous low drone hit, deep cinematic horror sting",2.6],
"bulb_pop":["a small light bulb popping out, a tiny glass tink and fizz",0.5],
"room_tone":["quiet indoor room tone in the evening, faint distant city hum, no voices",12.5],
"roof_wind":["a gentle evening breeze on a city rooftop, distant traffic",7.0],
"music":["playful quirky cartoon background music, pizzicato strings, glockenspiel and soft bass, light and curious, 110 bpm, no vocals",17.0],
"select_draw":["a quick digital selection sound, a soft rising electronic shimmer as a box is drawn on screen, short",0.6],
"glimpse_hum":["a soft electronic hum rising and falling, like a sensor charging, short, cartoon",0.7],
"glimpse_pop":["a bright cyan magical pop as a future image locks in, a soft shimmering whoosh into a pop",0.6],
"bus_brake":["a city bus air brakes hissing, doors folding open with a pneumatic sigh",1.0],
"footsteps_sprint":["quick sprinting footsteps on concrete, three to four steps, urgent",0.8],
"gasp":["two young people gasping in surprise at the same moment, cartoon, short",0.8],
"glitch":["a short digital glitch, an electric buzz and crackle flickering like an unstable hologram",1.5],
"counter_tick":["a fast mechanical counter ticking up rapidly, digits rolling over, getting faster",1.6],
"power_hum":["a deep electrical power grid hum swelling louder, transformers buzzing, rising",3.0],
"power_down":["a whole city losing power, a deep electrical power-down whine dropping in pitch into silence",2.5],
"switch_off":["a heavy electrical breaker switching off with a dull clunk",0.5],
"mug_clink":["a ceramic coffee mug caught by a hand, soft clink and thud of ceramic on skin",0.5],
"whoosh_fast":["a fast whoosh of air as a hand snatches something mid-fall, short",0.5],
"phone_buzz":["a phone vibrating on a wooden desk, two short buzzes",1.0],
"headache_throb":["a dull low pounding throb like a heartbeat in the head, slow, muffled",2.0],
"ring_tone":["a high thin ringing in the ears, a steady whine slowly fading in",2.5]
},
"events":[
["S1","room_tone",0.12,"onset","S12"],
["S1+6","whoosh_fast",0.3,"peak"],
["S1+10","mug_clink",0.4],
["S2+8","select_draw",0.3],
["S2+10","glimpse_hum",0.4],
["S2+12","glimpse_pop",0.5],
["S2+14","sparkle",0.25],
["S3+8","cat_chirp",0.25],
["S4","room_tone",0.1,"onset","S7"],
["S4+4","bus_brake",0.3,"onset","S6"],
["S4+8","footsteps_sprint",0.4],
["S5+6","select_draw",0.25],
["S5+8","glimpse_hum",0.35],
["S5+10","glimpse_pop",0.45],
["S6+2","bus_brake",0.25,"onset","S7"],
["S7+6","select_draw",0.25],
["S7+8","glimpse_hum",0.35],
["S8+10","glimpse_pop",0.5],
["S8+14","gasp",0.4],
["S9+2","phone_buzz",0.18],
["S10+6","select_draw",0.25],
["S10+8","glimpse_hum",0.35],
["S10+10","glimpse_pop",0.45],
["S11+4","phone_buzz",0.12],
["S12","title_boom",0.35,"peak"],
["S12","roof_wind",0.16,"onset"],
["S13+4","glitch",0.18,"onset","S14"],
["S14+4","pop",0.18],
["S16+10","pop",0.25],
["S17+4","sparkle",0.3],
["S19+3","pop",0.18],
["S22+4","counter_tick",0.16,"onset","S23"],
["S23+2","whoosh_fast",0.25],
["S24+4","counter_tick",0.16,"onset","S25"],
["S24+14","power_hum",0.12,"onset","S25"],
["S25","drone_hit",0.3],
["S26+4","headache_throb",0.2,"onset","S27"],
["S27+2","glitch",0.22,"onset","S28"],
["S28+4","glitch",0.2,"onset","S29"],
["S29+2","ring_tone",0.18,"onset","S30"],
["S30","power_down",0.14],
["S30+48","switch_off",0.3]
],
"repeats":[{"at":"S30+48","clip":"bulb_pop","n":10,"every":2,"gain":[0.14,0.26],"pitch":[0.85,1.18],"note":"the string lights die after the last word (lightsOut from t 48 over 20 frames)"}],
"music":{"clip":"music","until":"S18"},
"levels":{"sfx_lu":-6,"music_lu":-12}
}
}
----- END -----

----- BEGIN WORKED EXAMPLE: index.tsx -----
import React from 'react';
import { defineEpisode, Timeline, LookDef, HudChip } from '../../engine';
import timeline from './timeline.json';
import * as O from '../glimpse/shots';
import * as N from './shots';

const glimpseLook: LookDef = {
  grade: (lv) => `saturate(${1 - 0.25 * lv}) brightness(${1 + 0.05 * lv}) hue-rotate(${14 * lv}deg)`,
  Overlay: ({ f }) => <HudChip f={f} label="GLIMPSE" icon="dot" />,
};

export const glimpse60 = defineEpisode('Glimpse60', {
  timeline: timeline as Timeline,
  shots: {
    S1: O.S1, S2: O.S2, S3: O.S3, S4: O.S4, S5: O.S5, S6: O.S6, S7: O.S7, S8: O.S8,
    S9: N.S9, S10: N.S10, S11: N.S11,
    S12: O.S9, S13: O.S10,
    S14: N.S14, S15: N.S15, S16: N.S16, S17: N.S17, S18: N.S18, S19: N.S19, S20: N.S20, S21: N.S21, S22: N.S22, S23: N.S23, S24: N.S24,
    S25: O.S12,
    S26: N.S26, S27: N.S27, S28: N.S28, S29: N.S29,
    S30: O.S13,
  },
  looks: { glimpse: glimpseLook },
});
----- END -----

----- BEGIN WORKED EXAMPLE: shots.tsx (first 170 lines) -----
import React from 'react';
import {
  Hero, Pose, basePose, poseAt, faceAt, kf, clamp, easeOut, rnd, settle, camT, LOOKS, LEG_LEN, HEAD, toWorld,
  Study, Desk, Rooftop, Tabletop, Phone, Paper, Glow, Marquee, Sparkle, DizzyStars, Dial, DuskSky, Skyline,
  Schematic, SCH, DrawOn, SchLabel, CountUp, ShotProps,
} from '../../engine';

// glimpse60: the 18 new shots. Each is a pure function of its own clock t.
const PIP = LOOKS.pipHood;
const MO = LOOKS.mo;
const CYAN = '#7FD4FF';

// close-up helper: Pip's head fills the frame at (hx, hy)
const headPose = (sc: number, hx: number, hy: number, extra: Partial<Pose> = {}): Pose => ({
  ...basePose, x: hx, y: hy - HEAD.y * sc, scale: sc, yaw: 0.12, look: 0.1, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 }, ...extra,
});
const buzzOn = (t: number) => (Math.floor(t / 2) % 2 === 0 ? 1 : 0);

// S9: top-down on the desk, the phone buzzes, MUM calling
export const S9: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={`translate(960 540) rotate(${-2 + t * 0.05}) scale(${1 + t * 0.003}) translate(-960 -540)`}>
    <Tabletop edge={1400} />
    <Glow x={1000} y={460} r={720} o={0.3} />
    <rect x={1380} y={800} width={320} height={14} rx={7} fill="#E9C46A" transform="rotate(-24 1540 807)" />
    <rect x={200} y={860} width={380} height={40} fill="#D9C8A8" transform="rotate(-10 390 880)" />
    <Phone x={960 + buzzOn(t) * 6} y={540} w={420} rot={-6 + buzzOn(t) * 2} on={1} caller="MUM" buzz={buzzOn(t)} f={t} />
  </g>
);

// S10: close-up, Pip's eyes, a cyan box round the call that is about to come
export const S10: React.FC<ShotProps> = ({ t, len }) => {
  const pose = headPose(5.6, 800, 620, faceAt(t, [[0, 'neutral'], [6, 'smug']]));
  return (
    <g>
      <g filter="url(#blur16)">
        <g transform="translate(-600 -560) scale(2)"><Study t={t + 60} id="s10st" /></g>
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill="#07040C" opacity={0.2} />
      <Hero look={PIP} pose={pose} rimId="rimR" shadow={0} />
      <g opacity={0.55}><Phone x={1560} y={560} w={260} on={1} caller="MUM" buzz={0} f={t} /></g>
      <Marquee x={1400} y={400} w={320} h={320} t={t - 4} color={CYAN} />
    </g>
  );
};

// S11: medium in the study, Pip leans back smug, the phone buzzing unanswered
export const S11: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 900, y: 712, yaw: 0.4, look: 0.7, armL: { a: 14, b: -6 }, armR: { a: 50, b: 30 } } },
    { f: 8, p: { tilt: -11, headTilt: -6, armL: { a: 160, b: 120 }, armR: { a: 160, b: 120 }, look: 0.2 }, ease: easeOut },
  ]);
  return (
    <g transform={camT(kf(t, [[0, 990], [len, 970]]), 590, kf(t, [[0, 1.8], [len, 1.9]]))}>
      <Study t={t + 140} id="s11st" />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [6, 'smug']]) }} rimId="rimR" shadow={0} />
      <Desk x0={560} x1={1360} y={700} lamp={false} />
      <Phone x={1170 + buzzOn(t) * 4} y={688} w={170} rot={-8} on={1} caller="MUM" buzz={buzzOn(t)} f={t} />
    </g>
  );
};

// S14: two-shot, Mo argues, Pip leans back with his arms folded
export const S14: React.FC<ShotProps> = ({ t, len }) => {
  const arm = 100 + Math.sin(t / 2) * 26;
  const mo = poseAt(t, [{ f: 0, p: { x: 740, y: 712, yaw: 0.45, look: 0.8, armL: { a: 14, b: -6 }, armR: { a: arm, b: 40 } } }]);
  const pip = poseAt(t, [{ f: 0, p: { x: 1180, y: 712, yaw: -0.45, look: -0.7, armL: { a: 35, b: 120 }, armR: { a: 35, b: 120 }, tilt: -6 } }]);
  return (
    <g transform={camT(kf(t, [[0, 960], [len, 965]]), 590, kf(t, [[0, 1.5], [len, 1.58]]))}>
      <Study t={t + 200} id="s14st" />
      <Hero look={MO} pose={{ ...mo, ...faceAt(t, [[0, 'oops']]) }} rimId="rimL" shadow={0.5} />
      <Hero look={PIP} pose={{ ...pip, ...faceAt(t, [[0, 'smug']]) }} rimId="rimR" shadow={0.5} />
      <Desk x0={560} x1={1360} y={700} lamp={false} />
    </g>
  );
};

// S15: wide, the street at dusk: Pip hops clean over a puddle the box had already drawn round
export const S15: React.FC<ShotProps> = ({ t, len }) => {
  const jump = clamp((t - 8) / 12);
  const lift = 210 * Math.sin(Math.PI * jump);
  const x = kf(t, [[0, 520], [8, 700], [20, 1250], [len, 1500]]);
  const pose: Pose = { ...basePose, x, y: 905 - LEG_LEN * 0.9 - lift, scale: 0.9, yaw: 0.3, look: 0.5,
    armL: { a: 40 + 60 * Math.sin(Math.PI * jump), b: 30 }, armR: { a: 40 + 60 * Math.sin(Math.PI * jump), b: 30 } };
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.08]]))}>
      <DuskSky id="s15sky" horizonY={620} />
      <Skyline y={620} seed={4} />
      <rect x={-400} y={700} width={2720} height={600} fill="#1B1626" />
      <rect x={-400} y={700} width={2720} height={10} fill="#2E2442" />
      <ellipse cx={980} cy={915} rx={170} ry={30} fill="#5A6FA8" opacity={0.6} />
      <ellipse cx={960} cy={908} rx={90} ry={10} fill="#9DB4F0" opacity={0.5} />
      {t < 14 && <Marquee x={800} y={850} w={360} h={110} t={t - 2} color={CYAN} />}
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'smug']]) }} rimId="rimR" shadow={0.6} />
    </g>
  );
};

// S16: top-down, the blank paper is boxed, the A+ pops in
export const S16: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={`translate(960 540) scale(${1 + t * 0.002}) translate(-960 -540)`}>
    <Tabletop edge={1400} />
    <Glow x={960} y={440} r={720} o={0.3} />
    <Paper x={960} y={540} w={520} rot={-3} done={t >= 11} grade="A+" />
    <Marquee x={680} y={260} w={560} h={560} t={t - 2} color={CYAN} />
    <Sparkle x={1180} y={330} t={t - 11} s={1.6} />
  </g>
);

// S17: medium, low angle on the roof: arms up, sparkles all round, basically a wizard
export const S17: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 900, y: 790, scale: 1.8, yaw: 0.2, look: 0.3, armL: { a: 30, b: 20 }, armR: { a: 30, b: 20 } } },
    { f: 7, p: { armL: { a: 150, b: 16 }, armR: { a: 150, b: 16 }, squash: -0.05 }, ease: easeOut },
  ]);
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.05]]))}>
      <Rooftop t={t + 20} sunX={1250} sunY={560} low={260} />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'happy'], [8, 'smug']]) }} rimId="rimR" shadow={0} />
      <Sparkle x={620} y={420} t={t - 6} s={1.5} />
      <Sparkle x={1240} y={360} t={t - 9} s={1.8} />
      <Sparkle x={820} y={250} t={t - 12} s={1.2} />
      <Sparkle x={1100} y={560} t={t - 14} s={1.4} />
    </g>
  );
};

// S18: close-up, "But here's the catch": Pip, uneasy
export const S18: React.FC<ShotProps> = ({ t, len }) => {
  const sc = 6.6 * (1 + 0.04 * clamp(t / len));
  return (
    <g>
      <g filter="url(#blur16)">
        <g transform="translate(-600 -560) scale(2)"><Rooftop t={t + 120} sunX={980} sunY={600} low={180} /></g>
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill="#07040C" opacity={0.22} />
      <Hero look={PIP} pose={headPose(sc, 960, 720, faceAt(t, [[0, 'smug'], [6, 'worried']]))} rimId="rimR" shadow={0} />
    </g>
  );
};

// S19: the brain lights up on a body outline: 2% of your body
export const S19: React.FC<ShotProps> = ({ t }) => (
  <g>
    <Schematic t={t} id="sch19" />
    <DrawOn d="M 890 280 A 70 70 0 1 1 1030 280 A 70 70 0 1 1 890 280" t={t - 2} dur={8} />
    <DrawOn d="M 960 350 L 960 640 M 960 420 L 860 540 M 960 420 L 1060 540 M 960 640 L 880 830 M 960 640 L 1040 830" t={t - 6} dur={12} />
    <Glow x={960} y={268} r={150} kind="warm" o={0.8 * clamp((t - 10) / 6)} />
    <ellipse cx={960} cy={268} rx={46} ry={34} fill={SCH.live} opacity={clamp((t - 10) / 6)} />
    <SchLabel x={1180} y={290} t={t - 12} text="BRAIN: 2% OF YOUR BODY" size={44} anchor="start" />
  </g>
);

// S20: two bars: 2% of the weight, 20% of the energy
export const S20: React.FC<ShotProps> = ({ t }) => {
  const g = easeOut(clamp((t - 4) / 12));
  return (
    <g>
      <Schematic t={t} id="sch20" />
      <rect x={640} y={820 - 56 * g} width={200} height={56 * g} fill={SCH.dim} />
      <rect x={1080} y={820 - 560 * clamp((t - 14) / 12)} width={200} height={560 * clamp((t - 14) / 12)} fill={SCH.live} />
      <rect x={560} y={820} width={800} height={6} fill={SCH.line} />
      <SchLabel x={740} y={890} t={t - 6} text="WEIGHT: 2%" size={38} />
      <SchLabel x={1180} y={890} t={t - 16} text="ENERGY: 20%" size={38} color={SCH.live} />
    </g>
  );
};

// S21: the brain, a warm glow: 20 W, nonstop
export const S21: React.FC<ShotProps> = ({ t }) => (
  <g>
----- END -----
