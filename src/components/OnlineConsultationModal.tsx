'use client';

import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Sparkles,
  User,
  Phone,
  HelpCircle,
  FileText,
  Stethoscope,
  ShieldCheck,
  Video,
  ExternalLink,
  Info,
} from 'lucide-react';
import { localDoctors } from '@/lib/booking';

interface OnlineConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOPICS = [
  'Jerawat Aktif & Bekas Jerawat',
  'Kulit Kusam & Hiperpigmentasi / Flek',
  'Skin Barrier Rusak, Kemerahan & Sensitif',
  'Anti-Aging, Garis Halus & Kerutan',
  'Pori-pori Besar & Komedo',
  'Rekomendasi Skincare Routine Personal',
  'Konsultasi Perawatan Lainnya',
];

// Nomor WhatsApp resmi klinik NOBYDERM (Sementara untuk pengetesan: 081211462862)
const CLINIC_WA_NUMBER = process.env.NEXT_PUBLIC_CLINIC_WA_NUMBER || '6281211462862';

export function OnlineConsultationModal({ isOpen, onClose }: OnlineConsultationModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [doctorId, setDoctorId] = useState('any');
  const [complaint, setComplaint] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Mohon isi nama lengkap Anda.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      setError('Mohon masukkan nomor WhatsApp yang valid (minimal 9 digit).');
      return;
    }

    const doctorObj = localDoctors.find((d) => String(d.id) === String(doctorId));
    const doctorName = doctorObj ? doctorObj.name : 'Tim Dokter / Konselor Klinik';

    // Format WhatsApp Message with Google Meet notice
    const message = [
      `Halo Dokter & Konselor NOBYDERM, saya ingin mengajukan *Konsultasi Online via Google Meet*:`,
      ``,
      `👤 *Nama Pasien:* ${name.trim()}`,
      `📱 *No. WhatsApp:* ${phone.trim()}`,
      `🏷️ *Topik Keluhan:* ${topic}`,
      `🩺 *Dokter Dituju:* ${doctorName}`,
      preferredTime.trim() ? `⏰ *Preferensi Waktu Sesi:* ${preferredTime.trim()}` : null,
      complaint.trim() ? `📝 *Rincian Keluhan:* ${complaint.trim()}` : null,
      ``,
      `📹 *Media Konsultasi:* Google Meet (Mohon kirimkan tautan room Google Meet & konfirmasi jadwalnya)`,
      ``,
      `Terima kasih, saya menunggu arahan link Google Meet dari tim klinik! ✨`,
    ]
      .filter(Boolean)
      .join('\n');

    const waUrl = `https://api.whatsapp.com/send?phone=${CLINIC_WA_NUMBER}&text=${encodeURIComponent(message)}`;

    // Open WhatsApp
    window.open(waUrl, '_blank');

    // Close modal
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 shadow-2xl shadow-rose-950/20 p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-80 h-28 bg-linear-to-b from-rose-200/40 via-pink-100/20 to-transparent dark:from-rose-900/20 dark:via-pink-900/10 dark:to-transparent blur-2xl pointer-events-none rounded-full"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Tutup form konsultasi"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-linear-to-tr from-emerald-500 via-teal-500 to-rose-500 text-white flex items-center justify-center mb-3 shadow-md shadow-emerald-500/20">
            <Video className="w-6 h-6" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold mb-2">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>Google Meet Teleconsultation via WhatsApp</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif text-zinc-900 dark:text-zinc-50 font-normal">
            Konsultasi Online (Google Meet)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Isi formulir pengajuan di bawah ini untuk terhubung ke WhatsApp klinik kami.
          </p>
        </div>

        {/* Google Meet Info Banner */}
        <div className="mb-4 p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/50 flex items-start gap-2.5 text-xs text-teal-900 dark:text-teal-200">
          <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <b className="font-semibold">Info Link Google Meet:</b> Link room Google Meet akan dikirimkan secara manual oleh admin/dokter klinik ke chat WhatsApp setelah Anda mengirim pesan ini.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Nama Lengkap & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                Nama Pasien <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                Nomor WhatsApp <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>
          </div>

          {/* Topik Keluhan Kulit */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">
              Topik / Kategori Keluhan
            </label>
            <div className="relative">
              <HelpCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400 appearance-none cursor-pointer"
              >
                {TOPICS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dokter Tujuan & Preferensi Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                Pilihan Dokter / Terapis
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <select
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400 appearance-none cursor-pointer"
                >
                  <option value="any">Rekomendasi Bebas</option>
                  {localDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                Preferensi Jam GMeet <span className="text-zinc-400 font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                placeholder="Misal: Sore ini / Jam 14:00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          {/* Rincian Keluhan Singkat */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">
              Deskripsi Keluhan Kulit <span className="text-zinc-400 font-normal">(Opsional)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400 pointer-events-none" />
              <textarea
                rows={2}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Ceritakan kondisi kulit yang ingin dikonsultasikan via Google Meet..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400 resize-none"
              />
            </div>
          </div>

          {/* Submit Button to WhatsApp */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-linear-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-700 hover:to-teal-600 shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Minta Link Google Meet via WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Disclaimer */}
          <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Admin klinik akan membalas dengan tautan resmi Google Meet</span>
          </div>
        </form>
      </div>
    </div>
  );
}
