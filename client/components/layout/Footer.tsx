import { ShieldCheck, Mail, Zap } from "lucide-react";
import { useI18n } from "@/context/I18nContext";
import { Link } from "react-router-dom";

export default function Footer() {
  const { t } = useI18n();
  const email = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;
  return (
    <footer className="border-t mt-16 bg-background">
      <div className="container px-6 md:px-8 py-12 grid gap-10 md:grid-cols-4">
        <div>
          <h4 className="font-semibold">{t("support") || "Support & Contact"}</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Email: {email || "support@upora.tld"}</li>
            <li>Hours: 9:00–18:00 GMT</li>
            <li>Instant email delivery</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">{t("legal") || "Legal"}</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-foreground" to="#">Terms</Link></li>
            <li><Link className="hover:text-foreground" to="#">Refund Policy (digital goods)</Link></li>
            <li><Link className="hover:text-foreground" to="#">Privacy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">{t("social") || "Social"}</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Twitter/X</a></li>
            <li><a href="#" className="hover:text-foreground">Instagram</a></li>
            <li><a href="#" className="hover:text-foreground">Facebook</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">{t("newsletter") || "Newsletter"}</h4>
          <p className="mt-2 text-sm text-muted-foreground">{t("newsletter_copy") || "Get top deals in your inbox."}</p>
          <form className="mt-3 flex gap-2">
            <input className="flex-1 rounded-full border bg-background px-4 py-2" placeholder="Email address" />
            <button type="button" className="rounded-full bg-primary text-primary-foreground px-5 font-semibold">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="py-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} UPORA</div>
    </footer>
  );
}
