import { supabase } from "@/lib/supabase";

export interface QuizOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  sort_order: number;
}

export interface QuizQuestion {
  id: string;
  lesson_id: string;
  question_text: string;
  question_type: "single_choice" | "multiple_choice" | "true_false";
  explanation: string | null;
  sort_order: number;
  options: QuizOption[];
}

export interface QuizAttemptResult {
  attemptId: string;
  score: number;
  total: number;
}

/** Fetches a lesson's quiz questions with their options (correct answers included —
 *  only ever call this for the lesson the learner is actively viewing). */
export async function getQuizForLesson(lessonId: string): Promise<QuizQuestion[]> {
  const { data: questions, error: qError } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("sort_order");
  if (qError) throw qError;
  if (!questions || questions.length === 0) return [];

  const { data: options, error: oError } = await supabase
    .from("quiz_options")
    .select("*")
    .in(
      "question_id",
      questions.map((q) => q.id)
    )
    .order("sort_order");
  if (oError) throw oError;

  return questions.map((q) => ({
    ...q,
    options: (options ?? []).filter((o) => o.question_id === q.id),
  }));
}

/** Grades the attempt client-side (options aren't secret once fetched) and persists it. */
export async function submitQuizAttempt(
  userId: string,
  lessonId: string,
  questions: QuizQuestion[],
  selectedOptionIds: Record<string, string>
): Promise<QuizAttemptResult> {
  let score = 0;
  const gradedAnswers = questions.map((q) => {
    const selectedOptionId = selectedOptionIds[q.id] ?? null;
    const selectedOption = q.options.find((o) => o.id === selectedOptionId);
    const isCorrect = !!selectedOption?.is_correct;
    if (isCorrect) score += 1;
    return { question_id: q.id, selected_option_id: selectedOptionId, is_correct: isCorrect };
  });

  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .insert({ user_id: userId, lesson_id: lessonId, score, total: questions.length })
    .select()
    .single();
  if (attemptError) throw attemptError;

  const { error: answersError } = await supabase
    .from("quiz_answers")
    .insert(gradedAnswers.map((a) => ({ ...a, attempt_id: attempt.id })));
  if (answersError) throw answersError;

  return { attemptId: attempt.id, score, total: questions.length };
}

export async function getLatestAttempt(userId: string, lessonId: string) {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}
