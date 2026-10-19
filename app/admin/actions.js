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
