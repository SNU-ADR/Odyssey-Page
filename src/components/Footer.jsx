import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import odysseyHead from '../assets/images/odyssey_head.png';
import '../styles/components/Footer.css';

function Footer() {
  const { lang } = useLanguage();
  const copyright = lang === 'ko' ? '© 2026 Odyssey 연구 프로젝트' : '© 2026 Odyssey Research Project';

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src={odysseyHead} alt="" className="footer-emblem" />
          <span className="footer-logo">Odyssey</span>
        </div>
        <p className="footer-copyright">{copyright}</p>
        <div className="footer-attribution">
          <p>
            {lang === 'ko' ? 'Motional의 ' : 'Built on '}
            <a href="https://www.nuscenes.org/nuplan">nuPlan</a>
            {lang === 'ko' ? ' 데이터를 바탕으로 장면을 재구성하고 시뮬레이션·시각 보정을 적용했습니다.' : ' data by Motional, adapted through scene reconstruction, simulation, and visual refinement.'}
          </p>
          <p>
            {lang === 'ko' ? 'nuPlan 기반 시각 자료: ' : 'nuPlan-derived visual content: '}
            <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" rel="license">CC BY-NC-SA 4.0</a>
            {' · '}
            <a href="https://www.nuscenes.org/terms-of-use">{lang === 'ko' ? '데이터 이용약관' : 'Dataset terms'}</a>
            {' · '}
            <a href={`${process.env.PUBLIC_URL}/notices/nuplan.html`}>{lang === 'ko' ? '출처 및 라이선스 고지' : 'Attribution & license notice'}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
