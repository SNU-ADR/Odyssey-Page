import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SectionTitle from './common/SectionTitle';
import useScrollFadeIn from '../hooks/useScrollFadeIn';
import '../styles/components/Authors.css';

const professorPhoto = require('../assets/images/contributors/최준원.jpg');

const Authors = () => {
  const { content } = useLanguage();
  const { sectionTitle, sectionSubtitle, members } = content.authors;
  const ref = useScrollFadeIn();
  const professor = members.find((author) => author.portrait);
  const students = members.filter((author) => !author.portrait);

  return (
    <section id="authors" className="authors-section" aria-label={sectionTitle}>
      <SectionTitle title={sectionTitle} subtitle={sectionSubtitle} />
      <div className="authors-layout fade-in" ref={ref}>
        {professor && (
          <article className="authors-professor">
            <img className="authors-professor-photo" src={professorPhoto} alt={professor.name} />
            <div className="authors-professor-info">
              <h3>{professor.name}</h3>
              <p>{professor.role}</p>
            </div>
          </article>
        )}
        <ol className="authors-student-list">
          {students.map((author) => (
            <li className="authors-student-row" key={author.name}>
              <span className="authors-student-name">{author.name}</span>
              <span className="authors-student-role">{author.role}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Authors;