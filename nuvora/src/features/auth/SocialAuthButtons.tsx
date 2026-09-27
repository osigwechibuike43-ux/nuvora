import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/contexts/ToastContext";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.3-1.7 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.6-2.6C16.9 3 14.7 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.3 0 9.3-4.4 9.3-6.7 0-.4 0-.8-.1-1.1H12z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

export function SocialAuthButtons() {
  const { signInWithOAuth } = useAuth();
  const { showToast } = useToast();
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);

  async function handleOAuth(provider: "google" | "github") {
    setLoadingProvider(provider);
    const { error } = await signInWithOAuth(provider);
    if (error) {
      showToast(error, "error");
      setLoadingProvider(null);
    }
    // On success the browser redirects away, so no need to reset loading state.
  }

  return (
    <div className="flex flex-col gap-2.5">
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        isLoading={loadingProvider === "google"}
        onClick={() => handleOAuth("google")}
      >
        <GoogleIcon /> Continue with Google
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        isLoading={loadingProvider === "github"}
        onClick={() => handleOAuth("github")}
      >
        <GitHubIcon /> Continue with GitHub
      </Button>
    </div>
  );
}
