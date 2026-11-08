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
    <Schematic t={t} id="sch21" />
    <Glow x={960} y={380} r={380} kind="warm" o={0.5 + 0.12 * Math.sin(t / 3)} />
    <ellipse cx={960} cy={380} rx={150} ry={110} fill={SCH.live} opacity={0.85} />
    <CountUp x={960} y={700} t={t - 4} to={20} dur={12} size={150} suffix=" W" />
    <SchLabel x={960} y={800} t={t - 14} text="NONSTOP" size={44} color={SCH.dim} anchor="middle" />
  </g>
);

// S22: a dial runs one minute in one second
export const S22: React.FC<ShotProps> = ({ t, len }) => {
  // sweeps 60 s in half a second, then re-sweeps with a ring pulse from "every single time you glimpse"
  const R = 76, C = 22;
  const local = t < R ? t : (t - R) % C;
  const p = easeOut(clamp(local / (t < R ? 16 : 12)));
  const pulse = t >= R ? local / C : -1;
  return (
    <g transform={camT(960, 470, kf(t, [[0, 1.0], [len, 1.1]]))}>
      <Schematic t={t} id="sch22" />
      {pulse >= 0 && <circle cx={960} cy={470} r={230 + 90 * pulse} fill="none" stroke={SCH.live} strokeWidth={6} opacity={1 - pulse} />}
      <Dial x={960} y={470} r={230} p={p} readout={`${Math.round(60 * p)} s`} size={110} />
      <SchLabel x={960} y={850} t={t - 8} text="ONE MINUTE, IN ONE SECOND" size={44} color={SCH.dim} anchor="middle" />
    </g>
  );
};

// S23: x 60, huge and glowing
export const S23: React.FC<ShotProps> = ({ t }) => (
  <g>
    <Schematic t={t} id="sch23" />
    <Glow x={960} y={520} r={520} kind="warm" o={0.55} />
    <g transform={`translate(960 540) scale(${1 + settle(t - 4, 0.16, 1.6, 5)}) translate(-960 -540)`}>
      <SchLabel x={960} y={640} t={t - 2} text="x 60" size={380} color={SCH.glow} anchor="middle" />
    </g>
  </g>
);

// S24: a space heater inside a skull, 1,200 W counting up
export const S24: React.FC<ShotProps> = ({ t }) => {
  const heat = clamp(t / 30);
  return (
    <g>
      <Schematic t={t} id="sch24" />
      <ellipse cx={960} cy={400} rx={250} ry={215} fill="none" stroke={SCH.line} strokeWidth={6} />
      <rect x={850} y={560} width={220} height={90} rx={16} fill="none" stroke={SCH.line} strokeWidth={6} />
      <Glow x={960} y={430} r={380} kind="warm" o={0.6 * heat} />
      <rect x={860} y={350} width={200} height={160} rx={14} fill="#2A2230" stroke={SCH.line} strokeWidth={5} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={884 + i * 34} y={372} width={14} height={116} rx={7} fill={SCH.live} opacity={0.25 + 0.75 * heat} />
      ))}
      <CountUp x={960} y={850} t={t - 2} to={1200} dur={30} size={140} suffix=" W" />
    </g>
  );
};

// the roof for the cost-bites shots: the light turns red as the glimpses pile up
const roofHero = (t: number, extra: Partial<Pose>): Pose =>
  poseAt(t, [{ f: 0, p: { x: 900, y: 790, scale: 1.8, yaw: 0.3, look: 0.3, armL: { a: 14, b: -6 }, armR: { a: 20, b: -10 }, ...extra } }]);

// S26: a headache, his hand to his head, stars circling
export const S26: React.FC<ShotProps> = ({ t, len }) => {
  // worried first, the hand goes to the head, only then the stars
  const pose = poseAt(t, [
    { f: 0, p: { x: 900, y: 790, scale: 1.8, yaw: 0.3, look: 0.3, armL: { a: 14, b: -6 }, armR: { a: 20, b: -10 } } },
    { f: 10, p: { armR: { a: 165, b: 140 }, headTilt: 8 }, ease: easeOut },
  ]);
  const h = toWorld(pose, { x: HEAD.x, y: HEAD.y });
  const throb = 1 + 0.012 * Math.sin(t / 2.2);
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.06]]) * throb)}>
      <Rooftop t={t + 140} sunX={1250} sunY={560} red={0.3} low={260} />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'worried'], [60, 'dizzy']]) }} rimId="rimRed" shadow={0} />
      {t >= 60 && <DizzyStars x={h.x} y={h.y - 90} t={t} />}
    </g>
  );
};

// S27: the world stutters: jittering ghosts, the city flickers
export const S27: React.FC<ShotProps> = ({ t, len }) => {
  const k = Math.floor(t / 2);
  const pose = roofHero(t, { armR: { a: 165, b: 140 }, headTilt: 8 });
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.08]]))}>
      <Rooftop t={t + 160} sunX={1250} sunY={560} red={0.4} low={260} blackout={0.4 * (rnd(7, k) > 0.5 ? 1 : 0)} />
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={0.32} transform={`translate(${(rnd(3, k + i) - 0.5) * 150} ${(rnd(5, k + i) - 0.5) * 40})`}>
          <Hero look={PIP} pose={pose} rimId="rimRed" shadow={0} />
        </g>
      ))}
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'dizzy']]) }} rimId="rimRed" shadow={0} />
    </g>
  );
};

// S28: close-up, the glimpses won't stop: boxes flicker all round him
export const S28: React.FC<ShotProps> = ({ t, len }) => {
  const k = Math.floor(t / 2);
  const n = 6 + Math.floor(clamp(t / 90) * 6); // more and more boxes
  return (
    <g>
      <g filter="url(#blur16)">
        <g transform="translate(-600 -560) scale(2)"><Rooftop t={t + 180} sunX={980} sunY={600} red={0.5} low={180} /></g>
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill="#07040C" opacity={0.25} />
      <Hero look={PIP} pose={headPose(6.4, 960, 720, faceAt(t, [[0, 'worried'], [70, 'dizzy']]))} rimId="rimRed" shadow={0} />
      {Array.from({ length: n }, (_, i) => i).map((i) =>
        rnd(11, k * 7 + i) > 0.3 ? (
          <Marquee key={i} x={120 + rnd(2, i) * 1300} y={80 + rnd(4, i) * 640} w={240 + rnd(6, i) * 160} h={200 + rnd(8, i) * 140} t={12 + t} color={CYAN} />
        ) : null,
      )}
    </g>
  );
};

// S29: extreme close-up, his head is hot, his vision white: the frame bleaches out
export const S29: React.FC<ShotProps> = ({ t, len }) => {
  // red heat first, then the frame goes properly white by about 60% of the shot
  const bleach = easeOut(clamp((t - 10) / Math.max(1, len * 0.6)));
  return (
    <g>
      <g filter="url(#blur16)">
        <g transform="translate(-600 -560) scale(2)"><Rooftop t={t + 200} sunX={980} sunY={600} red={0.7} low={180} /></g>
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill="#FF3344" opacity={0.18 + 0.3 * bleach * (1 - bleach) * 4 * 0.5} />
      <Hero look={PIP} pose={headPose(8.0, 960, 740, faceAt(t, [[0, 'dizzy']]))} rimId="rimRed" shadow={0} />
      <rect x={0} y={0} width={1920} height={1080} fill="#FFFFFF" opacity={0.98 * bleach} />
    </g>
  );
};
