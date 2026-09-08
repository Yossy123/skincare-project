# Google Sheets + Calendar booking

1. Buat Google Spreadsheet, buka Extensions → Apps Script, lalu tempel `Code.gs`.
2. Buat sheet `Doctors`, `Services`, dan `Schedules` dengan header yang dipakai di `Code.gs` (`doctor_id`, `name`, `specialization`, `calendar_id`, `active`; `service_id`, `name`, `description`, `duration_minutes`, `price`, `active`; `schedule_id`, `doctor_id`, `day_of_week`, `start_time`, `end_time`, `active`).
3. Isi data dokter, layanan, dan jadwal. `calendar_id` dapat diisi `primary` atau ID kalender Google.
4. Deploy → New deployment → Web app. Pilih execute as akun pemilik dan akses `Anyone`.
5. Isi URL deployment pada `.env.local` sebagai `NEXT_PUBLIC_APPS_SCRIPT_URL=...`, lalu restart Next.js.

Sheet `Bookings` dibuat otomatis. Setujui izin Calendar dan Spreadsheet saat deployment pertama.
