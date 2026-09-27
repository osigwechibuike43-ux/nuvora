import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export function TopBar() {
  const { profile, user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Learner";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-nuvora-border/70 px-5 sm:px-8">
      <p className="hidden text-sm text-nuvora-muted sm:block">
        Good {greeting()}, <span className="text-nuvora-white">{displayName}</span>
      </p>
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2.5 text-nuvora-muted transition-colors hover:bg-white/5 hover:text-nuvora-white"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-nuvora-border px-2 py-1.5 text-sm hover:border-nuvora-green/50"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-nuvora-green/15 text-xs font-semibold text-nuvora-green">
              {initial}
            </span>
            <ChevronDown className="h-4 w-4 text-nuvora-muted" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-nuvora-border bg-nuvora-card p-1.5 shadow-lg"
            >
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5"
              >
                Profile
              </button>
              <button
                role="menuitem"
                onClick={async () => {
                  setMenuOpen(false);
                  await signOut();
                  navigate("/");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
