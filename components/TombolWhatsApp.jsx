import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function TombolWhatsApp({
  produk,
  jumlah = 1,
  varian = "Standar",
  totalHarga,
}) {
  const total =
    totalHarga !== undefined ? totalHarga : (produk?.harga || 0) * jumlah;
  const teksVarian = varian ? ` - Varian: ${varian}` : "";
  const pesan = `Halo, saya mau pesan ${produk?.nama || "Produk"}${teksVarian} - Jumlah: ${jumlah} pcs (Total: ${formatRupiah(total)}).`;
  const href = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white transition-colors hover:bg-utama-gelap sm:w-auto"
    >
      Pesan via WhatsApp
    </a>
  );
}
