// Simple i18n implementation without external libraries
import enCommon from './locales/en/common.json';
import frCommon from './locales/fr/common.json';
import deCommon from './locales/de/common.json';
import jaCommon from './locales/ja/common.json';

const resources = {
  en: { common: enCommon },
  fr: { common: frCommon },
  de: { common: deCommon },
  ja: { common: jaCommon }
};

// Get the user's preferred language
const getUserLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  
  const savedLng = localStorage.getItem('i18nextLng');
  if (savedLng && resources[savedLng]) return savedLng;
  
  const browserLng = navigator.language?.slice(0, 2);
  return resources[browserLng] ? browserLng : 'en';
};

// Simple translation function
const t = (key, options = {}) => {
  const language = getUserLanguage();
  const namespace = options.ns || 'common';
  const translations = resources[language]?.[namespace] || resources.en[namespace];
  
  return translations[key] || options.defaultValue || key;
};

// Language change helper
const changeLanguage = (lang) => {
  if (resources[lang]) {
    localStorage.setItem('i18nextLng', lang);
    document.documentElement.lang = lang;
    
    // Reload to apply changes
    window.location.reload();
  }
};

// Initialize
if (typeof window !== 'undefined') {
  const language = getUserLanguage();
  document.documentElement.lang = language;
  localStorage.setItem('i18nextLng', language);
  
  // Global t function
  window.t = t;
}

// i18next-compatible API
const i18n = {
  t,
  changeLanguage,
  language: getUserLanguage(),
  languages: Object.keys(resources)
};

export { t, changeLanguage };
export default i18n;
