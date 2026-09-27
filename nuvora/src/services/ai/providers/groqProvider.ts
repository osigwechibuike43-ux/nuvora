import { supabase } from "@/lib/supabase";
import type { AIChatMessage, AIProvider, TutorContext } from "../types";
import { AIProviderError } from "../types";

/**
 * Calls the `nuvora-ai-tutor` Edge Function, which holds the real
 * GROQ_API_KEY server-side. The browser never sees the key — see
 * supabase/functions/nuvora-ai-tutor/index.ts.
 */
export class GroqProvider implements AIProvider {
  readonly id = "groq";

  async sendMessage(messages: AIChatMessage[], context: TutorContext): Promise<string> {
    const { data, error } = await supabase.functions.invoke("nuvora-ai-tutor", {
      body: { messages, context },
    });

    if (error) {
      throw new AIProviderError("The AI Tutor is temporarily unavailable. Please try again.", error);
    }
    if (!data?.reply) {
      throw new AIProviderError("The AI Tutor didn't return a response. Please try again.");
    }
    return data.reply as string;
  }
}
