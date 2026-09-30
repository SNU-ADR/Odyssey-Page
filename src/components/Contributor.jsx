import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SectionTitle from './common/SectionTitle';
import useScrollFadeIn from '../hooks/useScrollFadeIn';
import '../styles/components/Contributor.css';

const professorPhoto = require('../assets/images/contributors/최준원.jpg');

const Contributor = () => {
  const { content } = useLanguage();
  const { sectionTitle, sectionSubtitle, rows } = content.contributors;
  const ref = useScrollFadeIn();
  const lead = rows.find((row) => !row.rowLabel)?.members[0];
  const teams = rows.filter((row) => row.rowLabel);

  return (
    <section id="team" className="team-section" aria-label={sectionTitle}>
      <SectionTitle title={sectionTitle} subtitle={sectionSubtitle} />
      <div className="team-layout fade-in" ref={ref}>
        {lead && (
          <article className="team-professor">
            <img className="team-professor-photo" src={professorPhoto} alt={lead.name} />
            <div className="team-professor-info">
              <h3>{lead.name}</h3>
              <p>{lead.role}</p>
            </div>
          </article>
        )}
        <div className="team-groups">
          {teams.map((team) => (
            <section className="team-group" key={team.rowLabel} aria-label={team.rowLabel}>
              <h3>{team.rowLabel}</h3>
              <ul>
                {team.members.map((member) => (
                  <li className="team-member" key={member.name}>
                    <span className="team-member-name">{member.name}</span>
                    <span className="team-member-role">{member.role}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contributor;