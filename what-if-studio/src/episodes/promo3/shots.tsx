import React from 'react';
import { Hero, Pose, basePose, poseAt, faceAt, kf, clamp, easeOut, backOut, camT, LOOKS, LEG_LEN, HEAD, Schematic, FONT, ShotProps } from '../../engine';

const HERO = { ...LOOKS.pip, skin: '#C98E68', skinShade: '#B07A58', hand: '#C98E68', jacket: '#2BA6A0', jacketShade: '#1F837E', accent: '#F26B5B', shoe: '#F26B5B', hair: '#1A1A22' };
const FRIEND = { ...LOOKS.mo, jacket: '#F2C14E', jacketShade: '#C99A2E', accent: '#2BA6A0' };

const BG = '#0A1E2C', PANEL = '#0F2A3B', GRID = '#17374B', GRID2 = '#1F4A63', LN = '#E8F1F3', TL = '#2BA6A0', CO = '#F26B5B', DIM = '#7E9BA8';
const NODES = [['TOPIC', 'ONE LINE'], ['WRITE', 'CLAUDE'], ['VOICE', 'RECORDED'], ['RENDER', 'IN CODE'], ['MASTER', 'AUDIO'], ['VIDEO', 'FINISHED']];
const NX = (i: number) => 95 + i * 300;

const pop = (t: number, d: number, n = 8) => backOut(clamp((t - d) / n));
const dr = (t: number, d: number, n = 16) => easeOut(clamp((t - d) / n));
const typed = (s: string, t: number, d: number, cps: number) => s.slice(0, Math.max(0, Math.min(s.length, Math.floor((t - d) * cps))));
const figure = (x: number, g: number, s: number, o: Partial<Pose> = {}): Pose => ({ ...basePose, x, y: g - LEG_LEN * s, scale: s, yaw: 0.3, look: 0.4, armL: { a: 12, b: -6 }, armR: { a: 12, b: -6 }, ...o });

const T: React.FC<{ x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; o?: number; children: React.ReactNode }> = ({ x, y, s = 30, c = LN, a = 'middle', o = 1, children }) => (
  <text x={x} y={y} textAnchor={a} fontFamily={FONT.ui} fontSize={s} fill={c} opacity={o} letterSpacing={3}>{children}</text>
);

const Wire: React.FC<{ d: string; t: number; at?: number; n?: number; c?: string; w?: number }> = ({ d, t, at = 0, n = 16, c = LN, w = 3 }) => (
  <path d={d} fill="none" stroke={c} strokeWidth={w} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - dr(t, at, n)} />
);

const Field: React.FC<{ id: string; t: number }> = ({ id, t }) => (
  <g>
    <defs>
      <pattern id={id} width={60} height={60} patternUnits="userSpaceOnUse" patternTransform={`translate(${t * 0.3} 0)`}><path d="M60 0H0V60" fill="none" stroke={GRID} strokeWidth={1.5} /></pattern>
      <pattern id={id + 'b'} width={300} height={300} patternUnits="userSpaceOnUse"><path d="M300 0H0V300" fill="none" stroke={GRID2} strokeWidth={2.5} /></pattern>
    </defs>
    <rect x={-800} y={-500} width={3520} height={2080} fill={BG} />
    <rect x={-800} y={-500} width={3520} height={2080} fill={`url(#${id})`} />
    <rect x={-800} y={-500} width={3520} height={2080} fill={`url(#${id}b)`} />
    <path d="M40 40h40M40 40v40M1880 40h-40M1880 40v40M40 1040h40M40 1040v-40M1880 1040h-40M1880 1040v-40" fill="none" stroke={DIM} strokeWidth={2} opacity={0.6} />
  </g>
);

const Sc: React.FC<{ id: string; t: number; len: number; c?: number[]; to?: number[]; kit?: boolean; children: React.ReactNode }> = ({ id, t, len, c = [960, 540, 1], to = c, kit, children }) => (
  <g transform={camT(kf(t, [[0, c[0]], [len, to[0]]]), kf(t, [[0, c[1]], [len, to[1]]]), kf(t, [[0, c[2]], [len, to[2]]]))}>
    {kit ? <Schematic t={t + 40} id={id} /> : <Field id={id} t={t} />}
    {children}
  </g>
);

const Box: React.FC<{ x: number; y: number; w: number; h: number; t: number; at?: number; hot?: number; lab?: string; sub?: string; s?: number }> = ({ x, y, w, h, t, at = -3, hot = 0, lab, sub, s = 34 }) => {
  const k = pop(t, at);
  if (k <= 0) return null;
  const c = hot === 1 ? CO : hot === 2 ? TL : LN;
  return (
    <g transform={`translate(${x + w / 2} ${y + h / 2}) scale(${k}) translate(${-w / 2} ${-h / 2})`}>
      <rect width={w} height={h} fill={PANEL} stroke={c} strokeWidth={hot ? 5 : 3} />
      {lab && <T x={w / 2} y={sub ? h / 2 - 4 : h / 2 + s * 0.35} s={s} c={c}>{lab}</T>}
      {sub && <T x={w / 2} y={h / 2 + s} s={s * 0.6} c={DIM}>{sub}</T>}
    </g>
  );
};

const Pipe: React.FC<{ t: number; at?: number; step?: number }> = ({ t, at = -99, step = -1 }) => (
  <g>
    {NODES.map((n, i) => (
      <React.Fragment key={i}>
        {i > 0 && <Wire d={`M${NX(i - 1) + 230} 540H${NX(i)}`} t={t} at={at + i * 6 + 3} c={i <= step ? TL : DIM} />}
        <Box x={NX(i)} y={440} w={230} h={200} t={t} at={at + i * 6} hot={i === step ? 1 : i < step ? 2 : 0} lab={n[0]} sub={n[1]} />
      </React.Fragment>
    ))}
  </g>
);

const Flow: React.FC<{ t: number; at?: number }> = ({ t, at = 0 }) => (
  <g>{[0, 1, 2, 3, 4].map((i) => <Wire key={i} d={`M${NX(i) + 230} 540H${NX(i + 1)}`} t={t} at={at + i * 6} n={8} c={CO} w={7} />)}</g>
);

const Wave: React.FC<{ x: number; y: number; w: number; a: number; t: number; sp?: number; c?: string; ph?: number }> = ({ x, y, w, a, t, sp = 0.4, c = TL, ph = 0 }) => (
  <polyline fill="none" stroke={c} strokeWidth={4} points={Array.from({ length: Math.floor(w / 8) + 1 }, (_, i) => `${x + i * 8},${y + Math.sin(i * 0.55 + t * sp + ph) * a * (0.35 + 0.65 * Math.abs(Math.sin(i * 0.21 + ph)))}`).join(' ')} />
);

const Key: React.FC<{ c?: string }> = ({ c = CO }) => (
  <g fill="none" stroke={c} strokeWidth={6}><circle r={46} /><path d="M46 0H270M210 0V50M250 0V40" /></g>
);

const Out: React.FC<{ kind: 'script' | 'shots' | 'cuts' | 'sound'; t: number }> = ({ kind, t }) => (
  <g transform="translate(610 190)">
    <Box x={0} y={0} w={700} h={700} t={t} hot={1} />
    <T x={350} y={90} s={42} c={CO} o={dr(t, 2, 6)}>{{ script: 'SCRIPT', shots: 'SHOT LIST', cuts: 'CUTS', sound: 'SOUND PLAN' }[kind]}</T>
    {kind === 'script' && [0, 1, 2, 3, 4].map((i) => <Wire key={i} d={`M70 ${190 + i * 100}H${630 - (i % 3) * 90}`} t={t} at={6 + i * 4} />)}
    {kind === 'shots' && [0, 1, 2, 3, 4].map((i) => (
      <g key={i}>
        <Wire d={`M70 ${170 + i * 100}h120v70h-120z`} t={t} at={6 + i * 4} c={TL} />
        <Wire d={`M230 ${205 + i * 100}H620`} t={t} at={9 + i * 4} />
      </g>
    ))}
    {kind === 'cuts' && (
      <g>
        <Wire d="M70 330H630M70 540H630" t={t} at={2} />
        {[0, 1, 2, 3, 4].map((i) => <Wire key={i} d={`M${130 + i * 115} 300V570`} t={t} at={6 + i * 4} c={i === 2 ? CO : LN} />)}
      </g>
    )}
    {kind === 'sound' && (
      <g>{Array.from({ length: 17 }, (_, i) => { const v = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.3 + t * 0.35)); return <rect key={i} x={80 + i * 36} y={420 - v * 170} width={22} height={v * 340} fill={i === 8 ? CO : TL} />; })}</g>
    )}
  </g>
);

export const S1: React.FC<ShotProps> = ({ t, len }) => {
  const p = poseAt(t, [{ f: 0, p: figure(560, 900, 0.62, { yaw: 0.5 }) }, { f: 16, p: { armR: { a: 75, b: -8 } }, ease: easeOut }]);
  return (
    <Sc id="s1" t={t} len={len} c={[1000, 560, 0.95]} to={[1000, 560, 1.08]}>
      <Wire d="M800 240H1600V840H800Z" t={t} at={2} n={26} />
      <Wire d="M800 910H1600M800 890V930M1600 890V930" t={t} at={16} c={CO} />
      <T x={1200} y={985} s={36} c={CO} o={dr(t, 24, 8)}>ONE VIDEO</T>
      <Hero look={HERO} pose={p} rimId="rimBlue" shadow={0} />
    </Sc>
  );
};

export const S2: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s2" t={t} len={len} c={[960, 540, 1.25]} to={[960, 520, 1.45]}>
    <rect x={600} y={140} width={720} height={800} fill={PANEL} stroke={LN} strokeWidth={3} />
    {[0, 1, 2, 3, 4, 5].map((i) => <Wire key={i} d={`M660 ${270 + i * 95}H${1260 - (i % 3) * 110}`} t={t} at={4 + i * 4} c={i === 5 ? CO : LN} />)}
    <T x={960} y={215} s={40} c={DIM}>WRITING</T>
  </Sc>
);

export const S3: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s3" t={t} len={len} c={[960, 540, 1.5]} to={[960, 540, 1.7]}>
    {[0, 1, 2].map((i) => { const k = ((t * 2 + i * 70) % 210) / 210; return <circle key={i} cx={960} cy={470} r={150 + k * 330} fill="none" stroke={TL} strokeWidth={3} opacity={0.8 * (1 - k)} />; })}
    <rect x={880} y={330} width={160} height={280} rx={14} fill={PANEL} stroke={LN} strokeWidth={4} />
    <Wire d="M880 430H1040M880 480H1040M880 530H1040" t={t} at={3} n={10} c={DIM} />
    <Wire d="M830 560A130 130 0 0 0 1090 560M960 690V800M860 800H1060" t={t} at={5} n={14} />
    <circle cx={1200} cy={330} r={14} fill={CO} opacity={Math.floor(t / 6) % 2 ? 0.2 : 1} />
    <T x={1260} y={342} s={28} c={CO} a="start">REC</T>
  </Sc>
);

export const S4: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s4" t={t} len={len} c={[960, 540, 1.1]} to={[960, 540, 1.25]}>
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const x = 360 + (i % 3) * 400, y = 270 + Math.floor(i / 3) * 290;
      return (
        <g key={i}>
          <Wire d={`M${x} ${y}h340v240h-340z`} t={t} at={2 + i * 4} n={12} />
          <circle cx={x + 70 + (i % 3) * 100} cy={y + 150 - Math.sin((i + 1) * 0.9) * 70} r={26} fill="none" stroke={i === 5 ? CO : TL} strokeWidth={4} opacity={dr(t, 8 + i * 4, 6)} />
        </g>
      );
    })}
    <T x={960} y={190} s={40} c={DIM}>DRAWING</T>
  </Sc>
);

export const S5: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s5" t={t} len={len} c={[960, 540, 1.3]} to={[960, 540, 1.5]}>
    {[0, 1, 2, 3, 4].map((i) => {
      const x = 560 + i * 200, k = 0.5 + 0.4 * Math.sin(t * 0.12 + i * 1.7);
      return (
        <g key={i}>
          <Wire d={`M${x} 240V840`} t={t} at={i * 3} n={12} c={DIM} />
          <rect x={x - 40} y={240 + k * 520} width={80} height={50} fill={PANEL} stroke={i === 2 ? CO : LN} strokeWidth={4} />
        </g>
      );
    })}
    <T x={960} y={190} s={40} c={DIM}>MIXING</T>
  </Sc>
);

export const S6: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s6" t={t} len={len} c={[960, 540, 1.1]} to={[960, 540, 1.2]}>
    <rect x={560} y={400} width={420} height={280} fill={PANEL} stroke={LN} strokeWidth={3} />
    <rect x={600} y={620} width={340 * dr(t, 2, 28)} height={26} fill={TL} />
    <Wire d="M980 540H1160M1100 490L1160 540L1100 590" t={t} at={30} n={10} c={CO} w={5} />
    <Wire d="M1340 540A380 380 0 1 1 1100 190" t={t} at={36} n={20} c={CO} w={4} />
    <T x={960} y={300} s={40} c={CO} o={dr(t, 44, 6)}>AGAIN</T>
  </Sc>
);

export const S7: React.FC<ShotProps> = ({ t, len }) => {
  const p = poseAt(t, [{ f: 0, p: figure(1000, 0, 1, { y: 470 - HEAD.y, yaw: 0.3, look: 0.5 }) }, { f: 20, p: { yaw: 0.15, look: 0.2 }, ease: easeOut }]);
  const f = faceAt(t, [[0, 'worried'], [16, 'smug']]);
  return (
    <Sc id="s7" t={t} len={len} c={[1000, 470, 2.9]} to={[1000, 470, 3.3]}>
      <Wire d="M1230 560H1300V470H1420V560H1500" t={t} at={4} c={DIM} />
      <T x={1330} y={410} s={110} c={CO} o={dr(t, 8, 6)}>?</T>
      <Hero look={HERO} pose={{ ...p, ...f }} rimId="rimBlue" shadow={0} />
    </Sc>
  );
};

export const S8: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s8" t={t} len={len} c={[960, 540, 0.92]} to={[960, 540, 1.02]}>
    <Pipe t={t} at={-3} />
    <Wire d="M95 790H1825M95 770V810M1825 770V810" t={t} at={22} n={20} c={CO} />
    <T x={960} y={860} s={36} c={CO} o={dr(t, 36, 8)}>ONE CHAIN</T>
  </Sc>
);

export const S9: React.FC<ShotProps> = ({ t, len }) => {
  const cx = -480 + 575 * easeOut(clamp((t - 50) / 30));
  return (
    <Sc id="s9" t={t} len={len} c={[130, 540, 1.5]} to={[470, 540, 1.3]}>
      <Pipe t={t} step={t > 78 ? 0 : -1} />
      <g transform={`translate(${cx} 440)`}>
        <rect width={230} height={200} fill={PANEL} stroke={CO} strokeWidth={4} />
        <T x={115} y={92} s={26}>{typed('WHY THE SKY', t, 4, 0.5)}</T>
        <T x={115} y={132} s={26}>{typed('IS BLUE', t, 26, 0.5)}</T>
      </g>
    </Sc>
  );
};

export const S10: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s10" t={t} len={len} c={[960, 540, 0.95]} to={[560, 540, 1.25]}>
    <Pipe t={t} step={1} />
    <Wire d="M510 440V320" t={t} at={4} c={CO} />
    <T x={510} y={290} s={32} c={CO} o={dr(t, 10, 6)}>STAGE 01</T>
  </Sc>
);

export const S11: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s11" t={t} len={len} c={[960, 520, 1.05]} to={[960, 520, 1.2]}>
    <g opacity={0.3}><Pipe t={t} step={1} /></g>
    <Out kind="script" t={t} />
  </Sc>
);

export const S12: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s12" t={t} len={len} c={[960, 520, 1.05]} to={[960, 520, 1.2]} kit>
    <Out kind="shots" t={t} />
  </Sc>
);

export const S13: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s13" t={t} len={len} c={[960, 520, 1.05]} to={[960, 520, 1.2]}>
    <g opacity={0.3}><Pipe t={t} step={1} /></g>
    <Out kind="cuts" t={t} />
  </Sc>
);

export const S14: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s14" t={t} len={len} c={[960, 520, 1.3]} to={[960, 520, 1.5]}>
    <g opacity={0.3}><Pipe t={t} step={1} /></g>
    <Out kind="sound" t={t} />
  </Sc>
);

export const S15: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s15" t={t} len={len} c={[960, 520, 1.05]} to={[960, 520, 1.2]}>
    <g opacity={0.3}><Pipe t={t} step={2} /></g>
    <Box x={610} y={190} w={700} h={700} t={t} hot={1} />
    <T x={960} y={280} s={42} c={CO}>VOICE</T>
    <Wire d="M660 540H1260" t={t} at={2} c={DIM} w={2} />
    <Wave x={660} y={540} w={600} a={150} t={t} sp={0.5} />
    <rect x={660 + ((t * 6) % 600)} y={380} width={4} height={320} fill={CO} />
  </Sc>
);

export const S16: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s16" t={t} len={len} c={[960, 540, 1.1]} to={[960, 540, 1.25]} kit>
    {Array.from({ length: 12 }, (_, i) => {
      const x = 300 + (i % 4) * 340, y = 250 + Math.floor(i / 4) * 250;
      return (
        <g key={i} opacity={clamp(pop(t, 3 + i * 3, 6))}>
          <rect x={x} y={y} width={300} height={200} fill={PANEL} stroke={i === Math.min(11, Math.floor(t / 3)) ? CO : LN} strokeWidth={3} />
          <circle cx={x + 60 + ((i * 20) % 180)} cy={y + 140 - Math.sin(i * 0.8) * 60} r={22} fill="none" stroke={TL} strokeWidth={4} />
        </g>
      );
    })}
    <T x={960} y={190} s={40} c={CO}>FRAMES</T>
  </Sc>
);

export const S17: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s17" t={t} len={len} c={[960, 540, 1.1]} to={[960, 540, 1.25]} kit>
    <rect x={300} y={260} width={720} height={500} fill={PANEL} stroke={LN} strokeWidth={3} />
    {['SHOT(S1, WIDE)', 'PIP.ARM = EASE(T)', 'CAMERA.PUSH(1.2)', 'DRAW(NODE, GLOW)'].map((s, i) => (
      <T key={i} x={340} y={360 + i * 100} a="start" s={32} c={i === 3 ? CO : LN}>{typed(s, t, 4 + i * 12, 0.7)}</T>
    ))}
    <T x={660} y={215} s={36} c={DIM}>CODE</T>
    <Wire d="M1100 330h420v300h-420z" t={t} at={20} c={TL} />
    <Wire d="M1180 580l130-190l130 190z" t={t} at={34} c={CO} />
  </Sc>
);

export const S18: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s18" t={t} len={len} c={[960, 540, 0.95]} to={[960, 540, 1.05]}>
    {Array.from({ length: 24 }, (_, i) => {
      const on = t > 3 + i * 1.5;
      return <rect key={i} x={260 + (i % 8) * 180} y={230 + Math.floor(i / 8) * 150} width={150} height={110} fill={on ? TL : PANEL} stroke={LN} strokeWidth={2} />;
    })}
    <rect x={260} y={740} width={1420 * dr(t, 2, 34)} height={20} fill={CO} />
    <T x={260} y={840} a="start" s={34} c={DIM}>{`FRAME ${String(Math.floor(t * 41)).padStart(4, '0')}`}</T>
  </Sc>
);

export const S19: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s19" t={t} len={len} c={[960, 540, 1.2]} to={[960, 540, 1.3]}>
    {['VOICE', 'SOUND', 'MUSIC'].map((n, i) => (
      <g key={n}>
        <T x={380} y={350 + i * 170} a="end" s={30} c={DIM}>{n}</T>
        <Wire d={`M420 ${340 + i * 170}H1500`} t={t} at={i * 4} c={DIM} w={2} />
        <Wave x={420} y={340 + i * 170} w={1080} a={50} t={t} ph={i * 2} c={i === 0 ? CO : TL} sp={0.3 + i * 0.1} />
      </g>
    ))}
    <T x={960} y={190} s={40} c={CO}>MIX</T>
  </Sc>
);

export const S20: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s20" t={t} len={len} c={[960, 540, 1.5]} to={[960, 540, 1.7]}>
    <rect x={560} y={500} width={800} height={80} fill={PANEL} stroke={LN} strokeWidth={4} />
    <rect x={560} y={500} width={624 * dr(t, 2, 20) + (t > 22 ? Math.sin(t * 0.9) * 6 : 0)} height={80} fill={TL} />
    <Wire d="M1184 440V640" t={t} at={20} n={8} c={CO} w={6} />
    <T x={1184} y={410} s={30} c={CO} o={dr(t, 24, 6)}>TARGET</T>
    <T x={560} y={680} a="start" s={30} c={DIM}>LEVEL</T>
  </Sc>
);

export const S21: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s21" t={t} len={len} c={[960, 540, 1.18]} to={[960, 540, 0.92]}>
    <Pipe t={t} step={6} />
    <Flow t={t} />
    <Wire d="M95 800H1825M95 780V820M1825 780V820" t={t} at={20} c={DIM} />
    <T x={960} y={880} s={38} c={CO} o={dr(t, 30, 6)}>COMPLETE</T>
  </Sc>
);

export const S22: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s22" t={t} len={len} c={[1650, 540, 1.1]} to={[1700, 540, 1.2]}>
    <g opacity={0.4}><Pipe t={t} step={6} /></g>
    <Wire d="M1825 540H1900" t={t} at={2} c={CO} w={6} />
    <g transform={`translate(2170 540) scale(${Math.max(0.01, pop(t, 6, 10))}) translate(-270 -152)`}>
      <rect width={540} height={304} fill={PANEL} stroke={CO} strokeWidth={5} />
      <path d="M230 90L330 152L230 214Z" fill={CO} />
      <rect x={30} y={266} width={480} height={8} fill={DIM} />
      <rect x={30} y={266} width={480 * ((t % 90) / 90)} height={8} fill={TL} />
    </g>
  </Sc>
);

export const S23: React.FC<ShotProps> = ({ t, len }) => {
  const a = poseAt(t, [{ f: 0, p: figure(760, 1000, 0.55, { yaw: 0.35, look: 0.5 }) }, { f: 12, p: { armR: { a: 140, b: -10 } }, ease: easeOut }]);
  const b = poseAt(t, [{ f: 0, p: figure(1060, 1000, 0.55, { yaw: -0.35, look: 0.5 }) }]);
  return (
    <Sc id="s23" t={t} len={len} c={[960, 540, 0.95]} to={[960, 540, 1]}>
      <Pipe t={t} step={6} />
      <Hero look={HERO} pose={a} rimId="rimBlue" shadow={0} />
      <Hero look={FRIEND} pose={b} rimId="rimBlueL" shadow={0} />
    </Sc>
  );
};

export const S24: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s24" t={t} len={len} c={[960, 540, 1.1]} to={[960, 540, 1.2]} kit>
    {NODES.map((n, i) => (
      <g key={i}>
        <T x={620} y={280 + i * 100} a="start" s={38}>{`${String(i + 1).padStart(2, '0')} ${n[0]}`}</T>
        <Wire d={`M1150 ${262 + i * 100}l22 28l48-58`} t={t} at={4 + i * 5} n={8} c={CO} w={7} />
      </g>
    ))}
  </Sc>
);

export const S25: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s25" t={t} len={len} c={[960, 540, 1.2]} to={[960, 540, 1.4]}>
    <g transform={`translate(960 480) rotate(${t * 2})`}>
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-26} y={-190} width={52} height={70} fill={PANEL} stroke={LN} strokeWidth={4} transform={`rotate(${i * 45})`} />)}
      <circle r={150} fill={PANEL} stroke={LN} strokeWidth={5} />
      <circle r={55} fill="none" stroke={CO} strokeWidth={6} />
    </g>
    <T x={960} y={820} s={50} c={CO} o={dr(t, 8, 6)}>ENGINE</T>
  </Sc>
);

export const S26: React.FC<ShotProps> = ({ t, len }) => {
  const a = poseAt(t, [{ f: 0, p: figure(800, 840, 0.75, { yaw: 0.3 }) }, { f: 10, p: { armR: { a: 100, b: -20 } }, ease: easeOut }]);
  const b = poseAt(t, [{ f: 0, p: figure(1120, 840, 0.75, { yaw: -0.3 }) }]);
  return (
    <Sc id="s26" t={t} len={len} c={[960, 560, 1.4]} to={[960, 560, 1.55]}>
      <Box x={560} y={190} w={800} h={700} t={t} />
      <T x={960} y={250} s={40} c={CO}>CAST</T>
      <Hero look={HERO} pose={a} rimId="rimBlue" shadow={0} />
      <Hero look={FRIEND} pose={b} rimId="rimBlueL" shadow={0} />
      <T x={800} y={878} s={26} c={DIM}>PIP</T>
      <T x={1120} y={878} s={26} c={DIM}>MO</T>
    </Sc>
  );
};

export const S27: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s27" t={t} len={len} c={[960, 540, 0.95]} to={[960, 540, 1.05]}>
    {['SETS', 'SCRIPTS', 'GUIDES'].map((n, i) => {
      const x = 150 + i * 580;
      const ic = i === 0
        ? `M${x + 90} 320h340v240h-340zM${x + 150} 380h220v120h-220zM${x + 90} 320l60 60M${x + 430} 320l-60 60M${x + 90} 560l60-60M${x + 430} 560l-60-60`
        : i === 1
          ? `M${x + 130} 330h260v300h-260zM${x + 100} 360v300h260M${x + 160} 400h200M${x + 160} 450h200M${x + 160} 500h140`
          : `M${x + 80} 340h180v280h-180zM${x + 260} 340h180v280h-180zM${x + 110} 400h120M${x + 110} 450h120M${x + 290} 400h120M${x + 290} 450h120`;
      return (
        <g key={n}>
          <Box x={x} y={250} w={520} h={560} t={t} at={i * 14 - 3} hot={i === 2 ? 1 : 0} />
          <Wire d={ic} t={t} at={i * 14 + 4} n={14} c={i === 0 ? TL : LN} />
          <T x={x + 260} y={730} s={44} c={i === 2 ? CO : LN} o={dr(t, i * 14 + 6, 6)}>{n}</T>
        </g>
      );
    })}
  </Sc>
);

export const S28: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s28" t={t} len={len} c={[960, 540, 1.35]} to={[960, 540, 1.5]} kit>
    <Wire d="M1160 450h300v180h-300z" t={t} at={2} c={DIM} />
    <T x={1310} y={700} s={32} c={DIM}>YOUR SLOT</T>
    <T x={960} y={330} s={40} c={CO}>YOUR OWN KEYS</T>
    <g transform={`translate(${520 + 480 * easeOut(clamp((t - 6) / 24))} 540)`}><Key /></g>
  </Sc>
);

export const S29: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s29" t={t} len={len} c={[960, 540, 1.1]} to={[960, 540, 1.2]}>
    {['VOICE', 'WRITING'].map((n, i) => (
      <g key={n} transform={`translate(${360 + i * 660} 380)`}>
        <Wire d="M0 0h480v260h-480z" t={t} at={i * 8} c={DIM} />
        <g transform="translate(60 130)" opacity={dr(t, 8 + i * 8, 8)}><Key /></g>
        <T x={240} y={340} s={38}>{n}</T>
      </g>
    ))}
  </Sc>
);

export const S30: React.FC<ShotProps> = ({ t, len }) => (
  <Sc id="s30" t={t} len={len} c={[960, 540, 1.3]} to={[960, 540, 1.45]} kit>
    <Box x={660} y={330} w={600} h={380} t={t} lab="PACKAGE" s={44} />
    <g transform="translate(790 620)" opacity={0.45}><Key c={DIM} /></g>
    <Wire d="M760 570L1160 690M1160 570L760 690" t={t} at={8} n={10} c={CO} w={8} />
    <T x={960} y={800} s={40} c={CO} o={dr(t, 12, 6)}>NO KEYS INSIDE</T>
  </Sc>
);

export const S31: React.FC<ShotProps> = ({ t, len }) => {
  const k = (t % 45) / 45;
  return (
    <Sc id="s31" t={t} len={len} c={[960, 540, 1]} to={[960, 540, 0.94]}>
      <Pipe t={t} step={6} />
      <Flow t={t} />
      <circle cx={1710} cy={540} r={130 + k * 130} fill="none" stroke={CO} strokeWidth={4} opacity={1 - k} />
      <T x={210} y={380} s={34} c={CO}>ONE LINE IN</T>
      <T x={1710} y={380} s={34} c={CO}>ONE VIDEO OUT</T>
    </Sc>
  );
};
