import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import odysseyHead from '../assets/images/odyssey_head.png';
import '../styles/components/Hero.css';

const equalAuthors = ['Jungho Kim', 'Hongjae Shin', 'Seunghoon Yu', 'Heecheol Yoo', 'Myeongjun Kim', 'Jiyong Oh'];
const otherAuthors = ['Donghyuk Kwak', 'Seunghyeop Nam', 'Haesung Oh', 'Hyunju Kim', 'Hyungchan Cho', 'Jaehyun Park', 'Soo Won Seo', 'Jun Won Choi'];
const authorLinks = {
  'Jungho Kim': 'https://kimjh7669.github.io/',
  'Hongjae Shin': 'https://scholar.google.com/citations?user=4zQMBBAAAAAJ&hl=ko&oi=ao',
  'Seunghoon Yu': 'https://scholar.google.com/citations?user=RJnWLIUAAAAJ&hl=en',
  'Heecheol Yoo': 'https://scholar.google.com/citations?user=bwJ1KkcAAAAJ&hl=ko&oi=ao',
  'Myeongjun Kim': 'https://scholar.google.com/citations?hl=ko&user=-AT4lfIAAAAJ',
  'Jiyong Oh': 'https://scholar.google.com/citations?hl=ko&user=C10ysNMAAAAJ',
  'Soo Won Seo': 'https://scholar.google.com/citations?user=1J-usWkAAAAJ&hl=en',
  'Jun Won Choi': 'https://scholar.google.com/citations?user=IHH2PyYAAAAJ&hl=en',
};

const AuthorName = ({ name }) => authorLinks[name]
  ? <a href={authorLinks[name]} target="_blank" rel="noopener noreferrer">{name}</a>
  : name;

const Hero = () => {
  const { lang, content } = useLanguage();
  const { title, sectionLabel, subtitle, affiliation, stats } = content.hero;

  return (
    <section id="hero" className="hero" aria-label={sectionLabel}>
      <div className="hero-content">
        <h1 className="hero-title">
          <img src={odysseyHead} alt="" className="hero-emblem" />
          <span className="hero-wordmark">{title}</span>
        </h1>
        <p className="hero-subtitle">{subtitle}</p>
        <div className="hero-authors" aria-label="Authors">
          <div className="hero-author-row hero-author-row--equal">
            {equalAuthors.map(name => (
              <span className="hero-author" key={name}>
                <AuthorName name={name} />
                <sup className="hero-equal-mark" aria-label="Equal contribution">*</sup>
              </span>
            ))}
          </div>
          <div className="hero-author-row hero-author-row--other">
            {otherAuthors.map(name => (
              <span className="hero-author" key={name}>
                <AuthorName name={name} />{name === 'Jun Won Choi' && <sup aria-label="Corresponding author">†</sup>}
              </span>
            ))}
          </div>
          <p className="hero-author-affiliation">Seoul National University, South Korea</p>
          <p className="hero-author-notes"><span>* Equal contribution</span><span>† Corresponding author</span></p>
        </div>
        <div className="hero-actions">
          {affiliation && <a className="hero-action" href="https://arxiv.org/abs/2610.06469" target="_blank" rel="noopener noreferrer">{affiliation}</a>}
          <a className="hero-action" href="https://github.com/SNU-ADR/Odyssey" target="_blank" rel="noopener noreferrer">Code</a>
        </div>
        <div className="hero-divider" aria-hidden="true" />
        {stats && stats.length > 0 && (
          <dl className="hero-stats" aria-label={lang === 'ko' ? '주요 지표' : 'Key metrics'}>
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="hero-stat"
                tabIndex={stat.description ? 0 : undefined}
                aria-describedby={stat.description ? `hero-stat-description-${index}` : undefined}
              >
                <dt className="hero-stat-label">{stat.label}</dt>
                <dd className="hero-stat-value">
                  {stat.value}
                  {stat.description && (
                    <span className="hero-stat-tooltip" role="tooltip" id={`hero-stat-description-${index}`}>
                      {stat.description}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className="hero-bottom-fade" aria-hidden="true" />
    </section>
  );
};

export default Hero;
