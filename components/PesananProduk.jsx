"use client";

import { useState } from "react";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import { formatRupiah } from "@/lib/format";

export default function PesananProduk({ produk }) {
  const [jumlah, setJumlah] = useState(1);

  // Menentukan opsi varian berdasarkan objek produk atau kategori produk
  const opsiVarian = Array.isArray(produk?.varian) && produk.varian.length > 0
    ? produk.varian
    : ["Laptop", "Perangkat", "Elektronik"].includes(produk?.kategori)
    ? ["Standar", "Upgrade RAM / SSD", "Paket Lengkap"]
    : ["Minuman", "Camilan", "Bumbu"].includes(produk?.kategori)
    ? ["Original", "Ekstra Pedas", "Porsi Besar"]
    : ["Standar", "Spesial", "Custom"];

  const [varian, setVarian] = useState(opsiVarian[0] || "Standar");

  const totalHarga = (produk?.harga || 0) * jumlah;

  return (
    <div className="flex flex-col gap-4 border-t border-garis pt-4">
      {/* Pemilihan Varian */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-teks">Pilihan Varian:</span>
        <div className="flex flex-wrap gap-2">
          {opsiVarian.map((v) => {
            const isActive = varian === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setVarian(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-utama text-white"
                    : "border border-garis bg-permukaan text-teks hover:border-utama hover:text-utama"
                }`}
              >
                {v}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pengatur Jumlah Pesanan */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-teks">Jumlah Pesanan:</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setJumlah((prev) => Math.max(1, prev - 1))}
            disabled={jumlah <= 1}
            aria-label="Kurangi jumlah"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-garis bg-permukaan text-base font-bold text-teks transition-colors hover:bg-latar disabled:opacity-40"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={jumlah}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setJumlah(isNaN(val) || val < 1 ? 1 : val);
            }}
            aria-label="Jumlah pesanan"
            className="h-9 w-14 rounded-lg border border-garis bg-latar text-center text-sm font-semibold text-teks focus:border-utama focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setJumlah((prev) => prev + 1)}
            aria-label="Tambah jumlah"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-garis bg-permukaan text-base font-bold text-teks transition-colors hover:bg-latar"
          >
            +
          </button>
        </div>
      </div>

      {/* Rincian Total Harga */}
      <div className="flex items-center justify-between rounded-xl bg-permukaan p-3.5">
        <span className="text-sm font-medium text-teks-lembut">
          Total ({jumlah} barang):
        </span>
        <span className="text-lg font-extrabold text-harga">
          {formatRupiah(totalHarga)}
        </span>
      </div>

      {/* Tombol Pemesanan WhatsApp */}
      <TombolWhatsApp
        produk={produk}
        jumlah={jumlah}
        varian={varian}
        totalHarga={totalHarga}
      />
    </div>
  );
}

