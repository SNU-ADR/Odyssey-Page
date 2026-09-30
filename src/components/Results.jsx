import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SectionTitle from './common/SectionTitle';
import BenchmarkTables from './BenchmarkTables';
import horizonFigure from '../assets/images/results-horizon.svg';
import laneFigure from '../assets/images/results-lane.svg';
import collisionFigure from '../assets/images/results-collision.svg';
import '../styles/components/Results.css';

const Results = () => {
  const { content, lang } = useLanguage();
  const { sectionTitle, sectionTag, sectionSubtitle } = content.results;
  const ko = lang === 'ko';

  return (
    <section id="results" className="results-section" aria-label={sectionTitle}>
      <SectionTitle title={sectionTitle} subtitle={sectionSubtitle} tag={sectionTag} />
      <BenchmarkTables ko={ko} />
      <div className="results-figure-section">
        <div className="benchmark-heading">
          <h3 className="benchmark-title--baseline">{ko ? 'Closed-loop 주행에는 어떤 과제가 남아 있을까요?' : 'WHAT CHALLENGES REMAIN FOR CLOSED-LOOP DRIVING?'}</h3>
        </div>
        <div className="results-figure-grid">
          <figure className="results-plot">
            <img src={horizonFigure} width="477" height="452" loading="lazy"
              alt={ko ? '10초부터 100초까지의 평가 시간에 따른 다섯 모델의 RouteDS 변화. 실선은 기본 설정, 점선은 IL 적용 설정이며 원은 순위가 바뀌는 지점을 표시합니다.' : 'RouteDS across 10–100-second horizons for five planners. Solid lines show original settings, dashed lines show IL-applied settings, and circles mark rank switches.'} />
            <figcaption><h4>Horizon Effect</h4><p>{ko
              ? '짧은 구간에서는 DrivoR가 앞서지만, 긴 구간에서는 SafeDrive가 앞섭니다. 짧은 평가만으로는 지속적인 주행에 더 강한 모델을 잘못 판단할 수 있습니다.'
              : 'DrivoR leads at short horizons, but SafeDrive leads over longer drives. Short evaluations can therefore misidentify the stronger planner for sustained driving.'}</p></figcaption>
          </figure>
          <figure className="results-plot">
            <img src={laneFigure} width="482" height="452" loading="lazy"
              alt={ko ? 'SD 경로 적용 전후의 SDC와 PLCA 비교. 빈 원은 경로 없음, 채운 원은 경로 있음, 별은 인간 운전자입니다.' : 'SDC versus PLCA before and after SD-route guidance. Open circles show no SD route, filled circles show SD routes, and the star marks human performance.'} />
            <figcaption><h4>SDC vs. PLCA</h4><p>{ko
              ? '경로 준수를 넘어, 다가오는 회전에 맞춰 제때 차선을 준비하는 능력이 필요합니다.'
              : 'Beyond route compliance, planners need timely lane preparation for upcoming turns.'}</p></figcaption>
          </figure>
          <figure className="results-plot">
            <img src={collisionFigure} width="478" height="452" loading="lazy"
              alt={ko ? 'SD 경로 적용 전후의 RouteDS와 충돌 점수 비교. 충돌 점수는 높을수록 충돌 페널티가 적으며, 다섯 모델 중 네 모델의 점수가 낮아집니다.' : 'RouteDS versus collision score with and without SD routes. Higher collision scores mean fewer collision penalties; scores decrease for four of five planners.'} />
            <figcaption><h4>RouteDS vs. Collision</h4><p>{ko
              ? '경로 진행 능력과 충돌 회피를 함께 개선하는 것이 남은 과제입니다.'
              : 'Improving route progress while reducing collisions remains an open challenge.'}</p></figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};

export default Results;
