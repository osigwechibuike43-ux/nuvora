// supabase/functions/nuvora-ai-tutor/index.ts
//
// Foundation for the NUVORA AI Tutor (spec Sections 14-17).
// Keeps GROQ_API_KEY server-side, applies a system prompt based on the
// requested tutor mode, and returns a plain assistant reply. Full tool
// use (searchLessons, createQuiz, etc.) and streaming land in Phase 2.
//
// Deploy: handled automatically by this delivery. To redeploy manually,
// use the Supabase CLI: `supabase functions deploy nuvora-ai-tutor`.
// Required secret: GROQ_API_KEY (Project Settings > Edge Functions > Secrets).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type TutorMode =
  | "simple"
  | "teacher"
  | "socratic"
  | "technical"
  | "exam"
  | "practice"
  | "project_mentor";

const MODE_INSTRUCTIONS: Record<TutorMode, string> = {
  simple: "Explain as if the learner is completely new to the topic. Use everyday language and a concrete analogy.",
  teacher: "Teach in a structured way: introduce the idea, explain it, give an example, then check understanding.",
  socratic: "Ask guiding questions instead of giving the answer outright. Help the learner reason their way there.",
  technical: "Give a precise, technically deep explanation appropriate for someone comfortable with the fundamentals.",
  exam: "Focus on what's most likely to be tested and common mistakes. Be concise and exam-oriented.",
  practice: "Give the learner a short exercise related to their question, then evaluate their attempt if they respond.",
  project_mentor: "Guide the learner toward building it themselves. Ask what they've tried, give hints, never hand over a full solution unprompted.",
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  context?: {
    mode?: TutorMode;
    userLevel?: string | null;
    currentLessonTitle?: string | null;
    learningGoal?: string | null;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the caller is a real, signed-in NUVORA user before spending AI credits.
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired session." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) {
      return new Response(
        JSON.stringify({
          error: "The AI Tutor isn't configured yet. Add a GROQ_API_KEY secret to enable it.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RequestBody = await req.json();
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Basic guardrails: cap history length and message size sent upstream.
    const trimmedMessages = body.messages.slice(-20).map((m) => ({
      role: m.role,
      content: String(m.content).slice(0, 6000),
    }));

    const mode = body.context?.mode ?? "teacher";
    const modeInstruction = MODE_INSTRUCTIONS[mode] ?? MODE_INSTRUCTIONS.teacher;

    const systemPrompt = [
      "You are the NUVORA AI Tutor, part of the NUVORA learning platform.",
      "Your job is to help the learner truly understand a concept, not just consume text.",
      modeInstruction,
      body.context?.userLevel ? `The learner's self-reported level is: ${body.context.userLevel}.` : "",
      body.context?.currentLessonTitle ? `They are currently on the lesson: "${body.context.currentLessonTitle}".` : "",
      body.context?.learningGoal ? `Their stated learning goal is: "${body.context.learningGoal}".` : "",
      "Keep responses focused and well-formatted. End with a short check-for-understanding question when appropriate.",
    ]
      .filter(Boolean)
      .join(" ");

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...trimmedMessages],
        temperature: 0.4,
        max_tokens: 1024,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Groq API error:", groqResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "The AI Tutor is temporarily unavailable. Please try again shortly." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const groqData = await groqResponse.json();
    const reply: string | undefined = groqData?.choices?.[0]?.message?.content;
    if (!reply) {
      return new Response(JSON.stringify({ error: "The AI Tutor didn't return a response." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("nuvora-ai-tutor error:", err);
    return new Response(JSON.stringify({ error: "Unexpected server error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
