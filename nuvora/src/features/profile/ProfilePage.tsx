import { FormEvent, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Primitives";
import { isUsernameAvailable } from "@/services/profile/publicProfileService";
import type { Level, TimeCommitment } from "@/types/database";

const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];
const TIME_OPTIONS: { value: TimeCommitment; label: string }[] = [
  { value: "20min", label: "20 min/day" },
  { value: "30min", label: "30 min/day" },
  { value: "1hr", label: "1 hr/day" },
  { value: "2hr_plus", label: "2+ hrs/day" },
];

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [learningGoal, setLearningGoal] = useState(profile?.learning_goal ?? "");
  const [level, setLevel] = useState<Level | null>(profile?.current_level ?? null);
  const [timeCommitment, setTimeCommitment] = useState<TimeCommitment | null>(profile?.time_commitment ?? null);
  const [username, setUsername] = useState(profile?.username ?? "");
  const [isPublic, setIsPublic] = useState(profile?.is_public ?? false);
  const [usernameError, setUsernameError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setUsernameError(undefined);

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (isPublic && cleanUsername.length < 3) {
      setUsernameError("Pick a username of at least 3 characters to make your profile public.");
      return;
    }
    if (cleanUsername) {
      const available = await isUsernameAvailable(cleanUsername, user.id);
      if (!available) {
        setUsernameError("That username is taken. Try another.");
        return;
      }
    }

    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
        learning_goal: learningGoal.trim() || null,
        current_level: level,
        time_commitment: timeCommitment,
        username: cleanUsername || null,
        is_public: isPublic,
      })
      .eq("id", user.id);
    setIsSaving(false);

    if (error) {
      showToast("Couldn't save your profile. Please try again.", "error");
      return;
    }
    await refreshProfile();
    showToast("Profile updated.", "success");
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-8 font-display text-2xl font-semibold">Profile</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Email" value={user?.email ?? ""} disabled />
          <Input label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short line about you" />
          <Input
            label="Learning goal"
            value={learningGoal}
            onChange={(e) => setLearningGoal(e.target.value)}
            placeholder="What are you working toward?"
          />

          <div>
            <p className="mb-2 text-sm font-medium">Current level</p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setLevel(option)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm capitalize transition-colors ${
                    level === option ? "border-nuvora-green bg-nuvora-green/10 text-nuvora-green" : "border-nuvora-border text-nuvora-muted"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Daily time commitment</p>
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setTimeCommitment(option.value)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                    timeCommitment === option.value
                      ? "border-nuvora-green bg-nuvora-green/10 text-nuvora-green"
                      : "border-nuvora-border text-nuvora-muted"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" isLoading={isSaving} className="mt-2 self-start">
            Save changes
          </Button>
        </form>
      </Card>

      <Card className="mt-5 p-6">
        <h2 className="font-medium">Public profile</h2>
        <p className="mt-1 text-sm text-nuvora-muted">
          Share your certificates with a public link. Off by default — nothing is visible until you turn this on.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. joseph-o"
            error={usernameError}
            hint={!usernameError ? "Letters, numbers, hyphens, underscores." : undefined}
          />

          <button
            type="button"
            onClick={() => setIsPublic((v) => !v)}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
              isPublic ? "border-nuvora-green bg-nuvora-green/10" : "border-nuvora-border"
            }`}
          >
            <span>Make my profile public</span>
            <span className={`h-5 w-9 rounded-full transition-colors ${isPublic ? "bg-nuvora-green" : "bg-white/10"} relative`}>
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                  isPublic ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </span>
          </button>

          {isPublic && username.trim() && (
            <p className="text-xs text-nuvora-muted">
              Your profile will be visible at{" "}
              <span className="text-nuvora-white">nuvora.app/u/{username.trim().toLowerCase()}</span>
            </p>
          )}

          <Button type="submit" size="sm" isLoading={isSaving} className="self-start">
            Save sharing settings
          </Button>
        </form>
      </Card>
    </div>
  );
}
