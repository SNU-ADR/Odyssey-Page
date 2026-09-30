import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SectionTitle from './common/SectionTitle';
import '../styles/components/Results.css';

const guidanceRows = [
  { condition: 'Non-reactive', noRoute: '27.5', withRoute: '44.4', sdcNoRoute: '41', sdcWithRoute: '82' },
  { condition: 'Reactive', noRoute: '30.4', withRoute: '48.9', sdcNoRoute: '45', sdcWithRoute: '79' },
];

const reconstructionRows = [
  { metric: 'PSNR ↑', baseline: '24.34', odyssey: '25.34' },
  { metric: 'LPIPS ↓', baseline: '0.399', odyssey: '0.233' },
  { metric: 'KID (interpolated) ↓', baseline: '29.5', odyssey: '5.6' },
  { metric: 'KID (extrapolated) ↓', baseline: '52.2', odyssey: '8.9' },
  { metric: 'Latency (ms/image) ↓', baseline: '17.8', odyssey: '39.1' },
];

const Results = () => {
  const { content, lang } = useLanguage();
  const { sectionTitle, sectionTag, sectionSubtitle } = content.results;
  const ko = lang === 'ko';

  return (
    <section id="results" className="results-section" aria-label={sectionTitle}>
      <SectionTitle title={sectionTitle} subtitle={sectionSubtitle} tag={sectionTag} />
      <div className="results-layout">
        <article className="results-card results-card--lead">
          <span className="results-kicker">{ko ? '경로 안내 효과' : 'ROUTE GUIDANCE'}</span>
          <h3>{ko ? '5개 주행 모델 모두에서 RouteDS가 상승' : 'RouteDS improved for all five planners'}</h3>
          <p>{ko
            ? 'SD-map 경로 안내를 추가하면 반응형·비반응형 교통 조건 모두에서 다섯 모델의 경로 준수도와 RouteDS가 높아집니다.'
            : 'Adding explicit SD-map routes improves route compliance and RouteDS for all five planners under both reactive and non-reactive traffic.'}</p>
          <p className="results-caveat">{ko
            ? '경로 준수도 향상이 차로 사전 준비도나 충돌 점수의 일관된 개선으로 이어지지는 않습니다.'
            : 'Higher route compliance does not consistently improve pre-lane-change performance or collision scores.'}</p>
        </article>

        <article className="results-card">
          <h3>{ko ? 'SafeDrive: 경로 안내 전후' : 'SafeDrive with explicit route guidance'}</h3>
          <p className="results-card-note">{ko ? '논문 Table 4 · RouteDS와 SD Route Compliance (SDC)' : 'Paper Table 4 · RouteDS and SD Route Compliance (SDC)'}</p>
          <div className="results-table-wrap">
            <table className="results-table">
              <thead><tr>
                <th>{ko ? '교통 조건' : 'Traffic'}</th>
                <th>RouteDS<br/><small>{ko ? '경로 없음 → 경로 있음' : 'No route → SD route'}</small></th>
                <th>SDC<br/><small>{ko ? '경로 없음 → 경로 있음' : 'No route → SD route'}</small></th>
              </tr></thead>
              <tbody>{guidanceRows.map((row) => (
                <tr key={row.condition}>
                  <th>{ko ? (row.condition === 'Reactive' ? '반응형' : '비반응형') : row.condition}</th>
                  <td>{row.noRoute} <span>→</span> <strong>{row.withRoute}</strong></td>
                  <td>{row.sdcNoRoute} <span>→</span> <strong>{row.sdcWithRoute}</strong></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </article>

        <article className="results-card">
          <h3>{ko ? '장면 재구성 품질' : 'Scene reconstruction quality'}</h3>
          <p className="results-card-note">{ko ? 'OmniRe 기준선과 전체 보정 파이프라인 비교 · Table 2' : 'OmniRe baseline vs. full refinement pipeline · Table 2'}</p>
          <div className="results-table-wrap">
            <table className="results-table results-table--compact">
              <thead><tr><th>{ko ? '지표' : 'Metric'}</th><th>{ko ? '기준선' : 'Baseline'}</th><th>{ko ? '전체 파이프라인' : 'Full pipeline'}</th></tr></thead>
              <tbody>{reconstructionRows.map((row) => (
                <tr key={row.metric}><th>{row.metric}</th><td>{row.baseline}</td><td><strong>{row.odyssey}</strong></td></tr>
              ))}</tbody>
            </table>
          </div>
        </article>

        <article className="results-card results-card--insight">
          <span className="results-kicker">{ko ? '장기 평가에서 드러난 점' : 'LONG-HORIZON FINDING'}</span>
          <h3>{ko ? '평가 시간이 길어지면 모델 순위도 바뀝니다' : 'Planner rankings shift as evaluation gets longer'}</h3>
          <p>{ko
            ? 'RouteDS는 10초에서 100초로 평가 구간이 늘어날수록 전반적으로 낮아졌고, 짧은 구간에서 앞서던 DrivoR보다 SafeDrive가 긴 구간에서 앞서는 순위 변화가 관찰됐습니다.'
            : 'RouteDS generally falls as the horizon grows from 10 to 100 seconds. DrivoR leads at short horizons, while SafeDrive moves ahead over longer rollouts.'}</p>
          <div className="results-score-pair">
            <div><span>{ko ? 'SafeDrive + IL scoring + safety filtering' : 'SafeDrive + IL scoring + safety filtering'}</span><strong>54.4 <small>/</small> 56.1</strong><em>{ko ? '비반응형 / 반응형 RouteDS' : 'non-reactive / reactive RouteDS'}</em></div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default Results;