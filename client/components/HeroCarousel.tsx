import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/context/I18nContext";

const slides = [
  {
    id: "hero-arcade",
    image:
      "https://images.pexels.com/photos/9072212/pexels-photo-9072212.jpeg?auto=compress&cs=tinysrgb&w=1600",
    headlineKey: "hero_slide_1_heading" as const,
    bodyKey: "hero_slide_1_body" as const,
  },
  {
    id: "hero-esports",
    image:
      "https://images.pexels.com/photos/7862650/pexels-photo-7862650.jpeg?auto=compress&cs=tinysrgb&w=1600",
    headlineKey: "hero_slide_2_heading" as const,
    bodyKey: "hero_slide_2_body" as const,
  },
  {
    id: "hero-squad",
    image:
      "https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=1600",
    headlineKey: "hero_slide_3_heading" as const,
    bodyKey: "hero_slide_3_body" as const,
  },
] satisfies Array<{
  id: string;
  image: string;
  headlineKey: string;
  bodyKey: string;
}>;

export default function HeroCarousel() {
  const { t, dir } = useI18n();
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, []);

  const currentSlide = slides[index];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card/70 shadow-[0_40px_120px_-60px_rgba(16,16,16,0.6)]">
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide.id}
            src={currentSlide.image}
            alt={t(currentSlide.headlineKey)}
            className="size-full object-cover"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/55 to-black/35 dark:from-black/80 dark:via-black/60 dark:to-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_55%)]" />
      </div>

      <div className="relative z-10 flex h-[40vh] flex-col justify-center px-6 py-10 sm:h-[48vh] md:h-[56vh] lg:h-[62vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl text-white"
            dir={dir}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
              {t("instant_email")}
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
              {t(currentSlide.headlineKey)}
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
              {t(currentSlide.bodyKey)}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate("/#featured")}
                className="bg-primary px-6 text-base font-semibold shadow-lg shadow-primary/30 transition hover:-translate-y-0.5">
                {t("hero_cta")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/#categories")}
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                {t("hero_cta_secondary")}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
