import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "fr" | "ar";

type Dict = Record<string, Record<Language, string>>;

const TRANSLATIONS: Dict = {
  nav_categories: { en: "Categories", fr: "Catégories", ar: "الفئات" },
  nav_currency: { en: "Currency", fr: "Devise", ar: "العملة" },
  nav_language: { en: "Language", fr: "Langue", ar: "اللغة" },
  cart: { en: "Cart", fr: "Panier", ar: "السلة" },
  close: { en: "Close", fr: "Fermer", ar: "إغلاق" },
  add_to_cart: { en: "Add to Cart", fr: "Ajouter au panier", ar: "أضف إلى السلة" },
  "search.placeholder": { en: "Search products, keys, gift cards…", fr: "Rechercher produits, clés, cartes cadeaux…", ar: "ابحث عن المنتجات والمفاتيح وبطاقات الهدايا…" },
  "search.popular": { en: "Popular now", fr: "Populaire maintenant", ar: "شائع الآن" },
  "search.recent": { en: "Recent searches", fr: "Recherches récentes", ar: "عمليات البحث الأخيرة" },
  "search.clear_all": { en: "Clear all", fr: "Tout effacer", ar: "مسح الكل" },
  "search.no_results": { en: "No results for '{query}'", fr: "Aucun résultat pour '{query}'", ar: "لا توجد نتائج لـ '{query}'" },
  "search.retry": { en: "Couldn't fetch results. Retry", fr: "Impossible de récupérer les résultats. Réessayer", ar: "تعذّر جلب النتائج. إعادة المحاولة" },
  "search.results_count": { en: "{count} results", fr: "{count} résultats", ar: "{count} نتيجة" },
  featured: { en: "Featured Products", fr: "Produits vedettes", ar: "منتجات مميزة" },
  categories: { en: "Categories", fr: "Catégories", ar: "الفئات" },
  category_gift_cards_title: {
    en: "Digital Gift Cards",
    fr: "Cartes cadeaux numériques",
    ar: "بطاقات هدايا رقمية",
  },
  category_gift_cards_body: {
    en: "Codes for Steam, PlayStation, Xbox, and more.",
    fr: "Codes pour Steam, PlayStation, Xbox et plus.",
    ar: "أكواد لـ Steam وPlayStation وXbox والمزيد.",
  },
  category_console_title: {
    en: "Console Add-ons",
    fr: "Extensions console",
    ar: "إضافات لأجهزة الألعاب",
  },
  category_console_body: {
    en: "Bundles for PS5, Xbox Series, and Nintendo Switch.",
    fr: "Packs pour PS5, Xbox Series et Nintendo Switch.",
    ar: "حزم لـ PS5 وXbox Series وNintendo Switch.",
  },
  category_pc_title: { en: "PC Power-Ups", fr: "Améliorations PC", ar: "ترقيات للحاسب الشخصي" },
  category_pc_body: {
    en: "Game keys, launchers, and premium software.",
    fr: "Clés de jeux, launchers et logiciels premium.",
    ar: "مفاتيح ألعاب ومنصات تشغيل وبرمجيات مميزة.",
  },
  category_esports_title: {
    en: "Esports Essentials",
    fr: "Essentiels esports",
    ar: "أساسيات الرياضات الإلكترونية",
  },
  category_esports_body: {
    en: "Subscriptions, passes, and currency for competitive play.",
    fr: "Abonnements, passes et monnaies pour la compétition.",
    ar: "اشتراكات وتذاكر وعملات للعب التنافسي.",
  },
  promo_instant: { en: "Instant Email Delivery", fr: "Livraison instantanée par email", ar: "تسليم فوري عبر البريد الإلكتروني" },
  secure_delivery: { en: "Secure Delivery", fr: "Livraison sécurisée", ar: "تسليم آمن" },
  banner_gift_cards_heading: {
    en: "Instant Gift Cards",
    fr: "Cartes cadeaux instantanées",
    ar: "بطاقات هدايا فورية",
  },
  banner_gift_cards_body: {
    en: "Steam, PlayStation, Xbox, and 50+ brands delivered in seconds.",
    fr: "Steam, PlayStation, Xbox et plus de 50 marques livrées en secondes.",
    ar: "Steam وPlayStation وXbox وأكثر من 50 علامة في ثوانٍ.",
  },
  banner_gift_cards_cta: { en: "Shop Gift Cards", fr: "Acheter des cartes", ar: "تسوق البطاقات" },
  banner_console_heading: {
    en: "Console & Gear Drops",
    fr: "Drops consoles et accessoires",
    ar: "إصدارات الأجهزة والإكسسوارات",
  },
  banner_console_body: {
    en: "Elite controllers, headsets, and seasonal credits ready to ship.",
    fr: "Manettes élite, casques et crédits saisonniers prêts à partir.",
    ar: "أجهزة تحكم احترافية وسماعات وأرصدة موسمية جاهزة للشحن.",
  },
  banner_console_cta: { en: "Browse Gear", fr: "Voir les équipements", ar: "تصفح المعدات" },
  instant_email: { en: "Instant Email", fr: "Email instantané", ar: "بريد إلكتروني فوري" },
  contact_us: { en: "Contact Us", fr: "Contactez-nous", ar: "اتصل بنا" },
  hero_title_1: { en: "Top Up Digital Cards", fr: "Cartes numériques recharge", ar: "بطاقات رقمية تعبئة" },
  hero_title_2: { en: "Best Deals Inside", fr: "Meilleures offres", ar: "أفضل العروض" },
  hero_cta: { en: "Shop Now", fr: "Acheter", ar: "تسوق الآن" },
  hero_cta_secondary: { en: "Browse Deals", fr: "Voir les offres", ar: "اكتشف العروض" },
  hero_slide_1_heading: { en: "Power Up Your Play", fr: "Boostez votre jeu", ar: "عزّز تجربتك في اللعب" },
  hero_slide_1_body: {
    en: "Instant digital codes for consoles, PC, and mobile squads.",
    fr: "Codes numériques instantanés pour consoles, PC et mobile.",
    ar: "أكواد رقمية فورية لأجهزة الألعاب والحاسوب والجوال.",
  },
  hero_slide_2_heading: {
    en: "Esports-Ready Gift Cards",
    fr: "Cartes cadeaux prêtes pour l'esport",
    ar: "بطاقات هدايا جاهزة للرياضات الإلكترونية",
  },
  hero_slide_2_body: {
    en: "Load up Riot, Steam, and Battle.net balances before the next match.",
    fr: "Rechargez vos soldes Riot, Steam et Battle.net avant votre prochain match.",
    ar: "اشحن أرصدة Riot وSteam وBattle.net قبل المباراة التالية.",
  },
  hero_slide_3_heading: {
    en: "Level Up Your Crew",
    fr: "Faites monter votre escouade de niveau",
    ar: "ارتق بفريقك",
  },
  hero_slide_3_body: {
    en: "Bundle deals on controllers, subscriptions, and in-game boosts.",
    fr: "Packs avantageux sur manettes, abonnements et boosts en jeu.",
    ar: "حزم مميزة على أجهزة التحكم والاشتراكات والمعززات داخل اللعبة.",
  },
  delivery_method: { en: "Delivery: Email", fr: "Livraison : Email", ar: "التسليم: بريد إلكتروني" },
  supported_currencies: { en: "Supported: USD, TND, EGP", fr: "Pris en charge : USD, TND, EGP", ar: "المدعومة: دولار، دينار، جنيه" },
  description: { en: "Description", fr: "Description", ar: "الوصف" },
  delivery_info: { en: "Delivery Info", fr: "Infos de livraison", ar: "معلومات التسليم" },
  hottest_deals: { en: "Hottest Deals", fr: "Offres incontournables", ar: "أقوى العروض" },
  limited_time_tag: {
    en: "Limited time bundles",
    fr: "Offres limitées dans le temps",
    ar: "عروض لفترة محدودة",
  },
  new_and_upcoming: {
    en: "New & Upcoming",
    fr: "Nouveautés et sorties à venir",
    ar: "جديد وقادم",
  },
  new_and_upcoming_tag: {
    en: "Early access to the next releases",
    fr: "Accès anticipé aux prochaines sorties",
    ar: "وصول مبكر للإصدارات القادمة",
  },
  no_products: {
    en: "Products will appear here soon.",
    fr: "Les produits seront bientôt disponibles ici.",
    ar: "ستظهر المنتجات هنا قريبًا.",
  },
  newsletter_cta_heading: {
    en: "Stay in the winner's circle",
    fr: "Restez dans le cercle des gagnants",
    ar: "ابق في دائرة الفائزين",
  },
  newsletter_cta_body: {
    en: "Get early drops, bonus codes, and weekend flash sales.",
    fr: "Recevez des sorties anticipées, codes bonus et promos du week-end.",
    ar: "احصل على الإصدارات المبكرة والأكواد الإضافية وعروض نهاية الأسبوع.",
  },
  newsletter_placeholder: {
    en: "Enter your email",
    fr: "Entrez votre email",
    ar: "أدخل بريدك الإلكتروني",
  },
  newsletter_cta_action: { en: "Subscribe", fr: "S'abonner", ar: "اشترك" },
  view_details: { en: "View Details", fr: "Voir détails", ar: "عرض التفاصيل" },
  checkout: { en: "Checkout", fr: "Paiement", ar: "الدفع" },
  step_cart: { en: "Cart Review", fr: "Panier", ar: "مرا��عة السلة" },
  step_details: { en: "Your Details", fr: "Vos informations", ar: "بياناتك" },
  step_payment: { en: "Payment", fr: "Paiement", ar: "الدفع" },
  step_done: { en: "Confirmation", fr: "Confirmation", ar: "تأكيد" },
  fullname: { en: "Full Name", fr: "Nom complet", ar: "الاسم الكامل" },
  email: { en: "Email", fr: "Email", ar: "البريد الإلكترو��ي" },
  whatsapp: { en: "WhatsApp Number", fr: "Numéro WhatsApp", ar: "رقم الواتساب" },
  currency: { en: "Currency", fr: "Devise", ar: "العملة" },
  continue: { en: "Continue", fr: "Continuer", ar: "متابعة" },
  place_order: { en: "Place Order", fr: "Passer la commande", ar: "إتمام الطلب" },
  empty_cart: { en: "Your cart is empty.", fr: "Votre panier est vide.", ar: "سلة التسوق فارغة." },
  order_success: { en: "Order confirmed! Email sent.", fr: "Commande confirmée ! Email envoyé.", ar: "تم تأكيد الطلب! تم إرسال البريد." },
  order_success_no_email: { en: "Order confirmed! Email could not be sent.", fr: "Commande confirmée ! L'email n'a pas pu être envoyé.", ar: "تم تأكيد الطلب! تعذر إرسال البريد." },
  promo_code: { en: "Promo code", fr: "Code promo", ar: "رمز ترويجي" },
  apply: { en: "Apply", fr: "Appliquer", ar: "تطبيق" },
  remove: { en: "Remove", fr: "Retirer", ar: "إزالة" },
  discount: { en: "Discount", fr: "Remise", ar: "خصم" },
  total_label: { en: "Total", fr: "Total", ar: "الإجمالي" },
  invalid_code: { en: "Invalid or inactive code", fr: "Code invalide ou inactif", ar: "رمز غير ��الح أو غير نشط" },
  nav_gaming: { en: "Gaming", fr: "Jeux", ar: "الألعاب" },
  nav_software: { en: "Software", fr: "Logiciels", ar: "البرامج" },
  nav_subscriptions: { en: "Subscriptions", fr: "Abonnements", ar: "الاشتراكات" },
  nav_giftcards: { en: "Gift cards", fr: "Cartes cadeaux", ar: "بطاقات الهدايا" },
  nav_bestsellers: { en: "Bestsellers", fr: "Meilleures ventes", ar: "الأكثر مبيعًا" },
};

interface I18nContextValue {
  lang: Language;
  dir: "ltr" | "rtl";
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => (localStorage.getItem("lang") as Language) || "en");

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem("lang", lang);
  }, [lang, dir]);

  const setLang = useCallback((l: Language) => setLangState(l), []);

  const t = useCallback((key: string) => {
    try {
      const entry = (TRANSLATIONS as any)[key];
      if (entry && typeof entry === "object") return entry[lang] ?? entry["en"] ?? "";
      return String(key);
    } catch {
      return String(key);
    }
  }, [lang]);

  const value = useMemo(() => ({ lang, dir, setLang, t }), [lang, dir, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
