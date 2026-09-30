import React, { createContext, useContext, useState } from 'react';
import contentKo from '../data/content.json';
import contentEn from '../data/content-en.json';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const content = lang === 'ko' ? contentKo : contentEn;
  const toggleLang = () => setLang(l => l === 'ko' ? 'en' : 'ko');

  return (
    <LanguageContext.Provider value={{ lang, content, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
