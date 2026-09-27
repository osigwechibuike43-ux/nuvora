import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Brain } from "lucide-react";
import { Card, PageSpinner, ProgressBar } from "@/components/ui/Primitives";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { supabase } from "@/lib/supabase";
import { getDueReviews, recordReview, type DueReviewItem, type ReviewQuality } from "@/services/learning/reviewService";
import type { Course, Enrollment } from "@/types/database";

interface EnrollmentWithCourse extends Enrollment {
  courses: Course | null;
}

export function ProgressPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[] | null>(null);
  const [progressByCourse, setProgressByCourse] = useState<Record<string, { done: number; total: number }>>({});
  const [dueReviews, setDueReviews] = useState<DueReviewItem[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    let cancelled = false;

    async function load() {
      try {
        const { data, error: fetchError } = await supabase
          .from("enrollments")
          .select("*, courses(*)")
          .eq("user_id", userId)
          .order("enrolled_at", { ascending: false });
        if (fetchError) throw fetchError;
        if (cancelled) return;
        const rows = (data ?? []) as unknown as EnrollmentWithCourse[];
        setEnrollments(rows);

        const courseIds = rows.map((e) => e.course_id);
        if (courseIds.length === 0) return;

        const { data: modules } = await supabase.from("course_modules").select("id, course_id").in("course_id", courseIds);
        const moduleIds = (modules ?? []).map((m) => m.id);
        const { data: lessons } = await supabase
          .from("lessons")
          .select("id, module_id")
          .in("module_id", moduleIds.length ? moduleIds : [""]);
        const { data: progress } = await supabase.from("lesson_progress").select("lesson_id, status").eq("user_id", userId);

        const map: Record<string, { done: number; total: number }> = {};
        for (const courseId of courseIds) {
          const courseModuleIds = (modules ?? []).filter((m) => m.course_id === courseId).map((m) => m.id);
          const courseLessonIds = (lessons ?? []).filter((l) => courseModuleIds.includes(l.module_id)).map((l) => l.id);
          const done = (progress ?? []).filter((p) => courseLessonIds.includes(p.lesson_id) && p.status === "completed").length;
          map[courseId] = { done, total: courseLessonIds.length };
        }
        if (!cancelled) setProgressByCourse(map);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();
    getDueReviews(user.id)
      .then(setDueReviews)
      .catch(() => {
        /* review queue is a bonus widget — don't block the whole page on it */
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleReview(item: DueReviewItem, quality: ReviewQuality) {
    try {
      await recordReview(item, quality);
      setDueReviews((prev) => prev.filter((r) => r.id !== item.id));
    } catch {
      showToast("Couldn't save your review. Please try again.", "error");
    }
  }

  if (error) return <ErrorState message="We couldn't load your progress." />;
  if (enrollments === null) return <PageSpinner label="Loading your progress" />;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-8 font-display text-2xl font-semibold">Progress</h1>

      {dueReviews.length > 0 && (
        <section className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <Brain className="h-4 w-4 text-nuvora-green" />
            <h2 className="text-sm font-medium text-nuvora-muted">Due for review</h2>
          </div>
          <div className="flex flex-col gap-2.5">
            {dueReviews.map((item) => (
              <Card key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium">{item.lessons?.title ?? "Lesson"}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm" variant="secondary" onClick={() => handleReview(item, "again")}>
                    Forgot
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleReview(item, "hard")}>
                    Hard
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleReview(item, "good")}>
                    Good
                  </Button>
                  <Button size="sm" onClick={() => handleReview(item, "easy")}>
                    Easy
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {enrollments.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="h-7 w-7 text-nuvora-green" />}
          title="Nothing to show yet"
          message="Enroll in a course to start tracking your progress here."
          action={
            <Link to="/skills">
              <Button size="sm">Explore skills</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {enrollments.map((enrollment) => {
            const course = enrollment.courses;
            const progress = progressByCourse[enrollment.course_id];
            const percent = progress && progress.total > 0 ? (progress.done / progress.total) * 100 : 0;
            if (!course) return null;
            return (
              <Card key={enrollment.id} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{course.title}</p>
                  <span className="text-xs text-nuvora-muted">
                    {progress ? `${Math.round(percent)}%` : "—"}
                  </span>
                </div>
                <ProgressBar value={percent} className="mt-3" />
                <p className="mt-1.5 text-xs text-nuvora-muted">
                  {progress ? `${progress.done} of ${progress.total} lessons complete` : "No lessons yet"}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
