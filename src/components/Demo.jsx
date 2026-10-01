import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SectionTitle from './common/SectionTitle';
import VideoComparison from './VideoComparison';
import '../styles/components/Demo.css';

const metrics = [
  {
    key: 'NC',
    koTitle: '충돌 회피',
    enTitle: 'No Collision',
    koBody: '차량·보행자·자전거와의 과실 충돌을 확인합니다.',
    enBody: 'Checks at-fault collisions with vehicles, pedestrians, and bicycles.',
  },
  {
    key: 'DAC',
    koTitle: '주행 가능 영역 준수',
    enTitle: 'Drivable Area Compliance',
    koBody: '주행 가능 영역 밖 또는 역방향으로 이동한 거리를 살핍니다.',
    enBody: 'Tracks distance driven outside drivable areas or against traffic.',
  },
  {
    key: 'SDC',
    koTitle: 'SD 경로 준수',
    enTitle: 'SD Route Compliance',
    koBody: '맵 매칭된 도로 구간이 지정 SD 경로에 속하는지 평가합니다.',
    enBody: 'Checks whether map-matched road segments belong to the designated SD route.',
  },
  {
    key: 'PLCA/S',
    koTitle: '교차로 차로 준비',
    enTitle: 'Pre-Lane Change Accuracy / Score',
    koBody: '교차로 진입 전 경로에 맞는 차로에 있었는지 평가합니다. PLCS는 도달하지 못한 교차로도 0점으로 포함합니다.',
    enBody: 'Evaluates route-compatible lane choice before intersections. PLCS also counts unencountered intersections as zero.',
  },
];

const PlannerVideoPlaceholder = ({ label, ko }) => (
  <div
    className="planner-video-placeholder"
    role="img"
    aria-label={`${label} — ${ko ? '영상 준비 중, 2분 31초' : 'Video coming soon, 2 minutes 31 seconds'}`}
  >
    <div className="planner-video-placeholder-center">
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="22" />
        <path d="M20 16L32 24L20 32Z" />
      </svg>
      <span>{ko ? '영상 준비 중' : 'Video coming soon'}</span>
    </div>
    <span className="planner-video-duration" aria-hidden="true">2:31</span>
  </div>
);

const plannerScenarios = ['Collision', 'Pre-Lane Change', 'Traffic Light', 'Pedestrian'];

// RouteDS = 100 · RC_SD · P_PLC · P_SD · P_col · P_off · P_TL (paper appendix, "RouteDS Components")
const routeDsTerms = [
  { sym: 'RC', sub: 'SD', name: 'Route completion', rule: 'completed ÷ total', route: true },
  { sym: 'P', sub: 'PLC', name: 'Pre-lane change', rule: '×0.9 late · ×0.7 wrong' },
  { sym: 'P', sub: 'SD', name: 'SD route', rule: '0 if off route' },
  { sym: 'P', sub: 'col', name: 'At-fault collision', rule: '×0.6 veh · ×0.5 ped' },
  { sym: 'P', sub: 'off', name: 'Off-road driving', rule: <>1 − D<tspan dy="3" fontSize="8">off</tspan><tspan dy="-3"> ÷ D</tspan><tspan dy="3" fontSize="8">total</tspan></> },
  { sym: 'P', sub: 'TL', name: 'Red light', rule: '×0.7 per violation' },
];

const MetricFigure = ({ ko }) => (
  <figure className="metric-figure">
    <svg viewBox="0 0 960 460" role="img" aria-labelledby="metric-figure-title metric-figure-desc">
      <title id="metric-figure-title">{ko ? 'RouteDS 개요' : 'RouteDS overview'}</title>
      <desc id="metric-figure-desc">{ko ? 'RouteDS는 SD 경로 완료율에 감점 계수를 곱합니다. 하나의 rollout 위에 각 계수가 적용되는 위치를 표시했습니다.' : 'RouteDS multiplies SD-route completion by penalty factors, shown where each applies along one rollout.'}</desc>
      <defs>
        <pattern id="rds-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#8e6b50" strokeOpacity=".12" strokeWidth="1" /></pattern>
        <clipPath id="rds-scene"><rect x="0" y="128" width="960" height="332" /></clipPath>
      </defs>
      <rect width="960" height="460" rx="16" fill="#17120f" />
      <rect width="960" height="460" rx="16" fill="url(#rds-grid)" />

      {/* Formula: RouteDS = 100 x RC_SD x penalty factors */}
      <text x="24" y="68" className="rds-title">RouteDS</text>
      <text x="24" y="96" className="rds-eq">= 100 ×</text>
      {routeDsTerms.map((term, i) => {
        const x = 160 + i * 133;
        return (
          <g key={term.sym + term.sub}>
            <g transform={`translate(${x} 36)`}>
              <rect width="119" height="74" rx="8" fill="#221a15" stroke={term.route ? '#d99455' : '#ef5147'} strokeOpacity={term.route ? '.7' : '.45'} />
              <text x="12" y="26" className="rds-sym" fill={term.route ? '#e6a765' : '#ff8379'}>{term.sym}<tspan dy="4" fontSize="11">{term.sub}</tspan></text>
              <text x="12" y="48" className="rds-name">{term.name}</text>
              <text x="12" y="64" className="rds-rule">{term.rule}</text>
            </g>
            {i < routeDsTerms.length - 1 && <text x={x + 126} y="78" textAnchor="middle" className="rds-times">×</text>}
          </g>
        );
      })}

      <path d="M16 128H944" stroke="#8d7865" strokeOpacity=".3" strokeWidth="1" />

      {/* BEV scene: one SD-route rollout */}
      <g clipPath="url(#rds-scene)">
        {/* roads: H1 (4 lanes), V1 and V2/H2 (2 lanes); the wider under-stroke draws the edge lines */}
        <g fill="none" stroke="#6a5747" strokeLinejoin="miter">
          <path d="M0 230H960" strokeWidth="63" />
          <path d="M270 128V460" strokeWidth="43" />
          <path d="M620 230V400H960" strokeWidth="43" />
        </g>
        <g fill="none" stroke="#40362e" strokeLinejoin="miter">
          <path d="M0 230H960" strokeWidth="60" />
          <path d="M270 128V460" strokeWidth="40" />
          <path d="M620 230V400H960" strokeWidth="40" />
        </g>
        {/* off-route roads (red, faint), under the lane markings */}
        <path d="M270 200V128M270 260V460M640 245H960" fill="none" stroke="#ef5147" strokeOpacity=".22" strokeWidth="10" />
        <path d="M0 228H250M290 228H600M640 228H960M0 232H250M290 232H600M640 232H960M268 128V200M272 128V200M268 260V460M272 260V460M618 260V380M622 260V380M640 398H960M640 402H960" fill="none" stroke="#a18e7d" strokeOpacity=".55" strokeWidth="1.2" />
        <path d="M0 215H250M290 215H600M640 215H960M0 245H250M290 245H600M640 245H960" fill="none" stroke="#a18e7d" strokeOpacity=".4" strokeWidth="1.2" strokeDasharray="8 8" />

        {/* SD route: completed part stronger, remaining part faint */}
        <path d="M40 245H596Q610 245 610 259V396Q610 410 624 410H790" fill="none" stroke="#d99455" strokeOpacity=".38" strokeWidth="10" strokeLinejoin="round" />
        <path d="M828 410H930" fill="none" stroke="#d99455" strokeOpacity=".16" strokeWidth="10" />
        <path d="M146 240L151 245L146 250M376 240L381 245L376 250M605 286L610 291L615 286M696 405L701 410L696 415" fill="none" stroke="#d99455" strokeWidth="2.2" />

        {/* ego trajectory */}
        <path d="M40 237.5H592Q610 237.5 610 256V295C610 306 597 311 597 320C597 329 610 334 610 345V396Q610 410 624 410H790" fill="none" stroke="#f2c18f" strokeOpacity=".85" strokeWidth="2" />

        <circle cx="40" cy="245" r="6" fill="#76b98a" />
        <text x="40" y="280" textAnchor="middle" className="penalty-svg-note">START</text>
        <circle cx="930" cy="410" r="6" fill="#e9c47c" />
        <text x="944" y="370" textAnchor="end" className="penalty-svg-note">GOAL</text>

        {/* P_TL: red light at intersection A */}
        <path d="M248 230V260" stroke="#e7d1ba" strokeWidth="2.5" />
        <rect x="230" y="266" width="12" height="26" rx="3" fill="#2a211b" stroke="#6a5747" />
        <circle cx="236" cy="272" r="3" fill="#ef5147" />
        <circle cx="236" cy="279" r="3" fill="#4a3d33" />
        <circle cx="236" cy="286" r="3" fill="#4a3d33" />
        <circle cx="270" cy="237.5" r="9" fill="none" stroke="#ef5147" strokeWidth="2.5" />
        <text x="240" y="314" textAnchor="end" className="penalty-svg-alert">P<tspan dy="3" fontSize="8">TL</tspan><tspan dy="-3"> ×0.7</tspan></text>
        <text x="240" y="327" textAnchor="end" className="penalty-svg-note">RED LIGHT</text>

        {/* P_col: at-fault contact with the vehicle ahead */}
        <rect x="436" y="231" width="30" height="13" fill="#c8b8a8" opacity=".48" />
        <circle cx="436" cy="237.5" r="9" fill="none" stroke="#ef5147" strokeWidth="2.5" />
        <text x="436" y="180" textAnchor="middle" className="penalty-svg-alert">P<tspan dy="3" fontSize="8">col</tspan><tspan dy="-3"> ×0.6</tspan></text>
        <text x="436" y="193" textAnchor="middle" className="penalty-svg-note">AT-FAULT COLLISION</text>

        {/* P_PLC: stop line at B; compatible (outer) lane in green, ego crosses in the inner lane */}
        <path d="M598 230V245" stroke="#e7d1ba" strokeWidth="2.5" />
        <path d="M598 245V260" stroke="#a5cb9d" strokeWidth="2.5" />
        <circle cx="598" cy="237.5" r="9" fill="none" stroke="#ef5147" strokeWidth="2.5" />
        <text x="598" y="180" textAnchor="middle" className="penalty-svg-alert">P<tspan dy="3" fontSize="8">PLC</tspan><tspan dy="-3"> ×0.7</tspan></text>
        <text x="598" y="193" textAnchor="middle" className="penalty-svg-note">WRONG LANE AT STOP LINE</text>

        {/* P_off: trajectory drifts over the road edge */}
        <circle cx="598" cy="320" r="9" fill="none" stroke="#ef5147" strokeWidth="2.5" />
        <text x="582" y="316" textAnchor="end" className="penalty-svg-alert">P<tspan dy="3" fontSize="8">off</tspan></text>
        <text x="582" y="329" textAnchor="end" className="penalty-svg-note">OFF-ROAD DISTANCE</text>

        {/* P_SD: entering any off-route road gives P_SD = 0 */}
        <text x="800" y="180" textAnchor="middle" className="penalty-svg-alert">P<tspan dy="3" fontSize="8">SD</tspan><tspan dy="-3"> = 0</tspan></text>
        <text x="800" y="193" textAnchor="middle" className="penalty-svg-note">IF THE EGO ENTERS AN OFF-ROUTE ROAD</text>

        {/* ego at the end of the rollout */}
        <rect x="790" y="403" width="30" height="14" fill="#f2c18f" stroke="#ef5147" strokeWidth="2" />
        <text x="660" y="442" className="rds-route">RC<tspan dy="3" fontSize="8">SD</tspan><tspan dy="-3"> = COMPLETED ÷ TOTAL SD ROUTE</tspan></text>

        <g transform="translate(24 440)">
          <path d="M0 0H18" stroke="#d99455" strokeOpacity=".6" strokeWidth="8" />
          <text x="24" y="3" className="penalty-svg-note">SD ROUTE</text>
          <path d="M86 0H104" stroke="#f2c18f" strokeWidth="2" />
          <text x="110" y="3" className="penalty-svg-note">EGO PATH</text>
          <path d="M0 14H18" stroke="#ef5147" strokeOpacity=".4" strokeWidth="8" />
          <text x="24" y="17" className="penalty-svg-note">OFF-ROUTE ROAD</text>
        </g>
      </g>
    </svg>
    <figcaption>{ko ? 'RouteDS는 SD 경로 완료율에 감점 계수를 곱합니다. 표시는 하나의 rollout에서 각 계수가 적용되는 위치이며, 주행 가능 영역 이탈 거리에는 역방향 주행도 포함됩니다.' : 'RouteDS multiplies SD-route completion by penalty factors. Markers show where each factor applies along one rollout; off-road distance also counts driving against traffic.'}</figcaption>
  </figure>
);

const penaltyCases = [
  {
    key: 'NC',
    koTitle: '과실 충돌',
    enTitle: 'At-fault collision',
    koBody: '자차가 앞차를 뒤에서 추돌한 과실 충돌입니다.',
    enBody: 'The ego rear-ends the vehicle ahead, an at-fault collision.',
  },
  {
    key: 'DAC',
    koTitle: '비주행 영역 진입',
    enTitle: 'Leaves the drivable area',
    koBody: '자차가 도로 경계에 걸쳐 차체 일부가 주행 가능 영역 밖으로 나간 상황입니다.',
    enBody: 'The ego straddles the road edge, with part of its footprint outside the drivable area.',
  },
  {
    key: 'SDC',
    koTitle: '지정 경로 이탈',
    enTitle: 'Departs from the SD route',
    koBody: 'SD 경로는 분기로 우회전합니다. 자차는 분기를 놓치고 직진해, 경로에 없는 도로 구간(빨간색)을 주행합니다.',
    enBody: 'The SD route turns right into the branch. The ego misses the turn and continues straight onto a road segment outside the route (red).',
  },
  {
    key: 'PLCA/S',
    koTitle: '사전 차로 변경(Pre-Lane Change) 실패',
    enTitle: 'Fails the pre-lane change',
    koBody: 'SD 경로가 우회전하므로 2차로만 경로에 맞는 차로입니다. 자차는 정지선 전 10 m 확인 구간을 거치지 않고, 1차로로 정지선을 넘어 우회전합니다.',
    enBody: 'The SD route turns right, so only lane 2 is route-compatible. The ego skips the 10 m check zone and crosses the stop line in lane 1 while turning right.',
  },
];

const PenaltyDiagram = ({ kind }) => (
  <svg viewBox="0 0 480 230" role="img" aria-label={`${kind} penalty example`}>
    <rect width="480" height="230" rx="12" fill="#17120f" />
    {/* All cases share one layout: two-way road with a double center line, event circle (no X) at x=240, label centered above the road */}
    {kind === 'NC' && (
      <>
        <rect x="0" y="62" width="480" height="112" fill="#40362e" />
        <path d="M0 62H480M0 174H480" fill="none" stroke="#8d7865" strokeOpacity=".48" strokeWidth="2" />
        <path d="M0 116H480M0 120H480" fill="none" stroke="#a18e7d" strokeOpacity=".55" strokeWidth="1.5" />
        <g fill="#c8b8a8" opacity=".22">
          <rect x="84" y="136" width="36" height="20" />
          <rect x="360" y="80" width="36" height="20" />
        </g>
        <rect x="240" y="136" width="38" height="20" fill="#c8b8a8" opacity=".48" />
        <rect x="202" y="136" width="38" height="20" fill="#f2c18f" stroke="#ef5147" strokeWidth="2" />
        <circle cx="240" cy="146" r="11" fill="none" stroke="#ef5147" strokeWidth="3" />
        <text x="240" y="48" textAnchor="middle" className="penalty-svg-alert">CONTACT</text>
      </>
    )}
    {kind === 'DAC' && (
      <>
        <rect x="0" y="62" width="480" height="112" fill="#40362e" />
        <path d="M0 62H480M0 174H480" fill="none" stroke="#8d7865" strokeOpacity=".48" strokeWidth="2" />
        <path d="M0 116H480M0 120H480" fill="none" stroke="#a18e7d" strokeOpacity=".55" strokeWidth="1.5" />
        <g fill="#d0c0b0" opacity=".22">
          <rect x="84" y="136" width="36" height="20" />
          <rect x="360" y="80" width="36" height="20" />
        </g>
        {/* ego straddles the road edge: only the front-right corner is outside */}
        <rect x="205" y="156" width="38" height="20" transform="rotate(14 224 166)" fill="#f2c18f" stroke="#ef5147" strokeWidth="2" />
        <circle cx="240" cy="178" r="11" fill="none" stroke="#ef5147" strokeWidth="3" />
        <text x="240" y="48" textAnchor="middle" className="penalty-svg-alert">OFF-ROAD</text>
      </>
    )}
    {kind === 'SDC' && (
      <>
        <rect x="0" y="62" width="480" height="112" fill="#40362e" />
        <rect x="184" y="174" width="112" height="56" fill="#40362e" />
        <path d="M0 62H480M0 174H184V230M296 230V174H480" fill="none" stroke="#8d7865" strokeOpacity=".48" strokeWidth="2" />
        {/* SD route on the road center (no direction split, as in PLCA/S), then right into the branch; red = road taken after missing it */}
        <path d="M0 118H240V230" fill="none" stroke="#d99455" strokeOpacity=".38" strokeWidth="12" strokeLinejoin="round" />
        <path d="M240 118H480" fill="none" stroke="#ef5147" strokeOpacity=".38" strokeWidth="12" />
        <path d="M0 116H480M0 120H480M238 174V230M242 174V230" fill="none" stroke="#a18e7d" strokeOpacity=".55" strokeWidth="1.5" />
        <path d="M86 112L92 118L86 124M166 112L172 118L166 124M234 196L240 202L246 196" fill="none" stroke="#d99455" strokeWidth="2.5" />
        <g fill="#d0c0b0" opacity=".22">
          <rect x="84" y="136" width="36" height="20" />
          <rect x="360" y="80" width="36" height="20" />
        </g>
        <rect x="311" y="136" width="38" height="20" fill="#f2c18f" stroke="#ef5147" strokeWidth="2" />
        <circle cx="240" cy="118" r="11" fill="none" stroke="#ef5147" strokeWidth="3" />
        <text x="240" y="48" textAnchor="middle" className="penalty-svg-alert">MISSED BRANCH</text>
      </>
    )}
    {kind === 'PLCA/S' && (
      <>
        {/* main road: 2 lanes each way (double center line); lane 2 diverges into the right turn at the stop line; cross road below */}
        <path d="M0 62H480V158H316Q300 158 300 174V230H240V174Q240 158 224 158H0Z" fill="#40362e" />
        <path d="M0 62H480M0 158H224Q240 158 240 174V230M300 230V174Q300 158 316 158H480" fill="none" stroke="#8d7865" strokeOpacity=".48" strokeWidth="2" />
        {/* SD route on the road center: straight, then right at the intersection */}
        <path d="M0 110H270V230" fill="none" stroke="#d99455" strokeOpacity=".38" strokeWidth="12" strokeLinejoin="round" />
        <path d="M0 108H480M0 112H480M268 174V230M272 174V230" fill="none" stroke="#a18e7d" strokeOpacity=".55" strokeWidth="1.5" />
        <path d="M0 86H240M300 86H480M0 134H240M300 134H480" fill="none" stroke="#a18e7d" strokeOpacity=".4" strokeWidth="1.2" strokeDasharray="8 8" />
        <path d="M56 104L62 110L56 116M146 104L152 110L146 116M264 206L270 212L276 206" fill="none" stroke="#d99455" strokeWidth="2.5" />
        <text x="14" y="125" className="penalty-svg-note">LANE 1</text>
        <text x="14" y="149" className="penalty-svg-note">LANE 2</text>
        {/* pre-lane change check zone (final 10 m before the stop line) on lane 2, the route-compatible lane */}
        <rect x="156" y="134" width="84" height="24" fill="#a5cb9d" opacity=".2" />
        <path d="M156 178V186M240 178V186M156 182H240" fill="none" stroke="#b9a99a" strokeWidth="1.2" />
        <text x="236" y="200" textAnchor="end" className="penalty-svg-note">PRE-LANE CHANGE CHECK ZONE · 10 m</text>
        <path d="M240 110V134" stroke="#e7d1ba" strokeWidth="3" />
        <path d="M240 134V158" stroke="#a5cb9d" strokeWidth="3" />
        <g fill="#d0c0b0" opacity=".22">
          <rect x="84" y="112" width="36" height="20" />
          <rect x="360" y="64" width="36" height="20" />
        </g>
        {/* ego crossed the stop line in lane 1 and is turning right at ~45 deg, never touching the check zone */}
        <rect x="241" y="128" width="38" height="20" transform="rotate(45 260 138)" fill="#f2c18f" stroke="#ef5147" strokeWidth="2" />
        <circle cx="240" cy="122" r="11" fill="none" stroke="#ef5147" strokeWidth="3" />
        <text x="240" y="48" textAnchor="middle" className="penalty-svg-alert">WRONG LANE AT STOP LINE</text>
      </>
    )}
    <text x="20" y="24" className="penalty-svg-note">PENALTY CASE</text>
  </svg>
);

const PenaltyCaseGrid = ({ ko }) => (
  <>
    <div className="metric-diagram-intro">
      <h4>{ko ? '감점 상황 개념도' : 'Penalty cases'}</h4>
      <p>{ko ? '빨간 테두리 차량이 자차이고, 흐린 차량은 주변 차량 또는 자차의 이전 위치입니다. 노란색은 예정 경로, 빨간 원은 감점이 발생한 지점입니다.' : 'The red-outlined box is the ego; faded boxes are other traffic or earlier ego positions. Yellow shows the expected route, and the red circle marks where the penalty occurs.'}</p>
    </div>
    <div className="penalty-diagrams">
      {penaltyCases.map((item) => (
        <article className="penalty-case-card" key={item.key}>
          <div className="penalty-case-heading">
            <span>{item.key}</span>
            <h4>{ko ? item.koTitle : item.enTitle}</h4>
          </div>
          <PenaltyDiagram kind={item.key} />
          <p>{ko ? item.koBody : item.enBody}</p>
        </article>
      ))}
    </div>
  </>
);

const Demo = () => {
  const { lang } = useLanguage();
  const ko = lang === 'ko';
  const placeholder = (title, body, className = '') => (
    <div className={`demo-placeholder ${className}`}>
      <span className="demo-placeholder-mark" aria-hidden="true">＋</span>
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );

  return (
    <section id="demo" className="demo-section" aria-label="Demo">
      <article className="demo-chapter" id="odyssey-concept">
        <SectionTitle
          title={ko ? 'Odyssey 컨셉' : 'Odyssey Concept'}
        />
        <div className="demo-video-frame">
          <video controls playsInline preload="metadata" className="demo-video">
            <source src={`${process.env.PUBLIC_URL}/videos/odyssey-paper-demo.mp4`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </article>

      <article className="demo-chapter" id="planner-demos">
        <SectionTitle
          title="Closed-Loop Planner Evaluation"
        />
        <div className="planner-demos">
          <div className="planner-route-comparison">
            <h3 className="planner-concept-title">Command vs SD Route</h3>
            <div className="planner-video-grid">
              {['Scenario 1', 'Scenario 2'].map((label) => (
                <figure className="planner-video-card" key={label}>
                  <PlannerVideoPlaceholder label={label} ko={ko} />
                  <figcaption className="planner-video-label">{label}</figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className="planner-video-grid planner-scenarios">
            {plannerScenarios.map((label) => (
              <figure className="planner-video-card" key={label}>
                <figcaption>
                  <h3 className="planner-concept-title">{label}</h3>
                </figcaption>
                <PlannerVideoPlaceholder label={label} ko={ko} />
              </figure>
            ))}
          </div>
        </div>
      </article>

      <article className="demo-chapter" id="evaluation-metrics">
        <SectionTitle
          title={ko ? '평가 지표' : 'Evaluation Metrics'}
          subtitle={ko ? '지표 그림 → 장면 이미지 예시 → BEV 재생 데모 순서로 구성합니다.' : 'Metric figure → scenario image examples → BEV playback.'}
        />
        <MetricFigure ko={ko} />
        <PenaltyCaseGrid ko={ko} />
        <div className="metric-cards">
          {metrics.map((metric) => (
            <section className="metric-card" key={metric.key}>
              <span>{metric.key}</span>
              <h3>{ko ? metric.koTitle : metric.enTitle}</h3>
              <p>{ko ? metric.koBody : metric.enBody}</p>
            </section>
          ))}
        </div>
        <div className="metric-video-grid">
          {[
            {
              key: 'NC',
              title: ko ? '충돌 이벤트' : 'Collision event',
              detail: ko ? '실제 접촉 기록 · sim step 182' : 'Recorded contact · sim step 182',
              src: 'metric-nc-bev.mp4', poster: 'metric-nc-poster.jpg',
            },
            {
              key: 'DAC',
              title: ko ? '주행 가능 영역 위반' : 'Drivable area violation',
              detail: ko ? '비주행 영역 flag · sim step 358' : 'Non-drivable area flag · sim step 358',
              src: 'metric-dac-bev.mp4', poster: 'metric-dac-poster.jpg',
            },
            {
              key: 'SDC',
              title: ko ? 'SD 경로 이탈' : 'SD route departure',
              detail: ko ? '경로와 궤적이 갈라지는 시점 · sim step 120' : 'Route and rollout diverge · sim step 120',
              src: 'metric-sdc-bev.mp4', poster: 'metric-sdc-poster.jpg',
            },
            {
              key: 'PLCA/S',
              title: ko ? '우회전 전 차로 변경 지연' : 'Missed pre-turn lane change',
              detail: ko ? '잘못된 차로 진입 · 107.0초 · sim step 1070' : 'Wrong lane at entry · 107.0 s · sim step 1070',
              src: 'metric-plca-bev.mp4', poster: 'metric-plca-poster.jpg',
            },
          ].map((item) => (
            <article className="metric-video-card" key={item.key}>
              <div className="metric-video-heading">
                <span>{item.key}</span>
                <div><h4>{item.title}</h4><p>{item.detail}</p></div>
              </div>
              <video className="metric-video" poster={`${process.env.PUBLIC_URL}/videos/${item.poster}?v=20261001d`} controls playsInline loop muted preload="metadata" aria-label={item.title}>
                <source src={`${process.env.PUBLIC_URL}/videos/${item.src}?v=20261001d`} type={item.src.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
                Your browser does not support the video tag.
              </video>
            </article>
          ))}
        </div>
      </article>

      <article className="demo-chapter" id="rendering-comparison">
        <SectionTitle
          title="3DGS / Diffusion Refinement"
        />
        <div className="video-comparison-grid">
          {[1, 2, 3, 4].map((scene) => (
            <VideoComparison
              key={scene}
              label={`${ko ? '장면' : 'Scene'} ${scene}`}
              beforeSrc={`${process.env.PUBLIC_URL}/videos/odyssey-paper-demo.mp4`}
              afterSrc={`${process.env.PUBLIC_URL}/videos/odyssey-paper-demo.mp4`}
              ko={ko}
            />
          ))}
        </div>
      </article>
    </section>
  );
};

export default Demo;
