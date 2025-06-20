import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import srLatn from './locales/sr-Latn.json';
import srCyrl from './locales/sr-Cyrl.json';

const resources = {
  'en-US': { translation: en },
  'sr-Latn': { translation: srLatn },
  'sr-Cyrl': { translation: srCyrl },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en-US', // default language
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    supportedLngs: ['en-US', 'sr-Latn', 'sr-Cyrl'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n; 