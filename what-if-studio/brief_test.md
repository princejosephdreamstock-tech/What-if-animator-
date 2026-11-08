# BRIEF: write one animated episode as 4 files in a ZIP

You write a complete episode for a faceless YouTube channel: flat vector SVG scenes animated with Remotion from a ready kit. You write the narration, shots, cuts, sound plan and shot code. EVERY script already exists on the VM (voice, plan, sound, render, master, run_episode.sh, package.json, registry). You write NONE of them. The VM unzips your zip and runs `bash run_episode.sh <slug>`.

## Topic
your topic

## Pack: promo (UNTESTED DRAFT, treat as a prototype)
Open on a finished sample clip for 4 seconds, no voice. Hook: Say: Still dragging clips on a timeline at midnight? One line on who it is for: faceless creators comfortable with a terminal. One typed topic line goes in and the real stages run, each shown by one picture. The finished video again, held long enough to judge. What you get (the files you own: engine, cast, sets, scripts, guides) and what you bring (your own keys, none included). Call to action. The sample clip is the pipeline's own output, never shown as any channel's video. No earnings, no view counts, no speed claims, no viral. No power field.
About 60 seconds, about 168 spoken words. Call to action: link in about section (if "none": no call to action and no contact details; never invent a link, number or handle).

## Deliverable: <slug>.zip with ONLY these 4 files (paths exact)
src/episodes/<slug>/episode.json, narration.txt, shots.tsx, index.tsx
If you cannot make a zip, reply with each file as `=== FILE: <name> ===` then its text, ending with `=== END ===`, and nothing else.

## Keep the output small (your reply has a hard length limit)
- Write the 4 files once each. No code comments, no read-back, no restating, no explanations, no self-test, no scratch copies. The VM tests it.
- shots.tsx: shared helpers once at the top, each shot 8 to 25 lines, reuse a component with props when a picture repeats, no unused code.
- At most 42 shots, at most 8 distinct sound clips and 24 sound events. episode.json compact, one line per array item.
- Final reply: ONE line with the zip path.

## What the VM does with your files
voice: one ElevenLabs call per script[].text, builds words.json (the time of every spoken word). plan: turns your cues into frames and prints the pace. sound: generates each clip once and places events. Then it renders (silent) and masters to -14 LUFS.

## episode.json
Keys: id (PascalCase), slug, pack, topic, title ["LINE 1","LINE 2"], accent (a short label), script, science, cast, shots, edit, tail, fx, sound. "power" {word, rule, look} for what-if only. Optional: format, minutes, fps, lead, end, gap.
- script: [{"beat","text"}], each text one spoken line of 6 to 18 words, written to be heard (short sentences, plain words, second person, present tense), one idea per line, showable as one picture. First line is a hook.
- science: [{"claim","working","source"}] for EVERY number or fact in the script. Work the arithmetic. Never invent a statistic or promise results.
- shots: [{"id":"S1","size","set","key","note"}]. "set" must be one of the kit sets (listed below) unless the shot is hand-drawn in shots.tsx. No two neighbouring shots share a size and angle.
- edit: [{"shot","at"}], one per cut in time order, first at frame 0. A word cut lands 2 frames before the word.
- fx: [{"at",...}]. sound: {"clips":{name:[prompt,seconds]},"events":[[cue,clip,gain,"onset"|"peak",untilCue?]],"repeats","music","music_alt","levels":{"sfx_lu","music_lu"}} (see the sound reference).
Cues: word, word#2 (second occurrence, counting from the previous cue's word; write plain word when it is spoken once after the previous cue), word+3 (3 frames after), S3+2 (2 frames after shot S3 starts; fx and sound only), +18 (after the previous cut; edit only), s:4.2, f:126. Each shot's cue word must be spoken after the previous shot's cue word. A cue word must be spoken in the script and have no hyphen or plus sign.
narration.txt is the script texts, one line per row, with any asterisks removed. Spacing and a final newline do not matter. Generate it with a script from episode.json, never by hand.
shots.tsx: `export const S1 ... Sn`, one per shot id, built from the kit. index.tsx: `export const <name> = defineEpisode('<Id>', {...})` exactly as in the example, <Id> equal to episode.json "id". Import only from '../../engine' and your own files; never from another episode.

## Hard rules
- Original characters only (Pip is "you", Mo the best friend, sis, mom, suit). No real people, third-party brands or famous characters.
- Never name other creators or channels, never imply any channel uses this pipeline or Claude.
- A hit that illustrates a word lands in the pause AFTER it (4 to 6 frames later), never on it.
- Pace: 27 or more cuts a minute, no hold over about 3 s without action. Cut by changing shot size.
- Never put a key, token or password in a file. No em or en dashes anywhere.
- Before replying, run a script (do not judge by eye) to check: every shot id has an export and an edit entry, every cue word is spoken, narration.txt matches the script text with spacing ignored, every number is in science.

## LOOK (required: this episode must NOT look like the example)
This episode's look is "slate". Use exactly these values. Never copy the example's colours, costumes, set mix or shot compositions.
- At the top of shots.tsx define once:
  const HERO = { ...LOOKS.pip, skin: '#E2B48C', skinShade: '#C99B74', hand: '#E2B48C', jacket: '#7C8CF8', jacketShade: '#5F6FD6', accent: '#F7B267', shoe: '#F7B267', hair: '#20202A' };
  const FRIEND = { ...LOOKS.mo, jacket: '#F7B267', jacketShade: '#D4924A', accent: '#7C8CF8' };
  Pass look={HERO} (or look={FRIEND}) to EVERY <Hero>. Never use the default look or LOOKS.pipHood.
- index.tsx: defineEpisode('<Id>', { timeline, shots, bg: '#12161F', grain: true, vignette: true }).
- Hand-drawn scenes: backgrounds from tones of #12161F, highlights in #F7B267 and #7C8CF8, otherwise only neutral greys and white.
- Variety: at most a quarter of the shots in the same kit set; use at least 3 different kit sets or hand-drawn scenes; vary shot size and camera angle; open on a shot the example does not use.

## STYLE (required): retro-tv
Follow this visual language in every shot. Where it conflicts with the example, this wins. Pace and hold rules still apply.
look: slate
# Style: retro-tv
Mood: a late-night broadcast on an old set.
Hand-drawn scenes: a rounded screen frame, flat colour bars and simple test-card shapes, thin scanline rects drawn once (no filters, no animated blur).
Motion: elements snap on in steps like channel changes; a small timestamp chip counts in a corner.
Camera: mostly static and centred, with hard cuts and one slow push per beat.
On-screen type: FONT.ui in a lower-third strip, short.
Sound: soft tape clicks and a low hum under key lines, kept quiet.
Never: heavy distortion, full-frame blur, text over a busy picture.

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

## Audibility rules (the VM measures them after the sound step)
After sound generation the VM prints, for every event, how many dB the cue adds over the voice and music in a 0.3 s window. A core cue (a reveal, a stamp, a hero hit) must add 4 dB or more. Texture cues add 1 to 3 dB. Under 1 dB is inaudible.
- Pick each sound by its job: motion (whoosh), tension (riser), emphasis (impact or pop), snap (click). Key transitions and reveals only.
- Layer only the 2 or 3 hero moments (a riser into an impact, a whoosh into a pop). Everything else is a single clip.
- Put every deniable cue at a low gain so it can be dropped. Keep at most 24 events.
- Short percussive clips (knock, stamp, click, snap) peak early, so they measure quieter than sustained clips. Give them a higher gain than whooshes.
- Narration is nearly continuous, so a cue sitting fully under speech measures near 0 dB at any gain. Place such cues in the gaps between words or leave them out.
- A noisy texture (static, glitch, hum) cannot be fixed with gain. It reads as noise over speech. Prefer a clean snap, or silence.
- Reuse clips from the SFX LIBRARY section of the brief when one fits (same name, prompt and seconds).
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

----- BEGIN KIT: sets available: bedroom, classroom, kitchen, rooftop, schematic, stairwell, study ; engine exports (src/engine/index.ts) -----
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

----- BEGIN EXAMPLE (promo): episode.json -----
{"id":"PromoPipeline","slug":"promo","pack":"promo","topic":"Promo: one topic line in, one finished animated video out, and what the buyer gets","format":"long","minutes":1,"style":"glimpse60","title":["ONE LINE IN","ONE VIDEO OUT"],"accent":"VIDEO","cast":["pipHood","mo","sis","mom","suit"],"script":[{"beat":"1 hook: the pain","text":"One animated video can feel like a full time job. Writing it. Recording it. Cutting it. Adding sound. Exporting it. Then doing it all again tomorrow."},{"beat":"2 one topic line typed","text":"Now try this. Type one line. What if you could see one minute ahead?"},{"beat":"3 stages: script, voice, shot list, storyboard","text":"The pipeline writes the script. Records the voice. Cuts a shot list on every word. Then draws a storyboard you can check before anything renders."},{"beat":"4 stages: animate, sound, master","text":"Every frame is animated in code. The sound is built to match. And the audio is mastered to minus fourteen LUFS."},{"beat":"5 a finished clip","text":"And out comes this.","pause":4.6},{"beat":"6 what you get and what you bring","text":"You get the full system: the engine, the cast, seven sets, the scripts, and the guides that tie it together. You bring your own ElevenLabs and Claude access. No keys come inside."},{"beat":"7 call to action","text":"One line in. One finished video out. Get the full system. Link in the description."}],"science":[{"claim":"Making one animated video can feel like a full time job.","working":"Opinion, not a statistic: no figure is stated or implied. Kept as a feeling, not a number.","source":"none needed (no number)"},{"claim":"One topic line in, one finished animated video out.","working":"The pipeline takes a topic line and produces a mastered video: script, voice, shot list, storyboard, animation, sound, master.","source":"skill brief SKILL.md, description and section 3"}],"shots":[{"id":"S1","size":"wide","set":"study","key":14,"note":"Pip slumped at the desk"},{"id":"S2","size":"close-up","set":"study (blurred)","key":10,"note":"Pip, tired, face fills the frame"},{"id":"S3","size":"insert, top-down","set":"tabletop","key":20,"note":"a page writing itself, a pile growing"},{"id":"S4","size":"medium","set":"study","key":12,"note":"Mo with headphones, a REC chip"},{"id":"S5","size":"insert","set":"schematic","key":24,"note":"a timeline clip gets cut"},{"id":"S6","size":"insert, close","set":"schematic","key":12,"note":"sound bars pulsing"}],"edit":[{"shot":"S1","at":"f:0"},{"shot":"S2","at":"feel"},{"shot":"S3","at":"Writing"},{"shot":"S4","at":"Recording"},{"shot":"S5","at":"Cutting"},{"shot":"S6","at":"Adding"}],"tail":1.0,"fx":[{"at":"S23+2","kind":"flash","color":"#FFFFFF","o":0.45},{"at":"S38+2","kind":"flash","color":"#FFE7B3","o":0.4}],"sound":{"clips":{"key_tick":["a single crisp mechanical keyboard key click, very short, no voices",0.5],"whoosh":["a short soft airy whoosh transition, no voices",0.6],"pop":["a soft bright digital UI pop, short",0.5],"chime":["a bright short confirmation chime, two soft notes",0.8],"click_cut":["a sharp short click like a clip being cut on an editing timeline",0.5],"thud_soft":["a soft low thud impact, short and muffled",0.8],"title_hit":["a cinematic whoosh rising into a deep boom impact, short",1.4],"music":["light modern upbeat background music for a tech product video, soft plucked synth, gentle beat, 100 bpm, no vocals",17.0]},"events":[["S4-4","pop",0.25],["S5-4","pop",0.25],["S5+21","click_cut",0.5],["S6-4","pop",0.25],["S7-4","pop",0.25],["S7+24","chime",0.35]],"repeats":[{"at":"S10+2","clip":"key_tick","n":16,"every":2,"gain":[0.2,0.35],"pitch":[0.9,1.1]},{"at":"S13+3","clip":"pop","n":8,"every":3,"gain":[0.15,0.3],"pitch":[0.9,1.2]},{"at":"S14+2","clip":"key_tick","n":24,"every":2,"gain":[0.2,0.35],"pitch":[0.9,1.1]},{"at":"S17+3","clip":"pop","n":6,"every":3,"gain":[0.12,0.25],"pitch":[0.9,1.2]},{"at":"S21+8","clip":"click_cut","n":4,"every":5,"gain":[0.25,0.4],"pitch":[0.95,1.05]},{"at":"S28+5","clip":"pop","n":5,"every":3,"gain":[0.15,0.28],"pitch":[0.9,1.2]},{"at":"S30+3","clip":"pop","n":5,"every":2,"gain":[0.12,0.25],"pitch":[0.9,1.2]},{"at":"S31+4","clip":"pop","n":7,"every":3,"gain":[0.12,0.25],"pitch":[0.9,1.2]},{"at":"S32+6","clip":"pop","n":6,"every":3,"gain":[0.12,0.22],"pitch":[1.0,1.3]}],"music":{"clip":"music"},"levels":{"sfx_lu":-6,"music_lu":-12}}}
(shortened for this brief; the real file has {'shots': 39, 'edit': 39, 'fx': 2, 'sound.events': 21})
----- END -----

----- BEGIN EXAMPLE: index.tsx -----
import React from 'react';
import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import * as S from './shots';

// promo: no power look, no custom grade. Shots S25-S28 come from glimpse60 (re-exported in shots.tsx).
const ids = Array.from({ length: 39 }, (_, i) => `S${i + 1}`);
const shots = Object.fromEntries(ids.map((id) => [id, (S as Record<string, React.FC<any>>)[id]]));

export const promo = defineEpisode('PromoPipeline', {
  timeline: timeline as Timeline,
  shots,
});
----- END -----

----- BEGIN EXAMPLE: shots.tsx (first 45 lines: API pattern only, do NOT copy its colours, costumes or composition) -----
import React from 'react';
import {
  Hero, Pose, basePose, poseAt, faceAt, kf, clamp, easeOut, backOut, rnd, camT, LOOKS, LEG_LEN, HEAD,
  Study, Desk, Rooftop, Tabletop, Paper, PaperStack, Glow, Sparkle, DizzyStars, Dial, Gauge, Tag, Toast,
  TitleCard, HudChip, Schematic, SCH, DrawOn, SchLabel, CountUp, Arrow, DuskSky, Skyline, FONT, UI, ShotProps,
} from '../../engine';
import * as N from '../glimpse60/shots';

// promo: one minute that sells the pipeline. Every shot is a pure function of its own clock t.
// Only real output appears: engine sets, the real cast, real file names, and four shots from the glimpse60 episode.
const PIP = LOOKS.pipHood;
const MO = LOOKS.mo;
const MONO = FONT.ui;

const typed = (s: string, t: number, start: number, cps: number) => s.slice(0, Math.max(0, Math.min(s.length, Math.floor((t - start) * cps))));
const pop = (t: number, d: number, n = 8) => backOut(clamp((t - d) / n));
const blinkOn = (t: number) => (Math.floor(t / 8) % 2 === 0 ? 1 : 0);
const pad = (n: number, w: number) => String(Math.max(0, Math.floor(n))).padStart(w, '0');

const headPose = (sc: number, hx: number, hy: number, extra: Partial<Pose> = {}): Pose => ({
  ...basePose, x: hx, y: hy - HEAD.y * sc, scale: sc, yaw: 0.12, look: 0.1, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 }, ...extra,
});
const onGround = (ground: number, sc: number) => ground - LEG_LEN * sc;

// ---------------------------------------------------------------- small parts
const Txt: React.FC<{ x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; o?: number; ls?: number; children: React.ReactNode }> = ({
  x, y, s = 36, c = SCH.line, a = 'middle', o = 1, ls = 2, children,
}) => (
  <text x={x} y={y} textAnchor={a} fontFamily={MONO} fontSize={s} fill={c} opacity={o} letterSpacing={ls} style={{ whiteSpace: 'pre' }}>
    {children}
  </text>
);

const Card: React.FC<{ x: number; y: number; w: number; h: number; label: string; sub?: string; t: number; at?: number; lit?: number; size?: number }> = ({
  x, y, w, h, label, sub, t, at = 0, lit = 0, size = 34,
}) => {
  const k = pop(t, at);
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x + w / 2} ${y + h / 2}) scale(${k}) translate(${-w / 2} ${-h / 2})`}>
      <rect width={w} height={h} rx={20} fill={lit ? '#2B1A12' : '#13213A'} stroke={lit ? SCH.live : SCH.line} strokeWidth={lit ? 5 : 3} />
      <text x={w / 2} y={sub ? h / 2 - 2 : h / 2 + size * 0.35} textAnchor="middle" fontFamily={MONO} fontSize={size} fill={lit ? SCH.glow : SCH.line} letterSpacing={2}>
        {label}
      </text>
      {sub ? (
----- END -----

----- BEGIN SFX LIBRARY (reuse before inventing) -----
A cached clip costs no credits and no wait. To reuse one, copy its name, prompt and seconds into sound.clips CHARACTER FOR CHARACTER. Add a new clip only when none fits, with a generic name.
name | seconds | prompt | LUFS
music | 17.0 | playful quirky cartoon background music, pizzicato strings, glockenspiel and soft bass, light and curious, 110 bpm, no vocals | -12.6
key_tick | 0.5 | a single crisp mechanical keyboard key click, very short, no voices | -27.1
chime | 0.8 | a bright short confirmation chime, two soft notes | -15.6
sparkle | 0.8 | a short bright magical sparkle twinkle, cartoon | -24.8
pop | 0.5 | a cartoon speech bubble pop, short and bright | -57.5
cat_chirp | 0.6 | a cat making a short curious chirp meow | -12.0
title_boom | 1.6 | a cinematic whoosh rising into a deep boom impact | -11.7
drone_hit | 2.6 | a dark ominous low drone hit, deep cinematic horror sting | -8.8
bulb_pop | 0.5 | a small light bulb popping out, a tiny glass tink and fizz | -52.2
room_tone | 12.5 | quiet indoor room tone in the evening, faint distant city hum, no voices | -66.4
roof_wind | 7.0 | a gentle evening breeze on a city rooftop, distant traffic | -40.1
select_draw | 0.6 | a quick digital selection sound, a soft rising electronic shimmer as a box is drawn on screen, short | -26.6
counter_tick | 1.6 | a fast mechanical counter ticking up rapidly, digits rolling over, getting faster | -20.4
whoosh | 0.6 | a short soft airy whoosh transition, no voices | -23.9
gasp | 0.8 | two young people gasping in surprise at the same moment, cartoon, short | -20.3
glitch | 1.5 | a short digital glitch, an electric buzz and crackle flickering like an unstable hologram | -7.6
power_hum | 3.0 | a deep electrical power grid hum swelling louder, transformers buzzing, rising | -14.2
power_down | 2.5 | a whole city losing power, a deep electrical power-down whine dropping in pitch into silence | -10.4
switch_off | 0.5 | a heavy electrical breaker switching off with a dull clunk | -15.9
glimpse_hum | 0.7 | a soft electronic hum rising and falling, like a sensor charging, short, cartoon | -9.2
glimpse_pop | 0.6 | a bright cyan magical pop as a future image locks in, a soft shimmering whoosh into a pop | -46.2
bus_brake | 1.0 | a city bus air brakes hissing, doors folding open with a pneumatic sigh | -10.3
footsteps_sprint | 0.8 | quick sprinting footsteps on concrete, three to four steps, urgent | -20.6
mug_clink | 0.5 | a ceramic coffee mug caught by a hand, soft clink and thud of ceramic on skin | -42.4
----- END -----
