import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import esTranslations from '../locales/es.json';
import enTranslations from '../locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: esTranslations
      },
      en: {
        translation: enTranslations
      }
    },
    lng: localStorage.getItem('language') || 'es', // Idioma por defecto: español
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false // React ya escapa los valores
    }
  });

export default i18n;
