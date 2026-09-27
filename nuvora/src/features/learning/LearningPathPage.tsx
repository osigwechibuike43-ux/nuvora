import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, BookOpen } from "lucide-react";
import { PageSpinner, Card, Badge } from "@/components/ui/Primitives";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { getLearningPathBySlug, getCoursesForPath } from "@/services/learning/catalogService";
import { usePageMeta } from "@/hooks/usePageMeta";
import { titleCase } from "@/lib/utils";
import type { Course, LearningPath } from "@/types/database";

export function LearningPathPage() {
  const { pathSlug } = useParams<{ pathSlug: string }>();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [error, setError] = useState(false);
  usePageMeta(path?.title ?? "Learning path", path?.description ?? undefined);

  useEffect(() => {
    if (!pathSlug) return;
    setPath(null);
    setCourses(null);
    getLearningPathBySlug(pathSlug)
      .then(async (foundPath) => {
        setPath(foundPath);
        if (foundPath) setCourses(await getCoursesForPath(foundPath.id));
        else setCourses([]);
      })
      .catch(() => setError(true));
  }, [pathSlug]);

  if (error) return <ErrorState message="We couldn't load this learning path." />;
  if (!path || courses === null) return <PageSpinner label="Loading" />;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/skills" className="mb-6 inline-flex items-center gap-1.5 text-sm text-nuvora-muted hover:text-nuvora-white">
        <ArrowLeft className="h-4 w-4" /> Back to skills
      </Link>

      <div className="flex items-center gap-2">
        {path.level && <Badge>{titleCase(path.level)}</Badge>}
      </div>
      <h1 className="mt-3 font-display text-2xl font-semibold">{path.title}</h1>
      {path.description && <p className="mt-2 text-nuvora-muted">{path.description}</p>}

      <div className="mt-8">
        {courses.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-7 w-7 text-nuvora-green" />}
            title="No courses yet"
            message="Courses for this path are on the way."
          />
        ) : (
          <ol className="flex flex-col gap-3">
            {courses.map((course, index) => (
              <li key={course.id}>
                <Link to={`/learn/course/${course.slug}`}>
                  <Card className="flex items-center gap-4 p-5 transition-colors hover:border-nuvora-green/50">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-nuvora-green/10 text-sm font-medium text-nuvora-green">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{course.title}</p>
                      {course.description && <p className="mt-1 text-sm text-nuvora-muted">{course.description}</p>}
                    </div>
                    {course.estimated_hours && (
                      <span className="flex items-center gap-1 text-xs text-nuvora-muted">
                        <Clock className="h-3.5 w-3.5" /> {course.estimated_hours}h
                      </span>
                    )}
                  </Card>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
