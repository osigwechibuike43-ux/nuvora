import { NavLink } from "react-router-dom";
import { LayoutDashboard, Compass, Sparkles, TrendingUp, User, NotebookPen, Briefcase, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/skills", label: "Explore skills", icon: Compass },
  { to: "/career", label: "Career mode", icon: Briefcase },
  { to: "/tutor", label: "AI Tutor", icon: Sparkles },
  { to: "/notes", label: "Knowledge Vault", icon: NotebookPen },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const { profile } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-nuvora-border/70 bg-nuvora-surface md:flex">
      <div className="flex h-16 items-center px-6">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-2" aria-label="Primary">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-nuvora-green/10 text-nuvora-green"
                  : "text-nuvora-muted hover:bg-white/5 hover:text-nuvora-white"
              )
            }
          >
            <Icon className="h-4.5 w-4.5" aria-hidden />
            {label}
          </NavLink>
        ))}
        {profile?.is_admin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-nuvora-green/10 text-nuvora-green"
                  : "text-nuvora-muted hover:bg-white/5 hover:text-nuvora-white"
              )
            }
          >
            <ShieldCheck className="h-4.5 w-4.5" aria-hidden />
            Admin
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
