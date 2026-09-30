import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SectionTitle from './common/SectionTitle';
import '../styles/components/Model.css';

const Model = () => {
  const { content } = useLanguage();
  const { sectionTitle, sectionTag, sectionSubtitle, stages } = content.model;

  return (
    <section id="model" className="method-section" aria-label={sectionTitle}>
      <SectionTitle title={sectionTitle} subtitle={sectionSubtitle} tag={sectionTag} />
      <div className="method-grid">
        {stages.map((stage) => (
          <article key={stage.number} className="method-card">
            <span className="method-card-number">{stage.number}</span>
            <h3>{stage.title}</h3>
            <p>{stage.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Model;