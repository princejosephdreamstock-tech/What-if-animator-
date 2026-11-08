import React from 'react';
import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import * as S from './shots';

const ids = Array.from({ length: 10 }, (_, i) => `S${i + 1}`);
const shots = Object.fromEntries(ids.map((id) => [id, (S as Record<string, React.FC<any>>)[id]]));

export const promo1108b = defineEpisode('Promo1108b', {
  timeline: timeline as Timeline,
  shots,
  bg: '#0D1F17',
  grain: true,
  vignette: true,
});
