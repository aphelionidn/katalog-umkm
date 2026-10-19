import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Koneksi server untuk pengunjung (menggunakan SUPABASE_SECRET_KEY).
 * Melewati RLS, hanya digunakan untuk membaca data publik (katalog dan detail produk).
 */
export function createClient() {
  const rawUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!rawUrl || !supabaseKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  const supabaseUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, "");

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const createServerClient = createClient;

/**
 * Koneksi sesi admin menggunakan @supabase/ssr dan cookie.
 * Menggunakan SUPABASE_PUBLISHABLE_KEY (atau fallback ke SUPABASE_SECRET_KEY jika belum diset).
 * Digunakan untuk login, keluar, ganti password, dan aksi produk admin.
 */
export async function createSessionClient() {
  const cookieStore = await cookies();
  const rawUrl = process.env.SUPABASE_URL;
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!rawUrl || !publishableKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY harus diisi di environment variable."
    );
  }

  const supabaseUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, "");

  return createSupabaseServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Abaikan jika dipanggil dari Server Component
        }
      },
    },
  });
}

export const createAdminSessionClient = createSessionClient;
export const createAdminClient = createSessionClient;
