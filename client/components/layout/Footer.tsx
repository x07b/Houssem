import { ShieldCheck, Mail, Zap } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

export default function Footer() {
  const { t } = useI18n();
  const email = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;
  return (
    <footer className="border-t mt-16 bg-background">
      <div className="container px-6 md:px-8 py-10 grid gap-6 sm:grid-cols-3 text-center">
        <div className="flex flex-col items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <p className="font-semibold">{t("secure_delivery")}</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          <p className="font-semibold">{t("instant_email")}</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Mail className="w-6 h-6 text-primary" />
          <p className="font-semibold">{t("contact_us")}{email ? `: ${email}` : ""}</p>
        </div>
      </div>
      <div className="py-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} UPORA</div>
    </footer>
  );
}
