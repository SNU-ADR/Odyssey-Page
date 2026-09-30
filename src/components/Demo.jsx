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
      <path d="M52 160H504Q557 160 557 105V47" fill="none" stroke="#d29354" strokeOpacity=".24" strokeWidth="36" />
      <path d="M52 160H504Q557 160 557 105V47" fill="none" stroke="#e69351" strokeWidth="5" strokeDasharray="12 9" markerEnd="url(#metric-arrow)" />
      <circle cx="52" cy="160" r="9" fill="#76b98a" /><text x="35" y="205" className="metric-svg-label">START</text>
      <circle cx="557" cy="47" r="9" fill="#e9c47c" /><text x="576" y="43" className="metric-svg-label">ROUTE GOAL</text>
      <rect x="328" y="145" width="38" height="25" rx="7" fill="#efad73" stroke="#ffe0bd" strokeWidth="2" />
      <path d="M495 117V203" stroke="#d6b58f" strokeWidth="3" />
      <text x="405" y="220" className="metric-svg-label">STOP LINE</text>
      <path d="M426 123L481 123M426 197L481 197" stroke="#a5cb9d" strokeWidth="5" strokeLinecap="round" />
      <text x="654" y="88" className="metric-svg-label">DRIVABLE AREA</text>
      <text x="654" y="115" className="metric-svg-sub">NC · DAC · SDC · PLCA/S</text>
      <path d="M640 143H845" stroke="#e69351" strokeWidth="2" markerEnd="url(#metric-arrow)" />
      <text x="654" y="180" className="metric-svg-label">BEV EVALUATION</text>
      <text x="654" y="207" className="metric-svg-sub">Trajectory + route + lane context</text>
    </svg>
    <figcaption>{ko ? 'BEV 예시 도식 — 실제 시나리오 이미지와 재생 데모는 아래 영역에 추가할 예정입니다.' : 'BEV schematic — scenario images and a playable demo will be added below.'}</figcaption>
  </figure>
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
        <div className="metric-media-grid">
          {placeholder(
            ko ? '장면 이미지 예시' : 'Scenario image examples',
            ko ? 'NC · DAC · SDC · PLCA/S에 대응하는 이미지 예시를 추가합니다.' : 'Still examples for NC, DAC, SDC, and PLCA/S will go here.',
          )}
          {placeholder(
            ko ? 'BEV 평가 데모' : 'BEV evaluation demo',
            ko ? '궤적·경로·평가 결과를 함께 보여주는 재생 데모를 추가합니다.' : 'Playback showing trajectories, routes, and metric outcomes will go here.',
          )}
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
