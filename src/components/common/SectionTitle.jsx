import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import useScrollFadeIn from '../../hooks/useScrollFadeIn';

const SectionTitle = ({ title, subtitle, tag, centered }) => {
  const { lang } = useLanguage();
  const ref = useScrollFadeIn();

  return (
    <div className={`section-title fade-in ${centered ? 'section-title--centered' : ''}`} ref={ref}>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
};

export default SectionTitle;
