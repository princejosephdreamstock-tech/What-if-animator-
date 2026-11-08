import React from 'react';
import { defineEpisode, Timeline, LookDef, HudChip } from '../../engine';
import timeline from './timeline.json';
import { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13 } from './shots';

// The power's look: while a glimpse runs a cyan selection box appears around the future moment,
// a GLIMPSE chip pulses, and the frame holds a ghost image of what's coming
const glimpseLook: LookDef = {
  grade: (lv) => `saturate(${1 - 0.25 * lv}) brightness(${1 + 0.05 * lv}) hue-rotate(${14 * lv}deg)`,
  Overlay: ({ f, p, n }) => (
    <g>
      <HudChip f={f} label="GLIMPSE" icon="dot" />
    </g>
  ),
};

export const glimpse = defineEpisode('Glimpse', {
  timeline: timeline as Timeline,
  shots: { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13 },
  looks: { glimpse: glimpseLook },
});