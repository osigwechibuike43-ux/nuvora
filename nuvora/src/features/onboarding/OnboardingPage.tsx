import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/Primitives";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";
import { cn } from "@/lib/utils";
import type { Level, TimeCommitment } from "@/types/database";

const LEVELS: { value: Level; label: string; hint: string }[] = [
  { value: "beginner", label: "Beginner", hint: "New to this, or just getting started" },
  { value: "intermediate", label: "Intermediate", hint: "Comfortable with the basics" },
  { value: "advanced", label: "Advanced", hint: "Confident, want to go deeper" },
];

const TIME_OPTIONS: { value: TimeCommitment; label: string }[] = [
  { value: "20min", label: "20 minutes/day" },
  { value: "30min", label: "30 minutes/day" },
  { value: "1hr", label: "1 hour/day" },
  { value: "2hr_plus", label: "2+ hours/day" },
];

const STYLE_OPTIONS = ["Reading & text", "Visual & examples", "Hands-on practice", "A mix of everything"];

const TOTAL_STEPS = 5;

export function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [whatToLearn, setWhatToLearn] = useState("");
  const [level, setLevel] = useState<Level | null>(null);
  const [goal, setGoal] = useState("");
  const [timeCommitment, setTimeCommitment] = useState<TimeCommitment | null>(null);
  const [learningStyle, setLearningStyle] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const canContinue =
    (step === 1 && whatToLearn.trim().length > 1) ||
    (step === 2 && level !== null) ||
    (step === 3 && goal.trim().length > 1) ||
    (step === 4 && timeCommitment !== null) ||
    (step === 5 && learningStyle !== null);

  async function handleFinish() {
    if (!user) return;
    setIsSubmitting(true);
    setError(undefined);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        current_level: level,
        time_commitment: timeCommitment,
        learning_style: learningStyle,
        learning_goal: goal.trim(),
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (profileError) {
      setIsSubmitting(false);
      setError("We couldn't save your answers. Please try again.");
      return;
    }

    await supabase.from("learning_goals").insert({
      user_id: user.id,
      goal_text: whatToLearn.trim(),
      daily_time_minutes: timeCommitment ? timeToMinutes(timeCommitment) : null,
    });

    await refreshProfile();
    setIsSubmitting(false);
    showToast("You're all set. Let's start learning.", "success");
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-5 py-10">
      <Logo className="mb-8" />
      <div className="w-full max-w-md">
        <ProgressBar value={(step / TOTAL_STEPS) * 100} className="mb-8" />

        <div className="rounded-2xl border border-nuvora-border bg-nuvora-card p-7">
          {step === 1 && (
            <StepShell title="What do you want to learn?" subtitle="Be as specific or as broad as you like.">
              <Input
                label="I want to learn…"
                placeholder="e.g. Python, UI design, public speaking"
                value={whatToLearn}
                onChange={(e) => setWhatToLearn(e.target.value)}
              />
            </StepShell>
          )}

          {step === 2 && (
            <StepShell title="What's your current level?" subtitle="This helps us pitch explanations correctly.">
              <div className="flex flex-col gap-2.5">
                {LEVELS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    hint={option.hint}
                    selected={level === option.value}
                    onClick={() => setLevel(option.value)}
                  />
                ))}
              </div>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell title="What's your goal?" subtitle="What would learning this let you do?">
              <Input
                label="My goal is…"
                placeholder="e.g. Build my own web apps"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </StepShell>
          )}

          {step === 4 && (
            <StepShell title="How much time can you study?" subtitle="You can always change this later.">
              <div className="flex flex-col gap-2.5">
                {TIME_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    selected={timeCommitment === option.value}
                    onClick={() => setTimeCommitment(option.value)}
                  />
                ))}
              </div>
            </StepShell>
          )}

          {step === 5 && (
            <StepShell title="How do you like to learn?" subtitle="We'll shape lessons around this.">
              <div className="flex flex-col gap-2.5">
                {STYLE_OPTIONS.map((option) => (
                  <OptionCard
                    key={option}
                    label={option}
                    selected={learningStyle === option}
                    onClick={() => setLearningStyle(option)}
                  />
                ))}
              </div>
            </StepShell>
          )}

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="mt-7 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={step === 1}
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            {step < TOTAL_STEPS ? (
              <Button type="button" size="sm" disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" size="sm" disabled={!canContinue} isLoading={isSubmitting} onClick={handleFinish}>
                Finish <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-display text-lg font-semibold">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-nuvora-muted">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function OptionCard({
  label,
  hint,
  selected,
  onClick,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-xl border px-4 py-3 text-left transition-colors",
        selected
          ? "border-nuvora-green bg-nuvora-green/10"
          : "border-nuvora-border hover:border-nuvora-green/40"
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      {hint && <p className="mt-0.5 text-xs text-nuvora-muted">{hint}</p>}
    </button>
  );
}

function timeToMinutes(value: TimeCommitment): number {
  switch (value) {
    case "20min":
      return 20;
    case "30min":
      return 30;
    case "1hr":
      return 60;
    case "2hr_plus":
      return 120;
  }
}
