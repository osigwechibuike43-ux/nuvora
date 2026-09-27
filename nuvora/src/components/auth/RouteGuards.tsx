import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageSpinner } from "@/components/ui/Primitives";

/** Blocks access until a session exists; sends unauthenticated users to /login. */
export function RequireAuth() {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageSpinner label="Checking your session" />;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

/** Once authenticated, forces a first-time user through onboarding before the app. */
export function RequireOnboarding() {
  const { profile, isLoading } = useAuth();

  if (isLoading) return <PageSpinner label="Loading your profile" />;
  if (profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
}

/** Keeps signed-in users off the marketing/auth pages. */
export function RedirectIfAuthed() {
  const { session, isLoading } = useAuth();
  if (isLoading) return <PageSpinner />;
  if (session) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

/** Admin-only routes. RLS/RPC still enforce this server-side — this only avoids showing the page. */
export function RequireAdmin() {
  const { profile, isLoading } = useAuth();
  if (isLoading) return <PageSpinner />;
  if (!profile?.is_admin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
