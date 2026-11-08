import React from 'react';
import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import * as S from './shots';

const ids = Array.from({ length: 33 }, (_, i) => `S${i + 1}`);
const shots = Object.fromEntries(ids.map((id) => [id, (S as Record<string, React.FC<any>>)[id]]));

export const promo1108a = defineEpisode('Promo1108a', {
  timeline: timeline as Timeline,
  shots,
  bg: '#0A1E2C',
  grain: true,
  vignette: true,
});
