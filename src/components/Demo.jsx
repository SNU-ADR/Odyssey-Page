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

const MetricFigure = ({ ko }) => (
  <figure className="metric-figure">
    <svg viewBox="0 0 960 280" role="img" aria-labelledby="metric-figure-title metric-figure-desc">
      <title id="metric-figure-title">{ko ? 'BEV 경로 평가 개요' : 'BEV route evaluation overview'}</title>
      <desc id="metric-figure-desc">{ko ? '자차 궤적, 주행 가능 영역, SD 경로와 교차로 차로 준비를 위에서 본 예시입니다.' : 'Top-down schematic of the ego trajectory, drivable area, SD route, and lane preparation at an intersection.'}</desc>
      <defs>
        <marker id="metric-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#e69351" /></marker>
        <pattern id="metric-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#8e6b50" strokeOpacity=".12" strokeWidth="1" /></pattern>
      </defs>
      <rect width="960" height="280" rx="16" fill="#17120f" />
      <rect width="960" height="280" rx="16" fill="url(#metric-grid)" />
      <path d="M0 160H960M596 0V280" stroke="#55463b" strokeWidth="94" />
      <path d="M0 160H960M596 0V280" stroke="#a9907b" strokeOpacity=".42" strokeWidth="2" strokeDasharray="15 13" />
      <path d="M52 160H562Q615 160 615 105V47" fill="none" stroke="#d29354" strokeOpacity=".24" strokeWidth="36" />
      <path d="M52 160H562Q615 160 615 105V47" fill="none" stroke="#e69351" strokeWidth="5" strokeDasharray="12 9" markerEnd="url(#metric-arrow)" />
      <circle cx="52" cy="160" r="9" fill="#76b98a" /><text x="35" y="205" className="metric-svg-label">START</text>
      <circle cx="615" cy="47" r="9" fill="#e9c47c" /><text x="634" y="43" className="metric-svg-label">ROUTE GOAL</text>
      <rect x="328" y="145" width="38" height="25" rx="7" fill="#efad73" stroke="#ffe0bd" strokeWidth="2" />
      <path d="M495 117V203" stroke="#d6b58f" strokeWidth="3" />
      <text x="405" y="220" className="metric-svg-label">STOP LINE</text>
      <path d="M426 123L481 123M426 197L481 197" stroke="#a5cb9d" strokeWidth="5" strokeLinecap="round" />
      <text x="654" y="88" className="metric-svg-label">DRIVABLE AREA</text>
      <text x="654" y="115" className="metric-svg-sub">NC · DAC · SDC · PLCA/S</text>
      <text x="654" y="180" className="metric-svg-label">BEV EVALUATION</text>
      <text x="654" y="207" className="metric-svg-sub">Trajectory + route + lane context</text>
    </svg>
    <figcaption>{ko ? '개념 설명용 도식. 아래 영상은 실제 rollout 기록을 재생합니다.' : 'Concept schematic. The clips below replay real rollout records.'}</figcaption>
  </figure>
);

const penaltyCases = [
  {
    key: 'NC',
    koTitle: '과실 충돌',
    enTitle: 'At-fault collision',
    koBody: '다른 차량과 자차 궤적이 겹치는 접촉 지점을 표시합니다.',
    enBody: 'Marks where the ego trajectory makes at-fault contact with another road user.',
  },
  {
    key: 'DAC',
    koTitle: '비주행 영역 진입',
    enTitle: 'Leaves the drivable area',
    koBody: '도로 경계 밖으로 나간 궤적 구간을 빨간색으로 표시합니다.',
    enBody: 'Highlights the trajectory segment that leaves the drivable surface.',
  },
  {
    key: 'SDC',
    koTitle: '지정 경로 이탈',
    enTitle: 'Departs from the SD route',
    koBody: '지정된 경로와 다른 분기로 향한 이동을 보여줍니다.',
    enBody: 'Shows a rollout taking a branch outside the designated route.',
  },
  {
    key: 'PLCA/S',
    koTitle: '우회전 전 차로 변경 지연',
    enTitle: 'Missed pre-turn lane change',
    koBody: '예정 경로는 우회전 전에 2차로에서 3차로로 변경합니다. 실제 궤적은 2차로를 유지하다 교차로에서 늦게 꺾어 감점됩니다.',
    enBody: 'The expected path changes from lane 2 to lane 3 before turning right. The rollout stays in lane 2 and turns late, incurring a penalty.',
  },
];

const PenaltyDiagram = ({ kind }) => (
  <svg viewBox="0 0 480 230" role="img" aria-label={`${kind} penalty example`}>
    <rect width="480" height="230" rx="12" fill="#17120f" />
    {kind === 'NC' && (
      <>
        <path d="M0 118H480M245 0V230" stroke="#40362e" strokeWidth="76" />
        <path d="M0 118H480M245 0V230" stroke="#8d7865" strokeOpacity=".5" strokeWidth="2" strokeDasharray="12 10" />
        <path d="M34 118H446" fill="none" stroke="#d99455" strokeWidth="4" strokeDasharray="10 8" />
        <path d="M245 18V210" fill="none" stroke="#b9a99a" strokeOpacity=".24" strokeWidth="4" strokeDasharray="8 10" />
        <g fill="#c8b8a8" opacity=".22">
          <rect x="78" y="107" width="36" height="20" rx="6" />
          <rect x="337" y="107" width="36" height="20" rx="6" />
          <rect x="235" y="38" width="20" height="36" rx="6" />
          <rect x="235" y="173" width="20" height="36" rx="6" />
        </g>
        <rect x="193" y="108" width="38" height="20" rx="6" fill="#e8bd91" />
        <rect x="246" y="89" width="20" height="38" rx="6" transform="rotate(90 256 108)" fill="#c8b8a8" opacity=".48" />
        <path d="M210 118H246" stroke="#ef5147" strokeWidth="8" strokeLinecap="round" />
        <circle cx="246" cy="118" r="19" fill="none" stroke="#ef5147" strokeWidth="3" />
        <path d="M237 109L255 127M255 109L237 127" stroke="#ef5147" strokeWidth="3" />
        <text x="270" y="89" className="penalty-svg-alert">CONTACT</text>
      </>
    )}
    {kind === 'DAC' && (
      <>
        <rect x="0" y="62" width="480" height="112" fill="#29231e" />
        <path d="M0 62H480M0 174H480" stroke="#756454" strokeWidth="2" />
        <path d="M0 118H480" stroke="#8d7865" strokeOpacity=".45" strokeWidth="2" strokeDasharray="12 10" />
        <path d="M24 118H300" fill="none" stroke="#d99455" strokeWidth="4" strokeDasharray="10 8" />
        <path d="M300 118C344 118 352 132 374 157S418 181 462 186" fill="none" stroke="#ef5147" strokeWidth="5" />
        <path d="M315 118C360 122 372 163 409 176" fill="none" stroke="#b9a99a" strokeOpacity=".18" strokeWidth="4" strokeDasharray="8 9" />
        <g fill="#d0c0b0" opacity=".22">
          <rect x="92" y="108" width="36" height="20" rx="6" />
          <rect x="188" y="108" width="36" height="20" rx="6" />
          <rect x="359" y="182" width="36" height="20" rx="6" transform="rotate(16 377 192)" />
        </g>
        <rect x="353" y="143" width="38" height="20" rx="6" transform="rotate(42 372 153)" fill="#f2c18f" stroke="#ef5147" strokeWidth="2" />
        <path d="M323 132L340 148" stroke="#ef5147" strokeWidth="3" />
        <text x="337" y="208" className="penalty-svg-alert">OFF-ROAD</text>
      </>
    )}
    {kind === 'SDC' && (
      <>
        <path d="M0 142H242V0M242 142C301 142 314 84 365 78S427 78 480 78" fill="none" stroke="#40362e" strokeWidth="76" />
        <path d="M0 142H242V0" fill="none" stroke="#d99455" strokeWidth="4" strokeDasharray="10 8" />
        <path d="M0 142H242C301 142 314 84 365 78S427 78 480 78" fill="none" stroke="#ef5147" strokeWidth="5" />
        <path d="M0 142H242V0M242 142C301 142 314 84 365 78S427 78 480 78" fill="none" stroke="#8d7865" strokeOpacity=".45" strokeWidth="2" strokeDasharray="12 10" />
        <g fill="#d0c0b0" opacity=".22">
          <rect x="63" y="132" width="36" height="20" rx="6" />
          <rect x="172" y="132" width="36" height="20" rx="6" />
          <rect x="302" y="108" width="36" height="20" rx="6" transform="rotate(-30 320 118)" />
          <rect x="230" y="43" width="20" height="36" rx="6" />
        </g>
        <rect x="283" y="119" width="38" height="20" rx="6" transform="rotate(-25 302 129)" fill="#f2c18f" stroke="#ef5147" strokeWidth="2" />
        <circle cx="242" cy="142" r="18" fill="none" stroke="#ef5147" strokeWidth="3" />
        <text x="315" y="174" className="penalty-svg-alert">WRONG BRANCH</text>
      </>
    )}
    {kind === 'PLCA/S' && (
      <>
        <rect x="0" y="46" width="480" height="132" fill="#40362e" />
        <rect x="296" y="0" width="96" height="230" fill="#40362e" />
        <path d="M0 46H480M0 178H296M392 178H480M296 0V46M392 0V46M296 178V230M392 178V230" fill="none" stroke="#8d7865" strokeOpacity=".48" strokeWidth="2" />
        <path d="M0 90H296M0 134H296M392 112H480M344 0V46M344 178V230" fill="none" stroke="#a18e7d" strokeOpacity=".48" strokeWidth="1.5" strokeDasharray="8 8" />
        <path d="M296 46V178" stroke="#e7d1ba" strokeWidth="3" />
        <text x="245" y="34" className="penalty-svg-note">ENTRY CHECK</text>
        <text x="18" y="71" className="penalty-svg-note">LANE 1</text>
        <text x="18" y="115" className="penalty-svg-note">LANE 2</text>
        <text x="18" y="159" className="penalty-svg-note">LANE 3</text>
        <text x="344" y="32" className="penalty-svg-alert">RIGHT TURN AHEAD</text>
        <path d="M72 112C115 112 118 156 166 156H296C338 156 328 196 328 228" fill="none" stroke="#d99455" strokeWidth="4" strokeDasharray="10 8" />
        <text x="78" y="186" className="penalty-svg-note" fill="#d99455">PRE-LANE CHANGE</text>
        <path d="M72 112H296C319 112 319 137 326 156S328 192 328 228" fill="none" stroke="#ef5147" strokeWidth="5" />
        <g fill="#d0c0b0" opacity=".24">
          <rect x="63" y="104" width="34" height="20" rx="6" />
          <rect x="201" y="146" width="34" height="20" rx="6" />
        </g>
        <rect x="276" y="102" width="38" height="20" rx="6" fill="#f2c18f" stroke="#ef5147" strokeWidth="2" />
        <circle cx="296" cy="112" r="17" fill="none" stroke="#ef5147" strokeWidth="3" />
        <rect x="108" y="70" width="122" height="28" rx="4" fill="#401411" stroke="#ef5147" strokeWidth="1.5" />
        <text x="116" y="82" className="penalty-svg-alert">LANE 2 AT ENTRY</text>
        <text x="20" y="211" className="penalty-svg-note">LANE 3 · RIGHT-TURN LANE</text>
        <text x="347" y="121" className="penalty-svg-alert">LATE LANE CHANGE</text>
      </>
    )}
    <text x="20" y="24" className="penalty-svg-note">PENALTY CASE</text>
  </svg>
);

const PenaltyCaseGrid = ({ ko }) => (
  <>
    <div className="metric-diagram-intro">
      <h4>{ko ? '감점 상황 개념도' : 'Penalty cases'}</h4>
      <p>{ko ? '흐린 차량과 궤적은 가능한 주행 예시이고, 빨간색은 감점이 발생하는 상황입니다.' : 'Faded vehicles and paths show possible motion; red marks a penalty event.'}</p>
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
              src: 'metric-plca-bev.webm', poster: 'metric-plca-poster.jpg',
            },
          ].map((item) => (
            <article className="metric-video-card" key={item.key}>
              <div className="metric-video-heading">
                <span>{item.key}</span>
                <div><h4>{item.title}</h4><p>{item.detail}</p></div>
              </div>
              <video className="metric-video" poster={`${process.env.PUBLIC_URL}/videos/${item.poster}?v=20261001`} controls playsInline loop muted preload="metadata" aria-label={item.title}>
                <source src={`${process.env.PUBLIC_URL}/videos/${item.src}?v=20261001`} type={item.src.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
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
