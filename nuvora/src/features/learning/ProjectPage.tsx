import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FolderGit2, Clock } from "lucide-react";
import { Card, PageSpinner } from "@/components/ui/Primitives";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { getCourseBySlug } from "@/services/learning/catalogService";
import { getProjectsForCourse, getProjectSubmission, submitProject, type Project, type ProjectSubmission } from "@/services/learning/projectService";
import type { Course } from "@/types/database";

export function ProjectPage() {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, ProjectSubmission | null>>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!courseSlug || !user) return;
    getCourseBySlug(courseSlug)
      .then(async (foundCourse) => {
        setCourse(foundCourse);
        if (!foundCourse) {
          setProjects([]);
          return;
        }
        const foundProjects = await getProjectsForCourse(foundCourse.id);
        setProjects(foundProjects);
        const entries = await Promise.all(
          foundProjects.map(async (p) => [p.id, await getProjectSubmission(user.id, p.id)] as const)
        );
        setSubmissions(Object.fromEntries(entries));
      })
      .catch(() => setError(true));
  }, [courseSlug, user]);

  if (error) return <ErrorState message="We couldn't load this project." />;
  if (!course || projects === null) return <PageSpinner label="Loading" />;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to={`/learn/course/${course.slug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-nuvora-muted hover:text-nuvora-white"
      >
        <ArrowLeft className="h-4 w-4" /> {course.title}
      </Link>

      <h1 className="font-display text-2xl font-semibold">Project</h1>

      {projects.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<FolderGit2 className="h-7 w-7 text-nuvora-green" />}
            title="No project yet for this course"
            message="We're still building out a hands-on project for this course."
          />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              submission={submissions[project.id] ?? null}
              onSubmitted={(submission) =>
                setSubmissions((prev) => ({ ...prev, [project.id]: submission }))
              }
              userId={user!.id}
              showToast={showToast}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  submission,
  onSubmitted,
  userId,
  showToast,
}: {
  project: Project;
  submission: ProjectSubmission | null;
  onSubmitted: (s: ProjectSubmission) => void;
  userId: string;
  showToast: (msg: string, kind?: "success" | "error" | "info") => void;
}) {
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!submissionUrl.trim()) return;
    setIsSubmitting(true);
    try {
      const saved = await submitProject(userId, project.id, { submissionUrl, notes });
      onSubmitted(saved);
      showToast("Project submitted.", "success");
    } catch {
      showToast("Couldn't submit your project. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="font-medium">{project.title}</h2>
      {project.description && <p className="mt-2 text-sm text-nuvora-muted">{project.description}</p>}

      {project.requirements.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1.5">
          {project.requirements.map((req) => (
            <li key={req} className="flex items-start gap-2 text-sm text-nuvora-muted">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nuvora-green" /> {req}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 border-t border-nuvora-border pt-5">
        {submission ? (
          <div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-nuvora-green" />
              <span className="font-medium">Submitted</span>
              <span className="text-nuvora-muted">
                {new Date(submission.created_at).toLocaleDateString()}
              </span>
            </div>
            {submission.submission_url && (
              <a
                href={submission.submission_url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block text-sm text-nuvora-green hover:underline"
              >
                {submission.submission_url}
              </a>
            )}
            <p className="mt-3 rounded-lg border border-dashed border-nuvora-border p-3 text-xs text-nuvora-muted">
              AI-powered project review isn't configured yet on this build — your submission is
              saved, but automated feedback isn't available until an AI provider key is added.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              label="Link to your project"
              placeholder="https://github.com/you/task-manager or a CodeSandbox link"
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Anything you want feedback on, or ran into"
                className="rounded-xl border border-nuvora-border bg-nuvora-card p-3 text-sm placeholder:text-nuvora-muted focus:outline-none focus:ring-2 focus:ring-nuvora-green"
              />
            </div>
            <Button type="submit" isLoading={isSubmitting} disabled={!submissionUrl.trim()} className="self-start">
              Submit project
            </Button>
          </form>
        )}
      </div>
    </Card>
  );
}
