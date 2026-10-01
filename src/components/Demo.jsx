import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SectionTitle from './common/SectionTitle';
import VideoComparison from './VideoComparison';
import PenaltyDiagram, { DIAGRAM_ASPECT } from './PenaltyDiagram';
import '../styles/components/Demo.css';

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

const RdsGrid = ({ id }) => (
  <pattern id={id} width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#8e6b50" strokeOpacity=".12" strokeWidth="1" /></pattern>
);

// Formula strip (top of the section): RouteDS = 100 x RC_SD x penalty factors
const MetricFormula = ({ ko }) => (
  <figure className="metric-figure">
    <svg viewBox="0 12 960 122" role="img" aria-labelledby="metric-formula-title">
      <title id="metric-formula-title">{ko ? 'RouteDS = 100 × SD 경로 완료율 × 감점 계수' : 'RouteDS = 100 × SD-route completion × penalty factors'}</title>
      <defs><RdsGrid id="rds-grid-formula" /></defs>
      <rect y="12" width="960" height="122" rx="16" fill="#17120f" />
      <rect y="12" width="960" height="122" rx="16" fill="url(#rds-grid-formula)" />
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
    </svg>
  </figure>
);

// Overview scene (after the penalty cases): every factor along one rollout
const MetricFigure = ({ ko }) => (
  <figure className="metric-figure">
    <svg viewBox="0 128 960 332" role="img" aria-labelledby="metric-figure-title metric-figure-desc">
      <title id="metric-figure-title">{ko ? 'RouteDS 개요' : 'RouteDS overview'}</title>
      <desc id="metric-figure-desc">{ko ? '하나의 rollout 위에 각 감점 계수가 적용되는 위치를 표시했습니다.' : 'Where each RouteDS factor applies along one rollout.'}</desc>
      <defs>
        <RdsGrid id="rds-grid" />
        <clipPath id="rds-scene"><rect x="0" y="128" width="960" height="332" /></clipPath>
      </defs>
      <rect y="128" width="960" height="332" rx="16" fill="#17120f" />
      <rect y="128" width="960" height="332" rx="16" fill="url(#rds-grid)" />

      {/* BEV scene: one SD-route rollout. The ego meets the penalties in formula order:
          P_PLC (stop line before the right turn) -> P_SD (off-route branch) -> P_col -> P_off -> P_TL (last intersection).
          Roads: H1 (2 lanes each way) -> right turn into V2 -> left turn onto H2 -> goal; V3 crosses H2 at the signal. */}
      <g clipPath="url(#rds-scene)">
        {/* asphalt = lanes only (edge, dividers and center evenly spaced); the wider under-stroke draws the edge (square caps close the corners) */}
        <g fill="none" stroke="#6a5747" strokeLinecap="square">
          <path d="M0 210H960" strokeWidth="63" />
          <path d="M300 210V380" strokeWidth="43" />
          <path d="M0 300H300" strokeWidth="43" />
          <path d="M300 380H960" strokeWidth="43" />
          <path d="M760 128V460" strokeWidth="43" />
        </g>
        <g fill="none" stroke="#40362e" strokeLinecap="square">
          <path d="M0 210H960" strokeWidth="60" />
          <path d="M300 210V380" strokeWidth="40" />
          <path d="M0 300H300" strokeWidth="40" />
          <path d="M300 380H960" strokeWidth="40" />
          <path d="M760 128V460" strokeWidth="40" />
        </g>
        {/* off-route branch (red, faint) and SD route on the road center lines, both under the lane markings */}
        <path d="M0 300H300" fill="none" stroke="#ef5147" strokeOpacity=".22" strokeWidth="8" />
        <path d="M40 210H300V380H867" fill="none" stroke="#d99455" strokeOpacity=".38" strokeWidth="8" strokeLinejoin="round" />
        {/* remaining (not yet completed) part of the SD route: same band, dashed */}
        <path d="M867 380H930" fill="none" stroke="#d99455" strokeOpacity=".38" strokeWidth="8" strokeDasharray="6 5" />
        {/* one thick solid center line per road (broken at junctions); no outer lane marks */}
        <path d="M0 210H280M320 210H740M780 210H960M300 240V360M0 300H280M320 380H740M780 380H960M760 128V180M760 240V360M760 400V460" fill="none" stroke="#a18e7d" strokeOpacity=".7" strokeWidth="3" />
        <path d="M0 195H280M320 195H740M780 195H960M0 225H278M320 225H740M780 225H960" fill="none" stroke="#a18e7d" strokeOpacity=".4" strokeWidth="1.2" strokeDasharray="8 8" />
        <path d="M146 205L151 210L146 215M295 330L300 335L305 330M516 375L521 380L516 385M656 375L661 380L656 385" fill="none" stroke="#d99455" strokeWidth="2.2" />

        {/* ego trajectory (in its lane): through lane to the stop line, turn, collision, off-road drift, red light */}
        <path d="M40 217.5H276Q290 217.5 290 232V368Q290 390 312 390H540C556 390 562 404 580 404C598 404 604 390 620 390H852" fill="none" stroke="#f2c18f" strokeOpacity=".85" strokeWidth="2" />

        <circle cx="40" cy="210" r="6" fill="#76b98a" />
        <text x="40" y="258" textAnchor="middle" className="penalty-svg-note">START</text>
        <circle cx="930" cy="380" r="6" fill="#e9c47c" />
        <text x="944" y="352" textAnchor="end" className="penalty-svg-note">GOAL</text>

        {/* 1. P_PLC: stop line before the right turn; route-compatible (outer) lane's segment in amber (closes the 10 m zone), ego crosses in the through lane */}
        {/* last 10 m before the stop line on the compatible lane (lane width 15 = 3.5 m, so 10 m = 43), as in the PLCA/S diagram */}
        <rect x="235" y="225" width="43" height="15" fill="#e6a765" opacity=".34" />
        <path d="M235 225V240" stroke="#e6a765" strokeWidth="2.5" />
        <text x="256.5" y="254" textAnchor="middle" className="penalty-svg-note">10 m</text>
        <path d="M278 210V225" stroke="#e7d1ba" strokeWidth="2.5" />
        <path d="M278 225V240" stroke="#e6a765" strokeWidth="2.5" />
        <circle cx="278" cy="217.5" r="7" fill="none" stroke="#ef5147" strokeWidth="2.2" />
        <text x="278" y="160" textAnchor="middle" className="penalty-svg-alert">P<tspan dy="3" fontSize="8">PLC</tspan></text>
        <text x="278" y="173" textAnchor="middle" className="penalty-svg-note">INCOMPATIBLE LANE AT STOP LINE</text>

        {/* 2. P_SD: entering the off-route branch would give P_SD = 0 */}
        <text x="140" y="342" textAnchor="middle" className="penalty-svg-alert">P<tspan dy="3" fontSize="8">SD</tspan></text>
        <text x="140" y="355" textAnchor="middle" className="penalty-svg-note">IF THE EGO ENTERS AN OFF-ROUTE ROAD</text>

        {/* 3. P_col: at-fault contact with the vehicle ahead */}
        <rect x="432" y="383.5" width="30" height="13" fill="#c8b8a8" opacity=".48" />
        <circle cx="432" cy="390" r="7" fill="none" stroke="#ef5147" strokeWidth="2.2" />
        <text x="432" y="342" textAnchor="middle" className="penalty-svg-alert">P<tspan dy="3" fontSize="8">col</tspan></text>
        <text x="432" y="355" textAnchor="middle" className="penalty-svg-note">AT-FAULT COLLISION</text>

        {/* 4. P_off: trajectory drifts over the road edge */}
        <circle cx="580" cy="400" r="7" fill="none" stroke="#ef5147" strokeWidth="2.2" />
        <text x="560" y="428" textAnchor="middle" className="penalty-svg-alert">P<tspan dy="3" fontSize="8">off</tspan></text>
        <text x="560" y="441" textAnchor="middle" className="penalty-svg-note">OFF-ROAD DISTANCE</text>

        {/* 5. P_TL: red light at the last intersection */}
        <path d="M738 380V400" stroke="#e7d1ba" strokeWidth="2.5" />
        <rect x="722" y="406" width="12" height="26" rx="3" fill="#2a211b" stroke="#6a5747" />
        <circle cx="728" cy="412" r="3" fill="#ef5147" />
        <circle cx="728" cy="419" r="3" fill="#4a3d33" />
        <circle cx="728" cy="426" r="3" fill="#4a3d33" />
        <circle cx="738" cy="390" r="7" fill="none" stroke="#ef5147" strokeWidth="2.2" />
        <text x="714" y="420" textAnchor="end" className="penalty-svg-alert">P<tspan dy="3" fontSize="8">TL</tspan></text>
        <text x="714" y="433" textAnchor="end" className="penalty-svg-note">RED LIGHT</text>

        {/* ego at the end of the rollout; RC_SD = completed part of the route, measured on the SD route (progress tick) */}
        <path d="M867 367V386" stroke="#e6a765" strokeWidth="2.5" strokeLinecap="round" />
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
    <figcaption>{ko ? '모든 감점 계수를 하나의 rollout 위에 표시했습니다.' : 'All factors along one rollout.'}</figcaption>
  </figure>
);

// Ordered as the penalty factors in RouteDS: P_PLC, P_SD, P_col, P_off, P_TL
const penaltyCases = [
  {
    key: 'PLCA/S',
    koTitle: '사전 차로 변경 정확도 / 점수',
    enTitle: 'Pre-Lane Change Accuracy / Score',
    koBody: '정지선에서 자차가 경로에 맞는 차로(여기서는 우회전 차로)에 있는지 확인하고, 정지선 10 m 전에서 미리 그 차로로 옮겼는지 확인합니다. PLCA는 도달한 교차로만, PLCS는 도달하지 못한 교차로를 실패로 포함해 경로상의 모든 교차로를 평균합니다.',
    enBody: 'At the stop line, it checks that the ego is in a route-compatible lane (here, the right-turn lane). 10 m before the stop line, it checks that the ego already changed into it. PLCA averages over the intersections the ego reached; PLCS over all on the route, counting unreached ones as failed.',
    video: { src: 'metric-plca-bev.mp4', poster: 'metric-plca-poster.jpg', wide: true, koDetail: '경로에 맞지 않는 차로로 진입 · 늦은 진입 · 사전 차로 변경', enDetail: 'Incompatible lane at entry · Late entry · Pre-lane change' },
  },
  {
    key: 'SDC',
    koTitle: 'SD 경로 준수',
    enTitle: 'SD Route Compliance',
    koBody: '자차가 지정된 SD 경로를 따라가는지, 경로에 없는 분기로 빠지지 않는지 확인합니다.',
    enBody: 'Checks that the ego follows the designated SD route and does not take a branch off it.',
    video: { src: 'metric-sdc-bev.mp4', poster: 'metric-sdc-poster.jpg', koDetail: '분기로 우회전해야 하지만 직진 · sim step 120', enDetail: 'Should turn right into the branch, but goes straight · sim step 120' },
  },
  {
    key: 'NC',
    koTitle: '충돌 회피',
    enTitle: 'No Collision',
    koBody: '자차가 앞차를 뒤에서 추돌한 과실 충돌입니다.',
    enBody: 'The ego rear-ends the vehicle ahead, an at-fault collision.',
    video: { src: 'metric-nc-bev.mp4', poster: 'metric-nc-poster.jpg', koDetail: '접촉 · sim step 182', enDetail: 'Contact · sim step 182' },
  },
  {
    key: 'DAC',
    koTitle: '주행 가능 영역 준수',
    enTitle: 'Drivable Area Compliance',
    koBody: '자차가 도로 경계에 걸쳐 차체 일부가 주행 가능 영역 밖으로 나간 상황입니다. 역방향 주행 거리도 포함됩니다.',
    enBody: 'The ego straddles the road edge, with part of its footprint outside the drivable area. Distance driven against traffic also counts.',
    video: { src: 'metric-dac-bev.mp4', poster: 'metric-dac-poster.jpg', koDetail: '비주행 영역 진입 · sim step 360', enDetail: 'Non-drivable area · sim step 360' },
  },
  {
    key: 'TLC',
    koTitle: '교통신호 준수',
    enTitle: 'Traffic Light Compliance',
    koBody: '적색 신호가 적용되는 교차로의 lane connector에 진입하면 감점됩니다.',
    enBody: 'Entering an intersection via a lane connector governed by a red signal incurs a penalty.',
    video: {
      src: 'metric-tlc-bev.mp4',
      poster: 'metric-tlc-poster.jpg',
      koDetail: '적색 신호 위반 · sim step 786',
      enDetail: 'Red-light violation · sim step 786',
    },
  },
];

// One row per metric: concept diagram | BEV rollout example
const PenaltyCaseRows = ({ ko }) => (
  <>
    <div className="metric-diagram-intro">
      <h4>{ko ? '감점 상황' : 'Penalty cases'}</h4>
      <p>{ko ? '왼쪽은 개념도, 오른쪽은 rollout 예시입니다. 개념도에서 빨간 테두리 차량이 자차이고, 흐린 차량은 주변 차량 또는 자차의 이전 위치입니다. 노란색은 예정 경로, 빨간 원은 감점이 발생한 지점입니다.' : 'Left: concept diagram. Right: rollout example. In the diagrams, the red-outlined box is the ego; faded boxes are other traffic or earlier ego positions. Yellow shows the expected route, and the red circle marks where the penalty occurs.'}</p>
    </div>
    <div className="penalty-rows">
      {penaltyCases.map((item) => (
        <section className="penalty-row" key={item.key}>
          <div className="penalty-row-heading">
            <span>{item.key}</span>
            <h4>{ko ? item.koTitle : item.enTitle}</h4>
          </div>
          {/* column widths in proportion to the diagram and video aspect ratios, so both panels share one height */}
          <div className="penalty-row-panels" style={{ '--diagram-fr': `${DIAGRAM_ASPECT}fr`, '--video-fr': `${item.video.wide ? 8 / 3 : 16 / 9}fr` }}>
            <figure className="penalty-row-panel">
              <PenaltyDiagram kind={item.key} />
              <figcaption>{ko ? item.koBody : item.enBody}</figcaption>
            </figure>
            <figure className="penalty-row-panel">
              <video
                className={item.video.wide ? 'metric-video metric-video-wide' : 'metric-video'}
                poster={`${process.env.PUBLIC_URL}/videos/${item.video.poster}?v=20261003a`}
                controls
                playsInline
                loop
                muted
                preload="metadata"
                aria-label={`${item.key} ${ko ? '재생' : 'replay'}`}
              >
                <source src={`${process.env.PUBLIC_URL}/videos/${item.video.src}?v=20261003a`} type="video/mp4" />
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
          subtitle={ko
            ? <>RouteDS는 지정된 SD 경로를 따라간 진척도와 주행 품질을 함께 평가합니다. 경로 완료율(RC<sub>SD</sub>)은 완주한 비율을 나타내고, 0~1 범위의 감점 계수 다섯 개가 차로 선택 오류, 경로 이탈, 충돌, 도로 이탈, 신호 위반에 따라 점수를 낮춥니다.</>
            : <>RouteDS combines progress along the designated SD route with driving quality. Route completion (RC<sub>SD</sub>) measures the fraction completed, while five penalty factors between 0 and 1 reduce the score for lane choice errors, route departures, collisions, off-road driving, and red-light violations.</>}
        />
        <MetricFormula ko={ko} />
        <PenaltyCaseRows ko={ko} />
        {/* overview after the individual cases: all factors along one rollout */}
        <MetricFigure ko={ko} />
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
