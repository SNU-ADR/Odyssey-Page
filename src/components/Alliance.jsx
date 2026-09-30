import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SectionTitle from './common/SectionTitle';
import useScrollFadeIn from '../hooks/useScrollFadeIn';
import '../styles/components/Alliance.css';

const Alliance = () => {
  const { lang, content } = useLanguage();
  const { sectionTitle, sectionTag, sectionSubtitle, partners } = content.alliance;
  const ref = useScrollFadeIn();

  return (
    <section id="alliance" aria-label={sectionTitle}>
      <SectionTitle title={sectionTitle} subtitle={sectionSubtitle} tag={sectionTag} centered />
      <div className="alliance-marquee-wrapper fade-in" ref={ref}>
        <div className="alliance-marquee">
          <div className="alliance-marquee-track" role="list" aria-label={lang === 'ko' ? '협력사 목록' : 'Partner list'}>
            {partners.map((partner) => (
              <div key={partner.name} className="alliance-marquee-item" role="listitem">
                {partner.logo ? (
                  <img
                    src={require(`../assets/logos/${partner.logo}`)}
                    alt={partner.name}
                    className="alliance-logo"
                    data-name={partner.name}
                    loading="lazy"
                  />
                ) : (
                  <span className="alliance-name">{partner.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Alliance;
