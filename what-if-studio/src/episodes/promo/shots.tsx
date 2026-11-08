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
        <text x={w / 2} y={h / 2 + size * 0.95} textAnchor="middle" fontFamily={MONO} fontSize={size * 0.58} fill={SCH.dim} letterSpacing={2}>
          {sub}
        </text>
      ) : null}
    </g>
  );
};

const Term: React.FC<{ x: number; y: number; w: number; h: number; title: string; children?: React.ReactNode }> = ({ x, y, w, h, title, children }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width={w} height={h} rx={26} fill="#0A111F" stroke={SCH.dim} strokeWidth={3} />
    <rect width={w} height={70} rx={26} fill="#16243D" />
    <rect y={40} width={w} height={30} fill="#16243D" />
    <circle cx={40} cy={35} r={9} fill="#FF5A4A" />
    <circle cx={74} cy={35} r={9} fill="#FFC857" />
    <circle cx={108} cy={35} r={9} fill="#5BE08A" />
    <text x={w / 2} y={45} textAnchor="middle" fontFamily={MONO} fontSize={28} fill={SCH.dim} letterSpacing={3}>
      {title}
    </text>
    {children}
  </g>
);

const TypeLines: React.FC<{ x: number; y: number; lines: { s: string; c?: string }[]; t: number; cps?: number; size?: number; lh?: number; start?: number }> = ({
  x, y, lines, t, cps = 1.4, size = 36, lh = 52, start = 0,
}) => {
  let at = start;
  return (
    <g>
      {lines.map((l, i) => {
        const s0 = at;
        at += l.s.length / cps + 2;
        const shown = typed(l.s, t, s0, cps);
        const active = shown.length > 0 && shown.length < l.s.length;
        return (
          <text key={i} x={x} y={y + i * lh} fontFamily={MONO} fontSize={size} fill={l.c ?? SCH.line} style={{ whiteSpace: 'pre' }}>
            {shown}
            {active && blinkOn(t) ? '_' : ''}
          </text>
        );
      })}
    </g>
  );
};

const Tick: React.FC<{ x: number; y: number; t: number; at?: number; s?: number }> = ({ x, y, t, at = 0, s = 1 }) => {
  const m = clamp((t - at) / 5);
  if (m <= 0) return null;
  return <path d={`M ${x} ${y} l ${14 * s} ${16 * s} l ${30 * s} ${-30 * s}`} fill="none" stroke={UI.good} strokeWidth={8 * s} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={90 * s} strokeDashoffset={90 * s * (1 - m)} />;
};

const slow = (t: number, len: number, a = 1, b = 1.05) => kf(t, [[0, a], [len, b]]);
const SchCam: React.FC<{ t: number; len: number; id: string; z0?: number; z1?: number; cx?: number; cy?: number; children?: React.ReactNode }> = ({ t, len, id, z0 = 1, z1 = 1.05, cx = 960, cy = 540, children }) => (
  <g transform={camT(cx, cy, slow(t, len, z0, z1))}>
    <Schematic t={t} id={id} />
    {children}
  </g>
);

// a tiny storyboard picture: dusk sky, a sun, a ground line, a figure
const Mini: React.FC<{ x: number; y: number; w: number; h: number; n: number; t: number; at: number; label?: string }> = ({ x, y, w, h, n, t, at, label }) => {
  const k = pop(t, at);
  if (k <= 0) return null;
  const sx = w * (0.2 + 0.12 * n);
  return (
    <g transform={`translate(${x + w / 2} ${y + h / 2}) scale(${k}) translate(${-w / 2} ${-h / 2})`}>
      <rect width={w} height={h} rx={14} fill="#3B2A5A" stroke={SCH.line} strokeWidth={3} />
      <rect y={h * 0.7} width={w} height={h * 0.3} rx={0} fill="#1B1626" />
      <circle cx={w * 0.78} cy={h * 0.42} r={h * 0.13} fill="#FF9A4A" opacity={0.9} />
      <circle cx={sx} cy={h * 0.52} r={h * 0.07} fill="#F2D2A9" />
      <rect x={sx - h * 0.06} y={h * 0.58} width={h * 0.12} height={h * 0.2} rx={6} fill="#2E2B3D" />
      {label ? (
        <text x={16} y={34} fontFamily={MONO} fontSize={26} fill={SCH.line} letterSpacing={2}>
          {label}
        </text>
      ) : null}
    </g>
  );
};

// ---------------------------------------------------------------- 1. the pain
// S1: wide, the study, Pip slumped at the desk
export const S1: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [{ f: 0, p: { x: 960, y: 712, yaw: 0.2, look: 0.3, tilt: -5, headTilt: -8, armL: { a: 14, b: -6 }, armR: { a: 55, b: 30 } } }]);
  return (
    <g transform={camT(960, 560, slow(t, len, 0.95, 1.03))}>
      <Study t={t + 40} id="p1" />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'tired']]) }} rimId="rimR" shadow={0} />
      <Desk x0={560} x1={1360} y={700} />
    </g>
  );
};

// S2: close-up, tired
export const S2: React.FC<ShotProps> = ({ t, len }) => {
  const sc = 5.6 * (1 + 0.04 * clamp(t / len));
  return (
    <g>
      <g filter="url(#blur16)">
        <g transform="translate(-600 -560) scale(2)"><Study t={t + 60} id="p2" /></g>
      </g>
      <rect width={1920} height={1080} fill="#07040C" opacity={0.25} />
      <Hero look={PIP} pose={headPose(sc, 960, 700, faceAt(t, [[0, 'tired']]))} rimId="rimR" shadow={0} />
    </g>
  );
};

// S3: top-down, a page writing itself, a pile growing
export const S3: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={`translate(960 540) rotate(${-1.5 + t * 0.04}) scale(${1 + t * 0.002}) translate(-960 -540)`}>
    <Tabletop edge={1400} />
    <Glow x={900} y={460} r={720} o={0.3} />
    <Paper x={820} y={540} w={520} rot={-3} done={false} fill={clamp(t / 22)} />
    <PaperStack x={1450} y={650} n={Math.min(9, 2 + Math.floor(t / 4))} w={260} />
  </g>
);

// S4: medium, Mo with headphones, a REC chip
export const S4: React.FC<ShotProps> = ({ t, len }) => {
  const arm = 90 + Math.sin(t / 2) * 20;
  const pose = poseAt(t, [{ f: 0, p: { x: 1000, y: 712, yaw: -0.3, look: -0.4, armL: { a: 14, b: -6 }, armR: { a: arm, b: 40 } } }]);
  return (
    <g transform={camT(990, 580, slow(t, len, 1.6, 1.7))}>
      <Study t={t + 120} id="p4" />
      <Hero look={MO} pose={{ ...pose, ...faceAt(t, [[0, 'happy']]) }} rimId="rimL" shadow={0} />
      <Desk x0={560} x1={1360} y={700} lamp={false} />
      <g transform="translate(990 580) scale(0.6) translate(-990 -580)"><HudChip x={760} y={310} f={t} label="REC" icon="dot" /></g>
    </g>
  );
};

// S5: a timeline gets cut
export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const head = kf(t, [[0, 240], [20, 960]], easeOut);
  const gap = clamp((t - 18) / 5) * 26;
  return (
    <SchCam t={t} len={len} id="p5" z0={1.1} z1={1.2}>
      <Txt x={960} y={250} s={44} c={SCH.dim}>TIMELINE</Txt>
      {[0, 1].map((row) => (
        <g key={row} transform={`translate(0 ${440 + row * 170})`}>
          <rect x={240 - 0} y={0} width={Math.min(720 - gap / 2, 720) + (row ? 120 : 0) - (row ? 0 : 0)} height={120} rx={14} fill={row ? '#2F4B7A' : '#7A4B2F'} stroke={SCH.line} strokeWidth={3} />
          <rect x={960 + gap / 2 + (row ? 120 : 0)} y={0} width={720 - gap / 2 - (row ? 120 : 0)} height={120} rx={14} fill={row ? '#7A4B2F' : '#2F4B7A'} stroke={SCH.line} strokeWidth={3} />
        </g>
      ))}
      <rect x={head - 3} y={380} width={6} height={400} fill={SCH.live} />
      <path d={`M ${head - 22} 372 L ${head + 22} 372 L ${head} 402 Z`} fill={SCH.live} />
      <SchLabel x={960} y={850} t={t - 16} text="CUT" size={70} color={SCH.glow} />
    </SchCam>
  );
};

// S6: sound, bars
export const S6: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p6" z0={1.0} z1={1.08}>
    <Txt x={960} y={250} s={44} c={SCH.dim}>SOUND</Txt>
    {Array.from({ length: 44 }, (_, i) => {
      const h = 30 + 220 * Math.abs(Math.sin(i * 0.55 + t * 0.3)) * (0.35 + 0.65 * rnd(3, i));
      return <rect key={i} x={260 + i * 36} y={560 - h / 2} width={22} height={h} rx={8} fill={i % 7 === 0 ? SCH.live : SCH.line} opacity={i % 7 === 0 ? 1 : 0.75} />;
    })}
  </SchCam>
);

// S7: export bar fills to 100
export const S7: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p7" z0={1.0} z1={1.06}>
    <Gauge x={560} y={500} w={800} p={kf(t, [[0, 0], [20, 1]], easeOut)} label="EXPORT" danger={2} />
    <CountUp x={960} y={760} t={t} to={100} dur={20} size={140} suffix="%" />
  </SchCam>
);

// S8: medium, Pip face down on the desk, dizzy
export const S8: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 712, yaw: 0.3, look: 0.2, armL: { a: 14, b: -6 }, armR: { a: 55, b: 30 } } },
    { f: 8, p: { tilt: 22, headTilt: 14, armR: { a: 75, b: 0 } }, ease: easeOut },
  ]);
  return (
    <g transform={camT(960, 590, slow(t, len, 1.5, 1.6))}>
      <Study t={t + 90} id="p8" />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'worried'], [8, 'dizzy']]) }} rimId="rimR" shadow={0} />
      <Desk x0={560} x1={1360} y={700} />
      <DizzyStars x={1010} y={500} t={t - 8} />
    </g>
  );
};

// S9: wide, the rooftop, Pip points at us
export const S9: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 900, y: onGround(830, 1), yaw: 0.25, look: 0.5, armL: { a: 14, b: -6 }, armR: { a: 20, b: 20 } } },
    { f: 7, p: { armR: { a: 105, b: 10 }, handR: 'point' }, ease: easeOut },
  ]);
  return (
    <g transform={camT(960, 540, slow(t, len, 1.0, 1.08))}>
      <Rooftop t={t + 30} sunX={1250} sunY={560} />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [6, 'smug']]) }} rimId="rimR" shadow={0.6} />
      <Sparkle x={1010} y={420} t={t - 10} s={1.3} />
    </g>
  );
};

// ---------------------------------------------------------------- 2. one line
const TOPIC = '> What if you could see one minute ahead?';
// S10: a terminal, the line starts to type
export const S10: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p10" z0={1.0} z1={1.05}>
    <Term x={260} y={250} w={1400} h={580} title="NEW EPISODE">
      <Txt x={60} y={170} s={30} c={SCH.dim} a="start">TOPIC</Txt>
      <TypeLines x={60} y={260} lines={[{ s: TOPIC, c: SCH.glow }]} t={t} cps={1.0} size={44} />
    </Term>
  </SchCam>
);

// S11: the same line, tight, finished, ENTER
export const S11: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p11" z0={1.45} z1={1.55} cx={860} cy={540}>
    <Term x={260} y={250} w={1400} h={580} title="NEW EPISODE">
      <Txt x={60} y={170} s={30} c={SCH.dim} a="start">TOPIC</Txt>
      <text x={60} y={260} fontFamily={MONO} fontSize={44} fill={SCH.glow} style={{ whiteSpace: 'pre' }}>
        {TOPIC}
        {blinkOn(t) ? '_' : ''}
      </text>
    </Term>
    <Toast x={1500} y={760} t={t - 12} text="ENTER" hold={30} />
  </SchCam>
);

// S12: wide, the premise on the title card
export const S12: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [{ f: 0, p: { x: 700, y: 712, yaw: 0.4, look: 0.5, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 } } }]);
  return (
    <g transform={camT(960, 540, slow(t, len, 0.95, 1.0))}>
      <Study t={t + 200} id="p12" />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'happy']]) }} rimId="rimR" shadow={0.6} />
      <Desk x0={900} x1={1500} y={700} lamp={false} />
      <TitleCard t={t} lines={['WHAT IF YOU COULD', 'SEE ONE MINUTE AHEAD?']} accent="MINUTE" accentT={20} size={92} y={170} />
    </g>
  );
};

// ---------------------------------------------------------------- 3. the stages
const STAGES = ['SCRIPT', 'VOICE', 'SHOT LIST', 'STORYBOARD', 'SELF-CHECK', 'ANIMATE', 'SOUND', 'MASTER'];
// S13: the eight steps pop on
export const S13: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p14" z0={1.0} z1={1.06}>
    <Txt x={960} y={240} s={52} c={SCH.dim}>THE PIPELINE</Txt>
    {STAGES.map((s, i) => (
      <Card key={s} x={215 + (i % 4) * 400} y={330 + Math.floor(i / 4) * 230} w={360} h={170} label={s} sub={`STEP ${i + 1}`} t={t} at={1 + i * 1.5} lit={i === 0 && t > 4 ? 1 : 0} size={36} />
    ))}
  </SchCam>
);

// S14: step 1, the script, typed as real episode.json fields
export const S14: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p15" z0={1.05} z1={1.12} cx={960} cy={560}>
    <Term x={240} y={200} w={1440} h={700} title="episode.json">
      <TypeLines
        x={50} y={150} t={t} cps={9} size={36} lh={58}
        lines={[
          { s: '{ "pack": "what-if",' },
          { s: '  "topic": "What if you could see one minute ahead?",', c: SCH.glow },
          { s: '  "script": [ { "beat": "1 cold open", "text": "..." } ],' },
          { s: '  "science": [ { "claim": "...", "source": "..." } ],' },
          { s: '  "shots": [ ... ], "edit": [ ... ], "sound": { ... } }' },
        ]}
      />
    </Term>
  </SchCam>
);

// S15: step 2, the voice, a waveform draws on
const wavePath = () => {
  let d = 'M 260 540';
  for (let i = 1; i <= 80; i++) d += ` L ${260 + i * 17.5} ${540 + Math.sin(i * 0.9) * (30 + 150 * rnd(5, i)) * (i % 2 ? 1 : -1)}`;
  return d;
};
const WAVE = wavePath();
export const S15: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p16" z0={1.0} z1={1.07}>
    <DrawOn d={WAVE} t={t} dur={20} color={SCH.line} width={5} />
    <Txt x={960} y={300} s={56} c={SCH.glow}>voice.wav</Txt>
    <Toast x={960} y={820} t={t - 18} text="words.json" hold={40} />
  </SchCam>
);

// S16: step 3, macro on the timeline: cuts land two frames before each word
const CHIPS = ['One', 'animated', 'video', 'can', 'feel'];
export const S16: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p17" z0={1.18} z1={1.28} cx={985} cy={540}>
    <Txt x={960} y={380} s={34} c={SCH.dim}>plan.py</Txt>
    {CHIPS.map((w, i) => {
      const x = 200 + i * 300;
      const k = pop(t, 2 + i * 3);
      return (
        <g key={w} opacity={k > 0 ? 1 : 0}>
          <rect x={x} y={500} width={270} height={110} rx={16} fill="#13213A" stroke={SCH.line} strokeWidth={3} />
          <Txt x={x + 135} y={570} s={38}>{w}</Txt>
          <rect x={x - 8} y={470} width={5} height={170} fill={SCH.live} opacity={clamp((t - 4 - i * 3) / 3)} />
        </g>
      );
    })}
    <Txt x={960} y={720} s={34} c={SCH.glow} o={clamp((t - 16) / 6)}>CUT LANDS 2 FRAMES EARLY</Txt>
  </SchCam>
);

// S17: step 4, six storyboard stills
export const S17: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p18" z0={1.0} z1={1.06}>
    <Txt x={960} y={170} s={48} c={SCH.dim}>STORYBOARD</Txt>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <Mini key={i} x={200 + (i % 3) * 540} y={230 + Math.floor(i / 3) * 360} w={480} h={300} n={i} t={t} at={2 + i * 3} label={`S${i + 1}`} />
    ))}
  </SchCam>
);

// S18: close-up, one still checked
export const S18: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p19" z0={1.0} z1={1.08}>
    <Mini x={380} y={170} w={1000} h={620} n={2} t={t} at={0} label="S3" />
    <Tag x={1560} y={560} t={t - 6} text="OK" mark="check" markT={10} w={170} />
    <Txt x={960} y={900} s={36} c={SCH.dim}>BEFORE ANYTHING RENDERS</Txt>
  </SchCam>
);

// ---------------------------------------------------------------- 4. animate, sound, master
// S19: a film strip rolls past, a frame counter runs
export const S19: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p20" z0={1.0} z1={1.05}>
    <g transform={`translate(${-t * 26} 0)`}>
      {Array.from({ length: 8 }, (_, i) => (
        <Mini key={i} x={60 + i * 340} y={330} w={300} h={190} n={i % 6} t={99} at={0} />
      ))}
    </g>
    <Txt x={960} y={700} s={90} c={SCH.live}>{`FRAME ${pad(t * 9, 4)}`}</Txt>
  </SchCam>
);

// S20: medium, code on the left makes the picture on the right
const CODE = [
  'export const S4 = ({ t }) => {',
  '  const pose = poseAt(t, [',
  '    { f: 0, p: { x: 900, yaw: 0.4 } },',
  '    { f: 8, p: { armR: { a: 150 } } },',
  '  ]);',
  '  return <Hero pose={pose} />;',
  '};',
];
export const S20: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [{ f: 0, p: { x: 960, y: 712, yaw: 0.3, look: 0.4, armL: { a: 14, b: -6 }, armR: { a: 70 + 40 * Math.sin(t / 3), b: 20 } } }]);
  return (
    <SchCam t={t} len={len} id="p21" z0={1.0} z1={1.05}>
      <Term x={90} y={210} w={900} h={620} title="shots.tsx">
        <TypeLines x={40} y={140} lines={CODE.map((s) => ({ s }))} t={t} cps={7} size={30} lh={58} />
      </Term>
      <clipPath id="p21clip"><rect x={1060} y={250} width={780} height={439} rx={20} /></clipPath>
      <g clipPath="url(#p21clip)">
        <g transform="translate(1060 250) scale(0.406)">
          <Study t={t + 10} id="p21s" />
          <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'happy']]) }} rimId="rimR" shadow={0} />
          <Desk x0={560} x1={1360} y={700} lamp={false} />
        </g>
      </g>
      <rect x={1060} y={250} width={780} height={439} rx={20} fill="none" stroke={SCH.line} strokeWidth={4} />
    </SchCam>
  );
};

// S21: low insert, sound hits sit on the cuts
export const S21: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p22" z0={1.1} z1={1.0}>
    <Txt x={960} y={290} s={48} c={SCH.glow}>sfx.py</Txt>
    {Array.from({ length: 40 }, (_, i) => {
      const h = 20 + 120 * Math.abs(Math.sin(i * 0.7 + t * 0.2)) * (0.3 + 0.7 * rnd(8, i));
      return <rect key={i} x={260 + i * 38} y={600 - h / 2} width={20} height={h} rx={7} fill={SCH.line} opacity={0.6} />;
    })}
    {[0, 1, 2, 3].map((i) => (
      <g key={i} opacity={clamp((t - 4 - i * 5) / 4)}>
        <rect x={380 + i * 370} y={440} width={5} height={320} fill={SCH.live} />
        <path d={`M ${382 + i * 370} 800 l 22 22 l -22 22 l -22 -22 Z`} fill={SCH.glow} />
      </g>
    ))}
  </SchCam>
);

// S22: close-up dial, mastered to minus fourteen LUFS
export const S22: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p23" z0={1.0} z1={1.07}>
    <Dial x={960} y={500} r={240} size={84} p={kf(t, [[0, 0], [22, 0.72]], easeOut)} readout="-14 LUFS" />
    <Txt x={960} y={860} s={38} c={SCH.dim} o={clamp((t - 14) / 6)}>TRUE PEAK UNDER -1 dBTP</Txt>
  </SchCam>
);

// ---------------------------------------------------------------- 5. a finished clip
// S23: slate, a play button
export const S23: React.FC<ShotProps> = ({ t, len }) => {
  const k = pop(t, 1, 10);
  return (
    <g>
      <rect x={-400} y={-400} width={2720} height={1880} fill="#07040C" />
      <g transform={`translate(960 500) scale(${0.9 + 0.1 * k}) translate(-960 -500)`}>
        <rect x={410} y={230} width={1100} height={619} rx={28} fill="#14102A" stroke={SCH.line} strokeWidth={5} />
        <path d="M 880 400 L 880 680 L 1100 540 Z" fill={SCH.live} />
      </g>
      <Txt x={960} y={930} s={44} c={SCH.dim} o={clamp((t - 6) / 6)}>A REAL EPISODE, DRAWN BY THIS ENGINE</Txt>
    </g>
  );
};
// S24-S27: four shots from the glimpse60 episode, as rendered by this engine
export const S24 = N.S15;
export const S25 = N.S16;
export const S26 = N.S17;
export const S27 = N.S11;

// ---------------------------------------------------------------- 6. what you get
// S28: the full system, five slots
const PARTS = ['ENGINE', 'CAST', '7 SETS', 'SCRIPTS', 'GUIDES'];
export const S28: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p29" z0={1.0} z1={1.06}>
    <SchLabel x={960} y={330} t={t} text="THE FULL SYSTEM" size={110} color={SCH.glow} />
    {PARTS.map((s, i) => (
      <Card key={s} x={110 + i * 340} y={520} w={320} h={150} label={s} t={t} at={4 + i * 3} size={34} />
    ))}
  </SchCam>
);

// S29: the engine
export const S29: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p30" z0={1.0} z1={1.06}>
    <Card x={460} y={220} w={1000} h={200} label="ENGINE" sub="src/engine" t={t} at={0} lit={1} size={80} />
    {['rig.tsx', 'props.tsx', 'light.tsx', 'room.tsx', 'ui.tsx'].map((f, i) => (
      <SchLabel key={f} x={300 + i * 330} y={620} t={t - 6 - i * 3} text={f} size={36} color={SCH.dim} />
    ))}
  </SchCam>
);

// S30: the cast lines up
const CAST: { look: typeof PIP; name: string; sc: number; yaw: number }[] = [
  { look: LOOKS.pipHood, name: 'PIP', sc: 0.95, yaw: 0.3 },
  { look: LOOKS.mo, name: 'MO', sc: 0.95, yaw: 0.2 },
  { look: LOOKS.sis, name: 'SIS', sc: 0.68, yaw: 0.1 },
  { look: LOOKS.mom, name: 'MOM', sc: 0.95, yaw: -0.2 },
  { look: LOOKS.suit, name: 'SUIT', sc: 0.95, yaw: -0.3 },
];
export const S30: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, slow(t, len, 1.0, 1.06))}>
    <rect x={-400} y={-400} width={2720} height={1880} fill="#14102A" />
    <rect x={-400} y={800} width={2720} height={600} fill="#1B1626" />
    <rect x={-400} y={800} width={2720} height={8} fill="#2E2442" />
    {CAST.map((c, i) => {
      const pose = poseAt(t, [{ f: 0, p: { x: 360 + i * 300, y: onGround(800, c.sc), scale: c.sc, yaw: c.yaw, look: 0.2, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 } } }]);
      const sw = Math.sin(t / 5 + i) * 3;
      return (
        <g key={c.name} opacity={clamp((t - i) / 2)}>
          <Hero look={c.look} pose={{ ...pose, tilt: sw, ...faceAt(t, [[0, 'happy']]) }} rimId="rimR" shadow={0.5} />
          <Txt x={360 + i * 300} y={880} s={34} c={SCH.dim}>{c.name}</Txt>
        </g>
      );
    })}
  </g>
);

// S31: seven sets
const SETS: [string, string][] = [['STUDY', '#5B3A6B'], ['STAIRWELL', '#3B4E6B'], ['CLASSROOM', '#6B4B3A'], ['ROOFTOP', '#E58A4A'], ['KITCHEN', '#3E7C77'], ['BEDROOM', '#2F3E6B'], ['SCHEMATIC', '#101A2A']];
export const S31: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p32" z0={1.0} z1={1.06}>
    {SETS.map(([name, col], i) => {
      const x = i < 4 ? 110 + i * 440 : 330 + (i - 4) * 440;
      const y = i < 4 ? 250 : 590;
      const k = pop(t, 1 + i * 3);
      if (k <= 0) return null;
      return (
        <g key={name} transform={`translate(${x + 190} ${y + 115}) scale(${k}) translate(-190 -115)`}>
          <rect width={380} height={230} rx={18} fill={col} stroke={SCH.line} strokeWidth={3} />
          <rect x={30} y={30} width={120} height={80} rx={8} fill="#FFD9A0" opacity={0.55} />
          <rect y={150} width={380} height={80} rx={0} fill="#000" opacity={0.3} />
          <Txt x={190} y={205} s={30}>{name}</Txt>
        </g>
      );
    })}
  </SchCam>
);

// S32: the scripts, each with a tick
const SCRIPTS = ['voice.py', 'plan.py', 'stills.mjs', 'board.py', 'sfx.py', 'master.py'];
export const S32: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p33" z0={1.05} z1={1.12}>
    <Term x={360} y={190} w={1200} h={700} title="scripts/">
      {SCRIPTS.map((s, i) => (
        <g key={s} opacity={clamp((t - 2 - i * 3) / 3)}>
          <Txt x={110} y={170 + i * 82} s={46} a="start">{s}</Txt>
          <Tick x={940} y={170 + i * 82 - 8} t={t} at={4 + i * 3} />
        </g>
      ))}
    </Term>
  </SchCam>
);

// S33: low angle, the guides fan out
const GUIDES = ['formula', 'look', 'kit', 'sound', 'traps'];
export const S33: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p34" z0={1.0} z1={1.06}>
    {GUIDES.map((g, i) => {
      const k = easeOut(clamp((t - i * 3) / 10));
      const rot = (i - 2) * 16 * k;
      return (
        <g key={g} transform={`translate(960 980) rotate(${rot})`}>
          <rect x={-170} y={-720} width={340} height={470 + 150} rx={18} fill="#F6EFE3" stroke="#1A1230" strokeWidth={4} />
          <rect x={-130} y={-600} width={200} height={14} fill="#B9AE9C" />
          <rect x={-130} y={-560} width={260} height={10} fill="#D6CCBA" />
          <rect x={-130} y={-530} width={240} height={10} fill="#D6CCBA" />
          <text x={0} y={-690} textAnchor="middle" fontFamily={MONO} fontSize={40} fill="#1A1230">{g}</text>
          <text x={0} y={-650} textAnchor="middle" fontFamily={MONO} fontSize={26} fill="#7A6F60">.md</text>
        </g>
      );
    })}
  </SchCam>
);

// S34: you bring your own access
export const S34: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p35" z0={1.0} z1={1.06}>
    <Card x={200} y={300} w={640} h={260} label="ELEVENLABS" sub="YOUR OWN ACCESS" t={t} at={0} lit={1} size={58} />
    <Card x={1080} y={300} w={640} h={260} label="CLAUDE" sub="YOUR OWN ACCESS" t={t} at={5} lit={1} size={58} />
    <Tag x={520} y={760} t={t - 12} text="YOURS" mark="check" markT={16} w={300} />
    <Tag x={1400} y={760} t={t - 16} text="YOURS" mark="check" markT={20} w={300} />
  </SchCam>
);

// S35: close-up, a key with a line through it
export const S35: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p36" z0={1.1} z1={1.2}>
    <circle cx={800} cy={470} r={110} fill="none" stroke={SCH.line} strokeWidth={22} />
    <rect x={900} y={455} width={420} height={30} rx={8} fill={SCH.line} />
    <rect x={1180} y={485} width={30} height={80} rx={6} fill={SCH.line} />
    <rect x={1250} y={485} width={30} height={60} rx={6} fill={SCH.line} />
    <DrawOn d="M 640 700 L 1380 250" t={t - 4} dur={10} color={UI.bad} width={22} />
    <SchLabel x={960} y={880} t={t - 8} text="NO KEYS INSIDE" size={90} color={SCH.glow} />
  </SchCam>
);

// ---------------------------------------------------------------- 7. call to action
// S36: ONE LINE IN
export const S36: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p37" z0={1.0} z1={1.08}>
    <SchLabel x={960} y={500} t={t} text="ONE LINE IN" size={150} color={SCH.glow} />
    <rect x={400} y={560} width={1120} height={8} fill={SCH.line} opacity={0.6 * clamp((t - 4) / 8)} />
    <Txt x={960} y={650} s={40} c={SCH.dim} o={clamp((t - 8) / 6)}>{TOPIC}</Txt>
  </SchCam>
);

// S37: a finished video, the play bar full
export const S37: React.FC<ShotProps> = ({ t, len }) => {
  const prog = kf(t, [[0, 0.1], [len, 1]]);
  return (
    <g transform={camT(960, 540, slow(t, len, 1.0, 1.05))}>
      <rect x={-400} y={-400} width={2720} height={1880} fill="#07040C" />
      <clipPath id="p38clip"><rect x={310} y={170} width={1300} height={731} rx={26} /></clipPath>
      <g clipPath="url(#p38clip)">
        <DuskSky id="p38sky" x0={310} y0={170} w={1300} h={731} horizonY={620} />
        <Skyline y={650} seed={7} />
        <rect x={310} y={720} width={1300} height={200} fill="#1B1626" />
      </g>
      <rect x={310} y={170} width={1300} height={731} rx={26} fill="none" stroke={SCH.line} strokeWidth={5} />
      <rect x={350} y={850} width={1220} height={12} rx={6} fill="#ffffff" opacity={0.2} />
      <rect x={350} y={850} width={1220 * prog} height={12} rx={6} fill={SCH.live} />
      <Txt x={960} y={970} s={60} c={SCH.glow} o={clamp((t - 4) / 6)}>ONE FINISHED VIDEO OUT</Txt>
    </g>
  );
};

// S38: wide, the rooftop, Pip waves, GET THE FULL SYSTEM
export const S38: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: onGround(830, 1.05), scale: 1.05, yaw: 0.15, look: 0.2, armL: { a: 14, b: -6 }, armR: { a: 20, b: 20 } } },
    { f: 8, p: { armR: { a: 150 + 14 * Math.sin(t / 3), b: 20 } }, ease: easeOut },
  ]);
  return (
    <g transform={camT(960, 540, slow(t, len, 1.0, 1.05))}>
      <Rooftop t={t + 60} sunX={1380} sunY={600} />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'happy']]) }} rimId="rimR" shadow={0.6} />
      <TitleCard t={t} lines={['GET THE', 'FULL SYSTEM']} accent="SYSTEM" accentT={22} size={124} y={190} />
    </g>
  );
};

// S39: the link line, an arrow down
export const S39: React.FC<ShotProps> = ({ t, len }) => (
  <SchCam t={t} len={len} id="p40" z0={1.0} z1={1.06}>
    <SchLabel x={960} y={420} t={t} text="LINK IN THE" size={120} color={SCH.line} />
    <SchLabel x={960} y={570} t={t - 3} text="DESCRIPTION" size={150} color={SCH.glow} />
    <Arrow x0={960} y0={680} x1={960} y1={930} t={t - 8} dur={10} color={SCH.glow} />
  </SchCam>
);
