import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { to: "/skills", label: "Explore skills" },
  { to: "/#how-it-works", label: "How it works" },
];

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { session } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-nuvora-border/70 bg-nuvora-dark/80 backdrop-blur">
      <div className="container-nuvora flex h-16 items-center justify-between">
        <Link to="/" aria-label="NUVORA home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="text-sm text-nuvora-muted transition-colors hover:text-nuvora-white"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <Button size="sm" onClick={() => (window.location.href = "/dashboard")}>
              Go to dashboard
            </Button>
          ) : (
            <>
              <Link to="/login" className="text-sm text-nuvora-muted hover:text-nuvora-white">
                Log in
              </Link>
              <Link to="/signup">
                <Button size="sm">Start learning</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-nuvora-white md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-nuvora-border/70 px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-4" aria-label="Mobile">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-nuvora-muted hover:text-nuvora-white"
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {session ? (
                <Link to="/dashboard">
                  <Button className="w-full">Go to dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="secondary" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="w-full">Start learning</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
