'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  getDoctorAppointmentDetail,
  updateDoctorAppointmentStatus,
  saveDoctorNotes,
  updatePatientMedicalRecord,
  resolvePhotoUrl,
  Appointment,
} from '@/lib/booking';
import {
  ArrowLeft,
  Phone,
  Mail,
  AlertTriangle,
  Heart,
  FileText,
  Save,
  CheckCircle2,
  Video,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Pill,
  ClipboardList,
  Camera,
  ExternalLink,
} from 'lucide-react';

export default function DoctorAppointmentDetailPage() {
  const params = useParams();
  const id = Number(params?.id);

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  // Clinical Notes Form
  const [doctorNotes, setDoctorNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [prescription, setPrescription] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);

  // Patient Baseline Update Modal/Form
  const [skinType, setSkinType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [notes, setNotes] = useState('');
  const [savingPatientRecord, setSavingPatientRecord] = useState(false);
  const [patientRecordSuccess, setPatientRecordSuccess] = useState(false);

  // Status Action
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchDetail = useCallback(async (showLoading = false) => {
    if (!id) return;
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const res = await getDoctorAppointmentDetail(id);
      const app = res.appointment;
      setAppointment(app);

      // Populate clinical notes
      setDoctorNotes(app.doctor_notes || '');
      setDiagnosis(app.diagnosis || '');
      setTreatmentPlan(app.treatment_plan || '');
      setPrescription(app.prescription || '');

      // Populate patient baseline
      if (app.patient) {
        setSkinType(app.patient.skin_type || '');
        setAllergies(app.patient.allergies || '');
        setMedicalHistory(app.patient.medical_history || '');
        setNotes(app.patient.notes || '');
      }
    } catch (err: unknown) {
      console.error('Failed to load appointment detail:', err);
      const msg = err instanceof Error ? err.message : 'Gagal memuat rekam medis';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      getDoctorAppointmentDetail(id)
        .then((res) => {
          if (!isMounted) return;
          const app = res.appointment;
          setAppointment(app);
          setDoctorNotes(app.doctor_notes || '');
          setDiagnosis(app.diagnosis || '');
          setTreatmentPlan(app.treatment_plan || '');
          setPrescription(app.prescription || '');

          if (app.patient) {
            setSkinType(app.patient.skin_type || '');
            setAllergies(app.patient.allergies || '');
            setMedicalHistory(app.patient.medical_history || '');
            setNotes(app.patient.notes || '');
          }
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (!isMounted) return;
          console.error('Failed to load appointment detail:', err);
          const msg = err instanceof Error ? err.message : 'Gagal memuat rekam medis';
          setError(msg);
          setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      await updateDoctorAppointmentStatus(id, newStatus);
      await fetchDetail();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui status';
      alert(msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveClinicalNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingNotes(true);
      setNotesSuccess(false);
      await saveDoctorNotes(id, {
        doctor_notes: doctorNotes,
        diagnosis: diagnosis,
        treatment_plan: treatmentPlan,
        prescription: prescription,
      });
      setNotesSuccess(true);
      setTimeout(() => setNotesSuccess(false), 4000);
      await fetchDetail();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan catatan medis';
      alert(msg);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSavePatientDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment?.patient?.id) return;
    try {
      setSavingPatientRecord(true);
      setPatientRecordSuccess(false);
      await updatePatientMedicalRecord(appointment.patient.id, {
        skin_type: skinType,
        allergies: allergies,
        medical_history: medicalHistory,
        notes: notes,
      });
      setPatientRecordSuccess(true);
      setTimeout(() => setPatientRecordSuccess(false), 4000);
      await fetchDetail();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui rekam pasien';
      alert(msg);
    } finally {
      setSavingPatientRecord(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-zinc-400">Membuka Ruang Konsultasi Medis...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="p-8 rounded-3xl bg-zinc-900 border border-rose-900/40 text-center max-w-md mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-serif text-white font-semibold mb-1">Janji Temu Tidak Ditemukan</h3>
        <p className="text-xs text-zinc-400 mb-6">{error || 'Jadwal tidak tersedia atau bukan pasien Anda'}</p>
        <Link
          href="/doctor/appointments"
          className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-all"
        >
          Kembali ke Daftar Jadwal
        </Link>
      </div>
    );
  }

  const isOnline = appointment.consultation_type === 'online';
  const patient = appointment.patient;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/doctor/appointments"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-medium text-white tracking-wide">
                Ruang Konsultasi Medis
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-emerald-400 border border-zinc-700">
                {appointment.booking_code}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Pasien: <strong className="text-zinc-200">{patient?.name}</strong> • {appointment.appointment_date} ({appointment.appointment_time?.substring(0, 5)} WIB)
            </p>
          </div>
        </div>

        {/* Live Status Control */}
        <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded-2xl border border-zinc-800">
          <span className="text-xs text-zinc-400 pl-2">Status Saat Ini:</span>
          <select
            disabled={updatingStatus}
            value={appointment.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-semibold text-emerald-400 focus:outline-hidden cursor-pointer"
          >
            <option value="confirmed">Terkonfirmasi</option>
            <option value="checked_in">Check-in Pasien</option>
            <option value="in_progress">Sedang Berjalan</option>
            <option value="completed">Konsultasi Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Main Grid: 2 Column Layout (Left: Clinical Record / Form, Right: Patient Dossier & Online Info) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLS: Clinical Findings, Diagnosis & Prescription */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Online Meet Banner if Online Consultation */}
          {isOnline && (
            <div className="p-5 rounded-2xl bg-blue-950/20 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-blue-300">Telemedicine Google Meet Active</h3>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    {appointment.meeting_link || 'https://meet.google.com/lum-skincare-vip'}
                  </p>
                </div>
              </div>
              <a
                href={appointment.meeting_link || 'https://meet.google.com/lum-skincare-vip'}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 shrink-0"
              >
                <span>Buka Google Meet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Patient Chief Complaint */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <ClipboardList className="w-4 h-4 text-emerald-400" />
              <span>Keluhan Utama Pasien (Anamnesis Awal)</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed italic bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/60">
              &ldquo;{appointment.complaint || 'Tidak ada keluhan tertulis spesifik saat registrasi booking.'}&rdquo;
            </p>
            {appointment.photo_url && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolvePhotoUrl(appointment.photo_url)}
                  alt="Foto Keluhan Pasien"
                  className="w-24 h-24 object-cover rounded-xl border border-zinc-700 shadow-sm shrink-0"
                />
                <div className="space-y-1 text-xs">
                  <p className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-rose-400" />
                    Foto Keluhan yang Dilampirkan Pasien
                  </p>
                  <a
                    href={resolvePhotoUrl(appointment.photo_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-rose-400 hover:underline inline-block"
                  >
                    Buka Foto Ukuran Penuh ↗
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Clinical Record Editor Form */}
          <form onSubmit={handleSaveClinicalNotes} className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-serif font-medium text-white">
                  Rekam Medis & Tindakan Dokter
                </h2>
              </div>
              {notesSuccess && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tersimpan di Database!
                </span>
              )}
            </div>

            {/* Diagnosis */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <span>Diagnosis Klinis (Skin Diagnosis)</span>
                <span className="text-[10px] text-zinc-500 font-normal">(e.g., Acne Vulgaris Grade II, Hyperpigmentation Post-Inflammatory)</span>
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Tuliskan diagnosis dermatologi..."
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Doctor Clinical Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Catatan Dokter & Hasil Observasi Klinis</span>
              </label>
              <textarea
                rows={4}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Catatan hasil analisa skin barrier, sensitivitas, derajat keparahan, evaluasi respon terapi..."
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Treatment Plan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rencana Perawatan (Treatment Plan & In-Clinic Procedures)</span>
              </label>
              <textarea
                rows={3}
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                placeholder="Rencana tindakan in-clinic (e.g. Laser Pico, Chemical Peeling Glow 20%, Follow-up 3 minggu)..."
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Prescription */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-emerald-400" />
                <span>Resep Obat & Regimen Skincare Medis (Prescription)</span>
              </label>
              <textarea
                rows={3}
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="R/ Tretinoin 0.05% cream malam, Azelaic Acid 20% pagi, Barrier Repair Ceramide Gel..."
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingNotes}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingNotes ? 'Menyimpan...' : 'Simpan Rekam Medis'}</span>
              </button>
            </div>
          </form>

          {/* Status History Timeline */}
          {appointment.status_histories && appointment.status_histories.length > 0 && (
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Audit Status Janji Temu
              </h3>
              <div className="space-y-2">
                {appointment.status_histories.map((h) => (
                  <div key={h.id} className="text-xs flex items-center justify-between text-zinc-400 bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/40">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-medium text-zinc-200 uppercase text-[11px]">{h.to_status}</span>
                      {h.notes && <span className="text-zinc-500 text-[11px]">({h.notes})</span>}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(h.created_at).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT 1 COL: Patient Dossier & Medical Profile */}
        <div className="space-y-6">
          
          {/* Patient Card */}
          <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-serif font-bold">
                {patient?.name ? patient.name[0].toUpperCase() : 'P'}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">{patient?.name}</h3>
                <p className="text-[11px] text-zinc-400">
                  {patient?.gender === 'male' ? 'Laki-laki' : patient?.gender === 'female' ? 'Perempuan' : 'Gender -'} • {patient?.date_of_birth ? `${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} th` : '-'}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <Phone className="w-3.5 h-3.5 text-zinc-500" />
                <span>{patient?.phone || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span className="truncate">{patient?.email || '-'}</span>
              </div>
              {patient?.emergency_contact && (
                <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
                  <span>Darurat: {patient.emergency_contact}</span>
                </div>
              )}
            </div>

            {/* Allergy Alert */}
            <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Riwayat Alergi</span>
              </div>
              <p className="text-xs text-rose-200/90 font-medium">
                {patient?.allergies || 'Tidak ada riwayat alergi terdata'}
              </p>
            </div>
          </div>

          {/* Edit Baseline Medical Record */}
          <form onSubmit={handleSavePatientDossier} className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                <Heart className="w-3.5 h-3.5 text-emerald-400" />
                <span>Profil Medis Pasien (Tetap)</span>
              </div>
              {patientRecordSuccess && (
                <span className="text-[11px] font-medium text-emerald-400">Tersimpan!</span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-medium">Tipe Kulit</label>
              <input
                type="text"
                value={skinType}
                onChange={(e) => setSkinType(e.target.value)}
                placeholder="e.g. Oily-Dehydrated, Sensitive..."
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-medium">Daftar Alergi</label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Benzoyl Peroxide, Paraben, Sulfa..."
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-medium">Riwayat Penyakit Kulit</label>
              <textarea
                rows={2}
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="e.g. Dermatitis atopik, riwayat roaccutane..."
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-medium">Catatan Khusus Pasien</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Preferensi produk, sensitivitas aroma..."
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingPatientRecord}
              className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
            >
              {savingPatientRecord ? 'Menyimpan...' : 'Perbarui Dossier Pasien'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
