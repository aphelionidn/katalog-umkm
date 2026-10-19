"use client";

import Tombol from "@/components/Tombol";
import { hapusProduk } from "@/app/admin/actions";

export default function TombolHapus({ id, nama }) {
  return (
    <form
      action={hapusProduk}
      onSubmit={(e) => {
        const pesan = nama
          ? `Apakah Anda yakin ingin menghapus produk "${nama}"?`
          : "Apakah Anda yakin ingin menghapus produk ini?";
        if (!window.confirm(pesan)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Tombol type="submit" varian="bahaya">
        Hapus
      </Tombol>
    </form>
  );
}

