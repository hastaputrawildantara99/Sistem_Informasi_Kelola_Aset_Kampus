# Dokumentasi Modul Reservasi Fasilitas — US 1–5

## 1. Ruang lingkup

Modul ini menangani pencarian fasilitas, pemeriksaan ketersediaan,
pengajuan reservasi, pembatalan oleh pemilik, serta riwayat dan detail
reservasi.

Teknologi yang digunakan: Next.js App Router, TypeScript, Prisma,
dan MySQL. Modul memanfaatkan autentikasi yang sudah tersedia
pada proyek.

| SRS/User Story | Implementasi |
| --- | --- |
| US 1 | Katalog fasilitas dan ketersediaan per slot tanpa detail pemohon |
| US 2 | Pencarian berdasarkan tipe, lokasi, dan kapasitas minimum |
| US 3 | Pengajuan reservasi dengan tujuan penggunaan |
| US 4 | Pembatalan reservasi milik sendiri sesuai batas waktu |
| US 5 | Riwayat, status, dan detail reservasi milik sendiri |

Login/registrasi, verifikasi akun, pengelolaan master fasilitas,
persetujuan oleh petugas, laporan kerusakan, dan rekap admin
merupakan modul terkait di luar cakupan utama US 1–5.

## 2. Kondisi implementasi

API dan tampilan US 1–5 sudah tersedia.

Fitur yang tersedia:
- Katalog dan filter fasilitas.
- Panel ketersediaan berdasarkan fasilitas dan tanggal.
- Form pengajuan reservasi.
- Halaman riwayat dan detail reservasi.
- Pembatalan reservasi oleh pemilik.
- Validasi server untuk waktu, bentrok, status fasilitas, dan kepemilikan.

Hasil pengujian terakhir:
- 64 tes aturan reservasi lulus.
- 12 skenario handler pembuatan reservasi lulus dalam simulasi.
- Pemeriksaan TypeScript dan ESLint pada file terkait berhasil.

Simulasi handler menggunakan database dan sesi login tiruan.
Simulasi tersebut dijalankan di memori dan bukan bagian dari
64 tes dalam `npm run test:reservations`.

Pengujian dua akun melalui aplikasi dan permintaan bersamaan
ke database asli belum dilakukan pada pemeriksaan terakhir.

## 3. Aturan bisnis

### 3.1 Waktu reservasi

- Zona waktu kampus: WIB (`Asia/Jakarta`).
- Jam operasional: 07.00–20.00.
- Durasi satu slot: 30 menit.
- Menit mulai dan selesai hanya boleh `00` atau `30`.
- Format input waktu: `HH:mm`.
- Waktu selesai harus sesudah waktu mulai pada tanggal yang sama.
- Satu reservasi boleh mencakup beberapa slot berurutan.
- Pengajuan wajib dilakukan minimal 48 jam sebelum waktu mulai.
- Tepat 48 jam masih diperbolehkan.
- Validasi menggunakan waktu server.

Contoh: reservasi 30 September pukul 16.00 WIB harus diajukan
paling lambat 28 September pukul 16.00 WIB.

Tanggal dan jam dari pengguna dikonversi menjadi `Date` UTC.
Kolom MySQL `DATETIME` digunakan dengan konvensi penyimpanan UTC.

### 3.2 Ketersediaan dan bentrok

| Status reservasi | Memblokir jadwal |
| --- | --- |
| PENDING | Ya |
| APPROVED | Ya |
| REJECTED | Tidak |
| CANCELLED | Tidak |

Pengecekan berlaku pada fasilitas yang sama, termasuk jika
pengajuan baru berasal dari pengguna yang sama.

Dua rentang bertabrakan jika:

```text
existing.startTime < requested.endTime
AND
existing.endTime > requested.startTime
```

Contoh jika terdapat reservasi 09.00–10.00:

| Pengajuan baru pada fasilitas yang sama | Hasil |
| --- | --- |
| 09.00–10.00 | Bentrok |
| 09.30–10.30 | Bentrok |
| 08.30–09.00 | Tidak bentrok |
| 10.00–11.00 | Tidak bentrok |

Rentang yang tidak bentrok tetap harus memenuhi aturan lainnya.

Slot dapat diajukan jika:
- Fasilitas berstatus ACTIVE.
- Waktu mulai slot minimal 48 jam dari waktu server.
- Tidak bertabrakan dengan PENDING atau APPROVED.

Status ACTIVE tidak berarti semua jadwal fasilitas kosong.

Fasilitas MAINTENANCE tetap muncul pada katalog, tetapi tidak
dapat dipesan. Fasilitas INACTIVE tidak ditampilkan pada katalog.

### 3.3 Pengajuan

- Hanya akun dengan role USER yang dapat mengajukan.
- Identitas pemilik diambil dari sesi login.
- Tujuan penggunaan wajib diisi, maksimal 2.000 karakter.
- Status awal reservasi adalah PENDING.
- PENDING memblokir jadwal, tetapi belum berarti disetujui petugas.
- Server memeriksa bentrok dan menyimpan reservasi dalam transaksi.
- Baris fasilitas dikunci menggunakan `SELECT ... FOR UPDATE`.
- Validasi waktu diulang setelah kunci fasilitas didapatkan.

### 3.4 Pembatalan

- Hanya pemilik yang dapat membatalkan melalui API pengguna.
- Status yang dapat dibatalkan: PENDING dan APPROVED.
- Pembatalan paling lambat 24 jam sebelum waktu mulai.
- Tepat pada batas 24 jam masih diperbolehkan.
- Setelah batas tersebut, pembatalan pengguna ditolak.
- Keputusan akhir menggunakan waktu server.
- Pembatalan mengubah status menjadi CANCELLED dan mencatat
  waktu serta alasan pembatalan.

Contoh: reservasi 30 September pukul 16.00 WIB dapat dibatalkan
paling lambat 29 September pukul 16.00 WIB.

Pembatalan menghilangkan blok jadwal dari reservasi tersebut.
Namun, pengajuan pengganti tetap harus memenuhi aturan minimal
48 jam dan pemeriksaan ketersediaan lainnya.

Pembatalan darurat oleh petugas merupakan alur terpisah.

## 4. Struktur data

```text
User (1) ──── (N) Reservation (N) ──── (1) Facility
```

### Facility

| Field | Keterangan |
| --- | --- |
| id, code | ID dan kode fasilitas unik |
| name, description | Nama dan deskripsi |
| type | CLASSROOM, HALL, LABORATORY, EQUIPMENT, FIELD |
| location | Lokasi yang digunakan pada filter pencarian |
| building, floor | Informasi gedung dan lantai dalam schema bersama |
| capacity | Kapasitas fasilitas |
| status | ACTIVE, MAINTENANCE, INACTIVE |

Filter lokasi saat ini menggunakan field `location`, bukan
filter terpisah untuk `building` dan `floor`.

### Reservation

| Field | Keterangan |
| --- | --- |
| id | ID reservasi |
| userId | Relasi ke pemilik |
| facilityId | Relasi ke fasilitas |
| startTime, endTime | Waktu mulai dan selesai |
| purpose | Tujuan penggunaan |
| status | PENDING, APPROVED, REJECTED, CANCELLED |
| cancelledAt | Waktu pembatalan |
| cancellationReason | Alasan pembatalan |
| createdAt, updatedAt | Waktu pembuatan dan pembaruan |

Field Prisma `startTime` dan `endTime` dipetakan ke kolom
database `start_time` dan `end_time`.

Penghapusan pengguna atau fasilitas yang masih dirujuk reservasi
dibatasi melalui relasi `onDelete: Restrict`.

Index membantu query bentrok dan riwayat. Pencegahan bentrok
dilakukan oleh validasi dan transaksi, bukan oleh index saja.

Schema bersama juga memuat `Report` dan `User.verified`.
Keberadaan keduanya tidak berarti fitur laporan atau verifikasi
akun termasuk implementasi modul reservasi.

## 5. Halaman dan alur pengguna

| URL | Fungsi | SRS |
| --- | --- | --- |
| http://localhost:3000/ | Katalog, filter, jadwal, dan form pengajuan | US 1, 2, 3 |
| http://localhost:3000/reservations | Riwayat, detail, status, dan pembatalan | US 4, 5 |

Alur pengajuan:
1. Buka katalog fasilitas.
2. Gunakan filter jika diperlukan.
3. Klik “Lihat jadwal” pada fasilitas.
4. Pilih tanggal dan cek ketersediaan.
5. Login menggunakan akun pengguna untuk mengajukan.
6. Pilih waktu mulai, selesai, dan isi tujuan.
7. Kirim pengajuan.
8. Periksa hasilnya pada halaman Reservasi.

Pengunjung dapat melihat katalog dan jadwal tanpa login.
API publik tidak mengirim identitas pemohon atau tujuan reservasi.

Menu Reservasi pada navbar mengarah ke riwayat reservasi.
Pengajuan dimulai dari fasilitas yang dipilih pada katalog.

URL `/api/...` memberikan respons JSON, bukan halaman UI.

## 6. Kontrak API

| Method | Endpoint | Akses | Fungsi | SRS |
| --- | --- | --- | --- | --- |
| GET | /api/facilities | Publik | Daftar dan filter fasilitas | US 1, 2 |
| GET | /api/facilities/[id]/availability?date=YYYY-MM-DD | Publik | Ketersediaan slot | US 1 |
| POST | /api/reservations | USER | Pengajuan | US 3 |
| GET | /api/reservations | USER | Riwayat sendiri | US 5 |
| GET | /api/reservations/[id] | USER pemilik | Detail sendiri | US 5 |
| PATCH | /api/reservations/[id]/cancel | USER pemilik | Pembatalan | US 4 |

### Filter fasilitas

Contoh:

```text
/api/facilities?type=LABORATORY&location=Gedung&minCapacity=30
```

- `type`: nilai tipe fasilitas yang valid.
- `location`: pencarian bagian teks pada lokasi.
- `minCapacity`: bilangan bulat positif; kapasitas fasilitas
  harus sama dengan atau lebih besar dari nilai tersebut.
- Filter yang diberikan diterapkan bersama.

### Pengajuan reservasi

Header:

```text
Content-Type: application/json
```

Contoh body:

```json
{
  "facilityId": 4,
  "date": "2026-10-01",
  "startTime": "09:00",
  "endTime": "10:00",
  "purpose": "Diskusi kelompok"
}
```

Ganti ID fasilitas dan tanggal sesuai data pengujian.
Waktu mulai harus minimal 48 jam setelah waktu pengajuan.

### Respons utama

| HTTP | Arti |
| --- | --- |
| 200 | Pengambilan data atau pembatalan berhasil |
| 201 | Pengajuan berhasil dibuat |
| 400 | Input tidak valid, termasuk pelanggaran minimal 48 jam |
| 401 | Sesi login tidak valid atau akun tidak ditemukan |
| 403 | Role tidak diperbolehkan |
| 404 | Data tidak ditemukan atau reservasi bukan milik pengguna |
| 409 | Bentrok, fasilitas tidak dapat dipesan, pembatalan tidak diizinkan, atau konflik transaksi |
| 415 | Content-Type pengajuan bukan application/json |
| 500 | Kesalahan internal server |

Pelanggaran minimal 48 jam pada pengajuan menggunakan kode
`MINIMUM_BOOKING_NOTICE` dalam respons.

## 7. Lokasi implementasi

Semua path berikut relatif terhadap folder `website`.

| File | Tanggung jawab |
| --- | --- |
| lib/reservations/rules.ts | Aturan waktu, ketersediaan, bentrok, pembatalan |
| tests/reservation-rules.test.mjs | Tes aturan reservasi |
| app/api/facilities/route.ts | Daftar dan filter |
| app/api/facilities/[id]/availability/route.ts | Ketersediaan |
| app/api/reservations/route.ts | Pengajuan dan riwayat |
| app/api/reservations/[id]/route.ts | Detail |
| app/api/reservations/[id]/cancel/route.ts | Pembatalan |
| components/facilities/facility-list.tsx | Tampilan katalog dan filter |
| components/facilities/facility-availability.tsx | Panel jadwal |
| components/reservations/reservation-form.tsx | Form pengajuan |
| components/reservations/reservation-history.tsx | Riwayat, detail, dan pembatalan |
| app/page.tsx | Integrasi katalog pada halaman utama |
| app/reservations/page.tsx | Halaman riwayat |
| components/dashboard/navbar.tsx | Navigasi ke katalog dan reservasi |

## 8. Menjalankan dan memeriksa proyek

Jalankan perintah dari folder `website`.

Dependency:

```powershell
npm ci
```

Gunakan konfigurasi database dan autentikasi yang disepakati tim.
Jangan memasukkan file `.env` atau kredensial ke dokumentasi.

Pemeriksaan schema dan status migration:

```powershell
npx prisma validate
npx prisma migrate status
```

Terdapat enam folder migration pada repository saat dokumentasi
ini ditinjau. Jumlah folder lokal tidak membuktikan semuanya
sudah diterapkan pada database; periksa hasil `migrate status`.

Jika diperlukan pembaruan Prisma Client:

```powershell
npx prisma generate
```

Jika muncul EPERM pada Windows, hentikan proses aplikasi atau
Prisma Studio yang memakai Prisma Client, lalu ulangi generate.

Jalankan aplikasi:

```powershell
npm run dev
```

Jalankan tes dan pemeriksaan tipe:

```powershell
npm run test:reservations
npx tsc --noEmit --incremental false
```

Hasil terakhir tes aturan: 64 lulus, 0 gagal.
Tes tersebut tidak mengakses database.

Perubahan aturan 48 jam dan status pemblokir tidak membutuhkan
migration karena tidak mengubah struktur database.

## 9. Pengujian lanjutan

Gunakan fasilitas aktif dan tanggal lebih dari 48 jam ke depan
untuk menguji bentrok tanpa terhalang validasi waktu.

| Skenario | Hasil yang diharapkan |
| --- | --- |
| Pengajuan kurang dari 48 jam | 400 |
| Tepat 48 jam pada waktu pemeriksaan server | Diizinkan jika validasi lain lolos |
| Pengguna A mengajukan slot kosong | 201, PENDING |
| Pengguna B mengajukan slot yang sama | 409 |
| Pengajuan sebagian bertabrakan | 409 |
| Pengajuan duplikat oleh pemilik yang sama | 409 |
| Pengajuan waktu berdampingan | Diizinkan jika validasi lain lolos |
| Pengajuan pada fasilitas berbeda | Diizinkan jika fasilitas tersedia |
| Pembatalan lewat batas 24 jam | 409 |
| Membuka reservasi pengguna lain | 404 |
| Dua pengajuan bersamaan pada slot kosong yang sama | Tidak boleh keduanya berhasil |

Batas tepat 48 jam dan 24 jam paling tepat diuji dengan waktu
terkontrol. Pengujian manual dapat melewati batas selama
permintaan dikirim ke server.

## 10. Catatan integrasi dan keterbatasan

- Tampilan jadwal belum diperbarui secara real-time. Jalankan
  kembali pengecekan ketersediaan untuk mengambil kondisi terbaru.
  Server tetap mengecek bentrok saat pengajuan.
- Data PENDING lama yang saling bertabrakan perlu ditinjau
  bersama petugas setelah penerapan kebijakan baru.
- Belum ada aturan kedaluwarsa otomatis untuk PENDING.
- Modul persetujuan petugas perlu mengikuti mekanisme penguncian
  fasilitas dan mengecualikan ID reservasi yang sedang disetujui
  dari pemeriksaan bentrok.
- Pemeriksaan `verified` belum diterapkan pada login dan API
  pengajuan yang ditinjau. Integrasi verifikasi akun perlu
  dikoordinasikan dengan penanggung jawab autentikasi/US 15.
- Keberhasilan tes aturan dan simulasi handler belum membuktikan
  seluruh alur browser serta konkurensi database asli.