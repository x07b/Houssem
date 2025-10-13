import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Image, 
  Ticket, 
  Settings, 
  LogOut 
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

export type AdminSection = "dashboard" | "products" | "categories" | "banners" | "promos" | "settings";

const NAV: { key: AdminSection; label: string; icon: any }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "products", label: "Products", icon: Package },
  { key: "categories", label: "Categories", icon: FolderTree },
  { key: "banners", label: "Banners", icon: Image },
  { key: "promos", label: "Promos", icon: Ticket },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function AdminShell({ section, onSelect, headerRight, children }: { section: AdminSection; onSelect: (s: AdminSection)=>void; headerRight?: ReactNode; children: ReactNode }) {
  const { logout } = useAdminAuth();
  const currentSection = NAV.find(n=>n.key===section);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 max-w-[1800px] mx-auto p-4 lg:p-6">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-6 h-max">
          <div className="border rounded-2xl p-4 bg-card/50 backdrop-blur-sm shadow-lg">
            {/* Admin Header */}
            <div className="mb-6 pb-4 border-b">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Admin Panel
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Full Control Dashboard</p>
            </div>

            {/* Navigation */}
            <nav className="grid gap-1.5">
              {NAV.map((n)=> {
                const Icon = n.icon;
                const isActive = section === n.key;
                return (
                  <Button 
                    key={n.key} 
                    variant={isActive ? "default" : "ghost"} 
                    className={cn(
                      "justify-start gap-3 h-11 px-4 font-medium transition-all",
                      isActive && "bg-primary text-primary-foreground shadow-md"
                    )} 
                    onClick={()=>onSelect(n.key)}
                  >
                    <Icon className="h-4 w-4" />
                    {n.label}
                  </Button>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="mt-6 pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-11 px-4 text-destructive hover:text-destructive hover:bg-destructive/10" 
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-3rem)]">
          {/* Header */}
          <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {currentSection?.icon && (
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <currentSection.icon className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{currentSection?.label}</h1>
                  <p className="text-sm text-muted-foreground mt-1">Manage your {currentSection?.label.toLowerCase()}</p>
                </div>
              </div>
              {headerRight && (
                <div className="flex items-center gap-3">
                  {headerRight}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="bg-card/30 backdrop-blur-sm border rounded-2xl p-6 shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
