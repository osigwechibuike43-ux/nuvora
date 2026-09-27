import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Hero } from "./sections/Hero";
import { Problem } from "./sections/Problem";
import { AITutorPreview } from "./sections/AITutorPreview";
import { ClosingCTA } from "./sections/ClosingCTA";

export function LandingPage() {
  usePageMeta(
    "NUVORA — Learn. Understand. Become.",
    "NUVORA combines structured learning, personalized paths, practical projects, and an AI tutor that helps you understand what you're learning — not just consume it."
  );

  return (
    <div className="min-h-screen">
      <PublicHeader />
      <main>
        <Hero />
        <Problem />
        <AITutorPreview />
        <ClosingCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
