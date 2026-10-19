import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import { toko } from "@/lib/toko";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog({ searchParams }) {
  const sp = await searchParams;
  const q = (sp?.q || "").trim();
  const kategori = (sp?.kategori || "").trim();

  let daftarProduk = null;
  let daftarKategori = [];
  let errorMsg = null;

  try {
    const supabase = createClient();

    // Ambil daftar kategori unik dari tabel produk
    const { data: kategoriRows } = await supabase
      .from("produk")
      .select("kategori");

    daftarKategori = Array.from(
      new Set(
        (kategoriRows || [])
          .map((p) => p.kategori?.trim())
          .filter(Boolean)
      )
    ).sort();

    // Query produk dengan filter pencarian dan kategori
    let query = supabase.from("produk").select("*");

    if (kategori && kategori !== "Semua") {
      query = query.eq("kategori", kategori);
    }

    if (q) {
      query = query.or(`nama.ilike.%${q}%,deskripsi.ilike.%${q}%`);
    }

    const { data, error } = await query.order("id", { ascending: true });

    if (error) {
      errorMsg = error.message;
    } else {
      daftarProduk = data;
    }
  } catch (err) {
    errorMsg = err.message || "Gagal terhubung ke database.";
  }

  const isFiltered = Boolean(q || (kategori && kategori !== "Semua"));

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="judul-produk" className="text-xl font-bold">
              Produk kami
            </h2>
            {isFiltered && (
              <Link
                href="/"
                className="text-sm font-medium text-teks-lembut underline underline-offset-4 hover:text-utama"
              >
                Reset filter
              </Link>
            )}
          </div>

          {/* Form Pencarian */}
          <form method="GET" action="/" className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari produk berdasarkan nama atau deskripsi..."
              className="w-full rounded-lg border border-garis bg-latar px-3.5 py-2.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
            {kategori && kategori !== "Semua" && (
              <input type="hidden" name="kategori" value={kategori} />
            )}
            <button
              type="submit"
              className="rounded-lg bg-utama px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-utama-gelap"
            >
              Cari
            </button>
            {isFiltered && (
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-garis bg-latar px-3.5 py-2.5 text-sm font-medium text-teks-lembut transition-colors hover:border-utama hover:text-utama"
              >
                Reset
              </Link>
            )}
          </form>

          {/* Filter Kategori */}
          {daftarKategori.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-teks-lembut">Kategori:</span>
              <Link
                href={q ? `/?q=${encodeURIComponent(q)}` : "/"}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  !kategori || kategori === "Semua"
                    ? "bg-utama text-white"
                    : "border border-garis bg-permukaan text-teks hover:border-utama hover:text-utama"
                }`}
              >
                Semua
              </Link>
              {daftarKategori.map((kat) => {
                const isActive = kategori === kat;
                const href = isActive
                  ? (q ? `/?q=${encodeURIComponent(q)}` : "/")
                  : (q ? `/?q=${encodeURIComponent(q)}&kategori=${encodeURIComponent(kat)}` : `/?kategori=${encodeURIComponent(kat)}`);
                return (
                  <Link
                    key={kat}
                    href={href}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-utama text-white"
                        : "border border-garis bg-permukaan text-teks hover:border-utama hover:text-utama"
                    }`}
                  >
                    {kat}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {errorMsg ? (
          <div className="rounded-xl border border-garis bg-permukaan p-4 text-bahaya">
            <p className="font-semibold">Gagal memuat produk: {errorMsg}</p>
            <p className="mt-1 text-sm text-teks-lembut">
              Periksa konfigurasi database atau koneksi internet Anda.
            </p>
          </div>
        ) : daftarProduk && daftarProduk.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        ) : isFiltered ? (
          <div className="rounded-xl border border-garis bg-permukaan p-6 text-center">
            <p className="font-medium text-teks">Produk tidak ditemukan untuk pencarian ini.</p>
            <p className="mt-1 text-sm text-teks-lembut">
              Coba kata kunci lain atau pilih kategori yang berbeda.
            </p>
            <div className="mt-4">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-utama-gelap"
              >
                Lihat semua produk
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-teks-lembut">Belum ada produk</p>
        )}
      </section>
    </>
  );
}
