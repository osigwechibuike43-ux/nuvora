import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageSpinner } from "@/components/ui/Primitives";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Supabase redirects here after OAuth or email confirmation. The session
 * is picked up automatically by the client (detectSessionInUrl: true);
 * we just wait for it and route the person onward.
 */
export function AuthCallbackPage() {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      navigate(session ? "/dashboard" : "/login", { replace: true });
    }
  }, [isLoading, session, navigate]);

  return <PageSpinner label="Signing you in" />;
}
