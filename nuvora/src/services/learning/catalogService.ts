import { supabase } from "@/lib/supabase";
import type { Course, CourseModule, Lesson, LearningPath, Skill, SkillCategory } from "@/types/database";

export interface CategoryWithSkills extends SkillCategory {
  skills: Skill[];
}

/** All skill categories with their skills, ordered for display. */
export async function getSkillCatalog(): Promise<CategoryWithSkills[]> {
  const [{ data: categories, error: catError }, { data: skills, error: skillError }] = await Promise.all([
    supabase.from("skill_categories").select("*").order("sort_order"),
    supabase.from("skills").select("*").order("sort_order"),
  ]);

  if (catError) throw catError;
  if (skillError) throw skillError;

  return (categories ?? []).map((category) => ({
    ...category,
    skills: (skills ?? []).filter((s) => s.category_id === category.id),
  }));
}

export async function getSkillBySlug(slug: string): Promise<Skill | null> {
  const { data, error } = await supabase.from("skills").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPathsForSkill(skillId: string): Promise<LearningPath[]> {
  const { data, error } = await supabase
    .from("learning_paths")
    .select("*")
    .eq("skill_id", skillId)
    .eq("is_published", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getLearningPathBySlug(slug: string): Promise<LearningPath | null> {
  const { data, error } = await supabase
    .from("learning_paths")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCoursesForPath(pathId: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("learning_path_id", pathId)
    .eq("is_published", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export interface ModuleWithLessons extends CourseModule {
  lessons: Lesson[];
}

export async function getCourseCurriculum(courseId: string): Promise<ModuleWithLessons[]> {
  const { data: modules, error: moduleError } = await supabase
    .from("course_modules")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order");
  if (moduleError) throw moduleError;

  const moduleIds = (modules ?? []).map((m) => m.id);
  if (moduleIds.length === 0) return [];

  const { data: lessons, error: lessonError } = await supabase
    .from("lessons")
    .select("*")
    .in("module_id", moduleIds)
    .eq("is_published", true)
    .order("sort_order");
  if (lessonError) throw lessonError;

  return (modules ?? []).map((module) => ({
    ...module,
    lessons: (lessons ?? []).filter((l) => l.module_id === module.id),
  }));
}

export async function getLessonBySlug(moduleId: string, slug: string): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("module_id", moduleId)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}
