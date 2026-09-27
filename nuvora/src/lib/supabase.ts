import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!supabaseUrl || !supabaseKey) {
  // Fail loudly in development rather than silently breaking every query.
  console.error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env and fill in your project values."
  );
}

/**
 * Single Supabase client for the whole app, scoped to the `nuvora`
 * Postgres schema so it never touches other apps' data living in the
 * same Supabase project (brainova, chatbi, noir_estate, researchflow).
 *
 * Deliberately left untyped against a generated `Database` type: the
 * Supabase JS client's schema generic requires each table to satisfy
 * an internal `Relationships` shape that hand-written types don't carry
 * cleanly, so instead every service function in `src/services/` declares
 * its own return type from `src/types/database.ts` and the client just
 * fetches/writes plain rows. Regenerate real types later with
 * `supabase gen types typescript` if stricter end-to-end inference is wanted.
 */
export const supabase = createClient(supabaseUrl ?? "", supabaseKey ?? "", {
  db: { schema: "nuvora" },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
