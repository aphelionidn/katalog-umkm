import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Membuat koneksi Supabase untuk server (Server Component, Server Action, Route Handler).
 * Menggunakan SUPABASE_URL dan SUPABASE_SECRET_KEY dari environment variable.
 */
export function createClient() {
  const rawUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!rawUrl || !supabaseKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  // Normalisasi URL jika ada akhiran /rest/v1
  const supabaseUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, "");

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const createServerClient = createClient;

