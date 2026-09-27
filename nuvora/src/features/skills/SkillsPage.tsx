import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Cpu,
  Briefcase,
  Palette,
  Target,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { PageSpinner, Card } from "@/components/ui/Primitives";
import { ErrorState } from "@/components/ui/States";
import { getSkillCatalog, type CategoryWithSkills } from "@/services/learning/catalogService";
import { usePageMeta } from "@/hooks/usePageMeta";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  cpu: Cpu,
  briefcase: Briefcase,
  palette: Palette,
  target: Target,
};

function CategoryIcon({ name }: { name: string | null }) {
  const IconComponent = (name && CATEGORY_ICONS[name]) || Sparkles;
  return <IconComponent className="h-4.5 w-4.5 text-nuvora-green" />;
}

export function SkillsPage() {
  usePageMeta("Explore skills", "Browse skills across technology, business, creative, and professional categories on NUVORA.");
  const [categories, setCategories] = useState<CategoryWithSkills[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getSkillCatalog()
      .then(setCategories)
      .catch(() => setError(true));
  }, []);

  if (error) return <ErrorState message="We couldn't load the skill catalog." onRetry={() => window.location.reload()} />;
  if (!categories) return <PageSpinner label="Loading skills" />;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold">Explore skills</h1>
        <p className="mt-1 text-sm text-nuvora-muted">Pick a skill to see its learning path.</p>
      </div>

      <div className="flex flex-col gap-10">
        {categories.map((category) => (
          <section key={category.id}>
            <div className="mb-4 flex items-center gap-2">
              <CategoryIcon name={category.icon} />
              <h2 className="font-medium">{category.name}</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {category.skills.map((skill) => (
                <Link key={skill.id} to={`/learn/skill/${skill.slug}`}>
                  <Card className="h-full p-4 transition-colors hover:border-nuvora-green/50">
                    <p className="text-sm font-medium">{skill.name}</p>
                    {skill.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-nuvora-muted">{skill.description}</p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
