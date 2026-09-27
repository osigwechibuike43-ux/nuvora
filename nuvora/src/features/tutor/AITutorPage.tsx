import { FormEvent, useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, Send } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Primitives";
import { aiService } from "@/services/ai/AIService";
import { useAuth } from "@/contexts/AuthContext";
import type { AIChatMessage, TutorMode } from "@/services/ai/types";
import { AIProviderError } from "@/services/ai/types";
import { cn } from "@/lib/utils";

const MODES: { value: TutorMode; label: string }[] = [
  { value: "simple", label: "Simple" },
  { value: "teacher", label: "Teacher" },
  { value: "socratic", label: "Socratic" },
  { value: "technical", label: "Technical" },
  { value: "exam", label: "Exam" },
  { value: "practice", label: "Practice" },
  { value: "project_mentor", label: "Project Mentor" },
];

export function AITutorPage() {
  const { profile } = useAuth();
  const location = useLocation();
  const navState = location.state as { lessonTitle?: string; prefillMessage?: string } | null;
  const lessonTitle = navState?.lessonTitle ?? null;
  const [mode, setMode] = useState<TutorMode>("teacher");
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState(
    navState?.prefillMessage ?? (lessonTitle ? `Can you help me understand "${lessonTitle}"?` : "")
  );
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const nextMessages: AIChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const reply = await aiService.sendMessage(nextMessages, {
        mode,
        userLevel: profile?.current_level ?? null,
        learningGoal: profile?.learning_goal ?? null,
        currentLessonTitle: lessonTitle,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      const message =
        err instanceof AIProviderError ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-nuvora-border pb-4">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="h-5 w-5 shrink-0 text-nuvora-green" />
          <h1 className="truncate font-display text-lg font-semibold">AI Tutor</h1>
        </div>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as TutorMode)}
          className="shrink-0 rounded-lg border border-nuvora-border bg-nuvora-card px-2.5 py-1.5 text-xs text-nuvora-white"
          aria-label="Tutor mode"
        >
          {MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto py-5">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-nuvora-green/10">
              <LogoMark size={22} className="text-nuvora-green" />
            </span>
            <p className="font-medium">What are you trying to understand?</p>
            <p className="mt-1 max-w-xs text-sm text-nuvora-muted">
              Ask a question, paste something confusing, or say what you're stuck on.
            </p>
          </div>
        )}

        {messages.map((message, i) => (
          <div key={i} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm",
                message.role === "user"
                  ? "rounded-tr-sm bg-white/5"
                  : "rounded-tl-sm border border-nuvora-border bg-nuvora-card"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 text-sm text-nuvora-muted">
            <Spinner className="h-4 w-4" /> Thinking…
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-nuvora-border pt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the AI Tutor anything…"
          className="h-11 flex-1 rounded-xl border border-nuvora-border bg-nuvora-card px-4 text-sm placeholder:text-nuvora-muted focus:outline-none focus:ring-2 focus:ring-nuvora-green"
          aria-label="Message the AI Tutor"
        />
        <Button type="submit" size="md" isLoading={isSending} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
