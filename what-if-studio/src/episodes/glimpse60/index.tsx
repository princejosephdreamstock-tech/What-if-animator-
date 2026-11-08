import React from 'react';
import { defineEpisode, Timeline, LookDef, HudChip } from '../../engine';
import timeline from './timeline.json';
import * as O from '../glimpse/shots';
import * as N from './shots';

const glimpseLook: LookDef = {
  grade: (lv) => `saturate(${1 - 0.25 * lv}) brightness(${1 + 0.05 * lv}) hue-rotate(${14 * lv}deg)`,
  Overlay: ({ f }) => <HudChip f={f} label="GLIMPSE" icon="dot" />,
};

export const glimpse60 = defineEpisode('Glimpse60', {
  timeline: timeline as Timeline,
  shots: {
    S1: O.S1, S2: O.S2, S3: O.S3, S4: O.S4, S5: O.S5, S6: O.S6, S7: O.S7, S8: O.S8,
    S9: N.S9, S10: N.S10, S11: N.S11,
    S12: O.S9, S13: O.S10,
    S14: N.S14, S15: N.S15, S16: N.S16, S17: N.S17, S18: N.S18, S19: N.S19, S20: N.S20, S21: N.S21, S22: N.S22, S23: N.S23, S24: N.S24,
    S25: O.S12,
    S26: N.S26, S27: N.S27, S28: N.S28, S29: N.S29,
    S30: O.S13,
  },
  looks: { glimpse: glimpseLook },
});
