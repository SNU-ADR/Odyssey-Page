import React from 'react';
import './styles/global.css';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FlagshipFigure from './components/FlagshipFigure';
import Demo from './components/Demo';
// Temporarily hidden while the Results content is being revised.
// import Results from './components/Results';
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
        {/* <Results /> */}
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
