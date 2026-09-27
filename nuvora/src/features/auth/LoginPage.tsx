import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export function LoginPage() {
  const { signInWithPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";

  function validate() {
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 1) next.password = "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    const { error } = await signInWithPassword(email, password);
    setIsSubmitting(false);
    if (error) {
      setErrors({ form: error });
      return;
    }
    navigate(from, { replace: true });
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue your learning journey.">
      <SocialAuthButtons />

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-nuvora-border" />
        <span className="text-xs text-nuvora-muted">or</span>
        <div className="h-px flex-1 bg-nuvora-border" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />
        {errors.form && (
          <p role="alert" className="text-sm text-red-400">
            {errors.form}
          </p>
        )}
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-nuvora-muted hover:text-nuvora-white">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-nuvora-muted">
        New to NUVORA?{" "}
        <Link to="/signup" className="text-nuvora-green hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
