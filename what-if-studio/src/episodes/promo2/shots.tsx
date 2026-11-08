import React from 'react';
import { Hero, poseAt, faceAt, kf, clamp, backOut, rnd, camT, LOOKS, HEAD, Study, Desk, Foreground, SCH, FONT, ShotProps } from '../../engine';

const M = FONT.ui;
const HY = 712 - HEAD.y;
const pop = (t: number, d = 0) => backOut(clamp((t + 3 - d) / 8));
const typed = (s: string, t: number, a: number, c: number) => s.slice(0, Math.max(0, Math.min(s.length, Math.floor((t - a) * c))));
const NAMES = ['SCRIPT', 'VOICE', 'SHOTS', 'BOARD', 'ANIMATE', 'SOUND', 'MASTER'];
const SETS = ['STUDY', 'STAIRWELL', 'CLASSROOM', 'ROOFTOP', 'KITCHEN', 'BEDROOM', 'SCHEMATIC'];
const CODE = ['export const S1: React.FC = ({ t }) => (', '  <Study t={t} id="s1" />', ');'];
const TY = (t: number) => ({ armR: { a: 30 + 12 * Math.sin(t * 0.9), b: -40 }, armL: { a: 30 + 12 * Math.cos(t * 0.9), b: -40 } });
const NOD = (t: number) => ({ headTilt: 7 * Math.sin(t * 0.5) });
const PH = (t: number, x: number, yaw: number, e: string): any => ({ ...poseAt(t, [{ f: 0, p: { x, y: 560, scale: 1.3, yaw, look: yaw } }]), ...faceAt(t, [[0, e]] as any) });

const Txt: React.FC<{ x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; children: React.ReactNode }> = ({ x, y, s = 36, c = SCH.line, a = 'middle', children }) => (
  <text x={x} y={y} textAnchor={a} fontFamily={M} fontSize={s} fill={c} letterSpacing={2} style={{ whiteSpace: 'pre' }}>{children}</text>
);

const Stage: React.FC<{ t: number; len: number; z?: [number, number]; children?: React.ReactNode }> = ({ t, len, z = [1, 1.1], children }) => (
  <g>
    <rect x={-1000} y={-1000} width={4000} height={3000} fill="#0B1424" />
    <g transform={camT(960, 540, kf(t, [[0, z[0]], [len, z[1]]]))}>
      <path d={Array.from({ length: 33 }, (_, i) => `M${i * 120 - 960} -600V2400M-960 ${i * 120 - 600}H2900`).join('')} stroke="#16243D" strokeWidth={2} />
      {children}
    </g>
  </g>
);

const Card: React.FC<{ x: number; y: number; w: number; h: number; label: string; t: number; at?: number; lit?: boolean; s?: number }> = ({ x, y, w, h, label, t, at = 0, lit, s = 40 }) => {
  const k = pop(t, at);
  return k <= 0 ? null : (
    <g transform={`translate(${x + w / 2} ${y + h / 2}) scale(${k}) translate(${-w / 2} ${-h / 2})`}>
      <rect width={w} height={h} rx={20} fill={lit ? '#2B1A12' : '#13213A'} stroke={lit ? SCH.live : SCH.line} strokeWidth={lit ? 6 : 3} />
      <Txt x={w / 2} y={h / 2 + s * 0.35} s={s} c={lit ? SCH.glow : SCH.line}>{label}</Txt>
    </g>
  );
};

const Chip: React.FC<{ x: number; y: number; text: string; c?: string }> = ({ x, y, text, c = SCH.glow }) => (
  <g>
    <rect x={x} y={y} width={text.length * 26 + 50} height={64} rx={32} fill="#0A111F" opacity={0.9} stroke={SCH.dim} strokeWidth={2} />
    <circle cx={x + 32} cy={y + 32} r={9} fill={c} />
    <Txt x={x + 56} y={y + 43} s={32} a="start">{text}</Txt>
  </g>
);

const Wave: React.FC<{ t: number; y: number; c: string }> = ({ t, y, c }) => (
  <g>
    {Array.from({ length: 41 }, (_, i) => {
      const h = 30 + 170 * Math.abs(Math.sin(i * 0.7 + t * 0.5)) * (0.4 + 0.6 * rnd(i, 3));
      return <rect key={i} x={300 + i * 33} y={y - h / 2} width={18} height={h} rx={9} fill={c} />;
    })}
  </g>
);

const Tracks: React.FC<{ t: number; rows: number; y: number; h: number; cuts?: boolean }> = ({ t, rows, y, h, cuts }) => (
  <g>
    {Array.from({ length: rows }, (_, r) => Array.from({ length: 9 }, (_, i) => {
      const x = 90 + i * 200 + rnd(r, i) * 30;
      const yy = y + r * (h + 24);
      const k = pop(t, i * 1.5 + r * 2);
      return k > 0 ? (
        <g key={r * 9 + i} opacity={clamp(k)}>
          <rect x={x} y={yy} width={150 + rnd(i, r + 7) * 40} height={h} rx={10} fill={['#2E4A7A', '#5B3A6B', '#7A4A2E'][(r + i) % 3]} stroke={SCH.dim} strokeWidth={2} />
          {cuts ? <rect x={x - 6} y={yy - 14} width={6} height={h + 28} fill={SCH.live} /> : null}
        </g>
      ) : null;
    }))}
    <rect x={140 + ((t * 24) % 1600)} y={y - 40} width={6} height={rows * (h + 24) + 50} fill={SCH.glow} />
  </g>
);

const Thumb: React.FC<{ x: number; y: number; t: number; at: number }> = ({ x, y, t, at }) => {
  const k = pop(t, at);
  return k <= 0 ? null : (
    <g transform={`translate(${x + 260} ${y + 146}) scale(${k}) translate(${-x - 260} ${-y - 146})`}>
      <rect x={x} y={y} width={520} height={292} rx={16} fill="#1B2A47" stroke={SCH.line} strokeWidth={3} />
      <circle cx={x + 420} cy={y + 80} r={34} fill="#F0A24A" />
      <circle cx={x + 200} cy={y + 120} r={28} fill="#E9E2D0" />
      <rect x={x + 180} y={y + 150} width={40} height={100} rx={14} fill="#2A3B5E" />
    </g>
  );
};

const Player: React.FC<{ t: number; id: string; children?: React.ReactNode }> = ({ t, id, children }) => (
  <g>
    <clipPath id={id}><rect width={1200} height={675} rx={28} /></clipPath>
    <g clipPath={`url(#${id})`}><g transform="scale(0.625)">{children}</g></g>
    <rect width={1200} height={675} rx={28} fill="none" stroke={SCH.line} strokeWidth={8} />
    <rect y={720} width={1200} height={14} rx={7} fill="#13213A" />
    <rect y={720} width={1200 * clamp(t / 90)} height={14} rx={7} fill={SCH.live} />
  </g>
);

const St: React.FC<{ t: number; len: number; id: string; c: [number, number, number, number]; p?: any; face?: [number, string][]; fn?: (t: number) => any; mo?: boolean; fg?: boolean; children?: React.ReactNode }> = ({ t, len, id, c, p = {}, face = [[0, 'tired']], fn, mo, fg, children }) => {
  const pose: any = { ...poseAt(t, [{ f: 0, p: { x: 960, y: 712, yaw: 0.2, look: 0.2, ...p } }]), ...faceAt(t, face as any), ...(fn ? fn(t) : {}) };
  return (
    <g>
      <g transform={camT(kf(t, [[0, c[0]], [len, c[0] + 12]]), c[1], kf(t, [[0, c[2]], [len, c[3]]]))}>
        <Study t={t + 80} id={id} />
        <Hero look={mo ? LOOKS.mo : LOOKS.pipHood} pose={pose} rimId="rimR" shadow={0} />
        <Desk x0={560} x1={1360} y={700} />
        {fg ? <Foreground blur={10}><rect x={1250} y={620} width={320} height={400} rx={40} fill="#07090F" /></Foreground> : null}
      </g>
      {children}
    </g>
  );
};

export const S1: React.FC<ShotProps> = ({ t, len }) => (
  <St t={t} len={len} id="s1" c={[960, 540, 1, 1.06]} p={{ tilt: 14, headTilt: -10 }} fn={TY}>
    <Chip x={1380} y={60} text="EDIT 06:00:00" c="#FF5A4A" />
  </St>
);

export const S2: React.FC<ShotProps> = ({ t, len }) => (
  <St t={t} len={len} id="s2" c={[975, HY, 3.2, 3.6]} p={{ tilt: 6, headTilt: -8, yaw: 0.3 }} face={[[0, 'tired'], [10, 'worried']]} />
);

export const S3: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1.05, 1.2]}>
    <Tracks t={t} rows={5} y={250} h={90} />
    <Chip x={260} y={130} text="EDITING" c="#FF5A4A" />
  </Stage>
);

export const S4: React.FC<ShotProps> = ({ t, len }) => (
  <St t={t} len={len} id="s4" c={[972, 560, 1.8, 2]} p={{ tilt: 12, headTilt: -8 }} fn={TY} fg />
);

export const S5: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1, 1.15]}>
    <circle cx={960} cy={540} r={300} fill="#13213A" stroke={SCH.line} strokeWidth={10} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={955} y={250} width={10} height={36} fill={SCH.dim} transform={`rotate(${i * 30} 960 540)`} />)}
    <rect x={955} y={290} width={10} height={250} rx={5} fill={SCH.live} transform={`rotate(${t * 14} 960 540)`} />
    <Txt x={960} y={720} s={64} c={SCH.glow}>06:00:00</Txt>
  </Stage>
);

export const S6: React.FC<ShotProps> = ({ t, len }) => (
  <St t={t} len={len} id="s6" c={[960, 540, 1, 1.06]} p={{ look: 0.5 }} face={[[0, 'smug']]} />
);

export const S7: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1.2, 1.35]}>
    <Txt x={960} y={360} s={44} c={SCH.dim}>TOPIC</Txt>
    <rect x={360} y={420} width={1200} height={150} rx={26} fill="#0A111F" stroke={SCH.live} strokeWidth={6} />
    <Txt x={410} y={520} s={64} a="start">{typed('how bridges stay up', t, 3, 0.55) + (t % 16 < 8 ? '|' : '')}</Txt>
  </Stage>
);

export const S8: React.FC<ShotProps> = ({ t, len }) => {
  const d = t > 10 ? 16 : 0;
  return (
    <Stage t={t} len={len} z={[1.3, 1.1]}>
      <rect x={560} y={440} width={800} height={260} rx={40} fill="#0A111F" />
      <rect x={560} y={400 + d} width={800} height={260} rx={40} fill="#16243D" stroke={SCH.live} strokeWidth={6} />
      <Txt x={960} y={565 + d} s={90} c={SCH.glow}>ENTER</Txt>
      {t > 10 ? <circle cx={960} cy={530} r={300 + (t - 10) * 16} fill="none" stroke={SCH.glow} strokeWidth={6} opacity={clamp(1 - (t - 10) / 14)} /> : null}
    </Stage>
  );
};

export const S9: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1, 1.08]}>
    {NAMES.map((n, i) => <Card key={n} x={65 + i * 260} y={470} w={230} h={140} label={n} t={t} at={i * 2} s={30} lit={i === 0} />)}
  </Stage>
);

export const S10: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1.15, 1.3]}>
    <Card x={760} y={150} w={400} h={110} label="SCRIPT" t={t} lit />
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={i} x={560} y={340 + i * 100} width={clamp((t - 6 - i * 5) / 14) * (800 - (i % 3) * 160)} height={36} rx={18} fill={SCH.line} />
    ))}
  </Stage>
);

export const S11: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1.05, 1.2]}>
    <Card x={760} y={200} w={400} h={110} label="VOICE" t={t} lit />
    <Wave t={t} y={600} c={SCH.live} />
  </Stage>
);

export const S12: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1.3, 1.45]}>
    <Card x={710} y={280} w={500} h={110} label="SHOT LIST" t={t} lit />
    <Tracks t={t} rows={1} y={460} h={130} cuts />
  </Stage>
);

export const S13: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1, 1.06]}>
    {Array.from({ length: 6 }, (_, i) => <Thumb key={i} x={140 + (i % 3) * 560} y={150 + Math.floor(i / 3) * 340} t={t} at={i * 4} />)}
    <Card x={760} y={860} w={400} h={100} label="SCENES" t={t} at={26} lit />
  </Stage>
);

export const S14: React.FC<ShotProps> = ({ t, len }) => (
  <St t={t} len={len} id="s14" c={[960, 560, 1.8, 2]} p={{ yaw: 0.35, look: 0.6 }} face={[[0, 'neutral'], [10, 'happy']]} />
);

export const S15: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1.1, 1.25]}>
    <rect x={300} y={300} width={1320} height={360} rx={26} fill="#0A111F" stroke={SCH.dim} strokeWidth={3} />
    {CODE.map((l, i) => <Txt key={i} x={360} y={400 + i * 90} s={44} a="start">{typed(l, t, 3 + i * 26, 1.3)}</Txt>)}
  </Stage>
);

export const S16: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1.1, 1.25]}>
    <Card x={760} y={130} w={400} h={110} label="SOUND" t={t} lit />
    <Wave t={t} y={500} c={SCH.live} />
    <Wave t={t + 9} y={760} c={SCH.line} />
  </Stage>
);

export const S17: React.FC<ShotProps> = ({ t, len }) => (
  <St t={t} len={len} id="s17" c={[960, 560, 1.8, 2]} p={{ yaw: 0.3 }} face={[[0, 'cool']]} fn={NOD} mo />
);

export const S18: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1, 1.12]}>
    <Txt x={960} y={600} s={260} c={SCH.glow}>{'-' + Math.min(14, Math.floor((t + 2) * 0.8))}</Txt>
    <Txt x={960} y={730} s={80}>LUFS</Txt>
    <rect x={360} y={820} width={1200} height={30} rx={15} fill="#13213A" />
    <rect x={360} y={820} width={1200 * Math.min(1, t / 18) * 0.75} height={30} rx={15} fill={SCH.live} />
  </Stage>
);

export const S19: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1, 1.05]}>
    <g transform="translate(360 150)">
      <Player t={t} id="pl19"><St t={t} len={len} id="s19" c={[960, 540, 1, 1.06]} face={[[0, 'smug']]} /></Player>
    </g>
    {t > 20 ? <Chip x={884} y={930} text="DONE" c="#5BE08A" /> : null}
  </Stage>
);

export const S20: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1.45, 1.6]}>
    <g transform="translate(360 150)">
      <Player t={t + 30} id="pl20"><St t={t} len={len} id="s20" c={[975, HY, 2.4, 2.6]} face={[[0, 'happy']]} /></Player>
    </g>
  </Stage>
);

export const S21: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1.05, 1.2]}>
    <g transform={`rotate(${t * 3} 960 500)`}>
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={930} y={300} width={60} height={70} rx={10} fill={SCH.line} transform={`rotate(${i * 45} 960 500)`} />)}
      <circle cx={960} cy={500} r={160} fill="#13213A" stroke={SCH.line} strokeWidth={12} />
    </g>
    <Card x={710} y={760} w={500} h={110} label="ENGINE" t={t} lit />
  </Stage>
);

export const S22: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1, 1.06]}>
    <Hero look={LOOKS.pipHood} pose={PH(t, 700, 0.3, 'smug')} rimId="rimR" shadow={0} />
    <Hero look={LOOKS.mo} pose={PH(t, 1220, -0.3, 'happy')} rimId="rimL" shadow={0} />
  </Stage>
);

export const S23: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1, 1.06]}>
    {SETS.map((n, i) => (
      <Card key={n} x={i < 4 ? 160 + i * 430 : 330 + (i - 4) * 430} y={i < 4 ? 330 : 540} w={400} h={140} label={n} t={t} at={i * 7} s={36} lit={t > i * 7 + 8} />
    ))}
  </Stage>
);

export const S24: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1.05, 1.2]}>
    <Card x={260} y={400} w={620} h={200} label="VOICE KEY" t={t} s={52} />
    <Card x={1040} y={400} w={620} h={200} label="AI KEY" t={t} at={6} s={52} />
    {t > 14 ? <Txt x={570} y={690} s={48} c={SCH.glow}>YOURS</Txt> : null}
    {t > 20 ? <Txt x={1350} y={690} s={48} c={SCH.glow}>YOURS</Txt> : null}
  </Stage>
);

export const S25: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1.2, 1.05]}>
    <g transform="translate(960 540)">
      <circle cx={-170} cy={0} r={80} fill="none" stroke={SCH.line} strokeWidth={26} />
      <rect x={-90} y={-13} width={380} height={26} fill={SCH.line} />
      <rect x={190} y={13} width={26} height={60} fill={SCH.line} />
      <rect x={240} y={13} width={26} height={44} fill={SCH.line} />
    </g>
    <path d="M700 280L1220 800" stroke="#FF5A4A" strokeWidth={28} strokeLinecap="round" strokeDasharray={800} strokeDashoffset={800 * (1 - clamp((t - 10) / 8))} />
  </Stage>
);

export const S26: React.FC<ShotProps> = ({ t, len }) => (
  <Stage t={t} len={len} z={[1, 1.04]}>
    <rect x={80} y={450} width={640} height={130} rx={24} fill="#0A111F" stroke={SCH.live} strokeWidth={5} />
    <Txt x={120} y={532} s={40} a="start">{typed('how bridges stay up', t, 3, 0.6)}</Txt>
    <path d="M760 515H900M860 475L900 515L860 555" stroke={SCH.glow} strokeWidth={10} fill="none" strokeLinecap="round" opacity={clamp((t - 20) / 6)} />
    <g transform="translate(950 330) scale(0.5)" opacity={clamp((t - 26) / 6)}>
      <Player t={t - 26} id="pl26"><St t={t} len={len} id="s26" c={[960, 540, 1, 1.06]} face={[[0, 'smug']]} /></Player>
    </g>
  </Stage>
);

export const S27: React.FC<ShotProps> = ({ t, len }) => (
  <St t={t} len={len} id="s27" c={[960, 560, 1.8, 2]} p={{ yaw: 0.35 }} face={[[0, 'happy']]} />
);
