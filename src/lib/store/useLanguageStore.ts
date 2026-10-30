// VORTEX GAMING — Centralized Language & Localization Store
// Manages language state (English, Kurdish Sorani, Arabic), RTL/LTR direction, and persistence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LANGUAGES, LanguageCode } from '@/lib/constants';

export type SupportedLanguage = 'en' | 'ku' | 'ar';

interface LanguageState {
  language: SupportedLanguage;
  direction: 'ltr' | 'rtl';
  setLanguage: (lang: SupportedLanguage) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      direction: 'ltr',
      setLanguage: (language: SupportedLanguage) => {
        const langConfig = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
        const direction = langConfig.dir;
        
        if (typeof document !== 'undefined') {
          document.documentElement.lang = language;
          document.documentElement.dir = direction;
        }

        set({ language, direction });
      },
    }),
    {
      name: 'vtx_language_preference',
    }
  )
);
