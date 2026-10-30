// VORTEX GAMING — Core Game Catalog & Data Layer
// Authoritative catalog covering all 7 supported gaming platforms, gift cards & subscriptions

export interface GameItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  platform: 'steam' | 'epic' | 'rockstar' | 'xbox' | 'playstation' | 'ea' | 'ubisoft';
  platformName: string;
  publisher: string;
  developer: string;
  releaseDate: string;
  genre: string[];
  tags: string[];
  
  // Pricing in integer minor units (USD: cents e.g. 5999 = $59.99; IQD: e.g. 78000 = 78,000 IQD)
  priceUSD: number;
  priceIQD: number;
  originalPriceUSD: number;
  originalPriceIQD: number;
  discountPercent: number;

  activationRegion: 'GLOBAL' | 'NA' | 'EU' | 'ME' | 'ASIA';
  activationType: 'KEY' | 'CODE' | 'GIFT_CARD' | 'SUBSCRIPTION';
  productType: 'GAME' | 'DLC' | 'GIFT_CARD' | 'SUBSCRIPTION';
  
  // Visuals - gradient presets and badges
  bannerGradient: string;
  accentColor: string;
  
  // Flags
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewRelease?: boolean;
  isBestSeller?: boolean;
  isDeal?: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;

  // Requirements
  systemRequirements?: {
    os: string;
    processor: string;
    memory: string;
    graphics: string;
    storage: string;
  };
  activationGuide: string;
}

export const GAMES_CATALOG: GameItem[] = [
  // ── STEAM ─────────────────────────────────────────────────────────────
  {
    id: 'steam-cyberpunk-phantom-liberty',
    slug: 'cyberpunk-2077-phantom-liberty',
    title: 'Cyberpunk 2077: Phantom Liberty',
    shortDescription: 'Freedom Always Comes at a Price. Enter Dogtown in this gripping spy-thriller expansion.',
    description: 'Phantom Liberty is a spy-thriller adventure for Cyberpunk 2077. Return as cyber-enhanced mercenary V and embark on a high-stakes mission of espionage and intrigue to save the NUS President.',
    platform: 'steam',
    platformName: 'Steam',
    publisher: 'CD PROJEKT RED',
    developer: 'CD PROJEKT RED',
    releaseDate: '2023-09-26',
    genre: ['RPG', 'Action', 'Sci-Fi', 'Open World'],
    tags: ['Cyberpunk', 'Story Rich', 'First-Person'],
    priceUSD: 2999, // $29.99
    priceIQD: 39000,
    originalPriceUSD: 3999,
    originalPriceIQD: 52000,
    discountPercent: 25,
    activationRegion: 'GLOBAL',
    activationType: 'KEY',
    productType: 'DLC',
    bannerGradient: 'from-amber-500 via-rose-600 to-cyan-500',
    accentColor: '#00d4ff',
    isFeatured: true,
    isTrending: true,
    isBestSeller: true,
    stockCount: 142,
    rating: 4.9,
    reviewCount: 3820,
    systemRequirements: {
      os: 'Windows 10 64-bit',
      processor: 'Core i7-6700 or Ryzen 5 1600',
      memory: '12 GB RAM',
      graphics: 'GeForce GTX 1060 6GB or Radeon RX 580 8GB',
      storage: '70 GB SSD available space',
    },
    activationGuide: '1. Launch the Steam client software and log into your Steam account.\n2. Click the Games menu option at the top.\n3. Choose Activate a Product on Steam...\n4. Follow the onscreen instructions to complete the process.',
  },
  {
    id: 'steam-elden-ring-shadow-erdtree',
    slug: 'elden-ring-shadow-of-the-erdtree',
    title: 'ELDEN RING: Shadow of the Erdtree',
    shortDescription: 'Guided by Empyrean Miquella, enter the Land of Shadow to unravel its mysteries.',
    description: 'The Shadow of the Erdtree expansion features an all-new story set in the Land of Shadow imbued with mystery, perilous dungeons, and new enemies, weapons and equipment.',
    platform: 'steam',
    platformName: 'Steam',
    publisher: 'FromSoftware / Bandai Namco',
    developer: 'FromSoftware Inc.',
    releaseDate: '2024-06-21',
    genre: ['Action', 'RPG', 'Dark Fantasy'],
    tags: ['Souls-like', 'Difficult', 'Masterpiece'],
    priceUSD: 3999, // $39.99
    priceIQD: 52000,
    originalPriceUSD: 4999,
    originalPriceIQD: 65000,
    discountPercent: 20,
    activationRegion: 'GLOBAL',
    activationType: 'KEY',
    productType: 'GAME',
    bannerGradient: 'from-amber-600 via-yellow-700 to-stone-900',
    accentColor: '#fcaf17',
    isFeatured: true,
    isTrending: true,
    isDeal: true,
    stockCount: 89,
    rating: 4.9,
    reviewCount: 5410,
    systemRequirements: {
      os: 'Windows 10/11 64-bit',
      processor: 'INTEL CORE I5-8400 or AMD RYZEN 3 3300X',
      memory: '12 GB RAM',
      graphics: 'NVIDIA GEFORCE GTX 1060 3 GB or AMD RADEON RX 580 4 GB',
      storage: '60 GB available space',
    },
    activationGuide: '1. Open Steam desktop application.\n2. Click "+ ADD A GAME" on the bottom-left corner.\n3. Select "Activate a Product on Steam..." and input your key.',
  },
  {
    id: 'steam-black-myth-wukong',
    slug: 'black-myth-wukong',
    title: 'Black Myth: Wukong',
    shortDescription: 'An action RPG rooted in Chinese mythology. Set out as the Destined One.',
    description: 'Black Myth: Wukong is an action RPG rooted in Chinese mythology. You shall venture into the vast unknown to discover hidden truths under the veil of a glorious legend.',
    platform: 'steam',
    platformName: 'Steam',
    publisher: 'Game Science',
    developer: 'Game Science',
    releaseDate: '2024-08-20',
    genre: ['Action', 'RPG', 'Mythology'],
    tags: ['Action RPG', 'Singleplayer', 'Atmospheric'],
    priceUSD: 5499, // $54.99
    priceIQD: 72000,
    originalPriceUSD: 5999,
    originalPriceIQD: 78000,
    discountPercent: 8,
    activationRegion: 'GLOBAL',
    activationType: 'KEY',
    productType: 'GAME',
    bannerGradient: 'from-orange-700 via-amber-800 to-stone-950',
    accentColor: '#f97316',
    isFeatured: true,
    isTrending: true,
    isBestSeller: true,
    stockCount: 65,
    rating: 4.8,
    reviewCount: 4200,
    systemRequirements: {
      os: 'Windows 10 64-bit',
      processor: 'Core i5-8400 / Ryzen 5 1600',
      memory: '16 GB RAM',
      graphics: 'GeForce GTX 1060 6GB / Radeon RX 580 8GB',
      storage: '130 GB SSD available space',
    },
    activationGuide: 'Redeem your genuine Steam CD key through the Steam client library menu.',
  },

  // ── EPIC GAMES ────────────────────────────────────────────────────────
  {
    id: 'epic-alan-wake-2',
    slug: 'alan-wake-2',
    title: 'Alan Wake 2',
    shortDescription: 'A string of ritualistic murders threatens Bright Falls. Survival horror masterpiece.',
    description: 'Saga Anderson arrives to investigate ritualistic murders in a small town. Alan Wake pens a dark story to shape the reality around him. Two heroes, two realities, one psychological mystery.',
    platform: 'epic',
    platformName: 'Epic Games',
    publisher: 'Epic Games Publishing',
    developer: 'Remedy Entertainment',
    releaseDate: '2023-10-27',
    genre: ['Horror', 'Action', 'Mystery'],
    tags: ['Survival Horror', 'Cinematic', 'Story Rich'],
    priceUSD: 3499,
    priceIQD: 45000,
    originalPriceUSD: 4999,
    originalPriceIQD: 65000,
    discountPercent: 30,
    activationRegion: 'GLOBAL',
    activationType: 'KEY',
    productType: 'GAME',
    bannerGradient: 'from-emerald-900 via-slate-900 to-black',
    accentColor: '#10b981',
    isDeal: true,
    isFeatured: true,
    stockCount: 47,
    rating: 4.9,
    reviewCount: 1890,
    activationGuide: '1. Sign in to your Epic Games account at epicgames.com or launch the Epic Games Launcher.\n2. Click on your profile name at bottom-left/top-right.\n3. Click "Redeem Code".\n4. Enter the code and click "Redeem".',
  },

  // ── ROCKSTAR GAMES ───────────────────────────────────────────────────
  {
    id: 'rockstar-red-dead-redemption-2',
    slug: 'red-dead-redemption-2',
    title: 'Red Dead Redemption 2',
    shortDescription: 'Arthur Morgan and the Van der Linde gang are outlaws on the run across America.',
    description: 'Winner of over 175 Game of the Year Awards and recipient of over 250 perfect scores, Red Dead Redemption 2 is an epic tale of honor and loyalty at the dawn of the modern age.',
    platform: 'rockstar',
    platformName: 'Rockstar Games',
    publisher: 'Rockstar Games',
    developer: 'Rockstar Studios',
    releaseDate: '2019-11-05',
    genre: ['Action', 'Adventure', 'Open World', 'Western'],
    tags: ['Masterpiece', 'Story Rich', 'Open World'],
    priceUSD: 1999, // $19.99
    priceIQD: 26000,
    originalPriceUSD: 5999,
    originalPriceIQD: 78000,
    discountPercent: 67,
    activationRegion: 'GLOBAL',
    activationType: 'KEY',
    productType: 'GAME',
    bannerGradient: 'from-red-800 via-orange-950 to-neutral-950',
    accentColor: '#ef4444',
    isDeal: true,
    isBestSeller: true,
    isTrending: true,
    stockCount: 210,
    rating: 5.0,
    reviewCount: 9480,
    activationGuide: '1. Download and start the Rockstar Games Launcher.\n2. Sign in with your Rockstar Games Social Club account.\n3. Click on your avatar in top-right and choose "Redeem Code".\n4. Enter your activation code.',
  },
  {
    id: 'rockstar-grand-theft-auto-v',
    slug: 'grand-theft-auto-v-premium',
    title: 'Grand Theft Auto V: Premium Edition',
    shortDescription: 'Includes the complete GTAV story experience, GTA Online and Criminal Enterprise Starter Pack.',
    description: 'When a young street hustler, a retired bank robber and a terrifying psychopath find themselves entangled with some of the most frightening elements of the criminal underworld, they must pull off heists.',
    platform: 'rockstar',
    platformName: 'Rockstar Games',
    publisher: 'Rockstar Games',
    developer: 'Rockstar North',
    releaseDate: '2015-04-14',
    genre: ['Action', 'Open World', 'Multiplayer'],
    tags: ['Heists', 'Multiplayer', 'Crime'],
    priceUSD: 1499,
    priceIQD: 19500,
    originalPriceUSD: 2999,
    originalPriceIQD: 39000,
    discountPercent: 50,
    activationRegion: 'GLOBAL',
    activationType: 'KEY',
    productType: 'GAME',
    bannerGradient: 'from-emerald-700 via-stone-800 to-black',
    accentColor: '#10b981',
    isBestSeller: true,
    stockCount: 340,
    rating: 4.8,
    reviewCount: 15400,
    activationGuide: 'Redeem in the Rockstar Games Launcher under your Social Club profile.',
  },

  // ── XBOX ─────────────────────────────────────────────────────────────
  {
    id: 'xbox-forza-horizon-5',
    slug: 'forza-horizon-5-premium',
    title: 'Forza Horizon 5: Premium Edition',
    shortDescription: 'Your Ultimate Horizon Adventure awaits! Explore the vibrant landscapes of Mexico.',
    description: 'Lead breathtaking expeditions across the vibrant and ever-evolving open world landscapes of Mexico with limitless, fun driving action in hundreds of the worlds greatest cars.',
    platform: 'xbox',
    platformName: 'Xbox',
    publisher: 'Xbox Game Studios',
    developer: 'Playground Games',
    releaseDate: '2021-11-09',
    genre: ['Racing', 'Open World', 'Sports'],
    tags: ['Cars', 'Multiplayer', 'Exploration'],
    priceUSD: 4499,
    priceIQD: 58500,
    originalPriceUSD: 8999,
    originalPriceIQD: 117000,
    discountPercent: 50,
    activationRegion: 'GLOBAL',
    activationType: 'CODE',
    productType: 'GAME',
    bannerGradient: 'from-pink-600 via-purple-800 to-slate-950',
    accentColor: '#107c10',
    isDeal: true,
    isFeatured: true,
    stockCount: 78,
    rating: 4.8,
    reviewCount: 2900,
    activationGuide: '1. Press the Xbox button on your controller, or visit microsoft.com/redeem on browser.\n2. Enter the 25-character digital code.\n3. Confirm to add the title to your Microsoft / Xbox account.',
  },
  {
    id: 'xbox-game-pass-ultimate-3m',
    slug: 'xbox-game-pass-ultimate-3-months',
    title: 'Xbox Game Pass Ultimate — 3 Months',
    shortDescription: 'Hundreds of high-quality games on console, PC, and cloud with EA Play included.',
    description: 'Get all the benefits of Xbox Live Gold, plus over 100 high-quality console and PC games. Play new titles on day one and enjoy exclusive member discounts and perks.',
    platform: 'xbox',
    platformName: 'Xbox',
    publisher: 'Microsoft',
    developer: 'Microsoft',
    releaseDate: '2024-01-01',
    genre: ['Subscription'],
    tags: ['Game Pass', 'Multiplayer', 'Library'],
    priceUSD: 3899,
    priceIQD: 51000,
    originalPriceUSD: 4999,
    originalPriceIQD: 65000,
    discountPercent: 22,
    activationRegion: 'GLOBAL',
    activationType: 'SUBSCRIPTION',
    productType: 'SUBSCRIPTION',
    bannerGradient: 'from-green-700 via-emerald-900 to-black',
    accentColor: '#107c10',
    isBestSeller: true,
    isTrending: true,
    stockCount: 190,
    rating: 4.9,
    reviewCount: 6800,
    activationGuide: 'Redeem at redeem.microsoft.com with your Microsoft Account.',
  },

  // ── PLAYSTATION ──────────────────────────────────────────────────────
  {
    id: 'playstation-spiderman-2',
    slug: 'marvels-spider-man-2-ps5',
    title: "Marvel's Spider-Man 2",
    shortDescription: "Peter Parker and Miles Morales return for an exciting new chapter on PlayStation 5.",
    description: "Swing, jump and utilize the new Web Wings to travel across Marvel's New York, quickly switching between Peter Parker and Miles Morales to experience different stories and epic new powers.",
    platform: 'playstation',
    platformName: 'PlayStation',
    publisher: 'Sony Interactive Entertainment',
    developer: 'Insomniac Games',
    releaseDate: '2023-10-20',
    genre: ['Action', 'Adventure', 'Superheroes'],
    tags: ['Cinematic', 'Open World', 'PS5'],
    priceUSD: 4999,
    priceIQD: 65000,
    originalPriceUSD: 6999,
    originalPriceIQD: 91000,
    discountPercent: 28,
    activationRegion: 'GLOBAL',
    activationType: 'CODE',
    productType: 'GAME',
    bannerGradient: 'from-red-600 via-blue-900 to-slate-950',
    accentColor: '#003087',
    isFeatured: true,
    isTrending: true,
    isBestSeller: true,
    stockCount: 52,
    rating: 4.9,
    reviewCount: 3100,
    activationGuide: '1. Go to PlayStation Store on your console or store.playstation.com.\n2. Select your Profile icon at top-right.\n3. Select "Redeem Code".\n4. Enter the 12-digit voucher code carefully.',
  },
  {
    id: 'playstation-god-of-war-ragnarok',
    slug: 'god-of-war-ragnarok-ps5',
    title: 'God of War Ragnarök',
    shortDescription: 'Embark on an epic and heartfelt journey as Kratos and Atreus struggle with holding on and letting go.',
    description: 'From Santa Monica Studio comes the sequel to the critically acclaimed God of War (2018). Fimbulwinter is well underway. Kratos and Atreus must journey to each of the Nine Realms in search of answers.',
    platform: 'playstation',
    platformName: 'PlayStation',
    publisher: 'Sony Interactive Entertainment',
    developer: 'Santa Monica Studio',
    releaseDate: '2022-11-09',
    genre: ['Action', 'Adventure', 'Mythology'],
    tags: ['Norse', 'Action-Adventure', 'Masterpiece'],
    priceUSD: 3999,
    priceIQD: 52000,
    originalPriceUSD: 6999,
    originalPriceIQD: 91000,
    discountPercent: 43,
    activationRegion: 'GLOBAL',
    activationType: 'CODE',
    productType: 'GAME',
    bannerGradient: 'from-sky-700 via-indigo-950 to-black',
    accentColor: '#003087',
    isDeal: true,
    isFeatured: true,
    stockCount: 64,
    rating: 5.0,
    reviewCount: 4500,
    activationGuide: 'Redeem via PSN Store -> Redeem 12-digit code.',
  },

  // ── EA ───────────────────────────────────────────────────────────────
  {
    id: 'ea-sports-fc-25',
    slug: 'ea-sports-fc-25',
    title: 'EA SPORTS FC™ 25',
    shortDescription: 'For the Club. Team up with 5v5 Rush, tactical overhaul with FC IQ.',
    description: 'EA SPORTS FC™ 25 gives you more ways to win for the club. Team up with friends in your favorite modes with the new 5v5 Rush, and manage your club to victory with FC IQ delivering tactical control.',
    platform: 'ea',
    platformName: 'EA App',
    publisher: 'Electronic Arts',
    developer: 'EA Canada',
    releaseDate: '2024-09-27',
    genre: ['Sports', 'Simulation', 'Football'],
    tags: ['Soccer', 'Multiplayer', 'Competitive'],
    priceUSD: 4499,
    priceIQD: 58500,
    originalPriceUSD: 6999,
    originalPriceIQD: 91000,
    discountPercent: 35,
    activationRegion: 'GLOBAL',
    activationType: 'KEY',
    productType: 'GAME',
    bannerGradient: 'from-emerald-600 via-teal-900 to-black',
    accentColor: '#ff4747',
    isFeatured: true,
    isTrending: true,
    isBestSeller: true,
    stockCount: 110,
    rating: 4.6,
    reviewCount: 3890,
    activationGuide: '1. Open the EA app on your PC.\n2. Click "My Collection".\n3. Click "Redeem Code" in the upper-right corner.\n4. Enter your product code and click Next.',
  },

  // ── UBISOFT ──────────────────────────────────────────────────────────
  {
    id: 'ubisoft-star-wars-outlaws',
    slug: 'star-wars-outlaws',
    title: 'Star Wars Outlaws™',
    shortDescription: 'Experience the first-ever open world Star Wars™ game set between The Empire Strikes Back and Return of the Jedi.',
    description: 'Explore distinct locations with bustling cities and cantinas. Race across sprawling outdoor landscapes on your speeder. Each location brings new adventures, unique challenges, and enticing rewards.',
    platform: 'ubisoft',
    platformName: 'Ubisoft Connect',
    publisher: 'Ubisoft',
    developer: 'Massive Entertainment',
    releaseDate: '2024-08-30',
    genre: ['Action', 'Adventure', 'Sci-Fi', 'Open World'],
    tags: ['Star Wars', 'Singleplayer', 'Cinematic'],
    priceUSD: 4999,
    priceIQD: 65000,
    originalPriceUSD: 6999,
    originalPriceIQD: 91000,
    discountPercent: 28,
    activationRegion: 'GLOBAL',
    activationType: 'KEY',
    productType: 'GAME',
    bannerGradient: 'from-amber-700 via-sky-950 to-neutral-950',
    accentColor: '#0070ff',
    isNewRelease: true,
    isFeatured: true,
    stockCount: 41,
    rating: 4.5,
    reviewCount: 1240,
    activationGuide: '1. Launch Ubisoft Connect PC.\n2. Click the hamburger icon in top-left, select "Activate a key".\n3. Enter your Activation Key.\n4. Click "Activate".',
  },

  // ── GIFT CARDS ───────────────────────────────────────────────────────
  {
    id: 'giftcard-steam-50',
    slug: 'steam-wallet-card-50-usd',
    title: 'Steam Wallet Card $50 USD',
    shortDescription: 'Add $50 credit directly to your Steam Account. Instant digital code delivery.',
    description: 'Steam Wallet codes work just like gift certificates that can be redeemed on your account for the purchase of games, software, and any other item you can purchase on Steam.',
    platform: 'steam',
    platformName: 'Steam',
    publisher: 'Valve',
    developer: 'Valve',
    releaseDate: '2024-01-01',
    genre: ['Gift Card'],
    tags: ['Wallet', 'Credit', 'Instant'],
    priceUSD: 5000,
    priceIQD: 65500,
    originalPriceUSD: 5000,
    originalPriceIQD: 65500,
    discountPercent: 0,
    activationRegion: 'GLOBAL',
    activationType: 'GIFT_CARD',
    productType: 'GIFT_CARD',
    bannerGradient: 'from-blue-600 via-indigo-900 to-black',
    accentColor: '#1b2838',
    isBestSeller: true,
    stockCount: 500,
    rating: 5.0,
    reviewCount: 8900,
    activationGuide: 'Go to store.steampowered.com/account/redeemwalletcode and enter the code.',
  },
  {
    id: 'giftcard-playstation-50',
    slug: 'playstation-store-gift-card-50-usd',
    title: 'PlayStation Store Gift Card $50 USD',
    shortDescription: 'Add $50 to your PSN wallet for games, add-ons, subscriptions, and more.',
    description: 'Redeem for anything on PlayStation Store: games, add-ons, subscriptions and more. Safe, secure, and delivered immediately after checkout.',
    platform: 'playstation',
    platformName: 'PlayStation',
    publisher: 'Sony Interactive Entertainment',
    developer: 'Sony',
    releaseDate: '2024-01-01',
    genre: ['Gift Card'],
    tags: ['PSN', 'Wallet', 'Instant'],
    priceUSD: 5000,
    priceIQD: 65500,
    originalPriceUSD: 5000,
    originalPriceIQD: 65500,
    discountPercent: 0,
    activationRegion: 'GLOBAL',
    activationType: 'GIFT_CARD',
    productType: 'GIFT_CARD',
    bannerGradient: 'from-blue-700 via-sky-950 to-neutral-950',
    accentColor: '#003087',
    isBestSeller: true,
    stockCount: 380,
    rating: 5.0,
    reviewCount: 7100,
    activationGuide: 'Redeem on PlayStation Store -> Redeem Code on your PS4, PS5, or web browser.',
  },
];

// Helper query functions
export function getFeaturedGames(): GameItem[] {
  return GAMES_CATALOG.filter(g => g.isFeatured);
}

export function getTrendingGames(): GameItem[] {
  return GAMES_CATALOG.filter(g => g.isTrending);
}

export function getDealsGames(): GameItem[] {
  return GAMES_CATALOG.filter(g => g.isDeal || (g.discountPercent && g.discountPercent >= 20));
}

export function getBestSellers(): GameItem[] {
  return GAMES_CATALOG.filter(g => g.isBestSeller);
}

export function getGamesByPlatform(platformSlug: string): GameItem[] {
  return GAMES_CATALOG.filter(g => g.platform === platformSlug);
}

export function getGameBySlug(slug: string): GameItem | undefined {
  return GAMES_CATALOG.find(g => g.slug === slug);
}
