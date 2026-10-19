"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Server Action untuk login admin memakai Supabase Auth (email dan password).
 */
export async function login(prevState, formData) {
  try {
    // Mendukung pemanggilan via useActionState(prevState, formData) atau langsung form action(formData)
    const data = formData instanceof FormData ? formData : prevState;
    const email = data?.get?.("email")?.toString()?.trim();
    const password = data?.get?.("password")?.toString();

    if (!email || !password) {
      return { error: "Email dan password wajib diisi." };
    }

    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const pesanError =
        error.message === "Invalid login credentials"
          ? "Email atau password salah."
          : error.message;
      return { error: pesanError };
    }
  } catch (err) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith?.("NEXT_REDIRECT")) {
      throw err;
    }
    return { error: err.message || "Terjadi kesalahan saat masuk." };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

/**
 * Server Action untuk mengakhiri sesi admin (logout) lalu kembali ke /admin/login.
 */
export async function logout() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}

export const keluar = logout;

/**
 * Server Action untuk ganti password admin yang sedang login.
 */
export async function gantiPassword(prevState, formData) {
  try {
    const data = formData instanceof FormData ? formData : prevState;
    const passwordBaru = data?.get?.("password_baru")?.toString();
    const konfirmasiPassword = data?.get?.("konfirmasi_password")?.toString();

    if (!passwordBaru || !konfirmasiPassword) {
      return { error: "Semua kolom password wajib diisi." };
    }

    if (passwordBaru.length < 8) {
      return { error: "Password baru minimal 8 karakter." };
    }

    if (passwordBaru !== konfirmasiPassword) {
      return { error: "Konfirmasi password tidak sama dengan password baru." };
    }

    const supabase = await createSessionClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Anda harus masuk terlebih dahulu sebagai admin." };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (updateError) {
      return { error: updateError.message };
    }

    return { success: "Password berhasil diganti." };
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat mengganti password." };
  }
}

export const ubahPassword = gantiPassword;
