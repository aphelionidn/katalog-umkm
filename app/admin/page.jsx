import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin({ searchParams }) {
  const sp = await searchParams;
  const pesanSukses = sp?.sukses || sp?.pesan;
  const pesanErrorUrl = sp?.error;

  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  let daftarProduk = [];
  let errorMsg = null;

  const { data, error } = await supabase
    .from("produk")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    errorMsg = error.message;
  } else {
    daftarProduk = data || [];
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {pesanSukses && (
        <div className="rounded-lg border border-garis bg-permukaan p-3 text-sm font-medium text-utama">
          {pesanSukses}
        </div>
      )}

      {pesanErrorUrl && (
        <div className="rounded-lg border border-garis bg-permukaan p-3 text-sm font-medium text-bahaya">
          {pesanErrorUrl}
        </div>
      )}

      {errorMsg ? (
        <div className="rounded-xl border border-garis bg-permukaan p-4 text-bahaya">
          <p className="font-semibold">Gagal memuat produk: {errorMsg}</p>
        </div>
      ) : daftarProduk.length > 0 ? (
        <TabelProduk daftarProduk={daftarProduk} />
      ) : (
        <p className="text-teks-lembut">Belum ada produk</p>
      )}
    </div>
  );
}
