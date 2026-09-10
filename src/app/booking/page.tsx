import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BookingForm } from '@/components/BookingForm';
import { Sparkles, ShieldCheck, Clock, Award, Calendar, HeartHandshake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Appointment Booking | NOBYDERM',
  description: 'Reservasi konsultasi kecantikan dan perawatan kulit eksklusif bersama dokter spesialis dan beauty therapist profesional.',
};

export default function BookingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50/60 dark:bg-zinc-950 transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-linear-to-b from-rose-100/70 via-pink-50/40 to-stone-50/60 dark:from-rose-950/30 dark:via-zinc-900 dark:to-zinc-950 py-12 sm:py-16 border-b border-rose-100/70 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-rose-200/80 dark:border-zinc-700 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>VIP Clinical & Beauty Reservation</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-tight text-zinc-900 dark:text-zinc-50 font-normal leading-[1.2]">
              Atur Jadwal Perawatan Kulit Anda
            </h1>

            <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              Pilih perawatan eksklusif, tentukan dokter spesialis atau terapis terpercaya, dan nikmati pengalaman relaksasi holistik baik langsung di klinik kami maupun konsultasi daring.
            </p>

            {/* Quick Feature Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-zinc-900/60 border border-rose-100 dark:border-zinc-800 backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Dokter Spesialis Tersertifikasi</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-zinc-900/60 border border-rose-100 dark:border-zinc-800 backdrop-blur-xs">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span>Sinkronisasi Otomatis Google Calendar</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-zinc-900/60 border border-rose-100 dark:border-zinc-800 backdrop-blur-xs">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Bebas Antre & Tepat Waktu</span>
              </div>
            </div>
          </div>

          {/* Decorative Background Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-87.5 bg-linear-to-b from-rose-200/40 via-pink-200/20 to-transparent dark:from-rose-900/20 dark:via-pink-900/10 dark:to-transparent blur-3xl pointer-events-none rounded-full"></div>
        </section>

        {/* Booking Form Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <Suspense
            fallback={
              <div className="max-w-4xl mx-auto rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-12 text-center shadow-lg shadow-rose-950/5 animate-pulse">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/60 mb-4 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-rose-500 animate-spin" />
                </div>
                <h3 className="text-lg font-serif text-zinc-800 dark:text-zinc-200">Memuat Sistem Booking...</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Menyiapkan dokter dan slot jadwal terbaru</p>
              </div>
            }
          >
            <BookingForm />
          </Suspense>

          {/* Booking Perks & Guarantees */}
          <div className="mt-16 pt-12 border-t border-rose-100/70 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-rose-100/70 dark:border-zinc-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-semibold text-sm text-zinc-900 dark:text-zinc-100">Perawatan Berstandar Medis</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">Semua prosedur dilakukan oleh spesialis kulit berpengalaman dengan alat berteknologi tinggi.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-rose-100/70 dark:border-zinc-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/50 text-pink-500 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-semibold text-sm text-zinc-900 dark:text-zinc-100">Konsultasi Personal</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">Diagnosa kulit menyeluruh disesuaikan dengan skin type & concern unik Anda.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-rose-100/70 dark:border-zinc-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-semibold text-sm text-zinc-900 dark:text-zinc-100">Fleksibilitas Jadwal</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">Konfirmasi instan via WhatsApp dan penjadwalan ulang mudah jika ada perubahan.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Ada pertanyaan seputar treatment atau dokter?{' '}
              <Link href="/" className="font-semibold text-rose-600 dark:text-rose-400 hover:underline">
                Hubungi Customer Care NOBYDERM
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
