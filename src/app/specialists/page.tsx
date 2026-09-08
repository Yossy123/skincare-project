import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api/client';
import {
  Sparkles,
  Award,
  Calendar,
  Clock,
  ShieldCheck,
  ArrowRight,
  Stethoscope,
} from 'lucide-react';
import type { BookingDoctor } from '@/lib/booking';

export const metadata: Metadata = {
  title: 'Our Doctors & Specialists | Lumière Beauté',
  description: 'Kenali dokter spesialis kulit dan aesthetician berpengalaman di Lumière Beauté. Jadwal konsultasi dan reservasi mudah.',
};

async function getDoctors(): Promise<BookingDoctor[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/booking/doctors`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (e) {
    console.error('Failed to load doctors in specialists page:', e);
    return [];
  }
}

export default async function SpecialistsPage() {
  const doctors = await getDoctors();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/60 dark:bg-zinc-950 transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* Header Banner */}
        <section className="relative overflow-hidden py-16 sm:py-20 bg-linear-to-b from-rose-100/60 via-pink-50/30 to-transparent dark:from-rose-950/20 dark:via-zinc-900/40 dark:to-transparent border-b border-rose-100/60 dark:border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-rose-200/80 dark:border-zinc-700 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-4 shadow-xs">
              <Stethoscope className="w-3.5 h-3.5 text-rose-500" />
              <span>Tim Medis & Aesthetician Berpengalaman</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-zinc-900 dark:text-zinc-50 font-normal tracking-tight">
              Clinical Specialists & Dermatologists
            </h1>

            <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              Ditangani langsung oleh para dokter spesialis dermatologi dan aesthetician bersertifikasi internasional dengan pengalaman klinis bertahun-tahun dalam kesehatan kulit.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>SIP & STR Resmi Kementerian Kesehatan</span>
              </div>
            </div>
          </div>

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-linear-to-b from-rose-200/40 via-pink-200/20 to-transparent dark:from-rose-900/20 dark:via-pink-900/10 dark:to-transparent blur-3xl pointer-events-none rounded-full"></div>
        </section>

        {/* Doctors Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="group bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100/90 dark:border-zinc-800 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:shadow-rose-500/5 hover:border-rose-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Doctor Header & Avatar */}
                  <div className="flex items-start gap-4 mb-5">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-linear-to-tr ${doc.avatar_color || 'from-rose-500 to-pink-500'} text-white flex items-center justify-center shadow-md text-xl font-serif font-bold shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      {doc.name.replace('dr. ', '').charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-base text-zinc-900 dark:text-zinc-100 leading-snug truncate">
                        {doc.name}
                      </h3>
                      <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-0.5">
                        {doc.title}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                    {doc.bio}
                  </p>

                  {/* Experience Badge */}
                  <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 text-[11px] font-medium text-rose-700 dark:text-rose-300">
                    <Award className="w-3.5 h-3.5 text-rose-500" />
                    <span>{doc.experience}</span>
                  </div>

                  {/* Expertise / Skills */}
                  {doc.skills && doc.skills.length > 0 && (
                    <div className="mb-5">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 block mb-2">
                        Fokus Keahlian
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {doc.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-rose-100/60 dark:border-zinc-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Schedule */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/40 border border-rose-100/60 dark:border-zinc-800 space-y-1.5 mb-6 text-xs">
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{doc.schedule_days}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>
                        Pukul {doc.work_start_time?.slice(0, 5)} – {doc.work_end_time?.slice(0, 5)} WIB
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking Button */}
                <Link
                  href={`/booking?doctor=${doc.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-semibold text-white bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-sm shadow-rose-500/20 group-hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Reservasi Jadwal Konsultasi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>

          {/* Bottom Consultation CTA Banner */}
          <div className="mt-16 bg-linear-to-r from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-rose-500/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="relative z-10 max-w-xl">
              <span className="text-xs uppercase font-bold tracking-widest text-rose-100">
                Pemeriksaan Kulit Menyeluruh
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal mt-1 leading-tight">
                Ingin konsultasi langsung dengan dokter spesialis kami?
              </h2>
              <p className="text-rose-100 text-xs sm:text-sm mt-2 leading-relaxed">
                Tentukan layanan perawatan, pilih tanggal dan jam yang Anda inginkan, lalu pilih dokter spesialis yang berpraktek pada hari tersebut.
              </p>
            </div>

            <Link
              href="/booking"
              className="relative z-10 shrink-0 inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 font-semibold text-sm shadow-md transition-all hover:scale-105"
            >
              <span>Mulai Booking Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
