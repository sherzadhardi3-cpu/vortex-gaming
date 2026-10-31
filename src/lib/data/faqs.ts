// VORTEX GAMING — Authoritative 35 FAQ Knowledge Base Dataset
// Structured across 9 core categories with complete English, Kurdish Sorani, and Arabic translations.
// Dynamic counts, search indexing, and keyword highlighting support.

export interface FAQTranslation {
  q: string;
  a: string;
}

export interface FAQItem {
  id: string;
  categoryId: string;
  categoryName: string;
  order: number;
  en: FAQTranslation;
  ku: FAQTranslation;
  ar: FAQTranslation;
}

export interface FAQCategory {
  id: string;
  slug: string;
  iconName: string;
  accentColor: string;
  en: { name: string; description: string };
  ku: { name: string; description: string };
  ar: { name: string; description: string };
}

export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'orders-delivery',
    slug: 'orders-delivery',
    iconName: 'Package',
    accentColor: '#00d4ff',
    en: { name: 'Orders & Delivery', description: 'Digital key dispatch, fulfillment timelines, and order tracking.' },
    ku: { name: 'داواکاری و گەیاندن', description: 'ناردنی کلیلی دیجیتاڵی، کاتی جێبەجێکردن، و بەدواداچوونی داواکاری.' },
    ar: { name: 'الطلبات والتسليم', description: 'تسليم المفاتيح الرقمية، مواعيد التنفيذ، وتتبع حالة الطلبات.' },
  },
  {
    id: 'game-accounts',
    slug: 'game-accounts',
    iconName: 'Gamepad2',
    accentColor: '#38bdf8',
    en: { name: 'Game Accounts', description: 'Account safety, credential changes, access rights, and warranties.' },
    ku: { name: 'هەژمارەکانی یاری', description: 'پارێزراوی هەژمار، گۆڕینی نهێنوشە، مافەکانی دەستپێگەیشتن و گەرەنتی.' },
    ar: { name: 'حسابات الألعاب', description: 'أمان الحسابات، تغيير كلمات المرور، صلاحيات الوصول، والضمان.' },
  },
  {
    id: 'payments',
    slug: 'payments',
    iconName: 'CreditCard',
    accentColor: '#10b981',
    en: { name: 'Payments', description: 'Supported gateways, transaction security, currencies, and wallet status.' },
    ku: { name: 'پارەدان', description: 'شێوازەکانی پارەدان، پارێزراوی مامەڵەکان، دراوەکان و باری جزدان.' },
    ar: { name: 'المدفوعات', description: 'بوابات الدفع المدعومة، أمان المعاملات، العملات، وحالة المحفظة.' },
  },
  {
    id: 'gift-cards',
    slug: 'gift-cards',
    iconName: 'Gift',
    accentColor: '#a855f7',
    en: { name: 'Gift Cards & Codes', description: 'Platform redemption steps, regional locks, and validity guides.' },
    ku: { name: 'کارتەکانی دیاری و کۆدەکان', description: 'ڕێنمایی چالاککردن لە پلاتفۆرمەکان، سنووردارکردنی ناوچەیی و بەسەرچوون.' },
    ar: { name: 'بطاقات الهدايا والأكواد', description: 'خطوات الشحن في المنصات، القيود الإقليمية، وفترات الصلاحية.' },
  },
  {
    id: 'subscriptions',
    slug: 'subscriptions',
    iconName: 'Sparkles',
    accentColor: '#f59e0b',
    en: { name: 'Subscriptions', description: 'Prepaid gaming passes, stacking rules, and renewal terms.' },
    ku: { name: 'بەشداریکردنەکان', description: 'کارتە پێشەکییەکان، ڕێساکانی کەڵەکەبوون، و مەرجەکانی نوێبوونەوە.' },
    ar: { name: 'الاشتراكات', description: 'الباقات مسبقة الدفع، قواعد التمديد والتراكم، وشروط التجديد.' },
  },
  {
    id: 'account-security',
    slug: 'account-security',
    iconName: 'ShieldCheck',
    accentColor: '#0070f3',
    en: { name: 'Account & Security', description: '2FA protection, delivery security PINs, and personal data encryption.' },
    ku: { name: 'هەژمار و ئاسایش', description: 'پاراستنی 2FA، کۆدی نهێنی گەیاندن، و کۆدکردنی زانیارییە کەسییەکان.' },
    ar: { name: 'الحساب والأمان', description: 'المصادقة الثنائية 2FA، رمز PIN الأمني للتسليم، وتشفير البيانات الشخصية.' },
  },
  {
    id: 'refunds-returns',
    slug: 'refunds-returns',
    iconName: 'RotateCcw',
    accentColor: '#f43f5e',
    en: { name: 'Refunds & Returns', description: 'Digital goods return eligibility, review timelines, and credit routing.' },
    ku: { name: 'گەڕاندنەوەی پارە', description: 'مەرجەکانی گەڕاندنەوەی کاڵای دیجیتاڵی، کاتی پێداچوونەوە و شێوازی گەڕاندنەوە.' },
    ar: { name: 'الاسترداد والإرجاع', description: 'شروط استرجاع المنتجات الرقمية، فترات المراجعة، وطرق إرجاع الأموال.' },
  },
  {
    id: 'technical-support',
    slug: 'technical-support',
    iconName: 'Headphones',
    accentColor: '#06b6d4',
    en: { name: 'Technical Support', description: 'Help desk hours, ticket resolution, and contacting specialist agents.' },
    ku: { name: 'پشتیوانی تەکنیکی', description: 'کاتژمێرەکانی کارکردنی مێزی یارمەتی، بەدواداچوونی داواکاری، و پەیوەندی بە کارمەندان.' },
    ar: { name: 'الدعم الفني', description: 'ساعات عمل مكتب المساعدة، متابعة التذاكر، والتواصل مع الفنيين المختصين.' },
  },
  {
    id: 'other',
    slug: 'other',
    iconName: 'HelpCircle',
    accentColor: '#94a3b8',
    en: { name: 'Other', description: 'Partnership programs, bug reports, and community feature requests.' },
    ku: { name: 'هیتر', description: 'بەرنامەکانی هاوبەشی، ڕاپۆرتکردنی کێشەی تەکنیکی، و پێشنیارەکان.' },
    ar: { name: 'أخرى', description: 'برامج الشراكة، الإبلاغ عن الأخطاء البرمجية، واقتراحات المزايا.' },
  },
];

export const FAQS_DATA: FAQItem[] = [
  // ─── A. Orders & Delivery (6 Questions) ──────────────────────────────────
  {
    id: 'faq_od_1',
    categoryId: 'orders-delivery',
    categoryName: 'Orders & Delivery',
    order: 1,
    en: {
      q: 'How do I receive my order?',
      a: 'Upon verified payment confirmation, digital keys and account credentials are automatically allocated to your VORTEX account under "My Orders". For protected items, enter your 4-6 digit delivery security PIN to decrypt and reveal the credentials. You will also receive an order confirmation receipt via email.',
    },
    ku: {
      q: 'چۆن داواکارییەکەم وەردەگرم؟',
      a: 'دوای پشتڕاستکردنەوەی فەرمی پارەدان، کلیل و هەژمارە دیجیتاڵییەکان بە شێوەیەکی خۆکار بۆ هەژمارەکەت لە بەشی "داواکارییەکانم" تەرخان دەکرێن. بۆ بەرهەمە پارێزراوەکان، تەنها کۆدی PIN ی ٤-٦ ژمارەیی خۆت بنووسە بۆ کردنەوەی کلیلەکان. هەروەها پسوولەی داواکارییەکە بۆ ئیمەیڵەکەت دەنێردرێت.',
    },
    ar: {
      q: 'كيف أستلم طلبي؟',
      a: 'بمجرد تأكيد الدفع بنجاح عبر الخادم، يتم تخصيص المفاتيح الرقمية وبيانات الحساب تلقائياً في حسابك ضمن صفحة "طلباتي". للمنتجات المحمية، أدخل رمز PIN الأمني المكون من 4-6 أرقام لفك التشفير وإظهار البيانات. ستتلقى أيضاً إشعاراً وفاتورة بالبريد الإلكتروني.',
    },
  },
  {
    id: 'faq_od_2',
    categoryId: 'orders-delivery',
    categoryName: 'Orders & Delivery',
    order: 2,
    en: {
      q: 'How long does delivery take?',
      a: 'For in-stock automated digital items, dispatch is typically completed within 60 seconds once payment clearance is received by our server. Manual or high-security orders that require verification are completed within 15–60 minutes.',
    },
    ku: {
      q: 'گەیاندنی داواکاری چەند کات دەخایەنێت؟',
      a: 'بۆ ئەو بەرهەمانەی کە لە کۆگادا بەردەستن و گەیاندنیان خۆکارە، کلیلەکان لە ماوەی ٦٠ چرکەدا لە دوای پەسەندکردنی پارەدان دەگەنە دەستت. ئەو داواکارییانەی کە پێویستیان بە پێداچوونەوەی دەستی یان ئەمنییە، لە ماوەی ١٥ تا ٦٠ خولەکدا تەواو دەکرێن.',
    },
    ar: {
      q: 'كم يستغرق استلام الطلب؟',
      a: 'بالنسبة للمنتجات الرقمية الفورية المتوفرة في المخزون، يكتمل التسليم عادةً خلال 60 ثانية بمجرد تأكيد الدفع عبر الخادم. أما الطلبات التي تتطلب مراجعة أمنية أو تحققاً يدوياً فتكتمل خلال 15 إلى 60 دقيقة.',
    },
  },
  {
    id: 'faq_od_3',
    categoryId: 'orders-delivery',
    categoryName: 'Orders & Delivery',
    order: 3,
    en: {
      q: 'What is the difference between instant and manual delivery?',
      a: 'Instant delivery items are processed by our automated AES-256-GCM inventory vault and delivered immediately after webhook payment clearance. Manual delivery items (such as custom account setup or bulk enterprise orders) undergo fraud and safety checks by our team before release.',
    },
    ku: {
      q: 'جیاوازی چییە لە نێوان گەیاندنی دەستبەجێ و گەیاندنی دەستی؟',
      a: 'بەرهەمە دەستبەجێیەکان لە ڕێگەی خەزێنەی کۆدکراوی AES-256-GCM بە شێوەیەکی خۆکار و ڕاستەوخۆ دوای سەلماندنی پارەدان دەدرێن. بەرهەمە دەستییەکان (وەک ڕێکخستنی هەژماری تایبەت یان داواکارییە گەورەکان) لەلایەن تیمەکەمانەوە پشکنینی ئەمنییان بۆ دەکرێت پێش ناردن.',
    },
    ar: {
      q: 'ما هو الفرق بين التسليم الفوري والتسليم اليدوي؟',
      a: 'المنتجات ذات التسليم الفوري تتم معالجتها وتخصيصها عبر خزنتنا الرقمية المشفرة بـ AES-256-GCM فور تأكيد الدفع تلقائياً. أما التسليم اليدوي (مثل تجهيز الحسابات الخاصة أو طلبات الجملة) فيخضع لتدقيق أمني واحترازي من فريق الدعم قبل الإرسال.',
    },
  },
  {
    id: 'faq_od_4',
    categoryId: 'orders-delivery',
    categoryName: 'Orders & Delivery',
    order: 4,
    en: {
      q: 'Where can I see my order status?',
      a: 'Navigate to "My Account" → "My Orders" or visit /account/orders/[orderId]. Each order displays a real-time progress timeline (Order Placed → Payment Confirmed → Fulfillment Processing → Digital Product Delivered).',
    },
    ku: {
      q: 'لە کوێ دەتوانم دۆخی داواکارییەکەم ببینم؟',
      a: 'بڕۆ بۆ بەشی "هەژمارەکەم" ← "داواکارییەکانم" یان سەردانی پەڕەی تایبەتی داواکارییەکەت بکە. لەوێ هێڵی کاتی ڕاستەقینەی پێشکەوتنی داواکارییەکەت دەبینیت (داواکراو ← پارەدان سەلمێنراو ← جێبەجێکردن ← بەرهەمی دیجیتاڵی گەیەندراو).',
    },
    ar: {
      q: 'أين يمكنني متابعة حالة طلبي؟',
      a: 'توجه إلى "حسابي" ← "طلباتي" أو افتح صفحة الطلب المحددة. ستجد جدولاً زمنياً تفاعلياً يوضح مراحل الطلب بدقة (تم تقديم الطلب ← تم تأكيد الدفع ← جارٍ التنفيذ ← تم تسليم المنتج الرقمي).',
    },
  },
  {
    id: 'faq_od_5',
    categoryId: 'orders-delivery',
    categoryName: 'Orders & Delivery',
    order: 5,
    en: {
      q: 'Why is my order status showing processing?',
      a: 'Status shows "Processing" while the payment gateway is clearing the transaction or our automated vault is allocating your unique activation key. If status remains processing for more than 15 minutes, please open a Support Ticket with your Order Number.',
    },
    ku: {
      q: 'بۆچی دۆخی داواکارییەکەم بە "لە جێبەجێکردندایە" پیشان دەدرێت؟',
      a: 'دۆخی "لە جێبەجێکردندایە" بەو مانایەیە کە دەروازەی پارەدان سەرقاڵی تەواوکردنی مامەڵەکەیە یان خەزێنە خەریکی تەرخانکردنی کلیلی بێهاوتایە بۆت. ئەگەر لە ١٥ خولەک زیاتری خایاند، تکایە تیکتێکی پشتیوانی بە ژمارەی داواکارییەکەت بنێرە.',
    },
    ar: {
      q: 'لماذا تظهر حالة طلبي "قيد المعالجة"؟',
      a: 'تعني حالة "قيد المعالجة" أن بوابة الدفع تقوم بإنهاء التحقق المالي أو أن الخزنة الآلية تعمل على تخصيص مفتاحك المشفر. إذا استمرت الحالة أكثر من 15 دقيقة، يُرجى فتح تذكرة دعم وإرفاق رقم الطلب.',
    },
  },
  {
    id: 'faq_od_6',
    categoryId: 'orders-delivery',
    categoryName: 'Orders & Delivery',
    order: 6,
    en: {
      q: 'Can I cancel an order after placing it?',
      a: 'Unpaid orders in "Pending" status can be cancelled at any time from your order overview. Once payment is confirmed and digital credentials or activation keys are decrypted, cancellations are subject to our Digital Goods Refund Policy.',
    },
    ku: {
      q: 'ئایا دەتوانم داواکارییەکەم هەڵبوەشێنمەوە دوای داواکردنی؟',
      a: 'ئەو داواکارییانەی پارەیان نەدراوە و لە دۆخی "چاوەڕوانکراو"دان، لە هەر کاتێکدا بێت دەتوانیت هەڵیانبوەشێنیتەوە. بەڵام کاتێک پارەدانەکە تەواو بوو و کلیلەکان ئاشکرا کران، هەڵوەشاندنەوە دەکەوێتە ژێر یاسای سیاسەتی گەڕاندنەوەی کاڵا دیجیتاڵییەکان.',
    },
    ar: {
      q: 'هل يمكنني إلغاء الطلب بعد إتمامه؟',
      a: 'الطلبات غير المدفوعة التي لا تزال في حالة "قيد الانتظار" يمكن إلغاؤها في أي وقت من لوحة التحكم. أما بمجرد اكتمال الدفع وفك تشفير المفاتيح الرقمية، فيخضع الإلغاء لسياسة استرداد المنتجات الرقمية الرسمية.',
    },
  },

  // ─── B. Game Accounts (5 Questions) ──────────────────────────────────────
  {
    id: 'faq_ga_1',
    categoryId: 'game-accounts',
    categoryName: 'Game Accounts',
    order: 7,
    en: {
      q: 'Are the game accounts safe to use?',
      a: 'Yes. All game accounts provided through VORTEX GAMING are legitimate and verified by our supply integrity checks. Full credentials (username, password, associated email, and platform portal link) are stored encrypted in our secure vault and accessible only to you via your security PIN.',
    },
    ku: {
      q: 'ئایا هەژمارەکانی یاری پارێزراون بۆ بەکارهێنان؟',
      a: 'بەڵێ. سەرجەم ئەو هەژمارانەی لە ڕێگەی VORTEX GAMING دابین دەکرێن یاسایین و پشکنینی توندیان بۆ دەکرێت. زانیارییەکان (ناوی بەکارهێنەر، نهێنوشە، ئیمەیڵ، و لینکی پلاتفۆرم) بە کۆدکراوی لە خەزێنەی پارێزراودا هەڵدەگیرێن و تەنها لە ڕێگەی کۆدی PIN ی تۆوە دەکرێنەوە.',
    },
    ar: {
      q: 'هل حسابات الألعاب آمنة للاستخدام؟',
      a: 'نعم. جميع حسابات الألعاب الموفرة عبر VORTEX GAMING قانونية وتم التحقق من سلامتها بالكامل. يتم تخزين بيانات تسجيل الدخول (اسم المستخدم، كلمة المرور، البريد المرتبط، ورابط المنصة) مشفرة داخل خزنتنا الآمنة ولا يمكن الوصول إليها إلا عبر رمز PIN الخاص بك.',
    },
  },
  {
    id: 'faq_ga_2',
    categoryId: 'game-accounts',
    categoryName: 'Game Accounts',
    order: 8,
    en: {
      q: 'Can I change the email and password?',
      a: 'For Full Access (FA) accounts, you are provided complete access to change the account password, email, and security questions. For shared or platform-specific access types, credentials must remain as provided in accordance with the specific product guidelines.',
    },
    ku: {
      q: 'ئایا دەتوانم ئیمەیڵ و وشەی نهێنی هەژمارەکە بگۆڕم؟',
      a: 'بۆ هەژمارەکانی دەستپێگەیشتنی تەواو (Full Access)، مافی تەواوت هەیە کە وشەی نهێنی، ئیمەیڵ، و پرسیارە ئەمنییەکان بگۆڕیت. بۆ جۆرە تایبەت یان هاوبەشەکان، پێویستە زانیارییەکان وەک خۆیان بمێننەوە بەپێی ڕێنمایی تایبەتی بەرهەمەکە.',
    },
    ar: {
      q: 'هل يمكنني تغيير البريد الإلكتروني وكلمة المرور؟',
      a: 'بالنسبة لحسابات الوصول الكامل (Full Access)، يُمنح العميل الصلاحية الكاملة لتغيير كلمة المرور والبريد الإلكتروني وإعدادات الأمان. أما بالنسبة للحسابات ذات الاستخدام المحدد أو المشترك، فيجب الإبقاء على البيانات كما هي وفقاً لإرشادات المنتج المرفقة.',
    },
  },
  {
    id: 'faq_ga_3',
    categoryId: 'game-accounts',
    categoryName: 'Game Accounts',
    order: 9,
    en: {
      q: 'What if my account is not working?',
      a: 'If you encounter an incorrect password or login difficulty, submit a Support Ticket within your warranty window. Include your Order Number and a description of the issue. Our agents will verify credentials and issue a replacement or fix.',
    },
    ku: {
      q: 'چی بکەم ئەگەر هەژمارەکە کاری نەکرد؟',
      a: 'ئەگەر کێشەی نەخوێندنەوەی وشەی نهێنی یان نەچوونەژوورەوەت هەبوو، لە ماوەی گەرەنتییەکەدا تیکتێکی پشتیوانی بنێرە. ژمارەی داواکارییەکەت و ڕوونکردنەوەی کێشەکە دابنێ. کارمەندانی ئێمە بە زووترین کات پشکنین دەکەن و هەژمارەکەت بۆ چاک دەکەن یان یەکێکی ترت پێدەدەن.',
    },
    ar: {
      q: 'ماذا أفعل إذا لم يعمل الحساب معي؟',
      a: 'إذا واجهت أي صعوبة في الدخول أو كلمة مرور خاطئة، يرجى فتح تذكرة دعم فني فوراً خلال فترة الضمان المحددة، مع إرفاق رقم الطلب وتفاصيل المشكلة. سيقوم فريقنا بمطابقة البيانات وإصلاح الخلل أو توفير بديل مناسب.',
    },
  },
  {
    id: 'faq_ga_4',
    categoryId: 'game-accounts',
    categoryName: 'Game Accounts',
    order: 10,
    en: {
      q: 'Do you offer a warranty on game accounts?',
      a: 'Yes. VORTEX GAMING provides a warranty period (typically 30 to 90 days depending on the specific product tier) against account reclamation or credential invalidation. Review individual product pages for exact coverage terms.',
    },
    ku: {
      q: 'ئایا گەرەنتی لەسەر هەژمارەکانی یاری هەیە؟',
      a: 'بەڵێ. VORTEX GAMING گەرەنتی (بە گشتی ٣٠ تا ٩٠ ڕۆژ بەپێی جۆری بەرهەمەکە) دابین دەکات دژی لەدەستدانی دەسەڵات یان کێشەی تەکنیکی. دەتوانیت ماوەی ڕاستەقینەی گەرەنتی لە پەڕەی هەر بەرهەمێکدا بخوێنیتەوە.',
    },
    ar: {
      q: 'هل تقدمون ضماناً على حسابات الألعاب؟',
      a: 'نعم. توفر VORTEX GAMING فترة ضمان رسمية (تتراوح عادةً بين 30 إلى 90 يوماً حسب فئة المنتج) ضد انقطاع الخدمة أو استرجاع الحساب. يُرجى مراجعة تفاصيل صفحة المنتج للاطلاع على مدة وشروط الضمان المحددة.',
    },
  },
  {
    id: 'faq_ga_5',
    categoryId: 'game-accounts',
    categoryName: 'Game Accounts',
    order: 11,
    en: {
      q: 'Can I play online with shared or offline accounts?',
      a: 'Offline-mode accounts are strictly designated for single-player campaign gameplay without online multiplayer access. Full-access accounts support standard multiplayer features on their respective platforms (Steam, PlayStation, Xbox, EA) subject to publisher terms of service.',
    },
    ku: {
      q: 'ئایا دەتوانم بە ئۆنلاین یاری بکەم لەگەڵ هەژماری هاوبەش یان ئۆفلاین؟',
      a: 'هەژمارە ئۆفلاینەکان بە تایبەتی بۆ یاری تاکەکەسی (کەمپەین) دیاری کراون و نابێت بۆ ئۆنلاین یان فرە-یاریزان بەکاربهێنرێن. لە کاتێکدا هەژمارە فەرمییەکانی Full-Access هەموو تایبەتمەندییە ئۆنلاینەکانی پلاتفۆرمەکان (وەک Steam, PlayStation, Xbox) لەخۆدەگرن.',
    },
    ar: {
      q: 'هل يمكنني اللعب عبر الإنترنت بالحسابات المشتركة أو وضع عدم الاتصال؟',
      a: 'الحسابات المخصصة لوضع عدم الاتصال (Offline) مخصصة فقط للعب الفردي لطور القصة دون اللعب الجماعي عبر الشبكة. أما حسابات الوصول الكامل فتدعم اللعب الجماعي والتحديثات الرسمية في المنصات المعنية (Steam, PlayStation, Xbox, EA) وفق شروط الناشر.',
    },
  },

  // ─── C. Payments (4 Questions) ───────────────────────────────────────────
  {
    id: 'faq_pm_1',
    categoryId: 'payments',
    categoryName: 'Payments',
    order: 12,
    en: {
      q: 'What payment methods do you accept?',
      a: 'In our staging environment, we support Sandbox testing for FastPay, ZainCash, FIB (First Iraqi Bank), and Stripe Sandbox. In live production, verified regional payment methods and major credit cards (Visa, Mastercard) are supported. You can checkout in USD, IQD, EUR, TRY, SAR, or AED.',
    },
    ku: {
      q: 'چ شێوازێکی پارەدان قبوڵ دەکەن؟',
      a: 'لە ژینگەی تاقیکردنەوەدا، پشتگیری ساندبۆکس دەکەین بۆ FastPay، ZainCash، FIB (بانکی یەکەمی عێراقی)، و Stripe. لە کاتی فەرمیدا، شێوازە ناوخۆیییەکان و کارتە نێودەوڵەتییەکان (Visa, Mastercard) بەردەست دەبن بە دراوەکانی USD, IQD, EUR, TRY, SAR, و AED.',
    },
    ar: {
      q: 'ما هي طرق الدفع المقبولة لديكم؟',
      a: 'في بيئة الاختبار التجريبية الحالية، ندعم محاكاة الدفع عبر FastPay و ZainCash و FIB (مصرف العراق الأول) و Stripe Sandbox. وعند الإطلاق التجاري، سيتم دعم البوابات المعتمدة والبطاقات الائتمانية (Visa, Mastercard) بالعملات: USD, IQD, EUR, TRY, SAR, AED.',
    },
  },
  {
    id: 'faq_pm_2',
    categoryId: 'payments',
    categoryName: 'Payments',
    order: 13,
    en: {
      q: 'Are my payment transactions secure?',
      a: 'All checkouts use 256-bit TLS encryption, cryptographic webhook signature verification, and server-authoritative price validation. VORTEX GAMING never stores sensitive credit card numbers or banking passwords on our servers.',
    },
    ku: {
      q: 'ئایا مامەڵە دارایییەکانم پارێزراون؟',
      a: 'سەرجەم کڕینەکان کۆدکردنی ٢٥٦-بیتی TLS، سەلماندنی واژۆی کریپتۆگرافی Webhook، و پشکنینی ڕاستەوخۆی نرخ لە سێرڤەر بەکاردەهێنن. VORTEX GAMING هەرگیز ژمارەی نهێنی کارتی بانک یان نهێنوشەی ئەکاونتی بانکی تۆمار ناکات.',
    },
    ar: {
      q: 'هل معاملاتي المالية آمنة ومحمية؟',
      a: 'تعتمد جميع عمليات الدفع على تشفير 256-bit TLS عالي الأمان، مع التحقق الرقمي من تواقيع الـ Webhooks واحتساب الأسعار بدقة عبر الخادم فقط. لا تقوم VORTEX GAMING بحفظ أرقام البطاقات الائتمانية الحساسة أو كلمات المرور المصرفية مطلقاً.',
    },
  },
  {
    id: 'faq_pm_3',
    categoryId: 'payments',
    categoryName: 'Payments',
    order: 14,
    en: {
      q: 'What should I do if a payment failed but money was deducted?',
      a: 'If your bank or mobile wallet deducted funds but the order shows "Pending" or "Failed", the funds are typically held temporarily by the payment provider\'s pre-authorization system and auto-reversed within 24–48 hours. If the status does not resolve, open a Support Ticket and attach your transaction reference ID.',
    },
    ku: {
      q: 'چی بکەم ئەگەر پارە لە هەژمارەکەم کەمبوویەوە بەڵام داواکارییەکە سەرکەوتوو نەبوو؟',
      a: 'ئەگەر پارە لە بانک یان جزدانی مۆبایلەکەت بڕدرا بەڵام دۆخی داواکارییەکە سەرنەکەوت، بە زۆری پارەکە وەک بڕی ڕاگیراو (Pre-Auth) لەلایەن سیستەمی بانک دەمێنێتەوە و لە ماوەی ٢٤ تا ٤٨ کاتژمێردا دەگەڕێتەوە. ئەگەر کێشەکە چارەسەر نەبوو، تیکتێکی پشتیوانی بنێرە لەگەڵ ژمارەی ڕێپێدانی مامەڵەکە (Transaction ID).',
    },
    ar: {
      q: 'ماذا أفعل إذا فشلت العملية وتم خصم المبلغ من حسابي؟',
      a: 'إذا خُصم المبلغ من حسابك البنكي أو محفظتك دون أن يكتمل الطلب، فإن المبلغ يكون عادةً معلقاً لدى بوابة الدفع (Pre-authorization) ويُسترجع تلقائياً خلال 24 إلى 48 ساعة. إذا لم يُسترد المبلغ، افتح تذكرة دعم فني وأرفق الرقم المرجعي للعملية (Transaction ID).',
    },
  },
  {
    id: 'faq_pm_4',
    categoryId: 'payments',
    categoryName: 'Payments',
    order: 15,
    en: {
      q: 'How do I top up my VORTEX GAMING Wallet?',
      a: 'Direct on-site wallet balance top-ups are currently in development. You can view your wallet status under "My Account" → "My Wallet". For all store purchases, please checkout directly using our supported payment methods.',
    },
    ku: {
      q: 'چۆن باڵانسی جزدانی VORTEX GAMING پڕبکەمەوە؟',
      a: 'سیستەمی بارگاویکردنی ڕاستەوخۆی باڵانسی جزدان لە قۆناغی پەرەپێداندایە و لە ئێستادا بەردەست نییە. دەتوانیت سەیری باری جزدانەکەت بکەیت لە بەشی "هەژمارەکەم" ← "جزدان". بۆ کڕینی هەر بەرهەمێک، تکایە ڕاستەوخۆ لە ڕێگەی شێوازەکانی تری پارەدان داواکارییەکانت تەواو بکە.',
    },
    ar: {
      q: 'كيف يمكنني شحن رصيد محفظة VORTEX GAMING؟',
      a: 'خدمة الشحن المباشر للمحفظة الإلكترونية قيد التطوير حالياً وغير مفعلة. يمكنك الاطلاع على حالة محفظتك عبر "حسابي" ← "المحفظة". لإتمام أي عملية شراء، يُرجى الدفع مباشرة عبر بوابات الدفع المتاحة في صفحة الدفع.',
    },
  },

  // ─── D. Gift Cards & Codes (4 Questions) ─────────────────────────────────
  {
    id: 'faq_gc_1',
    categoryId: 'gift-cards',
    categoryName: 'Gift Cards & Codes',
    order: 16,
    en: {
      q: 'How do I redeem gift card codes?',
      a: 'Reveal your code in "My Orders", copy the redemption string, and redeem it on the official platform (Steam Client → "+ Add a Game", PlayStation Store → "Redeem Code", Xbox Store → "Redeem", or Apple App Store → "Redeem Gift Card").',
    },
    ku: {
      q: 'چۆن کۆدی کارتی دیاری بەکاربهێنم؟',
      a: 'کۆدەکەت لە بەشی "داواکارییەکانم" ئاشکرا بکە، کۆپی بکە و پاشان لە پلاتفۆرمی فەرمیدا بەکاری بهێنە (لە بەرنامەی Steam بڕۆ بۆ "+ Add a Game"، لە PlayStation Store بڕۆ بۆ "Redeem Code"، یان لە Xbox Store بڕۆ بۆ "Redeem").',
    },
    ar: {
      q: 'كيف أقوم بشحن وتفعيل أكواد بطاقات الهدايا؟',
      a: 'قم بكشف الكود في صفحة "طلباتي" ونسخه، ثم توجه إلى المنصة الرسمية لشحنه (في Steam: اضغط على "+ Add a Game"، في متجر PlayStation: اختر "Redeem Code"، وفي Xbox: اختر "Redeem Code"، أو عبر App Store لأكواد Apple).',
    },
  },
  {
    id: 'faq_gc_2',
    categoryId: 'gift-cards',
    categoryName: 'Gift Cards & Codes',
    order: 17,
    en: {
      q: 'Are digital gift cards region-locked?',
      a: 'Yes. Most digital gift cards (Steam Wallet, PlayStation Network, Xbox, iTunes) are strictly bound to the currency and country of your console/account profile (e.g. US, TR, EU, Global). The region is clearly labeled on every product page before purchase.',
    },
    ku: {
      q: 'ئایا کارتەکانی دیاری سنووردارکردنی ناوچەییان (Region Lock) هەیە؟',
      a: 'بەڵێ. زۆربەی کارتە دیجیتاڵییەکان (وەک Steam Wallet, PlayStation Network, Xbox, iTunes) بە توندی بەستراونەتەوە بە وڵات و دراوی هەژمارەکەتەوە (وەک US، TR، EU یان Global). ناوچەی دروست لەسەر هەموو بەرهەمێک پێش کڕین دیاری کراوە.',
    },
    ar: {
      q: 'هل بطاقات الهدايا الرقمية مقيدة إقليمياً (Region-Locked)؟',
      a: 'نعم. معظم بطاقات الهدايا الرقمية (مثل رصيد Steam و PlayStation و Xbox و iTunes) ترتبط ارتباطاً وثيقاً ببلد وعملة حسابك الأساسي (مثل الأمريكي، التركي، الأوروبي، أو العالمي). يتم توضيح المنطقة والعملة بدقة في صفحة المنتج قبل الشراء.',
    },
  },
  {
    id: 'faq_gc_3',
    categoryId: 'gift-cards',
    categoryName: 'Gift Cards & Codes',
    order: 18,
    en: {
      q: 'What should I do if my code shows already redeemed or invalid?',
      a: 'Double-check that your account region matches the code\'s region and that there are no typographical errors. If the issue persists, open a Support Ticket with your Order Number and a screenshot of the error message for publisher verification.',
    },
    ku: {
      q: 'چی بکەم ئەگەر کۆدەکە پیشانی دا پێشتر بەکارهاتووە یان نادروستە؟',
      a: 'دڵنیابەوە کە ناوچەی هەژمارەکەت لەگەڵ ناوچەی کۆدەکەدا یەکدەگرێتەوە و هیچ هەڵەیەکی نووسین نییە. ئەگەر کێشەکە مابووەوە، تیکتێکی پشتیوانی بنێرە لەگەڵ ژمارەی داواکارییەکەت و وێنەیەکی ڕوونی هەڵەکە بۆ ئەوەی بەدواداچوونی لەگەڵ بڵاوکەرەوەدا بۆ بکەین.',
    },
    ar: {
      q: 'ماذا أفعل إذا ظهر أن الكود مستخدم مسبقاً أو غير صالح؟',
      a: 'تأكد أولاً من مطابقة بلد حسابك للمنطقة المحددة للبطاقة ومن عدم وجود أخطاء في النسخ. إذا استمرت المشكلة، افتح تذكرة دعم فني وأرفق رقم الطلب ولقطة شاشة لرسالة الخطأ للتحقق والتواصل مع الموزع الرسمي.',
    },
  },
  {
    id: 'faq_gc_4',
    categoryId: 'gift-cards',
    categoryName: 'Gift Cards & Codes',
    order: 19,
    en: {
      q: 'Do gift card codes expire?',
      a: 'Promotional vouchers may have specific expiration dates noted on the product page. Standard balance gift cards do not expire unless explicitly specified by the publisher. We recommend redeeming codes promptly upon receipt.',
    },
    ku: {
      q: 'ئایا کۆدی کارتەکانی دیاری بەسەردەچن؟',
      a: 'کارتە ڕیکلامییەکان ڕەنگە بەرواری بەسەرچوونیان هەبێت کە لەسەر بەرهەمەکە دیاری کراوە. کارتە باڵانسە ئاسایییەکان بەسەرناچن مەگەر لەلایەن خودی کۆمپانیاکەوە دیاری بکرێت. پێشنیار دەکەین کلیلەکان ڕاستەوخۆ دوای کڕین بەکاربهێنیت.',
    },
    ar: {
      q: 'هل تنتهي صلاحية أكواد بطاقات الهدايا؟',
      a: 'البطاقات الترويجية قد تحمل تاريخ انتهاء محدد ومكتوب في وصف المنتج. أما بطاقات الرصيد القياسية فلا تنتهي صلاحيتها ما لم يحدد الناشر خلاف ذلك. ننصح دائماً بشحن الكود مباشرة بعد استلامه لضمان الأمان.',
    },
  },

  // ─── E. Subscriptions (3 Questions) ──────────────────────────────────────
  {
    id: 'faq_sb_1',
    categoryId: 'subscriptions',
    categoryName: 'Subscriptions',
    order: 20,
    en: {
      q: 'How do subscriptions work?',
      a: 'VORTEX GAMING provides prepaid digital subscription voucher codes (e.g., Xbox Game Pass Ultimate, PlayStation Plus, EA Play). You redeem the code once on your console or account, and the subscription duration is credited immediately without requiring recurring billing on our site.',
    },
    ku: {
      q: 'بەشداریکردنەکان (Subscriptions) چۆن کار دەکەن؟',
      a: 'VORTEX GAMING کارت و کۆدی پێشەکی بۆ بەشداریکردنە دیجیتاڵییەکان (وەک Xbox Game Pass، PlayStation Plus، EA Play) دابین دەکات. تۆ تەنها کۆدەکە لە هەژمارەکەت داغڵ دەکەیت و ماوەی بەشداریکردنەکەت بۆ زیاد دەبێت بەبێ پێویستی بە بڕینی پارەی مانگانە لە ماڵپەڕەکەماندا.',
    },
    ar: {
      q: 'كيف تعمل اشتراكات الألعاب؟',
      a: 'توفر VORTEX GAMING بطاقات وأكواد اشتراك رقمية مسبقة الدفع (مثل Xbox Game Pass و PlayStation Plus و EA Play). تقوم بإدخال الكود في حسابك ليتم تفعيل المدة المحددة فوراً دون أي تجديد تلقائي أو خصم دوري من موقعنا.',
    },
  },
  {
    id: 'faq_sb_2',
    categoryId: 'subscriptions',
    categoryName: 'Subscriptions',
    order: 21,
    en: {
      q: 'Will my subscription renew automatically?',
      a: 'No. Our prepaid subscription codes do not automatically renew or charge your payment method at expiration. When your term ends, you can simply purchase a new code from VORTEX GAMING to extend your membership.',
    },
    ku: {
      q: 'ئایا بەشداریکردنەکەم بە شێوەیەکی خۆکار نوێ دەبێتەوە؟',
      a: 'نەخێر. کارتە پێشەکییەکانی ئێمە بە خۆکاری نوێ نابنەوە و دوای بەسەرچوونی ماوەکە هیچ بڕە پارەیەک لە کارتەکەت نابڕدرێت. کاتێک ماوەکەت تەواو بوو، دەتوانیت بە ئاسانی کۆدێکی نوێ لە VORTEX GAMING بکڕیت بۆ درێژکردنەوەی.',
    },
    ar: {
      q: 'هل يتجدد اشتراكي تلقائياً بعد انتهائه؟',
      a: 'لا. بطاقاتنا الرقمية مسبقة الدفع ولا يتم تجديدها تلقائياً أو سحب أي مبالغ إضافية من وسيلة الدفع الخاصة بك. عند انتهاء مدة الاشتراك، يمكنك ببساطة شراء كود جديد من VORTEX GAMING لتمديد العضوية.',
    },
  },
  {
    id: 'faq_sb_3',
    categoryId: 'subscriptions',
    categoryName: 'Subscriptions',
    order: 22,
    en: {
      q: 'Can I stack multiple subscription codes on one account?',
      a: 'Stackability depends on the platform publisher. Xbox Game Pass generally allows stacking up to 36 months, whereas some introductory trial codes require existing active subscriptions to lapse first. Check the product description for platform-specific rules.',
    },
    ku: {
      q: 'ئایا دەتوانم چەند کۆدێکی بەشداریکردن لەسەر یەک هەژمار کەڵەکە (Stack) بکەم؟',
      a: 'کەڵەکەبوونی کۆدەکان بەپێی یاسای خودی پلاتفۆرمەکەیە. بۆ نموونە، Xbox Game Pass ڕێگە دەدات تا ٣٦ مانگ پێکەوە کۆبکەیتەوە، لە کاتێکدا هەندێک کۆدی تاقیکاری (Trial) پێویست دەکات چاوەڕێ بکەیت تا بەشداریکردنی پێشووت تەواو دەبێت. ڕێنمایییەکانی ناو بەرهەمەکە بخوێنەرەوە.',
    },
    ar: {
      q: 'هل يمكنني تفعيل أكثر من كود اشتراك معاً لتمديد المدة (Stacking)؟',
      a: 'تعتمد إمكانية الدمج على سياسة كل منصة ناشرة. على سبيل المثال، يتيح Xbox Game Pass تمديد وتكديس الاشتراكات حتى 36 شهراً مقدماً، بينما تتطلب بعض أكواد التجربة (Trial) انتهاء الاشتراك الحالي أولاً. يُرجى قراءة وصف المنتج بدقة.',
    },
  },

  // ─── F. Account & Security (4 Questions) ─────────────────────────────────
  {
    id: 'faq_as_1',
    categoryId: 'account-security',
    categoryName: 'Account & Security',
    order: 23,
    en: {
      q: 'How do I enable Two-Factor Authentication (2FA)?',
      a: 'You can link your Discord account with OAuth 2.0 PKCE for hardware-level 2FA protection, or configure two-factor authentication in your account security settings.',
    },
    ku: {
      q: 'چۆن پشتڕاستکردنەوەی دوو قۆناغی (2FA) چالاک بکەم؟',
      a: 'دەتوانیت هەژماری Discord ی خۆت ببەستیتەوە لە ڕێگەی پرۆتۆکۆڵی پارێزراوی OAuth 2.0 PKCE بۆ پاراستنی دوو قۆناغی، یان لە ڕێکخستنەکانی ئەمنییەتی هەژمارەکەتدا تایبەتمەندی 2FA ڕێکبخەیت.',
    },
    ar: {
      q: 'كيف يمكنني تفعيل المصادقة الثنائية (2FA)؟',
      a: 'يمكنك ربط حسابك بـ Discord عبر بروتوكول OAuth 2.0 PKCE المشفر للحصول على حماية إضافية، أو تفعيل خيارات المصادقة الثنائية وتأمين الدخول مباشرة من صفحة إعدادات الأمان في حسابك.',
    },
  },
  {
    id: 'faq_as_2',
    categoryId: 'account-security',
    categoryName: 'Account & Security',
    order: 24,
    en: {
      q: 'What should I do if I lose access to my 2FA authenticator?',
      a: 'If you lose access, click "Lost 2FA" on the login screen or contact our support team. We will verify your identity via your registered email and recent order history to securely restore access.',
    },
    ku: {
      q: 'چی بکەم ئەگەر دەستپێگەیشتنم بە بەرنامەی 2FA لەدەستدا؟',
      a: 'ئەگەر دەستت بە بەرنامەی 2FA نەگەیشت، پەیوەندی بە تیمی پشتیوانی بکە. دوای سەلماندنی ناسنامەت لە ڕێگەی ئیمەیڵی تۆمارکراو و بەڵگەی داواکارییە کۆنەکانت، دەستپێگەیشتن بە هەژمارەکەت بۆ دەگەڕێنینەوە.',
    },
    ar: {
      q: 'ماذا أفعل إذا فقدت الوصول إلى تطبيق المصادقة الثنائية الخاص بي؟',
      a: 'إذا تعذر عليك إدخال رمز المصادقة، تواصل مع فريق الدعم الفني. سنقوم بالتحقق الأمني من هويتك عبر بريدك الإلكتروني المعتمد وتاريخ طلباتك الأخيرة لاستعادة الدخول إلى حسابك بأمان.',
    },
  },
  {
    id: 'faq_as_3',
    categoryId: 'account-security',
    categoryName: 'Account & Security',
    order: 25,
    en: {
      q: 'How do I change my account password or PIN?',
      a: 'You can update your account password under "My Account" → "Settings". To change or reset your 4-6 digit delivery security PIN, visit "My Account" → "Security PIN" or use the PIN Modal on your Order Details page, which requires password re-verification.',
    },
    ku: {
      q: 'چۆن نهێنوشەی هەژمار یان کۆدی PIN ی گەیاندن بگۆڕم؟',
      a: 'دەتوانیت وشەی نهێنی لە بەشی "هەژمارەکەم" ← "ڕێکخستنەکان" بگۆڕیت. بۆ گۆڕین یان نوێکردنەوەی کۆدی نهێنی گەیاندن (PIN)، بڕۆ بۆ بەشی "Security PIN" یان مۆداڵی تایبەت لە پەڕەی داواکارییەکەت کە پێویستی بە دووبارە داخڵکردنەوەی وشەی نهێنی هەیە بۆ دڵنیایی.',
    },
    ar: {
      q: 'كيف يمكنني تغيير كلمة المرور أو رمز PIN الخاص بالتسليم؟',
      a: 'يمكنك تغيير كلمة المرور بسهولة من "حسابي" ← "الإعدادات". ولتعديل أو إعادة تعيين رمز PIN الأمني المكون من 4-6 أرقام لتسليم الطلبات، توجه إلى تبويب "رمز PIN الأمني" أو استخدم نافذة التحقق في صفحة تفاصيل الطلب التي تتطلب تأكيد كلمة المرور.',
    },
  },
  {
    id: 'faq_as_4',
    categoryId: 'account-security',
    categoryName: 'Account & Security',
    order: 26,
    en: {
      q: 'How is my personal data protected?',
      a: 'Customer passwords and security PINs are hashed using industry-standard salted bcrypt. Game keys and delivery credentials are encrypted in our AES-256-GCM digital vault. All sensitive API endpoints enforce strict role-based access control and rate limiting.',
    },
    ku: {
      q: 'زانیارییە کەسییەکانم چۆن دەپارێزرێن؟',
      a: 'وشەی نهێنی و کۆدی PIN بە تەکنەلۆژیای ستانداردی bcrypt و خوێ (Salt) دەشاردرێنەوە. کلیلە دیجیتاڵییەکان لە خەزێنەی AES-256-GCM کۆد دەکرێن. هەروەها هەموو بەشەکانی سێرڤەر بە سیستەمی کۆنترۆڵی پلەبەندی (RBAC) و سنووردارکردنی ژمارەی هەوڵەکان پارێزراون.',
    },
    ar: {
      q: 'كيف تتم حماية بياناتي ومعلوماتي الشخصية؟',
      a: 'يتم تشفير كلمات المرور ورموز الـ PIN باستخدام خوارزميات bcrypt المعيارية مع الأملاح العشوائية. وتُحفظ المفاتيح الرقمية وبيانات الحسابات داخل خزانة مشفرة بتقنية AES-256-GCM، مع تطبيق قيود صارمة على الصلاحيات وحماية ضد المحاولات المتكررة.',
    },
  },

  // ─── G. Refunds & Returns (4 Questions) ──────────────────────────────────
  {
    id: 'faq_rr_1',
    categoryId: 'refunds-returns',
    categoryName: 'Refunds & Returns',
    order: 27,
    en: {
      q: 'Do you offer refunds?',
      a: 'Yes. In accordance with our Digital Goods Refund Policy, unredeemed and unrevealed digital keys may be refunded within 14 days of purchase. Once a digital key or account credential has been decrypted or revealed via your PIN, it cannot be refunded unless proven defective.',
    },
    ku: {
      q: 'ئایا پارە گەڕاندنەوە (Refund) بەردەستە؟',
      a: 'بەڵێ. بەپێی سیاسەتی گەڕاندنەوەی کاڵا دیجیتاڵییەکان، ئەو کلیلانەی کە نەکرابێتنەوە و بەکارنەهاتبێتن دەکرێت لە ماوەی ١٤ ڕۆژدا داوای گەڕاندنەوەیان بکرێت. بەڵام ئەگەر کلیلەکە لە ڕێگەی کۆدی PIN ئاشکرا کرا بێت، تەنها لە حاڵەتی هەبوونی کێشەی تەکنیکی پەسەند دەکرێت.',
    },
    ar: {
      q: 'هل توفرون إمكانية استرجاع الأموال (Refund)؟',
      a: 'نعم. وفقاً لسياسة استرداد المنتجات الرقمية، يمكن طلب استرجاع المفاتيح غير المكشوفة وغير المستخدمة خلال 14 يوماً من تاريخ الشراء. أما إذا تم فك تشفير المفتاح أو الكشف عن بيانات الحساب عبر رمز PIN، فلا يمكن استرجاعه إلا في حال ثبوت وجود خلل تقني مؤكد.',
    },
  },
  {
    id: 'faq_rr_2',
    categoryId: 'refunds-returns',
    categoryName: 'Refunds & Returns',
    order: 28,
    en: {
      q: 'How long does a refund take to process?',
      a: 'Once approved by our support team, refunds are typically processed within 1 to 3 business days. Depending on your financial institution or mobile wallet provider, funds will appear back on your original payment method in 3 to 7 business days.',
    },
    ku: {
      q: 'گەڕاندنەوەی پارە چەند کات دەخایەنێت؟',
      a: 'دوای پەسەندکردنی لەلایەن تیمی پشتیوانی، گەڕاندنەوەکە لە ماوەی ١ تا ٣ ڕۆژی کارکردندا دەستپێدەکات. بەپێی جۆری بانک یان جزدانی مۆبایلەکەت، پارەکە لە ماوەی ٣ تا ٧ ڕۆژدا دەگەڕێتەوە ناو باڵانسەکەت.',
    },
    ar: {
      q: 'كم يستغرق استرداد الأموال إلى حسابي؟',
      a: 'بمجرد موافقة فريق الدعم الفني، تتم معالجة طلب الاسترجاع في غضون 1 إلى 3 أيام عمل. واعتماداً على البنك أو المحفظة الإلكترونية الخاصة بك، يظهر المبلغ المسترد في وسيلة الدفع الأصلية خلال 3 إلى 7 أيام عمل.',
    },
  },
  {
    id: 'faq_rr_3',
    categoryId: 'refunds-returns',
    categoryName: 'Refunds & Returns',
    order: 29,
    en: {
      q: 'Can I get a refund if I bought the wrong-region key?',
      a: 'If the digital key has NOT been revealed or copied from your account, our support team can cancel the order and issue store credit or a refund. If the key was already revealed, we cannot verify if it was viewed or activated, making it non-refundable.',
    },
    ku: {
      q: 'ئایا دەتوانم پارەکەم وەربگرمەوە ئەگەر بە هەڵە کلیلێکی ناوچەیەکی ترم کڕیبوو؟',
      a: 'ئەگەر کلیلە دیجیتاڵییەکە هێشتا نیشان نەدرابێت و کۆپی نەکرابێت، تیمەکەمان دەتوانێت داواکارییەکە هەڵبوەشێنێتەوە و پارەکەت بۆ بگێڕێتەوە. بەڵام ئەگەر کلیلەکە پیشاندرابێت، ناتوانین بزانین بەکارهاتووە یان نا، بۆیە ناگەڕێندرێتەوە.',
    },
    ar: {
      q: 'هل يمكنني استرداد المبلغ إذا اشتريت مفتاحاً لمنطقة غير مطابقة لحسابي؟',
      a: 'إذا لم يتم كشف الكود أو نسخ المفتاح من الحساب نهائياً، يمكن لفريقنا إلغاء الطلب وإرجاع المبلغ أو استبداله. أما إذا تم كشف المفتاح بالفعل، فلا يمكن التحقق مما إذا كان قد استُخدم لدى المنصة، وبالتالي لا يمكن إرجاعه.',
    },
  },
  {
    id: 'faq_rr_4',
    categoryId: 'refunds-returns',
    categoryName: 'Refunds & Returns',
    order: 30,
    en: {
      q: 'Where will my refund be credited?',
      a: 'Approved refunds are returned directly to the original payment method used during checkout (Stripe card, FastPay, ZainCash, or FIB) whenever technically supported by the gateway, or issued as store credit upon customer request.',
    },
    ku: {
      q: 'پارەی گەڕاوە دەچێتە سەر چ هەژمارێک؟',
      a: 'پارەی گەڕاوە ڕاستەوخۆ دەگەڕێتەوە بۆ سەر هەمان ئەو شێوازەی کە پێی کڕاوە (کارتی بانک، FastPay، ZainCash یان FIB)، یان بەپێی داواکاری کڕیار دەکرێت بە باڵانسی کریدت بۆ کڕینی بەرهەمی تر لە ماڵپەڕەکەدا.',
    },
    ar: {
      q: 'إلى أين يتم إيداع المبلغ المسترد؟',
      a: 'تُعاد المبالغ المستردة المعتمدة مباشرة إلى نفس وسيلة الدفع الأصلية التي استُخدمت في الشراء (البطاقة الائتمانية عبر Stripe، محفظة FastPay، زين كاش، أو مصرف FIB) متى ما كانت البوابة تدعم الإرجاع المالي المباشر.',
    },
  },

  // ─── H. Technical Support (3 Questions) ──────────────────────────────────
  {
    id: 'faq_ts_1',
    categoryId: 'technical-support',
    categoryName: 'Technical Support',
    order: 31,
    en: {
      q: 'How do I contact the technical support team?',
      a: 'You can submit a Support Ticket directly through the Support Center at /support, use the floating Support Widget at the bottom-right of every page, or email support@vortexgaming.gg.',
    },
    ku: {
      q: 'چۆن پەیوەندی بە تیمی پشتیوانی تەکنیکییەوە بکەم؟',
      a: 'دەتوانیت تیکتی پشتیوانی ڕاستەوخۆ لە سەنتەری پشتیوانی لە /support بنێریت، یان پەنجە بنێیت بە وێجێتی پشتیوانی لە خوارەوەی لای ڕاستی پەڕەکە، یاخود ئیمەیڵ بنێریت بۆ support@vortexgaming.gg.',
    },
    ar: {
      q: 'كيف يمكنني التواصل مع فريق الدعم الفني؟',
      a: 'يمكنك فتح تذكرة دعم مباشرة من خلال مركز الدعم الموحد على الرابط /support، أو النقر على أيقونة الدعم العائمة أسفل يمين الشاشة، أو مراسلتنا عبر البريد الإلكتروني الرسمي: support@vortexgaming.gg.',
    },
  },
  {
    id: 'faq_ts_2',
    categoryId: 'technical-support',
    categoryName: 'Technical Support',
    order: 32,
    en: {
      q: 'What are the live chat support hours?',
      a: 'Our self-service FAQ and automated key vault operate 24/7. Ticket desks and agent inquiries are monitored daily between 09:00 and 22:00 (GMT+3), with responses typically delivered within 1 business day.',
    },
    ku: {
      q: 'کاتژمێرەکانی کارکردنی مێزی پشتیوانی ڕاستەوخۆ کەییە؟',
      a: 'بەشەکانی زانیاری خۆکار و خەزێنەی کلیل ٢٤/٧ لە کاردان. مێزی پێداچوونەوەی تیکت و وەڵامدانەوەی کارمەندان ڕۆژانە لە نێوان ٠٩:٠٠ بۆ ٢٢:٠٠ (GMT+3) چالاکە و وەڵامەکان لە ماوەی یەک ڕۆژی کارکردندا دەدرێنەوە.',
    },
    ar: {
      q: 'ما هي ساعات عمل فريق الدعم المباشر ومكتب التذاكر؟',
      a: 'الأسئلة الشائعة ونظام تسليم المفاتيح الآلي يعملان على مدار الساعة 24/7. أما متابعة التذاكر والردود المباشرة فيتم التعامل معها يومياً بين 09:00 صباحاً و 10:00 مساءً (توقيت مكة المكرمة)، ويتم الرد على كافة التذاكر خلال يوم عمل واحد.',
    },
  },
  {
    id: 'faq_ts_3',
    categoryId: 'technical-support',
    categoryName: 'Technical Support',
    order: 33,
    en: {
      q: 'How do I track an open support ticket?',
      a: 'Log into your account and open the Support Center (/support?tab=tickets) or click "View My Tickets" in the floating support widget. You can see real-time status updates (Open, In Progress, Awaiting Customer, Resolved, Closed) and reply to agent messages.',
    },
    ku: {
      q: 'چۆن بەدواداچوون بۆ تیکتە کراوەکانم بکەم؟',
      a: 'بچۆ ژوورەوە بۆ ناو هەژمارەکەت و سەردانی بەشی تیکتەکان بکە لە /support?tab=tickets یان کلیك بکە لەسەر "بینینی تیکتەکانم" لە وێجێتی خوارەوە. دەتوانیت دۆخی تیکتەکە ببینی (کراوە، لە کارکردندایە، چاوەڕوانی کڕیار، چارەسەرکراو، داخراو) و وەڵامی کارمەندان بدەیتەوە.',
    },
    ar: {
      q: 'كيف يمكنني متابعة تذكرة دعم مفتوحة؟',
      a: 'سجل دخولك إلى حسابك وتوجه إلى صفحة التذاكر عبر /support?tab=tickets أو اضغط على "عرض تذاكري" في نافذة الدعم العائمة. ستتمكن من رؤية التحديثات المباشرة للحالة (مفتوحة، قيد المعالجة، بانتظار العميل، تم الحل، مغلقة) والرد على الرسائل.',
    },
  },

  // ─── I. Other (2 Questions) ──────────────────────────────────────────────
  {
    id: 'faq_ot_1',
    categoryId: 'other',
    categoryName: 'Other',
    order: 34,
    en: {
      q: 'Do you offer affiliate, merchant, or bulk seller programs?',
      a: 'Our merchant and affiliate partner programs are currently under development and not yet publicly active. Please check back on our announcements page or follow our official Discord channel for future updates.',
    },
    ku: {
      q: 'ئایا بەرنامەی ئەفلیێت، فرۆشیاری یان کڕینی بەکۆمەڵتان هەیە؟',
      a: 'بەرنامەکانی بەشداریکردنی بازرگانی و ئەفلیێت (Affiliate) لە قۆناغی ئامادەکاری تەکنیکیدان و لە ئێستادا بە شێوەی گشتی کارا نین. تکایە چاودێری ڕاگەیەندراوەکانمان یان چەناڵی فەرمی Discord بکە بۆ نوێکارییەکان.',
    },
    ar: {
      q: 'هل تقدمون برامج تسويق بالعمولة (Affiliate) أو حسابات تجار ومبيعات بالجملة؟',
      a: 'برامج الشراكة التسويقية وحسابات الموردين قيد التطوير التقني حالياً ولم تُطلق رسمياً بعد. يُرجى متابعة صفحة الأخبار أو قناتنا الرسمية على Discord لمعرفة موعد إطلاقها للمجتمع.',
    },
  },
  {
    id: 'faq_ot_2',
    categoryId: 'other',
    categoryName: 'Other',
    order: 35,
    en: {
      q: 'How do I report a bug or suggest a new store feature?',
      a: 'We welcome community feedback! Please open a Support Ticket and select category "Other" or "Technical", or join our community Discord server to submit suggestions directly to our development team.',
    },
    ku: {
      q: 'چۆن هەڵەیەکی تەکنیکی ڕاپۆرت بکەم یان پێشنیاری تایبەتمەندی نوێ بدەم؟',
      a: 'ئێمە زۆر پێشوازی لە بیروبۆچوونی بەکارهێنەران دەکەین! تکایە تیکتێکی پشتیوانی بکەرەوە و بەشی "هیتر" یان "پشتیوانی تەکنیکی" هەڵبژێرە، یاخود وەرە ناو سێرڤەری Discord و پێشنیارەکانت ڕاستەوخۆ بنووسە.',
    },
    ar: {
      q: 'كيف يمكنني الإبلاغ عن خطأ برمجي أو اقتراح ميزة جديدة للمتجر؟',
      a: 'نرحب دائماً باقتراحات مجتمع اللاعبين! يُرجى فتح تذكرة دعم فني واختيار تصنيف "أخرى" أو "الدعم الفني"، أو الانضمام إلى مجتمعنا على Discord لتقديم مقترحاتك وملاحظاتك إلى فريق التطوير مباشرة.',
    },
  },
];

// ─── Query Helpers ──────────────────────────────────────────────────────────

export function getAllFaqCategories(): FAQCategory[] {
  return FAQ_CATEGORIES;
}

export function getAllFaqs(): FAQItem[] {
  return FAQS_DATA;
}

export function getCategoryQuestionCount(categoryId: string): number {
  if (categoryId === 'all') {
    return FAQS_DATA.length;
  }
  return FAQS_DATA.filter((item) => item.categoryId === categoryId).length;
}

export function getFaqsForCategory(
  categoryId: string | null,
  lang: 'en' | 'ku' | 'ar' = 'en'
): Array<{ id: string; categoryId: string; categoryName: string; q: string; a: string }> {
  const filtered = !categoryId || categoryId === 'all'
    ? FAQS_DATA
    : FAQS_DATA.filter((item) => item.categoryId === categoryId);

  return filtered.map((item) => ({
    id: item.id,
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    q: item[lang]?.q || item.en.q,
    a: item[lang]?.a || item.en.a,
  }));
}

export function searchFaqs(
  query: string,
  categoryId: string | null,
  lang: 'en' | 'ku' | 'ar' = 'en'
): Array<{ id: string; categoryId: string; categoryName: string; q: string; a: string }> {
  const trimmed = query.trim().toLowerCase();
  const pool = getFaqsForCategory(categoryId, lang);

  if (!trimmed) {
    return pool;
  }

  return pool.filter((item) => {
    const qText = item.q.toLowerCase();
    const aText = item.a.toLowerCase();
    return qText.includes(trimmed) || aText.includes(trimmed);
  });
}
