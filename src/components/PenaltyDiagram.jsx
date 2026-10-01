import React from 'react';

/*
 * Penalty case diagrams (NC, DAC, SDC, PLCA/S).
 *
 * Every case is built from the same geometry, expressed in meters and converted to px:
 *   - lane 3.5 m, car 4.8 m x 2.0 m, shoulder outside a solid lane mark, double center line
 *   - traffic drives on the right: ego direction = lower half, heading +x
 *   - the penalty event is always at x = CX, marked by a small red circle (no X)
 *   - labels sit above the road; each SVG is cropped to its own height
 */

// ---- Scale ----
const PX_PER_M = 22 / 3.5; // lane 3.5 m = 22 px
const m = (meters) => meters * PX_PER_M;

// ---- Canvas ----
const W = 480;
const CX = W / 2; // event x
const ROAD_TOP = 62; // asphalt top, below the two label rows

// ---- Road ----
const LANE = m(3.5);
const SHOULDER = 8;
const GAP = 4; // between the two center lines
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
const MarkStroke = { fill: 'none', stroke: C.mark, strokeOpacity: 0.55, strokeWidth: 1.5 };
const DividerStroke = { fill: 'none', stroke: C.mark, strokeOpacity: 0.4, strokeWidth: 1.2, strokeDasharray: '8 8' };
const BandStroke = { fill: 'none', strokeOpacity: 0.38, strokeWidth: 8, strokeLinejoin: 'round' };

/** Double center line of a horizontal road. */
const centerLines = (r) => `M0 ${r.center - GAP / 2}H${W}M0 ${r.center + GAP / 2}H${W}`;

/**
 * T-junction: horizontal road `r` with a vertical road `x` (from crossRoad) hanging below it down to `end`.
 * Curb corners and the outer lane marks are rounded with CORNER_R.
 * Returns path strings so a case can draw route bands between the asphalt and the marks.
 */
const tee = (r, x, end) => {
  const R = CORNER_R;
  return {
    asphalt: `M0 ${r.top}H${W}V${r.bottom}H${x.right + R}Q${x.right} ${r.bottom} ${x.right} ${r.bottom + R}V${end}H${x.left}V${r.bottom + R}Q${x.left} ${r.bottom} ${x.left - R} ${r.bottom}H0Z`,
    edges: `M0 ${r.top}H${W}M0 ${r.bottom}H${x.left - R}Q${x.left} ${r.bottom} ${x.left} ${r.bottom + R}V${end}M${x.right} ${end}V${r.bottom + R}Q${x.right} ${r.bottom} ${x.right + R} ${r.bottom}H${W}`,
    marks:
      `M0 ${r.markTop}H${W}` +
      `M0 ${r.markBottom}H${x.markLeft - R}Q${x.markLeft} ${r.markBottom} ${x.markLeft} ${r.markBottom + R}V${end}` +
      `M${x.markRight} ${end}V${r.markBottom + R}Q${x.markRight} ${r.markBottom} ${x.markRight + R} ${r.markBottom}H${W}` +
      centerLines(r) +
      `M${x.center - GAP / 2} ${r.bottom}V${end}M${x.center + GAP / 2} ${r.bottom}V${end}`,
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

/** Plain straight road: asphalt, edges, solid lane marks, center lines, dividers. */
const StraightRoad = ({ r }) => (
  <>
    <rect x="0" y={r.top} width={W} height={r.bottom - r.top} fill={C.asphalt} />
    <path d={`M0 ${r.top}H${W}M0 ${r.bottom}H${W}`} {...AsphaltStroke} />
    <path d={`M0 ${r.markTop}H${W}M0 ${r.markBottom}H${W}${centerLines(r)}`} {...MarkStroke} />
    {r.dividersDown.length > 0 && <path d={dividers([...r.dividersUp, ...r.dividersDown])} {...DividerStroke} />}
  </>
);

// ---- Cases ----

/** NC: the ego rear-ends the vehicle ahead in the same lane; contact point at CX. */
const NC = () => {
  const r = road(1);
  const y = r.down(1);
  return {
    height: r.bottom + 24,
    label: 'CONTACT',
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
const DAC = () => {
  const r = road(1);
  const angle = 14;
  const out = 4; // how far the front-right corner is past the asphalt edge
  // place the car so that its front-right corner lands at (CX, r.bottom + out)
  const [fx, fy] = carCorner(0, 0, angle, 1, 1);
  const ego = { x: CX - fx, y: r.bottom + out - fy };
  return {
    height: r.bottom + 28,
    label: 'OFF-ROAD',
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
const SDC = () => {
  const r = road(1);
  const b = crossRoad(CX);
  const end = r.bottom + 76; // branch length shown
  const t = tee(r, b, end);
  return {
    height: end,
    label: 'MISSED BRANCH',
    body: (
      <>
        <path d={t.asphalt} fill={C.asphalt} />
        <path d={t.edges} {...AsphaltStroke} />
        {/* SD route (road graph, no direction split) and the off-route road the ego took */}
        <path d={`M0 ${r.center}H${CX}V${end}`} stroke={C.route} {...BandStroke} />
        <path d={`M${CX} ${r.center}H${W}`} stroke={C.alert} {...BandStroke} />
        <path d={t.marks} {...MarkStroke} />
        <path d={`${chevron(90, r.center)}${chevron(170, r.center)}${chevron(CX, end - 26, 'down')}`} fill="none" stroke={C.route} strokeWidth="2.2" />
        <Car x={100} y={r.down(1)} />
        <Car x={376} y={r.up(1)} />
        <Car x={CX + 76} y={r.down(1)} kind="ego" />
        <EventMark y={r.center} />
      </>
    ),
  };
};

/**
 * PLCA/S: 2 lanes each way; the right-turn lane (lane 2) leads into the turn at the stop line (x = CX).
 * In it before the last 10 m of driving = on time (1), within the last 10 m = late (0.5),
 * any other lane at the stop line = 0. The ego reaches the stop line still in the through lane (lane 1).
 */
const PLCA = () => {
  const r = road(2);
  const xr = crossRoad(CX + 8 + SHOULDER + LANE + GAP / 2); // intersection starts 8 px after the stop line
  const end = r.bottom + 64;
  const t = tee(r, xr, end);
  const lateFrom = CX - m(10);
  const egoY = r.down(1) + 1;
  const ruler = r.bottom + 18;
  return {
    height: end,
    label: 'WRONG LANE AT STOP LINE',
    body: (
      <>
        <path d={t.asphalt} fill={C.asphalt} />
        <path d={t.edges} {...AsphaltStroke} />
        {/* SD route on the road center: straight, then right at the intersection */}
        <path d={`M0 ${r.center}H${xr.center}V${end}`} stroke={C.route} {...BandStroke} />
        <path d={t.marks} {...MarkStroke} />
        <path d={dividers([r.dividersUp[0]], xr.left, xr.right) + dividers([r.dividersDown[0]], CX, xr.right)} {...DividerStroke} />
        <path d={`${chevron(60, r.center)}${chevron(150, r.center)}${chevron(xr.center, end - 26, 'down')}`} fill="none" stroke={C.route} strokeWidth="2.2" />
        <text x="14" y={r.down(1) + 3} className="penalty-svg-note">THROUGH LANE</text>
        <text x="14" y={r.down(2) + 3} className="penalty-svg-note">RIGHT-TURN LANE</text>
        {/* scoring zones on lane 2 (the route-compatible lane) */}
        <rect x="0" y={r.dividersDown[0]} width={lateFrom} height={LANE} fill={C.onTime} opacity=".2" />
        <rect x={lateFrom} y={r.dividersDown[0]} width={CX - lateFrom} height={LANE} fill={C.late} opacity=".34" />
        <path d={`M20 ${ruler}H${CX}M20 ${ruler - 4}V${ruler + 4}M${lateFrom} ${ruler - 4}V${ruler + 4}M${CX} ${ruler - 4}V${ruler + 4}`} fill="none" stroke={C.ruler} strokeWidth="1.2" />
        <text x={(20 + lateFrom) / 2} y={ruler + 18} textAnchor="middle" className="penalty-svg-note" style={{ fill: C.onTime }}>ON TIME · 1</text>
        <text x={(lateFrom + CX) / 2} y={ruler + 18} textAnchor="middle" className="penalty-svg-note" style={{ fill: C.late }}>LATE · 0.5</text>
        <text x={(lateFrom + CX) / 2} y={ruler + 31} textAnchor="middle" className="penalty-svg-note">LAST 10 m</text>
        {/* stop line: lane 1 plain, lane 2 (compatible) green */}
        <path d={`M${CX} ${r.center + GAP / 2}V${r.dividersDown[0]}`} stroke={C.stopLine} strokeWidth="3" />
        <path d={`M${CX} ${r.dividersDown[0]}V${r.markBottom}`} stroke={C.onTime} strokeWidth="3" />
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
const TLC = () => {
  const r = road(1);
  const xr = crossRoad(CX + 46);
  const end = r.bottom + 60;
  const t = tee(r, xr, end);
  const y = r.down(1);
  return {
    height: end,
    label: 'RED-LIGHT CROSSING',
    body: (
      <>
        <path d={t.asphalt} fill={C.asphalt} />
        <path d={t.edges} {...AsphaltStroke} />
        <path d={`M0 ${r.center}H${W}`} stroke={C.route} {...BandStroke} />
        <path d={`M${CX} ${y}H${CX + 73}`} stroke={C.alert} {...BandStroke} />
        <path d={t.marks} {...MarkStroke} />
        <path d={`M${CX} ${r.center + GAP / 2}V${r.markBottom}`} stroke={C.stopLine} strokeWidth="3" />
        <path d={`${chevron(88, r.center)}${chevron(180, r.center)}${chevron(380, r.center)}`} fill="none" stroke={C.route} strokeWidth="2.2" />
        <Car x={100} y={y} />
        <Car x={376} y={r.up(1)} />
        <Car x={CX + CAR_L / 2} y={y} kind="ego" />
        <EventMark x={CX} y={y} />
        <path d={`M${CX - 26} ${r.bottom + 32}V${r.bottom + 3}`} stroke={C.edge} strokeWidth="2" />
        <rect x={CX - 34} y={r.bottom + 3} width="16" height="32" rx="3" fill="#2a211b" stroke={C.edge} />
        <circle cx={CX - 26} cy={r.bottom + 10} r="4" fill={C.alert} />
        <circle cx={CX - 26} cy={r.bottom + 19} r="4" fill="#54473c" />
        <circle cx={CX - 26} cy={r.bottom + 28} r="4" fill="#54473c" />
        <text x={CX + 5} y={r.bottom + 29} className="penalty-svg-note">STOP LINE</text>
      </>
    ),
  };
};

const CASES = { NC, DAC, SDC, 'PLCA/S': PLCA, TLC };

const PenaltyDiagram = ({ kind }) => {
  const { height, label, body } = CASES[kind]();
  return (
    <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={`${kind} penalty example`}>
      <rect width={W} height={height} rx="12" fill={C.bg} />
      {body}
      <text x={CX} y="48" textAnchor="middle" className="penalty-svg-alert">{label}</text>
      <text x="20" y="24" className="penalty-svg-note">PENALTY CASE</text>
    </svg>
  );
};

export default PenaltyDiagram;
