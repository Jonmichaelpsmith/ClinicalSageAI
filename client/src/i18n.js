// Import translation files
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

// Get user's preferred language
const getUserLanguage = () => {
  const savedLang = localStorage.getItem('i18nextLng');
  if (savedLang && resources[savedLang]) return savedLang;
  
  const browserLang = navigator.language?.slice(0, 2);
  return resources[browserLang] ? browserLang : 'en';
};

// Simple translation function
export const t = (key, options = {}) => {
  const language = getUserLanguage();
  const namespace = options.ns || 'common';
  const translations = resources[language]?.[namespace] || resources.en[namespace];
  
  return translations[key] || options.defaultValue || key;
};

// Language change helper
export const changeLanguage = (lang) => {
  if (resources[lang]) {
    localStorage.setItem('i18nextLng', lang);
    document.documentElement.lang = lang;
    
    // Reload to apply changes
    window.location.reload();
  }
};

// Initialize
const initialize = () => {
  const language = getUserLanguage();
  document.documentElement.lang = language;
  localStorage.setItem('i18nextLng', language);
  
  // Expose translation function globally
  window.t = t;
};

// Run initialization
if (typeof window !== 'undefined') {
  initialize();
}

// Export mock of i18next API for compatibility
export default {
  t,
  changeLanguage,
  language: getUserLanguage(),
  languages: Object.keys(resources)
};
