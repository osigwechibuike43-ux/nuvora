import { supabase } from "@/lib/supabase";

/**
 * Computes the current daily learning streak from real lesson_progress
 * completion timestamps — counts consecutive calendar days (up to today)
 * with at least one completed lesson. Returns 0 if today has no activity
 * yet but yesterday does, the streak is still "alive" and counted from
 * yesterday backward, so a user who hasn't studied yet today doesn't see
 * their streak drop to zero prematurely.
 */
export async function getCurrentStreak(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("completed_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });
  if (error) throw error;
  if (!data || data.length === 0) return 0;

  const daySet = new Set(
    data.map((row) => new Date(row.completed_at as string).toISOString().slice(0, 10))
  );

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let cursor = new Date(today);
  const todayKey = cursor.toISOString().slice(0, 10);
  if (!daySet.has(todayKey)) {
    // Streak can still be "alive" if the last activity was yesterday.
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  while (daySet.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
