import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/components/Navbar.css';

const Navbar = () => {
  const { lang } = useLanguage();
  const ko = lang === 'ko';
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 50);
  const [activeSection, setActiveSection] = useState('');
  const [activeSubsection, setActiveSubsection] = useState('');
  const toggleRef = useRef(null);
  const sidebarRef = useRef(null);

  const navItems = useMemo(() => [
    { id: 'odyssey-concept', label: ko ? '컨셉' : 'Concept' },
    {
      id: 'planner-demos', label: ko ? '주행 모델 평가' : 'Planner Evaluation',
      children: [
        { id: 'command-vs-sd-route', label: 'Command vs SD Route' },
        { id: 'planner-pre-lane-change', label: 'Pre-Lane Change' },
        { id: 'planner-traffic-light', label: 'Traffic Light' },
        { id: 'planner-pedestrian', label: 'Pedestrian' },
        { id: 'planner-overall-evaluation', label: 'Overall Evaluation' },
      ],
    },
    {
      id: 'evaluation-metrics', label: ko ? '평가 지표' : 'Metrics',
      children: [
        { id: 'metric-formula', label: 'RouteDS' },
        { id: 'metric-plc', label: ko ? '사전 차로 변경' : 'Pre-Lane Change' },
        { id: 'metric-sdc', label: ko ? 'SD 경로 준수' : 'SD Route Compliance' },
        { id: 'metric-nc', label: ko ? '충돌 회피' : 'No Collision' },
        { id: 'metric-dac', label: ko ? '주행 가능 영역 및 주행 방향 준수' : 'Drivable Area & Driving Direction Compliance' },
        { id: 'metric-tlc', label: ko ? '교통신호 준수' : 'Traffic Light Compliance' },
      ],
    },
    { id: 'rendering-comparison', label: ko ? '렌더링' : 'Rendering' },
    // Restore Results here when that section is ready to be shown again.
  ], [ko]);

  useEffect(() => {
    let frame;
    const update = () => {
      frame = undefined;
      setScrolled(window.scrollY > 50);
      const marker = Math.min(160, window.innerHeight * 0.25);
      const current = navItems.find(item => {
        const rect = document.getElementById(item.id)?.getBoundingClientRect();
        return rect && rect.top <= marker && rect.bottom > marker;
      });
      setActiveSection(current?.id || '');
      const children = (current?.children || []).map(item => ({
        ...item, top: document.getElementById(item.id)?.getBoundingClientRect().top,
      })).filter(item => item.top !== undefined && item.top <= marker);
      const closestTop = Math.max(...children.map(item => item.top));
      const sameRow = children.filter(item => Math.abs(item.top - closestTop) < 2);
      // Two-column clips share a vertical position. Keep the clicked clip
      // selected on that row, rather than always selecting its right neighbor.
      const selected = sameRow.find(item => `#${item.id}` === window.location.hash) || sameRow[0];
      setActiveSubsection(selected?.id || '');
    };
    const scheduleUpdate = () => {
      if (frame === undefined) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('hashchange', scheduleUpdate);
    const observer = new ResizeObserver(scheduleUpdate);
    const main = document.getElementById('main-content');
    if (main) observer.observe(main);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('hashchange', scheduleUpdate);
    };
  }, [navItems]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1680px)');
    const closeOnDesktop = () => { if (desktop.matches) setIsOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = event => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };
    const handleFocus = event => {
      if (!sidebarRef.current?.contains(event.target) && !toggleRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('focusin', handleFocus);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('focusin', handleFocus);
    };
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    toggleRef.current?.focus();
  };

  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <a className="navbar-logo" href="#hero" aria-label={ko ? 'Odyssey 맨 위로' : 'Odyssey — back to top'}>
          <span className="navbar-logo-text">Odyssey</span>
        </a>
      </header>

      <button
        ref={toggleRef}
        type="button"
        className={`toc-toggle ${isOpen ? 'is-open' : ''}`}
        aria-label={ko ? (isOpen ? '목차 닫기' : '목차 열기') : (isOpen ? 'Close contents' : 'Open contents')}
        aria-expanded={isOpen}
        aria-controls="page-contents"
        onClick={() => setIsOpen(open => !open)}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d={isOpen ? 'M5 5L15 15M15 5L5 15' : 'M4 5H16M4 10H16M4 15H16'} /></svg>
        <span>{ko ? '목차' : 'Contents'}</span>
      </button>
      {isOpen && <button className="toc-backdrop" type="button" tabIndex={-1} aria-label={ko ? '목차 닫기' : 'Close contents'} onClick={closeMenu} />}

      <aside ref={sidebarRef} id="page-contents" className={`page-contents ${isOpen ? 'is-open' : ''}`}>
        <nav aria-label={ko ? '페이지 목차' : 'Page contents'}>
          <p className="toc-heading">{ko ? '목차' : 'Contents'}</p>
          <ul className="toc-sections">
            {navItems.map(item => {
              const active = activeSection === item.id;
              return (
                <li key={item.id} className={active ? 'toc-section is-active' : 'toc-section'}>
                  <a
                    href={`#${item.id}`}
                    className="toc-section-link"
                    onClick={() => setIsOpen(false)}
                    aria-current={active && !activeSubsection ? 'location' : undefined}
                    aria-expanded={item.children ? active : undefined}
                    aria-controls={item.children && active ? `toc-${item.id}` : undefined}
                  >{item.label}</a>
                  {active && item.children && (
                    <ul id={`toc-${item.id}`} className="toc-subsections">
                      {item.children.map(child => (
                        <li key={child.id}>
                          <a
                            href={`#${child.id}`}
                            className={activeSubsection === child.id ? 'is-active' : undefined}
                            aria-current={activeSubsection === child.id ? 'location' : undefined}
                            onClick={() => setIsOpen(false)}
                          >{child.label}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Navbar;
