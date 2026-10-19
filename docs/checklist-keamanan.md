# Checklist Keamanan

Cek semua poin ini sebelum mengumpulkan karya. Poin ini juga dipakai saat penilaian.

- [done] Buka situs di browser, klik kanan > Inspect > tab Network. Muat ulang halaman: tidak ada permintaan ke alamat `supabase.co`.
- [done] Cari kata `supabase` dan `NEXT_PUBLIC` di seluruh kode: tidak ada environment variable berawalan `NEXT_PUBLIC_`.
- [done] File `.env.local` tidak ikut ter-push ke GitHub (cek di halaman repo).
- [done] Buka `/admin` di jendela penyamaran (incognito) tanpa login: dialihkan ke `/admin/login`.
- [done] Buka `/admin/password` tanpa login: dialihkan ke `/admin/login`.
- [done] Login dengan password bawaan: gagal, karena password sudah diganti.
- [done] RLS di tabel `produk` aktif (Supabase > Table Editor > produk: tidak ada label "RLS disabled").
- [done] Tidak ada email, password, atau kunci yang ditulis di kode.
- [done] (Bonus) Aksi tambah, ubah, dan hapus produk ditolak jika tidak login.
