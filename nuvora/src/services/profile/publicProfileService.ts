import { supabase } from "@/lib/supabase";
import type { Course, Profile } from "@/types/database";

export interface PublicCertificate {
  courseId: string;
  courseTitle: string;
  completedAt: string;
}

export async function getPublicProfile(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .eq("is_public", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPublicCertificates(userId: string): Promise<PublicCertificate[]> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("course_id, completed_at, courses(id, title)")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const course = row.courses as unknown as Course | null;
    return {
      courseId: row.course_id,
      courseTitle: course?.title ?? "Course",
      completedAt: row.completed_at as string,
    };
  });
}

export async function isUsernameAvailable(username: string, currentUserId: string): Promise<boolean> {
  const { data, error } = await supabase.from("profiles").select("id").eq("username", username).maybeSingle();
  if (error) throw error;
  return !data || data.id === currentUserId;
}
