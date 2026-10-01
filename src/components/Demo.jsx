import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SectionTitle from './common/SectionTitle';
import VideoComparison from './VideoComparison';
import PenaltyDiagram, { DIAGRAM_ASPECT } from './PenaltyDiagram';
import renderingComparisons from '../data/rendering-comparisons.json';
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
  { sym: 'RC', sub: 'SD', name: 'Route completion', route: true },
  { sym: 'P', sub: 'PLC', name: 'Pre-lane change' },
  { sym: 'P', sub: 'SD', name: 'SD route' },
  { sym: 'P', sub: 'col', name: 'At-fault collision' },
  { sym: 'P', sub: 'off', name: 'Off-road driving' },
  { sym: 'P', sub: 'TL', name: 'Red light' },
];

const RdsGrid = ({ id }) => (
  <pattern id={id} width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#8e6b50" strokeOpacity=".12" strokeWidth="1" /></pattern>
);

// Formula strip (top of the section): RouteDS = 100 x RC_SD x penalty factors
const MetricFormula = ({ ko }) => (
  <figure className="metric-figure">
    <svg viewBox="0 12 960 106" role="img" aria-labelledby="metric-formula-title">
      <title id="metric-formula-title">{ko ? 'RouteDS = 100 × SD 경로 완료율 × 감점 계수' : 'RouteDS = 100 × SD-route completion × penalty factors'}</title>
      <defs><RdsGrid id="rds-grid-formula" /></defs>
      <rect y="12" width="960" height="106" rx="16" fill="#17120f" />
      <rect y="12" width="960" height="106" rx="16" fill="url(#rds-grid-formula)" />
      <text x="24" y="60" className="rds-title">RouteDS</text>
      <text x="24" y="88" className="rds-eq">= 100 ×</text>
      {routeDsTerms.map((term, i) => {
        const x = 160 + i * 133;
        return (
          <g key={term.sym + term.sub}>
            <g transform={`translate(${x} 36)`}>
              <rect width="119" height="58" rx="8" fill="#221a15" stroke={term.route ? '#d99455' : '#ef5147'} strokeOpacity={term.route ? '.7' : '.45'} />
              <text x="12" y="26" className="rds-sym" fill={term.route ? '#e6a765' : '#ff8379'}>{term.sym}<tspan dy="4" fontSize="11">{term.sub}</tspan></text>
              <text x="12" y="46" className="rds-name">{term.name}</text>
            </g>
            {i < routeDsTerms.length - 1 && <text x={x + 126} y="70" textAnchor="middle" className="rds-times">×</text>}
          </g>
        );
      })}
    </svg>
  </figure>
);

// Ordered as the penalty factors in RouteDS: P_PLC, P_SD, P_col, P_off, P_TL
const penaltyCases = [
  {
    key: 'PLC',
    koTitle: '사전 차로 변경',
    enTitle: 'Pre-Lane Change',
    koBody: '정지선에서 자차가 경로에 맞는 차로(여기서는 우회전 차로)에 있는지 확인하고, 정지선 10 m 전에서 미리 그 차로로 옮겼는지 확인합니다.',
    enBody: 'At the stop line, it checks that the ego is in a route-compatible lane (here, the right-turn lane). 10 m before the stop line, it checks that the ego already changed into it.',
    video: { src: 'metric-plca-bev.mp4', poster: 'metric-plca-poster.jpg', wide: true },
  },
  {
    key: 'SDC',
    koTitle: 'SD 경로 준수',
    enTitle: 'SD Route Compliance',
    koBody: '자차가 지정된 SD 경로를 따라가는지, 경로에 없는 분기로 빠지지 않는지 확인합니다.',
    enBody: 'Checks that the ego follows the designated SD route and does not take a branch off it.',
    video: { src: 'metric-sdc-bev.mp4', poster: 'metric-sdc-poster.jpg' },
  },
  {
    key: 'NC',
    koTitle: '충돌 회피',
    enTitle: 'No Collision',
    koBody: '자차가 앞차를 뒤에서 추돌한 과실 충돌입니다.',
    enBody: 'The ego rear-ends the vehicle ahead, an at-fault collision.',
    video: { src: 'metric-nc-bev.mp4', poster: 'metric-nc-poster.jpg' },
  },
  {
    key: 'DAC',
    koTitle: '주행 가능 영역 준수',
    enTitle: 'Drivable Area Compliance',
    koBody: '자차가 도로 경계에 걸쳐 차체 일부가 주행 가능 영역 밖으로 나간 상황입니다. 역방향 주행 거리도 포함됩니다.',
    enBody: 'The ego straddles the road edge, with part of its footprint outside the drivable area. Distance driven against traffic also counts.',
    video: { src: 'metric-dac-bev.mp4', poster: 'metric-dac-poster.jpg' },
  },
  {
    key: 'TLC',
    koTitle: '교통신호 준수',
    enTitle: 'Traffic Light Compliance',
    koBody: '적색 신호에서 교차로에 진입하면 감점됩니다.',
    enBody: 'Entering an intersection under a red signal incurs a penalty.',
    video: { src: 'metric-tlc-bev.mp4', poster: 'metric-tlc-poster.jpg' },
  },
];

// One row per metric: concept diagram | BEV rollout example
const PenaltyCaseRows = ({ ko }) => (
  <>
    <div className="metric-diagram-intro">
      <h4>{ko ? '감점 상황' : 'Penalty cases'}</h4>
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
                poster={`${process.env.PUBLIC_URL}/videos/${item.video.poster}?v=20261004h`}
                controls
                playsInline
                loop
                muted
                preload="metadata"
                aria-label={`${item.key} ${ko ? '재생' : 'replay'}`}
              >
                <source src={`${process.env.PUBLIC_URL}/videos/${item.video.src}?v=20261004h`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
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
      </article>

      <article className="demo-chapter" id="rendering-comparison">
        <SectionTitle
          title="3DGS / Diffusion Refinement"
        />
        <div className="video-comparison-grid">
          {renderingComparisons.map((scene) => (
            <VideoComparison
              key={scene.id}
              label={`${ko ? '장면' : 'Scene'} ${scene.id}: 3DGS / Diffusion Refinement`}
              beforeSrc={`${process.env.PUBLIC_URL}/videos/rendering/${scene.before}`}
              afterSrc={`${process.env.PUBLIC_URL}/videos/rendering/${scene.after}`}
              beforePoster={`${process.env.PUBLIC_URL}/videos/rendering/${scene.beforePoster}`}
              afterPoster={`${process.env.PUBLIC_URL}/videos/rendering/${scene.afterPoster}`}
              ko={ko}
            />
          ))}
        </div>
      </article>
    </section>
  );
};

export default Demo;
