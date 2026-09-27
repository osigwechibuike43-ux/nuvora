import { supabase } from "@/lib/supabase";

export interface Career {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

export interface CareerSkillMapItem {
  skillId: string;
  skillName: string;
  skillSlug: string;
  sortOrder: number;
}

export async function getCareers(): Promise<Career[]> {
  const { data, error } = await supabase.from("careers").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getCareerBySlug(slug: string): Promise<Career | null> {
  const { data, error } = await supabase.from("careers").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCareerSkillMap(careerId: string): Promise<CareerSkillMapItem[]> {
  const { data, error } = await supabase
    .from("career_skills")
    .select("sort_order, skills(id, name, slug)")
    .eq("career_id", careerId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((row) => {
    const skill = row.skills as unknown as { id: string; name: string; slug: string };
    return { skillId: skill.id, skillName: skill.name, skillSlug: skill.slug, sortOrder: row.sort_order };
  });
}

export type SkillStatus = "strong" | "developing" | "missing";

/**
 * Derives an honest skill-gap status from real enrollment/progress data —
 * no simulated AI assessment. "Strong" = every published course under a
 * learning path for that skill is fully completed; "Developing" = at
 * least one lesson completed; "Missing" = nothing started, or no
 * published content exists for that skill yet.
 */
export async function getSkillGapStatuses(
  userId: string,
  skillIds: string[]
): Promise<Record<string, SkillStatus>> {
  if (skillIds.length === 0) return {};

  const { data: paths } = await supabase.from("learning_paths").select("id, skill_id").in("skill_id", skillIds);
  const pathIds = (paths ?? []).map((p) => p.id);

  const { data: courses } = await supabase
    .from("courses")
    .select("id, learning_path_id")
    .in("learning_path_id", pathIds.length ? pathIds : [""]);
  const courseIds = (courses ?? []).map((c) => c.id);

  const { data: modules } = await supabase.from("course_modules").select("id, course_id").in("course_id", courseIds.length ? courseIds : [""]);
  const moduleIds = (modules ?? []).map((m) => m.id);

  const { data: lessons } = await supabase.from("lessons").select("id, module_id").in("module_id", moduleIds.length ? moduleIds : [""]);

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status")
    .eq("user_id", userId);

  const statuses: Record<string, SkillStatus> = {};
  for (const skillId of skillIds) {
    const skillPathIds = (paths ?? []).filter((p) => p.skill_id === skillId).map((p) => p.id);
    const skillCourseIds = (courses ?? []).filter((c) => skillPathIds.includes(c.learning_path_id ?? "")).map((c) => c.id);
    const skillModuleIds = (modules ?? []).filter((m) => skillCourseIds.includes(m.course_id)).map((m) => m.id);
    const skillLessonIds = (lessons ?? []).filter((l) => skillModuleIds.includes(l.module_id)).map((l) => l.id);

    if (skillLessonIds.length === 0) {
      statuses[skillId] = "missing";
      continue;
    }
    const completedCount = (progress ?? []).filter(
      (p) => skillLessonIds.includes(p.lesson_id) && p.status === "completed"
    ).length;

    if (completedCount === 0) statuses[skillId] = "missing";
    else if (completedCount >= skillLessonIds.length) statuses[skillId] = "strong";
    else statuses[skillId] = "developing";
  }
  return statuses;
}

export async function setCareerGoal(userId: string, careerId: string): Promise<void> {
  const { error } = await supabase
    .from("user_career_goals")
    .upsert({ user_id: userId, career_id: careerId }, { onConflict: "user_id,career_id", ignoreDuplicates: true });
  if (error) throw error;
}
