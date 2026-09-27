import { supabase } from "@/lib/supabase";

export interface Project {
  id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  requirements: string[];
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export interface ProjectSubmission {
  id: string;
  project_id: string;
  user_id: string;
  submission_url: string | null;
  notes: string | null;
  status: "submitted" | "reviewed";
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

export async function getProjectsForCourse(courseId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getProjectSubmission(userId: string, projectId: string): Promise<ProjectSubmission | null> {
  const { data, error } = await supabase
    .from("project_submissions")
    .select("*")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function submitProject(
  userId: string,
  projectId: string,
  input: { submissionUrl: string; notes: string }
): Promise<ProjectSubmission> {
  const { data, error } = await supabase
    .from("project_submissions")
    .insert({
      user_id: userId,
      project_id: projectId,
      submission_url: input.submissionUrl.trim() || null,
      notes: input.notes.trim() || null,
      status: "submitted",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
