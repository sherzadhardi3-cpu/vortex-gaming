export const BRAND = {
  name: 'VORTEX GAMING',
  tagline: 'Your Digital Gaming Universe',
  description: 'Premium digital gaming marketplace for Steam, PlayStation, Xbox, and more.',
} as const;

export const PLATFORMS = [
  { id: 'steam', name: 'Steam', slug: 'steam', icon: '🎮', color: '#1b2838' },
  { id: 'epic', name: 'Epic Games', slug: 'epic-games', icon: '⚡', color: '#2a2a2a' },
  { id: 'rockstar', name: 'Rockstar Games', slug: 'rockstar', icon: '⭐', color: '#fcaf17' },
  { id: 'xbox', name: 'Xbox', slug: 'xbox', icon: '🟢', color: '#107c10' },
  { id: 'playstation', name: 'PlayStation', slug: 'playstation', icon: '🔵', color: '#003087' },
  { id: 'ea', name: 'EA', slug: 'ea', icon: '🎯', color: '#ff4747' },
  { id: 'ubisoft', name: 'Ubisoft', slug: 'ubisoft', icon: '🌀', color: '#0070ff' },
] as const;

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'د.ع', locale: 'ar-IQ' },
] as const;

export const LANGUAGES = [
  { code: 'en', name: 'English', dir: 'ltr' as const, nativeName: 'English' },
  { code: 'ku', name: 'Kurdish Sorani', dir: 'rtl' as const, nativeName: 'کوردی سۆرانی' },
  { code: 'ar', name: 'Arabic', dir: 'rtl' as const, nativeName: 'العربية' },
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];

export const GENRES = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation',
  'Sports', 'Racing', 'Puzzle', 'Horror', 'Shooter',
  'Fighting', 'Platformer', 'Survival', 'Open World', 'Indie',
  'MMO', 'Battle Royale', 'Sandbox', 'Stealth', 'Sci-Fi',
] as const;

export const REGIONS = [
  { code: 'GLOBAL', name: 'Global (Worldwide)' },
  { code: 'NA', name: 'North America' },
  { code: 'EU', name: 'Europe' },
  { code: 'ME', name: 'Middle East' },
  { code: 'ASIA', name: 'Asia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'AR', name: 'Argentina' },
] as const;
