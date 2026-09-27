import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Compass, Sparkles, ArrowRight, GraduationCap, Flame, NotebookPen, Briefcase } from "lucide-react";
import { Card, PageSpinner, ProgressBar } from "@/components/ui/Primitives";
import { EmptyState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { titleCase } from "@/lib/utils";
import { getCurrentStreak } from "@/services/learning/streakService";
import type { Course, Enrollment, LessonProgress } from "@/types/database";

interface EnrollmentWithCourse extends Enrollment {
  courses: Course | null;
}

export function DashboardPage() {
  const { user, profile } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[] | null>(null);
  const [progressByCourse, setProgressByCourse] = useState<Record<string, { done: number; total: number }>>({});
  const [streak, setStreak] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    let cancelled = false;

    getCurrentStreak(userId)
      .then((s) => !cancelled && setStreak(s))
      .catch(() => !cancelled && setStreak(0));

    async function load() {
      try {
        const { data, error: fetchError } = await supabase
          .from("enrollments")
          .select("*, courses(*)")
          .eq("user_id", userId)
          .order("enrolled_at", { ascending: false });
        if (fetchError) throw fetchError;
        if (cancelled) return;
        setEnrollments((data ?? []) as unknown as EnrollmentWithCourse[]);

        // Compute a lightweight completion count per course from lesson_progress.
        const courseIds = (data ?? []).map((e) => (e as EnrollmentWithCourse).course_id);
        if (courseIds.length > 0) {
          const { data: modules } = await supabase.from("course_modules").select("id, course_id").in("course_id", courseIds);
          const moduleIds = (modules ?? []).map((m) => m.id);
          const { data: lessons } = await supabase.from("lessons").select("id, module_id").in("module_id", moduleIds.length ? moduleIds : [""]);
          const { data: progress } = await supabase
            .from("lesson_progress")
            .select("lesson_id, status")
            .eq("user_id", userId);

          const progressMap: Record<string, { done: number; total: number }> = {};
          for (const courseId of courseIds) {
            const courseModuleIds = (modules ?? []).filter((m) => m.course_id === courseId).map((m) => m.id);
            const courseLessonIds = (lessons ?? []).filter((l) => courseModuleIds.includes(l.module_id)).map((l) => l.id);
            const done = (progress as LessonProgress[] | null ?? []).filter(
              (p) => courseLessonIds.includes(p.lesson_id) && p.status === "completed"
            ).length;
            progressMap[courseId] = { done, total: courseLessonIds.length };
          }
          if (!cancelled) setProgressByCourse(progressMap);
        }
      } catch {
        if (!cancelled) setError("We couldn't load your dashboard. Please refresh.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (enrollments === null && !error) return <PageSpinner label="Loading your dashboard" />;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold">Your learning</h1>
          {profile?.learning_goal && (
            <p className="mt-1 text-sm text-nuvora-muted">Goal: {profile.learning_goal}</p>
          )}
        </div>
        {streak !== null && streak > 0 && (
          <div className="flex shrink-0 items-center gap-1.5 self-start rounded-full border border-nuvora-border bg-nuvora-card px-3 py-1.5 text-sm">
            <Flame className="h-4 w-4 text-nuvora-green" />
            <span className="font-medium">{streak}</span>
            <span className="text-nuvora-muted">day{streak === 1 ? "" : "s"}</span>
          </div>
        )}
      </div>

      <div className="mb-8 flex gap-3 overflow-x-auto pb-1 sm:mb-10">
        <Link
          to="/notes"
          className="flex shrink-0 items-center gap-2 rounded-xl border border-nuvora-border bg-nuvora-card px-4 py-2.5 text-sm hover:border-nuvora-green/40"
        >
          <NotebookPen className="h-4 w-4 text-nuvora-green" /> Knowledge Vault
        </Link>
        <Link
          to="/career"
          className="flex shrink-0 items-center gap-2 rounded-xl border border-nuvora-border bg-nuvora-card px-4 py-2.5 text-sm hover:border-nuvora-green/40"
        >
          <Briefcase className="h-4 w-4 text-nuvora-green" /> Career mode
        </Link>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium text-nuvora-muted">Continue learning</h2>
        {error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : enrollments && enrollments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {enrollments.map((enrollment) => {
              const course = enrollment.courses;
              const progress = progressByCourse[enrollment.course_id];
              const percent = progress && progress.total > 0 ? (progress.done / progress.total) * 100 : 0;
              if (!course) return null;
              return (
                <Card key={enrollment.id} className="p-5">
                  <div className="flex items-center gap-2 text-xs text-nuvora-muted">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {titleCase(course.level)}
                  </div>
                  <h3 className="mt-2 font-medium">{course.title}</h3>
                  <ProgressBar value={percent} className="mt-3" />
                  <p className="mt-1.5 text-xs text-nuvora-muted">
                    {progress ? `${progress.done} of ${progress.total} lessons` : "Not started"}
                  </p>
                  <Link to={`/learn/course/${course.slug}`} className="mt-4 inline-block">
                    <Button size="sm" variant="secondary">
                      Resume <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Compass className="h-7 w-7 text-nuvora-green" />}
            title="Your learning journey starts here."
            message="Browse skills and enroll in a course to see it here."
            action={
              <Link to="/skills">
                <Button size="sm">Explore skills</Button>
              </Link>
            }
          />
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-medium text-nuvora-muted">AI Tutor</h2>
        <Card className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-nuvora-green/10">
              <Sparkles className="h-5 w-5 text-nuvora-green" />
            </span>
            <div>
              <p className="font-medium">Stuck on something?</p>
              <p className="text-sm text-nuvora-muted">Ask the AI Tutor to explain it a different way.</p>
            </div>
          </div>
          <Link to="/tutor">
            <Button size="sm" variant="secondary">
              Open
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  );
}
