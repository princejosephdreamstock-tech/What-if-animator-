import React from 'react';
import { Hero, Pose, basePose, kf, clamp, backOut, rnd, camT, LOOKS, LEG_LEN, HEAD, Rooftop, Study, Desk, walkPose, FONT, ShotProps } from '../../engine';

const HERO = { ...LOOKS.pip, skin: '#C98E68', skinShade: '#B07A58', hand: '#C98E68', jacket: '#2BA6A0', jacketShade: '#1F837E', accent: '#F26B5B', shoe: '#F26B5B', hair: '#1A1A22' };
const FRIEND = { ...LOOKS.mo, jacket: '#F2C14E', jacketShade: '#C99A2E', accent: '#2BA6A0' };
const C = { b0: '#0A1E2C', b1: '#0F2A3D', b2: '#143650', co: '#F26B5B', te: '#2BA6A0', w: '#FFFFFF', g1: '#D5DCE0', g2: '#8FA0AA', g3: '#3C4D58' };
const LINE = 'make: why we dream';
const FId = React.createContext('sd');
const pop = (t: number, d: number) => backOut(clamp((t - d) / 8));
const typed = (s: string, t: number, start: number, cps: number) => s.slice(0, Math.max(0, Math.min(s.length, Math.floor((t - start) * cps))));
const body = (x: number, g: number, sc: number, extra: Partial<Pose> = {}): Pose => ({ ...basePose, x, y: g - LEG_LEN * sc, scale: sc, yaw: 0.35, look: 0.3, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 }, ...extra });
const bust = (x: number, hy: number, sc: number, extra: Partial<Pose> = {}): Pose => ({ ...basePose, x, y: hy - HEAD.y * sc, scale: sc, yaw: 0.2, look: 0.2, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 }, ...extra });

const Sc: React.FC<{ n: number; t: number; len: number; bg?: string; z?: [number, number]; c?: [number, number]; children: React.ReactNode }> = ({ n, t, len, bg = C.b0, z = [1, 1.08], c = [960, 540], children }) => (
  <g transform={camT(c[0], c[1], kf(t, [[0, z[0]], [len, z[1]]]))}>
    <defs>
      <filter id={`sd${n}`} x="-30%" y="-30%" width="170%" height="170%">
        <feDropShadow dx={9} dy={11} stdDeviation={0} floodColor="#04101A" />
      </filter>
    </defs>
    <rect x={-1400} y={-900} width={4720} height={2880} fill={bg} />
    {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={rnd(n, i) * 1920} cy={rnd(n + 50, i) * 1080} r={14 + rnd(n + 90, i) * 40} fill={C.b2} opacity={0.6} />)}
    <FId.Provider value={`sd${n}`}>{children}</FId.Provider>
  </g>
);

const Stk: React.FC<{ x: number; y: number; t: number; d?: number; r?: number; s?: number; children: React.ReactNode }> = ({ x, y, t, d = 10, r = 0, s = 1, children }) => {
  const id = React.useContext(FId);
  const k = pop(t, d);
  if (k <= 0) return null;
  const q = clamp((t - d - 8) / 14);
  return (
    <g transform={`translate(${x} ${y + Math.sin(t / 8 + x) * 4}) rotate(${r + Math.sin(q * Math.PI * 2) * 7 * (1 - q)}) scale(${k * s})`} filter={`url(#${id})`}>
      <g stroke="#fff" strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" paintOrder="stroke fill">{children}</g>
    </g>
  );
};

const HeroAt: React.FC<{ look: any; x: number; y: number; sc: number; t: number; d?: number; extra?: Partial<Pose> }> = ({ look, x, y, sc, t, d = 4, extra = {} }) => {
  const k = pop(t, d);
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`}>
      <Hero look={look} pose={bust(x, y, sc, extra)} shadow={0} />
    </g>
  );
};

const R: React.FC<{ w: number; h: number; f: string; x?: number; y?: number; rx?: number }> = ({ w, h, f, x = 0, y = 0, rx = 24 }) => <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={rx} fill={f} />;
const Ln: React.FC<{ a: [number, number]; b: [number, number]; c: string; w?: number }> = ({ a, b, c, w = 16 }) => (
  <>
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#fff" strokeWidth={w + 14} strokeLinecap="round" />
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} strokeLinecap="round" />
  </>
);
const Tx: React.FC<{ s?: number; c?: string; children: string }> = ({ s = 60, c = C.b0, children }) => (
  <text x={0} y={s * 0.35} textAnchor="middle" fontFamily={FONT.title} fontSize={s} fill={c} stroke="none" letterSpacing={2}>{children}</text>
);
const Pl: React.FC<{ w: number; f: string; c?: string; s?: number; children: string }> = ({ w, f, c = C.w, s = 56, children }) => (
  <>
    <R w={w} h={s * 1.7} f={f} rx={s * 0.85} />
    <Tx s={s} c={c}>{children}</Tx>
  </>
);

const IClip: React.FC = () => (
  <>
    <R w={420} h={240} f={C.te} />
    <R w={260} h={120} f={C.b1} rx={16} />
    {[-160, -53, 53, 160].flatMap((x) => [<R key={`a${x}`} x={x} y={-92} w={44} h={28} f={C.w} rx={7} />, <R key={`b${x}`} x={x} y={92} w={44} h={28} f={C.w} rx={7} />])}
    <polygon points="-24,-38 -24,38 40,0" fill={C.w} stroke="none" />
  </>
);
const ITl: React.FC = () => (
  <>
    <R w={820} h={440} f={C.w} rx={36} />
    {[{ x: -250, w: 220, f: C.te }, { x: 180, w: 210, f: C.co }, { x: 40, w: 150, f: C.co }, { x: -300, w: 150, f: C.g2 }, { x: -130, w: 280, f: C.co }, { x: 140, w: 200, f: C.te }].map((o, i) => (
      <R key={i} x={o.x} y={-120 + (i % 3) * 110} w={o.w} h={64} f={o.f} rx={14} />
    ))}
    <rect x={-6} y={-200} width={12} height={400} fill={C.b0} stroke="none" />
  </>
);
const IDoc: React.FC<{ p?: number }> = ({ p = 1 }) => (
  <>
    <R w={310} h={400} f={C.w} />
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-110} y={-140 + i * 62} width={Math.max(0, (i === 4 ? 120 : 220) * clamp(p * 5 - i))} height={24} rx={12} fill={i === 0 ? C.co : C.g2} stroke="none" />)}
  </>
);
const IMic: React.FC = () => (
  <>
    <path d="M-115 0 A115 115 0 0 0 115 0" fill="none" stroke="#fff" strokeWidth={44} strokeLinecap="round" />
    <path d="M-115 0 A115 115 0 0 0 115 0" fill="none" stroke={C.g1} strokeWidth={22} strokeLinecap="round" />
    <Ln a={[0, 115]} b={[0, 185]} c={C.g1} />
    <Ln a={[-80, 190]} b={[80, 190]} c={C.g1} />
    <R w={140} h={270} f={C.co} y={-60} rx={70} />
  </>
);
const IWave: React.FC<{ t: number }> = ({ t }) => (
  <>
    <R w={560} h={300} f={C.b0} />
    {Array.from({ length: 9 }, (_, i) => <R key={i} x={(i - 4) * 56} w={32} h={50 + 170 * Math.abs(Math.sin(t / 5 + i * 1.3))} f={i % 2 ? C.te : C.co} rx={16} />)}
  </>
);
const IScis: React.FC<{ o?: number }> = ({ o = 0 }) => (
  <>
    <g transform={`rotate(${-o} 20 0)`}>
      <Ln a={[-90, 100]} b={[190, -30]} c={C.g1} w={26} />
      <circle cx={-110} cy={105} r={58} fill={C.co} />
      <circle cx={-110} cy={105} r={24} fill={C.b0} />
    </g>
    <g transform={`rotate(${o} 20 0)`}>
      <Ln a={[-90, -100]} b={[190, 30]} c={C.g1} w={26} />
      <circle cx={-110} cy={-105} r={58} fill={C.co} />
      <circle cx={-110} cy={-105} r={24} fill={C.b0} />
    </g>
  </>
);
const IMoon: React.FC = () => (
  <>
    <circle r={190} fill="#E9EEF1" />
    <circle cx={-70} cy={-50} r={36} fill={C.g1} stroke="none" />
    <circle cx={60} cy={70} r={52} fill={C.g1} stroke="none" />
    <circle cx={80} cy={-90} r={22} fill={C.g1} stroke="none" />
  </>
);
const ITerm: React.FC<{ s?: string; t: number }> = ({ s = '', t }) => (
  <>
    <R w={640} h={380} f={C.b0} />
    <R w={640} h={70} y={-155} f={C.g3} rx={24} />
    {[-270, -220, -170].map((x, i) => <circle key={x} cx={x} cy={-155} r={14} fill={[C.co, C.g1, C.te][i]} stroke="none" />)}
    <text x={-280} y={30} fontFamily={FONT.ui} fontSize={44} fill={C.te} stroke="none">{`> ${s}${Math.floor(t / 8) % 2 ? '_' : ''}`}</text>
  </>
);
const ITv: React.FC = () => (
  <>
    <R w={560} h={380} f={C.te} />
    <R w={450} h={290} f={C.b0} rx={18} />
    <polygon points="-40,-70 -40,70 80,0" fill={C.co} />
    <Ln a={[-60, 225]} b={[60, 225]} c={C.g1} w={14} />
  </>
);
const IList: React.FC<{ t: number }> = ({ t }) => (
  <>
    <R w={560} h={430} f={C.w} rx={36} />
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(0 ${-120 + i * 120})`}>
        <circle cx={-190} r={40} fill={C.te} />
        <path d="M-208 0 L-193 16 L-170 -14" fill="none" stroke={C.w} strokeWidth={12} strokeLinecap="round" opacity={clamp((t - 8 - i * 7) / 4)} />
        <R x={50} w={300} h={44} f={i === 1 ? C.co : C.g2} rx={22} />
      </g>
    ))}
  </>
);
const IKey: React.FC<{ f: string }> = ({ f }) => (
  <>
    <Ln a={[-40, 0]} b={[200, 0]} c={C.g1} w={34} />
    <Ln a={[140, 0]} b={[140, 60]} c={C.g1} w={24} />
    <Ln a={[200, 0]} b={[200, 56]} c={C.g1} w={24} />
    <circle cx={-110} r={95} fill={f} />
    <circle cx={-110} r={36} fill={C.b0} />
  </>
);
const IBox: React.FC = () => (
  <>
    <R w={440} h={320} f={C.co} y={30} />
    <polygon points="-220,-110 220,-110 170,-20 -170,-20" fill={C.te} />
    <R w={160} h={34} f={C.w} y={110} rx={17} />
  </>
);
const IBook: React.FC = () => (
  <>
    <R w={400} h={310} f={C.te} />
    <R w={340} h={250} f={C.w} x={16} rx={16} />
    {[-60, 0, 60].map((y) => <rect key={y} x={-120} y={y - 10} width={230} height={20} rx={10} fill={C.g2} stroke="none" />)}
  </>
);
const IGear: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`rotate(${t * 2})`}>
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-26} y={-175} width={52} height={70} rx={10} fill={C.te} transform={`rotate(${i * 45})`} />)}
    <circle r={135} fill={C.te} />
    <circle r={52} fill={C.b0} />
  </g>
);
const IMeter: React.FC<{ t: number }> = ({ t }) => (
  <>
    <R w={480} h={340} f={C.b0} />
    {Array.from({ length: 7 }, (_, i) => {
      const h = 40 + 36 * i * clamp((t - 6) / 24);
      return <R key={i} x={(i - 3) * 62} y={130 - h / 2} w={40} h={h} f={i < 5 ? C.te : C.co} rx={10} />;
    })}
  </>
);
const ISl: React.FC<{ t: number }> = ({ t }) => (
  <>
    <R w={560} h={400} f={C.w} rx={36} />
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <R x={(i - 1.5) * 120} w={22} h={290} f={C.g2} rx={11} />
        <R x={(i - 1.5) * 120} y={Math.sin(t / 7 + i * 1.7) * 90} w={80} h={46} f={i % 2 ? C.te : C.co} rx={14} />
      </g>
    ))}
  </>
);
const IExp: React.FC<{ p: number }> = ({ p }) => (
  <>
    <R w={460} h={300} f={C.b0} />
    <R w={360} h={40} y={100} f={C.g3} rx={20} />
    <R x={-180 + 180 * p} w={360 * p} h={40} y={100} f={C.te} rx={20} />
    <polygon points="0,-110 70,-30 28,-30 28,30 -28,30 -28,-30 -70,-30" fill={C.co} />
  </>
);
const IHead: React.FC = () => (
  <>
    <path d="M-170 220 Q-170 90 0 90 Q170 90 170 220 Z" fill={HERO.jacket} />
    <circle cy={-20} r={130} fill={HERO.skin} />
    <path d="M-130 -40 Q-120 -170 0 -165 Q120 -170 130 -40 Q60 -110 -130 -40 Z" fill={HERO.hair} />
  </>
);
const IStar: React.FC<{ f?: string }> = ({ f = C.co }) => <polygon points="0,-80 20,-20 80,0 20,20 0,80 -20,20 -80,0 -20,-20" fill={f} />;
const IClock: React.FC<{ t: number }> = ({ t }) => (
  <>
    <circle r={120} fill={C.w} />
    <g transform={`rotate(${t * 6})`}><Ln a={[0, 0]} b={[0, -85]} c={C.co} w={14} /></g>
    <Ln a={[0, 0]} b={[50, 20]} c={C.b0} w={14} />
  </>
);
const IStrip: React.FC<{ t: number }> = ({ t }) => (
  <>
    <R w={900} h={250} f={C.w} rx={36} />
    {[{ x: -330, w: 120 }, { x: -170, w: 100 }, { x: -30, w: 150 }, { x: 150, w: 110 }, { x: 300, w: 120 }].map((o, i) => <R key={i} x={o.x} w={o.w} h={90} f={i % 2 ? C.te : C.co} rx={18} />)}
    <rect x={((t * 9) % 760) - 386} y={-110} width={12} height={220} fill={C.b0} stroke="none" />
  </>
);
const ICard: React.FC<{ i: number }> = ({ i }) => (
  <>
    <R w={380} h={300} f={[C.te, C.co, C.g2][i]} />
    {i === 0 && (<><R y={-40} w={150} h={110} f={C.b0} rx={10} /><circle cx={40} cy={-60} r={24} fill={C.w} stroke="none" /></>)}
    {i === 1 && (<><circle cx={-60} cy={-30} r={60} fill={C.w} /><R y={100} w={300} h={50} f={C.b0} rx={14} /></>)}
    {i === 2 && <polygon points="-140,110 -140,40 -70,40 -70,-10 0,-10 0,-60 70,-60 70,-110 140,-110 140,110" fill={C.b0} />}
  </>
);

type RP = ShotProps & { v: number };
const RoofWide: React.FC<RP> = ({ t, len, v }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1], [len, 1.12]]))}>
    <Rooftop t={t + 20 * v} id={`rw${v}`} />
    <Hero look={v ? FRIEND : HERO} pose={walkPose(v ? 1500 - t * 7 : 420 + t * 7, t * 0.6, 820, 0.9, {}, v ? -1 : 1)} rimId="rimR" shadow={0} />
  </g>
);
const RoofClose: React.FC<RP> = ({ t, len, v }) => (
  <g transform={camT(v ? 880 : 1040, 600, kf(t, [[0, 3], [len, 3.5]]))}>
    <Rooftop t={t + 60 + 30 * v} id={`rc${v}`} />
    <Hero look={v ? FRIEND : HERO} pose={bust(v ? 880 : 1040, 600, 1.15, { yaw: v ? -0.4 : 0.4, expr: 'happy' })} rimId={v ? 'rimL' : 'rimR'} shadow={0} />
  </g>
);
const RoofLow: React.FC<RP> = ({ t, len, v }) => (
  <g transform={camT(1060, 640, kf(t, [[0, 1.5], [len, 1.62]]))}>
    <Rooftop t={t + 90} id={`rl${v}`} low={90} />
    <Hero look={HERO} pose={body(v ? 1200 : 860, 910, 1, { yaw: 0.5 })} rimId="rimR" shadow={0} />
    <Hero look={FRIEND} pose={body(v ? 860 : 1260, 910, 1, { yaw: -0.5 })} rimId="rimL" shadow={0} />
  </g>
);

export const S1: React.FC<ShotProps> = (p) => <RoofWide {...p} v={0} />;
export const S2: React.FC<ShotProps> = (p) => <RoofClose {...p} v={0} />;
export const S3: React.FC<ShotProps> = (p) => <RoofLow {...p} v={0} />;

export const S4: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={4} t={t} len={len} bg={C.b1} z={[1.2, 1.32]}>
    <Stk x={960} y={560} t={t} d={-3}><ITl /></Stk>
    <Stk x={kf(t, [[0, 700], [len, 1080]])} y={470} t={t} d={-3} r={-6} s={0.34}><IClip /></Stk>
    <Stk x={1400} y={300} t={t} r={8}><Pl w={300} f={C.co}>12:00</Pl></Stk>
  </Sc>
);

export const S5: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={5} t={t} len={len} z={[1.3, 1.5]} c={[1000, 560]}>
    <Stk x={760} y={400} t={t} d={-3} r={-8}><IMoon /></Stk>
    <Stk x={1180} y={640} t={t} d={-3}><circle r={270} fill={C.co} /></Stk>
    <HeroAt look={HERO} x={1180} y={640} sc={1.25} t={t} d={-3} extra={{ expr: 'tired' }} />
    <Stk x={800} y={800} t={t} r={5}><Pl w={300} f={C.w} c={C.b0}>12:00</Pl></Stk>
  </Sc>
);

export const S6: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={6} t={t} len={len} bg={C.b2} z={[1.15, 1.25]}>
    <Stk x={940} y={520} t={t} d={-3} r={-4} s={1.6}><IDoc p={clamp((t - 4) / 24)} /></Stk>
    <Stk x={1380} y={780} t={t} r={6}><Pl w={330} f={C.te}>WRITE</Pl></Stk>
  </Sc>
);

export const S7: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={7} t={t} len={len} bg={C.b1} z={[1.25, 1.4]}>
    <Stk x={720} y={540} t={t} d={-3} r={-6} s={1.1}><IMic /></Stk>
    <Stk x={1230} y={580} t={t}><IWave t={t} /></Stk>
    <Stk x={720} y={250} t={t} d={24} r={-5}><Pl w={240} f={C.co}>REC</Pl></Stk>
  </Sc>
);

export const S8: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={8} t={t} len={len} bg={C.b2} z={[1.4, 1.55]} c={[1000, 540]}>
    <Stk x={900} y={600} t={t} d={-3} r={-4} s={1.2}><IClip /></Stk>
    <Stk x={1300} y={340} t={t} r={8}><IScis o={12 + 10 * Math.sin(t / 3)} /></Stk>
    <Stk x={760} y={880} t={t} d={24} r={-4}><Pl w={240} f={C.co}>CUT</Pl></Stk>
  </Sc>
);

export const S9: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={9} t={t} len={len} z={[1.25, 1.4]}>
    <Stk x={960} y={540} t={t} d={-3} r={3} s={1.5}><ISl t={t} /></Stk>
    <Stk x={1420} y={250} t={t} r={8}><Pl w={240} f={C.te}>MIX</Pl></Stk>
  </Sc>
);

export const S10: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={10} t={t} len={len} bg={C.b1} z={[1.15, 1.25]}>
    <Stk x={960} y={540} t={t} d={-3} r={-3} s={1.5}><IExp p={clamp((t - 8) / 40)} /></Stk>
    <Stk x={1400} y={250} t={t} r={7}><Pl w={330} f={C.co}>EXPORT</Pl></Stk>
  </Sc>
);

export const S11: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={11} t={t} len={len} bg={C.b2} z={[1.3, 1.45]}>
    <Stk x={960} y={520} t={t} d={-3} s={1.6}><IHead /></Stk>
    <Stk x={960} y={880} t={t} r={-3}><Pl w={420} f={C.co}>FACELESS</Pl></Stk>
  </Sc>
);

export const S12: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={12} t={t} len={len} z={[1, 1.06]}>
    <Stk x={960} y={500} t={t} d={-3} s={1.5}><ITerm t={t} /></Stk>
    <Stk x={1430} y={860} t={t} r={6}><Pl w={400} f={C.te}>TERMINAL</Pl></Stk>
  </Sc>
);

export const S13: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={13} t={t} len={len} bg={C.b1} z={[1, 1.06]}>
    <Stk x={960} y={540} t={t} d={-3} s={2}><ITerm s={typed(LINE, t, 6, 0.5)} t={t} /></Stk>
  </Sc>
);

export const S14: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={14} t={t} len={len} bg={C.b2} z={[1, 1.06]}>
    <Stk x={400} y={540} t={t} d={-3} r={-5} s={0.85}><IDoc p={1} /></Stk>
    <Stk x={760} y={540} t={t} d={10} r={4} s={0.9}><IMic /></Stk>
    <Stk x={1130} y={540} t={t} d={24} r={-4} s={0.55}><IList t={t} /></Stk>
    <Stk x={1500} y={540} t={t} d={38} r={5} s={0.8}><IClip /></Stk>
  </Sc>
);

export const S15: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={15} t={t} len={len} z={[1.1, 1.2]}>
    <Stk x={900} y={540} t={t} d={-3} r={3} s={1.7}><IDoc p={clamp((t - 6) / 28)} /></Stk>
    <Stk x={1430} y={300} t={t} r={7}><Pl w={360} f={C.co}>SCRIPT</Pl></Stk>
  </Sc>
);

export const S16: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={16} t={t} len={len} bg={C.b1} z={[1.35, 1.5]}>
    <Stk x={700} y={540} t={t} d={-3} r={-5} s={1.5}><IMic /></Stk>
    <Stk x={1260} y={560} t={t} s={1.1}><IWave t={t} /></Stk>
  </Sc>
);

export const S17: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={17} t={t} len={len} bg={C.b2} z={[1.2, 1.32]}>
    <Stk x={960} y={680} t={t} d={-3} r={-2}><IStrip t={t} /></Stk>
    <Stk x={960} y={330} t={t} r={4}><IClock t={t} /></Stk>
  </Sc>
);

export const S18: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={18} t={t} len={len} z={[1.15, 1.25]}>
    <Stk x={940} y={540} t={t} d={-3} r={-3} s={1.5}><IList t={t} /></Stk>
    <Stk x={1430} y={250} t={t} r={7}><Pl w={330} f={C.te}>SHOTS</Pl></Stk>
  </Sc>
);

export const S19: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={19} t={t} len={len} bg={C.b1} z={[1.35, 1.5]}>
    <Stk x={960} y={600} t={t} d={-3} r={-3} s={1.3}><IClip /></Stk>
    <Stk x={960} y={300} t={t} r={4} s={0.8}><IScis o={14 + 12 * Math.sin(t / 3)} /></Stk>
    <Stk x={960} y={880} t={t} d={22} r={-3}><Pl w={520} f={C.co}>ON THE WORD</Pl></Stk>
  </Sc>
);

export const S20: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={20} t={t} len={len} bg={C.b2} z={[1, 1.06]}>
    <Stk x={640} y={540} t={t} d={-3} r={-4}><R w={420} h={300} f={C.b0} /><Tx s={150} c={C.te}>{'</>'}</Tx></Stk>
    <Stk x={1280} y={540} t={t} r={4} s={0.85}><ITv /></Stk>
  </Sc>
);

export const S21: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={21} t={t} len={len} bg={C.b1} z={[1.05, 1.15]} c={[960, 560]}>
    <Stk x={900} y={620} t={t} d={-3}><circle r={290} fill={C.te} /></Stk>
    <HeroAt look={HERO} x={900} y={620} sc={1.4} t={t} d={-3} extra={{ expr: 'happy' }} />
    <Stk x={1440} y={330} t={t} r={7}><Pl w={330} f={C.co}>YOURS</Pl></Stk>
  </Sc>
);

export const S22: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={22} t={t} len={len} z={[1.3, 1.45]}>
    <Stk x={960} y={500} t={t} d={-3} r={-3} s={1.5}><IWave t={t} /></Stk>
    <Stk x={960} y={880} t={t} r={3}><Pl w={360} f={C.te}>SOUND</Pl></Stk>
  </Sc>
);

export const S23: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={23} t={t} len={len} bg={C.b2} z={[1.25, 1.4]}>
    <Stk x={900} y={560} t={t} d={-3} r={-3} s={1.5}><IMeter t={t} /></Stk>
    <Stk x={1400} y={320} t={t} d={18} r={8}>
      <circle r={90} fill={C.te} />
      <path d="M-42 4 L-12 36 L46 -30" fill="none" stroke={C.w} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
    </Stk>
    <Stk x={640} y={880} t={t} r={-4}><Pl w={330} f={C.co}>MASTER</Pl></Stk>
  </Sc>
);

export const S24: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={24} t={t} len={len} bg={C.b1} z={[1, 1.06]}>
    <Stk x={450} y={540} t={t} d={-3} r={-4}><Pl w={400} f={C.w} c={C.b0} s={52}>voice.py</Pl></Stk>
    <Stk x={960} y={540} t={t} d={10} r={3}><Pl w={400} f={C.te} s={52}>plan.py</Pl></Stk>
    <Stk x={1470} y={540} t={t} d={22} r={-3}><Pl w={400} f={C.co} s={52}>master.py</Pl></Stk>
  </Sc>
);

export const S25: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={25} t={t} len={len} bg={C.b2} z={[1.25, 1.4]}>
    <Stk x={960} y={560} t={t} d={-3} r={-3} s={1.6}><ITv /></Stk>
    <Stk x={1500} y={280} t={t} d={8} r={10}><IStar /></Stk>
    <Stk x={420} y={800} t={t} d={14} r={-10}><IStar f={C.te} /></Stk>
  </Sc>
);

export const S26: React.FC<ShotProps> = (p) => <RoofWide {...p} v={1} />;
export const S27: React.FC<ShotProps> = (p) => <RoofClose {...p} v={1} />;
export const S28: React.FC<ShotProps> = (p) => <RoofLow {...p} v={1} />;

export const S29: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 940], [len, 990]]), 580, kf(t, [[0, 1.5], [len, 1.65]]))}>
    <Study t={t + 80} id="st29" night />
    <Hero look={HERO} pose={{ ...basePose, x: 960, y: 712, yaw: 0.45, look: 0.6, armL: { a: 14, b: -6 }, armR: { a: 40 + 22 * Math.sin(t / 6), b: -20 }, expr: 'happy' }} rimId="rimR" shadow={0} />
    <Desk x0={560} x1={1360} y={700} />
  </g>
);

export const S30: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={30} t={t} len={len} bg={C.b1} z={[1.2, 1.3]}>
    <Stk x={940} y={540} t={t} d={-3} r={-3} s={1.5}><IBox /></Stk>
    <Stk x={1430} y={290} t={t} r={7}><Pl w={330} f={C.co}>YOURS</Pl></Stk>
  </Sc>
);

export const S31: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={31} t={t} len={len} bg={C.b2} z={[1.3, 1.45]}>
    <Stk x={780} y={540} t={t} d={-3} s={1.3}><IGear t={t} /></Stk>
    <Stk x={1250} y={360} t={t} s={0.6}><IGear t={-t} /></Stk>
    <Stk x={1280} y={800} t={t} r={5}><Pl w={380} f={C.co}>ENGINE</Pl></Stk>
  </Sc>
);

export const S32: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={32} t={t} len={len} z={[1.05, 1.15]} c={[960, 580]}>
    <Stk x={640} y={620} t={t} d={-3}><circle r={260} fill={C.te} /></Stk>
    <HeroAt look={HERO} x={640} y={620} sc={1.3} t={t} d={-3} extra={{ yaw: 0.35 }} />
    <Stk x={1280} y={620} t={t} d={10}><circle r={260} fill={C.co} /></Stk>
    <HeroAt look={FRIEND} x={1280} y={620} sc={1.3} t={t} d={14} extra={{ yaw: -0.35 }} />
    <Stk x={960} y={960} t={t} d={24} r={-3}><Pl w={300} f={C.w} c={C.b0}>CAST</Pl></Stk>
  </Sc>
);

export const S33: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={33} t={t} len={len} bg={C.b1} z={[1, 1.06]}>
    <Stk x={450} y={520} t={t} d={-3} r={-5}><ICard i={0} /></Stk>
    <Stk x={960} y={520} t={t} d={10} r={2}><ICard i={1} /></Stk>
    <Stk x={1470} y={520} t={t} d={22} r={5}><ICard i={2} /></Stk>
    <Stk x={960} y={900} t={t} d={34} r={-3}><Pl w={300} f={C.co}>SETS</Pl></Stk>
  </Sc>
);

export const S34: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={34} t={t} len={len} bg={C.b2} z={[1.2, 1.32]}>
    <Stk x={960} y={540} t={t} d={-3} r={-2} s={1.8}><ITerm s={typed('bash run_episode.sh', t, 6, 0.6)} t={t} /></Stk>
  </Sc>
);

export const S35: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={35} t={t} len={len} z={[1.3, 1.45]}>
    <Stk x={940} y={540} t={t} d={-3} r={-4} s={1.6}><IBook /></Stk>
    <Stk x={1440} y={300} t={t} r={7}><Pl w={360} f={C.co}>GUIDES</Pl></Stk>
  </Sc>
);

export const S36: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={36} t={t} len={len} bg={C.b1} z={[1.1, 1.2]}>
    <Stk x={760} y={480} t={t} d={-3} r={-12} s={1.1}><IKey f={C.co} /></Stk>
    <Stk x={1160} y={650} t={t} d={24} r={10} s={1.1}><IKey f={C.te} /></Stk>
    <Stk x={760} y={780} t={t} r={-4}><Pl w={300} f={C.w} c={C.b0}>VOICE</Pl></Stk>
    <Stk x={1160} y={330} t={t} d={34} r={5}><Pl w={340} f={C.w} c={C.b0}>WRITER</Pl></Stk>
  </Sc>
);

export const S37: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={37} t={t} len={len} bg={C.b2} z={[1.25, 1.38]}>
    <Stk x={960} y={600} t={t} d={-3} s={1.3}><IBox /></Stk>
    <Stk x={960} y={270} t={t} s={0.7} r={-8}><IKey f={C.te} /></Stk>
    <Stk x={960} y={270} t={t} d={24} s={0.9}>
      <Ln a={[-120, -90]} b={[120, 90]} c={C.co} w={30} />
      <Ln a={[120, -90]} b={[-120, 90]} c={C.co} w={30} />
    </Stk>
    <Stk x={960} y={900} t={t} d={34} r={-3}><Pl w={520} f={C.w} c={C.b0}>NONE INSIDE</Pl></Stk>
  </Sc>
);

export const S38: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={38} t={t} len={len} bg={C.b1} z={[1, 1.06]}>
    <Stk x={960} y={540} t={t} d={-3} r={2} s={2}><ITerm s={typed(LINE, t, 0, 1)} t={t} /></Stk>
  </Sc>
);

export const S39: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={39} t={t} len={len} bg={C.b2} z={[1.15, 1.25]}>
    <Stk x={960} y={540} t={t} d={-3} r={3} s={1.5}><ITv /></Stk>
    <Stk x={1450} y={300} t={t} r={10}><IStar /></Stk>
    <Stk x={480} y={780} t={t} d={18} r={-10}><IStar f={C.te} /></Stk>
  </Sc>
);

export const S40: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={40} t={t} len={len} z={[1, 1.06]}>
    <Stk x={460} y={540} t={t} d={-3} r={-5} s={0.9}><IBox /></Stk>
    <Stk x={960} y={540} t={t} d={10} r={3} s={0.85}><IGear t={t} /></Stk>
    <Stk x={1460} y={540} t={t} d={22} r={5} s={0.95}><IBook /></Stk>
  </Sc>
);

export const S41: React.FC<ShotProps> = ({ t, len }) => (
  <Sc n={41} t={t} len={len} bg={C.b1} z={[1.25, 1.35]} c={[960, 580]}>
    <Stk x={560} y={560} t={t} d={-3}><circle r={250} fill={C.te} /></Stk>
    <HeroAt look={HERO} x={560} y={560} sc={1.2} t={t} d={-3} extra={{ expr: 'happy', yaw: 0.3 }} />
    <Stk x={1100} y={860} t={t} r={-3}><Pl w={900} f={C.co} s={52}>LINK IN ABOUT SECTION</Pl></Stk>
    <Stk x={1500} y={340} t={t} d={20} r={10}><IStar f={C.w} /></Stk>
  </Sc>
);
