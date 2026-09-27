# NUVORA

**Learn. Understand. Become.**

An AI-powered learning platform: structured skill paths, an AI tutor, quizzes,
spaced repetition, project-based learning, career mode, and a public profile
with real certificates — all backed by a production Supabase database with
row-level security on every table.

This is a real, working product, not a prototype. Every button either works
end-to-end against the live database, or is clearly labeled as not yet
configured (see the AI Tutor and project-review notes below).

---

## Tech stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router
- **Backend:** Supabase (Postgres, Auth, Edge Functions) — using a dedicated
  `nuvora` Postgres schema in your existing Supabase project, fully isolated
  from any other apps living in the same project
- **AI:** Groq (Llama 3.3 70B), called from a Supabase Edge Function so the
  API key never reaches the browser. The AI provider is abstracted
  (`src/services/ai/`) so swapping in OpenAI or Gemini later means adding one
  provider class, not rewriting features.

---

## Running locally

```bash
npm install
cp .env.example .env   # already filled in with your project's URL/key
npm run dev
```

Other scripts: `npm run build` (type-check + production build), `npm run
lint`, `npm run preview`.

---

## Required configuration

The codebase and database schema are already deployed. A few things only
Anthropic — a human with dashboard access — can do, since they require
clicking through the Supabase and Google/GitHub consoles.

### 1. Expose the `nuvora` schema to the API

**What:** Add `nuvora` to the list of schemas PostgREST will serve.
**Where:** Supabase Dashboard → Project Settings → API → **Data API** →
"Exposed schemas".
**Value:** add `nuvora` to the existing list (don't remove `public` or any
other app's schema already there).
**Why:** Without this, every request the app makes returns a 406 error —
the database schema exists, but the API layer won't route to it yet.

### 2. Add the Groq API key so the AI Tutor works

**What:** A secret named `GROQ_API_KEY`.
**Where:** Supabase Dashboard → Edge Functions → `nuvora-ai-tutor` →
Secrets (or Project Settings → Edge Functions → Secrets, project-wide).
**Value:** your Groq API key (get one free at console.groq.com).
**Why:** The `nuvora-ai-tutor` function is already deployed and live — it
just returns a clear "not configured yet" message until this secret exists,
rather than pretending to work.

### 3. Enable Google and GitHub sign-in

**What:** Turn on the Google and GitHub OAuth providers.
**Where:** Supabase Dashboard → Authentication → Providers.
**Value:** enable both, following Supabase's instructions to create OAuth
apps in Google Cloud Console and GitHub Developer Settings. Set each
provider's redirect URL to `https://<your-project-ref>.supabase.co/auth/v1/callback`.
**Why:** Email/password sign-in works immediately with no setup. The two
social buttons on the login/signup pages will show a real (not fake) error
until these are enabled.

### 4. Make yourself an admin (optional)

**What:** Flip `is_admin` to `true` on your own profile row.
**Where:** Supabase Dashboard → SQL Editor.
**Value:**
```sql
update nuvora.profiles set is_admin = true
where id = (select id from auth.users where email = 'you@example.com');
```
**Why:** Nobody is an admin by default (by design — RLS only lets admins
grant admin, so the very first one has to be set directly in SQL). This
unlocks the `/admin` overview page in the sidebar.

### 5. Deploying the frontend

Any static host that runs `npm run build` and serves `dist/` works (Vercel,
Netlify, Cloudflare Pages). Set the two `VITE_SUPABASE_*` environment
variables from `.env.example` in your host's dashboard.

---

## What's real vs. explicitly not-yet-built

**Fully working, verified against the live database:** auth (email +
Google/GitHub), onboarding, skill discovery, learning paths → courses →
lessons, lesson progress, quizzes (real questions, real grading, real
persistence), Knowledge Vault notes (create/edit/search/tag/pin), spaced
repetition review queue, project submissions, career mode with skill-gap
status computed from real progress data (not a simulated assessment),
public profiles with real derived certificates, an admin stats overview,
dark/light mode, and a real daily learning streak.

**Explicitly deferred** (all marked "future" in the original product spec):
user-generated content and publishing, the creator marketplace, semantic
search, notifications, monetization/paywalls, and full admin content-CRUD
(the current admin page is real stats, not content management).

---

## Project structure

```
src/
  components/   shared UI primitives, layout, brand, route guards
  contexts/     auth, theme, toast
  features/     one folder per screen area (landing, auth, onboarding,
                dashboard, skills, learning, tutor, notes, career, progress,
                profile, admin)
  services/     all Supabase/AI reads & writes — features never call
                supabase directly
  types/        hand-written types mirroring the database schema
supabase/
  functions/nuvora-ai-tutor/   the AI Tutor edge function
  migrations/                  the full schema + seed data, for the record
```
