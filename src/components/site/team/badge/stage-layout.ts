// Places the hanging badges in world units and their DOM labels in pixels, from one formula, so the
// live (WebGL) and static (HTML) boards put every badge in the same spot (team brief 5.4).

/** The card mesh is 2.25 units tall (its collider's half-height 1.125, doubled). */
export const CARD_H = 2.25;
/** Width over height of the card mesh, measured from card.glb (0.7164 units by 1). */
export const CARD_ASPECT = 0.7164;
/** From the last rope joint to the card's bottom edge: the 1.45 joint offset plus the 1.148 the mesh hangs below the body. */
export const HANG = 2.598;
/** The camera's vertical field of view, in degrees (React Bits default). */
export const FOV = 20;
/** Pixels kept clear at each side of the badge area. */
export const SIDE = 48;
/** Pixels of label rail at the bottom of the Team stage. */
export const RAIL = 96;
/** Pixels between a resting badge's bottom edge and its label. */
export const REST_GAP = 20;
/** Each badge keeps a 15% gap to its neighbours at rest. */
export const CROWD = 1.15;
/** The anchor stays at least this far (units) above the stage top, so a strap's end is never seen. */
const ANCHOR_MARGIN = 0.3;
const TAN_HALF_FOV = Math.tan(((FOV / 2) * Math.PI) / 180);

export type StageInput = {
  width: number;
  height: number;
  count: number;
  /** The share of the stage width on the left kept for text (0 when the badges span the stage). */
  textFraction: number;
  cardMin: number;
  cardMax: number;
  rail?: number;
  restGap?: number;
};

export type StageLayout = {
  cameraZ: number;
  pxPerUnit: number;
  cardPx: number;
  ropeLength: number;
  anchors: [number, number, number][];
  /** The centre of each badge (and its label), in px from the stage's left edge. */
  labelX: number[];
};

/** The badges' rest height: 40% of the stage, between the breakpoint's limits, shrunk if they'd crowd. */
export function cardSize({ width, height, count, textFraction, cardMin, cardMax }: StageInput): number {
  const pitch = Math.max(width * (1 - textFraction) - 2 * SIDE, 1) / Math.max(count, 1);
  const wanted = Math.min(Math.max(height * 0.4, cardMin), cardMax);
  return Math.min(wanted, pitch / (CARD_ASPECT * CROWD));
}

export function stageLayout(input: StageInput): StageLayout {
  const { width, height, count, textFraction, rail = RAIL, restGap = REST_GAP } = input;
  const areaLeft = width * textFraction + SIDE;
  const areaWidth = Math.max(width * (1 - textFraction) - 2 * SIDE, 1);
  const labelX = Array.from({ length: count }, (_, i) => areaLeft + (areaWidth * (i + 0.5)) / count);
  const cardPx = cardSize(input);
  const pxPerUnit = cardPx / CARD_H;
  const visibleH = height / pxPerUnit;
  const visibleW = width / pxPerUnit;
  const top = visibleH / 2;
  // Where the card's bottom edge rests: restGap above the label rail.
  const restBottom = top - (height - rail - restGap) / pxPerUnit;
  // Three rope segments of 0.45 to 1 units. The anchor goes wherever the rest position needs it,
  // as long as it stays hidden above the stage top (under the header).
  const ropeLength = Math.min(Math.max((top + 1 - restBottom - HANG) / 3, 0.45), 1);
  const anchorY = Math.max(restBottom + HANG + 3 * ropeLength, top + ANCHOR_MARGIN);
  const anchors = labelX.map((x, i) => [x / pxPerUnit - visibleW / 2, anchorY, i % 2 ? -0.3 : 0] as [number, number, number]);
  return { cameraZ: visibleH / (2 * TAN_HALF_FOV), pxPerUnit, cardPx, ropeLength, anchors, labelX };
}

/** The Team stage's parameters at a width (team brief 5.4). */
export function teamStageParams(width: number): Pick<StageInput, 'textFraction' | 'cardMin' | 'cardMax'> {
  return width >= 1200 ? { textFraction: 0.36, cardMin: 260, cardMax: 340 } : { textFraction: 0, cardMin: 240, cardMax: 300 };
}
