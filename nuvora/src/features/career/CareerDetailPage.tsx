import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, TrendingUp, CircleDashed } from "lucide-react";
import { Card, PageSpinner } from "@/components/ui/Primitives";
import { ErrorState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { cn } from "@/lib/utils";
import {
  getCareerBySlug,
  getCareerSkillMap,
  getSkillGapStatuses,
  setCareerGoal,
  type Career,
  type CareerSkillMapItem,
  type SkillStatus,
} from "@/services/learning/careerService";

const STATUS_META: Record<SkillStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  strong: { label: "Strong", className: "text-nuvora-green border-nuvora-green/40 bg-nuvora-green/10", icon: CheckCircle2 },
  developing: { label: "Developing", className: "text-nuvora-white border-nuvora-border bg-white/5", icon: TrendingUp },
  missing: { label: "Missing", className: "text-nuvora-muted border-nuvora-border", icon: CircleDashed },
};

export function CareerDetailPage() {
  const { careerSlug } = useParams<{ careerSlug: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [career, setCareer] = useState<Career | null>(null);
  const [skillMap, setSkillMap] = useState<CareerSkillMapItem[] | null>(null);
  const [statuses, setStatuses] = useState<Record<string, SkillStatus>>({});
  const [error, setError] = useState(false);
  const [isSettingGoal, setIsSettingGoal] = useState(false);

  useEffect(() => {
    if (!careerSlug || !user) return;
    getCareerBySlug(careerSlug)
      .then(async (foundCareer) => {
        setCareer(foundCareer);
        if (!foundCareer) {
          setSkillMap([]);
          return;
        }
        const map = await getCareerSkillMap(foundCareer.id);
        setSkillMap(map);
        setStatuses(await getSkillGapStatuses(user.id, map.map((m) => m.skillId)));
      })
      .catch(() => setError(true));
  }, [careerSlug, user]);

  async function handleSetGoal() {
    if (!user || !career) return;
    setIsSettingGoal(true);
    try {
      await setCareerGoal(user.id, career.id);
      showToast("Career goal set.", "success");
    } catch {
      showToast("Couldn't save your goal. Please try again.", "error");
    } finally {
      setIsSettingGoal(false);
    }
  }

  if (error) return <ErrorState message="We couldn't load this career path." />;
  if (!career || skillMap === null) return <PageSpinner label="Loading" />;

  const strongCount = skillMap.filter((s) => statuses[s.skillId] === "strong").length;

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/career" className="mb-6 inline-flex items-center gap-1.5 text-sm text-nuvora-muted hover:text-nuvora-white">
        <ArrowLeft className="h-4 w-4" /> Career mode
      </Link>

      <h1 className="font-display text-2xl font-semibold">{career.title}</h1>
      {career.description && <p className="mt-2 text-nuvora-muted">{career.description}</p>}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-nuvora-muted">
          {strongCount} of {skillMap.length} skills strong
        </p>
        <Button size="sm" variant="secondary" onClick={handleSetGoal} isLoading={isSettingGoal}>
          Set as my goal
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        {skillMap.map((item, index) => {
          const status = statuses[item.skillId] ?? "missing";
          const meta = STATUS_META[status];
          const StatusIcon = meta.icon;
          return (
            <Link key={item.skillId} to={`/learn/skill/${item.skillSlug}`}>
              <Card className="flex items-center gap-3 p-4 transition-colors hover:border-nuvora-green/40">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs text-nuvora-muted">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.skillName}</span>
                <span className={cn("flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs", meta.className)}>
                  <StatusIcon className="h-3 w-3" /> {meta.label}
                </span>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
