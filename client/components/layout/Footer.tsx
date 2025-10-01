import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/context/I18nContext";
import { cn } from "@/lib/utils";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const legalLinks = [
  { label: "Terms", href: "#" },
  { label: "Refund Policy", href: "#" },
  { label: "Privacy", href: "#" },
];

const supportItems = (
  email: string | undefined,
): Array<{ label: string; value: string }> => [
  { label: "Email", value: email || "support@upora.tld" },
  { label: "Hours", value: "09:00–18:00 GMT" },
  { label: "Delivery", value: "Instant digital codes" },
];

const socialLinks = [
  { id: "twitter", icon: Twitter, href: "#" },
  { id: "instagram", icon: Instagram, href: "#" },
  { id: "facebook", icon: Facebook, href: "#" },
];

export default function Footer() {
  const { t } = useI18n();
  const email = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;

  return (
    <footer className="mt-24 border-t border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="container px-6 md:px-8">
        <div className="grid gap-12 py-12 md:grid-cols-[1.2fr,repeat(3,minmax(0,1fr))]">
          <div className="flex flex-col gap-4">
            <Link to="/" className="text-2xl font-extrabold">
              UPORA
            </Link>
            <p className="max-w-sm text-sm text-sidebar-foreground/80">
              Unlock verified gaming gift cards, memberships, and pro gear with instant email delivery.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ id, icon: Icon, href }) => (
                <a
                  key={id}
                  href={href}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-sidebar-border/60 bg-sidebar/60 text-sidebar-foreground transition hover:border-primary hover:bg-primary/10 hover:text-primary"
                  aria-label={id}
                >
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-sidebar-foreground/80">
              {t("support") || "Support"}
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-sidebar-foreground/80">
              {supportItems(email).map((item) => (
                <li key={item.label} className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/60">
                    {item.label}
                  </span>
                  <span className="mt-1 text-sm font-medium text-sidebar-foreground">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-sidebar-foreground/80">
              {t("legal") || "Legal"}
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-sidebar-foreground/80">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="transition hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-sidebar-foreground/80">
              {t("newsletter") || "Newsletter"}
            </h4>
            <p className="mt-4 text-sm text-sidebar-foreground/80">
              {t("newsletter_copy") || "Get top deals in your inbox."}
            </p>
            <form
              className="mt-4 flex flex-col gap-3"
              onSubmit={(event) => event.preventDefault()}
            >
              <Input
                type="email"
                placeholder={t("newsletter_placeholder")}
                className="h-11 rounded-xl border border-sidebar-border/70 bg-sidebar/60 text-sidebar-foreground placeholder:text-sidebar-foreground/60"
              />
              <Button
                type="submit"
                className="h-11 rounded-xl bg-primary font-semibold text-primary-foreground shadow-primary/30 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                {t("newsletter_cta_action")}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <div className="border-t border-sidebar-border/60 py-6 text-center text-xs text-sidebar-foreground/60">
        © {new Date().getFullYear()} UPORA. All rights reserved.
      </div>
    </footer>
  );
}
