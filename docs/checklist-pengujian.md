# Checklist Pengujian

Uji di link Vercel, bukan hanya di laptop. Coba juga di HP.

## Pengunjung

- [done] Katalog menampilkan semua produk dari database (bukan data contoh).
- [done] Harga tampil dalam format rupiah, misalnya Rp 45.000.
- [done] Klik kartu produk membuka halaman detail produk yang benar.
- [done] Alamat produk yang tidak ada (misalnya `/produk/9999`) menampilkan halaman "tidak ditemukan".
- [done] Tombol "Pesan via WhatsApp" membuka WhatsApp ke nomor toko dengan pesan berisi nama dan harga produk.
- [done] Tampilan rapi di HP: teks terbaca, tombol mudah ditekan, tidak ada yang terpotong.

## Admin

- [done] Login dengan email dan password yang benar berhasil masuk ke `/admin`.
- [done] Login dengan password salah menampilkan pesan error.
- [done] Ganti password berhasil, lalu login dengan password baru berhasil.
- [done] Password baru kurang dari 8 karakter atau tidak sama dengan konfirmasi ditolak dengan pesan yang jelas.
- [done] Tombol "Keluar" mengakhiri sesi.

## Bonus (jika dikerjakan)

- [done] Tambah produk: produk baru muncul di katalog.
- [done] Ubah produk: perubahan muncul di katalog.
- [done] Hapus produk: produk hilang dari katalog setelah konfirmasi.
