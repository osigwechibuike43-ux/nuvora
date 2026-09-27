import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";

export function PublicFooter() {
  return (
    <footer className="border-t border-nuvora-border/70">
      <div className="container-nuvora flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-xs text-sm text-nuvora-muted">Learn. Understand. Become.</p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div className="flex flex-col gap-2.5">
            <span className="text-sm font-medium text-nuvora-white">Product</span>
            <Link to="/skills" className="text-sm text-nuvora-muted hover:text-nuvora-white">
              Explore skills
            </Link>
            <Link to="/signup" className="text-sm text-nuvora-muted hover:text-nuvora-white">
              Start learning
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-sm font-medium text-nuvora-white">Account</span>
            <Link to="/login" className="text-sm text-nuvora-muted hover:text-nuvora-white">
              Log in
            </Link>
            <Link to="/signup" className="text-sm text-nuvora-muted hover:text-nuvora-white">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-nuvora-border/70 py-6">
        <p className="container-nuvora text-xs text-nuvora-muted">
          © {new Date().getFullYear()} NUVORA. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
