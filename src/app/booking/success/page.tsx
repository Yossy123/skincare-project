'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  CheckCircle2,
  Video,
  MapPin,
  Calendar,
  Clock,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CalendarPlus,
} from 'lucide-react';
import { lookupBooking, type Appointment } from '@/lib/booking';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || searchParams.get('bookingId') || '';

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(Boolean(code));

  // Fallback values from query params if lookup fails or during transition
  const fallbackCustomerName = searchParams.get('customerName') || searchParams.get('name') || '-';
  const fallbackServiceName = searchParams.get('serviceName') || '-';
  const fallbackDoctorName = searchParams.get('doctorName') || '-';
  const fallbackDate = searchParams.get('date') || '-';
  const fallbackStartTime = searchParams.get('startTime') || '-';
  const fallbackEndTime = searchParams.get('endTime') || '-';
  const fallbackIsOnline = searchParams.get('consultationMode') === 'online';

  useEffect(() => {
    let isMounted = true;
    if (!code) {
      return;
    }

    lookupBooking(code)
      .then((data) => {
        if (isMounted) setAppointment(data);
      })
      .catch(() => {
        // Soft error: keep fallback display
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [code]);

  const bookingCode = appointment?.booking_code || code || 'LMR-BKG-CONFIRMED';
  const customerName = appointment?.patient?.name || fallbackCustomerName;
  const serviceName = appointment?.service?.name || fallbackServiceName;
  const doctorName = appointment?.doctor?.name || fallbackDoctorName;
  const date = appointment?.appointment_date || fallbackDate;
  const startTime = appointment?.start_time ? appointment.start_time.slice(0, 5) : fallbackStartTime;
  const endTime = appointment?.end_time ? appointment.end_time.slice(0, 5) : fallbackEndTime;
  const isOnline = (appointment?.consultation_mode || (fallbackIsOnline ? 'online' : 'offline')) === 'online';

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100/90 dark:border-zinc-800 p-12 text-center shadow-xl shadow-rose-950/5">
        <Sparkles className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Memuat detail tiket reservasi dari database...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100/90 dark:border-zinc-800 p-6 sm:p-10 shadow-xl shadow-rose-950/5 relative overflow-hidden">
      {/* Top Decorative Glow */}
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-32 bg-linear-to-b from-rose-200/40 via-pink-100/20 to-transparent dark:from-rose-900/20 dark:via-pink-900/10 dark:to-transparent blur-2xl pointer-events-none rounded-full"></div>

      {/* Header Status */}
      <div className="text-center relative z-10">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-linear-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-5 animate-in zoom-in-95">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Tersimpan di Database Klinik</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-zinc-900 dark:text-zinc-50 font-normal">
          Sampai Bertemu, {customerName !== '-' ? customerName : 'Pelanggan Setia'}!
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Jadwal reservasi perawatan kulit Anda telah berhasil dikonfirmasi dan dicatat pada agenda dokter spesialis kami.
        </p>

        {/* Booking ID Badge */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-stone-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
            Kode Booking:
          </span>
          <span className="font-mono text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
            {bookingCode}
          </span>
        </div>
      </div>

      {/* Appointment Details Ticket */}
      <div className="mt-8 rounded-2xl bg-stone-50 dark:bg-zinc-800/50 border border-rose-100/80 dark:border-zinc-800 p-5 sm:p-7 relative">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-rose-500 dark:text-rose-400 mb-4 flex items-center gap-1.5">
          <CalendarPlus className="w-4 h-4" />
          <span>Detail Jadwal Perawatan</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-rose-100/60 dark:border-zinc-700/60 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">Layanan Treatment</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{serviceName}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-rose-100/60 dark:border-zinc-700/60 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">Dokter / Specialist</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{doctorName}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-rose-100/60 dark:border-zinc-700/60 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">Tanggal Kunjungan</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{date}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-rose-100/60 dark:border-zinc-700/60 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">Waktu Sesi</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {startTime} – {endTime} WIB
              </span>
            </div>
          </div>

          <div className="sm:col-span-2 p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-rose-100/60 dark:border-zinc-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shrink-0">
                {isOnline ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">Format Konsultasi</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {isOnline ? 'Online (Telekonsultasi Video Call)' : 'Offline (Lumière Beauté Clinic Lounge)'}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-md border border-rose-100 dark:border-zinc-700">
              {isOnline ? 'Google Meet Link via WhatsApp' : 'VIP Clinic Lounge'}
            </span>
          </div>
        </div>
      </div>

      {/* Next steps advice */}
      <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold block mb-0.5">Petunjuk Sebelum Sesi:</span>
          {isOnline ? (
            <span>
              Tautan Google Meet dan panduan persiapan kulit akan dikonfirmasikan oleh tim kami ke nomor WhatsApp Anda sebelum waktu konsultasi dimulai.
            </span>
          ) : (
            <span>
              Harap hadir 10–15 menit lebih awal di lounge klinik kami untuk proses registrasi dan skin scanner check-in.
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
        <Link
          href="/"
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-white bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-500/25 transition-all text-center active:scale-[0.98]"
        >
          <span>Kembali ke Beranda</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/booking"
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-zinc-800 border border-rose-200/80 dark:border-zinc-700 transition-all text-center shadow-xs"
        >
          <span>Booking Treatment Lain</span>
        </Link>
      </div>
    </div>
  );
}

export default function BookingSuccess() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50/60 dark:bg-zinc-950 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <Suspense
          fallback={
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 p-12 text-center">
              <Sparkles className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-zinc-600">Memuat detail reservasi...</p>
            </div>
          }
        >
          <BookingSuccessContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
