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
      </div>
    </footer>
  );
}

export default Footer;
