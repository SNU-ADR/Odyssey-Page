import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SectionTitle from './common/SectionTitle';
import VideoComparison from './VideoComparison';
import PenaltyDiagram from './PenaltyDiagram';
import '../styles/components/Demo.css';

// Ordered as the penalty factors in RouteDS: P_PLC, P_SD, P_col, P_off, P_TL
const metrics = [
  {
    key: 'PLCA/S',
    koTitle: '교차로 차로 준비',
    enTitle: 'Pre-Lane Change Accuracy / Score',
    koBody: '교차로 진입 전 경로에 맞는 차로에 있었는지 평가합니다. PLCS는 도달하지 못한 교차로도 0점으로 포함합니다.',
    enBody: 'Evaluates route-compatible lane choice before intersections. PLCS also counts unencountered intersections as zero.',
  },
  {
    key: 'SDC',
    koTitle: 'SD 경로 준수',
    enTitle: 'SD Route Compliance',
    koBody: '맵 매칭된 도로 구간이 지정 SD 경로에 속하는지 평가합니다.',
    enBody: 'Checks whether map-matched road segments belong to the designated SD route.',
  },
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
    key: 'TLC',
    koTitle: '교통신호 준수',
    enTitle: 'Traffic Light Compliance',
    koBody: '적색 신호에서 정지선을 넘어 교차로에 진입하는지 평가합니다.',
    enBody: 'Checks whether the ego crosses a stop line against a red signal.',
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

      {/* BEV scene: one SD-route rollout. The ego meets the penalties in formula order:
          P_PLC (stop line before the right turn) -> P_SD (off-route branch) -> P_col -> P_off -> P_TL (last intersection).
          Roads: H1 (2 lanes each way) -> right turn into V2 -> left turn onto H2 -> goal; V3 crosses H2 at the signal. */}
      <g clipPath="url(#rds-scene)">
        {/* asphalt = lanes + 4 px shoulder each side; the wider under-stroke draws the asphalt edge (square caps close the corners) */}
        <g fill="none" stroke="#6a5747" strokeLinecap="square">
          <path d="M0 210H960" strokeWidth="71" />
          <path d="M300 210V380" strokeWidth="51" />
          <path d="M0 300H300" strokeWidth="51" />
          <path d="M300 380H960" strokeWidth="51" />
          <path d="M760 128V460" strokeWidth="51" />
        </g>
        <g fill="none" stroke="#40362e" strokeLinecap="square">
          <path d="M0 210H960" strokeWidth="68" />
          <path d="M300 210V380" strokeWidth="48" />
          <path d="M0 300H300" strokeWidth="48" />
          <path d="M300 380H960" strokeWidth="48" />
          <path d="M760 128V460" strokeWidth="48" />
        </g>
        {/* off-route branch (red, faint) and SD route on the road center lines, both under the lane markings */}
        <path d="M0 300H280" fill="none" stroke="#ef5147" strokeOpacity=".22" strokeWidth="8" />
        <path d="M40 210H300V380H867" fill="none" stroke="#d99455" strokeOpacity=".38" strokeWidth="8" strokeLinejoin="round" />
        <path d="M867 380H930" fill="none" stroke="#d99455" strokeOpacity=".16" strokeWidth="8" />
        <path d="M0 208H280M320 208H740M780 208H960M0 212H280M320 212H740M780 212H960M298 240V360M302 240V360M0 298H280M0 302H280M320 378H740M780 378H960M320 382H740M780 382H960M758 128V180M762 128V180M758 240V360M762 240V360M758 400V460M762 400V460" fill="none" stroke="#a18e7d" strokeOpacity=".55" strokeWidth="1.2" />
        <path d="M0 195H280M320 195H740M780 195H960M0 225H278M320 225H740M780 225H960" fill="none" stroke="#a18e7d" strokeOpacity=".4" strokeWidth="1.2" strokeDasharray="8 8" />
        {/* solid outer lane marks (broken at junction mouths, turning the V2/H2 corner) */}
        <path d="M0 180H740M780 180H960M0 240H280M320 240H740M780 240H960M0 280H280M0 320H280M280 240V280M280 320V400H740M320 240V360H740M780 360H960M780 400H960M740 128V180M780 128V180M740 240V360M780 240V360M740 400V460M780 400V460" fill="none" stroke="#a18e7d" strokeOpacity=".55" strokeWidth="1.2" />
        <path d="M146 205L151 210L146 215M295 330L300 335L305 330M516 375L521 380L516 385M656 375L661 380L656 385" fill="none" stroke="#d99455" strokeWidth="2.2" />

        {/* ego trajectory (in its lane): through lane to the stop line, turn, collision, off-road drift, red light */}
        <path d="M40 217.5H276Q290 217.5 290 232V368Q290 390 312 390H540C556 390 562 407 580 407C598 407 604 390 620 390H852" fill="none" stroke="#f2c18f" strokeOpacity=".85" strokeWidth="2" />

        <circle cx="40" cy="210" r="6" fill="#76b98a" />
        <text x="40" y="258" textAnchor="middle" className="penalty-svg-note">START</text>
        <circle cx="930" cy="380" r="6" fill="#e9c47c" />
        <text x="944" y="352" textAnchor="end" className="penalty-svg-note">GOAL</text>

        {/* 1. P_PLC: stop line before the right turn; route-compatible (outer) lane in green, ego crosses in the through lane */}
        <path d="M278 210V225" stroke="#e7d1ba" strokeWidth="2.5" />
        <path d="M278 225V240" stroke="#a5cb9d" strokeWidth="2.5" />
        <circle cx="278" cy="217.5" r="7" fill="none" stroke="#ef5147" strokeWidth="2.2" />
        <text x="278" y="160" textAnchor="middle" className="penalty-svg-alert">P<tspan dy="3" fontSize="8">PLC</tspan><tspan dy="-3"> ×0.7</tspan></text>
        <text x="278" y="173" textAnchor="middle" className="penalty-svg-note">WRONG LANE AT STOP LINE</text>

        {/* 2. P_SD: entering the off-route branch would give P_SD = 0 */}
        <text x="140" y="342" textAnchor="middle" className="penalty-svg-alert">P<tspan dy="3" fontSize="8">SD</tspan><tspan dy="-3"> = 0</tspan></text>
        <text x="140" y="355" textAnchor="middle" className="penalty-svg-note">IF THE EGO ENTERS AN OFF-ROUTE ROAD</text>

        {/* 3. P_col: at-fault contact with the vehicle ahead */}
        <rect x="432" y="383.5" width="30" height="13" fill="#c8b8a8" opacity=".48" />
        <circle cx="432" cy="390" r="7" fill="none" stroke="#ef5147" strokeWidth="2.2" />
        <text x="432" y="342" textAnchor="middle" className="penalty-svg-alert">P<tspan dy="3" fontSize="8">col</tspan><tspan dy="-3"> ×0.6</tspan></text>
        <text x="432" y="355" textAnchor="middle" className="penalty-svg-note">AT-FAULT COLLISION</text>

        {/* 4. P_off: trajectory drifts over the road edge */}
        <circle cx="580" cy="404" r="7" fill="none" stroke="#ef5147" strokeWidth="2.2" />
        <text x="560" y="428" textAnchor="middle" className="penalty-svg-alert">P<tspan dy="3" fontSize="8">off</tspan></text>
        <text x="560" y="441" textAnchor="middle" className="penalty-svg-note">OFF-ROAD DISTANCE</text>

        {/* 5. P_TL: red light at the last intersection */}
        <path d="M732 380V400" stroke="#e7d1ba" strokeWidth="2.5" />
        <rect x="722" y="406" width="12" height="26" rx="3" fill="#2a211b" stroke="#6a5747" />
        <circle cx="728" cy="412" r="3" fill="#ef5147" />
        <circle cx="728" cy="419" r="3" fill="#4a3d33" />
        <circle cx="728" cy="426" r="3" fill="#4a3d33" />
        <circle cx="760" cy="390" r="7" fill="none" stroke="#ef5147" strokeWidth="2.2" />
        <text x="714" y="420" textAnchor="end" className="penalty-svg-alert">P<tspan dy="3" fontSize="8">TL</tspan><tspan dy="-3"> ×0.7</tspan></text>
        <text x="714" y="433" textAnchor="end" className="penalty-svg-note">RED LIGHT</text>

        {/* ego at the end of the rollout; RC_SD = completed part of the route */}
        <rect x="852" y="383" width="30" height="14" fill="#f2c18f" stroke="#ef5147" strokeWidth="2" />
        <text x="944" y="446" textAnchor="end" className="rds-route">RC<tspan dy="3" fontSize="8">SD</tspan><tspan dy="-3"> = COMPLETED ÷ TOTAL SD ROUTE</tspan></text>

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

// Ordered as the penalty factors in RouteDS: P_PLC, P_SD, P_col, P_off, P_TL
const penaltyCases = [
  {
    key: 'PLCA/S',
    koTitle: '사전 차로 변경(Pre-Lane Change) 실패',
    enTitle: 'Fails the pre-lane change',
    koBody: '경로에 맞는 차로는 우회전 차로입니다. 마지막 10 m(주행 거리) 전에 들어오면 1점, 그 안에서 들어오면 0.5점, 다른 차로로 정지선에 닿으면 0점입니다. 자차는 직진 차로로 정지선에 닿은 뒤에야 방향을 틀어 0점입니다.',
    enBody: 'The right-turn lane fits the route. Entering it before the last 10 m of driving scores 1, within it 0.5, and reaching the stop line in another lane 0. The ego only turns at the stop line, still in the through lane, so it scores 0.',
    video: { src: 'metric-plca-bev.mp4', poster: 'metric-plca-poster.jpg', koDetail: '잘못된 차로로 진입 · 107.0초 · sim step 1070', enDetail: 'Wrong lane at entry · 107.0 s · sim step 1070' },
  },
  {
    key: 'SDC',
    koTitle: '지정 경로 이탈',
    enTitle: 'Departs from the SD route',
    koBody: 'SD 경로는 분기로 우회전합니다. 자차는 분기를 놓치고 직진해, 경로에 없는 도로 구간(빨간색)을 주행합니다.',
    enBody: 'The SD route turns right into the branch. The ego misses the turn and continues straight onto a road segment outside the route (red).',
    video: { src: 'metric-sdc-bev.mp4', poster: 'metric-sdc-poster.jpg', koDetail: '경로와 궤적이 갈라지는 시점 · sim step 120', enDetail: 'Route and rollout diverge · sim step 120' },
  },
  {
    key: 'NC',
    koTitle: '과실 충돌',
    enTitle: 'At-fault collision',
    koBody: '자차가 앞차를 뒤에서 추돌한 과실 충돌입니다.',
    enBody: 'The ego rear-ends the vehicle ahead, an at-fault collision.',
    video: { src: 'metric-nc-bev.mp4', poster: 'metric-nc-poster.jpg', koDetail: '실제 접촉 기록 · sim step 182', enDetail: 'Recorded contact · sim step 182' },
  },
  {
    key: 'DAC',
    koTitle: '비주행 영역 진입',
    enTitle: 'Leaves the drivable area',
    koBody: '자차가 도로 경계에 걸쳐 차체 일부가 주행 가능 영역 밖으로 나간 상황입니다.',
    enBody: 'The ego straddles the road edge, with part of its footprint outside the drivable area.',
    video: { src: 'metric-dac-bev.mp4', poster: 'metric-dac-poster.jpg', koDetail: '비주행 영역 flag · sim step 358', enDetail: 'Non-drivable area flag · sim step 358' },
  },
  {
    key: 'TLC',
    koTitle: '적색 신호 정지선 통과',
    enTitle: 'Red-light crossing',
    koBody: '적색 신호에서 정지선을 통과하면 감점됩니다. 오른쪽 영상은 c092의 실제 직진 위반 기록입니다.',
    enBody: 'Crossing a stop line under a red signal incurs a penalty. The replay shows the recorded straight-through violation in c092.',
    video: {
      src: 'metric-tlc-bev.mp4',
      poster: 'metric-tlc-poster.jpg',
      koDetail: '실제 위반: c092 / SafeDrive Safety Scoring · 78.2–81.9초 · 위반 2회',
      enDetail: 'Recorded red-light violation · c092 / SafeDrive Safety Scoring · 78.2–81.9 s · 2 flags',
    },
  },
];

// One row per metric: concept diagram | recorded BEV replay
const PenaltyCaseRows = ({ ko }) => (
  <>
    <div className="metric-diagram-intro">
      <h4>{ko ? '감점 상황' : 'Penalty cases'}</h4>
      <p>{ko ? '왼쪽은 개념도, 오른쪽은 실제 rollout 기록입니다. 개념도에서 빨간 테두리 차량이 자차이고, 흐린 차량은 주변 차량 또는 자차의 이전 위치입니다. 노란색은 예정 경로, 빨간 원은 감점이 발생한 지점입니다.' : 'Left: concept diagram. Right: recorded rollout. In the diagrams, the red-outlined box is the ego; faded boxes are other traffic or earlier ego positions. Yellow shows the expected route, and the red circle marks where the penalty occurs.'}</p>
    </div>
    <div className="penalty-rows">
      {penaltyCases.map((item) => (
        <section className="penalty-row" key={item.key}>
          <div className="penalty-row-heading">
            <span>{item.key}</span>
            <h4>{ko ? item.koTitle : item.enTitle}</h4>
          </div>
          <div className="penalty-row-panels">
            <figure className="penalty-row-panel">
              <PenaltyDiagram kind={item.key} />
              <figcaption>{ko ? item.koBody : item.enBody}</figcaption>
            </figure>
            <figure className="penalty-row-panel">
              <video
                className="metric-video"
                poster={`${process.env.PUBLIC_URL}/videos/${item.video.poster}?v=20261001l`}
                controls
                playsInline
                loop
                muted
                preload="metadata"
                aria-label={`${item.key} ${ko ? '재생' : 'replay'}`}
              >
                <source src={`${process.env.PUBLIC_URL}/videos/${item.video.src}?v=20261001l`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <figcaption>{ko ? item.video.koDetail : item.video.enDetail}</figcaption>
            </figure>
          </div>
        </section>
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
        <div className="metric-cards">
          {metrics.map((metric) => (
            <section className="metric-card" key={metric.key}>
              <span>{metric.key}</span>
              <h3>{ko ? metric.koTitle : metric.enTitle}</h3>
              <p>{ko ? metric.koBody : metric.enBody}</p>
            </section>
          ))}
        </div>
        <PenaltyCaseRows ko={ko} />
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
