'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  getDoctorPatients,
  Patient,
} from '@/lib/booking';
import {
  Users,
  Search,
  AlertTriangle,
  Phone,
  Mail,
  Sparkles,
  ArrowRight,
  RotateCw,
} from 'lucide-react';

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadPatients = useCallback(async (query = '') => {
    try {
      setLoading(true);
      const res = await getDoctorPatients({ search: query });
      setPatients(res.data || []);
    } catch (err: unknown) {
      console.error('Failed to load doctor patients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    getDoctorPatients()
      .then((res) => {
        if (isMounted) setPatients(res.data || []);
      })
      .catch((err: unknown) => {
        console.error('Failed to load doctor patients:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPatients(search);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-medium text-white tracking-wide">
            Daftar Pasien & Rekam Medis
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Database pasien yang berkonsultasi dengan Anda, riwayat kondisi kulit, dan catatan terapi.
          </p>
        </div>

        <button
          onClick={() => loadPatients()}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-all flex items-center gap-2 cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Search Filter */}
      <form onSubmit={handleSearchSubmit} className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama pasien, nomor WhatsApp, atau email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-all shadow-md shadow-emerald-600/20"
        >
          Cari Pasien
        </button>
      </form>

      {/* Patients Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 gap-3">
          <Sparkles className="w-6 h-6 text-emerald-400 animate-spin" />
          <p className="text-xs text-zinc-400">Memuat Basis Data Pasien...</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="p-12 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-2">
          <Users className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-sm font-serif text-zinc-300">Belum ada pasien terdaftar</p>
          <p className="text-xs text-zinc-500">Pasien yang melakukan booking dengan Anda akan muncul otomatis di sini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p) => {
            const hasAllergies = Boolean(p.allergies && p.allergies.toLowerCase() !== 'tidak ada' && p.allergies !== '-');

            return (
              <div
                key={p.id}
                className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-base font-serif font-bold shrink-0">
                        {p.name ? p.name[0].toUpperCase() : 'P'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">{p.name}</h3>
                        <p className="text-[11px] text-zinc-400">
                          {p.gender === 'male' ? 'Pria' : p.gender === 'female' ? 'Wanita' : '-'} • {p.date_of_birth ? `${new Date().getFullYear() - new Date(p.date_of_birth).getFullYear()} th` : '-'}
                        </p>
                      </div>
                    </div>

                    {p.skin_type && (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-[10px] font-semibold text-emerald-400 shrink-0">
                        {p.skin_type}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-300 pt-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{p.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">{p.email || '-'}</span>
                    </div>
                  </div>

                  {hasAllergies && (
                    <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-[11px] text-rose-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold">Alergi:</strong> {p.allergies}
                      </div>
                    </div>
                  )}

                  {p.medical_history && (
                    <div className="text-[11px] text-zinc-400 bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/40 line-clamp-2">
                      <strong className="text-zinc-300">Riwayat:</strong> {p.medical_history}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-mono text-[11px]">
                    {p.appointments_count !== undefined ? `${p.appointments_count} kali sesi` : 'Pasien Terdaftar'}
                  </span>
                  
                  {/* Link to appointments filter by this patient */}
                  <Link
                    href={`/doctor/appointments`}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 group"
                  >
                    <span>Lihat Jadwal</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
