// VORTEX GAMING — Complete Multi-Language Translation Dictionaries
// Supports English (en), Kurdish Sorani (ku), and Arabic (ar) with native RTL typography

export interface TranslationDictionary {
  // Navigation
  'nav.home': string;
  'nav.store': string;
  'nav.deals': string;
  'nav.platforms': string;
  'nav.support': string;
  'nav.search': string;
  'nav.searchPlaceholder': string;
  'nav.account': string;
  'nav.vault': string;
  'nav.orders': string;
  'nav.wishlist': string;
  'nav.cart': string;
  'nav.login': string;
  'nav.register': string;
  'nav.logout': string;
  'nav.admin': string;

  // Secondary Navigation Order
  'nav.allProducts': string;
  'nav.games': string;
  'nav.giftCards': string;
  'nav.itunes': string;
  'nav.subscriptions': string;
  'nav.gameAccounts': string;
  'nav.pcGames': string;
  'nav.topUps': string;

  // Catalog Filters & UI
  'catalog.categories': string;
  'catalog.platformFilters': string;
  'catalog.priceRange': string;
  'catalog.minPrice': string;
  'catalog.maxPrice': string;
  'catalog.applyFilter': string;
  'catalog.clearFilters': string;
  'catalog.inStockOnly': string;
  'catalog.viewGrid': string;
  'catalog.viewList': string;
  'catalog.fromPrice': string;
  'catalog.emptyTitle': string;
  'catalog.emptySubtitle': string;
  'catalog.browseAll': string;

  // Order Details & Timeline
  'orderDetails.backToOrders': string;
  'orderDetails.orderNumber': string;
  'orderDetails.placedOn': string;
  'orderDetails.stageOrderPlaced': string;
  'orderDetails.stagePaymentConfirmed': string;
  'orderDetails.stageFulfillmentCompleted': string;
  'orderDetails.stageDelivered': string;
  'orderDetails.totalDelivered': string;
  'orderDetails.viewDetails': string;
  'orderDetails.hideDetails': string;
  'orderDetails.customerSupport': string;
  'orderDetails.rateNow': string;
  'orderDetails.orderSummary': string;
  'orderDetails.subtotal': string;
  'orderDetails.discount': string;
  'orderDetails.total': string;
  'orderDetails.paymentMethod': string;
  'orderDetails.paymentStatus': string;
  'orderDetails.fulfillmentStatus': string;
  'orderDetails.statusPaid': string;
  'orderDetails.statusPending': string;
  'orderDetails.statusFailed': string;
  'orderDetails.statusRefunded': string;
  'orderDetails.statusCompleted': string;
  'orderDetails.statusProcessing': string;
  'orderDetails.awaitingPayment': string;
  'orderDetails.boughtBy': string;
  'orderDetails.testOrderNotice': string;
  'orderDetails.activationGuide': string;
  'orderDetails.region': string;
  'orderDetails.platform': string;
  'orderDetails.copyKey': string;
  'orderDetails.revealKey': string;
  'orderDetails.copied': string;
  'orderDetails.timelineHistory': string;
  'orderDetails.orderNotFound': string;
  'orderDetails.orderNotFoundDesc': string;

  // Trust Strip
  'trust.instantDelivery': string;
  'trust.instantDeliveryDesc': string;
  'trust.genuineProducts': string;
  'trust.genuineProductsDesc': string;
  'trust.securePayment': string;
  'trust.securePaymentDesc': string;
  'trust.support': string;
  'trust.supportDesc': string;

  // Hero & Home
  'hero.badge': string;
  'hero.title': string;
  'hero.subtitle': string;
  'hero.tagline': string;
  'hero.exploreStore': string;
  'hero.flashDeals': string;
  'hero.verifiedKeys': string;
  'home.featured': string;
  'home.featuredDesc': string;
  'home.trending': string;
  'home.categories': string;
  'home.topPicks': string;
  'home.platformShortcuts': string;
  'home.weekendPromo': string;
  'home.weekendPromoDesc': string;
  'home.shopNow': string;
  'home.viewAll': string;

  // Store & Catalog
  'store.title': string;
  'store.subtitle': string;
  'store.allPlatforms': string;
  'store.allGenres': string;
  'store.allTypes': string;
  'store.allRegions': string;
  'store.inStockOnly': string;
  'store.sortBy': string;
  'store.sortFeatured': string;
  'store.sortPriceAsc': string;
  'store.sortPriceDesc': string;
  'store.sortNewest': string;
  'store.sortTitle': string;
  'store.addToCart': string;
  'store.buyNow': string;
  'store.added': string;
  'store.inStock': string;
  'store.fewLeft': string;
  'store.outOfStock': string;
  'store.instantKey': string;
  'store.filters': string;
  'store.clearFilters': string;
  'store.noResults': string;
  'store.noResultsDesc': string;

  // Account Dashboard (Resolves all profilePage.* keys)
  'profilePage.title': string;
  'profilePage.overview': string;
  'profilePage.orders': string;
  'profilePage.vault': string;
  'profilePage.wishlist': string;
  'profilePage.wallet': string;
  'profilePage.security': string;
  'profilePage.pin': string;
  'profilePage.mfa': string;
  'profilePage.discord': string;
  'profilePage.support': string;
  'profilePage.logout': string;
  'profilePage.statsOrders': string;
  'profilePage.statsKeys': string;
  'profilePage.statsWishlist': string;
  'profilePage.statsWallet': string;
  'profilePage.personalInfo': string;
  'profilePage.fullName': string;
  'profilePage.email': string;
  'profilePage.role': string;
  'profilePage.registeredSince': string;
  'profilePage.editProfile': string;
  'profilePage.changePassword': string;
  'profilePage.currentPassword': string;
  'profilePage.newPassword': string;
  'profilePage.confirmPassword': string;
  'profilePage.saveChanges': string;
  'profilePage.activeSessions': string;
  'profilePage.revealKey': string;
  'profilePage.hideKey': string;
  'profilePage.copyKey': string;
  'profilePage.copied': string;
  'profilePage.discordConnected': string;
  'profilePage.discordNotConnected': string;
  'profilePage.discordConnectBtn': string;
  'profilePage.discordDisconnectBtn': string;
  'profilePage.walletBalance': string;
  'profilePage.walletTopUp': string;
  'profilePage.walletHistory': string;
  'profilePage.noTransactions': string;

  // Support Chat Widget
  'support.title': string;
  'support.subtitle': string;
  'support.statusOnline': string;
  'support.inputPlaceholder': string;
  'support.send': string;
  'support.emptyHistory': string;
  'support.welcomeMsg': string;
  'support.guestEmailPrompt': string;
  'support.subjectPlaceholder': string;
  'support.soundToggle': string;
  'support.openChat': string;
  'support.closeChat': string;
  'support.ticketCreated': string;

  // Footer & Utility
  'footer.tagline': string;
  'footer.supportEmailLabel': string;
  'footer.quickLinks': string;
  'footer.aboutUs': string;
  'footer.store': string;
  'footer.contact': string;
  'footer.faq': string;
  'footer.support': string;
  'footer.account': string;
  'footer.services': string;
  'footer.gameKeys': string;
  'footer.giftCards': string;
  'footer.topUps': string;
  'footer.subscriptions': string;
  'footer.pcGames': string;
  'footer.consoleGames': string;
  'footer.newsletterTitle': string;
  'footer.newsletterDesc': string;
  'footer.emailPlaceholder': string;
  'footer.subscribeBtn': string;
  'footer.subscribing': string;
  'footer.subscribedSuccess': string;
  'footer.consentLabel': string;
  'footer.trustSecureCheckout': string;
  'footer.trustDataEncryption': string;
  'footer.trustSupport': string;
  'footer.trustInstantDelivery': string;
  'footer.paymentMethods': string;
  'footer.paymentLive': string;
  'footer.paymentSandbox': string;
  'footer.paymentSandboxNotice': string;
  'footer.privacy': string;
  'footer.refundPolicy': string;
  'footer.terms': string;
  'footer.backToTop': string;
  'footer.copyright': string;
}

export const TRANSLATIONS: Record<'en' | 'ku' | 'ar', TranslationDictionary> = {
  // ── ENGLISH ─────────────────────────────────────────────────────────────
  en: {
    'nav.home': 'Home',
    'nav.store': 'Catalog',
    'nav.deals': 'Deals',
    'nav.platforms': 'Platforms',
    'nav.support': 'Support',
    'nav.search': 'Search',
    'nav.searchPlaceholder': 'Search games, activation keys, gift cards...',
    'nav.account': 'My Account',
    'nav.vault': 'Digital Key Vault',
    'nav.orders': 'My Orders',
    'nav.wishlist': 'Wishlist',
    'nav.cart': 'Cart',
    'nav.login': 'Log In',
    'nav.register': 'Sign Up',
    'nav.logout': 'Log Out',
    'nav.admin': 'Admin Center',

    'nav.allProducts': 'All Products',
    'nav.games': 'Games',
    'nav.giftCards': 'Gift Cards',
    'nav.itunes': 'iTunes',
    'nav.subscriptions': 'Subscriptions',
    'nav.gameAccounts': 'Game Accounts',
    'nav.pcGames': 'PC Games',
    'nav.topUps': 'Top-Ups',

    'catalog.categories': 'Categories',
    'catalog.platformFilters': 'Platform',
    'catalog.priceRange': 'Price Range',
    'catalog.minPrice': 'Min',
    'catalog.maxPrice': 'Max',
    'catalog.applyFilter': 'Apply',
    'catalog.clearFilters': 'Clear All',
    'catalog.inStockOnly': 'In Stock Only',
    'catalog.viewGrid': 'Grid',
    'catalog.viewList': 'List',
    'catalog.fromPrice': 'From',
    'catalog.emptyTitle': 'No Products Found',
    'catalog.emptySubtitle': 'No products currently match this category or filter criteria.',
    'catalog.browseAll': 'Browse All Products',

    // Order Details & Timeline
    'orderDetails.backToOrders': 'Back to Orders',
    'orderDetails.orderNumber': 'Order no.',
    'orderDetails.placedOn': 'Placed on',
    'orderDetails.stageOrderPlaced': 'Order Placed',
    'orderDetails.stagePaymentConfirmed': 'Payment Confirmed',
    'orderDetails.stageFulfillmentCompleted': 'Fulfillment Completed',
    'orderDetails.stageDelivered': 'Digital Product Delivered',
    'orderDetails.totalDelivered': 'Total delivered',
    'orderDetails.viewDetails': 'View details',
    'orderDetails.hideDetails': 'Hide details',
    'orderDetails.customerSupport': 'Customer Support',
    'orderDetails.rateNow': 'Rate now',
    'orderDetails.orderSummary': 'Order summary',
    'orderDetails.subtotal': 'Subtotal',
    'orderDetails.discount': 'Discount',
    'orderDetails.total': 'Total',
    'orderDetails.paymentMethod': 'Payment Method',
    'orderDetails.paymentStatus': 'Payment Status',
    'orderDetails.fulfillmentStatus': 'Fulfillment Status',
    'orderDetails.statusPaid': 'Paid',
    'orderDetails.statusPending': 'Pending',
    'orderDetails.statusFailed': 'Failed',
    'orderDetails.statusRefunded': 'Refunded',
    'orderDetails.statusCompleted': 'Completed',
    'orderDetails.statusProcessing': 'Processing',
    'orderDetails.awaitingPayment': 'Awaiting Payment Confirmation',
    'orderDetails.boughtBy': 'Bought by',
    'orderDetails.testOrderNotice': 'TEST ORDER — NO REAL PAYMENT',
    'orderDetails.activationGuide': 'Activation Guide',
    'orderDetails.region': 'Region',
    'orderDetails.platform': 'Platform',
    'orderDetails.copyKey': 'Copy Key',
    'orderDetails.revealKey': 'Reveal Key',
    'orderDetails.copied': 'Copied!',
    'orderDetails.timelineHistory': 'Order Timeline History',
    'orderDetails.orderNotFound': 'Order Not Found',
    'orderDetails.orderNotFoundDesc': 'We could not find this order or you do not have permission to view it.',

    'trust.instantDelivery': 'Automated Key Delivery',
    'trust.instantDeliveryDesc': 'Automated digital license issuance upon payment clearance.',
    'trust.genuineProducts': '100% Genuine Keys',
    'trust.genuineProductsDesc': 'Authorized distribution directly from trusted publishers.',
    'trust.securePayment': 'PCI-Grade Security',
    'trust.securePaymentDesc': 'AES-256 encrypted checkout with Stripe & local gateways.',
    'trust.support': 'Dedicated Support Desk',
    'trust.supportDesc': 'Assistance ready to resolve activation questions within 1 business day.',

    'hero.badge': 'OFFICIAL DIGITAL GAMING MARKETPLACE',
    'hero.title': 'AUTHENTIC KEYS. INSTANT VAULT.',
    'hero.subtitle': 'Power your gaming library with verified activation licenses for Steam, PlayStation, Xbox, and Epic Games.',
    'hero.tagline': 'Your Digital Gaming Universe',
    'hero.exploreStore': 'Browse All Games',
    'hero.flashDeals': 'Flash Discounts',
    'hero.verifiedKeys': '100% Authorized & Guaranteed',
    'home.featured': 'Featured Releases',
    'home.featuredDesc': 'Handpicked blockbusters and anticipated digital releases.',
    'home.trending': 'Trending Now',
    'home.categories': 'Popular Categories',
    'home.topPicks': 'Gamer Top Picks',
    'home.platformShortcuts': 'Select by Platform',
    'home.weekendPromo': 'WEEKEND MEGA DEALS',
    'home.weekendPromoDesc': 'Save up to 75% on top-tier RPGs, Action, and Open World adventures.',
    'home.shopNow': 'Shop The Sale',
    'home.viewAll': 'View All',

    'store.title': 'Digital Store & Game Catalog',
    'store.subtitle': 'Explore authentic activation keys, DLCs, subscriptions, and gaming gift cards.',
    'store.allPlatforms': 'All Platforms',
    'store.allGenres': 'All Genres',
    'store.allTypes': 'All Types',
    'store.allRegions': 'All Regions',
    'store.inStockOnly': 'In Stock Only',
    'store.sortBy': 'Sort By',
    'store.sortFeatured': 'Featured',
    'store.sortPriceAsc': 'Price: Low to High',
    'store.sortPriceDesc': 'Price: High to Low',
    'store.sortNewest': 'Newest Releases',
    'store.sortTitle': 'Alphabetical (A-Z)',
    'store.addToCart': 'Add to Cart',
    'store.buyNow': 'Buy Now',
    'store.added': 'Added to Cart',
    'store.inStock': 'In Stock',
    'store.fewLeft': 'Few Keys Left',
    'store.outOfStock': 'Out of Stock',
    'store.instantKey': 'Instant Key',
    'store.filters': 'Filter Catalog',
    'store.clearFilters': 'Clear Filters',
    'store.noResults': 'No games match your filters',
    'store.noResultsDesc': 'Try selecting a different genre or clearing current filters.',

    'profilePage.title': 'Gamer Command Center',
    'profilePage.overview': 'Overview',
    'profilePage.orders': 'Orders & Vault',
    'profilePage.vault': 'Key Vault',
    'profilePage.wishlist': 'My Wishlist',
    'profilePage.wallet': 'Wallet & Balance',
    'profilePage.security': 'Security & Login',
    'profilePage.pin': 'Security PIN',
    'profilePage.mfa': 'Two-Factor (2FA)',
    'profilePage.discord': 'Discord Link',
    'profilePage.support': 'Customer Support',
    'profilePage.logout': 'Sign Out',
    'profilePage.statsOrders': 'Total Orders',
    'profilePage.statsKeys': 'Vault Keys',
    'profilePage.statsWishlist': 'Wishlist Items',
    'profilePage.statsWallet': 'Wallet Balance',
    'profilePage.personalInfo': 'Account Information',
    'profilePage.fullName': 'Full Name',
    'profilePage.email': 'Email Address',
    'profilePage.role': 'Account Role',
    'profilePage.registeredSince': 'Member Since',
    'profilePage.editProfile': 'Edit Profile',
    'profilePage.changePassword': 'Change Password',
    'profilePage.currentPassword': 'Current Password',
    'profilePage.newPassword': 'New Password',
    'profilePage.confirmPassword': 'Confirm Password',
    'profilePage.saveChanges': 'Save Changes',
    'profilePage.activeSessions': 'Active Sessions',
    'profilePage.revealKey': 'Reveal Key',
    'profilePage.hideKey': 'Hide Key',
    'profilePage.copyKey': 'Copy Key',
    'profilePage.copied': 'Copied!',
    'profilePage.discordConnected': 'Discord Connected',
    'profilePage.discordNotConnected': 'Discord Not Connected',
    'profilePage.discordConnectBtn': 'Link Discord Account',
    'profilePage.discordDisconnectBtn': 'Unlink Discord',
    'profilePage.walletBalance': 'Current Balance',
    'profilePage.walletTopUp': 'Top Up Funds',
    'profilePage.walletHistory': 'Transaction History',
    'profilePage.noTransactions': 'No wallet transactions yet.',

    'support.title': 'VORTEX Gamer Support',
    'support.subtitle': 'Instant assistance with keys, orders & payments',
    'support.statusOnline': 'Dedicated Support Desk • Replies within 1 business day',
    'support.inputPlaceholder': 'Type your message or inquiry...',
    'support.send': 'Send',
    'support.emptyHistory': 'No messages yet. Send a message to start a conversation with VORTEX support.',
    'support.welcomeMsg': 'Welcome to VORTEX Gaming Support! How can we assist with your order, activation, or payment today?',
    'support.guestEmailPrompt': 'Enter your contact email to receive support replies:',
    'support.subjectPlaceholder': 'Topic (e.g. Key Activation, Order Status, Payment)',
    'support.soundToggle': 'Sound Alerts',
    'support.openChat': 'Live Support',
    'support.closeChat': 'Close Support',
    'support.ticketCreated': 'Ticket received. Our support team will follow up promptly.',

    'footer.tagline': 'The premier digital entertainment marketplace providing authentic, lawful activation codes and keys for PC and console gamers worldwide with automated instant delivery.',
    'footer.supportEmailLabel': 'Support & Inquiries:',
    'footer.quickLinks': 'Quick Links',
    'footer.aboutUs': 'About Us',
    'footer.store': 'Store / Catalog',
    'footer.contact': 'Contact Support',
    'footer.faq': 'FAQ & Activation',
    'footer.support': 'Help Center',
    'footer.account': 'My Account',
    'footer.services': 'Our Services',
    'footer.gameKeys': 'Digital Game Keys',
    'footer.giftCards': 'Gaming Gift Cards',
    'footer.topUps': 'Gaming Top-Ups',
    'footer.subscriptions': 'Subscriptions & Passes',
    'footer.pcGames': 'PC Games Hub',
    'footer.consoleGames': 'Console Games',
    'footer.newsletterTitle': 'VIP Flash Deals',
    'footer.newsletterDesc': 'Subscribe to receive publisher discounts, weekend promotions, and instant price-drop alerts.',
    'footer.emailPlaceholder': 'Enter your gamer email...',
    'footer.subscribeBtn': 'Subscribe',
    'footer.subscribing': 'Subscribing...',
    'footer.subscribedSuccess': 'Subscription confirmed! You will receive future publisher discounts and price-drop notifications.',
    'footer.consentLabel': 'I agree to receive gaming deals, product releases, and discounts.',
    'footer.trustSecureCheckout': '256-Bit SSL Checkout',
    'footer.trustDataEncryption': 'AES-256-GCM Key Vault',
    'footer.trustSupport': 'Dedicated Support Desk',
    'footer.trustInstantDelivery': 'Automated Key Release (On Clearance)',
    'footer.paymentMethods': 'Supported Payment Methods:',
    'footer.paymentLive': 'Card Gateway (Sandbox/Test)',
    'footer.paymentSandbox': 'Sandbox Test Mode',
    'footer.paymentSandboxNotice': 'Regional Iraqi payment methods (FIB, FastPay, Qi Card) are in sandbox testing mode and disabled for real financial charges.',
    'footer.privacy': 'Privacy Policy',
    'footer.refundPolicy': 'Refund Policy',
    'footer.terms': 'Terms of Service',
    'footer.backToTop': 'Back to Top',
    'footer.copyright': '© 2026 VORTEX GAMING Marketplace. All rights reserved. All trademarks belong to their respective owners.',
  },

  // ── KURDISH SORANI (کوردی سۆرانی) ───────────────────────────────────────
  ku: {
    'nav.home': 'سەرەتا',
    'nav.store': 'فرۆشگا',
    'nav.deals': 'داشکاندنەکان',
    'nav.platforms': 'پلاتفۆرمەکان',
    'nav.support': 'پشتیوانی',
    'nav.search': 'گەڕان',
    'nav.searchPlaceholder': 'گەڕان بۆ یارییەکان، کۆدەکان، کارتی دیاری...',
    'nav.account': 'هەژمارەکەم',
    'nav.vault': 'خەزێنەی کلیلی دیجیتاڵی',
    'nav.orders': 'داواکارییەکانم',
    'nav.wishlist': 'ئارەزووەکان',
    'nav.cart': 'سەبەتە',
    'nav.login': 'چوونەژوورەوە',
    'nav.register': 'خۆتۆمارکردن',
    'nav.logout': 'دەرچوون',
    'nav.admin': 'ناوەندی بەڕێوەبەر',

    'nav.allProducts': 'هەموو بەرهەمەکان',
    'nav.games': 'یارییەکان',
    'nav.giftCards': 'کارتەکانی دیاری',
    'nav.itunes': 'ئایتونس',
    'nav.subscriptions': 'بەشداریکردنەکان',
    'nav.gameAccounts': 'هەژمارەکانی یاری',
    'nav.pcGames': 'یارییەکانی کۆمپیوتەر',
    'nav.topUps': 'بارگاویکردنەوە',

    'catalog.categories': 'پۆلەکان',
    'catalog.platformFilters': 'پلاتفۆرم',
    'catalog.priceRange': 'مەودای نرخ',
    'catalog.minPrice': 'کەمترین',
    'catalog.maxPrice': 'زۆرترین',
    'catalog.applyFilter': 'جێبەجێکردن',
    'catalog.clearFilters': 'پاککردنەوە',
    'catalog.inStockOnly': 'تەنها لە کۆگادا هەیە',
    'catalog.viewGrid': 'تۆڕ',
    'catalog.viewList': 'لیست',
    'catalog.fromPrice': 'لە',
    'catalog.emptyTitle': 'هیچ بەرهەمێک نەدۆزرایەوە',
    'catalog.emptySubtitle': 'لە ئێستادا هیچ بەرهەمێک لەم پۆلە یان بەپێی ئەم فلتەرە بەردەست نییە.',
    'catalog.browseAll': 'سەردانی هەموو بەرهەمەکان بکە',

    // Order Details & Timeline
    'orderDetails.backToOrders': 'گەڕانەوە بۆ داواکارییەکان',
    'orderDetails.orderNumber': 'ژمارەی داواکاری',
    'orderDetails.placedOn': 'داواکراوە لە',
    'orderDetails.stageOrderPlaced': 'داواکاری تۆمارکرا',
    'orderDetails.stagePaymentConfirmed': 'پارەدان پشتڕاستکرایەوە',
    'orderDetails.stageFulfillmentCompleted': 'ئامادەکردن تەواوبوو',
    'orderDetails.stageDelivered': 'بەرهەمی دیجیتاڵی گەیشت',
    'orderDetails.totalDelivered': 'کۆی گەیەندراو',
    'orderDetails.viewDetails': 'بینینی وردەکارییەکان',
    'orderDetails.hideDetails': 'شاردنەوەی وردەکارییەکان',
    'orderDetails.customerSupport': 'پشتیوانی کڕیار',
    'orderDetails.rateNow': 'هەڵسەنگاندن',
    'orderDetails.orderSummary': 'کورتەی داواکاری',
    'orderDetails.subtotal': 'کۆی بەشەکی',
    'orderDetails.discount': 'داشکاندن',
    'orderDetails.total': 'کۆی گشتی',
    'orderDetails.paymentMethod': 'شێوازی پارەدان',
    'orderDetails.paymentStatus': 'دۆخی پارەدان',
    'orderDetails.fulfillmentStatus': 'دۆخی گەیاندن',
    'orderDetails.statusPaid': 'دراوە',
    'orderDetails.statusPending': 'چاوەڕوانکراو',
    'orderDetails.statusFailed': 'سەرکەوتوو نەبوو',
    'orderDetails.statusRefunded': 'گەڕێنراوەتەوە',
    'orderDetails.statusCompleted': 'تەواوبوو',
    'orderDetails.statusProcessing': 'لە قۆناغی کارپێکردندایە',
    'orderDetails.awaitingPayment': 'چاوەڕوانی پشتڕاستکردنەوەی پارەدانە',
    'orderDetails.boughtBy': 'کڕدراوە لەلایەن',
    'orderDetails.testOrderNotice': 'داواکاری تاقیکاری — هیچ پارەدانێکی ڕاستەقینە نییە',
    'orderDetails.activationGuide': 'ڕێبەری کاراکردن',
    'orderDetails.region': 'ناوچە',
    'orderDetails.platform': 'پلاتفۆرم',
    'orderDetails.copyKey': 'کۆپیکردنی کۆد',
    'orderDetails.revealKey': 'نیشاندانی کۆد',
    'orderDetails.copied': 'کۆپیکرا!',
    'orderDetails.timelineHistory': 'مێژووی داواکاری بە کات',
    'orderDetails.orderNotFound': 'داواکاری نەدۆزرایەوە',
    'orderDetails.orderNotFoundDesc': 'داواکارییەکە نەدۆزرایەوە یان مۆڵەتی بینینت نییە.',

    'trust.instantDelivery': 'گەیاندنی خۆکارانە',
    'trust.instantDeliveryDesc': 'دابینکردنی کلیلی دیجیتاڵی لەگەڵ پشتڕاستبوونەوەی پارەدان.',
    'trust.genuineProducts': '١٠٠٪ کلیلی ڕەسەن',
    'trust.genuineProductsDesc': 'دابەشکردنی ڕێگەپێدراو لە کۆمپانیا باوەڕپێکراوەکان.',
    'trust.securePayment': 'پارەدانی پارێزراو',
    'trust.securePaymentDesc': 'سیستەمی پارێزراوی AES-256 و ستانداردە جیهانییەکان.',
    'trust.support': 'مێزی پشتیوانی تایبەت',
    'trust.supportDesc': 'تیمی پشتیوانی وەڵامی پرسیارەکان دەداتەوە لە ماوەی یەک ڕۆژی کارکردندا.',

    'hero.badge': 'فرۆشگای فەرمی دیجیتاڵی یارییەکان',
    'hero.title': 'کلیلی باوەڕپێکراو. خەزێنەی دەستبەجێ.',
    'hero.subtitle': 'یارییە دڵخوازەکانت بە کلیل و کۆدی ڕەسەن بۆ Steam, PlayStation, Xbox, و Epic Games بەدەستبهێنە.',
    'hero.tagline': 'گەردوونی یارییە دیجیتاڵییەکانت',
    'hero.exploreStore': 'بینینی هەموو یارییەکان',
    'hero.flashDeals': 'داشکاندنی خێرا',
    'hero.verifiedKeys': '١٠٠٪ گەرەنتی کراو',
    'home.featured': 'یارییە هەڵبژێردراوەکان',
    'home.featuredDesc': 'بەهێزترین و نوێترین یارییە دیجیتاڵییەکان.',
    'home.trending': 'پڕفرۆشترینەکان',
    'home.categories': 'بەشە باوەکان',
    'home.topPicks': 'هەڵبژاردەی یاریزانان',
    'home.platformShortcuts': 'پلاتفۆرمەکان',
    'home.weekendPromo': 'داشکاندنی تایبەتی کۆتایی هەفتە',
    'home.weekendPromoDesc': 'داشکاندن تا ٧٥٪ بۆ باشترین یارییە ئەکشن و جیهان کراوەکان.',
    'home.shopNow': 'ئێستا بکڕە',
    'home.viewAll': 'هەموو ببینە',

    'store.title': 'فرۆشگای دیجیتاڵی و کەتەلۆگ',
    'store.subtitle': 'گەڕان بەناو کلیلە ڕەسەنەکان، پاکێجەکان، و کارتەکانی دیاری.',
    'store.allPlatforms': 'هەموو پلاتفۆرمەکان',
    'store.allGenres': 'هەموو ژانرەکان',
    'store.allTypes': 'هەموو جۆرەکان',
    'store.allRegions': 'هەموو ناوچەکان',
    'store.inStockOnly': 'تەنها ئەوانەی بەردەستن',
    'store.sortBy': 'ڕیزکردن بەپێی',
    'store.sortFeatured': 'هەڵبژێردراو',
    'store.sortPriceAsc': 'نرخ: کەم بۆ زۆر',
    'store.sortPriceDesc': 'نرخ: زۆر بۆ کەم',
    'store.sortNewest': 'نوێترینەکان',
    'store.sortTitle': 'پیتەکان (ئ-ی)',
    'store.addToCart': 'زیادکردن بۆ سەبەتە',
    'store.buyNow': 'ئێستا بکڕە',
    'store.added': 'زیادکرا بۆ سەبەتە',
    'store.inStock': 'بەردەستە',
    'store.fewLeft': 'چەند دانەیەکی کەم ماوە',
    'store.outOfStock': 'تەواو بووە',
    'store.instantKey': 'کلیلی دەستبەجێ',
    'store.filters': 'فلتەرکردن',
    'store.clearFilters': 'سڕینەوەی فلتەرەکان',
    'store.noResults': 'هیچ یارییەک نەدۆزرایەوە',
    'store.noResultsDesc': 'تکایە فلتەرەکان بگۆڕە یان سڕینەوە ئەنجام بدە.',

    'profilePage.title': 'ناوەندی کۆنتڕۆڵی یاریزان',
    'profilePage.overview': 'پوختە',
    'profilePage.orders': 'داواکاری و خەزێنە',
    'profilePage.vault': 'خەزێنەی کلیلەکان',
    'profilePage.wishlist': 'لیستی ئارەزووەکان',
    'profilePage.wallet': 'جزدان و باڵانس',
    'profilePage.security': 'پاراستن و نهێنوشە',
    'profilePage.pin': 'پینی پاراستن',
    'profilePage.mfa': 'سەلماندنی دووانەیی (2FA)',
    'profilePage.discord': 'پەیوەستکردنی دیسکۆرد',
    'profilePage.support': 'پشتیوانی بەکارهێنەر',
    'profilePage.logout': 'دەرچوون',
    'profilePage.statsOrders': 'کۆی داواکارییەکان',
    'profilePage.statsKeys': 'کلیلە چالاکەکان',
    'profilePage.statsWishlist': 'ئارەزووەکان',
    'profilePage.statsWallet': 'باڵانسی جزدان',
    'profilePage.personalInfo': 'زانیاری هەژمار',
    'profilePage.fullName': 'ناوی تەواو',
    'profilePage.email': 'ئیمەیڵ',
    'profilePage.role': 'پلەی هەژمار',
    'profilePage.registeredSince': 'ئەندامە لەوەتەی',
    'profilePage.editProfile': 'دەستکاری پڕۆفایل',
    'profilePage.changePassword': 'گۆڕینی نهێنوشە',
    'profilePage.currentPassword': 'نهێنوشەی ئێستا',
    'profilePage.newPassword': 'نهێنوشەی نوێ',
    'profilePage.confirmPassword': 'دووبارەکردنەوەی نهێنوشە',
    'profilePage.saveChanges': 'پاشەکەوتکردنی گۆڕانکاری',
    'profilePage.activeSessions': 'ئامێرە چالاکەکان',
    'profilePage.revealKey': 'پیشاندانی کلیل',
    'profilePage.hideKey': 'شاردنەوەی کلیل',
    'profilePage.copyKey': 'کۆپیکردنی کلیل',
    'profilePage.copied': 'کۆپیکرا!',
    'profilePage.discordConnected': 'دیسکۆرد پەیوەستکراوە',
    'profilePage.discordNotConnected': 'دیسکۆرد پەیوەست نەکراوە',
    'profilePage.discordConnectBtn': 'پەیوەستکردنی هەژماری دیسکۆرد',
    'profilePage.discordDisconnectBtn': 'لابردنی دیسکۆرد',
    'profilePage.walletBalance': 'باڵانسی ئێستا',
    'profilePage.walletTopUp': 'زیادکردنی باڵانس',
    'profilePage.walletHistory': 'مێژووی مامەڵەکان',
    'profilePage.noTransactions': 'هیچ مامەڵەیەک تۆمار نەکراوە.',

    'support.title': 'پشتیوانی یاریزانانی VORTEX',
    'support.subtitle': 'وەڵامدانەوەی خێرا بۆ کلیل و داواکارییەکان',
    'support.statusOnline': 'مێزی پشتیوانی • وەڵامدانەوە: لە ماوەی یەک ڕۆژی کارکردندا',
    'support.inputPlaceholder': 'پەیامەکەت بنووسە...',
    'support.send': 'ناردن',
    'support.emptyHistory': 'هیچ پەیامێک نییە. پەیام بنێرە بۆ گفتوگۆ لەگەڵ پشتیوانی.',
    'support.welcomeMsg': 'بەخێربێن بۆ پشتیوانی VORTEX! چۆن دەتوانین یارمەتیت بدەین لە کلیل و داواکارییەکانت؟',
    'support.guestEmailPrompt': 'ئیمەیڵەکەت بنووسە بۆ وەرگرتنی وەڵام:',
    'support.subjectPlaceholder': 'بابەت (وەک: چالاککردنی کلیل، کێشەی پارەدان)',
    'support.soundToggle': 'دەنگی ئاگادارکردنەوە',
    'support.openChat': 'پشتیوانی ڕاستەوخۆ',
    'support.closeChat': 'داخستن',
    'support.ticketCreated': 'داواکارییەکەت گەیشت، بە زووترین کات وەڵامت دەدەینەوە.',

    'footer.tagline': 'بازاڕی پێشەنگی کات بەسەربردنی دیجیتاڵی کە کۆدی چالاککردنی ڕەسەن و یاسایی بۆ یاریزانانی کۆمپیوتەر و کۆنسۆڵ لە سەرانسەری جیهان دابین دەکات.',
    'footer.supportEmailLabel': 'پەیوەندی و پشتیوانی:',
    'footer.quickLinks': 'بەستەرە خێراکان',
    'footer.aboutUs': 'دەربارەی ئێمە',
    'footer.store': 'فرۆشگا / کەتەلۆگ',
    'footer.contact': 'پەیوەندی بە پشتیوانی',
    'footer.faq': 'پرسیارە باوەکان و چالاککردن',
    'footer.support': 'ناوەندی یارمەتی',
    'footer.account': 'هەژماری من',
    'footer.services': 'خزمەتگوزارییەکانمان',
    'footer.gameKeys': 'کلیلی دیجیتاڵی یارییەکان',
    'footer.giftCards': 'کارتەکانی دیاری یاری',
    'footer.topUps': 'باڵانس و پڕکردنەوەی یاری',
    'footer.subscriptions': 'بەشداریکردن و پاسەکان',
    'footer.pcGames': 'یارییەکانی کۆمپیوتەر',
    'footer.consoleGames': 'یارییەکانی کۆنسۆڵ',
    'footer.newsletterTitle': 'داشکاندنە خێراکان',
    'footer.newsletterDesc': 'بەشداربە بۆ وەرگرتنی داشکاندنەکانی کۆتایی هەفتە و ئاگاداری دابەزینی نرخ لە بڵاوکەرەوەکانەوە.',
    'footer.emailPlaceholder': 'ئیمەیڵەکەت بنووسە...',
    'footer.subscribeBtn': 'بەشداربە',
    'footer.subscribing': 'جێبەجێدەکرێت...',
    'footer.subscribedSuccess': 'بەشداریکردنەکەت پشتڕاستکرایەوە! ئاگادارییەکانی داشکاندن و دابەزینی نرخ وەردەگریت.',
    'footer.consentLabel': 'ڕازیم بە وەرگرتنی هەواڵ و ئۆفەری تایبەتی یارییەکان.',
    'footer.trustSecureCheckout': 'پارەدانی پارێزراوی 256-Bit SSL',
    'footer.trustDataEncryption': 'خەزێنەی کلیلی AES-256-GCM',
    'footer.trustSupport': 'مێزی پشتیوانی تایبەت',
    'footer.trustInstantDelivery': 'گەیاندنی خۆکارانەی کلیل لەگەڵ پارەدان',
    'footer.paymentMethods': 'ڕێگاکانی پارەدانی پەسەندکراو:',
    'footer.paymentLive': 'دەروازەی کارت (دۆخی تاقیکاری)',
    'footer.paymentSandbox': 'دۆخی تاقیکاری ساندبۆکس',
    'footer.paymentSandboxNotice': 'ڕێگاکانی پارەدانی عێراقی (FIB, FastPay, Qi Card) لە دۆخی تاقیکاریدان و پارەدانی ڕاستەقینە ناچالاک کراوە تا تەواوبوونی فەرمی.',
    'footer.privacy': 'سیاسەتی پاراستنی نهێنی',
    'footer.refundPolicy': 'سیاسەتی گەڕاندنەوە',
    'footer.terms': 'مەرجەکانی خزمەتگوزاری',
    'footer.backToTop': 'بگەڕێوە سەرەوە',
    'footer.copyright': '© 2026 بازاڕی VORTEX GAMING. هەموو مافەکان پارێزراون. هەموو نیشانە بازرگانییەکان هی خاوەنەکانیانن.',
  },

  // ── ARABIC (العربية) ───────────────────────────────────────────────────
  ar: {
    'nav.home': 'الرئيسية',
    'nav.store': 'المتجر',
    'nav.deals': 'العروض',
    'nav.platforms': 'المنصات',
    'nav.support': 'الدعم الفني',
    'nav.search': 'بحث',
    'nav.searchPlaceholder': 'ابحث عن الألعاب، المفاتيح، بطاقات الهدايا...',
    'nav.account': 'حسابي',
    'nav.vault': 'خزنة المفاتيح الرقمية',
    'nav.orders': 'طلباتي',
    'nav.wishlist': 'المفضلة',
    'nav.cart': 'السلة',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'إنشاء حساب',
    'nav.logout': 'تسجيل الخروج',
    'nav.admin': 'لوحة الإدارة',

    'nav.allProducts': 'جميع المنتجات',
    'nav.games': 'الألعاب',
    'nav.giftCards': 'بطاقات الهدايا',
    'nav.itunes': 'آيتونز',
    'nav.subscriptions': 'الاشتراكات',
    'nav.gameAccounts': 'حسابات الألعاب',
    'nav.pcGames': 'ألعاب الكمبيوتر',
    'nav.topUps': 'شحن الرصيد',

    'catalog.categories': 'الأقسام',
    'catalog.platformFilters': 'المنصة',
    'catalog.priceRange': 'نطاق السعر',
    'catalog.minPrice': 'الحد الأدنى',
    'catalog.maxPrice': 'الحد الأقصى',
    'catalog.applyFilter': 'تطبيق',
    'catalog.clearFilters': 'مسح الكل',
    'catalog.inStockOnly': 'المتوفر فقط',
    'catalog.viewGrid': 'شبكة',
    'catalog.viewList': 'قائمة',
    'catalog.fromPrice': 'من',
    'catalog.emptyTitle': 'لم يتم العثور على منتجات',
    'catalog.emptySubtitle': 'لا تتوفر منتجات حالياً في هذا القسم أو وفقاً لهذه المعايير.',
    'catalog.browseAll': 'تصفح جميع المنتجات',

    // Order Details & Timeline
    'orderDetails.backToOrders': 'العودة إلى الطلبات',
    'orderDetails.orderNumber': 'رقم الطلب',
    'orderDetails.placedOn': 'تم الطلب في',
    'orderDetails.stageOrderPlaced': 'تم تقديم الطلب',
    'orderDetails.stagePaymentConfirmed': 'تم تأكيد الدفع',
    'orderDetails.stageFulfillmentCompleted': 'اكتمل التجهيز',
    'orderDetails.stageDelivered': 'تم تسليم المنتج الرقمي',
    'orderDetails.totalDelivered': 'إجمالي المسلّم',
    'orderDetails.viewDetails': 'عرض التفاصيل',
    'orderDetails.hideDetails': 'إخفاء التفاصيل',
    'orderDetails.customerSupport': 'دعم العملاء',
    'orderDetails.rateNow': 'تقييم الآن',
    'orderDetails.orderSummary': 'ملخص الطلب',
    'orderDetails.subtotal': 'المجموع الفرعي',
    'orderDetails.discount': 'الخصم',
    'orderDetails.total': 'المجموع الكلي',
    'orderDetails.paymentMethod': 'طريقة الدفع',
    'orderDetails.paymentStatus': 'حالة الدفع',
    'orderDetails.fulfillmentStatus': 'حالة التجهيز',
    'orderDetails.statusPaid': 'مدفوع',
    'orderDetails.statusPending': 'قيد الانتظار',
    'orderDetails.statusFailed': 'فشل',
    'orderDetails.statusRefunded': 'مسترد',
    'orderDetails.statusCompleted': 'مكتمل',
    'orderDetails.statusProcessing': 'قيد المعالجة',
    'orderDetails.awaitingPayment': 'بانتظار تأكيد الدفع',
    'orderDetails.boughtBy': 'تم الشراء بواسطة',
    'orderDetails.testOrderNotice': 'طلب تجريبي — لا يوجد دفع حقيقي',
    'orderDetails.activationGuide': 'دليل التفعيل',
    'orderDetails.region': 'المنطقة',
    'orderDetails.platform': 'المنصة',
    'orderDetails.copyKey': 'نسخ المفتاح',
    'orderDetails.revealKey': 'إظهار المفتاح',
    'orderDetails.copied': 'تم النسخ!',
    'orderDetails.timelineHistory': 'سجل تتبع مراحل الطلب',
    'orderDetails.orderNotFound': 'الطلب غير موجود',
    'orderDetails.orderNotFoundDesc': 'تعذر العثور على هذا الطلب أو ليس لديك إذن للوصول إليه.',

    'trust.instantDelivery': 'تسليم آلي ومباشر',
    'trust.instantDeliveryDesc': 'إصدار المفتاح الرقمي آلياً بمجرد تأكيد وتخليص الدفع.',
    'trust.genuineProducts': 'مفاتيح أصلية ١٠٠٪',
    'trust.genuineProductsDesc': 'توزيع معتمد ومباشر من الناشرين الموثوقين.',
    'trust.securePayment': 'دفع آمن ومشفر',
    'trust.securePaymentDesc': 'تشفير AES-256 وحماية متوافقة مع معايير PCI العالمية.',
    'trust.support': 'مكتب دعم متخصص',
    'trust.supportDesc': 'فريق دعم متخصص للإجابة على الاستفسارات خلال يوم عمل واحد.',

    'hero.badge': 'المتجر الرقمي المعتمد للألعاب',
    'hero.title': 'مفاتيح أصلية. تسليم فوري في خزنتك.',
    'hero.subtitle': 'امتلك ألعابك المفضلة بمفاتيح تفعيل أصلية لمنصات Steam و PlayStation و Xbox و Epic Games.',
    'hero.tagline': 'عالم ألعابك الرقمية الموثوق',
    'hero.exploreStore': 'تصفح جميع الألعاب',
    'hero.flashDeals': 'تخفيضات سريعة',
    'hero.verifiedKeys': 'مفاتيح أصلية ومضمونة ١٠٠٪',
    'home.featured': 'ألعاب مختارة',
    'home.featuredDesc': 'أحدث وأقوى الألعاب الرقمية المتوفرة الآن.',
    'home.trending': 'الأكثر طلباً',
    'home.categories': 'الفئات الشائعة',
    'home.topPicks': 'مختارات اللاعبين',
    'home.platformShortcuts': 'اختر حسب المنصة',
    'home.weekendPromo': 'عروض نهاية الأسبوع الكبرى',
    'home.weekendPromoDesc': 'خصومات تصل إلى ٧٥٪ على ألعاب الـ RPG والعوالم المفتوحة.',
    'home.shopNow': 'تسوق الآن',
    'home.viewAll': 'عرض الكل',

    'store.title': 'متجر الألعاب الرقمية',
    'store.subtitle': 'استكشف مفاتيح التفعيل المعتمدة والإضافات وبطاقات الهدايا.',
    'store.allPlatforms': 'جميع المنصات',
    'store.allGenres': 'جميع التصنيفات',
    'store.allTypes': 'جميع الأنواع',
    'store.allRegions': 'جميع المناطق',
    'store.inStockOnly': 'المتوفر فقط',
    'store.sortBy': 'ترتيب حسب',
    'store.sortFeatured': 'المميز',
    'store.sortPriceAsc': 'السعر: من الأقل للأعلى',
    'store.sortPriceDesc': 'السعر: من الأعلى للأقل',
    'store.sortNewest': 'الأحدث إصداراً',
    'store.sortTitle': 'أبجدياً (أ-ي)',
    'store.addToCart': 'إضافة إلى السلة',
    'store.buyNow': 'شراء الآن',
    'store.added': 'تمت الإضافة للسلة',
    'store.inStock': 'متوفر',
    'store.fewLeft': 'قطع محدودة متبقية',
    'store.outOfStock': 'نفذت الكمية',
    'store.instantKey': 'مفتاح فوري',
    'store.filters': 'تصفية النتائج',
    'store.clearFilters': 'إلغاء التصفية',
    'store.noResults': 'لا توجد ألعاب مطابقة',
    'store.noResultsDesc': 'يرجى تجربة تصنيف آخر أو إعادة ضبط خيارات التصفية.',

    'profilePage.title': 'مركز قيادة الحساب',
    'profilePage.overview': 'نظرة عامة',
    'profilePage.orders': 'الطلبات والخزنة',
    'profilePage.vault': 'خزنة المفاتيح',
    'profilePage.wishlist': 'قائمة المفضلة',
    'profilePage.wallet': 'المحفظة والرصيد',
    'profilePage.security': 'الأمان وكلمة المرور',
    'profilePage.pin': 'رمز PIN للأمان',
    'profilePage.mfa': 'التحقق الثنائي (2FA)',
    'profilePage.discord': 'ربط ديسكورد',
    'profilePage.support': 'الدعم والمساعدة',
    'profilePage.logout': 'تسجيل الخروج',
    'profilePage.statsOrders': 'إجمالي الطلبات',
    'profilePage.statsKeys': 'المفاتيح النشطة',
    'profilePage.statsWishlist': 'العناصر المفضلة',
    'profilePage.statsWallet': 'رصيد المحفظة',
    'profilePage.personalInfo': 'معلومات الحساب الشخصي',
    'profilePage.fullName': 'الاسم الكامل',
    'profilePage.email': 'البريد الإلكتروني',
    'profilePage.role': 'رتبة الحساب',
    'profilePage.registeredSince': 'عضو منذ',
    'profilePage.editProfile': 'تعديل الحساب',
    'profilePage.changePassword': 'تغيير كلمة المرور',
    'profilePage.currentPassword': 'كلمة المرور الحالية',
    'profilePage.newPassword': 'كلمة المرور الجديدة',
    'profilePage.confirmPassword': 'تأكيد كلمة المرور',
    'profilePage.saveChanges': 'حفظ التعديلات',
    'profilePage.activeSessions': 'الجلسات والأجهزة النشطة',
    'profilePage.revealKey': 'إظهار المفتاح',
    'profilePage.hideKey': 'إخفاء المفتاح',
    'profilePage.copyKey': 'نسخ المفتاح',
    'profilePage.copied': 'تم النسخ!',
    'profilePage.discordConnected': 'ديسكورد متصل',
    'profilePage.discordNotConnected': 'ديسكورد غير متصل',
    'profilePage.discordConnectBtn': 'ربط حساب ديسكورد',
    'profilePage.discordDisconnectBtn': 'إلغاء ربط ديسكورد',
    'profilePage.walletBalance': 'الرصيد الحالي',
    'profilePage.walletTopUp': 'شحن الرصيد',
    'profilePage.walletHistory': 'سجل العمليات',
    'profilePage.noTransactions': 'لا توجد عمليات مسجلة حتى الآن.',

    'support.title': 'دعم مجتمع VORTEX',
    'support.subtitle': 'مساعدة فورية بخصوص المفاتيح والطلبات',
    'support.statusOnline': 'مكتب الدعم • متوسط الرد: خلال يوم عمل واحد',
    'support.inputPlaceholder': 'اكتب رسالتك أو استفسارك هنا...',
    'support.send': 'إرسال',
    'support.emptyHistory': 'لا توجد رسائل سابقة. ابدأ المحادثة مع فريق الدعم الآن.',
    'support.welcomeMsg': 'أهلاً بك في دعم VORTEX Gaming! كيف يمكننا مساعدتك اليوم بخصوص طلباتك أو مفاتيحك؟',
    'support.guestEmailPrompt': 'أدخل بريدك الإلكتروني لتلقي إشعارات الرد:',
    'support.subjectPlaceholder': 'الموضوع (مثال: تفعيل مفتاح، مشكلة دفع، استفسار طلب)',
    'support.soundToggle': 'تنبيهات الصوت',
    'support.openChat': 'الدعم المباشر',
    'support.closeChat': 'إغلاق الدعم',
    'support.ticketCreated': 'تم استلام تذكرتك بنجاح، وسيجيبك فريقنا في أقرب وقت.',

    'footer.tagline': 'السوق الرقمي الرائد للألعاب، يتيح الحصول على مفاتيح وأكواد تفعيل أصلية وقانونية للاعبي أجهزة الحاسوب والمنصات عالمياً مع تسليم فوري وآلي.',
    'footer.supportEmailLabel': 'الدعم والاستفسارات:',
    'footer.quickLinks': 'روابط سريعة',
    'footer.aboutUs': 'من نحن',
    'footer.store': 'المتجر / الكتالوج',
    'footer.contact': 'اتصل بالدعم الفني',
    'footer.faq': 'الأسئلة الشائعة والتفعيل',
    'footer.support': 'مركز المساعدة',
    'footer.account': 'حسابي',
    'footer.services': 'خدماتنا',
    'footer.gameKeys': 'مفاتيح الألعاب الرقمية',
    'footer.giftCards': 'بطاقات الهدايا',
    'footer.topUps': 'شحن ورصيد الألعاب',
    'footer.subscriptions': 'الاشتراكات والبطاقات',
    'footer.pcGames': 'ألعاب الحاسوب الشخصي',
    'footer.consoleGames': 'ألعاب المنصات والكونسول',
    'footer.newsletterTitle': 'عروض الألعاب الخاطفة',
    'footer.newsletterDesc': 'اشترك لتصلك تخفيضات الناشرين، وعروض عطلة نهاية الأسبوع، وتنبيهات هبوط الأسعار فوراً.',
    'footer.emailPlaceholder': 'أدخل بريدك الإلكتروني...',
    'footer.subscribeBtn': 'اشتراك',
    'footer.subscribing': 'جاري التسجيل...',
    'footer.subscribedSuccess': 'تم تأكيد اشتراكك بنجاح! ستتلقى إشعارات التخفيضات وتنبيهات هبوط الأسعار.',
    'footer.consentLabel': 'أوافق على استلام صفقات الألعاب وإشعارات العروض الترويجية.',
    'footer.trustSecureCheckout': 'دفع مشفر 256-Bit SSL',
    'footer.trustDataEncryption': 'خزنة مفاتيح AES-256-GCM',
    'footer.trustSupport': 'مكتب دعم متخصص',
    'footer.trustInstantDelivery': 'تسليم آلي للمفاتيح فور تأكيد الدفع',
    'footer.paymentMethods': 'طرق الدفع المعتمدة:',
    'footer.paymentLive': 'بوابة البطاقات (وضع الاختبار التجريبي)',
    'footer.paymentSandbox': 'وضع الاختبار التجريبي (Sandbox)',
    'footer.paymentSandboxNotice': 'طرق الدفع العراقية المحلية (FIB و FastPay و Qi Card) في وضع الاختبار التجريبي ومعطلة عن المعاملات المالية الحقيقية حتى اكتمال الربط الرسمي.',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.refundPolicy': 'سياسة الاسترجاع',
    'footer.terms': 'شروط الخدمة',
    'footer.backToTop': 'العودة إلى الأعلى',
    'footer.copyright': '© 2026 متجر VORTEX GAMING. جميع الحقوق محفوظة. كافة العلامات التجارية ملك لأصحابها القانونيين.',
  },
};

/**
 * Helper hook / accessor for translation lookups with fallback
 */
export function getTranslation(lang: 'en' | 'ku' | 'ar', key: keyof TranslationDictionary): string {
  const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return dictionary[key] || TRANSLATIONS.en[key] || (key as string);
}
