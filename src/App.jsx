import React from 'react';
import './styles/global.css';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FlagshipFigure from './components/FlagshipFigure';
import Demo from './components/Demo';
import RoadMap from './components/RoadMap';
import Model from './components/Model';
import Dataset from './components/Dataset';
import Results from './components/Results';
import Authors from './components/Authors';
import Footer from './components/Footer';

function AppInner() {
  return (
    <div className="App">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <FlagshipFigure />
        <Demo />
        <Model />
        <Dataset />
        <Results />
        <Authors />
        <RoadMap />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}

export default App;