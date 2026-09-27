import { NavLink } from "react-router-dom";
import { LayoutDashboard, Compass, Sparkles, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/skills", label: "Learn", icon: Compass },
  { to: "/tutor", label: "AI Tutor", icon: Sparkles },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-nuvora-border/70 bg-nuvora-surface/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Primary"
    >
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
              isActive ? "text-nuvora-green" : "text-nuvora-muted"
            )
          }
        >
          <Icon className="h-5 w-5" aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
