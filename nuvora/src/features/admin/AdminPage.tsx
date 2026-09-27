import { useEffect, useState } from "react";
import { Users, GraduationCap, CheckCircle2, BookOpen, NotebookPen, Sparkles } from "lucide-react";
import { Card, PageSpinner } from "@/components/ui/Primitives";
import { ErrorState } from "@/components/ui/States";
import { getPlatformStats, type PlatformStats } from "@/services/admin/adminService";

const STAT_META: { key: keyof PlatformStats; label: string; icon: typeof Users }[] = [
  { key: "total_users", label: "Total learners", icon: Users },
  { key: "total_enrollments", label: "Course enrollments", icon: GraduationCap },
  { key: "total_lessons_completed", label: "Lessons completed", icon: CheckCircle2 },
  { key: "total_published_courses", label: "Published courses", icon: BookOpen },
  { key: "total_notes", label: "Notes saved", icon: NotebookPen },
  { key: "total_ai_conversations", label: "AI Tutor conversations", icon: Sparkles },
];

export function AdminPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPlatformStats()
      .then(setStats)
      .catch(() => setError(true));
  }, []);

  if (error) return <ErrorState message="We couldn't load platform stats." />;
  if (!stats) return <PageSpinner label="Loading admin overview" />;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold">Admin overview</h1>
      <p className="mt-1 text-sm text-nuvora-muted">
        Real-time platform numbers. Content and user management tools are on the roadmap.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STAT_META.map(({ key, label, icon: Icon }) => (
          <Card key={key} className="p-5">
            <Icon className="h-4.5 w-4.5 text-nuvora-green" />
            <p className="mt-3 font-display text-2xl font-semibold">{stats[key]}</p>
            <p className="mt-1 text-sm text-nuvora-muted">{label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
