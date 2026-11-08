import React from 'react';
import {
  Hero, Pose, basePose, poseAt, faceAt, kf, clamp, easeOut, easeIn, camT, LOOKS, LEG_LEN, HEAD, joints, toWorld, reachAngle, walkPose,
  Kitchen, KitchenIsland, KITCHEN, islandTop, stand, Mug, Cat, Foreground, Tabletop, LightVeil, Glow, Marquee, Sparkle, PasteIn,
  Study, Desk, Rooftop, TitleCard, Schematic, SCH, Arrow, SchLabel, CountUp, DrawOn, DuskSky, Skyline, Haze, ShotProps,
} from '../../engine';

// "What if you could see one minute ahead?" Thirteen shots on the kitchen, a dusk street (drawn here), the study, the
// rooftop and the schematic. The power: a cyan selection box draws round the future moment, a ghost of it holds.
// Every shot is a pure function of its own clock t, built from patterns the copy-paste episode proved.

const PIP = LOOKS.pipHood;
const MO = LOOKS.mo;
const CYAN = '#7FD4FF';

/* ================= the street (S4-S6): dusk, a bus stop, a lamp, the bus ================= */
const GROUND = 850;
const Street: React.FC<{ id: string }> = ({ id }) => (
  <g>
    <DuskSky id={id} horizonY={700} />
    <Skyline y={700} seed={11} h={240} />
    <Haze y={700} />
    <rect x={-700} y={700} width={3400} height={700} fill="#221B31" />
    <rect x={-700} y={700} width={3400} height={10} fill="#3C3052" />
    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <rect key={i} x={-380 + i * 420} y={1000} width={220} height={12} rx={6} fill="#D9CBB0" opacity={0.3} />
    ))}
    {/* the street lamp, left */}
    <rect x={226} y={400} width={16} height={380} fill="#14101C" />
    <rect x={226} y={394} width={78} height={14} rx={7} fill="#14101C" />
    <Glow x={296} y={420} r={320} kind="warm" o={0.55} />
    <circle cx={296} cy={414} r={14} fill="#FFE2A8" />
    {/* the bus stop sign */}
    <rect x={566} y={470} width={12} height={310} fill="#14101C" />
    <rect x={524} y={440} width={96} height={76} rx={10} fill="#2C6FB7" />
    <rect x={544} y={462} width={56} height={22} rx={6} fill="#F6EFE3" />
    <circle cx={556} cy={498} r={7} fill="#F6EFE3" />
    <circle cx={588} cy={498} r={7} fill="#F6EFE3" />
  </g>
);

const BUS_W = 1000;
const BUS_H = 400;
const BUS_LIFT = 74;
const busTop = (y: number) => y - BUS_LIFT - BUS_H;
const busDoorX = (x: number) => x + BUS_W - 250;
const Bus: React.FC<{ x: number; y: number; door?: number }> = ({ x, y, door = 0 }) => {
  const top = busTop(y);
  const dx = busDoorX(x);
  return (
    <g>
      <ellipse cx={x + BUS_W / 2} cy={y + 6} rx={BUS_W * 0.54} ry={18} fill="#000" opacity={0.4} />
      <rect x={x} y={top} width={BUS_W} height={BUS_H} rx={56} fill="#E8833A" />
      <rect x={x} y={top + BUS_H * 0.68} width={BUS_W} height={26} fill="#F6E3C0" />
      <rect x={x} y={top + BUS_H - 46} width={BUS_W} height={46} rx={23} fill="#B85F24" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={x + 40 + i * 118} y={top + 40} width={96} height={130} rx={14} fill="#FFE9B0" stroke="#3A2616" strokeWidth={6} opacity={0.95} />
      ))}
      <rect x={x + BUS_W - 86} y={top + 40} width={58} height={130} rx={14} fill="#FFE9B0" stroke="#3A2616" strokeWidth={6} opacity={0.95} />
      {/* the door: dark glass shut, a warm lit doorway with a handrail open */}
      <rect x={dx} y={top + 34} width={130} height={BUS_H - 34 - 32} rx={12} fill="#1E1420" />
      <rect x={dx + 8} y={top + 42} width={114} height={BUS_H - 34 - 48} rx={8} fill="#FFD9A0" opacity={door * 0.95} />
      <rect x={dx + 61} y={top + 60} width={8} height={BUS_H - 34 - 80} fill="#CFCFCF" opacity={door} />
      {/* tail light at the rear, red glow */}
      <rect x={x - 6} y={top + 190} width={16} height={46} rx={7} fill="#FF3B3B" />
      <Glow x={x} y={top + 214} r={130} kind="red" o={0.5} />
      {[x + 190, x + BUS_W - 400].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy={y - 62} r={80} fill="#2A1A10" />
          <circle cx={cx} cy={y - 62} r={62} fill="#14101C" />
          <circle cx={cx} cy={y - 62} r={24} fill="#8A8494" />
        </g>
      ))}
    </g>
  );
};

/* ================= S1: medium, the kitchen island: Pip reaches as his coffee tips over the edge ================= */
const S1_STAND = stand(KITCHEN, 0.42, 0.4);
const MUG_EDGE = islandTop(0.62, 0.9);
export const S1: React.FC<ShotProps> = ({ t, len }) => {
  const base: Partial<Pose> = { x: S1_STAND.x, y: S1_STAND.y, scale: S1_STAND.scale, yaw: 0.5, look: 0.8, armL: { a: 12, b: -8 } };
  const p0 = { ...basePose, ...base };
  const aim = reachAngle(p0, { x: MUG_EDGE.x, y: MUG_EDGE.y - 30 });
  const pose = poseAt(t, [
    { f: 0, p: { ...base, armR: { a: 20, b: -10 }, headTilt: 0 } },
    { f: 9, p: { armR: { a: aim - 8, b: -4 }, handR: 'point', headTilt: 4 }, ease: easeOut },
    { f: 13, p: { armR: { a: aim, b: 0 } } },
  ]);
  const tip = clamp((t - 2) / 10);
  const fall = Math.max(0, t - 9);
  const mug = { x: MUG_EDGE.x + 8 * tip, y: MUG_EDGE.y + fall * fall * 1.2, rot: 62 * easeIn(tip) + fall * 4 };
  return (
    <g transform={camT(kf(t, [[0, 990], [len, 1000]]), 600, kf(t, [[0, 1.85], [len, 1.95]]))}>
      <Kitchen t={t + 40} id="k1" />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [7, 'oops']]) }} rimId="rimR" shadow={0} />
      <KitchenIsland />
      <Mug x={mug.x} y={mug.y} rot={mug.rot} steam={1} f={t} />
      <Foreground blur={10}>
        <path d="M 1260 1000 Q 1300 760 1420 700 Q 1380 820 1400 1000 Z" fill="#0E1610" />
        <path d="M 1330 1000 Q 1420 800 1560 760 Q 1480 860 1470 1000 Z" fill="#0C130E" />
      </Foreground>
    </g>
  );
};

/* ================= S2: macro, high angle over the island: the box draws round the falling mug, a ghost of the spill, Pip's hand snatches it ================= */
const MugTop: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 96, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle cx={8} cy={10} r={r + 8} fill="#000" opacity={0.3} />
    <path d={`M ${r - 6} -26 Q ${r + 66} -30 ${r + 58} 6 Q ${r + 52} 44 ${r - 10} 36`} stroke="#EFE9DD" strokeWidth={22} fill="none" strokeLinecap="round" />
    <circle r={r} fill="#EFE9DD" />
    <circle r={r - 14} fill="#F8F4EC" />
    <circle r={r - 24} fill="#4B2E1E" />
    <ellipse cx={-18} cy={-22} rx={r * 0.34} ry={r * 0.2} fill="#7A4F34" opacity={0.7} />
  </g>
);
export const S2: React.FC<ShotProps> = ({ t, len }) => {
  const hand = { x: kf(t, [[0, 1380], [8, 1060], [11, 960], [15, 985]]), y: kf(t, [[0, 40], [8, 330], [11, 500], [15, 470]]) };
  const mug = { x: 930, y: kf(t, [[0, 410], [5, 422], [9, 500], [11, 520], [14, 470]]), s: kf(t, [[0, 1], [11, 0.9], [14, 1.02]]) };
  return (
    <g transform={camT(960, kf(t, [[0, 520], [len, 540]]), kf(t, [[0, 1.0], [len, 1.06]]))}>
      <Tabletop edge={900} wood="#A89C8A" grain="#968A78" lip="#8E8474" kind="stone" floor="#2C2A30" floorLines="#232127" />
      <LightVeil id="s2veil" lights={[[930, 430, 760]]} o={0.55} />
      <Glow x={930} y={400} r={620} o={0.35} />
      {/* the tea towel and a jar, as on the copy-paste island */}
      <g transform="rotate(-14 240 160)">
        <rect x={-60} y={40} width={520} height={250} fill="#7A4A52" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={-60} y={70 + i * 70} width={520} height={14} fill="#E9C46A" opacity={0.7} />
        ))}
      </g>
      <circle cx={1500} cy={760} r={110} fill="#000" opacity={0.3} />
      <circle cx={1490} cy={750} r={104} fill="#B98A5A" />
      <circle cx={1490} cy={750} r={84} fill="#8A5A3A" />
      {/* the ghost: the spill that would have happened, dashed cyan, gone once the mug is caught */}
      <g opacity={t < 12 ? 0.6 : 0} style={{ mixBlendMode: 'screen' }}>
        <ellipse cx={930} cy={690} rx={230 * clamp((t - 2) / 8)} ry={120 * clamp((t - 2) / 8)} fill="#4B2E1E" opacity={0.7} />
        <ellipse cx={930} cy={690} rx={230 * clamp((t - 2) / 8)} ry={120 * clamp((t - 2) / 8)} fill="none" stroke={CYAN} strokeWidth={5} strokeDasharray="22 14" />
      </g>
      <g transform={`translate(${mug.x} ${mug.y}) scale(${mug.s}) translate(${-mug.x} ${-mug.y})`}>
        <MugTop x={mug.x} y={mug.y} rot={kf(t, [[0, 0], [9, 38], [11, 38], [14, 8]])} />
      </g>
      <Marquee x={mug.x - 150} y={mug.y - 150} w={300} h={300} t={t - 4} color={CYAN} />
      <Sparkle x={1090} y={420} t={t - 13} s={1.5} />
      {/* Pip's arm comes in from the top right: the dark sleeve, the light mitten */}
      <g filter="url(#rimR)">
        <path d={`M ${hand.x + 40} ${hand.y - 40} Q ${hand.x + 160} ${hand.y - 220} ${hand.x + 380} -360`} stroke={PIP.line} strokeWidth={118} fill="none" strokeLinecap="round" />
        <path d={`M ${hand.x + 40} ${hand.y - 40} Q ${hand.x + 160} ${hand.y - 220} ${hand.x + 380} -360`} stroke={PIP.limb} strokeWidth={100} fill="none" strokeLinecap="round" />
        <g transform={`translate(${hand.x} ${hand.y}) rotate(40) scale(4.6)`}>
          <rect x={-4} y={10} width={8} height={24} rx={4} fill={PIP.hand} stroke={PIP.line} strokeWidth={2.4} />
          <path d="M -11 -2 Q -14 14 -6 18 L 7 18 Q 14 14 11 -2 Z" fill={PIP.hand} stroke={PIP.line} strokeWidth={2.6} strokeLinejoin="round" />
          <ellipse cx={-10} cy={6} rx={4.5} ry={7} fill={PIP.hand} stroke={PIP.line} strokeWidth={2.4} />
        </g>
      </g>
    </g>
  );
};

/* ================= S3: wide, the kitchen: he sets the mug down and exhales; the cat looks up ================= */
const S3_STAND = stand(KITCHEN, 0.5, 0.4);
export const S3: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: S3_STAND.x, y: S3_STAND.y, scale: S3_STAND.scale, yaw: 0, armL: { a: 30, b: 20 }, armR: { a: 30, b: 20 }, headTilt: 0 } },
    { f: 8, p: { squash: 0.05 } },
    { f: 16, p: { squash: -0.04, headTilt: -4 }, ease: easeOut },
    { f: 24, p: { squash: 0 } },
  ]);
  const mugP = islandTop(0.5, 0.55);
  const cat = KITCHEN.P(0.86, 1, 0.66);
  return (
    <g transform={camT(960, kf(t, [[0, 560], [len, 570]]), kf(t, [[0, 0.98], [len, 1.03]]))}>
      <Kitchen t={t + 70} id="k3" veil={0.36} />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'worried'], [12, 'happy']]) }} rimId="rimR" shadow={0} />
      <KitchenIsland />
      <Mug x={mugP.x} y={mugP.y} rot={0} steam={1} f={t} />
      <Cat x={cat.x} y={cat.y} mood={t > 9 ? 'alert' : 'sleep'} f={t} />
    </g>
  );
};

/* ================= S4: wide, the street: the bus pulls off from the stop; Pip sprints in from the left ================= */
export const S4: React.FC<ShotProps> = ({ t, len }) => {
  const bx = 760 + t * t * 0.22;
  const px = -140 + t * 14.5;
  const pose = walkPose(px, t * 0.62, GROUND, 0.62, { armR: { a: 150, b: 10 } }, 1);
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.08]]))}>
      <Street id="st4" />
      <Bus x={bx} y={GROUND} door={0} />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'worried']]) }} rimId="rimR" shadow={0.6} />
    </g>
  );
};

/* ================= S5: close-up: Pip's eyes; the box draws round the bus door as it will be; the future holds ================= */
export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const sc = 4.4 * (1 + 0.04 * clamp(t / len));
  const head = { x: 760, y: 600 };
  const pose: Pose = { ...basePose, x: head.x, y: head.y - HEAD.y * sc, scale: sc, yaw: 0.3, look: 0.9, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 }, ...faceAt(t, [[0, 'worried'], [14, 'oops']]) };
  const top = busTop(GROUND);
  const dx = busDoorX(900);
  return (
    <g>
      <g filter="url(#blur16)">
        <g transform="translate(-900 -260) scale(1.5)">
          <Street id="st5" />
          <Bus x={900} y={GROUND} door={clamp((t - 8) / 8)} />
        </g>
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill="#07040C" opacity={0.25} />
      <g transform="translate(-900 -260) scale(1.5)">
        <Marquee x={dx - 24} y={top + 14} w={180} h={BUS_H - 40} t={t - 6} color={CYAN} />
      </g>
      <Hero look={PIP} pose={pose} rimId="rimL" shadow={0} />
    </g>
  );
};

/* ================= S6: low angle, medium: he grabs the handrail and hauls himself on; the bus lurches ================= */
export const S6: React.FC<ShotProps> = ({ t, len }) => {
  const bx = 640 + (t > 12 ? Math.pow(t - 12, 2) * 0.5 : t * 3);
  const dx = busDoorX(bx);
  const top = busTop(GROUND);
  const rail = { x: dx + 65, y: top + 190 };
  const hop = easeOut(clamp((t - 12) / 8));
  const px = t < 12 ? kf(t, [[0, dx - 430], [12, dx - 150]]) : dx + kf(hop, [[0, -150], [1, 40]]);
  const ground = GROUND - BUS_LIFT * hop;
  const phase = t < 12 ? t * 0.62 : 7.4;
  const p0 = walkPose(px, phase, ground, 0.62, {}, 1);
  const aim = reachAngle(p0, rail);
  const pose = walkPose(px, phase, ground, 0.62, { armR: { a: aim, b: 0 } }, 1);
  return (
    <g transform={camT(1230 + t * 2, 600, 1.5)}>
      <Street id="st6" />
      <Bus x={bx} y={GROUND} door={clamp(t / 6)} />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'worried'], [14, 'happy']]) }} rimId="rimR" shadow={0.4} />
    </g>
  );
};

/* ================= S7: medium, the study: Mo turns to speak; Pip's hand is already rising ================= */
const STUDY_Y = 712;
export const S7: React.FC<ShotProps> = ({ t, len }) => {
  const mo = poseAt(t, [
    { f: 0, p: { x: 790, y: STUDY_Y, yaw: 0, look: 0.3, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 } } },
    { f: 9, p: { yaw: 0.5, look: 0.9, armR: { a: 80, b: 35 } }, ease: easeOut },
  ]);
  const pip = poseAt(t, [
    { f: 0, p: { x: 1110, y: STUDY_Y, yaw: -0.4, look: -0.8, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 } } },
    { f: 10, p: {} },
    { f: 17, p: { armR: { a: 150, b: 20 } }, ease: easeOut },
  ]);
  return (
    <g transform={camT(kf(t, [[0, 950], [len, 960]]), 590, kf(t, [[0, 1.4], [len, 1.5]]))}>
      <Study t={t + 180} id="st7" />
      <Hero look={MO} pose={{ ...mo, ...faceAt(t, [[0, 'neutral'], [9, 'happy']]) }} rimId="rimL" shadow={0.3} />
      <Hero look={PIP} pose={{ ...pip, ...faceAt(t, [[0, 'smug']]) }} rimId="rimR" shadow={0.3} />
      <Desk x0={560} x1={1360} y={700} lamp={false} />
    </g>
  );
};

/* ================= S8: two-shot, the study: Pip's voice comes out first; both freeze and stare ================= */
export const S8: React.FC<ShotProps> = ({ t, len }) => {
  const mo: Pose = { ...basePose, x: 800, y: STUDY_Y, yaw: 0.5, look: 0.9, armL: { a: 14, b: -6 }, armR: { a: 80, b: 35 }, ...faceAt(t, [[0, 'happy'], [8, 'shock']]) };
  const pip: Pose = { ...basePose, x: 1100, y: STUDY_Y, yaw: -0.4, look: -0.8, armL: { a: 14, b: -6 }, armR: { a: 150, b: 20 }, ...faceAt(t, [[0, 'smug'], [8, 'oops']]) };
  return (
    <g transform={camT(950, 590, kf(t, [[0, 1.85], [len, 1.95]]))}>
      <Study t={t + 190} id="st8" />
      <Hero look={MO} pose={mo} rimId="rimL" shadow={0.3} />
      <Hero look={PIP} pose={pip} rimId="rimR" shadow={0.3} />
      <Desk x0={560} x1={1360} y={700} lamp={false} />
      <Marquee x={mo.x - 100} y={420} w={200} h={250} t={t - 2} color={CYAN} />
      <Sparkle x={950} y={500} t={t - 10} s={1.1} />
    </g>
  );
};

/* ================= S9: the title, wide on the roof at dusk; Pip on the parapet, a cyan afterimage trailing his hands ================= */
const ROOF_FEET = 840;
const s9Pose = (t: number, dx: number) =>
  poseAt(t, [
    { f: 0, p: { x: 960 + dx, y: ROOF_FEET - LEG_LEN * 0.62, scale: 0.62, yaw: 0, armL: { a: 20, b: 6 }, armR: { a: 20, b: 6 } } },
    { f: 18, p: {} },
    { f: 24, p: { armL: { a: 150, b: 10 }, armR: { a: 150, b: 10 } }, ease: easeOut },
  ]);
export const S9: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, kf(t, [[0, 520], [len, 545]]), kf(t, [[0, 1.0], [len, 1.07]]))}>
    <Rooftop t={t} sunX={960} sunY={690 - 40 * easeOut(clamp(t / 40))} />
    <g opacity={0.3} style={{ mixBlendMode: 'screen' }}>
      <Hero look={PIP} pose={{ ...s9Pose(t - 6, -36), ...faceAt(t, [[0, 'happy']]) }} rimId="rimR" shadow={0} />
    </g>
    <Hero look={PIP} pose={{ ...s9Pose(t, 0), ...faceAt(t, [[0, 'happy']]) }} rimId="rimR" shadow={0.6} />
    <TitleCard t={t} lines={['WHAT IF YOU COULD', 'GLIMPSE ONE MINUTE AHEAD?']} accent="ONE MINUTE" accentT={42} size={80} y={170} />
  </g>
);

/* ================= S10: medium, low angle, the roof: he looks at his hand, the afterimage fades; smile, then a frown ================= */
const s10Pose = (t: number) =>
  poseAt(t, [
    { f: 0, p: { x: 900, y: 790, scale: 1.8, yaw: 0.3, look: 0.4, armL: { a: 16, b: 6 }, armR: { a: 140, b: 115 }, headTilt: 4 } },
    { f: 8, p: { armR: { a: 118, b: 100 }, look: 0.9, headTilt: 10 }, ease: easeOut },
  ]);
export const S10: React.FC<ShotProps> = ({ t, len }) => {
  const pose = s10Pose(t);
  const j = joints(pose);
  const h = toWorld(pose, j.armR.end);
  const fade = 1 - clamp(t / 22);
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.05]]))}>
      <Rooftop t={t + 66} sunX={1250} sunY={560} low={260} />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'happy'], [10, 'neutral'], [15, 'worried']]) }} rimId="rimR" shadow={0} />
      <g opacity={0.55 * fade} style={{ mixBlendMode: 'screen' }}>
        <circle cx={h.x} cy={h.y} r={70 + t * 2} fill="none" stroke={CYAN} strokeWidth={6} />
        <circle cx={h.x - 26} cy={h.y + 10} r={46} fill={CYAN} opacity={0.35} />
        <circle cx={h.x - 52} cy={h.y + 20} r={30} fill={CYAN} opacity={0.2} />
      </g>
    </g>
  );
};

/* ================= S11: schematic: a brain at 20 W, times 60, a space heater at 1,200 W ================= */
export const S11: React.FC<ShotProps> = ({ t, len }) => {
  const heat = 0.55 + 0.25 * Math.sin(t * 0.35);
  return (
    <g transform={`translate(960 540) scale(${kf(t, [[0, 1], [len, 1.04]])}) translate(-960 -540)`}>
      <Schematic t={t} id="sch11" />
      <PasteIn x={330} y={420} t={t + 3} color={SCH.live} ring={150}>
        <g transform="translate(330 420)">
          <ellipse cx={-52} cy={0} rx={96} ry={92} fill="#E9A3B0" stroke={SCH.line} strokeWidth={8} />
          <ellipse cx={52} cy={0} rx={96} ry={92} fill="#E9A3B0" stroke={SCH.line} strokeWidth={8} />
          <path d="M 0 -88 Q -14 -30 4 0 Q 16 40 0 88" stroke="#B96E80" strokeWidth={7} fill="none" />
          <path d="M -120 -30 Q -80 -10 -40 -40 M -110 30 Q -70 50 -30 20 M 40 -40 Q 80 -10 120 -30 M 30 24 Q 70 54 110 30" stroke="#B96E80" strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      </PasteIn>
      <SchLabel x={330} y={640} t={t - 4} text="20 W" size={64} />
      <Arrow x0={560} y0={420} x1={1130} y1={420} t={t - 10} dur={10} />
      <SchLabel x={845} y={360} t={t - 14} text="× 60" size={110} />
      <Glow x={1450} y={430} r={420} kind="warm" o={heat} />
      <g transform="translate(1450 430)" style={{ filter: `drop-shadow(0 0 16px ${SCH.glow})` }}>
        <rect x={-110} y={-140} width={220} height={280} rx={30} fill="#3A3346" stroke={SCH.line} strokeWidth={8} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={-76} y={-96 + i * 40} width={152} height={16} rx={8} fill={SCH.live} opacity={heat + 0.2} />
        ))}
        <rect x={-40} y={140} width={80} height={14} rx={7} fill="#3A3346" />
      </g>
      <CountUp x={1450} y={760} t={t - 24} to={1200} dur={30} size={104} suffix=" W" format={(v) => Math.round(v).toLocaleString('en-US')} />
      <SchLabel x={1450} y={840} t={t - 30} text="A SPACE HEATER IN YOUR SKULL" size={34} color={SCH.dim} />
    </g>
  );
};

/* ================= S12: extreme close-up: "That's real." Pip, worried; the rim turns red, the sky begins to go ================= */
export const S12: React.FC<ShotProps> = ({ t, len }) => {
  const sc = 6.6 * (1 + 0.04 * clamp(t / len));
  const head = { x: 960, y: 720 };
  const red = 0.35 * clamp(t / len);
  const pose: Pose = { ...basePose, x: head.x, y: head.y - HEAD.y * sc, scale: sc, yaw: 0.12, look: 0.1, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 }, ...faceAt(t, [[0, 'worried']]) };
  return (
    <g>
      <g filter="url(#blur16)">
        <g transform="translate(-600 -560) scale(2)">
          <Rooftop t={t + 200} sunX={980} sunY={600} red={red} low={180} />
        </g>
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill="#07040C" opacity={0.22} />
      <Hero look={PIP} pose={pose} rimId={t > len * 0.6 ? 'rimRed' : 'rimR'} shadow={0} />
    </g>
  );
};

/* ================= S13: wide, low angle: the city goes dark in a sweep toward him, the string lights die, the sky goes red ================= */
export const S13: React.FC<ShotProps> = ({ t, len }) => {
  const red = easeOut(clamp(t / 14));
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 905 - LEG_LEN * 1.1, scale: 1.1, yaw: -0.15, look: -0.6, armL: { a: 40, b: 70 }, armR: { a: 40, b: 70 } } },
    { f: 30, p: { look: 0.4, headTilt: 4 } },
    { f: 60, p: { look: -0.2, headTilt: 0 } },
  ]);
  return (
    <g transform={camT(kf(t, [[0, 960], [len, 950]]), kf(t, [[0, 520], [len, 500]]), kf(t, [[0, 1.0], [len, 1.18]]))}>
      <Rooftop t={t + 230} sunX={1180} sunY={600} red={red} blackout={clamp((t - 8) / 40)} lightsOut={clamp((t - 48) / 20)} low={40} cityLit={2.6} />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'worried'], [26, 'shock']]) }} rimId="rimRed" shadow={0} />
    </g>
  );
};
export { Street, Bus, GROUND, STUDY_Y, ROOF_FEET, MugTop, busTop, busDoorX, BUS_W, BUS_H, BUS_LIFT };
