import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import odysseyHead from '../assets/images/odyssey_head.png';
import heroNavigation from '../assets/images/hero-navigation.svg';
import '../styles/components/Hero.css';

const Hero = () => {
  const { lang, content } = useLanguage();
  const { title, sectionLabel, subtitle, affiliation, description, stats } = content.hero;

  return (
    <section id="hero" className="hero" aria-label={sectionLabel}>
      <img className="hero-navigation" src={heroNavigation} alt="" aria-hidden="true" />
      <div className="hero-content">
        <h1 className="hero-title">
          <img src={odysseyHead} alt="" className="hero-emblem" />
          <span className="hero-wordmark">{title}</span>
        </h1>
        {affiliation && <p className="hero-affiliation">{affiliation}</p>}
        <div className="hero-divider" aria-hidden="true" />
        <p className="hero-subtitle">{subtitle}</p>
        <p className="hero-description">{description}</p>
        {stats && stats.length > 0 && (
          <dl className="hero-stats" aria-label={lang === 'ko' ? '주요 지표' : 'Key metrics'}>
            {stats.map((stat) => (
              <div key={stat.label} className="hero-stat">
                <dt className="hero-stat-label">{stat.label}</dt>
                <dd className="hero-stat-value">{stat.value}</dd>
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