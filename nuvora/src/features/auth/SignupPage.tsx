import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export function SignupPage() {
  const { signUpWithPassword } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  function validate() {
    const next: Record<string, string> = {};
    if (fullName.trim().length < 2) next.fullName = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    if (password !== confirmPassword) next.confirmPassword = "Passwords don't match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    const { error } = await signUpWithPassword(email, password, fullName.trim());
    setIsSubmitting(false);
    if (error) {
      setErrors({ form: error });
      return;
    }
    setConfirmationSent(true);
  }

  if (confirmationSent) {
    return (
      <AuthLayout title="Check your inbox">
        <p className="text-sm text-nuvora-muted">
          We sent a confirmation link to <span className="text-nuvora-white">{email}</span>.
          Verify your email to finish creating your account.
        </p>
        <Link to="/login" className="mt-6 inline-block text-sm text-nuvora-green hover:underline">
          Back to log in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start learning with a personalized path.">
      <SocialAuthButtons />

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-nuvora-border" />
        <span className="text-xs text-nuvora-muted">or</span>
        <div className="h-px flex-1 bg-nuvora-border" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label="Full name"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          required
        />
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint={!errors.password ? "At least 6 characters." : undefined}
          required
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          required
        />
        {errors.form && (
          <p role="alert" className="text-sm text-red-400">
            {errors.form}
          </p>
        )}
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-nuvora-muted">
        Already have an account?{" "}
        <Link to="/login" className="text-nuvora-green hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
