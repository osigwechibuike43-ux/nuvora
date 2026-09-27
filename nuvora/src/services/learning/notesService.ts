import { supabase } from "@/lib/supabase";

export interface Note {
  id: string;
  user_id: string;
  lesson_id: string | null;
  title: string;
  content: string;
  tags: string[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export async function getNotes(userId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createNote(
  userId: string,
  input: { title: string; content: string; tags: string[]; lessonId?: string | null }
): Promise<Note> {
  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: userId,
      title: input.title || "Untitled note",
      content: input.content,
      tags: input.tags,
      lesson_id: input.lessonId ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateNote(
  noteId: string,
  updates: Partial<Pick<Note, "title" | "content" | "tags" | "is_pinned">>
): Promise<Note> {
  const { data, error } = await supabase.from("notes").update(updates).eq("id", noteId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase.from("notes").delete().eq("id", noteId);
  if (error) throw error;
}
