import { supabase } from "@/lib/supabase";

export interface ReviewItem {
  id: string;
  user_id: string;
  lesson_id: string;
  interval_days: number;
  ease: number;
  due_at: string;
  last_reviewed_at: string | null;
  created_at: string;
}

/** Called when a lesson is first completed — schedules its first review in 3 days. */
export async function scheduleInitialReview(userId: string, lessonId: string): Promise<void> {
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 3);
  const { error } = await supabase
    .from("review_items")
    .upsert(
      { user_id: userId, lesson_id: lessonId, interval_days: 3, ease: 2.5, due_at: dueAt.toISOString() },
      { onConflict: "user_id,lesson_id", ignoreDuplicates: true }
    );
  if (error) throw error;
}

export interface DueReviewItem extends ReviewItem {
  lessons: { id: string; title: string; slug: string; module_id: string } | null;
}

export async function getDueReviews(userId: string): Promise<DueReviewItem[]> {
  const { data, error } = await supabase
    .from("review_items")
    .select("*, lessons(id, title, slug, module_id)")
    .eq("user_id", userId)
    .lte("due_at", new Date().toISOString())
    .order("due_at");
  if (error) throw error;
  return (data ?? []) as unknown as DueReviewItem[];
}

export type ReviewQuality = "again" | "hard" | "good" | "easy";

/** Simplified SM-2: adjusts ease and interval based on self-reported recall quality. */
export async function recordReview(item: ReviewItem, quality: ReviewQuality): Promise<void> {
  let { ease, interval_days: interval } = item;

  switch (quality) {
    case "again":
      interval = 1;
      ease = Math.max(1.3, ease - 0.2);
      break;
    case "hard":
      interval = Math.max(1, Math.round(interval * 1.2));
      ease = Math.max(1.3, ease - 0.05);
      break;
    case "good":
      interval = Math.round(interval * ease);
      break;
    case "easy":
      interval = Math.round(interval * ease * 1.3);
      ease = ease + 0.15;
      break;
  }

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + interval);

  const { error } = await supabase
    .from("review_items")
    .update({
      ease,
      interval_days: interval,
      due_at: dueAt.toISOString(),
      last_reviewed_at: new Date().toISOString(),
    })
    .eq("id", item.id);
  if (error) throw error;
}
