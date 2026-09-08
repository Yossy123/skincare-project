'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit,
  Power,
  Calendar,
  Clock,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  X,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import {
  fetchAdminDoctors,
  createAdminDoctor,
  updateAdminDoctor,
  toggleAdminDoctor,
  type BookingDoctor,
} from '@/lib/booking';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<BookingDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<BookingDoctor | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [scheduleDays, setScheduleDays] = useState('Senin – Jumat');
  const [workStartTime, setWorkStartTime] = useState('10:00');
  const [workEndTime, setWorkEndTime] = useState('20:00');
  const [submitting, setSubmitting] = useState(false);

  const loadDoctors = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError('');
    try {
      const data = await fetchAdminDoctors();
      setDoctors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat daftar dokter.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchAdminDoctors()
      .then((data) => {
        if (!isMounted) return;
        setDoctors(data);
        setError('');
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat daftar dokter.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenCreate = () => {
    setName('');
    setEmail('');
    setPassword('');
    setTitle('Dermatologist & Specialist');
    setSpecialization('Dermatologi & Estetika Medis');
    setLicenseNumber('');
    setPhone('');
    setExperience('5+ Tahun Pengalaman');
    setBio('');
    setScheduleDays('Senin – Jumat');
    setWorkStartTime('10:00');
    setWorkEndTime('20:00');
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (doc: BookingDoctor) => {
    setSelectedDoctor(doc);
    setName(doc.name);
    setTitle(doc.title);
    setSpecialization(doc.specialization);
    setLicenseNumber(doc.license_number || '');
    setPhone(doc.phone || '');
    setExperience(doc.experience);
    setBio(doc.bio);
    setScheduleDays(doc.schedule_days);
    setWorkStartTime(doc.work_start_time?.slice(0, 5) || '10:00');
    setWorkEndTime(doc.work_end_time?.slice(0, 5) || '20:00');
    setEditModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAdminDoctor({
        name,
        email,
        password,
        title,
        specialization,
        license_number: licenseNumber || undefined,
        phone: phone || undefined,
        experience,
        bio,
        schedule_days: scheduleDays,
        work_start_time: workStartTime,
        work_end_time: workEndTime,
      });
      setSuccessMsg(`Dokter ${name} berhasil ditambahkan.`);
      setCreateModalOpen(false);
      loadDoctors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan dokter.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    setSubmitting(true);
    try {
      await updateAdminDoctor(selectedDoctor.id, {
        name,
        title,
        specialization,
        license_number: licenseNumber || undefined,
        phone: phone || undefined,
        experience,
        bio,
        schedule_days: scheduleDays,
        work_start_time: workStartTime,
        work_end_time: workEndTime,
      });
      setSuccessMsg(`Data dokter ${name} berhasil diperbarui.`);
      setEditModalOpen(false);
      loadDoctors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui dokter.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (doc: BookingDoctor) => {
    try {
      await toggleAdminDoctor(doc.id);
      setSuccessMsg(`Status ${doc.name} berhasil diubah.`);
      loadDoctors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah status dokter.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-white tracking-tight">Manajemen Dokter & Specialist</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Kelola data staf dokter, jam operasional praktik, dan akun akses portal dokter
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => loadDoctors(true)}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 cursor-pointer transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Dokter Baru</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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

      {/* Doctors Grid */}
      {loading ? (
        <div className="p-16 text-center text-zinc-400">
          <Sparkles className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-3" />
          <p className="text-xs">Memuat data dokter dari database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className={`bg-zinc-900 border rounded-3xl p-6 space-y-4 flex flex-col justify-between transition-all ${
                doc.status === 'active' ? 'border-zinc-800' : 'border-zinc-800 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2.5 mb-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-linear-to-tr ${
                        doc.avatar_color || 'from-rose-500 to-pink-500'
                      } text-white flex items-center justify-center font-serif font-bold text-lg shadow-md shrink-0`}
                    >
                      {doc.name.replace('dr. ', '').charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-sm font-semibold text-white truncate" title={doc.name}>
                        {doc.name}
                      </h3>
                      <p className="text-[11px] text-rose-400 truncate">{doc.specialization}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border shrink-0 ${
                      doc.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        doc.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                      }`}
                    />
                    {doc.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-4">{doc.bio}</p>

                <div className="space-y-2 text-xs text-zinc-300 pt-3 border-t border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>Jadwal: {doc.schedule_days}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      Jam Praktik: {doc.work_start_time?.slice(0, 5)} – {doc.work_end_time?.slice(0, 5)} WIB
                    </span>
                  </div>
                  {doc.license_number && (
                    <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{doc.license_number}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(doc)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white border border-zinc-700 cursor-pointer transition-all"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Jadwal</span>
                </button>

                <button
                  onClick={() => handleToggle(doc)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    doc.status === 'active'
                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}
                  title={doc.status === 'active' ? 'Nonaktifkan dokter' : 'Aktifkan dokter'}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE DOCTOR MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-serif text-lg text-white">Tambah Dokter & Akun Login</h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1.5 font-semibold">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. dr. Sarah Amanda Sp.D.V.E"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1.5 font-semibold">Spesialisasi</label>
                  <input
                    type="text"
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Dermatologi & Laser"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Login Credentials */}
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block">
                  Akun Login Portal Dokter
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Email Login</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="doctor.name@lumiere.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Password Akun</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1.5 font-semibold">Nomor SIP / STR</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="SIP.440/123/Dinkes"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1.5 font-semibold">Nomor WhatsApp Staf</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Schedule Info */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1.5 font-semibold">Hari Praktik</label>
                  <input
                    type="text"
                    value={scheduleDays}
                    onChange={(e) => setScheduleDays(e.target.value)}
                    placeholder="Senin – Jumat"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1.5 font-semibold">Jam Buka</label>
                  <input
                    type="time"
                    value={workStartTime}
                    onChange={(e) => setWorkStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1.5 font-semibold">Jam Tutup</label>
                  <input
                    type="time"
                    value={workEndTime}
                    onChange={(e) => setWorkEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1.5 font-semibold">Bio / Ringkasan Pengalaman</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Fokus keahlian, pendekatan klinis, dan pengalaman..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md disabled:opacity-50"
              >
                {submitting ? 'Menyimpan...' : 'Daftarkan Dokter'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT DOCTOR MODAL */}
      {editModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleEditSubmit}
            className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-serif text-lg text-white">Edit Jadwal & Profil Dokter</h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1.5 font-semibold">Nama Dokter</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1.5 font-semibold">Spesialisasi</label>
                  <input
                    type="text"
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1.5 font-semibold">Hari Praktik</label>
                  <input
                    type="text"
                    value={scheduleDays}
                    onChange={(e) => setScheduleDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1.5 font-semibold">Jam Buka</label>
                  <input
                    type="time"
                    value={workStartTime}
                    onChange={(e) => setWorkStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1.5 font-semibold">Jam Tutup</label>
                  <input
                    type="time"
                    value={workEndTime}
                    onChange={(e) => setWorkEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1.5 font-semibold">Nomor SIP / STR</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1.5 font-semibold">Bio / Ringkasan Staf</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md disabled:opacity-50"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
