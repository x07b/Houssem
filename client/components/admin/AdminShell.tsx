import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export type AdminSection = "dashboard" | "orders" | "products" | "banners" | "promos" | "settings";

const NAV: { key: AdminSection; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "orders", label: "Orders" },
  { key: "products", label: "Products" },
  { key: "banners", label: "Banners" },
  { key: "promos", label: "Promos" },
  { key: "settings", label: "Settings" },
];

export default function AdminShell({ section, onSelect, headerRight, children }: { section: AdminSection; onSelect: (s: AdminSection)=>void; headerRight?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
      <aside className="md:sticky md:top-24 h-max">
        <div className="border rounded-2xl p-2 bg-card">
          <nav className="grid gap-1">
            {NAV.map((n)=> (
              <Button key={n.key} variant={section===n.key?"default":"ghost"} className={cn("justify-start", section===n.key && "bg-primary text-primary-foreground")} onClick={()=>onSelect(n.key)}>
                {n.label}
              </Button>
            ))}
          </nav>
        </div>
      </aside>
      <section>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{NAV.find(n=>n.key===section)?.label}</h1>
          {headerRight}
        </div>
        <div className="mt-6">{children}</div>
      </section>
    </div>
  );
}
