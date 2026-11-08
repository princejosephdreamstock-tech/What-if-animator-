import React from 'react';
import { Hero, Pose, basePose, faceAt, kf, clamp, easeOut, backOut, camT, LOOKS, LEG_LEN, HEAD, FONT, ShotProps } from '../../engine';

const HERO = { ...LOOKS.pip, skin: '#C98E68', skinShade: '#B07A58', hand: '#C98E68', jacket: '#2BA6A0', jacketShade: '#1F837E', accent: '#F26B5B', shoe: '#F26B5B', hair: '#1A1A22' };
const FRIEND = { ...LOOKS.mo, jacket: '#F2C14E', jacketShade: '#C99A2E', accent: '#2BA6A0' };

const INK = '#0A1E2C', DEEP = '#0F2D40', MID = '#1B4660', LN = '#EAF6F8', TEAL = '#2BA6A0', CORAL = '#F26B5B', GREY = '#8FA3AD';
type V3 = [number, number, number];

const ap = (t: number, d = 0, n = 10) => clamp((t - d) / n);
const pop = (t: number, d = 0, n = 8) => backOut(clamp((t - d) / n));
const typed = (s: string, t: number, d: number, cps: number) => s.slice(0, Math.max(0, Math.min(s.length, Math.floor((t - d) * cps))));
const blink = (t: number) => (Math.floor(t / 7) % 2 ? 0 : 1);
const Rc = (x: number, y: number, w: number, h: number) => `M${x - w / 2} ${y - h / 2}h${w}v${h}h${-w}Z`;
const stand = (x: number, g: number, sc: number, e: Partial<Pose> = {}): Pose => ({ ...basePose, x, y: g - LEG_LEN * sc, scale: sc, yaw: 0.4, look: 0.4, ...e });
const head = (x: number, y: number, sc: number, e: Partial<Pose> = {}): Pose => ({ ...basePose, x, y: y - HEAD.y * sc, scale: sc, yaw: 0.2, look: 0.2, ...e });

const Grid: React.FC<{ id: string }> = ({ id }) => (
  <g>
    <defs>
      <pattern id={id} width={60} height={60} patternUnits="userSpaceOnUse">
        <path d="M60 0H0V60" fill="none" stroke={MID} strokeWidth={1.5} />
      </pattern>
    </defs>
    <rect x={-1500} y={-1000} width={4920} height={3080} fill={INK} />
    <rect x={-1500} y={-1000} width={4920} height={3080} fill={`url(#${id})`} />
  </g>
);

const Cam: React.FC<{ t: number; len: number; id: string; a: V3; b: V3; children: React.ReactNode }> = ({ t, len, id, a, b, children }) => (
  <g transform={camT(kf(t, [[0, a[0]], [len, b[0]]]), kf(t, [[0, a[1]], [len, b[1]]]), kf(t, [[0, a[2]], [len, b[2]]]))}>
    <Grid id={id} />
    {children}
  </g>
);

const Ln: React.FC<{ d: string; t: number; at?: number; n?: number; c?: string; w?: number }> = ({ d, t, at = 0, n = 14, c = LN, w = 3 }) => (
  <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - easeOut(ap(t, at, n))} />
);

const Tx: React.FC<{ x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; o?: number; children: React.ReactNode }> = ({ x, y, s = 34, c = LN, a = 'middle', o = 1, children }) => (
  <text x={x} y={y} textAnchor={a} fontFamily={FONT.ui} fontSize={s} fill={c} opacity={o} letterSpacing={3} style={{ whiteSpace: 'pre' }}>
    {children}
  </text>
);

const Nd: React.FC<{ x: number; y: number; t: number; l: string; w?: number; h?: number; at?: number; hot?: boolean; s?: number }> = ({ x, y, t, l, w = 300, h = 120, at = 0, hot, s = 34 }) => {
  const k = pop(t, at);
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={DEEP} stroke={hot ? CORAL : LN} strokeWidth={hot ? 5 : 3} />
      <Tx x={0} y={s * 0.35} s={s} c={hot ? CORAL : LN}>{l}</Tx>
    </g>
  );
};

const Dm: React.FC<{ x1: number; x2: number; y: number; l: string; t: number; at?: number }> = ({ x1, x2, y, l, t, at = 0 }) => (
  <g opacity={ap(t, at, 6)}>
    <path d={`M${x1} ${y}H${x2}M${x1} ${y - 14}v28M${x2} ${y - 14}v28`} stroke={TEAL} strokeWidth={2.5} fill="none" />
    <Tx x={(x1 + x2) / 2} y={y - 22} s={24} c={TEAL}>{l}</Tx>
  </g>
);

const Wave: React.FC<{ x: number; y: number; n: number; t: number; gap?: number; amp?: number; c?: string; at?: number }> = ({ x, y, n, t, gap = 18, amp = 100, c = TEAL, at = 0 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const h = amp * (0.25 + 0.75 * Math.abs(Math.sin(i * 0.7 + t * 0.25) * Math.cos(i * 0.31))) * ap(t, at + i * 0.6, 6);
      return <path key={i} d={`M${x + i * gap} ${y - h}V${y + h}`} stroke={c} strokeWidth={6} strokeLinecap="round" />;
    })}
  </g>
);

const Key: React.FC<{ x: number; y: number; c?: string; o?: number }> = ({ x, y, c = CORAL, o = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o} fill="none" stroke={c} strokeWidth={6} strokeLinecap="round">
    <path d="M-36 -36H36V36H-36ZM-12 -12H12V12H-12Z" />
    <path d="M36 0H220M170 0V44M210 0V32" />
  </g>
);

const NAMES = ['TOPIC', 'SCRIPT', 'VOICE', 'SHOTS', 'FRAMES', 'SOUND', 'MASTER', 'VIDEO'];
const RX = (i: number) => 190 + i * 220;
const Rail: React.FC<{ t: number; hot?: number[]; step?: number; full?: boolean }> = ({ t, hot = [], step = 5, full }) => (
  <g>
    <path d="M60 620H1860" stroke={GREY} strokeWidth={3} strokeDasharray="14 14" strokeDashoffset={-t * 1.5} />
    {NAMES.map((l, i) => {
      const at = full ? -30 : 3 + i * step;
      return (
        <g key={l}>
          {i > 0 && <Ln d={`M${RX(i - 1) + 85} 540H${RX(i) - 85}`} t={t} at={at} n={6} c={TEAL} />}
          <Nd x={RX(i)} y={540} t={t} at={at} l={l} w={170} h={90} s={26} hot={hot.includes(i)} />
        </g>
      );
    })}
  </g>
);

const Doc: React.FC<{ x: number; y: number; t: number; at: number; l: string }> = ({ x, y, t, at, l }) => (
  <g>
    <Ln d={`M${x - 130} ${y - 190}H${x + 70}L${x + 130} ${y - 130}V${y + 190}H${x - 130}Z`} t={t} at={at} n={12} />
    {[0, 1, 2, 3, 4].map((i) => <Ln key={i} d={`M${x - 90} ${y - 50 + i * 55}H${x + 90 - (i % 2) * 50}`} t={t} at={at + 8 + i * 3} n={8} c={TEAL} w={3} />)}
    <Tx x={x} y={y + 250} s={32} c={CORAL} o={ap(t, at + 10, 5)}>{l}</Tx>
  </g>
);

export const S1: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g1" a={[960, 520, 1.5]} b={[960, 520, 1.75]}>
    <Ln d={Rc(960, 540, 760, 560)} t={t} n={12} />
    {[0, 1, 2, 3, 4, 5].map((i) => <Ln key={i} d={`M640 ${340 + i * 80}H1280`} t={t} at={6 + i * 3} n={10} c={MID} w={2} />)}
    <Dm x1={580} x2={1340} y={235} l="ONE VIDEO" t={t} at={14} />
    <rect x={640} y={290} width={26} height={50} fill={CORAL} opacity={blink(t)} />
  </Cam>
);

const TASKS = ['WRITE', 'RECORD', 'CUT', 'DRAW', 'MIX'];
export const S2: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g2" a={[1100, 600, 1.4]} b={[1060, 590, 1.55]}>
    {TASKS.map((l, i) => <Nd key={l} x={1200 + (i % 2 ? 18 : -18)} y={860 - i * 84} t={t} at={3 + i * 5} l={l} w={300} h={72} s={28} hot={i === 4} />)}
    <Dm x1={1020} x2={1380} y={440} l="TASKS" t={t} at={26} />
    <Hero look={HERO} pose={{ ...stand(640, 930, 0.9, { yaw: 0.5 }), ...faceAt(t, [[0, 'tired']]) }} rimId="rimBlue" shadow={0} />
  </Cam>
);

export const S3: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g3" a={[960, 520, 3]} b={[960, 520, 3.3]}>
    <Ln d="M790 520a170 170 0 1 0 340 0a170 170 0 1 0 -340 0" t={t} n={12} c={TEAL} />
    <Ln d="M730 520a230 230 0 1 0 460 0a230 230 0 1 0 -460 0" t={t} at={4} n={14} w={2} c={GREY} />
    <Ln d="M960 240V300M960 740V800M660 520H720M1200 520H1260" t={t} at={8} n={8} c={CORAL} w={4} />
    <Hero look={HERO} pose={{ ...head(960, 520, 1, { yaw: 0.25 }), ...faceAt(t, [[0, 'tired']]) }} rimId="rimBlue" shadow={0} />
  </Cam>
);

export const S4: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g4" a={[960, 540, 1.05]} b={[960, 540, 0.92]}>
    <Rail t={t} />
    <Dm x1={105} x2={1815} y={400} l="THE LINE" t={t} at={30} />
  </Cam>
);

const TOPIC = 'HOW TIDES WORK';
export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const s = typed(TOPIC, t, 6, 0.5);
  return (
    <Cam t={t} len={len} id="g5" a={[960, 540, 1.5]} b={[960, 540, 1.75]}>
      <Ln d={Rc(960, 540, 900, 150)} t={t} n={10} />
      <Tx x={510} y={440} s={26} c={TEAL} a="start" o={ap(t, 6, 6)}>TOPIC</Tx>
      <Tx x={550} y={558} s={56} a="start">{s}</Tx>
      <rect x={550 + s.length * 37} y={510} width={24} height={64} fill={CORAL} opacity={blink(t)} />
      <Ln d="M1410 540H1760" t={t} at={30} n={12} c={CORAL} />
    </Cam>
  );
};

export const S6: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g6" a={[960, 540, 1.3]} b={[960, 540, 1.45]}>
    <Nd x={640} y={540} t={t} at={2} l="SCRIPT" w={360} h={150} s={44} hot />
    <Ln d="M820 540H1090" t={t} at={10} n={10} c={TEAL} />
    <Ln d={Rc(1250, 540, 300, 400)} t={t} at={12} n={12} />
    {[0, 1, 2, 3].map((i) => <Ln key={i} d={`M1130 ${430 + i * 60}H${1370 - (i % 3) * 40}`} t={t} at={18 + i * 4} n={8} c={TEAL} />)}
    <Tx x={1250} y={790} s={26} c={TEAL} o={ap(t, 24, 6)}>NARRATION</Tx>
  </Cam>
);

export const S7: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g7" a={[900, 540, 2]} b={[940, 540, 2.3]}>
    <Nd x={1180} y={540} t={t} at={0} l="SCRIPT" w={360} h={150} s={44} hot />
    <Ln d="M1000 500H1040V580H1000" t={t} n={8} c={TEAL} />
    <Key x={470 + 320 * easeOut(ap(t, 2, 14))} y={540} />
    <Tx x={600} y={440} s={30} c={TEAL} o={ap(t, 4, 6)}>YOUR KEY</Tx>
  </Cam>
);

export const S8: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g8" a={[960, 540, 1.5]} b={[960, 540, 1]}>
    {[0, 1, 2, 3, 4, 5].map((i) => <Nd key={i} x={600 + (i % 3) * 360} y={440 + Math.floor(i / 3) * 200} t={t} at={3 + i * 4} l={`BEAT ${i + 1}`} w={280} h={110} s={30} hot={i === 0} />)}
    <Dm x1={460} x2={1460} y={290} l="NARRATION" t={t} at={26} />
  </Cam>
);

export const S9: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g9" a={[1060, 540, 1.25]} b={[1060, 540, 1.4]}>
    <Nd x={560} y={540} t={t} at={2} l="VOICE" w={340} h={150} s={44} hot />
    <Ln d="M730 540H860" t={t} at={8} n={8} c={TEAL} />
    <Wave x={900} y={540} n={36} gap={22} amp={110} t={t} at={8} />
  </Cam>
);

export const S10: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g10" a={[1000, 520, 2]} b={[1010, 520, 2.2]}>
    <path d={Rc(960, 465, 90, 170)} fill={DEEP} stroke={LN} strokeWidth={4} />
    {[0, 1, 2, 3].map((i) => <Ln key={i} d={`M925 ${420 + i * 28}H995`} t={t} at={4 + i * 2} n={6} c={MID} w={3} />)}
    <Ln d="M870 520V560Q870 650 960 650Q1050 650 1050 560V520M960 650V740M900 740H1020" t={t} at={2} n={14} />
    <Ln d="M1090 430a60 60 0 0 1 0 120" t={t} at={10} n={8} c={TEAL} />
    <Ln d="M1150 380a130 130 0 0 1 0 220" t={t} at={16} n={8} c={TEAL} />
    <Ln d="M1210 340a190 190 0 0 1 0 300" t={t} at={22} n={8} c={TEAL} />
    <circle cx={1250} cy={320} r={14} fill={CORAL} opacity={blink(t)} />
    <Tx x={1290} y={332} s={30} c={CORAL} a="start">REC</Tx>
  </Cam>
);

export const S11: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g11" a={[960, 540, 1.35]} b={[960, 540, 1.5]}>
    <Ln d="M290 660H1630" t={t} n={14} c={GREY} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <g key={i}>
        <Nd x={400 + i * 224} y={540} t={t} at={4 + i * 5} l="WORD" w={190} h={90} s={28} />
        <Tx x={400 + i * 224} y={710} s={26} c={TEAL} o={ap(t, 8 + i * 5, 4)}>{(i * 0.4).toFixed(2)}</Tx>
      </g>
    ))}
    <path d={`M${kf(t, [[0, 290], [len, 1630]])} 400V740`} stroke={CORAL} strokeWidth={4} />
  </Cam>
);

const ROWS = ['WIDE', 'MEDIUM', 'CLOSE', 'INSERT', 'WIDE'];
export const S12: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g12" a={[960, 520, 1.05]} b={[960, 520, 0.92]}>
    <Nd x={960} y={200} t={t} at={2} l="SHOTS" w={260} h={80} s={32} hot />
    {ROWS.map((r, i) => (
      <g key={i}>
        <Ln d={`M560 ${400 + i * 100}H1360`} t={t} at={6 + i * 4} n={8} c={i === 2 ? CORAL : LN} />
        <Tx x={580} y={380 + i * 100} s={34} a="start" o={ap(t, 10 + i * 4, 4)}>{`SHOT ${i + 1}`}</Tx>
        <Tx x={1340} y={380 + i * 100} s={34} a="end" c={TEAL} o={ap(t, 10 + i * 4, 4)}>{r}</Tx>
      </g>
    ))}
  </Cam>
);

const BL: [number, number][] = [[200, 200], [420, 150], [590, 260], [870, 180], [1070, 220], [1310, 160], [1490, 240]];
export const S13: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g13" a={[700, 520, 2]} b={[1200, 520, 2]}>
    {BL.map(([x, w], i) => (
      <g key={i}>
        <Ln d={`M${x} 490h${w}v100h${-w}Z`} t={t} at={i} n={8} c={GREY} />
        <Ln d={`M${x} 340V620`} t={t} at={6 + i * 6} n={6} c={CORAL} w={4} />
        <Tx x={x + 4} y={670} s={22} c={TEAL} a="start" o={ap(t, 10 + i * 6, 4)}>CUT</Tx>
      </g>
    ))}
  </Cam>
);

export const S14: React.FC<ShotProps> = ({ t, len }) => {
  const k = t < 14 ? 0 : t < 28 ? 1 : 2;
  const fr: [number, number, string][] = [[1000, 560, 'WIDE'], [640, 360, 'MEDIUM'], [300, 170, 'CLOSE']];
  return (
    <Cam t={t} len={len} id="g14" a={[960, 540, 1.25]} b={[960, 540, 1.4]}>
      {fr.map(([w, h, l], i) => (
        <g key={l}>
          <Ln d={Rc(960, 540, w, h)} t={t} at={i * 6} n={12} c={i === k ? CORAL : LN} w={i === k ? 5 : 3} />
          <Tx x={960 - w / 2 + 6} y={540 - h / 2 - 14} s={24} c={TEAL} a="start" o={ap(t, i * 6 + 8, 4)}>{l}</Tx>
        </g>
      ))}
    </Cam>
  );
};

const CODE = ['const S4 = ({ t }) => (', '  <Hero pose={p} />', '  <Draw line={t} />', ')'];
export const S15: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g15" a={[960, 540, 1]} b={[960, 540, 1.1]}>
    <Ln d={Rc(620, 540, 880, 520)} t={t} n={10} c={GREY} />
    {CODE.map((c, i) => <Tx key={i} x={220} y={380 + i * 80} s={32} a="start" c={i === 2 ? CORAL : LN}>{typed(c, t, 8 + i * 12, 0.9)}</Tx>)}
    <Ln d="M1060 540H1320" t={t} at={20} n={10} c={TEAL} />
    <Nd x={1500} y={540} t={t} at={4} l="FRAMES" w={360} h={150} s={44} hot />
  </Cam>
);

const CODE2 = ['hull.move()', 'hull.line()', 'sail.line()', 'sail.close()'];
export const S16: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g16" a={[960, 540, 1.3]} b={[960, 540, 1.45]}>
    <Ln d={Rc(560, 540, 600, 420)} t={t} n={10} c={GREY} />
    {CODE2.map((c, i) => <Tx key={i} x={290} y={440 + i * 70} s={30} a="start">{typed(c, t, 6 + i * 8, 0.8)}</Tx>)}
    <g transform="translate(450 0)">
      <Ln d="M700 700H1100L1040 780H760Z" t={t} at={4} n={10} />
      <Ln d="M900 700V380" t={t} at={12} n={8} />
      <Ln d="M910 400L1060 680H910Z" t={t} at={18} n={10} c={CORAL} w={4} />
      <Ln d="M560 820q30-24 60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0" t={t} at={24} n={12} c={TEAL} w={4} />
    </g>
  </Cam>
);

export const S17: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g17" a={[960, 540, 1.05]} b={[960, 540, 1]}>
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <Ln d={Rc(390 + i * 420, 540, 380, 520)} t={t} at={i * 3} n={10} c={Math.floor(t / 6) % 4 === i ? CORAL : LN} w={Math.floor(t / 6) % 4 === i ? 5 : 3} />
        <Hero look={HERO} pose={{ ...stand(390 + i * 420, 760, 0.55, { yaw: 0.4, armR: { a: 20 + i * 25, b: -10 } }), ...faceAt(t, [[0, 'happy']]) }} rimId="rimBlue" shadow={0} />
      </g>
    ))}
  </Cam>
);

export const S18: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g18" a={[1000, 600, 1.4]} b={[1000, 600, 1.6]}>
    <Nd x={960} y={300} t={t} at={2} l="SOUND" w={300} h={100} s={40} hot />
    <Ln d="M880 600H940L1030 530V750L940 680H880Z" t={t} at={6} n={12} />
    <Ln d="M1075 590a50 50 0 0 1 0 100" t={t} at={14} n={8} c={TEAL} />
    <Ln d="M1125 550a100 100 0 0 1 0 180" t={t} at={19} n={8} c={TEAL} />
    <Ln d="M1175 510a150 150 0 0 1 0 260" t={t} at={24} n={8} c={TEAL} />
  </Cam>
);

const LANES = ['VOICE', 'TICK', 'WHOOSH', 'BED'];
export const S19: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g19" a={[960, 560, 1.5]} b={[960, 560, 1.7]}>
    {LANES.map((l, i) => (
      <g key={l}>
        <Ln d={`M${600 + i * 240} 340V740`} t={t} at={i * 4} n={8} c={GREY} w={8} />
        <path d={Rc(600 + i * 240, 540 + 120 * Math.sin(t * 0.13 + i * 1.4), 70, 40)} fill={DEEP} stroke={i === 2 ? CORAL : LN} strokeWidth={4} />
        <Tx x={600 + i * 240} y={800} s={26} c={TEAL} o={ap(t, 6 + i * 4, 4)}>{l}</Tx>
      </g>
    ))}
  </Cam>
);

export const S20: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g20" a={[960, 540, 1.15]} b={[960, 540, 0.95]}>
    <Wave x={100} y={540} n={88} gap={20} amp={100} t={t} />
    {[360, 620, 900, 1180, 1420, 1660].map((x, i) => <Ln key={x} d={`M${x} 330V750`} t={t} at={10 + i * 5} n={6} c={CORAL} w={4} />)}
    <Dm x1={100} x2={1840} y={300} l="MUSIC BED" t={t} at={8} />
  </Cam>
);

export const S21: React.FC<ShotProps> = ({ t, len }) => {
  const lv = 9 * easeOut(ap(t, 0, 10)) + 4 * Math.sin(t * 0.45) * Math.exp(-t / 16);
  return (
    <Cam t={t} len={len} id="g21" a={[960, 540, 1.5]} b={[960, 540, 1.65]}>
      <Nd x={960} y={260} t={t} at={2} l="MASTER" w={300} h={100} s={40} hot />
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={880} y={820 - (i + 1) * 42 + 6} width={160} height={34} fill={i < lv ? (i < 9 ? TEAL : CORAL) : DEEP} stroke={MID} strokeWidth={2} />)}
      <path d="M840 444H1080" stroke={CORAL} strokeWidth={3} strokeDasharray="10 8" />
      <Tx x={820} y={600} s={26} c={TEAL} a="end">LEVEL</Tx>
    </Cam>
  );
};

export const S22: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g22" a={[960, 540, 1.4]} b={[960, 540, 1.55]}>
    <Wave x={380} y={540} n={40} gap={30} amp={kf(t, [[0, 170], [20, 75]])} t={t} />
    {[465, 615].map((y) => <path key={y} d={`M340 ${y}H1590`} stroke={TEAL} strokeWidth={3} strokeDasharray="12 10" />)}
    <Tx x={960} y={730} s={36} c={CORAL} o={ap(t, 18, 6)}>EVEN</Tx>
  </Cam>
);

export const S23: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g23" a={[1100, 560, 1]} b={[1060, 560, 1.05]}>
    <Rail t={t} full hot={[7]} />
    <g transform={`translate(${1730 + 420 * easeOut(ap(t, 4, len - 8))} 540)`}>
      <path d={Rc(0, 0, 230, 140)} fill={DEEP} stroke={LN} strokeWidth={4} />
      <path d="M-24 -30L36 0L-24 30Z" fill={CORAL} />
    </g>
    <Hero look={FRIEND} pose={{ ...stand(1500, 1010, 0.5, { yaw: 0.5 }), ...faceAt(t, [[0, 'happy']]) }} rimId="rimBlue" shadow={0} />
  </Cam>
);

export const S24: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g24" a={[960, 520, 1.4]} b={[960, 520, 1.6]}>
    <Ln d={Rc(960, 520, 760, 430)} t={t} n={12} />
    <Ln d="M900 420L1050 520L900 620Z" t={t} at={8} n={10} c={CORAL} w={5} />
    <Ln d="M1230 650l30 34 60-70" t={t} at={18} n={8} c={TEAL} w={6} />
    <Dm x1={580} x2={1340} y={270} l="FINISHED" t={t} at={12} />
  </Cam>
);

export const S25: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g25" a={[960, 540, 1.4]} b={[960, 540, 1.6]}>
    <g transform={`rotate(${t * 1.5} 960 520)`} fill="none" stroke={LN} strokeWidth={4}>
      <circle cx={960} cy={520} r={110} />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={942} y={370} width={36} height={44} transform={`rotate(${i * 36} 960 520)`} />)}
      <circle cx={960} cy={520} r={36} stroke={CORAL} />
    </g>
    <Tx x={960} y={790} s={36} c={TEAL} o={ap(t, 6, 6)}>ENGINE</Tx>
  </Cam>
);

export const S26: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g26" a={[960, 540, 0.95]} b={[960, 540, 1.05]}>
    <Nd x={630} y={260} t={t} at={2} l="CAST" w={300} h={90} s={36} hot />
    <Nd x={1420} y={260} t={t} at={6} l="SETS" w={300} h={90} s={36} />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <Ln d={Rc(1180 + i * 240, 560, 210, 140)} t={t} at={8 + i * 5} n={8} />
        <Ln d={`M${1075 + i * 240} 590H${1285 + i * 240}`} t={t} at={14 + i * 5} n={8} c={TEAL} w={2} />
      </g>
    ))}
    <Hero look={HERO} pose={{ ...stand(480, 900, 0.7, { yaw: 0.4 }), ...faceAt(t, [[0, 'happy']]) }} rimId="rimBlue" shadow={0} />
    <Hero look={FRIEND} pose={{ ...stand(780, 900, 0.7, { yaw: -0.4 }), ...faceAt(t, [[0, 'happy']]) }} rimId="rimBlueL" shadow={0} />
  </Cam>
);

export const S27: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g27" a={[960, 540, 1.35]} b={[960, 540, 1.5]}>
    <Doc x={700} y={520} t={t} at={0} l="SCRIPTS" />
    <Doc x={1220} y={520} t={t} at={10} l="GUIDES" />
  </Cam>
);

export const S28: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g28" a={[960, 560, 1.3]} b={[1000, 560, 1.45]}>
    {[0, 1].map((i) => (
      <g key={i}>
        <path d={Rc(1300, 430 + i * 210, 480, 110)} fill="none" stroke={CORAL} strokeWidth={4} strokeDasharray="14 10" opacity={ap(t, 4 + i * 4, 4) * (0.55 + 0.45 * blink(t))} />
        <Tx x={1300} y={445 + i * 210} s={32} o={ap(t, 6 + i * 4, 4)}>{i ? 'WRITING KEY' : 'VOICE KEY'}</Tx>
      </g>
    ))}
    <Hero look={HERO} pose={{ ...stand(560, 940, 0.85, { yaw: 0.5, armR: { a: kf(t, [[0, 14], [8, 14], [18, 72]]), b: -6 } }), ...faceAt(t, [[0, 'happy']]) }} rimId="rimBlue" shadow={0} />
  </Cam>
);

export const S29: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g29" a={[1000, 540, 1.5]} b={[1000, 540, 1.7]}>
    {[0, 1].map((i) => (
      <g key={i}>
        <Ln d={Rc(1250, 440 + i * 200, 500, 110)} t={t} n={8} c={t > 18 ? TEAL : LN} w={4} />
        <Tx x={1250} y={452 + i * 200} s={30} c={t > 18 ? TEAL : LN}>{i ? 'WRITING KEY' : 'VOICE KEY'}</Tx>
        <Key x={420 + 360 * easeOut(ap(t, 2 + i * 3, 14))} y={440 + i * 200} />
      </g>
    ))}
  </Cam>
);

export const S30: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g30" a={[1000, 560, 1.4]} b={[1000, 560, 1.55]}>
    <Ln d={Rc(700, 560, 520, 360)} t={t} n={12} />
    <Ln d="M440 480H960" t={t} at={8} n={8} c={TEAL} />
    <Tx x={700} y={600} s={44} o={ap(t, 8, 6)}>SYSTEM</Tx>
    <Key x={1230} y={560} c={GREY} o={0.7} />
    <Ln d="M1180 420L1500 700" t={t} at={14} n={10} c={CORAL} w={8} />
    <Dm x1={1170} x2={1470} y={400} l="YOUR OWN" t={t} at={10} />
    <Tx x={1340} y={790} s={28} c={CORAL} o={ap(t, 20, 6)}>NOT INCLUDED</Tx>
  </Cam>
);

export const S31: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g31" a={[960, 540, 1]} b={[960, 540, 0.93]}>
    <Rail t={t} step={3} hot={[0, 7]} />
    <circle cx={190 + ((t * 9) % 1540)} cy={540} r={12} fill={CORAL} opacity={ap(t, 28, 4)} />
  </Cam>
);

export const S32: React.FC<ShotProps> = ({ t, len }) => (
  <Cam t={t} len={len} id="g32" a={[960, 540, 1.5]} b={[960, 540, 1.65]}>
    <Nd x={960} y={540} t={t} at={0} l="FULL SYSTEM" w={1000} h={220} s={84} hot />
    <Dm x1={460} x2={1460} y={700} l="ENGINE CAST SETS SCRIPTS GUIDES" t={t} at={10} />
  </Cam>
);

const LINK = 'LINK IN THE ABOUT SECTION';
export const S33: React.FC<ShotProps> = ({ t, len }) => {
  const s = typed(LINK, t, 4, 0.8);
  return (
    <Cam t={t} len={len} id="g33" a={[960, 560, 1.5]} b={[960, 560, 1.6]}>
      <Tx x={562} y={600} s={48} a="start">{s}</Tx>
      <rect x={562 + s.length * 31.8} y={558} width={22} height={56} fill={CORAL} opacity={blink(t)} />
      <Ln d="M562 640H1358" t={t} at={36} n={12} c={CORAL} w={4} />
    </Cam>
  );
};
