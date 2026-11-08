import React from 'react';
import {
  Hero, Pose, basePose, poseAt, faceAt, kf, clamp, easeOut, rnd, camT, LOOKS, LEG_LEN, HEAD,
  Classroom, SchoolDesk, Study, Desk, Kitchen, FONT, ShotProps,
} from '../../engine';

const HERO = { ...LOOKS.pip, skin: '#F2D2B6', skinShade: '#DDB898', hand: '#F2D2B6', jacket: '#9BC53D', jacketShade: '#7BA02B', accent: '#E8E1CF', shoe: '#E8E1CF', hair: '#3A2A1C' };
const FRIEND = { ...LOOKS.mo, jacket: '#C97B4A', jacketShade: '#A8613A', accent: '#9BC53D' };

const BG = '#0D1F17';
const CH = '#E8E1CF';
const HI = '#9BC53D';
const DIM = '#8E9A92';
const ease = (t: number, a: number, b: number) => easeOut(clamp((t - a) / (b - a)));
const typed = (s: string, t: number, a: number, cps: number) => s.slice(0, Math.max(0, Math.min(s.length, Math.floor(((t - a) * cps) / 30))));
const wb = (x1: number, y1: number, x2: number, y2: number, s: number) =>
  `M${x1} ${y1} Q${(x1 + x2) / 2 + (rnd(s, 0) - 0.5) * 12} ${(y1 + y2) / 2 + (rnd(s, 1) - 0.5) * 12} ${x2} ${y2}`;
const kp = (x: number, sc: number, extra: Partial<Pose> = {}): Pose => ({ ...basePose, x, y: 790 - LEG_LEN * sc, scale: sc, ...extra });

const Line: React.FC<{ d: string; p: number; w?: number; c?: string }> = ({ d, p, w = 6, c = CH }) => (
  <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp(p)} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={p > 0 ? 1 : 0} />
);
const Ring: React.FC<{ cx: number; cy: number; rx: number; ry: number; p: number; c?: string }> = ({ cx, cy, rx, ry, p, c = CH }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp(p)} stroke={c} strokeWidth={6} strokeLinecap="round" fill="none" opacity={p > 0 ? 1 : 0} />
);
const Txt: React.FC<{ x: number; y: number; s?: number; c?: string; o?: number; a?: 'start' | 'middle' | 'end'; children: React.ReactNode }> = ({ x, y, s = 64, c = CH, o = 1, a = 'middle', children }) => (
  <text x={x} y={y} textAnchor={a} fontFamily={FONT.ui} fontSize={s} fill={c} opacity={o} letterSpacing={3}>{children}</text>
);
const Board: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <g>
    <rect x={-400} y={-300} width={2720} height={1680} fill={BG} />
    <rect x={80} y={70} width={1760} height={940} rx={28} fill="#13291F" stroke="#3A4A41" strokeWidth={14} />
    {children}
  </g>
);
const Tick: React.FC<{ x: number; y: number; p: number }> = ({ x, y, p }) => <Line d={`M${x} ${y} L${x + 24} ${y + 28} L${x + 70} ${y - 36}`} p={p} w={10} c={HI} />;
const Chip: React.FC<{ x: number; y: number; label: string; k?: number }> = ({ x, y, label, k = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${Math.max(k, 0.001)})`}>
    <rect x={-160} y={-34} width={320} height={68} rx={14} fill="#13291F" stroke={CH} strokeWidth={3} />
    <circle cx={-126} cy={0} r={9} fill={HI} />
    <Txt x={-100} y={11} s={30} a="start">{label}</Txt>
  </g>
);

export const S1: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, yaw: -0.35, look: -0.4, armR: { a: 28, b: -100 }, armL: { a: 28, b: -100 } } },
    { f: 18, p: { armL: { a: 80, b: -40 }, headTilt: 0.1 }, ease: easeOut },
    { f: 34, p: { armL: { a: 50, b: -70 }, headTilt: -0.06 } },
    { f: 52, p: { armL: { a: 28, b: -100 }, headTilt: 0 } },
  ]);
  const face = faceAt(t, [[0, 'smug'], [60, 'cool']]);
  return (
    <g transform={camT(kf(t, [[0, 1000], [len, 1040]]), 540, kf(t, [[0, 1.0], [len, 1.12]]))}>
      <Classroom t={t + 40} id="s1" />
      <Hero look={HERO} pose={{ ...pose, ...face }} rimId="rimL" shadow={0} />
      <SchoolDesk x={1260} />
    </g>
  );
};

export const S2: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 960], [len, 900]]), 540, kf(t, [[0, 1.15], [len, 1.35]]))}>
    <Board>
      <Txt x={300} y={420} s={50} c={DIM} a="start" o={ease(t, 0, 8)}>TOPIC</Txt>
      <Line d={wb(290, 470, 1630, 470, 1)} p={ease(t, 0, 10)} c={DIM} w={4} />
      <Txt x={340} y={585} s={104} a="start">{typed('how tides work', t, 10, 15) + (Math.floor(t / 8) % 2 === 0 ? '_' : '')}</Txt>
      <Line d={wb(300, 650, 1100, 650, 2)} p={ease(t, 40, 56)} c={HI} />
      <Ring cx={1380} cy={585} rx={150} ry={64} p={ease(t, 50, 66)} c={HI} />
      <Txt x={1380} y={604} s={52} c={HI} o={ease(t, 50, 58)}>1 LINE</Txt>
    </Board>
  </g>
);

export const S3: React.FC<ShotProps> = ({ t, len }) => {
  const keys = Array.from({ length: 10 }, (_, i) => ({ f: i * 6, p: { armR: { a: i % 2 ? 40 : 62, b: -70 }, armL: { a: i % 2 ? 62 : 40, b: -70 } } }));
  const pose = poseAt(t, [{ f: 0, p: { x: 960, y: 712, yaw: 0.3, look: 0.5, ...keys[0].p } }, ...keys.slice(1)]);
  const face = faceAt(t, [[0, 'neutral'], [30, 'happy']]);
  return (
    <g transform={camT(kf(t, [[0, 980], [len, 960]]), 560, kf(t, [[0, 1.6], [len, 1.8]]))}>
      <Study t={t + 80} id="s3" />
      <Hero look={FRIEND} pose={{ ...pose, ...face }} rimId="rimR" shadow={0} />
      <Desk x0={560} x1={1360} y={700} />
      <Chip x={1180} y={330} label={t < 30 ? 'SCRIPT' : 'SHOT LIST'} k={t < 30 ? ease(t, 2, 10) : ease(t, 30, 38)} />
    </g>
  );
};

const ROWS = ['SCRIPT', 'SHOT LIST', 'CUTS', 'SOUND PLAN'];
export const S4: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 960], [len, 1000]]), kf(t, [[0, 540], [len, 640]]), kf(t, [[0, 1.2], [len, 1.7]]))}>
    <Board>
      {ROWS.map((r, i) => {
        const a = i < 2 ? 0 : 6 + (i - 2) * 22;
        const y = 300 + i * 170;
        const o = i < 2 || (i === 2 && t >= 28) ? 0.3 : 1;
        return (
          <g key={r} opacity={o}>
            <Txt x={460} y={y} s={92} a="start" o={i < 2 ? 1 : ease(t, a, a + 8)}>{r}</Txt>
            <Tick x={300} y={y - 24} p={i < 2 ? 1 : ease(t, a + 8, a + 20)} />
          </g>
        );
      })}
      <Ring cx={770} cy={780} rx={400} ry={90} p={ease(t, 40, 54)} c={HI} />
    </Board>
  </g>
);

export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [{ f: 0, p: kp(900, 0.9, { yaw: 0.55, look: 0.5 }) }, { f: 24, p: { headTilt: 0.08 } }, { f: 48, p: { headTilt: -0.05 } }]);
  const face = faceAt(t, [[0, 'neutral'], [12, 'happy']]);
  return (
    <g transform={camT(kf(t, [[0, 1000], [len, 1030]]), 570, kf(t, [[0, 1.6], [len, 1.75]]))}>
      <Kitchen t={t + 60} id="s5" />
      <Hero look={FRIEND} pose={{ ...pose, ...face }} rimId="rimR" shadow={0} />
      <Line d="M1090 790 L1090 585" p={1} w={8} c={DIM} />
      <ellipse cx={1090} cy={550} rx={26} ry={46} fill="#C9CFCB" stroke={CH} strokeWidth={4} />
      <circle cx={1070} cy={552} r={58} fill="none" stroke={CH} strokeWidth={3} opacity={0.6} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const h = 24 + 70 * Math.abs(Math.sin((t + i * 5) / 6));
        return <rect key={i} x={1220 + i * 30} y={600 - h} width={16} height={h} rx={5} fill={HI} />;
      })}
      <Chip x={1000} y={310} label="RECORDING" k={ease(t, 2, 10)} />
    </g>
  );
};

export const S6: React.FC<ShotProps> = ({ t, len }) => {
  const code = ['<svg>', '<path d="tree" />', '<Frame n={i} />'];
  const parts = ['M1350 760 L1350 640', 'M1230 650 L1350 480 L1470 650 Z', 'M1250 540 L1350 380 L1450 540 Z', 'M1275 440 L1350 300 L1425 440 Z', 'M1100 760 L1600 760'];
  return (
    <g transform={camT(kf(t, [[0, 960], [len, 1100]]), kf(t, [[0, 540], [len, 480]]), kf(t, [[0, 1.0], [len, 1.3]]))}>
      <Board>
        {code.map((c, i) => <Txt key={c} x={200} y={330 + i * 120} s={54} c={i === 2 ? HI : CH} a="start">{typed(c, t, 4 + i * 14, 30)}</Txt>)}
        <rect x={1000} y={200} width={700} height={620} rx={12} fill="none" stroke={DIM} strokeWidth={4} />
        {parts.map((d, i) => <Line key={d} d={d} p={ease(t, 6 + i * 10, 18 + i * 10)} w={i === 0 ? 14 : 7} c={i === 4 ? DIM : i === 0 ? CH : HI} />)}
        <Ring cx={1550} cy={300} rx={40} ry={40} p={ease(t, 50, 64)} />
        <Txt x={1000} y={900} s={48} c={DIM} a="start">{`FRAME ${String(Math.floor(t) + 1).padStart(4, '0')}`}</Txt>
      </Board>
    </g>
  );
};

export const S7: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [{ f: 0, p: { x: 960, y: 712, yaw: 0.4, look: 0.3 } }, { f: 20, p: { headTilt: 0.08 } }, { f: 44, p: { headTilt: -0.05 } }]);
  const face = faceAt(t, [[0, 'cool'], [36, 'happy']]);
  const hy = 712 + HEAD.y;
  return (
    <g transform={camT(kf(t, [[0, 975], [len, 985]]), hy, kf(t, [[0, 3.2], [len, 3.7]]))}>
      <Study t={t + 120} id="s7" />
      <Hero look={FRIEND} pose={{ ...pose, ...face }} rimId="rimR" shadow={0} />
      <g transform={`translate(1130 ${hy + 70})`}>
        {[0, 1, 2, 3, 4].map((i) => {
          const h = 80 * ease(t, i * 3, 14 + i * 3) + 26 * Math.sin((t + i * 4) / 3) * (1 - ease(t, 30, 44));
          return <rect key={i} x={i * 26} y={-h} width={16} height={h} rx={4} fill={HI} />;
        })}
        <Line d="M-10 -80 L140 -80" p={1} w={4} c={CH} />
        <Tick x={60} y={-120} p={ease(t, 40, 52)} />
      </g>
    </g>
  );
};

export const S8: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [{ f: 0, p: { x: 1260, y: 760, yaw: -0.35, look: -0.6, armR: { a: 20, b: -30 }, armL: { a: 20, b: -30 } } }, { f: 24, p: { headTilt: 0.07 } }]);
  const face = faceAt(t, [[0, 'smug'], [14, 'shock'], [34, 'happy']]);
  const u = t / len;
  return (
    <g transform={camT(kf(t, [[0, 900], [len, 820]]), 450, kf(t, [[0, 1.25], [len, 1.55]]))}>
      <Classroom t={t + 90} id="s8" />
      <clipPath id="c8"><rect x={426} y={196} width={628} height={328} /></clipPath>
      <g clipPath="url(#c8)">
        <rect x={426} y={196} width={628} height={328} fill="#1A3828" />
        <circle cx={560 + 300 * u} cy={310 - 40 * u} r={36} fill={CH} />
        <path d="M426 470 Q600 400 760 460 T1054 440 V524 H426Z" fill="#244A35" />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${470 + i * 120} 484 L${504 + i * 120 + Math.sin((t + i * 7) / 9) * 5} 404 L${538 + i * 120} 484Z`} fill={HI} />)}
        <rect x={426} y={510} width={628 * u} height={14} fill={CH} />
      </g>
      <rect x={426} y={196} width={628} height={328} fill="none" stroke={CH} strokeWidth={6} />
      <Hero look={HERO} pose={{ ...pose, ...face }} rimId="rimL" shadow={0} />
      <SchoolDesk x={1260} />
    </g>
  );
};

const Key: React.FC<{ cx: number; cy: number; p: number; label: string; o: number }> = ({ cx, cy, p, label, o }) => (
  <g opacity={o}>
    <Ring cx={cx} cy={cy} rx={56} ry={56} p={clamp(p * 2)} />
    <Line d={`M${cx + 56} ${cy} L${cx + 330} ${cy} M${cx + 250} ${cy} L${cx + 250} ${cy + 56} M${cx + 310} ${cy} L${cx + 310} ${cy + 44}`} p={clamp(p * 2 - 0.6)} />
    <Txt x={cx + 170} y={cy + 150} s={54} o={clamp(p * 3 - 2)}>{label}</Txt>
  </g>
);
export const S9: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.1]]))}>
    <Board>
      <Key cx={280} cy={380} p={ease(t, 4, 28)} label="VOICE" o={t >= 30 ? 0.4 : 1} />
      <Key cx={1000} cy={380} p={ease(t, 30, 54)} label="WRITING" o={t >= 60 ? 0.4 : 1} />
      <Txt x={960} y={780} s={90} c={HI} o={ease(t, 60, 70)}>YOUR OWN KEYS</Txt>
      <Line d={wb(520, 810, 1400, 810, 3)} p={ease(t, 64, 80)} c={HI} />
      <Line d="M520 900 L580 960 M580 900 L520 960" p={ease(t, 76, 86)} w={8} />
      <Txt x={640} y={950} s={56} a="start" o={ease(t, 76, 86)}>NONE INCLUDED</Txt>
    </Board>
  </g>
);

export const S10: React.FC<ShotProps> = ({ t, len }) => {
  const mo = poseAt(t, [{ f: 0, p: kp(1160, 0.9, { yaw: -0.4, look: -0.3, handL: 'point', armL: { a: 20, b: 0 } }) }, { f: 10, p: { armL: { a: 145, b: 0 } }, ease: easeOut }]);
  const pip = poseAt(t, [{ f: 0, p: kp(800, 0.9, { yaw: 0.35, look: 0.3, armR: { a: 20, b: -20 } }) }, { f: 30, p: { headTilt: 0.07 } }]);
  return (
    <g transform={camT(960, kf(t, [[0, 540], [len, 520]]), kf(t, [[0, 1.45], [len, 1.55]]))}>
      <Kitchen t={t + 150} id="s10" />
      <Hero look={HERO} pose={{ ...pip, ...faceAt(t, [[0, 'happy']]) }} rimId="rimR" shadow={0} />
      <Hero look={FRIEND} pose={{ ...mo, ...faceAt(t, [[0, 'happy']]) }} rimId="rimR" shadow={0} />
      <g opacity={ease(t, 4, 12)}>
        <rect x={560} y={190} width={800} height={110} rx={16} fill="#13291F" stroke={CH} strokeWidth={5} />
        <Txt x={960} y={262} s={52}>LINK IN THE ABOUT SECTION</Txt>
      </g>
    </g>
  );
};
