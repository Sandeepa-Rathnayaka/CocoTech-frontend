import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import si from './si';
import ta from './ta';

// Define resource structure for type safety
interface Resources {
  [key: string]: any;
}

const resources: Record<string, Resources> = {
  en: { translation: en },
  si: { translation: si },
  ta: { translation: ta },
};

// Export the supported languages as a type
export type SupportedLanguage = keyof typeof resources;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;