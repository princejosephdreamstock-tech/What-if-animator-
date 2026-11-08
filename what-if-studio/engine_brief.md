# BRIEF: write the THEME PATCH for the animation engine (cast colours, palettes, fonts)

Today every episode looks identical because the look is hard-coded in the engine: the cast colours (LOOKS and C in rig.tsx),
the dusk and night palettes (D and N in kit.tsx) and the typefaces (fonts.ts). You write a small patch that makes all three
configurable from a theme.json, with the CURRENT values as the defaults, so an episode with no theme renders exactly as today.
You write code only. The user applies it on their VM and tests it there. You cannot render here.

## The design (follow it, it keeps the patch small)
1. NEW file src/engine/theme.ts exports:
   - `type Theme` (schema below) and `applyTheme(theme?: Theme): void`.
   - At first import it takes a deep snapshot of the defaults of C, D, N, LOOKS and FONT.
   - applyTheme FIRST restores every live object from that snapshot (Object.assign in place, never reassign the exports), THEN applies the
     theme's overrides in place. This matters: one bundle holds many episodes, and themes must never leak from one episode into the next.
   - Validate colours with /^#[0-9A-Fa-f]{6}$/. Bad or unknown keys are skipped with a console.warn naming the key. Never throw.
   - Fonts: a static map of whitelisted Google fonts, each imported from '@remotion/google-fonts/<Name>' and loaded (loadFont) only when
     chosen. Use the family name that loadFont returns. title: BricolageGrotesque (default), Anton, Oswald, Poppins. ui: FragmentMono (default),
     JetBrainsMono, SpaceMono. hand: Kalam (default), Caveat, PatrickHand. If you are not sure a module exists, still list it and say so in your reply.
2. In episode.tsx: EpisodeProps gets `theme?: Theme`. `Episode` and `Board` call applyTheme(theme) at the top of their render (before any child renders),
   and use theme.bg, theme.grain, theme.vignette when given (they override the props of the same name). defineEpisode passes the theme through.
3. Existing code keeps reading D.x, N.x, C.x, LOOKS[name], FONT.x as today. Do NOT touch sets, props, ui, furnish, light or room unless a
   module-level constant is computed from D, N or C at import time (it would ignore the theme); if you find one, fix it by reading the value inside
   the component instead, and list it in your reply. You only have the top of rig.tsx and kit.tsx, so say which files the user must grep:
   `grep -n "= D\.\|= N\.\|= C\." src/engine/*.tsx src/engine/sets/*.tsx` at module level.
4. Episodes pick a theme in their own index.tsx: `import theme from '../../themes/<name>.json'` then `defineEpisode('<Id>', { ..., theme })`.

## theme.json schema (every key optional, {} means the defaults)
{ "name": "string",
  "bg": "#hex", "grain": true, "vignette": true,
  "palette": { "skin","skinShade","ink","jacket","jacketShade","shoe","orange","limb": "#hex" },          // overrides C
  "dusk":  { "skyTop","skyMid","horizon","sun","warm","rim","night": "#hex" },                                // overrides D
  "night": { "skyTop","skyMid","horizon","moon","moonShade","glow","rim": "#hex" },                           // overrides N
  "cast":  { "pip|pipHood|pipInk|mo|sis|mom|suit": { "skin","skinShade","hand","jacket","jacketShade","accent","limb","line","shoe","face","hair": "#hex" } },  // partial overrides of LOOKS
  "fonts": { "title": "Anton", "ui": "FragmentMono", "hand": "Kalam" } }

## Deliverable: ONE zip, patch.zip, paths relative to the studio folder
- src/engine/theme.ts (new, complete)
- patch_engine.py (Python 3, stdlib only). It edits the existing files by EXACT string replacement: for each edit it asserts the old text occurs exactly
  once (else prints which edit failed and exits without writing anything), skips an edit whose new text is already present (so it can rerun), and copies
  src/engine to src/engine.bak first if that folder does not exist. Do not rewrite whole existing files: send only the small replacements. Copy the old
  strings character for character from the sources below.
- themes/default.json ({"name":"default"}), themes/night-indigo.json and themes/sunrise-green.json: two complete themes that look CLEARLY different
  from today (different jackets, skin tones, shoes and sky colours for every cast member, one different font each) and from each other.
- references/theme.md: at most 45 lines for the writer Claude who makes episodes: the schema, how to pick a theme, and one rule: keep a channel's cast
  colours the same across its episodes.
- scripts/check_theme.py: `python3 scripts/check_theme.py themes/x.json` prints every bad key or colour, exits 1 on any.
- TEST.md: the exact commands to test: `npx tsc --noEmit`, `python3 patch_engine.py`, a one-line edit pointing the promo index.tsx at a theme, and
  `npx remotion still src/index.ts PromoPipeline out/theme_test.png --frame=300`.

## Rules
- Write each file once. No read-back, no restating files, no long explanations. Do not retype any engine file you are not changing.
- If you have a code sandbox, make scratch copies from the sources below and run patch_engine.py once against them, plus `python3 -m py_compile`. If you have
  none, re-check every old string against the text below.
- No new dependencies beyond @remotion/google-fonts (already installed). No secrets in any file. No em or en dashes in any text.
- Defaults must reproduce today's look exactly: same hex values, same fonts.

## Reply (6 lines or fewer)
What is in the zip, any font module you are unsure exists, any module-level constant you found or could not check, and anything you could not verify.

## SOURCES (the current files)

----- BEGIN src/engine/rig.tsx (first 70 lines: C, Look, CastName, LOOKS) -----
import React from 'react';
import { lerp, easeInOut } from './anim';

// The cast, drawn entirely in code: one rig, and a costume (a Look) per character. Every character is built
// once here, so they look identical in every shot: that's the "drawn, not guessed" point. Original
// characters only: never a channel's own hero or anything that resembles a famous cartoon character.

export const C = {
  skin: '#F6EFE3',
  skinShade: '#E2D3BE',
  ink: '#1D2033',
  jacket: '#F2B33D',
  jacketShade: '#D4922A',
  shoe: '#2FB7A6',
  orange: '#FF8A3D',
  limb: '#EFE2CC',
};

/** A costume for the rig: the same body and animation, different colours and one optional extra piece. */
export type Look = {
  skin: string;
  skinShade: string;
  hand: string;
  jacket: string;
  jacketShade: string;
  accent: string;
  limb: string;
  line: string;
  shoe: string;
  face: string;
  hair: string;
  extra?: 'hood' | 'curls' | 'bunches' | 'bob' | 'suit';
};
export type CastName = 'pip' | 'pipHood' | 'pipInk' | 'mo' | 'sis' | 'mom' | 'suit';
export const LOOKS: Record<CastName, Look> = {
  // A: Pip as built
  pip: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: C.jacket, jacketShade: C.jacketShade, accent: C.jacketShade, limb: C.limb, line: C.ink, shoe: C.shoe, face: C.ink, hair: C.ink },
  // B: Pip in a dark hoodie with mustard drawstrings: the body goes dark and catches the rim light, the head stays the brightest thing
  pipHood: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#2E2B3D', jacketShade: '#24212F', accent: C.jacket, limb: '#2E2B3D', line: '#121019', shoe: C.shoe, face: C.ink, hair: C.ink, extra: 'hood' },
  // C: a dark head with light features, the genre's high-contrast convention, in Pip's mustard
  pipInk: { skin: '#26232F', skinShade: '#1C1A24', hand: '#26232F', jacket: C.jacket, jacketShade: C.jacketShade, accent: C.jacketShade, limb: '#26232F', line: '#121019', shoe: C.shoe, face: '#F6EFE3', hair: '#26232F' },
  // Mo, Pip's friend: a second recurring character with his own costume (curly hair, headphones round his neck)
  mo: { skin: '#C98E68', skinShade: '#B07A58', hand: '#C98E68', jacket: '#5E6E46', jacketShade: '#4C5A38', accent: '#E9C46A', limb: '#3A3446', line: '#1A1622', shoe: '#D9534F', face: C.ink, hair: '#2A1C18', extra: 'curls' },
  // the formula's recurring cast (beats 5 and 6): Pip's little sister (draw her at about 0.7 of Pip's scale), his mum,
  // and the man in a suit who notices the power. All three are ours: plain shapes, no famous silhouettes.
  sis: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#3E8C86', jacketShade: '#2F6E69', accent: '#F28C6A', limb: '#3A3446', line: '#14121C', shoe: '#F28C6A', face: C.ink, hair: '#3A2620', extra: 'bunches' },
  mom: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#8A5A6A', jacketShade: '#704858', accent: '#E9C46A', limb: '#3A3446', line: '#14121C', shoe: '#5A4A6A', face: C.ink, hair: '#5A3226', extra: 'bob' },
  suit: { skin: '#D9C6AE', skinShade: '#C2AE96', hand: '#D9C6AE', jacket: '#2B2F3A', jacketShade: '#20232C', accent: '#A8323E', limb: '#2B2F3A', line: '#0E0F14', shoe: '#14151A', face: C.ink, hair: '#17141A', extra: 'suit' },
};

// ---------- the hero ----------
/** Mitten hands: open (a palm and a thumb) or pointing (a fist with the index finger out). */
export type HandKind = 'open' | 'point';
export type Expr = 'neutral' | 'happy' | 'smug' | 'shock' | 'worried' | 'oops' | 'cool' | 'dizzy' | 'tired';
export type Limb = { a: number; b: number }; // a: upper segment angle, b: bend of the lower segment (degrees)
export type Pose = {
  x: number;
  y: number; // hip point
  scale: number;
  facing: 1 | -1;
  tilt: number; // torso lean around the hips, degrees, + leans screen-right
  spin: number; // whole-body rotation around the chest (tumbles)
  headTilt: number;
  armL: Limb;
  armR: Limb;
  legL: Limb;
  legR: Limb;
  expr: Expr;
  blink: number; // 0 open, 1 shut
  look: number; // -1..1 eye offset
----- END -----

----- BEGIN src/engine/kit.tsx (first 32 lines: the D dusk and N night palettes) -----
import React from 'react';

// The dusk lighting kit for v2 (see STYLE-SPEC.md, Look A): light does most of the work.
// Back-lit sky with a low sun and slow rays, bloom, haze, bokeh, window light shafts,
// rim-light filters per light direction, and depth-of-field blurs.

export const D = {
  skyTop: '#25184A',
  skyMid: '#6E3A6E',
  horizon: '#F2985A',
  sun: '#FFE7B3',
  warm: '#FFB45E',
  rim: '#FFB15A',
  night: '#120E26',
};

/** The night palette: a deep blue sky with a cool moon, for episodes set after dark (lamps and screens do the work). */
export const N = {
  skyTop: '#060A1C',
  skyMid: '#111A3E',
  horizon: '#33305E',
  moon: '#F1F3FF',
  moonShade: '#C6CEEC',
  glow: '#9FC0FF',
  rim: '#A9C6FF',
};

const rnd = (seed: number, i: number) => Math.abs(Math.sin(seed * 31.7 + i * 12.9898) * 43758.5453) % 1;

/** Filters shared by every shot: rim light from the left or right, blurs for depth of field. */
export const KitDefs: React.FC = () => (
  <defs>
----- END -----

----- BEGIN src/engine/fonts.ts -----
import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import { loadFont as loadBricolage } from '@remotion/google-fonts/BricolageGrotesque';
import { loadFont as loadMono } from '@remotion/google-fonts/FragmentMono';
import { loadFont as loadHand } from '@remotion/google-fonts/Kalam';
import { STUDIO } from '../studio.config';

// Three faces: a heavy display face for the title card, a mono for on-screen readouts (timers, labels, chips),
// and a handwriting face for chalk and notes. The Google faces load at render time (they need a connection);
// a local title face from studio.config.ts loads from public/ and works offline.

loadBricolage('normal', { weights: ['600', '700', '800'], subsets: ['latin'] });
loadMono('normal', { weights: ['400'], subsets: ['latin'] });
loadHand('normal', { weights: ['400', '700'], subsets: ['latin'] });
if (STUDIO.titleFont) loadFont({ family: STUDIO.titleFont.family, url: staticFile(STUDIO.titleFont.file), weight: STUDIO.titleFont.weight });

export const FONT = {
  title: STUDIO.titleFont ? STUDIO.titleFont.family : 'Bricolage Grotesque',
  ui: 'Fragment Mono',
  hand: 'Kalam',
};
----- END -----

----- BEGIN src/engine/episode.tsx -----
import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { clamp, lerp } from './anim';
import { KitDefs } from './kit';
import { SetDefs } from './light';

// The episode engine. An episode is a set of shots plus a timeline (written by scripts/plan.py from the voice's word
// timings). Each shot is a pure function of its own clock t, so the edit can cut back to a shot, hold it, or play it
// backwards: a segment just says which stretch of the shot's clock it shows.

export type Seg = {
  shot: string; // shot id (S1, S2...)
  a: number; // first global frame
  b: number; // first frame after it
  t0: number; // the shot's clock at a
  t1: number; // the shot's clock at b (smaller than t0 when the segment plays backwards)
  look?: string; // a named power look (rewind, freeze...) the episode defines: grade + overlay while it runs
  line?: string; // the words spoken over it (for the storyboard)
};
export type ShotInfo = { id: string; size: string; key: number; len: number; first: number; line?: string; note?: string };
export type Fx = { f: number; kind: 'flash' | 'shake'; color?: string; o?: number; len?: number; amp?: number };
export type Timeline = {
  slug: string;
  title: string;
  fps: number;
  total: number;
  segments: Seg[];
  shots: ShotInfo[];
  fx: Fx[];
  audio: { voice?: string; sfx?: string; music?: string; voiceVol?: number; sfxVol?: number; musicVol?: number };
};

/** What every shot receives: its own clock t, how long its clock runs (len), and the global frame f. */
export type ShotProps = { t: number; len: number; f: number };
export type ShotMap = Record<string, React.FC<ShotProps>>;

/** A power look: a CSS grade on the picture and an overlay on top while segments with this look run. */
export type LookDef = {
  grade?: (lv: number) => string;
  jitter?: number; // sideways picture jitter in px at full strength
  Overlay?: React.FC<{ f: number; lv: number; p: number; n: number }>; // p: progress through this run, n: which run (0, 1, 2...)
};

const segAt = (tl: Timeline, f: number) => tl.segments.find((s) => f >= s.a && f < s.b) ?? tl.segments[tl.segments.length - 1];
const clockAt = (s: Seg, f: number) => (s.t1 - s.t0 === s.b - s.a ? s.t0 + (f - s.a) : lerp(s.t0, s.t1, (f - s.a) / (s.b - s.a)));

/** Runs of neighbouring segments sharing a look, so a look spanning two shots doesn't blink at the cut. */
const lookRuns = (tl: Timeline) => {
  const runs: { look: string; a: number; b: number; n: number }[] = [];
  const count: Record<string, number> = {};
  for (const s of tl.segments) {
    if (!s.look) continue;
    const last = runs[runs.length - 1];
    if (last && last.look === s.look && last.b === s.a) last.b = s.b;
    else {
      runs.push({ look: s.look, a: s.a, b: s.b, n: count[s.look] ?? 0 });
      count[s.look] = (count[s.look] ?? 0) + 1;
    }
  }
  return runs;
};

const fxAt = (tl: Timeline, f: number) => {
  let flash: { color: string; o: number } | null = null;
  let x = 0;
  let y = 0;
  for (const e of tl.fx) {
    if (e.kind === 'flash') {
      if (f === e.f) flash = { color: e.color ?? '#FFFFFF', o: e.o ?? 0.85 };
      else if (f === e.f + 1) flash = { color: e.color ?? '#FFFFFF', o: (e.o ?? 0.85) * 0.35 };
    } else if (e.kind === 'shake') {
      const len = e.len ?? 8;
      const amp = e.amp ?? 12;
      if (f >= e.f && f < e.f + len) {
        const k = amp * (1 - (f - e.f) / len);
        x += Math.sin(f * 2.9) * k;
        y += Math.cos(f * 3.7) * k * 0.7;
      }
    }
  }
  return { flash, x, y };
};

/** Vignette and a fine grain that changes on twos, to take the vector edge off (the genre's finish). */
const Grade: React.FC<{ f: number; grain: boolean; vignette: boolean }> = ({ f, grain, vignette }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    <defs>
      <radialGradient id="epVig" cx="50%" cy="50%" r="75%">
        <stop offset="55%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000" stopOpacity={0.55} />
      </radialGradient>
      <filter id="epGrain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(f / 2) % 97} />
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0" />
      </filter>
    </defs>
    {vignette ? <rect width="1920" height="1080" fill="url(#epVig)" /> : null}
    {grain ? <rect width="1920" height="1080" filter="url(#epGrain)" /> : null}
  </svg>
);

/** One shot drawn in the shared defs (filters, gradients), in a 1920 x 1080 world. */
export const ShotFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080">
    <KitDefs />
    <SetDefs />
    {children}
  </svg>
);

export type EpisodeProps = { timeline: Timeline; shots: ShotMap; looks?: Record<string, LookDef>; grain?: boolean; vignette?: boolean; bg?: string };

export const Episode: React.FC<EpisodeProps> = ({ timeline: tl, shots, looks = {}, grain = true, vignette = true, bg = '#0E0C1E' }) => {
  const f = useCurrentFrame();
  const seg = segAt(tl, f);
  const Shot = shots[seg.shot];
  const info = tl.shots.find((s) => s.id === seg.shot);
  const run = lookRuns(tl).find((r) => f >= r.a && f < r.b);
  const def = run ? looks[run.look] : undefined;
  const lv = run ? Math.min(clamp((f - run.a + 1) / 2), clamp((run.b - f) / 2)) : 0;
  const jitter = def?.jitter && lv > 0 ? Math.sin(f * 13.7) * def.jitter * lv : 0;
  const { flash, x, y } = fxAt(tl, f);
  const A = tl.audio;
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <AbsoluteFill style={{ transform: `translate(${x + jitter}px, ${y}px) scale(${x || y ? 1.02 : 1})`, filter: def?.grade && lv > 0 ? def.grade(lv) : undefined }}>
        <ShotFrame>{Shot ? <Shot t={clockAt(seg, f)} len={info?.len ?? seg.b - seg.a} f={f} /> : null}</ShotFrame>
      </AbsoluteFill>
      <Grade f={f} grain={grain} vignette={vignette} />
      {def?.Overlay && run ? (
        <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, opacity: lv }}>
          <def.Overlay f={f} lv={lv} p={clamp((f - run.a) / (run.b - run.a))} n={run.n} />
        </svg>
      ) : null}
      {flash ? <AbsoluteFill style={{ backgroundColor: flash.color, opacity: flash.o }} /> : null}
      {A.voice ? <Audio src={staticFile(A.voice)} volume={A.voiceVol ?? 1} /> : null}
      {A.sfx ? <Audio src={staticFile(A.sfx)} volume={A.sfxVol ?? 1} /> : null}
      {A.music ? <Audio src={staticFile(A.music)} volume={A.musicVol ?? 1} /> : null}
    </AbsoluteFill>
  );
};

/** The storyboard: frame i is shot i at its key frame, no audio, no look. Render it with scripts/stills.mjs. */
export const Board: React.FC<{ timeline: Timeline; shots: ShotMap; grain?: boolean; vignette?: boolean; bg?: string }> = ({ timeline: tl, shots, grain = true, vignette = true, bg = '#0E0C1E' }) => {
  const f = useCurrentFrame();
  const info = tl.shots[Math.min(f, tl.shots.length - 1)];
  const Shot = shots[info.id];
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <ShotFrame>{Shot ? <Shot t={info.key} len={info.len} f={info.first + info.key} /> : null}</ShotFrame>
      <Grade f={info.key} grain={grain} vignette={vignette} />
    </AbsoluteFill>
  );
};

/** Bundle an episode for the registry: the main composition and its storyboard. */
export const defineEpisode = (id: string, p: EpisodeProps) => ({
  id,
  total: p.timeline.total,
  shotCount: p.timeline.shots.length,
  Main: () => <Episode {...p} />,
  Board: () => <Board timeline={p.timeline} shots={p.shots} grain={p.grain} vignette={p.vignette} bg={p.bg} />,
});
export type EpisodeDef = ReturnType<typeof defineEpisode>;
----- END -----

----- BEGIN src/engine/index.ts -----
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

----- BEGIN src/studio.config.ts -----
// The studio's settings. Every episode renders at this size and frame rate.
export const STUDIO = {
  fps: 30,
  width: 1920,
  height: 1080,
  /**
   * A local display face for titles, as a file in public/ (your brand font, say). null uses Bricolage Grotesque
   * from Google Fonts. Example: { family: 'My Brand Font', file: 'fonts/MyBrandFont.woff2', weight: '200 700' }
   */
  titleFont: null as null | { family: string; file: string; weight: string },
};
----- END -----

----- BEGIN src/episodes/promo/index.tsx (how an episode wires itself) -----
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

