import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, NotebookPen } from "lucide-react";
import { PageSpinner } from "@/components/ui/Primitives";
import { ErrorState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { getCourseBySlug, getCourseCurriculum, getLessonBySlug, type ModuleWithLessons } from "@/services/learning/catalogService";
import { markLessonStatus, checkAndCompleteCourseEnrollment } from "@/services/learning/progressService";
import { scheduleInitialReview } from "@/services/learning/reviewService";
import { createNote } from "@/services/learning/notesService";
import { formatMinutes } from "@/lib/utils";
import { QuizRunner } from "./QuizRunner";
import type { Course, Lesson, LessonContentBlock } from "@/types/database";

export function LessonPage() {
  const { courseSlug, moduleId, lessonSlug } = useParams<{
    courseSlug: string;
    moduleId: string;
    lessonSlug: string;
  }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleWithLessons[] | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    if (!courseSlug || !moduleId || !lessonSlug) return;
    setLesson(null);
    setIsComplete(false);

    Promise.all([getCourseBySlug(courseSlug), getLessonBySlug(moduleId, lessonSlug)])
      .then(async ([foundCourse, foundLesson]) => {
        setCourse(foundCourse);
        setLesson(foundLesson);
        if (foundCourse) setModules(await getCourseCurriculum(foundCourse.id));
      })
      .catch(() => setError(true));
  }, [courseSlug, moduleId, lessonSlug]);

  async function handleMarkComplete() {
    if (!user || !lesson) return;
    setIsCompleting(true);
    try {
      await markLessonStatus(user.id, lesson.id, "completed");
      await scheduleInitialReview(user.id, lesson.id);
      await checkAndCompleteCourseEnrollment(user.id, lesson.id);
      setIsComplete(true);
      showToast("Lesson complete", "success");
    } catch {
      showToast("Couldn't save your progress. Please try again.", "error");
    } finally {
      setIsCompleting(false);
    }
  }

  async function handleSaveNote() {
    if (!user || !lesson) return;
    setIsSavingNote(true);
    try {
      await createNote(user.id, { title: lesson.title, content: "", tags: [], lessonId: lesson.id });
      showToast("Note created — find it in your Knowledge Vault.", "success");
    } catch {
      showToast("Couldn't create the note. Please try again.", "error");
    } finally {
      setIsSavingNote(false);
    }
  }

  if (error) return <ErrorState message="We couldn't load this lesson." />;
  if (!course || !lesson || !modules) return <PageSpinner label="Loading lesson" />;

  const flatLessons = modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id })));
  const currentIndex = flatLessons.findIndex((l) => l.id === lesson.id);
  const prev = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const next = currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to={`/learn/course/${course.slug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-nuvora-muted hover:text-nuvora-white"
      >
        <ArrowLeft className="h-4 w-4" /> {course.title}
      </Link>

      <p className="text-xs text-nuvora-muted">
        Lesson {currentIndex + 1} of {flatLessons.length}
        {lesson.estimated_minutes && ` · ${formatMinutes(lesson.estimated_minutes)}`}
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold">{lesson.title}</h1>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navigate("/tutor", { state: { lessonTitle: lesson.title } })}
          className="inline-flex items-center gap-1.5 rounded-full border border-nuvora-border px-3 py-1.5 text-xs text-nuvora-muted hover:border-nuvora-green/40 hover:text-nuvora-white"
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-nuvora-green" /> Ask the AI Tutor about this
        </button>
        <button
          type="button"
          onClick={handleSaveNote}
          disabled={isSavingNote}
          className="inline-flex items-center gap-1.5 rounded-full border border-nuvora-border px-3 py-1.5 text-xs text-nuvora-muted hover:border-nuvora-green/40 hover:text-nuvora-white disabled:opacity-50"
        >
          <NotebookPen className="h-3.5 w-3.5 shrink-0 text-nuvora-green" /> Save a note
        </button>
      </div>

      {lesson.lesson_type === "quiz" ? (
        <div className="mt-6">
          <QuizRunner lessonId={lesson.id} />
        </div>
      ) : (
        <div className="prose-nuvora mt-6 flex flex-col gap-4">
          {(lesson.content.blocks ?? []).map((block, i) => (
            <LessonBlock key={i} block={block} />
          ))}
          {lesson.content.note && (
            <div className="rounded-xl border border-dashed border-nuvora-border p-4 text-sm text-nuvora-muted">
              {lesson.content.note}
            </div>
          )}
        </div>
      )}

      <div className="mt-10 flex items-center justify-between border-t border-nuvora-border pt-6">
        {prev ? (
          <Link to={`/learn/course/${course.slug}/lesson/${prev.moduleId}/${prev.slug}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>
          </Link>
        ) : (
          <span />
        )}

        {lesson.lesson_type !== "quiz" && (
          <Button size="sm" onClick={handleMarkComplete} isLoading={isCompleting} disabled={isComplete} variant={isComplete ? "secondary" : "primary"}>
            {isComplete ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Completed
              </>
            ) : (
              "Mark complete"
            )}
          </Button>
        )}

        {next ? (
          <Link to={`/learn/course/${course.slug}/lesson/${next.moduleId}/${next.slug}`}>
            <Button variant="ghost" size="sm">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

function LessonBlock({ block }: { block: LessonContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className="text-[15px] leading-relaxed text-nuvora-muted">{block.text}</p>;
    case "code":
      return (
        <pre className="overflow-x-auto rounded-xl border border-nuvora-border bg-nuvora-surface p-4 text-sm">
          <code>{block.code}</code>
        </pre>
      );
    case "list":
      return (
        <ul className="list-disc space-y-1.5 pl-5 text-[15px] text-nuvora-muted">
          {(block.items ?? []).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <div className="rounded-xl border border-nuvora-green/30 bg-nuvora-green/5 p-4 text-sm">{block.text}</div>
      );
    default:
      return null;
  }
}
