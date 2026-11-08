import React from 'react';
import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import * as S from './shots';

// promo: no power look, no custom grade. Shots S25-S28 come from glimpse60 (re-exported in shots.tsx).
const ids = Array.from({ length: 39 }, (_, i) => `S${i + 1}`);
const shots = Object.fromEntries(ids.map((id) => [id, (S as Record<string, React.FC<any>>)[id]]));

export const promo = defineEpisode('PromoPipeline', {
  timeline: timeline as Timeline,
  shots,
});
