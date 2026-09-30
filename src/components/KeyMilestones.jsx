import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SectionTitle from './common/SectionTitle';
import useScrollFadeIn from '../hooks/useScrollFadeIn';
import '../styles/components/KeyMilestones.css';

const KeyMilestones = () => {
  const { content } = useLanguage();
  const { sectionTitle, sectionTag, sectionSubtitle, items } = content.keyMilestones;
  const ref = useScrollFadeIn();

  return (
    <section id="milestones" aria-label={sectionTitle}>
      <SectionTitle title={sectionTitle} subtitle={sectionSubtitle} tag={sectionTag} />
      <ol className="milestones-stepper fade-in" ref={ref} aria-label={sectionTitle}>
        {items.map((item) => (
          <li
            key={item.version}
            className={`milestone-step milestone-step--${item.tone}`}
            aria-label={`${item.version} ${item.status}`}
          >
            <span className="milestone-node" aria-hidden="true" />
            <span className="milestone-version">{item.version}</span>
            <span className="milestone-status">{item.status}</span>
            <p className="milestone-note">{item.note}</p>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default KeyMilestones;
