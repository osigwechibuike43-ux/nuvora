import { FileWarning, Compass, Dumbbell, MessageSquareOff } from "lucide-react";

const problems = [
  {
    icon: FileWarning,
    title: "Too much information",
    text: "Endless articles and videos, with no way to tell what actually matters.",
  },
  {
    icon: Compass,
    title: "No clear path",
    text: "It's hard to know what to learn next, or whether you're making real progress.",
  },
  {
    icon: Dumbbell,
    title: "No practice",
    text: "Watching or reading isn't the same as being able to actually do the thing.",
  },
  {
    icon: MessageSquareOff,
    title: "No feedback",
    text: "Without someone to ask, small misunderstandings turn into real gaps.",
  },
];

export function Problem() {
  return (
    <section className="border-y border-nuvora-border/70 bg-nuvora-surface py-20">
      <div className="container-nuvora">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Traditional learning has a gap between knowing and doing.
          </h2>
          <p className="mt-4 text-nuvora-muted">
            Most platforms hand you content and leave the rest to you. NUVORA closes that
            gap.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-nuvora-border bg-nuvora-card p-6">
              <Icon className="h-5 w-5 text-nuvora-green" aria-hidden />
              <h3 className="mt-4 font-medium">{title}</h3>
              <p className="mt-2 text-sm text-nuvora-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
