import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SectionTitle from './common/SectionTitle';
import useStaggeredFadeIn from '../hooks/useStaggeredFadeIn';
import '../styles/components/Dataset.css';

const Dataset = () => {
  const { content } = useLanguage();
  const { sectionTitle, sectionTag, sectionSubtitle, items } = content.dataset;
  const ref = useStaggeredFadeIn();

  return (
    <section id="dataset" aria-label={sectionTitle}>
      <SectionTitle title={sectionTitle} subtitle={sectionSubtitle} tag={sectionTag} />
      <div className="dataset-grid stagger-fade-in" ref={ref}>
        {items.map((item, i) => (
          <article
            key={item.name}
            data-index={String(i + 1).padStart(2, '0')}
            className={`dataset-card${item.tone ? ` dataset-card--${item.tone}` : ''}`}
          >
            <h3 className="dataset-card-name">{item.name}</h3>
            <ul className="dataset-card-tags" role="list">
              {item.tags.map((tag) => (
                <li
                  key={tag}
                  className={`dataset-card-tag${/^v\d/i.test(tag) ? ' dataset-card-tag--version' : ''}`}
                >
                  {tag}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Dataset;
