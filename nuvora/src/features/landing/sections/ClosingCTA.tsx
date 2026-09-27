import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function ClosingCTA() {
  return (
    <section className="py-20">
      <div className="container-nuvora">
        <div className="rounded-2xl border border-nuvora-border bg-nuvora-card px-8 py-16 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Your learning journey starts here.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-nuvora-muted">
            Pick a skill, get a personalized path, and start understanding — not just
            consuming.
          </p>
          <Link to="/signup" className="mt-8 inline-block">
            <Button size="lg">Create your free account</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
