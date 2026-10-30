'use client';

// VORTEX GAMING — Unified i18n Hook & Helpers
// Provides strongly typed translation lookup, dynamic RTL/LTR direction, and language switching

import { useLanguageStore } from '@/lib/store/useLanguageStore';
import { TRANSLATIONS, TranslationDictionary, getTranslation } from './translations';

export { TRANSLATIONS, getTranslation };
export type { TranslationDictionary };

export function useTranslation() {
  const { language, direction, setLanguage } = useLanguageStore();

  const t = (key: keyof TranslationDictionary): string => {
    return getTranslation(language, key);
  };

  return {
    t,
    language,
    direction,
    setLanguage,
    isRTL: direction === 'rtl',
  };
}
