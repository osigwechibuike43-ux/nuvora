import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setIsSubmitting(true);
    const { error: resetError } = await sendPasswordReset(email);
    setIsSubmitting(false);
    if (resetError) {
      setError(resetError);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthLayout title="Check your inbox">
        <p className="text-sm text-nuvora-muted">
          If an account exists for <span className="text-nuvora-white">{email}</span>, we've
          sent a link to reset your password.
        </p>
        <Link to="/login" className="mt-6 inline-block text-sm text-nuvora-green hover:underline">
          Back to log in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a link to reset it.">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          required
        />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Send reset link
        </Button>
      </form>
      <Link to="/login" className="mt-6 block text-center text-sm text-nuvora-muted hover:text-nuvora-white">
        Back to log in
      </Link>
    </AuthLayout>
  );
}
