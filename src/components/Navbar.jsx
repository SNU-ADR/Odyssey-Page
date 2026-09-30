import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import odysseyHead from '../assets/images/odyssey_head.png';
import '../styles/components/Navbar.css';

const Navbar = () => {
  const { lang, content } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 50);
  const [activeSection, setActiveSection] = useState('');
  const toggleRef = useRef(null);

  const navItems = [
    { label: lang === 'ko' ? '컨셉' : 'Concept', href: '#odyssey-concept' },
    { label: lang === 'ko' ? '주행 모델 평가' : 'Planner Evaluation', href: '#planner-demos' },
    { label: lang === 'ko' ? '평가 지표' : 'Metrics', href: '#evaluation-metrics' },
    { label: lang === 'ko' ? '렌더링' : 'Rendering', href: '#rendering-comparison' },
    { label: content.results.sectionTitle, href: '#results' },
  ];

  const closeMenu = () => {
    setIsOpen(false);
    toggleRef.current?.focus();
  };

  useEffect(() => {
    const sections = navItems.map(item => item.href.slice(1));
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      let current = '';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) {
          current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.navbar')) {
        closeMenu();
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClick = () => {
    if (isOpen) closeMenu();
  };

  const menuLabel = lang === 'ko'
    ? (isOpen ? '내비게이션 메뉴 닫기' : '내비게이션 메뉴 열기')
    : (isOpen ? 'Close navigation menu' : 'Open navigation menu');

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} aria-label={lang === 'ko' ? '주요 내비게이션' : 'Main navigation'}>
      <div className="navbar-container">
        <a className="navbar-logo" href="#hero" aria-label={content.hero.title}>
          <img src={odysseyHead} alt="" className="navbar-logo-img" />
          <span className="navbar-logo-text">Odyssey</span>
        </a>

        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ul id="navbar-menu" className={`navbar-links ${isOpen ? 'open' : ''}`} role="list">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={handleClick}
                className={activeSection === item.href.slice(1) ? 'active' : ''}
                aria-current={activeSection === item.href.slice(1) ? 'page' : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar-right">
          <button
            type="button"
            ref={toggleRef}
            className={`navbar-toggle ${isOpen ? 'active' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={menuLabel}
            aria-expanded={isOpen}
            aria-controls="navbar-menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
