import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useI18n } from "@/context/I18nContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    titleKey: "hero_title_1" as const,
    subtitleKey: "promo_instant" as const,
    image: "https://images.pexels.com/photos/7199194/pexels-photo-7199194.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
  {
    titleKey: "hero_title_2" as const,
    subtitleKey: "secure_delivery" as const,
    image: "https://images.pexels.com/photos/5625120/pexels-photo-5625120.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
];

export default function HeroCarousel() {
  const { t, dir } = useI18n();
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full h-[38vh] md:h-[56vh] lg:h-[64vh] overflow-hidden rounded-xl bg-muted">
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={slides[index].image}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          alt="banner"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
      <div className="relative z-10 h-full flex items-center">
        <div className="container px-6 md:px-8">
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl text-white"
            dir={dir}
          >
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              {t(slides[index].titleKey)}
            </h1>
            <p className="mt-3 md:mt-4 text-white/90">{t(slides[index].subtitleKey)}</p>
            <div className="mt-6">
              <Button onClick={() => navigate("/#featured")} className="text-base md:text-lg">
                {t("hero_cta")}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
