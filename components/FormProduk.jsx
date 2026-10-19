"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { generateDeskripsiAI } from "@/app/admin/actions";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
// Nama field sama dengan kolom tabel "produk".
export default function FormProduk({
  produk = {},
  labelTombol = "Simpan produk",
  action,
  state,
  isPending,
}) {
  const [nama, setNama] = useState(produk.nama || "");
  const [kategori, setKategori] = useState(produk.kategori || "");
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");
  const [loadingAI, setLoadingAI] = useState(false);
  const [errorAI, setErrorAI] = useState("");

  const handleGenerateAI = async () => {
    if (!nama.trim()) {
      setErrorAI("Silakan isi nama produk terlebih dahulu.");
      return;
    }

    setLoadingAI(true);
    setErrorAI("");

    try {
      const res = await generateDeskripsiAI({
        nama: nama.trim(),
        kategori: kategori.trim(),
      });

      if (res?.error) {
        setErrorAI(res.error);
      } else if (res?.deskripsi) {
        setDeskripsi(res.deskripsi);
      }
    } catch (err) {
      setErrorAI(err.message || "Gagal membuat deskripsi dengan AI.");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      {state?.error && (
        <div className="rounded-lg border border-garis bg-permukaan p-3 text-sm text-bahaya">
          {state.error}
        </div>
      )}
      {produk?.id && <input type="hidden" name="id" defaultValue={produk.id} />}
      <Input
        label="Nama produk"
        name="nama"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        required
      />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />
      <Input
        label="Kategori"
        name="kategori"
        value={kategori}
        onChange={(e) => setKategori(e.target.value)}
      />
      <Input
        label="Link foto / Gambar"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url || produk.gambar}
      />

      {/* Bagian Deskripsi dengan Tombol AI */}
      <div className="flex flex-col gap-1.5 text-sm font-semibold">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="deskripsi-input">Deskripsi</label>
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={loadingAI}
            className="inline-flex items-center gap-1.5 rounded-md border border-utama/30 bg-utama/10 px-2.5 py-1 text-xs font-semibold text-utama transition-colors hover:bg-utama hover:text-white disabled:opacity-50"
          >
            <span>✨</span>
            <span>{loadingAI ? "Sedang membuat deskripsi..." : "Buat Deskripsi dengan AI"}</span>
          </button>
        </div>

        {errorAI && (
          <p className="text-xs font-normal text-bahaya">
            {errorAI}
          </p>
        )}

        <textarea
          id="deskripsi-input"
          name="deskripsi"
          rows={4}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          placeholder="Jelaskan keunggulan dan spesifikasi produk Anda..."
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base font-normal text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <Tombol type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
