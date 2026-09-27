import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle, Clock, FolderGit2 } from "lucide-react";
import { PageSpinner, Card, Badge } from "@/components/ui/Primitives";
import { ErrorState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  getCourseBySlug,
  getCourseCurriculum,
  type ModuleWithLessons,
} from "@/services/learning/catalogService";
import { enroll, getEnrollment, getLessonProgressForCourse } from "@/services/learning/progressService";
import { getProjectsForCourse } from "@/services/learning/projectService";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatMinutes, titleCase } from "@/lib/utils";
import type { Course, Enrollment, LessonProgress } from "@/types/database";

export function CoursePage() {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleWithLessons[] | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [hasProject, setHasProject] = useState(false);
  const [error, setError] = useState(false);
  usePageMeta(course?.title ?? "Course", course?.description ?? undefined);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    if (!courseSlug) return;
    setCourse(null);
    setModules(null);

    getCourseBySlug(courseSlug)
      .then(async (foundCourse) => {
        setCourse(foundCourse);
        if (!foundCourse) {
          setModules([]);
          return;
        }
        const curriculum = await getCourseCurriculum(foundCourse.id);
        setModules(curriculum);
        const projects = await getProjectsForCourse(foundCourse.id);
        setHasProject(projects.length > 0);

        if (user) {
          const existingEnrollment = await getEnrollment(user.id, foundCourse.id);
          setEnrollment(existingEnrollment);
          const lessonIds = curriculum.flatMap((m) => m.lessons.map((l) => l.id));
          setProgress(await getLessonProgressForCourse(user.id, lessonIds));
        }
      })
      .catch(() => setError(true));
  }, [courseSlug, user]);

  async function handleEnroll() {
    if (!user || !course) return;
    setIsEnrolling(true);
    try {
      const newEnrollment = await enroll(user.id, course.id);
      setEnrollment(newEnrollment);
      showToast("Enrolled! Let's get started.", "success");
    } catch {
      showToast("Couldn't enroll right now. Please try again.", "error");
    } finally {
      setIsEnrolling(false);
    }
  }

  if (error) return <ErrorState message="We couldn't load this course." />;
  if (!course || modules === null) return <PageSpinner label="Loading course" />;

  const firstLesson = modules[0]?.lessons[0];

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/skills" className="mb-6 inline-flex items-center gap-1.5 text-sm text-nuvora-muted hover:text-nuvora-white">
        <ArrowLeft className="h-4 w-4" /> Back to skills
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        {course.level && <Badge>{titleCase(course.level)}</Badge>}
        {course.estimated_hours && (
          <Badge>
            <Clock className="mr-1 inline h-3 w-3" /> {course.estimated_hours}h
          </Badge>
        )}
      </div>
      <h1 className="mt-3 font-display text-2xl font-semibold">{course.title}</h1>
      {course.description && <p className="mt-2 text-nuvora-muted">{course.description}</p>}

      <div className="mt-6">
        {!enrollment ? (
          <Button onClick={handleEnroll} isLoading={isEnrolling}>
            Start course
          </Button>
        ) : firstLesson ? (
          <Link to={`/learn/course/${course.slug}/lesson/${firstLesson.module_id}/${firstLesson.slug}`}>
            <Button>Continue learning</Button>
          </Link>
        ) : null}
      </div>

      <div className="mt-10 flex flex-col gap-6">
        {modules.map((module) => (
          <div key={module.id}>
            <h2 className="mb-3 text-sm font-medium text-nuvora-muted">{module.title}</h2>
            <div className="flex flex-col gap-2">
              {module.lessons.map((lesson) => {
                const lessonProgress = progress.find((p) => p.lesson_id === lesson.id);
                const isDone = lessonProgress?.status === "completed";
                return (
                  <Link key={lesson.id} to={`/learn/course/${course.slug}/lesson/${module.id}/${lesson.slug}`}>
                    <Card className="flex items-center gap-3 p-4 transition-colors hover:border-nuvora-green/50">
                      {isDone ? (
                        <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-nuvora-green" />
                      ) : (
                        <Circle className="h-4.5 w-4.5 shrink-0 text-nuvora-muted" />
                      )}
                      <span className="flex-1 text-sm">{lesson.title}</span>
                      {lesson.estimated_minutes && (
                        <span className="text-xs text-nuvora-muted">{formatMinutes(lesson.estimated_minutes)}</span>
                      )}
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {hasProject && enrollment && (
          <Link to={`/learn/course/${course.slug}/project`}>
            <Card className="flex items-center gap-3 border-nuvora-green/30 bg-nuvora-green/5 p-4 transition-colors hover:border-nuvora-green/60">
              <FolderGit2 className="h-4.5 w-4.5 shrink-0 text-nuvora-green" />
              <span className="flex-1 text-sm font-medium">Practice project</span>
              <span className="text-xs text-nuvora-muted">Apply what you've learned →</span>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
