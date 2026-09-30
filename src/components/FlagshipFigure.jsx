import React from 'react';
import flagshipFigure from '../assets/images/intro1_Page-no-labels.svg';
import '../styles/components/FlagshipFigure.css';

const FlagshipFigure = () => (
  <section className="flagship-section" aria-label="Odyssey benchmark overview">
    <figure className="flagship-frame">
      <img
        className="flagship-image"
        src={flagshipFigure}
        alt="Odyssey benchmark overview: prior benchmark limitations, long driving scenarios, SD-map routing, closed-loop simulation, and high-quality rendering."
      />
    </figure>
  </section>
);

export default FlagshipFigure;
