"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Helper untuk memastikan admin sudah login sebelum menjalankan aksi yang mengubah data.
 */
export async function requireAdmin() {
  const supabase = await createSessionClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Anda harus masuk terlebih dahulu sebagai admin.");
  }

  return { supabase, user };
}

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

    // Memeriksa bahwa admin sudah login di server
    const { supabase } = await requireAdmin();

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

/**
 * Server Action untuk menambah produk baru ke database Supabase.
 */
export async function tambahProduk(prevState, formData) {
  try {
    const data = formData instanceof FormData ? formData : prevState;
    const nama = data?.get?.("nama")?.toString()?.trim();
    const hargaStr = data?.get?.("harga")?.toString()?.trim();
    const kategori = data?.get?.("kategori")?.toString()?.trim() || null;
    const deskripsi = data?.get?.("deskripsi")?.toString()?.trim() || null;
    const foto_url =
      (data?.get?.("foto_url") || data?.get?.("gambar"))?.toString()?.trim() || null;

    // Validasi input
    if (!nama) {
      return { error: "Nama produk wajib diisi." };
    }

    if (!hargaStr || isNaN(Number(hargaStr))) {
      return { error: "Harga wajib diisi dengan angka." };
    }

    const harga = parseInt(hargaStr, 10);
    if (harga < 0) {
      return { error: "Harga harus berupa angka positif." };
    }

    // Verifikasi sesi admin di sisi server sebelum insert
    let supabase;
    try {
      const auth = await requireAdmin();
      supabase = auth.supabase;
    } catch {
      return { error: "Operasi ditolak: Anda harus login sebagai admin." };
    }

    // Simpan ke database Supabase
    const { error: insertError } = await supabase.from("produk").insert([
      {
        nama,
        harga,
        kategori,
        deskripsi,
        foto_url,
      },
    ]);

    if (insertError) {
      return { error: `Gagal menyimpan produk: ${insertError.message}` };
    }
  } catch (err) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith?.("NEXT_REDIRECT")) {
      throw err;
    }
    return { error: err.message || "Terjadi kesalahan saat menyimpan produk." };
  }

  // Revalidate rute katalog dan admin
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?sukses=" + encodeURIComponent("Produk berhasil ditambahkan."));
}

/**
 * Server Action untuk memperbarui data produk di Supabase.
 */
export async function ubahProduk(prevState, formData) {
  let productId;
  try {
    const data = formData instanceof FormData ? formData : prevState;
    const idStr = data?.get?.("id")?.toString()?.trim();
    const nama = data?.get?.("nama")?.toString()?.trim();
    const hargaStr = data?.get?.("harga")?.toString()?.trim();
    const kategori = data?.get?.("kategori")?.toString()?.trim() || null;
    const deskripsi = data?.get?.("deskripsi")?.toString()?.trim() || null;
    const foto_url =
      (data?.get?.("foto_url") || data?.get?.("gambar"))?.toString()?.trim() || null;

    if (!idStr) {
      return { error: "ID produk tidak valid." };
    }

    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return { error: "ID produk harus berupa angka." };
    }
    productId = id;

    // Validasi input
    if (!nama) {
      return { error: "Nama produk wajib diisi." };
    }

    if (!hargaStr || isNaN(Number(hargaStr))) {
      return { error: "Harga wajib diisi dengan angka." };
    }

    const harga = parseInt(hargaStr, 10);
    if (harga < 0) {
      return { error: "Harga harus berupa angka positif." };
    }

    // Verifikasi sesi admin di sisi server sebelum update
    let supabase;
    try {
      const auth = await requireAdmin();
      supabase = auth.supabase;
    } catch {
      return { error: "Operasi ditolak: Anda harus login sebagai admin." };
    }

    // Update produk di tabel "produk"
    const { error: updateError } = await supabase
      .from("produk")
      .update({
        nama,
        harga,
        kategori,
        deskripsi,
        foto_url,
      })
      .eq("id", productId);

    if (updateError) {
      return { error: `Gagal memperbarui produk: ${updateError.message}` };
    }
  } catch (err) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith?.("NEXT_REDIRECT")) {
      throw err;
    }
    return { error: err.message || "Terjadi kesalahan saat memperbarui produk." };
  }

  // Revalidate rute katalog, admin, dan detail produk terkait
  revalidatePath("/");
  revalidatePath("/admin");
  if (productId) {
    revalidatePath(`/produk/${productId}`);
  }
  redirect("/admin?sukses=" + encodeURIComponent("Produk berhasil diperbarui."));
}

export const editProduk = ubahProduk;

/**
 * Server Action untuk menghapus produk dari tabel "produk" di Supabase.
 */
export async function hapusProduk(arg1, arg2) {
  let id;
  const isDirect = arg1 instanceof FormData;
  const data = arg2 instanceof FormData ? arg2 : (isDirect ? arg1 : null);

  if (data) {
    const idStr = data.get("id")?.toString()?.trim();
    id = idStr ? parseInt(idStr, 10) : null;
  } else if (typeof arg1 === "number" || typeof arg1 === "string") {
    id = parseInt(arg1.toString(), 10);
  }

  if (!id || isNaN(id)) {
    if (isDirect) {
      redirect("/admin?error=" + encodeURIComponent("ID produk tidak valid."));
    }
    return { error: "ID produk tidak valid." };
  }

  // Wajib periksa autentikasi/sesi admin di server sebelum DELETE
  let supabase;
  try {
    const auth = await requireAdmin();
    supabase = auth.supabase;
  } catch {
    if (isDirect) {
      redirect("/admin?error=" + encodeURIComponent("Operasi ditolak: Anda harus login sebagai admin."));
    }
    return { error: "Operasi ditolak: Anda harus login sebagai admin." };
  }

  try {
    const { error: deleteError } = await supabase
      .from("produk")
      .delete()
      .eq("id", id);

    if (deleteError) {
      if (isDirect) {
        redirect("/admin?error=" + encodeURIComponent(`Gagal menghapus produk: ${deleteError.message}`));
      }
      return { error: `Gagal menghapus produk: ${deleteError.message}` };
    }
  } catch (err) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith?.("NEXT_REDIRECT")) {
      throw err;
    }
    return { error: err.message || "Terjadi kesalahan saat menghapus produk." };
  }

  revalidatePath("/", "page");
  revalidatePath("/admin", "page");
  redirect("/admin?sukses=" + encodeURIComponent("Produk berhasil dihapus."));
}

/**
 * Server Action untuk menghasilkan deskripsi produk otomatis menggunakan Google Gemini API.
 */
export async function generateDeskripsiAI({ nama, kategori }) {
  // Wajib periksa sesi login admin di sisi server sebelum generate
  try {
    await requireAdmin();
  } catch {
    return { error: "Operasi ditolak: Anda harus login sebagai admin." };
  }

  if (!nama || !nama.trim()) {
    return { error: "Nama produk harus diisi terlebih dahulu." };
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    return {
      error:
        "GEMINI_API_KEY belum dikonfigurasi di environment variable (.env.local). Silakan tambahkan GEMINI_API_KEY.",
    };
  }

  const promptText = `Anda adalah seorang copywriter ahli untuk toko online dan UMKM. 
Buat deskripsi produk yang menarik, persuasif, ringkas (1-2 paragraf), dan relevan dalam Bahasa Indonesia untuk produk berikut:
- Nama Produk: ${nama.trim()}
${kategori?.trim() ? `- Kategori: ${kategori.trim()}` : ""}

Pedoman:
- Deskripsikan kegunaan, keunggulan, dan daya tarik utama produk ini bagi pembeli.
- Tulis langsung teks deskripsinya tanpa kalimat pembuka seperti "Tentu, ini deskripsinya" dan tanpa tanda kutip.`;

  const primaryModel = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const candidateModels = Array.from(
    new Set([primaryModel, "gemini-3.5-flash", "gemini-flash-latest", "gemini-3.8-flash"])
  );

  let lastError = null;

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptText,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        lastError = data.error?.message || `Gagal menghubungi Gemini API (Status ${response.status}).`;
        continue;
      }

      const deskripsi = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (deskripsi) {
        return { deskripsi };
      }
    } catch (err) {
      lastError = err.message || "Terjadi kesalahan saat memproses permintaan AI.";
    }
  }

  return { error: lastError || "AI tidak menghasilkan respons. Silakan coba lagi." };
}

