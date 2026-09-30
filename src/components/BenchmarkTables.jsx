import React from 'react';
import { baselineGroups, scoringGroups } from '../data/benchmark-results';

const metrics = ['RouteDS', 'SDC', 'PLCA', 'PLCS', 'Eff.', 'Comf.'];
const columnRanks = rows => Array.from({ length: 13 }, (_, column) =>
  [...new Set(rows.map(row => Number(row.split(' ')[column])))].sort((a, b) => b - a)
);
const baselineRanks = columnRanks(baselineGroups.flatMap(group =>
  group.planners.flatMap(planner => [planner.without, planner.with])
));

const MetricCells = ({ values, ranks, showSecond = false }) => values.split(' ').map((value, index) => {
  const best = Number(value) === ranks[index][0];
  const second = showSecond && Number(value) === ranks[index][1];
  return (
    <td key={index} className={index % 6 === 0 ? 'benchmark-group-start' : undefined}>
      {best ? <strong>{value}</strong> : second ? <span className="benchmark-second">{value}</span> : value}
    </td>
  );
});

const TableHead = ({ baseline, ko }) => (
  <thead>
    <tr>
      <th rowSpan={2} scope="col" className="benchmark-name">{baseline ? (ko ? '모델' : 'Method') : (ko ? '설정' : 'Configuration')}</th>
      {baseline && <th rowSpan={2} scope="col">SD-Route<br />Guidance</th>}
      <th colSpan={6} scope="colgroup" className="benchmark-group-start">Odyssey Non-reactive</th>
      <th colSpan={6} scope="colgroup" className="benchmark-group-start">Odyssey Reactive</th>
      <th scope="col" className="benchmark-group-start">NAVSIM{baseline && <><br /><small>Open Loop</small></>}</th>
    </tr>
    <tr>
      {[0, 1].flatMap(group => metrics.map((metric, index) => (
        <th key={`${group}-${metric}`} scope="col" className={index === 0 ? 'benchmark-group-start' : undefined}>{metric}</th>
      )))}
      <th scope="col" className="benchmark-group-start">PDMS</th>
    </tr>
  </thead>
);

const BenchmarkTables = ({ ko }) => (
  <div className="benchmark-tables">
    <article className="benchmark-block">
      <div className="benchmark-heading">
        <h3 id="baseline-table-title" className="benchmark-title--baseline">{ko ? 'SD 경로 안내에 따른 모델 성능 비교' : 'BASELINE PLANNER COMPARISON'}</h3>
        <p>{ko
          ? 'SD 경로는 경로 준수도를 높이지만, 높은 open-loop 점수가 더 나은 closed-loop 성능을 보장하지는 않습니다.'
          : 'SD routes improve route following, while higher open-loop scores do not consistently predict better closed-loop performance.'}</p>
      </div>
      <div className="benchmark-scroll" tabIndex={0} role="region" aria-labelledby="baseline-table-title">
        <table className="benchmark-table" aria-labelledby="baseline-table-title" aria-describedby="baseline-table-note">
          <TableHead baseline ko={ko} />
          {baselineGroups.map(group => (
            <tbody key={group.label}>
              <tr className="benchmark-family"><th colSpan={15} scope="rowgroup">{group.label}</th></tr>
              {group.planners.map(planner => (
                <React.Fragment key={planner.name}>
                  <tr className="benchmark-pair-start">
                    <th rowSpan={2} scope="row" className="benchmark-name">{planner.name}</th>
                    <td className="benchmark-route"><span aria-label={ko ? '경로 안내 없음' : 'Without SD-route guidance'}>×</span></td>
                    <MetricCells values={planner.without} ranks={baselineRanks} showSecond />
                  </tr>
                  <tr className="benchmark-with-route">
                    <td className="benchmark-route"><span aria-label={ko ? '경로 안내 있음' : 'With SD-route guidance'}>✓</span></td>
                    <MetricCells values={planner.with} ranks={baselineRanks} showSecond />
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      <p className="benchmark-note benchmark-note--compact" id="baseline-table-note">{ko
        ? <><em>Eff.</em>: 효율성 · <em>Comf.</em>: 승차감.</>
        : <><em>Eff.</em>: Efficiency · <em>Comf.</em>: Comfort.</>}</p>
    </article>

    <article className="benchmark-block">
      <div className="benchmark-heading">
        <h3 id="scoring-table-title" className="benchmark-title--baseline">{ko ? 'Open-loop 성능 향상이 Closed-loop 주행에서도 이어질까요?' : 'DO OPEN-LOOP GAINS TRANSFER TO CLOSED-LOOP DRIVING?'}</h3>
        <p>{ko
          ? '개별 궤적의 최적화가 더 나은 연속 주행을 보장하지는 않으며, Odyssey는 장기 closed-loop 평가로 이러한 성능 향상이 실제로 이어지는지 검증합니다.'
          : 'Optimizing individual trajectories does not guarantee better continuous driving. Odyssey tests whether these gains hold over long-horizon closed-loop rollouts.'}</p>
      </div>
      <div className="benchmark-scroll" tabIndex={0} role="region" aria-labelledby="scoring-table-title">
        <table className="benchmark-table benchmark-table--scoring" aria-labelledby="scoring-table-title">
          <TableHead ko={ko} />
          {scoringGroups.map(group => (
            <tbody key={group.label}>
              <tr className="benchmark-family"><th colSpan={14} scope="rowgroup">{group.label}</th></tr>
              {group.rows.map(row => (
                <tr key={row.name}>
                  <th scope="row" className="benchmark-name">{row.name}</th>
                  <MetricCells values={row.values} ranks={columnRanks(group.rows.map(item => item.values))} />
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </article>
  </div>
);

export default BenchmarkTables;
