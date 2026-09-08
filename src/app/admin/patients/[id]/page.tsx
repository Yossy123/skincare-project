'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  FileText,
  Sparkles,
  ShieldCheck,
  Edit,
  X,
  CheckCircle2,
  MapPin,
  Stethoscope,
} from 'lucide-react';
import {
  fetchAdminPatientDetail,
  updateAdminPatient,
  type Patient,
} from '@/lib/booking';

export default function AdminPatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const patientId = parseInt(resolvedParams.id);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPatient = useCallback(async (showLoading = false) => {
    if (!patientId) return;
    if (showLoading) setLoading(true);
    setError('');
    try {
      const data = await fetchAdminPatientDetail(patientId);
      setPatient(data);
      setName(data.name || '');
      setPhone(data.phone || '');
      setEmail(data.email || '');
      setAddress(data.address || '');
      setAllergies(data.allergies || '');
      setMedicalHistory(data.medical_history || '');
      setEmergencyContact(data.emergency_contact || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat detail pasien.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    let isMounted = true;
    if (patientId) {
      fetchAdminPatientDetail(patientId)
        .then((data) => {
          if (!isMounted) return;
          setPatient(data);
          setName(data.name || '');
          setPhone(data.phone || '');
          setEmail(data.email || '');
          setAddress(data.address || '');
          setAllergies(data.allergies || '');
          setMedicalHistory(data.medical_history || '');
          setEmergencyContact(data.emergency_contact || '');
          setError('');
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          setError(err instanceof Error ? err.message : 'Gagal memuat detail pasien.');
          setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [patientId]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAdminPatient(patientId, {
        name,
        phone,
        email: email || undefined,
        address: address || undefined,
        allergies: allergies || undefined,
        medical_history: medicalHistory || undefined,
        emergency_contact: emergencyContact || undefined,
      });
      setSuccessMsg('Data pasien dan rekam medis berhasil diperbarui.');
      setEditModalOpen(false);
      loadPatient();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui data pasien.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-zinc-400">
        <Sparkles className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Memuat dossier medis pasien...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <p>{error || 'Pasien tidak ditemukan.'}</p>
        <Link href="/admin/patients" className="text-rose-400 underline text-xs mt-2 inline-block">
          Kembali ke Daftar Pasien
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/patients"
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif text-white">{patient.name}</h1>
            <p className="text-xs text-zinc-400">Dossier Medis & Histori Perawatan Klinik</p>
          </div>
        </div>

        <button
          onClick={() => setEditModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Edit Rekam Medis & Profil</span>
        </button>
      </div>

      {/* Success Notification */}
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

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact & Demographics */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="font-serif text-base text-white">Profil & Kontak</h3>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                patient.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
              }`}
            >
              {patient.status.toUpperCase()}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-zinc-500 block">WhatsApp / Telepon</span>
                <span className="font-medium text-white">{patient.phone}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-zinc-500 block">Email</span>
                <span className="font-medium text-zinc-200">{patient.email || '-'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-zinc-500 block">Alamat</span>
                <span className="font-medium text-zinc-300 leading-relaxed">{patient.address || '-'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-zinc-500 block">Kontak Darurat</span>
                <span className="font-medium text-zinc-300">{patient.emergency_contact || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Alerts & Medical Dossier */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-serif text-base text-white pb-3 border-b border-zinc-800">
            Catatan Medis & Alergi
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-rose-400">
                <AlertCircle className="w-4 h-4" />
                <span>Riwayat Alergi Kulit / Obat</span>
              </div>
              <p className="text-zinc-300 leading-relaxed pt-1">
                {patient.allergies || 'Tidak ada riwayat alergi yang dicatat.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-zinc-300">
                <FileText className="w-4 h-4 text-rose-400" />
                <span>Riwayat Kondisi Kulit / Medis</span>
              </div>
              <p className="text-zinc-400 leading-relaxed pt-1">
                {patient.medical_history || 'Tidak ada riwayat medis khusus.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment & Treatment History */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-lg font-serif text-white">Riwayat Reservasi & Rekam Medis ({patient.appointments?.length || 0})</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Seluruh rekam medis, diagnosis dokter, dan treatment yang pernah dijalani pasien
          </p>
        </div>

        {!patient.appointments || patient.appointments.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Belum ada riwayat appointment untuk pasien ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {patient.appointments.map((appt) => (
              <div
                key={appt.id}
                className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 transition-all hover:border-zinc-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-rose-400">{appt.booking_code}</span>
                    <span className="text-xs text-zinc-400">•</span>
                    <span className="font-medium text-xs text-zinc-200">{appt.appointment_date}</span>
                    <span className="text-xs text-zinc-400">•</span>
                    <span className="text-xs text-zinc-400">
                      {appt.start_time.slice(0, 5)} – {appt.end_time.slice(0, 5)} WIB
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold self-start sm:self-auto border ${
                      appt.status === 'completed'
                        ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                        : appt.status === 'confirmed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : appt.status === 'in_progress'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                    }`}
                  >
                    {appt.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-zinc-500 block">Layanan</span>
                    <span className="font-semibold text-white">{appt.service?.name}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 block">Dokter Penanggung Jawab</span>
                    <span className="font-semibold text-white">{appt.doctor?.name}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 block">Format</span>
                    <span className="text-zinc-300 font-medium">{appt.consultation_mode.toUpperCase()}</span>
                  </div>
                </div>

                {appt.complaint && (
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                    <span className="text-[11px] text-zinc-500 font-semibold block mb-0.5">Keluhan Pasien:</span>
                    <p className="text-zinc-300">{appt.complaint}</p>
                  </div>
                )}

                {appt.diagnosis && (
                  <div className="p-3.5 rounded-xl bg-teal-950/20 border border-teal-900/40 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-teal-300">
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Diagnosis Dokter: {appt.diagnosis}</span>
                    </div>
                    {appt.treatment_plan && (
                      <p className="text-zinc-300 text-[11px]">
                        <strong>Rencana Tindakan:</strong> {appt.treatment_plan}
                      </p>
                    )}
                    {appt.prescription && (
                      <p className="text-zinc-300 text-[11px]">
                        <strong>Resep / Produk:</strong> {appt.prescription}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleEditSubmit}
            className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-serif text-lg text-white">Edit Profil & Rekam Medis Pasien</h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1.5 font-semibold">Nama Pasien</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1.5 font-semibold">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1.5 font-semibold">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1.5 font-semibold">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-rose-400 block mb-1.5 font-semibold">Riwayat Alergi Kulit / Obat</label>
                <textarea
                  rows={2}
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="Misal: Alergi alkohol, steroid topikal, parfum artifisial"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1.5 font-semibold">Riwayat Kondisi Medis / Kulit</label>
                <textarea
                  rows={2}
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="Misal: Dermatitis atopik, jerawat hormonal kronis"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1.5 font-semibold">Kontak Darurat</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Contoh: 08123456789 (Ibu Jessica)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:border-rose-500"
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
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
