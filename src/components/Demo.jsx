import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SectionTitle from './common/SectionTitle';
import '../styles/components/Demo.css';

const Demo = () => {
  const { lang } = useLanguage();
  const subtitle = lang === 'ko'
    ? '논문 supplementary video: Odyssey의 장면 재구성과 폐루프 주행 결과입니다.'
    : 'Paper supplementary video showing Odyssey scene reconstruction and closed-loop driving results.';

  return (
    <section id="demo" className="demo-section" aria-label="Demo">
      <SectionTitle title="Demo" subtitle={subtitle} />
      <div className="demo-video-frame">
        <video controls playsInline preload="metadata" className="demo-video">
          <source src={`${process.env.PUBLIC_URL}/videos/odyssey-paper-demo.mp4`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
};

export default Demo;