import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Primitives";
import { ErrorState } from "@/components/ui/States";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { cn } from "@/lib/utils";
import {
  getQuizForLesson,
  submitQuizAttempt,
  type QuizQuestion,
} from "@/services/learning/quizService";
import { markLessonStatus, checkAndCompleteCourseEnrollment } from "@/services/learning/progressService";
import { scheduleInitialReview } from "@/services/learning/reviewService";

export function QuizRunner({ lessonId }: { lessonId: string }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    getQuizForLesson(lessonId)
      .then(setQuestions)
      .catch(() => setError(true));
  }, [lessonId]);

  async function handleSubmit() {
    if (!user || !questions) return;
    setIsSubmitting(true);
    try {
      const { score, total } = await submitQuizAttempt(user.id, lessonId, questions, selections);
      setResult({ score, total });
      setSubmitted(true);
      // Passing the quiz also marks the lesson complete — a real, earned completion.
      if (score === total) {
        await markLessonStatus(user.id, lessonId, "completed");
        await scheduleInitialReview(user.id, lessonId);
        await checkAndCompleteCourseEnrollment(user.id, lessonId);
      }
    } catch {
      showToast("Couldn't submit your quiz. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRetry() {
    setSelections({});
    setSubmitted(false);
    setResult(null);
  }

  if (error) return <ErrorState message="We couldn't load this quiz." />;
  if (!questions) return <Spinner />;
  if (questions.length === 0) {
    return <p className="text-sm text-nuvora-muted">This quiz doesn't have any questions yet.</p>;
  }

  const allAnswered = questions.every((q) => selections[q.id]);

  return (
    <div className="flex flex-col gap-6">
      {result && (
        <div
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            result.score === result.total
              ? "border-nuvora-green/40 bg-nuvora-green/10 text-nuvora-green"
              : "border-nuvora-border bg-nuvora-surface text-nuvora-muted"
          )}
        >
          You scored {result.score} out of {result.total}.
          {result.score < result.total && " Review the explanations below, then try again."}
        </div>
      )}

      {questions.map((question, i) => {
        const selectedId = selections[question.id];
        const correctOption = question.options.find((o) => o.is_correct);
        return (
          <div key={question.id} className="rounded-2xl border border-nuvora-border bg-nuvora-card p-5">
            <p className="text-sm font-medium">
              {i + 1}. {question.question_text}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {question.options.map((option) => {
                const isSelected = selectedId === option.id;
                const showCorrectness = submitted;
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={submitted}
                    onClick={() => setSelections((prev) => ({ ...prev, [question.id]: option.id }))}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors",
                      !showCorrectness && isSelected && "border-nuvora-green bg-nuvora-green/10",
                      !showCorrectness && !isSelected && "border-nuvora-border hover:border-nuvora-green/40",
                      showCorrectness && option.is_correct && "border-nuvora-green bg-nuvora-green/10",
                      showCorrectness && isSelected && !option.is_correct && "border-red-500/50 bg-red-500/10",
                      showCorrectness && !isSelected && !option.is_correct && "border-nuvora-border opacity-60"
                    )}
                  >
                    {option.option_text}
                    {showCorrectness && option.is_correct && <CheckCircle2 className="h-4 w-4 shrink-0 text-nuvora-green" />}
                    {showCorrectness && isSelected && !option.is_correct && <XCircle className="h-4 w-4 shrink-0 text-red-400" />}
                  </button>
                );
              })}
            </div>
            {submitted && question.explanation && (
              <p className="mt-3 text-xs text-nuvora-muted">
                <span className="font-medium text-nuvora-white">Why:</span> {question.explanation}
                {!selections[question.id] && correctOption && ` The correct answer is "${correctOption.option_text}".`}
              </p>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <Button onClick={handleSubmit} disabled={!allAnswered} isLoading={isSubmitting} className="self-start">
          Submit quiz
        </Button>
      ) : (
        result &&
        result.score < result.total && (
          <Button variant="secondary" onClick={handleRetry} className="self-start">
            <RotateCcw className="h-4 w-4" /> Try again
          </Button>
        )
      )}
    </div>
  );
}
