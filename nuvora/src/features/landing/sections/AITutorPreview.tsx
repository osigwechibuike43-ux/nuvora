import { LogoMark } from "@/components/brand/Logo";

const quickActions = ["Explain simply", "Give an example", "Explain deeper", "Quiz me"];

export function AITutorPreview() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container-nuvora grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            An AI tutor that actually teaches.
          </h2>
          <p className="mt-4 max-w-md text-nuvora-muted">
            Ask a question and get a real explanation, adapted to what you already know —
            with examples, analogies, and a way to check you actually understood it.
          </p>
        </div>

        <div className="rounded-2xl border border-nuvora-border bg-nuvora-card p-5 shadow-glow">
          <div className="flex items-start justify-end gap-2">
            <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-white/5 px-4 py-2.5 text-sm">
              I don't understand JavaScript closures.
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-nuvora-green/15">
              <LogoMark size={14} className="text-nuvora-green" />
            </span>
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-nuvora-border bg-nuvora-surface px-4 py-2.5 text-sm text-nuvora-muted">
              Let's start from the beginning. Think of a closure as a function that
              remembers the variables that existed when it was created, even after that
              outer function has finished running.
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <span
                key={action}
                className="rounded-full border border-nuvora-border px-3 py-1.5 text-xs text-nuvora-muted"
              >
                {action}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
