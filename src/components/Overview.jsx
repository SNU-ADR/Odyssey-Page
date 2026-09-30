import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SectionTitle from './common/SectionTitle';
import VideoEmbed from './common/VideoEmbed';
import useScrollFadeIn from '../hooks/useScrollFadeIn';
import demoB2dGif from '../assets/images/demo_b2d.webm';
import demoRealworldGif from '../assets/images/demo_realworld.webm';
import '../styles/components/Overview.css';

const Overview = () => {
  const { content } = useLanguage();
  const { sectionTitle, sectionTag, sectionSubtitle, demos, performance } = content.overview;
  const videoPlaceholder = content.model.videoPlaceholder;

  const refDemos = useScrollFadeIn();
  const refPerf = useScrollFadeIn();

  const gifAssets = {
    'Real-world Demo': demoRealworldGif,
    'Simulation Closed-loop Demo': demoB2dGif,
  };

  return (
    <section id="overview" aria-label={sectionTitle}>
      <div className="overview-glow" aria-hidden="true" />
      <SectionTitle title={sectionTitle} subtitle={sectionSubtitle} tag={sectionTag} />

      <div className="overview-demos fade-in" ref={refDemos}>
        {demos.map((demo) => {
          const url = demo.videoUrl || gifAssets[demo.title] || null;
          return (
            <article key={demo.title} className={`overview-demo overview-demo--${demo.accent}`}>
              <div className="overview-demo-header">
                <h3>{demo.title}</h3>
              </div>
              <VideoEmbed url={url} title={demo.title} placeholder={videoPlaceholder} />
            </article>
          );
        })}
      </div>

      {performance && (
        <div className="overview-performance fade-in" ref={refPerf}>
          <div className="overview-performance-head">
            <h3>{performance.heading}</h3>
          </div>
          <div className="overview-performance-grid">
            {performance.tables.map((tbl) => (
              <article
                key={tbl.label}
                className={`perf-table perf-table--${tbl.accent}`}
                aria-label={tbl.label}
              >
                <header className="perf-table-head">
                  <h4>{tbl.label}</h4>
                </header>
                <div className="perf-table-scroll">
                  <table>
                    <thead>
                      <tr>
                        {tbl.columns.map((col) => (
                          <th key={col} scope="col">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tbl.rows.map((row) => (
                        <tr key={row.config}>
                          <th scope="row">{row.config}</th>
                          {row.values.map((v, i) => (
                            <td key={i}>{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {tbl.footnote && <p className="perf-footnote">{tbl.footnote}</p>}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Overview;
