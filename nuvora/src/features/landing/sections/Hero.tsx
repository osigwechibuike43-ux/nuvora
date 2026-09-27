import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/brand/Logo";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-16 sm:pt-24">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(circle, #16A34A 0%, transparent 70%)" }}
        aria-hidden
      />
      <div className="container-nuvora relative flex flex-col items-center text-center">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-nuvora-border bg-nuvora-card">
          <LogoMark size={30} className="text-nuvora-green" />
        </div>

        <h1 className="max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
          Learn anything.
          <br />
          Understand everything.
        </h1>

        <p className="mt-6 max-w-xl text-balance text-lg text-nuvora-muted">
          NUVORA combines structured learning, personalized paths, practical projects, and an
          AI tutor that helps you understand what you're learning — not just consume it.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link to="/signup">
            <Button size="lg" className="group">
              Start learning
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link to="/skills">
            <Button size="lg" variant="secondary">
              Explore skills
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
