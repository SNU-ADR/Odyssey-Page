import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SectionTitle from './common/SectionTitle';
import useScrollFadeIn from '../hooks/useScrollFadeIn';
import '../styles/components/RoadMap.css';

const RoadMapEntry = ({ v, index }) => {
  const ref = useScrollFadeIn();
  const isLeft = index % 2 === 0;

  return (
    <article
      className={`roadmap-entry ${isLeft ? 'left' : 'right'} fade-in`}
      ref={ref}
    >
      <div className={`timeline-node ${v.status}`} aria-hidden="true">
        <div className="timeline-node-inner" />
      </div>
      <div className={`roadmap-card ${v.status}`}>
        <h3 className="roadmap-card-title">
          <span className="roadmap-version-row">
            <span className="roadmap-version">{v.version}</span>
            {v.badge && <span className="roadmap-badge">{v.badge}</span>}
          </span>
        </h3>
        {/^\d{4}$/.test(v.period)
          ? <time className="roadmap-period" dateTime={v.period}>{v.period}</time>
          : <span className="roadmap-period">{v.period}</span>
        }
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ul className="roadmap-items" role="list" aria-label={`${v.version}${v.badge ? ' ' + v.badge : ''}`}>
          {v.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {v.statusLabel && (
          <p className="roadmap-status-tag completed-tag">{v.statusLabel}</p>
        )}
      </div>
    </article>
  );
};

const RoadMap = () => {
  const { content } = useLanguage();
  const { sectionTitle, sectionTag, sectionSubtitle, versions } = content.roadmap;

  return (
    <div className="roadmap-wrapper">
      <section id="roadmap" aria-label={sectionTitle}>
        <SectionTitle title={sectionTitle} subtitle={sectionSubtitle} tag={sectionTag} />
        <div className="roadmap-timeline">
          <div className="timeline-line" aria-hidden="true" />
          {versions.map((v, index) => (
            <RoadMapEntry key={v.version} v={v} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default RoadMap;
