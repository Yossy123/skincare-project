'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Phone,
  Mail,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';
import { fetchAdminPatients, type Patient } from '@/lib/booking';

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPatients = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError('');
    try {
      const res = await fetchAdminPatients({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        page,
      });
      setPatients(res.data);
      setTotalPages(res.last_page);
      setTotalCount(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data pasien.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    let isMounted = true;
    fetchAdminPatients({
      search: search.trim() || undefined,
      status: statusFilter || undefined,
      page,
    })
      .then((res) => {
        if (!isMounted) return;
        setPatients(res.data);
        setTotalPages(res.last_page);
        setTotalCount(res.total);
        setError('');
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat data pasien.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [search, statusFilter, page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-white tracking-tight">Manajemen Data Pasien</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Daftar seluruh pasien klinik, riwayat kunjungan medis, dan catatan alergi
          </p>
        </div>
        <button
          onClick={() => loadPatients(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 cursor-pointer transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

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

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="sm:col-span-2 relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari berdasarkan nama pasien, nomor WhatsApp, atau email..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-rose-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:border-rose-500 cursor-pointer"
          >
            <option value="">Semua Status Pasien</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-zinc-400">
            <Sparkles className="w-6 h-6 text-rose-500 animate-spin mx-auto mb-2" />
            <p className="text-xs">Memuat data pasien dari database...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-16 text-center text-zinc-500">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-serif text-zinc-300">Belum ada pasien yang terdaftar</p>
            <p className="text-xs mt-1">Data pasien akan otomatis tercatat saat reservasi dibuat.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/60 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                <tr>
                  <th className="px-5 py-4">Pasien</th>
                  <th className="px-5 py-4">Kontak</th>
                  <th className="px-5 py-4">Catatan Alergi</th>
                  <th className="px-5 py-4">Total Kunjungan</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-zinc-800/40 transition-colors">
                    {/* Patient Name */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{patient.name}</div>
                      <div className="text-[11px] text-zinc-500">
                        {patient.gender ? (patient.gender === 'female' ? 'Perempuan' : 'Laki-laki') : 'Gender -'}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-zinc-200">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{patient.phone}</span>
                      </div>
                      {patient.email && (
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                          <Mail className="w-3 h-3 text-zinc-500" />
                          <span>{patient.email}</span>
                        </div>
                      )}
                    </td>

                    {/* Allergies */}
                    <td className="px-5 py-4 max-w-xs">
                      {patient.allergies ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 line-clamp-1">
                          <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                          <span>{patient.allergies}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[11px]">Tidak ada catatan</span>
                      )}
                    </td>

                    {/* Total Visits */}
                    <td className="px-5 py-4">
                      <span className="font-semibold text-white">{patient.appointments_count || 0}</span>
                      <span className="text-zinc-500 text-[11px] ml-1">sesi</span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                          patient.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        }`}
                      >
                        {patient.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/patients/${patient.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-200 hover:text-white border border-zinc-700 transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Lihat Dossier</span>
                      </Link>
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
              Total: <span className="font-semibold text-white">{totalCount}</span> pasien
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
    </div>
  );
}
