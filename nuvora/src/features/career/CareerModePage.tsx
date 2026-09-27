import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { Card, PageSpinner } from "@/components/ui/Primitives";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { getCareers, type Career } from "@/services/learning/careerService";

export function CareerModePage() {
  const [careers, setCareers] = useState<Career[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCareers()
      .then(setCareers)
      .catch(() => setError(true));
  }, []);

  if (error) return <ErrorState message="We couldn't load career paths." />;
  if (!careers) return <PageSpinner label="Loading career paths" />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold">Career mode</h1>
      <p className="mt-1 text-sm text-nuvora-muted">
        Pick where you want to end up. We'll show what you already have and what's missing.
      </p>

      <div className="mt-6">
        {careers.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="h-7 w-7 text-nuvora-green" />}
            title="Career paths are on the way"
            message="We're still mapping out career skill trees."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {careers.map((career) => (
              <Link key={career.id} to={`/career/${career.slug}`}>
                <Card className="flex items-center gap-4 p-5 transition-colors hover:border-nuvora-green/50">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-nuvora-green/10">
                    <Briefcase className="h-4.5 w-4.5 text-nuvora-green" />
                  </span>
                  <div>
                    <p className="font-medium">{career.title}</p>
                    {career.description && <p className="mt-0.5 text-sm text-nuvora-muted">{career.description}</p>}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
