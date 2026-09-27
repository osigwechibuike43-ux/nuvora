/**
 * Provider-agnostic AI types. The rest of the app should only ever
 * import from this file and `AIService.ts` — never reach directly for
 * "Groq" or "OpenAI" so the underlying provider can change later
 * without touching feature code (see NUVORA spec, Section 17).
 */

export interface AIChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export type TutorMode =
  | "simple"
  | "teacher"
  | "socratic"
  | "technical"
  | "exam"
  | "practice"
  | "project_mentor";

export interface TutorContext {
  mode: TutorMode;
  userLevel?: string | null;
  currentLessonTitle?: string | null;
  learningGoal?: string | null;
}

export interface AIProvider {
  /** Human-readable id, e.g. "groq". */
  readonly id: string;
  sendMessage(messages: AIChatMessage[], context: TutorContext): Promise<string>;
}

export class AIProviderError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "AIProviderError";
  }
}
