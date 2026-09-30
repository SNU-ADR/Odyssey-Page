import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SectionTitle from './common/SectionTitle';
import useScrollFadeIn from '../hooks/useScrollFadeIn';
import '../styles/components/Notice.css';

const Notice = () => {
  const { content } = useLanguage();
  const { sectionTitle, sectionTag, sectionSubtitle, items } = content.notice;
  const ref = useScrollFadeIn();

  return (
    <section id="notice" aria-label={sectionTitle}>
      <SectionTitle title={sectionTitle} subtitle={sectionSubtitle} tag={sectionTag} />
      <div className="notice-list fade-in" ref={ref}>
        {items.map((item) => (
          <article key={item.date} className={`notice-item${item.status === 'upcoming' ? ' notice-item--upcoming' : item.status === 'complete' ? ' notice-item--complete' : ''}`}>
            <div className="notice-item-meta">
              <time className="notice-date" dateTime={item.date}>{item.date}</time>
              {item.badge && <span className={`notice-badge${item.status === 'complete' ? ' notice-badge--complete' : ''}`}>{item.badge}</span>}
            </div>
            <h3>{item.title}</h3>
            <p>{item.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Notice;
