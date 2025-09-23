import { useI18n } from "@/context/I18nContext";
import { Gamepad2, Gift, Crown, Trophy, SquareGanttChart } from "lucide-react";
import { Link } from "react-router-dom";

const items = [
  { key: "nav_gaming" as const, icon: Gamepad2, href: "/?cat=gaming" },
  { key: "nav_software" as const, icon: SquareGanttChart, href: "/?cat=software" },
  { key: "nav_subscriptions" as const, icon: Crown, href: "/?cat=subscriptions" },
  { key: "nav_giftcards" as const, icon: Gift, href: "/?cat=giftcards" },
  { key: "nav_bestsellers" as const, icon: Trophy, href: "/?cat=bestsellers" },
];

export default function CategoryBar() {
  const { t } = useI18n();
  return (
    <nav className="bg-black text-white">
      <div className="container px-4 md:px-8">
        <ul className="flex items-center gap-6 overflow-x-auto py-2">
          {items.map(({ key, icon: Icon, href }) => (
            <li key={key} className="shrink-0">
              <Link to={href} className="inline-flex items-center gap-2 text-sm hover:text-primary whitespace-nowrap">
                <Icon className="w-5 h-5" />
                <span>{t(key)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
