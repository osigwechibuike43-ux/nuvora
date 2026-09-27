import type { AIChatMessage, AIProvider, TutorContext } from "./types";
import { GroqProvider } from "./providers/groqProvider";

/**
 * The single entry point the rest of NUVORA uses for AI Tutor calls.
 * Swapping providers later (OpenAI, Gemini) means adding a class next
 * to GroqProvider and changing the line below — no feature code changes.
 */
class AIService {
  private provider: AIProvider = new GroqProvider();

  setProvider(provider: AIProvider) {
    this.provider = provider;
  }

  getProviderId() {
    return this.provider.id;
  }

  async sendMessage(messages: AIChatMessage[], context: TutorContext) {
    return this.provider.sendMessage(messages, context);
  }
}

export const aiService = new AIService();
