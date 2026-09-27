import { supabase } from "@/lib/supabase";
import type { Enrollment, LessonProgress } from "@/types/database";

export async function enroll(userId: string, courseId: string): Promise<Enrollment> {
  const { data, error } = await supabase
    .from("enrollments")
    .upsert({ user_id: userId, course_id: courseId, status: "active" }, { onConflict: "user_id,course_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getUserEnrollments(userId: string): Promise<Enrollment[]> {
  const { data, error } = await supabase.from("enrollments").select("*").eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

export async function getLessonProgressForCourse(
  userId: string,
  lessonIds: string[]
): Promise<LessonProgress[]> {
  if (lessonIds.length === 0) return [];
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);
  if (error) throw error;
  return data ?? [];
}

export async function markLessonStatus(
  userId: string,
  lessonId: string,
  status: LessonProgress["status"]
): Promise<LessonProgress> {
  const { data, error } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,lesson_id" }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Call after marking a lesson complete. If every published lesson in the
 * lesson's course is now complete, marks the enrollment itself completed —
 * this is what unlocks the course showing up as a real certificate on the
 * public profile, derived from actual progress rather than simulated.
 */
export async function checkAndCompleteCourseEnrollment(userId: string, lessonId: string): Promise<void> {
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("module_id")
    .eq("id", lessonId)
    .single();
  if (lessonError || !lesson) return;

  const { data: module, error: moduleError } = await supabase
    .from("course_modules")
    .select("course_id")
    .eq("id", lesson.module_id)
    .single();
  if (moduleError || !module) return;

  const { data: modules } = await supabase.from("course_modules").select("id").eq("course_id", module.course_id);
  const moduleIds = (modules ?? []).map((m) => m.id);
  if (moduleIds.length === 0) return;

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id")
    .in("module_id", moduleIds)
    .eq("is_published", true);
  const lessonIds = (lessons ?? []).map((l) => l.id);
  if (lessonIds.length === 0) return;

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);

  const completedCount = (progress ?? []).filter((p) => p.status === "completed").length;
  if (completedCount < lessonIds.length) return;

  await supabase
    .from("enrollments")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("course_id", module.course_id);
}
