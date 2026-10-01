import React from 'react';

/*
 * Penalty case diagrams (PLC, SDC, NC, DAC, TLC).
 *
 * Every case is built from the same geometry, expressed in meters and converted to px:
 *   - lane 3.5 m, car 4.8 m x 2.0 m; edge / dashed dividers / center line evenly spaced one lane apart
 *     (asphalt edge = lane edge, thick solid center line, no outer lane marks)
 *   - traffic drives on the right: ego direction = lower half, heading +x
 *   - the penalty event is always at x = CX, marked by a small red circle (no X)
 *   - labels sit above the road; every case shares one canvas (CANVAS_H) with its content centered vertically,
 *     so diagrams line up with each other and with the replay videos beside them
 */

// ---- Scale ----
const PX_PER_M = 22 / 3.5; // lane 3.5 m = 22 px
const m = (meters) => meters * PX_PER_M;

// ---- Canvas ----
const W = 480;
const CX = W / 2; // event x
const ROAD_TOP = 62; // asphalt top, below the two label rows (before centering)
const CANVAS_H = 214; // shared height = tallest case (PLC)
export const DIAGRAM_ASPECT = W / CANVAS_H;

// ---- Road ----
const LANE = m(3.5);
const SHOULDER = 0; // asphalt edge = lane edge, so every lane boundary is one lane width apart
const GAP = 0; // single center line sits exactly between the two directions
const CORNER_R = 16; // curb radius at intersections

// ---- Vehicles ----
const CAR_L = m(4.8);
const CAR_W = m(2.0);

// ---- Palette ----
const C = {
  bg: '#17120f',
  asphalt: '#40362e',
  edge: '#8d7865',
  mark: '#a18e7d',
  route: '#d99455',
  alert: '#ef5147',
  ego: '#f2c18f',
  ghost: '#d0c0b0',
  stopLine: '#e7d1ba',
  onTime: '#a5cb9d',
  late: '#e6a765',
  ruler: '#b9a99a',
};

/**
 * Horizontal two-way road with `lanes` lanes per direction.
 * Returns y-coordinates (top to bottom) and lane-center helpers.
 * Lane 1 is the lane next to the center line.
 */
const road = (lanes, top = ROAD_TOP) => {
  const markTop = top + SHOULDER;
  const center = markTop + lanes * LANE + GAP / 2;
  const markBottom = center + GAP / 2 + lanes * LANE;
  const offsets = Array.from({ length: lanes - 1 }, (_, k) => (k + 1) * LANE);
  return {
    top,
    markTop,
    center,
    markBottom,
    bottom: markBottom + SHOULDER,
    down: (i) => center + GAP / 2 + (i - 0.5) * LANE, // ego direction (lower half)
    up: (i) => center - GAP / 2 - (i - 0.5) * LANE, // oncoming (upper half)
    dividersDown: offsets.map((o) => center + GAP / 2 + o),
    dividersUp: offsets.map((o) => center - GAP / 2 - o),
  };
};

/**
 * Vertical two-way road (one lane each way) hanging below a horizontal road,
 * with its center line at `cx`. Returns x-coordinates (left to right).
 */
const crossRoad = (cx) => ({
  center: cx,
  markLeft: cx - GAP / 2 - LANE,
  markRight: cx + GAP / 2 + LANE,
  left: cx - GAP / 2 - LANE - SHOULDER,
  right: cx + GAP / 2 + LANE + SHOULDER,
});

// ---- Shared pieces ----

const AsphaltStroke = { fill: 'none', stroke: C.edge, strokeOpacity: 0.48, strokeWidth: 2 };
// Lane style: no outer lane marks; one thick solid center line; dashed dividers between same-direction lanes.
const CenterStroke = { fill: 'none', stroke: C.mark, strokeOpacity: 0.7, strokeWidth: 3 };
const DividerStroke = { fill: 'none', stroke: C.mark, strokeOpacity: 0.4, strokeWidth: 1.2, strokeDasharray: '8 8' };
const BandStroke = { fill: 'none', strokeOpacity: 0.38, strokeWidth: 8, strokeLinejoin: 'round' };

/** Center line (solid, thick) of a horizontal road. */
const centerLine = (r) => `M0 ${r.center}H${W}`;

/**
 * T-junction: horizontal road `r` with a vertical road `x` (from crossRoad) hanging below it down to `end`.
 * Curb corners are rounded with CORNER_R.
 * Returns path strings so a case can draw route bands between the asphalt and the center lines.
 */
const tee = (r, x, end) => {
  const R = CORNER_R;
  return {
    asphalt: `M0 ${r.top}H${W}V${r.bottom}H${x.right + R}Q${x.right} ${r.bottom} ${x.right} ${r.bottom + R}V${end}H${x.left}V${r.bottom + R}Q${x.left} ${r.bottom} ${x.left - R} ${r.bottom}H0Z`,
    edges: `M0 ${r.top}H${W}M0 ${r.bottom}H${x.left - R}Q${x.left} ${r.bottom} ${x.left} ${r.bottom + R}V${end}M${x.right} ${end}V${r.bottom + R}Q${x.right} ${r.bottom} ${x.right + R} ${r.bottom}H${W}`,
    center: `${centerLine(r)}M${x.center} ${r.bottom}V${end}`,
  };
};

/** Dashed lane dividers of a horizontal road, broken over [from, to] (an intersection) if given. */
const dividers = (ys, from, to) =>
  ys.map((y) => (from == null ? `M0 ${y}H${W}` : `M0 ${y}H${from}M${to} ${y}H${W}`)).join('');

/** Chevron (route direction) centered at (x, y), pointing right or down. */
const chevron = (x, y, dir = 'right') =>
  dir === 'right' ? `M${x - 2.5} ${y - 5}L${x + 2.5} ${y}L${x - 2.5} ${y + 5}` : `M${x - 5} ${y - 2.5}L${x} ${y + 2.5}L${x + 5} ${y - 2.5}`;

/** Car centered at (x, y), heading `angle` degrees (0 = +x, positive = clockwise / toward the curb). */
const Car = ({ x, y, angle = 0, kind = 'ghost' }) => {
  const style =
    kind === 'ego'
      ? { fill: C.ego, stroke: C.alert, strokeWidth: 2 }
      : kind === 'lead'
        ? { fill: '#c8b8a8', opacity: 0.48 }
        : { fill: C.ghost, opacity: 0.22 };
  return (
    <rect
      x={x - CAR_L / 2}
      y={y - CAR_W / 2}
      width={CAR_L}
      height={CAR_W}
      transform={angle ? `rotate(${angle} ${x} ${y})` : undefined}
      {...style}
    />
  );
};

/** Corner of a car centered at (x, y) with heading `angle`: sx = +1 front / -1 rear, sy = +1 right / -1 left. */
const carCorner = (x, y, angle, sx, sy) => {
  const a = (angle * Math.PI) / 180;
  const dx = (sx * CAR_L) / 2;
  const dy = (sy * CAR_W) / 2;
  return [x + dx * Math.cos(a) - dy * Math.sin(a), y + dx * Math.sin(a) + dy * Math.cos(a)];
};

const EventMark = ({ x = CX, y }) => <circle cx={x} cy={y} r="7" fill="none" stroke={C.alert} strokeWidth="2.5" />;

/** Plain straight road: asphalt, edges, center line, dashed dividers. */
const StraightRoad = ({ r }) => (
  <>
    <rect x="0" y={r.top} width={W} height={r.bottom - r.top} fill={C.asphalt} />
    <path d={`M0 ${r.top}H${W}M0 ${r.bottom}H${W}`} {...AsphaltStroke} />
    <path d={centerLine(r)} {...CenterStroke} />
    {r.dividersDown.length > 0 && <path d={dividers([...r.dividersUp, ...r.dividersDown])} {...DividerStroke} />}
  </>
);

// ---- Cases ----

/** NC: the ego rear-ends the vehicle ahead in the same lane; contact point at CX. */
const NC = (dy = 0) => {
  const r = road(1, ROAD_TOP + dy);
  const y = r.down(1);
  return {
    height: r.bottom + 24,
    label: 'COLLISION EVENT',
    body: (
      <>
        <StraightRoad r={r} />
        <Car x={100} y={y} />
        <Car x={376} y={r.up(1)} />
        <Car x={CX + CAR_L / 2} y={y} kind="lead" />
        <Car x={CX - CAR_L / 2} y={y} kind="ego" />
        <EventMark y={y} />
      </>
    ),
  };
};

/** DAC: the ego drifts over the lane mark and shoulder; only its front-right corner leaves the asphalt. */
const DAC = (dy = 0) => {
  const r = road(1, ROAD_TOP + dy);
  const angle = 14;
  const out = 4; // how far the front-right corner is past the asphalt edge
  // place the car so that its front-right corner lands at (CX, r.bottom + out)
  const [fx, fy] = carCorner(0, 0, angle, 1, 1);
  const ego = { x: CX - fx, y: r.bottom + out - fy };
  return {
    height: r.bottom + 28,
    label: 'NON-DRIVABLE AREA',
    body: (
      <>
        <StraightRoad r={r} />
        <Car x={100} y={r.down(1)} />
        <Car x={376} y={r.up(1)} />
        <Car x={ego.x} y={ego.y} angle={angle} kind="ego" />
        <EventMark y={r.bottom + out} />
      </>
    ),
  };
};

/** SDC: the SD route (on the road center) turns right into a branch at CX; the ego keeps going straight. */
const SDC = (dy = 0, bottom) => {
  const r = road(1, ROAD_TOP + dy);
  const b = crossRoad(CX);
  const end = bottom ?? r.bottom + 76; // branch runs to the canvas bottom
  const t = tee(r, b, end);
  return {
    height: end,
    label: 'ROUTE DEPARTURE',
    body: (
      <>
        <path d={t.asphalt} fill={C.asphalt} />
        <path d={t.edges} {...AsphaltStroke} />
        {/* SD route (road graph, no direction split) and the off-route road the ego took */}
        <path d={`M0 ${r.center}H${CX}V${end}`} stroke={C.route} {...BandStroke} />
        <path d={`M${CX} ${r.center}H${W}`} stroke={C.alert} {...BandStroke} />
        <path d={t.center} {...CenterStroke} />
        <path d={`${chevron(90, r.center)}${chevron(170, r.center)}${chevron(CX, end - 26, 'down')}`} fill="none" stroke={C.route} strokeWidth="2.2" />
        <Car x={100} y={r.down(1)} />
        <Car x={376} y={r.up(1)} />
        {/* departure = first map-matched point off the route: start of the red segment, with the ego just there */}
        <Car x={CX + 14 + m(2.5)} y={r.down(1)} kind="ego" />
        <EventMark x={CX + 14 + m(2.5)} y={r.center} />
      </>
    ),
  };
};

/**
 * PLC: 2 lanes each way; the right-turn lane (lane 2) leads into the turn at the stop line (x = CX).
 * In it before the last 10 m of driving = on time (1), within the last 10 m = late (0.5),
 * any other lane at the stop line = 0. The ego reaches the stop line still in the through lane (lane 1).
 */
const PLCA = (dy = 0, bottom) => {
  const r = road(2, ROAD_TOP + dy);
  const xr = crossRoad(CX + 8 + SHOULDER + LANE + GAP / 2); // intersection starts 8 px after the stop line
  const end = bottom ?? r.bottom + 64;
  const t = tee(r, xr, end);
  const lateFrom = CX - m(10);
  const egoY = r.down(1) + 1;
  const ruler = r.bottom + 18;
  return {
    height: end,
    label: 'INCOMPATIBLE LANE AT STOP LINE',
    body: (
      <>
        <path d={t.asphalt} fill={C.asphalt} />
        <path d={t.edges} {...AsphaltStroke} />
        {/* SD route on the road center: straight, then right at the intersection */}
        <path d={`M0 ${r.center}H${xr.center}V${end}`} stroke={C.route} {...BandStroke} />
        <path d={t.center} {...CenterStroke} />
        <path d={dividers([r.dividersUp[0]], xr.left, xr.right) + dividers([r.dividersDown[0]], CX, xr.right)} {...DividerStroke} />
        <path d={`${chevron(60, r.center)}${chevron(150, r.center)}${chevron(xr.center, end - 26, 'down')}`} fill="none" stroke={C.route} strokeWidth="2.2" />
        {/* lane-direction arrows (road markings): straight, and right turn (down in this view) */}
        <path d={`M14 ${r.down(1)}H46M39 ${r.down(1) - 6}L46 ${r.down(1)}L39 ${r.down(1) + 6}`} fill="none" stroke={C.mark} strokeOpacity=".9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M14 ${r.down(2) - 4}H29Q39 ${r.down(2) - 4} 39 ${r.down(2) + 4}M33 ${r.down(2) + 1}L39 ${r.down(2) + 8}L45 ${r.down(2) + 1}`} fill="none" stroke={C.mark} strokeOpacity=".9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* last 10 m before the stop line on the compatible lane, with a line where it begins */}
        <rect x={lateFrom} y={r.dividersDown[0]} width={CX - lateFrom} height={LANE} fill={C.late} opacity=".34" />
        <path d={`M${lateFrom} ${r.dividersDown[0]}V${r.markBottom}`} stroke={C.late} strokeWidth="3" />
        <path d={`M${lateFrom} ${ruler}H${CX}M${lateFrom} ${ruler - 4}V${ruler + 4}M${CX} ${ruler - 4}V${ruler + 4}`} fill="none" stroke={C.ruler} strokeWidth="1.2" />
        <text x={(lateFrom + CX) / 2} y={ruler + 18} textAnchor="middle" className="penalty-svg-note">10 m</text>
        {/* stop line: crossing in lane 1 = incompatible (red); lane 2 segment closes the last-10 m zone (same amber as its start line) */}
        <path d={`M${CX} ${r.center + GAP / 2}V${r.dividersDown[0]}`} stroke={C.alert} strokeWidth="3" />
        <text x={xr.center + 8} y={r.down(1) + 3} className="penalty-svg-note" style={{ fill: '#ff8379' }}>INCOMPATIBLE LANE</text>
        <path d={`M${CX} ${r.dividersDown[0]}V${r.markBottom}`} stroke={C.late} strokeWidth="3" />
        <text x={xr.center + 8} y={r.down(2) + 3} className="penalty-svg-note" style={{ fill: C.onTime }}>COMPATIBLE LANE</text>
        <Car x={140} y={r.down(1)} />
        <Car x={376} y={r.up(2)} />
        {/* ego center on the stop line, still in lane 1, heading turned toward lane 2 */}
        <Car x={CX} y={egoY} angle={18} kind="ego" />
        <EventMark y={egoY} />
      </>
    ),
  };
};

/** TLC: the ego continues through a stop line while the signal is red. */
const TLC = (dy = 0, bottom) => {
  const r = road(1, ROAD_TOP + dy);
  const xr = crossRoad(CX + 46);
  const end = bottom ?? r.bottom + 60;
  const t = tee(r, xr, end);
  const y = r.down(1);
  const egoX = CX - CAR_L / 4; // front quarter of the car has crossed the stop line
  return {
    height: end,
    label: 'RED-LIGHT VIOLATION',
    body: (
      <>
        <path d={t.asphalt} fill={C.asphalt} />
        <path d={t.edges} {...AsphaltStroke} />
        <path d={`M0 ${r.center}H${W}`} stroke={C.route} {...BandStroke} />
        <path d={`M${CX} ${y}H${CX + CAR_L / 4}`} stroke={C.alert} {...BandStroke} />
        <path d={t.center} {...CenterStroke} />
        {/* red signal: the stop line is red, as in the replay */}
        <path d={`M${CX} ${r.center + GAP / 2}V${r.markBottom}`} stroke={C.alert} strokeWidth="3" />
        <path d={`${chevron(88, r.center)}${chevron(180, r.center)}${chevron(380, r.center)}`} fill="none" stroke={C.route} strokeWidth="2.2" />
        <Car x={100} y={y} />
        <Car x={376} y={r.up(1)} />
        <Car x={egoX} y={y} kind="ego" />
        <EventMark x={CX} y={y} />
        <path d={`M${CX - 26} ${r.bottom + 32}V${r.bottom + 3}`} stroke={C.edge} strokeWidth="2" />
        <rect x={CX - 34} y={r.bottom + 3} width="16" height="32" rx="3" fill="#2a211b" stroke={C.edge} />
        <circle cx={CX - 26} cy={r.bottom + 10} r="4" fill={C.alert} />
        <circle cx={CX - 26} cy={r.bottom + 19} r="4" fill="#54473c" />
        <circle cx={CX - 26} cy={r.bottom + 28} r="4" fill="#54473c" />
      </>
    ),
  };
};

const CASES = { NC, DAC, SDC, PLC: PLCA, TLC };

const PenaltyDiagram = ({ kind }) => {
  // center the case (event label + road) on the shared canvas
  const dy = Math.round((CANVAS_H - CASES[kind]().height) / 2);
  const { label, body } = CASES[kind](dy, CANVAS_H);
  return (
    <svg viewBox={`0 0 ${W} ${CANVAS_H}`} role="img" aria-label={`${kind} penalty example`}>
      <rect width={W} height={CANVAS_H} rx="12" fill={C.bg} />
      {body}
      <text x={CX} y={48 + dy} textAnchor="middle" className="penalty-svg-alert">{label}</text>
      <text x="20" y="24" className="penalty-svg-note">PENALTY CASE</text>
    </svg>
  );
};

export default PenaltyDiagram;
