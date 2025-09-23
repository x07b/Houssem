import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "fr" | "ar";

type Dict = Record<string, Record<Language, string>>;

const TRANSLATIONS: Dict = {
  nav_categories: { en: "Categories", fr: "Catégories", ar: "الفئات" },
  nav_currency: { en: "Currency", fr: "Devise", ar: "العملة" },
  nav_language: { en: "Language", fr: "Langue", ar: "اللغة" },
  cart: { en: "Cart", fr: "Panier", ar: "السلة" },
  add_to_cart: { en: "Add to Cart", fr: "Ajouter au panier", ar: "أضف إلى السلة" },
  featured: { en: "Featured Products", fr: "Produits vedettes", ar: "منتجات مميزة" },
  categories: { en: "Categories", fr: "Catégories", ar: "الفئات" },
  promo_instant: { en: "Instant Email Delivery", fr: "Livraison instantanée par email", ar: "تسليم فوري عبر البريد الإلكتروني" },
  secure_delivery: { en: "Secure Delivery", fr: "Livraison sécurisée", ar: "تسليم آمن" },
  instant_email: { en: "Instant Email", fr: "Email instantané", ar: "بريد إلكتروني فوري" },
  contact_us: { en: "Contact Us", fr: "Contactez-nous", ar: "اتصل بنا" },
  hero_title_1: { en: "Top Up Digital Cards", fr: "Cartes numériques recharge", ar: "بطاقات رقمية تعبئة" },
  hero_title_2: { en: "Best Deals Inside", fr: "Meilleures offres", ar: "أفضل العروض" },
  hero_cta: { en: "Shop Now", fr: "Acheter", ar: "تسوق الآن" },
  delivery_method: { en: "Delivery: Email", fr: "Livraison : Email", ar: "التسليم: بريد إلكتروني" },
  supported_currencies: { en: "Supported: USD, TND, EGP", fr: "Pris en charge : USD, TND, EGP", ar: "المدعومة: دولار، دينار، جنيه" },
  description: { en: "Description", fr: "Description", ar: "الوصف" },
  delivery_info: { en: "Delivery Info", fr: "Infos de livraison", ar: "معلومات التسليم" },
  view_details: { en: "View Details", fr: "Voir détails", ar: "عرض التفاصيل" },
  checkout: { en: "Checkout", fr: "Paiement", ar: "الدفع" },
  step_cart: { en: "Cart Review", fr: "Panier", ar: "مرا��عة السلة" },
  step_details: { en: "Your Details", fr: "Vos informations", ar: "بياناتك" },
  step_payment: { en: "Payment", fr: "Paiement", ar: "الدفع" },
  step_done: { en: "Confirmation", fr: "Confirmation", ar: "تأكيد" },
  fullname: { en: "Full Name", fr: "Nom complet", ar: "الاسم الكامل" },
  email: { en: "Email", fr: "Email", ar: "البريد الإلكتروني" },
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
  invalid_code: { en: "Invalid or inactive code", fr: "Code invalide ou inactif", ar: "رمز غير صالح أو غير نشط" },
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
  t: (key: keyof typeof TRANSLATIONS) => string;
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

  const t = useCallback((key: keyof typeof TRANSLATIONS) => TRANSLATIONS[key][lang], [lang]);

  const value = useMemo(() => ({ lang, dir, setLang, t }), [lang, dir, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
