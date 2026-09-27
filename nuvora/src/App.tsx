import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { RequireAuth, RequireOnboarding, RedirectIfAuthed, RequireAdmin } from "@/components/auth/RouteGuards";
import { AppShell } from "@/components/layout/AppShell";
import { PageSpinner } from "@/components/ui/Primitives";

// Route-level code splitting: each feature page is its own chunk, loaded
// on demand, so the initial bundle stays small (see spec Section 45 —
// lazy loading / code splitting). The public landing page loads eagerly
// since it's the very first thing most visitors see.
import { LandingPage } from "@/features/landing/LandingPage";

const LoginPage = lazy(() => import("@/features/auth/LoginPage").then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import("@/features/auth/SignupPage").then((m) => ({ default: m.SignupPage })));
const ForgotPasswordPage = lazy(() =>
  import("@/features/auth/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage }))
);
const ResetPasswordPage = lazy(() =>
  import("@/features/auth/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage }))
);
const AuthCallbackPage = lazy(() =>
  import("@/features/auth/AuthCallbackPage").then((m) => ({ default: m.AuthCallbackPage }))
);
const OnboardingPage = lazy(() =>
  import("@/features/onboarding/OnboardingPage").then((m) => ({ default: m.OnboardingPage }))
);
const DashboardPage = lazy(() =>
  import("@/features/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const SkillsPage = lazy(() => import("@/features/skills/SkillsPage").then((m) => ({ default: m.SkillsPage })));
const SkillDetailPage = lazy(() =>
  import("@/features/skills/SkillDetailPage").then((m) => ({ default: m.SkillDetailPage }))
);
const LearningPathPage = lazy(() =>
  import("@/features/learning/LearningPathPage").then((m) => ({ default: m.LearningPathPage }))
);
const CoursePage = lazy(() => import("@/features/learning/CoursePage").then((m) => ({ default: m.CoursePage })));
const LessonPage = lazy(() => import("@/features/learning/LessonPage").then((m) => ({ default: m.LessonPage })));
const ProjectPage = lazy(() => import("@/features/learning/ProjectPage").then((m) => ({ default: m.ProjectPage })));
const AITutorPage = lazy(() => import("@/features/tutor/AITutorPage").then((m) => ({ default: m.AITutorPage })));
const NotesPage = lazy(() => import("@/features/notes/NotesPage").then((m) => ({ default: m.NotesPage })));
const CareerModePage = lazy(() =>
  import("@/features/career/CareerModePage").then((m) => ({ default: m.CareerModePage }))
);
const CareerDetailPage = lazy(() =>
  import("@/features/career/CareerDetailPage").then((m) => ({ default: m.CareerDetailPage }))
);
const ProgressPage = lazy(() => import("@/features/progress/ProgressPage").then((m) => ({ default: m.ProgressPage })));
const ProfilePage = lazy(() => import("@/features/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const AdminPage = lazy(() => import("@/features/admin/AdminPage").then((m) => ({ default: m.AdminPage })));
const PublicProfilePage = lazy(() =>
  import("@/features/profile/PublicProfilePage").then((m) => ({ default: m.PublicProfilePage }))
);

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <h1 className="font-display text-3xl font-semibold">Page not found</h1>
      <p className="text-nuvora-muted">The page you're looking for doesn't exist.</p>
      <a href="/" className="text-nuvora-green hover:underline">
        Back to NUVORA
      </a>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageSpinner />}>
              <Routes>
                {/* Public marketing + auth */}
                <Route element={<RedirectIfAuthed />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                </Route>
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/skills" element={<SkillsPage />} />
                <Route path="/learn/skill/:skillSlug" element={<SkillDetailPage />} />
                <Route path="/learn/path/:pathSlug" element={<LearningPathPage />} />
                <Route path="/u/:username" element={<PublicProfilePage />} />

                {/* Authenticated */}
                <Route element={<RequireAuth />}>
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route element={<RequireOnboarding />}>
                    <Route element={<AppShell />}>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/learn/course/:courseSlug" element={<CoursePage />} />
                      <Route path="/learn/course/:courseSlug/lesson/:moduleId/:lessonSlug" element={<LessonPage />} />
                      <Route path="/learn/course/:courseSlug/project" element={<ProjectPage />} />
                      <Route path="/tutor" element={<AITutorPage />} />
                      <Route path="/notes" element={<NotesPage />} />
                      <Route path="/career" element={<CareerModePage />} />
                      <Route path="/career/:careerSlug" element={<CareerDetailPage />} />
                      <Route path="/progress" element={<ProgressPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route element={<RequireAdmin />}>
                        <Route path="/admin" element={<AdminPage />} />
                      </Route>
                    </Route>
                  </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
