'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  getDoctorAppointments,
  updateDoctorAppointmentStatus,
  resolvePhotoUrl,
  Appointment,
} from '@/lib/booking';
import {
  CalendarDays,
  Search,
  CheckCircle2,
  AlertCircle,
  Video,
  MapPin,
  ArrowRight,
  Sparkles,
  PlayCircle,
  RotateCw,
  Phone,
  X,
  Camera,
  ClipboardList,
  FileText,
} from 'lucide-react';

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<Appointment | null>(null);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params: { status?: string; date?: string; search?: string } = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;

      const res = await getDoctorAppointments(params);
      setAppointments(res.data || []);
    } catch (err: unknown) {
      console.error('Failed to load doctor appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    let isMounted = true;
    const params: { status?: string; date?: string; search?: string } = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    if (dateFilter) params.date = dateFilter;

    getDoctorAppointments(params)
      .then((res) => {
        if (isMounted) {
          setAppointments(res.data || []);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          console.error('Failed to load doctor appointments:', err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [statusFilter, dateFilter]);

  const handleQuickStatus = async (id: number, newStatus: string) => {
    try {
      setActionLoading(id);
      await updateDoctorAppointmentStatus(id, newStatus);
      await loadAppointments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status';
      alert(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const pName = app.patient?.name?.toLowerCase() || '';
    const code = app.booking_code?.toLowerCase() || '';
    const svc = app.service?.name?.toLowerCase() || '';
    return pName.includes(q) || code.includes(q) || svc.includes(q);
  });

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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Check-in / Hadir
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Sedang Berlangsung
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-medium text-white tracking-wide">
            Jadwal & Konsultasi Medis
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Kelola seluruh jadwal temu, konsultasi online/in-clinic, dan rekam diagnosis pasien Anda.
          </p>
        </div>

        <button
          onClick={() => loadAppointments()}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-all flex items-center gap-2 cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pasien, kode booking, atau treatment..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-hidden focus:border-emerald-500"
          >
            <option value="all">Semua Status</option>
            <option value="confirmed">Terkonfirmasi</option>
            <option value="checked_in">Check-in</option>
            <option value="in_progress">Sedang Konsultasi</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>

          {/* Date filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-hidden focus:border-emerald-500"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="px-2.5 py-2 rounded-xl text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700"
            >
              Reset Tanggal
            </button>
          )}
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 gap-3">
          <Sparkles className="w-6 h-6 text-emerald-400 animate-spin" />
          <p className="text-xs text-zinc-400">Memuat Jadwal...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="p-12 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-2">
          <CalendarDays className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-sm font-serif text-zinc-300">Tidak ada jadwal yang cocok</p>
          <p className="text-xs text-zinc-500">Coba ubah kata kunci pencarian atau filter tanggal.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((item) => {
            const isOnline = item.consultation_mode === 'online' || item.consultation_type === 'online';
            const isBusy = actionLoading === item.id;
            const timeFormatted = (item.start_time || item.appointment_time || '').substring(0, 5);

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left info */}
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-xs font-mono font-medium text-white border border-zinc-700">
                      {item.appointment_date} • {timeFormatted} WIB
                    </span>
                    {getStatusBadge(item.status)}
                    {isOnline ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                        <Video className="w-3 h-3" />
                        Online Telemedicine
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                        <MapPin className="w-3 h-3" />
                        In-Clinic Flagship
                      </span>
                    )}
                    {item.photo_url && (
                      <button
                        type="button"
                        onClick={() => setDetailItem(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer"
                      >
                        📷 Foto Keluhan
                      </button>
                    )}
                  </div>

                  <div>
                    <div className="text-base font-medium text-white flex items-center gap-2">
                      <span>{item.patient?.name || 'Pasien Anonim'}</span>
                      <span className="text-xs text-zinc-500 font-mono font-normal">
                        ({item.booking_code})
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5 flex flex-wrap items-center gap-3">
                      <span>Layanan: <strong className="text-zinc-200 font-medium">{item.service?.name}</strong></span>
                      {item.patient?.phone && (
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Phone className="w-3 h-3 text-zinc-500" />
                          {item.patient.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.complaint && (
                    <div className="text-xs text-zinc-400 italic bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/40 line-clamp-2">
                      &ldquo;{item.complaint}&rdquo;
                    </div>
                  )}

                  {item.diagnosis && (
                    <div className="text-xs text-emerald-400 font-mono bg-emerald-950/20 p-2 rounded-xl border border-emerald-900/30">
                      <strong>Diagnosis:</strong> {item.diagnosis}
                    </div>
                  )}
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {item.status === 'confirmed' && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleQuickStatus(item.id, 'checked_in')}
                      className="px-3 py-2 rounded-xl text-xs font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-all cursor-pointer"
                    >
                      Check-in
                    </button>
                  )}

                  {item.status === 'checked_in' && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleQuickStatus(item.id, 'in_progress')}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      Mulai
                    </button>
                  )}

                  {item.status === 'in_progress' && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleQuickStatus(item.id, 'completed')}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-700 hover:bg-zinc-600 text-white transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Selesai
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setDetailItem(item)}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>Detail Booking</span>
                  </button>

                  <Link
                    href={`/doctor/appointments/${item.id}`}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Ruang Medis & Resep</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Booking Modal */}
      {detailItem && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setDetailItem(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
              <div className="space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block">
                  Detail Permintaan Pasien
                </span>
                <h3 className="text-xl font-serif text-white">{detailItem.booking_code}</h3>
                {getStatusBadge(detailItem.status)}
              </div>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="text-[11px] text-zinc-500 font-semibold uppercase block">Data Pasien</span>
                <div className="font-semibold text-sm text-white">{detailItem.patient?.name || 'Pasien Anonim'}</div>
                <div className="text-zinc-400">Telepon: {detailItem.patient?.phone || '-'}</div>
                <div className="text-zinc-400">Email: {detailItem.patient?.email || '-'}</div>
                <div className="text-zinc-400">Alergi: {detailItem.patient?.allergies || 'Tidak ada catatan'}</div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="text-[11px] text-zinc-500 font-semibold uppercase block">Layanan & Jadwal</span>
                <div className="font-semibold text-sm text-white">{detailItem.service?.name}</div>
                <div className="text-zinc-400">
                  Waktu: {detailItem.appointment_date}, {(detailItem.start_time || detailItem.appointment_time || '').substring(0, 5)} WIB
                </div>
                <div className="text-zinc-400">
                  Format: {(detailItem.consultation_mode === 'online' || detailItem.consultation_type === 'online') ? 'Online Telemedicine' : 'In-Clinic Flagship'}
                </div>
              </div>

              {detailItem.complaint && (
                <div className="sm:col-span-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <span className="text-[11px] text-zinc-500 font-semibold uppercase flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
                    Keluhan Pasien
                  </span>
                  <p className="text-zinc-300 leading-relaxed italic">&ldquo;{detailItem.complaint}&rdquo;</p>
                </div>
              )}

              {detailItem.photo_url && (
                <div className="sm:col-span-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <span className="text-[11px] text-zinc-500 font-semibold uppercase flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-rose-400" />
                    Foto Kondisi Kulit (Keluhan)
                  </span>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolvePhotoUrl(detailItem.photo_url)}
                      alt="Foto Keluhan Pasien"
                      className="w-32 h-32 object-cover rounded-xl border border-zinc-700 shadow-sm"
                    />
                    <div className="text-xs space-y-1">
                      <p className="text-zinc-300 font-medium">Foto keluhan yang dilampirkan pasien saat booking</p>
                      <a
                        href={resolvePhotoUrl(detailItem.photo_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-rose-400 hover:underline inline-block"
                      >
                        Buka Foto Ukuran Penuh ↗
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {(detailItem.diagnosis || detailItem.doctor_notes || detailItem.treatment_plan || detailItem.prescription) && (
                <div className="sm:col-span-2 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-1.5">
                  <span className="text-[11px] text-emerald-400 font-semibold uppercase flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Catatan Medis Tersimpan
                  </span>
                  {detailItem.diagnosis && (
                    <p className="text-zinc-300"><strong>Diagnosis:</strong> {detailItem.diagnosis}</p>
                  )}
                  {detailItem.treatment_plan && (
                    <p className="text-zinc-300"><strong>Treatment Plan:</strong> {detailItem.treatment_plan}</p>
                  )}
                  {detailItem.prescription && (
                    <p className="text-zinc-300"><strong>Resep:</strong> {detailItem.prescription}</p>
                  )}
                  {detailItem.doctor_notes && (
                    <p className="text-zinc-300"><strong>Catatan Dokter:</strong> {detailItem.doctor_notes}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <Link
                href={`/doctor/appointments/${detailItem.id}`}
                onClick={() => setDetailItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5"
              >
                <span>Buka Ruang Medis & Resep</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
