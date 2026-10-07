import type { HyperspeedOptions } from '@/components/reactbits/Hyperspeed';
import { hexToInt, PALETTE, tintOnBg } from '@/lib/palette';

// The approved prototype's preset "one", with every colour taken from the palette (no colour
// literals, so the guardrail can check it). Module-level and frozen in identity: the Hyperspeed
// port rebuilds its WebGL context only when this object changes.
export const ROAD_OPTIONS: Partial<HyperspeedOptions> = {
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [12, 80],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: hexToInt(PALETTE.bg),
    islandColor: hexToInt(PALETTE.bg),
    background: hexToInt(PALETTE.bg), // also the fog colour, so far lights melt into the page
    shoulderLines: tintOnBg(PALETTE.muted, 0.06),
    brokenLines: tintOnBg(PALETTE.muted, 0.06),
    leftCars: [hexToInt(PALETTE.accent), hexToInt(PALETTE.accentDeep), hexToInt(PALETTE.accent)],
    rightCars: [hexToInt(PALETTE.text), hexToInt(PALETTE.ink), hexToInt(PALETTE.muted)],
    sticks: hexToInt(PALETTE.accentDeep),
  },
};
