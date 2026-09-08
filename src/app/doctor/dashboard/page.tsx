'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  getDoctorOverview,
  updateDoctorAppointmentStatus,
  DoctorOverviewResponse,
  Appointment,
} from '@/lib/booking';
import {
  Users,
  Calendar,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Stethoscope,
  Video,
  MapPin,
  ArrowRight,
  ChevronRight,
  Sparkles,
  RotateCw,
} from 'lucide-react';

export default function DoctorDashboardPage() {
  const [data, setData] = useState<DoctorOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDoctorOverview();
      setData(res);
    } catch (err: unknown) {
      console.error('Failed to load doctor overview:', err);
      const msg = err instanceof Error ? err.message : 'Gagal memuat data dokter';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    getDoctorOverview()
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Gagal memuat data dokter';
          setError(msg);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuickStatus = async (appointmentId: number, newStatus: string) => {
    try {
      setActionLoading(appointmentId);
      await updateDoctorAppointmentStatus(appointmentId, newStatus);
      await loadOverview();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui status';
      alert(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Terkonfirmasi
          </span>
        );
      case 'checked_in':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Menunggu di Antrean
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Sedang Konsultasi
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
            Selesai
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            Dibatalkan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-zinc-400">Menyiapkan Ruang Praktik Dokter...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-3xl bg-zinc-900 border border-rose-900/40 text-center max-w-md mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-serif text-white font-semibold mb-1">Gagal Memuat Portal</h3>
        <p className="text-xs text-zinc-400 mb-6">{error || 'Data dokter tidak ditemukan'}</p>
        <button
          onClick={loadOverview}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-all shadow-lg"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const doctor = data.doctor;
  const metrics = data.metrics || {
    today_appointments: 0,
    waiting_patients: 0,
    in_progress: 0,
    completed_today: 0,
    upcoming_appointments: 0,
    total_patients: 0,
  };
  const today_queue = data.today_queue || data.today_appointments || [];
  const upcoming_queue = data.upcoming_queue || data.upcoming_appointments || [];
  const recent_patients = data.recent_patients || [];

  return (
    <div className="space-y-8">
      {/* Header Profile Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-linear-to-r from-zinc-900 via-zinc-900/90 to-emerald-950/30 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 z-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl font-serif font-bold text-emerald-400 shrink-0">
            {doctor.name ? doctor.name[0].toUpperCase() : 'D'}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-serif font-medium text-white tracking-wide">
                {doctor.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {doctor.specialization}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
              <span>SIP/SIPD: {doctor.license_number || '-'}</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Status: {doctor.status === 'active' ? 'Praktik Aktif' : 'Nonaktif'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => loadOverview()}
            className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-all text-xs flex items-center gap-1.5 cursor-pointer"
            title="Refresh Data"
          >
            <RotateCw className="w-4 h-4" />
            <span className="hidden sm:inline">Segarkan</span>
          </button>
          <Link
            href="/doctor/appointments"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Lihat Seluruh Jadwal</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Janji Hari Ini</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-white">
            {metrics.today_appointments}
          </div>
          <div className="text-[11px] text-zinc-500">Jadwal hari ini</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Jadwal Mendatang</span>
            <CalendarDays className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-sky-400">
            {Number(metrics.upcoming_appointments || 0)}
          </div>
          <div className="text-[11px] text-zinc-500">Reservasi terdaftar</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Menunggu Antrean</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-amber-400">
            {metrics.waiting_patients}
          </div>
          <div className="text-[11px] text-zinc-500">Checked-in & siap</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Sedang Konsultasi</span>
            <Stethoscope className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-blue-400">
            {metrics.in_progress}
          </div>
          <div className="text-[11px] text-zinc-500">Dalam ruang medis</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Selesai Hari Ini</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-white">
            {metrics.completed_today}
          </div>
          <div className="text-[11px] text-zinc-500">Tindakan tuntas</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Total Pasien Anda</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-white">
            {metrics.total_patients}
          </div>
          <div className="text-[11px] text-zinc-500">Dalam rekam medis</div>
        </div>
      </div>

      {/* Main Grid: Today's Queue & Upcoming Bookings + Patient Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Antrean & Jadwal (Queue + Upcoming) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Today's Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h2 className="text-base font-serif font-medium text-white">
                  Antrean & Jadwal Hari Ini
                </h2>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            {today_queue.length === 0 ? (
              <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 text-center space-y-2">
                <Calendar className="w-7 h-7 text-zinc-600 mx-auto" />
                <p className="text-sm font-serif text-zinc-300">Tidak ada jadwal booking untuk hari ini</p>
                <p className="text-xs text-zinc-500">
                  Lihat daftar jadwal mendatang di bawah ini atau buka menu Jadwal & Konsultasi.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {today_queue.map((item: Appointment) => {
                  const isOnline = item.consultation_mode === 'online' || item.consultation_type === 'online';
                  const isBusy = actionLoading === item.id;
                  const timeFormatted = (item.start_time || item.appointment_time || '').substring(0, 5);

                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        item.status === 'in_progress'
                          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                          : item.status === 'checked_in'
                          ? 'bg-amber-950/10 border-amber-500/30'
                          : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="px-2.5 py-1 rounded-xl bg-zinc-800 text-xs font-mono font-semibold text-emerald-400 border border-zinc-700">
                              {timeFormatted} WIB
                            </span>
                            {getStatusBadge(item.status)}
                            {isOnline ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                                <Video className="w-3 h-3" />
                                Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                                <MapPin className="w-3 h-3" />
                                Klinik
                              </span>
                            )}
                            {item.photo_url && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                                📷 Foto Terlampir
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="text-sm font-semibold text-white flex items-center gap-2">
                              <span>{item.patient?.name || 'Pasien Anonim'}</span>
                              <span className="text-xs text-zinc-500 font-mono">
                                ({item.booking_code})
                              </span>
                            </div>
                            <div className="text-xs text-zinc-400 mt-0.5">
                              Treatment: <span className="text-zinc-200">{item.service?.name}</span>
                            </div>
                            {item.complaint && (
                              <div className="text-xs text-zinc-400 mt-1 italic line-clamp-1">
                                &ldquo;{item.complaint}&rdquo;
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {item.status === 'confirmed' && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleQuickStatus(item.id, 'checked_in')}
                              className="px-3 py-2 rounded-xl text-xs font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-all cursor-pointer"
                            >
                              Tandai Hadir
                            </button>
                          )}

                          {item.status === 'checked_in' && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleQuickStatus(item.id, 'in_progress')}
                              className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              Mulai Konsultasi
                            </button>
                          )}

                          {item.status === 'in_progress' && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleQuickStatus(item.id, 'completed')}
                              className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-700 hover:bg-zinc-600 text-white transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Selesai Tindakan
                            </button>
                          )}

                          <Link
                            href={`/doctor/appointments/${item.id}`}
                            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700/60 transition-all flex items-center gap-1"
                          >
                            <span>Ruang Medis</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Upcoming Bookings (Jadwal Mendatang) */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-sky-400" />
                <h2 className="text-base font-serif font-medium text-white">
                  Jadwal Reservasi Mendatang ({upcoming_queue.length})
                </h2>
              </div>
              <Link href="/doctor/appointments" className="text-xs text-sky-400 hover:underline">
                Lihat Semua Kalender
              </Link>
            </div>

            {upcoming_queue.length === 0 ? (
              <div className="p-6 rounded-2xl bg-zinc-900/30 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                Belum ada reservasi baru untuk hari-hari mendatang.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {upcoming_queue.map((item: Appointment) => {
                  const isOnline = item.consultation_mode === 'online' || item.consultation_type === 'online';
                  const timeFormatted = (item.start_time || item.appointment_time || '').substring(0, 5);

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-[11px] font-mono font-medium text-sky-300 border border-zinc-700">
                            {item.appointment_date} • {timeFormatted} WIB
                          </span>
                          {getStatusBadge(item.status)}
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-white truncate">
                            {item.patient?.name || 'Pasien Anonim'}
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5 truncate">
                            {item.service?.name}
                          </div>
                        </div>

                        {item.complaint && (
                          <p className="text-[11px] text-zinc-400 italic line-clamp-2 bg-zinc-950/40 p-2 rounded-xl">
                            &ldquo;{item.complaint}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[11px]">
                        <span className="text-zinc-500 flex items-center gap-1">
                          {isOnline ? <Video className="w-3 h-3 text-blue-400" /> : <MapPin className="w-3 h-3 text-purple-400" />}
                          <span>{isOnline ? 'Online GMeet' : 'In-Clinic'}</span>
                        </span>
                        <Link
                          href={`/doctor/appointments/${item.id}`}
                          className="text-emerald-400 hover:underline font-medium"
                        >
                          Detail Pasien →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pasien Terkini / Recent Consultations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-serif font-medium text-white">
                Pasien Terkini
              </h2>
            </div>
            <Link
              href="/doctor/patients"
              className="text-xs text-emerald-400 hover:underline"
            >
              Semua Pasien
            </Link>
          </div>

          {recent_patients.length === 0 ? (
            <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 text-center text-xs text-zinc-500">
              Belum ada riwayat pasien yang tercatat.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recent_patients.map((app: Appointment) => (
                <Link
                  key={app.id}
                  href={`/doctor/appointments/${app.id}`}
                  className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between transition-all group"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">
                      {app.patient?.name}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      {app.service?.name} • {app.appointment_date}
                    </div>
                    {app.diagnosis && (
                      <div className="text-[10px] text-emerald-400/90 font-mono truncate">
                        Dx: {app.diagnosis}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}

          {/* Clinical Protocol Card */}
          <div className="p-5 rounded-2xl bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span>Standar Prosedur Klinis</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Pastikan melakukan anamnesis menyeluruh dan mengecek riwayat alergi sebelum menuliskan diagnosis, resep obat, atau menyarankan tindakan laser/chemical peeling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
