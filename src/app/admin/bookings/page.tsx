'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  Calendar,
  Clock,
  Filter,
  Search,
  CheckCircle2,
  Phone,
  Video,
  MapPin,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  X,
  Stethoscope,
} from 'lucide-react';
import {
  fetchAdminAppointments,
  fetchAdminDoctors,
  updateAdminAppointmentStatus,
  updateAdminAppointment,
  type Appointment,
  type AppointmentStatus,
  type BookingDoctor,
} from '@/lib/booking';

export default function AdminBookingsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<BookingDoctor[]>([]);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modals
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);

  // Form states for status update
  const [newStatus, setNewStatus] = useState<AppointmentStatus>('confirmed');
  const [statusNotes, setStatusNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Form states for reschedule
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleDoctorId, setRescheduleDoctorId] = useState<number | null>(null);
  const [rescheduling, setRescheduling] = useState(false);

  // Load Reference Data
  useEffect(() => {
    fetchAdminDoctors()
      .then((d) => {
        setDoctors(d);
      })
      .catch(() => {});
  }, []);

  // Load Appointments
  const loadAppointments = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError('');
    try {
      const res = await fetchAdminAppointments({
        search: search.trim() || undefined,
        date: dateFilter || undefined,
        doctor_id: doctorFilter || undefined,
        status: statusFilter || undefined,
        page,
      });
      setAppointments(res.data);
      setTotalPages(res.last_page);
      setTotalCount(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat daftar reservasi.');
    } finally {
      setLoading(false);
    }
  }, [search, dateFilter, doctorFilter, statusFilter, page]);

  useEffect(() => {
    let isMounted = true;
    fetchAdminAppointments({
      search: search.trim() || undefined,
      date: dateFilter || undefined,
      doctor_id: doctorFilter || undefined,
      status: statusFilter || undefined,
      page,
    })
      .then((res) => {
        if (!isMounted) return;
        setAppointments(res.data);
        setTotalPages(res.last_page);
        setTotalCount(res.total);
        setError('');
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat daftar reservasi.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [search, dateFilter, doctorFilter, statusFilter, page]);

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    setUpdatingStatus(true);
    try {
      await updateAdminAppointmentStatus(selectedAppt.id, newStatus, statusNotes || undefined, cancelReason || undefined);
      setActionSuccess(`Status reservasi #${selectedAppt.booking_code} berhasil diperbarui.`);
      setStatusModalOpen(false);
      loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    setRescheduling(true);
    try {
      await updateAdminAppointment(selectedAppt.id, {
        appointment_date: rescheduleDate || undefined,
        start_time: rescheduleTime || undefined,
        doctor_id: rescheduleDoctorId || undefined,
      });
      setActionSuccess(`Jadwal reservasi #${selectedAppt.booking_code} berhasil diatur ulang.`);
      setRescheduleModalOpen(false);
      loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengatur ulang jadwal.');
    } finally {
      setRescheduling(false);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'checked_in':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'in_progress':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'completed':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'no_show':
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const formatIDR = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-white tracking-tight">Manajemen Booking & Appointment</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Pantau dan kelola seluruh reservasi klinik, jadwal dokter, dan alur kedatangan pasien
          </p>
        </div>
        <button
          onClick={() => loadAppointments(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 cursor-pointer transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Success Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari kode booking, nama, WA..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-rose-500"
          />
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:border-rose-500"
          />
        </div>

        {/* Doctor Filter */}
        <div className="relative">
          <Stethoscope className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={doctorFilter}
            onChange={(e) => {
              setDoctorFilter(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:border-rose-500 appearance-none cursor-pointer"
          >
            <option value="">Semua Dokter</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:border-rose-500 appearance-none cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-zinc-400">
            <Sparkles className="w-6 h-6 text-rose-500 animate-spin mx-auto mb-2" />
            <p className="text-xs">Memuat data booking dari database...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-16 text-center text-zinc-500">
            <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-serif text-zinc-300">Tidak ada reservasi yang sesuai filter</p>
            <p className="text-xs mt-1">Coba ubah kata kunci pencarian atau tanggal yang dipilih.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/60 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                <tr>
                  <th className="px-5 py-4">Kode & Pasien</th>
                  <th className="px-5 py-4">Layanan & Format</th>
                  <th className="px-5 py-4">Dokter</th>
                  <th className="px-5 py-4">Jadwal Sesi</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-zinc-800/40 transition-colors">
                    {/* Booking Code & Patient Info */}
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-rose-400">{appt.booking_code}</div>
                      <div className="font-medium text-zinc-200 mt-0.5">{appt.patient?.name || '-'}</div>
                      <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{appt.patient?.phone || '-'}</span>
                      </div>
                    </td>

                    {/* Service & Format */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-zinc-200">{appt.service?.name || '-'}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-zinc-400 font-sans">
                          {appt.service ? formatIDR(appt.service.price) : '-'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            appt.consultation_mode === 'online'
                              ? 'bg-teal-500/10 text-teal-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {appt.consultation_mode === 'online' ? <Video className="w-2.5 h-2.5" /> : <MapPin className="w-2.5 h-2.5" />}
                          <span>{appt.consultation_mode === 'online' ? 'Online' : 'Offline'}</span>
                        </span>
                      </div>
                    </td>

                    {/* Doctor */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-zinc-200">{appt.doctor?.name || '-'}</div>
                      <div className="text-[11px] text-zinc-500">{appt.doctor?.specialization || '-'}</div>
                    </td>

                    {/* Schedule */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-zinc-200">{appt.appointment_date}</div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>
                          {appt.start_time.slice(0, 5)} – {appt.end_time.slice(0, 5)} WIB
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(appt.status)}`}>
                        {appt.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedAppt(appt);
                          setDetailModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="Lihat Detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAppt(appt);
                          setNewStatus(appt.status);
                          setStatusNotes('');
                          setCancelReason(appt.cancellation_reason || '');
                          setStatusModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-200 hover:text-white border border-zinc-700 cursor-pointer transition-all"
                      >
                        Ubah Status
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAppt(appt);
                          setRescheduleDate(appt.appointment_date);
                          setRescheduleTime(appt.start_time.slice(0, 5));
                          setRescheduleDoctorId(appt.doctor_id);
                          setRescheduleModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-[11px] font-semibold text-rose-300 border border-rose-500/30 cursor-pointer transition-all"
                      >
                        Reschedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <div>
              Total: <span className="font-semibold text-white">{totalCount}</span> reservasi
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                Halaman {page} dari {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL DRAWER / MODAL */}
      {detailModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-rose-400 font-bold">Dossier Reservasi</span>
                <h3 className="text-xl font-serif text-white">{selectedAppt.booking_code}</h3>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="text-[11px] text-zinc-500 font-semibold uppercase block">Data Pasien</span>
                <div className="font-semibold text-sm text-white">{selectedAppt.patient?.name}</div>
                <div className="text-zinc-400">Telepon: {selectedAppt.patient?.phone}</div>
                <div className="text-zinc-400">Email: {selectedAppt.patient?.email || '-'}</div>
                <div className="text-zinc-400">Alergi: {selectedAppt.patient?.allergies || 'Tidak ada catatan'}</div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="text-[11px] text-zinc-500 font-semibold uppercase block">Layanan & Jadwal</span>
                <div className="font-semibold text-sm text-white">{selectedAppt.service?.name}</div>
                <div className="text-zinc-400">Dokter: {selectedAppt.doctor?.name}</div>
                <div className="text-zinc-400">
                  Waktu: {selectedAppt.appointment_date}, {selectedAppt.start_time.slice(0, 5)} WIB
                </div>
                <div className="text-zinc-400">Format: {selectedAppt.consultation_mode.toUpperCase()}</div>
              </div>

              {selectedAppt.complaint && (
                <div className="sm:col-span-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-[11px] text-zinc-500 font-semibold uppercase block">Keluhan Pasien</span>
                  <p className="text-zinc-300 leading-relaxed">{selectedAppt.complaint}</p>
                </div>
              )}

              {selectedAppt.photo_url && (
                <div className="sm:col-span-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <span className="text-[11px] text-zinc-500 font-semibold uppercase block">Foto Kondisi Kulit</span>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedAppt.photo_url.startsWith('http') ? selectedAppt.photo_url : `http://localhost:8000${selectedAppt.photo_url}`}
                      alt="Keluhan Kulit"
                      className="w-24 h-24 object-cover rounded-xl border border-zinc-700 shadow-sm"
                    />
                    <div className="text-xs space-y-1">
                      <p className="text-zinc-300 font-medium">Foto Keluhan Pasien</p>
                      <a
                        href={selectedAppt.photo_url.startsWith('http') ? selectedAppt.photo_url : `http://localhost:8000${selectedAppt.photo_url}`}
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

              {selectedAppt.diagnosis && (
                <div className="sm:col-span-2 p-4 rounded-2xl bg-teal-950/30 border border-teal-900/50 space-y-1.5 text-teal-200">
                  <span className="text-[11px] text-teal-400 font-semibold uppercase block">Hasil Diagnosis Dokter</span>
                  <p className="font-medium">{selectedAppt.diagnosis}</p>
                  {selectedAppt.treatment_plan && (
                    <p className="text-zinc-300 text-[11px]">
                      <strong>Treatment Plan:</strong> {selectedAppt.treatment_plan}
                    </p>
                  )}
                  {selectedAppt.prescription && (
                    <p className="text-zinc-300 text-[11px]">
                      <strong>Resep:</strong> {selectedAppt.prescription}
                    </p>
                  )}
                </div>
              )}

              {/* Status Audit History */}
              <div className="sm:col-span-2 space-y-2 pt-2">
                <span className="text-[11px] text-zinc-500 font-semibold uppercase block">Histori Status</span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedAppt.status_histories?.map((h) => (
                    <div key={h.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-semibold text-rose-400">{h.to_status.toUpperCase()}</span>
                        <p className="text-zinc-400 mt-0.5">{h.notes || 'Status diperbarui'}</p>
                      </div>
                      <span className="text-zinc-500">{new Date(h.created_at).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {statusModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleStatusSubmit}
            className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-serif text-lg text-white">Ubah Status Reservasi</h3>
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1.5 font-semibold">Status Baru</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as AppointmentStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:border-rose-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed (Disetujui)</option>
                  <option value="checked_in">Checked In (Tiba di Klinik)</option>
                  <option value="in_progress">In Progress (Sedang Berjalan)</option>
                  <option value="completed">Completed (Selesai)</option>
                  <option value="cancelled">Cancelled (Dibatalkan)</option>
                  <option value="no_show">No Show (Tidak Hadir)</option>
                </select>
              </div>

              {newStatus === 'cancelled' && (
                <div>
                  <label className="text-zinc-400 block mb-1.5 font-semibold">Alasan Pembatalan</label>
                  <textarea
                    rows={2}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Contoh: Pasien berhalangan hadir / dokter sakit"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              )}

              <div>
                <label className="text-zinc-400 block mb-1.5 font-semibold">Catatan Internal Status</label>
                <textarea
                  rows={2}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Catatan tambahan perubahan status..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={updatingStatus}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md disabled:opacity-50"
              >
                {updatingStatus ? 'Menyimpan...' : 'Simpan Status'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleRescheduleSubmit}
            className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-serif text-lg text-white">Atur Ulang Jadwal Reservasi</h3>
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1.5 font-semibold">Tanggal Baru</label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1.5 font-semibold">Jam Mulai Baru (WIB)</label>
                <input
                  type="time"
                  required
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1.5 font-semibold">Pindah Dokter (Opsional)</label>
                <select
                  value={rescheduleDoctorId || ''}
                  onChange={(e) => setRescheduleDoctorId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:border-rose-500"
                >
                  <option value="">Pertahankan Dokter Saat Ini ({selectedAppt.doctor?.name})</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={rescheduling}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md disabled:opacity-50"
              >
                {rescheduling ? 'Menyimpan...' : 'Konfirmasi Reschedule'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
