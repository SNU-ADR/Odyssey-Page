import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SectionTitle from './common/SectionTitle';
import useScrollFadeIn from '../hooks/useScrollFadeIn';
import '../styles/components/Contact.css';

const Contact = () => {
  const { lang, content } = useLanguage();
  const {
    sectionTitle, sectionTag, sectionSubtitle,
    collaborationTitle, collaborationNote, collaborationTopics,
    downloadLabel, downloadTitle, downloadNote, downloadCta, downloadUrl,
    emailLabel, emailSub, email,
    addressLabel, address, addressDetail, labUrl,
  } = content.contact;
  const ref = useScrollFadeIn();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section id="contact" aria-label={sectionTitle}>
      <SectionTitle title={sectionTitle} subtitle={sectionSubtitle} tag={sectionTag} centered />

      <div className="contact-body fade-in" ref={ref}>
        <div className="contact-intro">
          <h3 className="contact-intro-title">{collaborationTitle}</h3>
          <p className="contact-note">{collaborationNote}</p>
          <ul className="contact-topics" aria-label={lang === 'ko' ? '협업 유형' : 'Collaboration types'}>
            {collaborationTopics.map((topic) => (
              <li key={topic} className="contact-topic-tag">{topic}</li>
            ))}
          </ul>
        </div>

        {/* Primary CTA — EAD download form */}
        <a
          className="contact-download"
          href={downloadUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={lang === 'ko' ? `${downloadTitle} — 새 창에서 열기` : `${downloadTitle} — opens in new tab`}
        >
          <div className="contact-download-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
          </div>
          <div className="contact-download-body">
            <span className="contact-download-label">{downloadLabel}</span>
            <h3 className="contact-download-title">{downloadTitle}</h3>
            <p className="contact-download-note">{downloadNote}</p>
          </div>
          <span className="contact-download-cta" aria-hidden="true">
            {downloadCta}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </a>

        <div className="contact-cards">
          {/* Email */}
          <a className="contact-card contact-card--email" href={`mailto:${email}`} aria-label={lang === 'ko' ? `이메일 보내기 — ${email}` : `Send email — ${email}`}>
            <div className="contact-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" />
              </svg>
            </div>
            <div className="contact-card-body">
              <span className="contact-card-label">{emailLabel}</span>
              <span className="contact-card-value">{emailSub}</span>
              <span className="contact-card-sub">{email}</span>
            </div>
            <button
              className={`contact-copy-btn${copied ? ' contact-copy-btn--copied' : ''}`}
              onClick={handleCopyEmail}
              aria-label={lang === 'ko' ? '이메일 복사' : 'Copy email'}
            >
              {copied ? (lang === 'ko' ? '복사됨!' : 'Copied!') : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </a>

          {/* Lab website */}
          <a className="contact-card contact-card--lab" href={labUrl} target="_blank" rel="noreferrer" aria-label={lang === 'ko' ? `${address} 웹사이트` : `${address} website`}>
            <div className="contact-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div className="contact-card-body">
              <span className="contact-card-label">{addressLabel}</span>
              <span className="contact-card-value">{address}</span>
              <span className="contact-card-sub">{addressDetail}</span>
            </div>
            <span className="contact-card-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;
