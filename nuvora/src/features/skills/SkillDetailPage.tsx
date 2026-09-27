import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Milestone } from "lucide-react";
import { PageSpinner, Card, Badge } from "@/components/ui/Primitives";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { getSkillBySlug, getPathsForSkill } from "@/services/learning/catalogService";
import { usePageMeta } from "@/hooks/usePageMeta";
import { titleCase } from "@/lib/utils";
import type { LearningPath, Skill } from "@/types/database";

export function SkillDetailPage() {
  const { skillSlug } = useParams<{ skillSlug: string }>();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [paths, setPaths] = useState<LearningPath[] | null>(null);
  const [error, setError] = useState(false);
  usePageMeta(skill?.name ?? "Skill", skill?.description ?? undefined);

  useEffect(() => {
    if (!skillSlug) return;
    setSkill(null);
    setPaths(null);
    setError(false);

    getSkillBySlug(skillSlug)
      .then(async (foundSkill) => {
        setSkill(foundSkill);
        if (foundSkill) {
          const foundPaths = await getPathsForSkill(foundSkill.id);
          setPaths(foundPaths);
        } else {
          setPaths([]);
        }
      })
      .catch(() => setError(true));
  }, [skillSlug]);

  if (error) return <ErrorState message="We couldn't load this skill." />;
  if (!skill || paths === null) return <PageSpinner label="Loading" />;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/skills" className="mb-6 inline-flex items-center gap-1.5 text-sm text-nuvora-muted hover:text-nuvora-white">
        <ArrowLeft className="h-4 w-4" /> Back to skills
      </Link>

      <h1 className="font-display text-2xl font-semibold">{skill.name}</h1>
      {skill.description && <p className="mt-2 text-nuvora-muted">{skill.description}</p>}

      <div className="mt-8">
        {paths.length === 0 ? (
          <EmptyState
            icon={<Milestone className="h-7 w-7 text-nuvora-green" />}
            title="This learning path is coming soon."
            message="We're still building out the curriculum for this skill. Check back soon, or explore another skill."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {paths.map((path) => (
              <Link key={path.id} to={`/learn/path/${path.slug}`}>
                <Card className="flex items-center justify-between p-5 transition-colors hover:border-nuvora-green/50">
                  <div>
                    <p className="font-medium">{path.title}</p>
                    {path.description && <p className="mt-1 text-sm text-nuvora-muted">{path.description}</p>}
                  </div>
                  {path.level && <Badge>{titleCase(path.level)}</Badge>}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
