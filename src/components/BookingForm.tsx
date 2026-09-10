'use client';

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CalendarDays,
  Clock3,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  Sparkles,
  Check,
  AlertCircle,
  ShieldCheck,
  Scissors,
  Heart,
  Calendar as CalendarIcon,
  X,
  Image as ImageIcon,
  Ban,
  Video,
  UploadCloud,
} from 'lucide-react';
import {
  fetchBookingServices,
  fetchBookingDoctors,
  fetchAvailableSlots,
  createBooking,
  type BookingDoctor,
  type BookingService,
  type TimeSlot,
  type ConsultationMode,
} from '@/lib/booking';

export function BookingForm() {
  const router = useRouter();
  const params = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [services, setServices] = useState<BookingService[]>([]);
  const [allDoctors, setAllDoctors] = useState<BookingDoctor[]>([]);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [consultationMode, setConsultationMode] = useState<ConsultationMode>('offline');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  // Client info state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Status state
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Minimum date: today or tomorrow
  const minDate = useMemo(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }, []);

  const selectedService = services.find((item) => item.id === serviceId);
  const selectedDoctor = allDoctors.find((item) => item.id === doctorId);

  // Initial Load: services and doctors from Laravel API
  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchBookingServices(), fetchBookingDoctors()])
      .then(([s, d]) => {
        if (!isMounted) return;
        setServices(s);
        setAllDoctors(d);

        // Pre-select service from URL param if available
        const requested = params.get('service');
        const foundService = s.find(
          (item) =>
            item.code === requested ||
            item.id.toString() === requested ||
            item.name.toLowerCase().includes((requested ?? '').toLowerCase())
        );
        if (foundService) {
          setServiceId(foundService.id);
        } else if (s.length > 0) {
          setServiceId(s[0].id);
        }

        // Pre-select doctor from URL param if available
        const requestedDoc = params.get('doctor');
        const foundDoc = d.find(
          (item) =>
            item.id.toString() === requestedDoc ||
            item.name.toLowerCase().includes((requestedDoc ?? '').toLowerCase())
        );
        if (foundDoc) {
          setDoctorId(foundDoc.id);
        } else if (d.length > 0) {
          setDoctorId(d[0].id);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Gagal memuat data layanan atau dokter dari server.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [params]);

  // Load available time slots when doctor, date, or service changes
  useEffect(() => {
    if (!doctorId || !date || !serviceId) {
      return;
    }

    let isMounted = true;

    fetchAvailableSlots({ doctor_id: doctorId, date, service_id: serviceId })
      .then((res) => {
        if (!isMounted) return;
        if (!res.is_doctor_available) {
          setSlots([]);
          setSlot(null);
        } else {
          setSlots(res.slots);
          setSlot((currentSlot) => {
            if (currentSlot && !res.slots.some((item) => item.start === currentSlot.start && !item.is_booked)) {
              return null;
            }
            return currentSlot;
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Jadwal jam belum dapat dimuat.');
        setSlots([]);
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [doctorId, date, serviceId]);

  // Filter available doctors for the chosen day of week
  const doctorsForDate = useMemo(() => {
    if (!date) return allDoctors;
    const dayOfWeek = new Date(date).getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    return allDoctors.filter((doc) => {
      const days = doc.available_days || [1, 2, 3, 4, 5];
      return days.includes(dayOfWeek);
    });
  }, [date, allDoctors]);

  const handleDateChange = useCallback((newDate: string) => {
    setDate(newDate);
    setSlot(null);
    if (newDate) {
      const dayOfWeek = new Date(newDate).getDay();
      const availableDocs = allDoctors.filter((doc) => {
        const days = doc.available_days || [1, 2, 3, 4, 5];
        return days.includes(dayOfWeek);
      });
      if (availableDocs.length > 0 && doctorId && !availableDocs.some((d) => d.id === doctorId)) {
        setDoctorId(availableDocs[0].id);
      }
    }
  }, [allDoctors, doctorId]);

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Format file harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file foto maksimal 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!serviceId) {
      setError('Pilih layanan perawatan terlebih dahulu.');
      return;
    }

    if (!date) {
      setError('Pilih tanggal reservasi terlebih dahulu.');
      return;
    }

    if (!doctorId) {
      setError('Pilih dokter spesialis yang akan menangani perawatan Anda.');
      return;
    }

    if (!slot) {
      setError('Pilih jam kunjungan terlebih dahulu.');
      return;
    }

    if (slot.is_booked) {
      setError('Jam yang Anda pilih sudah terisi (booked). Silakan pilih jam lainnya.');
      return;
    }

    if (!name.trim() || phone.replace(/\D/g, '').length < 9) {
      setError('Lengkapi nama lengkap dan nomor WhatsApp aktif terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    try {
      const appointment = await createBooking({
        service_id: serviceId,
        doctor_id: doctorId,
        consultation_mode: consultationMode,
        date,
        start_time: slot.start,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
        photo_url: photoPreview || undefined,
      });

      router.push(`/booking/success?code=${encodeURIComponent(appointment.booking_code)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking gagal diproses. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatIDR = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
  };

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.toLowerCase().includes('hair')) return <Scissors className="w-5 h-5 text-rose-500" />;
    if (serviceName.toLowerCase().includes('acne')) return <ShieldCheck className="w-5 h-5 text-rose-500" />;
    if (serviceName.toLowerCase().includes('brightening') || serviceName.toLowerCase().includes('glow'))
      return <Sparkles className="w-5 h-5 text-rose-500" />;
    return <Heart className="w-5 h-5 text-rose-500" />;
  };

  if (loading) {
    return (
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-12 text-center shadow-lg shadow-rose-950/5">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6 text-rose-500 animate-spin" />
        </div>
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Menyiapkan sistem reservasi klinik dari server...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Sequential Booking Steps */}
      <div className="lg:col-span-8 space-y-8">
        {/* Error Alert Box */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Informasi Reservasi</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* STEP 1: Pilih Format Konsultasi & Layanan Perawatan */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm transition-all hover:border-rose-200 dark:hover:border-zinc-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-linear-to-tr from-rose-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                1
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-serif font-medium text-zinc-900 dark:text-zinc-100">
                  Pilih Layanan Perawatan
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Tentukan treatment dan format konsultasi yang Anda butuhkan
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="inline-flex p-1 rounded-2xl bg-stone-100 dark:bg-zinc-800 border border-rose-100 dark:border-zinc-700 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setConsultationMode('offline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  consultationMode === 'offline'
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>In-Clinic VIP</span>
              </button>
              <button
                type="button"
                onClick={() => setConsultationMode('online')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  consultationMode === 'online'
                    ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Telekonsultasi GMeet</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {services.map((item) => {
              const isSelected = serviceId === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setServiceId(item.id);
                    setSlot(null);
                  }}
                  className={`group relative text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-400/40 dark:ring-rose-500/30 shadow-xs'
                      : 'border-rose-100/70 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-zinc-700 bg-stone-50/30 dark:bg-zinc-900/50'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-rose-500 text-white'
                            : 'bg-rose-100/70 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:scale-105'
                        }`}
                      >
                        {getServiceIcon(item.name)}
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          isSelected
                            ? 'bg-rose-500 text-white border-rose-500'
                            : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-rose-100 dark:border-zinc-700'
                        }`}
                      >
                        {item.duration_minutes} Menit
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-semibold transition-colors ${
                        isSelected ? 'text-rose-900 dark:text-rose-200' : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {item.name}
                    </h3>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-rose-100/60 dark:border-zinc-800/80 flex items-center justify-between">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">Tarif Sesi</span>
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400 font-sans">
                      {formatIDR(item.price)}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* STEP 2: Pilih Tanggal Kunjungan */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm transition-all hover:border-rose-200 dark:hover:border-zinc-700">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-7 h-7 rounded-full bg-linear-to-tr from-rose-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
              2
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-medium text-zinc-900 dark:text-zinc-100">
                Pilih Tanggal Reservasi
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tentukan hari kunjungan atau konsultasi online Anda
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <label
              htmlFor="booking-date-input"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-2"
            >
              Tanggal Kedatangan
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                id="booking-date-input"
                type="date"
                required
                min={minDate}
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 text-sm rounded-2xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400 cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* STEP 3: Pilih Dokter yang Berpraktik */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm transition-all hover:border-rose-200 dark:hover:border-zinc-700">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-7 h-7 rounded-full bg-linear-to-tr from-rose-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
              3
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-medium text-zinc-900 dark:text-zinc-100">
                Pilih Dokter / Specialist
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Pilih dokter spesialis dermatologi atau beauty therapist terpercaya
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {doctorsForDate.map((doc) => {
              const isSelected = doctorId === doc.id;
              return (
                <button
                  type="button"
                  key={doc.id}
                  onClick={() => {
                    setDoctorId(doc.id);
                    setSlot(null);
                  }}
                  className={`relative text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-400/40 dark:ring-rose-500/30 shadow-xs'
                      : 'border-rose-100/70 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-zinc-700 bg-stone-50/30 dark:bg-zinc-900/50'
                  }`}
                >
                  <div>
                    <div className="flex items-start gap-3.5 mb-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-linear-to-tr ${doc.avatar_color} text-white flex items-center justify-center font-serif font-bold text-base shadow-sm shrink-0`}
                      >
                        {doc.name.replace('dr. ', '').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0 pr-5">
                        <h3
                          className={`text-sm font-semibold truncate ${
                            isSelected ? 'text-rose-900 dark:text-rose-200' : 'text-zinc-900 dark:text-zinc-100'
                          }`}
                        >
                          {doc.name}
                        </h3>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">{doc.title}</p>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {doc.bio}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-rose-100/60 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400 dark:text-zinc-500">Jadwal Praktik</span>
                    <span className="font-medium text-rose-600 dark:text-rose-400">{doc.schedule_days}</span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* STEP 4: Pilih Jam Kunjungan */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm transition-all hover:border-rose-200 dark:hover:border-zinc-700">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-7 h-7 rounded-full bg-linear-to-tr from-rose-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
              4
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-medium text-zinc-900 dark:text-zinc-100">
                  Pilih Jam Kunjungan
                </h2>
                {selectedService && (
                  <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-900/50">
                    Durasi: {selectedService.duration_minutes} Menit
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Slot waktu yang tersedia disinkronkan langsung dengan jadwal dokter
              </p>
            </div>
          </div>

          <div>
            {!date ? (
              <div className="p-6 rounded-2xl bg-stone-50 dark:bg-zinc-800/40 border border-dashed border-rose-200 dark:border-zinc-700 text-center text-xs text-zinc-500 dark:text-zinc-400">
                <Clock3 className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                <p>Pilih tanggal dan dokter terlebih dahulu untuk melihat ketersediaan jam praktik.</p>
              </div>
            ) : loadingSlots ? (
              <div className="p-8 text-center">
                <Sparkles className="w-5 h-5 text-rose-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Memeriksa ketersediaan slot...</p>
              </div>
            ) : slots.length > 0 ? (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {slots.map((item) => {
                    const isSlotSelected = slot?.start === item.start;
                    const isBooked = !!item.is_booked;

                    return (
                      <button
                        type="button"
                        key={item.start}
                        disabled={isBooked}
                        onClick={() => !isBooked && setSlot(item)}
                        title={isBooked ? 'Slot jam ini sudah terisi' : `Pilih jam ${item.start} - ${item.end}`}
                        className={`px-3 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                          isBooked
                            ? 'bg-stone-100 dark:bg-zinc-800/40 text-zinc-400 dark:text-zinc-500 border-zinc-200/80 dark:border-zinc-800 cursor-not-allowed opacity-60'
                            : isSlotSelected
                            ? 'bg-linear-to-r from-rose-500 to-pink-500 text-white border-rose-500 shadow-md shadow-rose-500/20 scale-[1.02] cursor-pointer'
                            : 'bg-white dark:bg-zinc-800 border-rose-100 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-rose-300 hover:bg-rose-50/40 dark:hover:bg-zinc-700/50 cursor-pointer'
                        }`}
                      >
                        {isBooked ? (
                          <Ban className="w-3.5 h-3.5 text-zinc-400" />
                        ) : (
                          <Clock3 className={`w-3.5 h-3.5 ${isSlotSelected ? 'text-white' : 'text-rose-500'}`} />
                        )}
                        <span className={isBooked ? 'line-through' : ''}>
                          {item.start} – {item.end}
                        </span>
                        {isBooked && (
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 ml-0.5">
                            Penuh
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend Slot Status */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-zinc-500 dark:text-zinc-400 pt-3 border-t border-rose-100/60 dark:border-zinc-800/80">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-white dark:bg-zinc-800 border border-rose-400"></span>
                    <span>Tersedia</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-linear-to-r from-rose-500 to-pink-500"></span>
                    <span>Sedang Dipilih</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-zinc-600"></span>
                    <span>Sudah Terisi (Booked)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-center text-xs text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto mb-1.5" />
                <p className="font-semibold">Dokter tidak berpraktik pada hari tersebut.</p>
                <p className="mt-0.5 text-zinc-600 dark:text-zinc-400">Silakan pilih tanggal alternatif lain atau pilih dokter lain.</p>
              </div>
            )}
          </div>
        </section>

        {/* STEP 5: Data Diri Pasien + Upload Foto */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm transition-all hover:border-rose-200 dark:hover:border-zinc-700">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-7 h-7 rounded-full bg-linear-to-tr from-rose-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
              5
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-medium text-zinc-900 dark:text-zinc-100">
                Informasi Pasien & Foto Keluhan
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Lengkapi identitas serta unggah foto kondisi kulit untuk analisa awal dokter
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label
                  htmlFor="patient-name"
                  className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block"
                >
                  Nama Lengkap Pasien <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    id="patient-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jessica Alexander"
                    className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              {/* Nomor WhatsApp */}
              <div className="space-y-1.5">
                <label
                  htmlFor="patient-phone"
                  className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block"
                >
                  Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    id="patient-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="patient-email"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block"
              >
                Email Konfirmasi <span className="text-zinc-400 font-normal">(Opsional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  id="patient-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jessica@example.com"
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            {/* Catatan Keluhan Kulit */}
            <div className="space-y-1.5">
              <label
                htmlFor="patient-notes"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block"
              >
                Keluhan / Riwayat Kulit <span className="text-zinc-400 font-normal">(Opsional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
                <textarea
                  id="patient-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Kulit sensitif beruntusan di area dagu, riwayat alergi alkohol, dll."
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400 resize-none"
                />
              </div>
            </div>

            {/* Upload Foto Keluhan Kulit */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
                  <span>Foto Kondisi Kulit / Keluhan</span>
                  <span className="text-zinc-400 font-normal">(Opsional)</span>
                </label>
                <span className="text-[11px] text-zinc-400">Max 5MB (JPG/PNG)</span>
              </div>

              {!photoPreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-rose-200 dark:border-zinc-700 hover:border-rose-400 dark:hover:border-zinc-500 bg-stone-50/50 dark:bg-zinc-800/30 text-center cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Klik untuk memilih foto kondisi kulit Anda
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Membantu dokter menyiapkan analisa treatment</p>
                </div>
              ) : (
                <div className="relative rounded-2xl border border-rose-200 dark:border-zinc-700 overflow-hidden bg-stone-50 dark:bg-zinc-800 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoPreview}
                      alt="Keluhan Kulit Preview"
                      className="w-14 h-14 object-cover rounded-xl border border-rose-200 shadow-xs"
                    />
                    <div>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                        Foto Berhasil Dimuat
                      </span>
                      <span className="text-[11px] text-emerald-600 font-medium">Siap dikirim bersama reservasi</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-2 rounded-xl bg-stone-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                    title="Hapus foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Right Column: Sticky Reservation Summary & Confirmation */}
      <div className="lg:col-span-4 sticky top-28 space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100/90 dark:border-zinc-800 p-6 sm:p-7 shadow-lg shadow-rose-950/5">
          <h3 className="font-serif text-lg font-medium text-zinc-900 dark:text-zinc-100 pb-4 border-b border-rose-100/70 dark:border-zinc-800">
            Ringkasan Reservasi
          </h3>

          <div className="mt-5 space-y-4 text-xs">
            {/* Treatment Selected */}
            <div className="flex justify-between items-start gap-2">
              <span className="text-zinc-500 dark:text-zinc-400">Treatment</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">
                {selectedService ? selectedService.name : 'Belum dipilih'}
              </span>
            </div>

            {/* Mode Selected */}
            <div className="flex justify-between items-center gap-2">
              <span className="text-zinc-500 dark:text-zinc-400">Format Sesi</span>
              <span className={`font-semibold px-2 py-0.5 rounded-md ${
                consultationMode === 'online'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
              }`}>
                {consultationMode === 'online' ? 'Online (Google Meet)' : 'In-Clinic (Offline)'}
              </span>
            </div>

            {/* Doctor Selected */}
            <div className="flex justify-between items-start gap-2">
              <span className="text-zinc-500 dark:text-zinc-400">Dokter</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">
                {selectedDoctor ? selectedDoctor.name : 'Belum dipilih'}
              </span>
            </div>

            {/* Date & Time Slot */}
            <div className="flex justify-between items-center gap-2">
              <span className="text-zinc-500 dark:text-zinc-400">Jadwal</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">
                {date && slot ? `${date}, ${slot.start} WIB` : date ? `${date} (Pilih Jam)` : 'Belum ditentukan'}
              </span>
            </div>

            {/* Photo attached indicator */}
            {photoPreview && (
              <div className="flex justify-between items-center gap-2 text-[11px] pt-2 border-t border-rose-100/40 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Foto Terlampir</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                  <Check className="w-3.5 h-3.5" /> 1 Foto Keluhan
                </span>
              </div>
            )}

            {/* Pricing Summary */}
            <div className="pt-4 border-t border-rose-100/70 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span>Tarif Treatment</span>
                <span>{selectedService ? formatIDR(selectedService.price) : 'Rp 0'}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span>Biaya Reservasi</span>
                <span className="text-emerald-600 font-medium">Gratis (Bayar di Klinik)</span>
              </div>

              <div className="pt-3 border-t border-rose-100/70 dark:border-zinc-800 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">Total Estimasi</span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Termasuk konsultasi & fasilitas</span>
                </div>
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400 font-sans">
                  {selectedService ? formatIDR(selectedService.price) : 'Rp 0'}
                </span>
              </div>
            </div>
          </div>

          {/* Submit CTA Button */}
          <div className="mt-6 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-sm font-semibold text-white bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/30 transition-all cursor-pointer active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Database Klinik...</span>
                </>
              ) : (
                <>
                  <CalendarDays className="w-4 h-4" />
                  <span>Konfirmasi Reservasi Sekarang</span>
                </>
              )}
            </button>
          </div>

          {/* Safety note */}
          <div className="mt-5 pt-4 border-t border-rose-100/60 dark:border-zinc-800 text-[11px] text-zinc-400 dark:text-zinc-500 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Privasi data & foto medis dijamin kerahasiaannya</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Tersimpan aman di database NOBYDERM</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
