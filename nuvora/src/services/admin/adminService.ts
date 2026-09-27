import { supabase } from "@/lib/supabase";

export interface PlatformStats {
  total_users: number;
  total_enrollments: number;
  total_lessons_completed: number;
  total_published_courses: number;
  total_notes: number;
  total_ai_conversations: number;
}

/** Throws if the caller isn't an admin — the function itself enforces that. */
export async function getPlatformStats(): Promise<PlatformStats> {
  const { data, error } = await supabase.rpc("get_admin_platform_stats").single();
  if (error) throw error;
  return data as PlatformStats;
}
