import { API_BASE_URL } from '@/lib/api/client';

export type ConsultationMode = 'offline' | 'online';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type BookingService = {
  id: number;
  code: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: string | number;
  category?: string;
  is_active: boolean;
};

export type BookingDoctor = {
  id: number;
  user_id?: number;
  name: string;
  title: string;
  specialization: string;
  license_number?: string;
  phone?: string;
  experience: string;
  rating: string | number;
  review_count: number;
  avatar_color: string;
  bio: string;
  skills: string[];
  schedule_days: string;
  available_days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  work_start_time: string;
  work_end_time: string;
  status: 'active' | 'inactive';
};

export type Patient = {
  id: number;
  user_id?: number | null;
  name: string;
  phone: string;
  email?: string | null;
  date_of_birth?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  address?: string | null;
  skin_type?: string | null;
  notes?: string | null;
  allergies?: string | null;
  medical_history?: string | null;
  emergency_contact?: string | null;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  appointments_count?: number;
  appointments?: Appointment[];
};

export type AppointmentStatusHistory = {
  id: number;
  appointment_id: number;
  from_status?: string | null;
  to_status: AppointmentStatus;
  changed_by?: number | null;
  notes?: string | null;
  created_at: string;
  changer?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
};

export type Appointment = {
  id: number;
  booking_code: string;
  patient_id: number;
  doctor_id: number;
  service_id: number;
  appointment_date: string;
  appointment_time?: string;
  start_time: string;
  end_time: string;
  consultation_mode: ConsultationMode;
  consultation_type?: ConsultationMode;
  meeting_link?: string | null;
  complaint?: string | null;
  patient_notes?: string | null;
  photo_url?: string | null;
  doctor_notes?: string | null;
  diagnosis?: string | null;
  treatment_plan?: string | null;
  prescription?: string | null;
  status: AppointmentStatus;
  cancellation_reason?: string | null;
  created_by?: number | null;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: BookingDoctor;
  service?: BookingService;
  status_histories?: AppointmentStatusHistory[];
};

export type TimeSlot = {
  start: string;
  end: string;
  is_booked?: boolean;
};

export type AvailableSlotsResponse = {
  doctor: BookingDoctor;
  date: string;
  is_doctor_available: boolean;
  slots: TimeSlot[];
};

export type CreateBookingPayload = {
  service_id: number;
  doctor_id: number;
  consultation_mode: ConsultationMode;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  photo_url?: string;
};

import { useAuthStore } from '@/store/useAuthStore';

function getAuthHeader(): Record<string, string> {
  let token: string | null = null;

  try {
    token = useAuthStore.getState().token;
  } catch {
    // Zustand not yet initialized or during SSR
  }

  if (!token && typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem('nobyderm-auth-storage') || localStorage.getItem('lumiere-auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        token = parsed?.state?.token || null;
      }
    } catch {
      // ignore parse failure
    }

    if (!token) {
      token = localStorage.getItem('auth_token');
    }
  }

  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 1. PUBLIC BOOKING ENDPOINTS
export function resolvePhotoUrl(url: string): string {
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_BASE_URL.replace(/\/api\/?$/, '')}${url}`;
}

export async function fetchBookingServices(): Promise<BookingService[]> {
  const res = await fetch(`${API_BASE_URL}/booking/services`, {
    headers: { Accept: 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memuat layanan perawatan');
  return data.data || [];
}

export async function fetchBookingDoctors(): Promise<BookingDoctor[]> {
  const res = await fetch(`${API_BASE_URL}/booking/doctors`, {
    headers: { Accept: 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memuat daftar dokter');
  return data.data || [];
}

export async function fetchAvailableSlots(params: {
  doctor_id: number;
  date: string;
  service_id?: number;
}): Promise<AvailableSlotsResponse> {
  const query = new URLSearchParams({
    doctor_id: params.doctor_id.toString(),
    date: params.date,
  });
  if (params.service_id) {
    query.set('service_id', params.service_id.toString());
  }

  const res = await fetch(`${API_BASE_URL}/booking/available-slots?${query.toString()}`, {
    headers: { Accept: 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memeriksa slot waktu');
  return data.data;
}

export async function createBooking(payload: CreateBookingPayload): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}/booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.errors
      ? Object.values(data.errors).flat().join(', ')
      : data.message || 'Gagal membuat reservasi.';
    throw new Error(errorMsg);
  }

  return data.data;
}

export async function lookupBooking(bookingCode: string): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}/booking/lookup?booking_code=${encodeURIComponent(bookingCode)}`, {
    headers: { Accept: 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Booking tidak ditemukan');
  return data.data;
}

// 2. CUSTOMER PERSONAL APPOINTMENTS
export async function fetchMyAppointments(): Promise<{ data: Appointment[]; total: number }> {
  const res = await fetch(`${API_BASE_URL}/my-appointments`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat daftar appointment Anda.');
  return json.data;
}

export async function cancelMyAppointment(id: number, reason?: string): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}/my-appointments/${id}/cancel`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ reason }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal membatalkan appointment.');
  return json.data;
}

// 3. ADMIN APPOINTMENT & CLINICAL MANAGEMENT
export async function fetchAdminAppointments(params?: {
  date?: string;
  doctor_id?: string | number;
  service_id?: string | number;
  status?: string;
  search?: string;
  page?: number;
}): Promise<{ data: Appointment[]; total: number; current_page: number; last_page: number }> {
  const query = new URLSearchParams();
  if (params?.date) query.set('date', params.date);
  if (params?.doctor_id) query.set('doctor_id', params.doctor_id.toString());
  if (params?.service_id) query.set('service_id', params.service_id.toString());
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', params.page.toString());

  const res = await fetch(`${API_BASE_URL}/admin/appointments?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat daftar appointment.');
  return json.data;
}

export async function fetchAdminAppointmentDetail(id: number): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}/admin/appointments/${id}`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat detail appointment.');
  return json.data;
}

export async function updateAdminAppointmentStatus(
  id: number,
  status: AppointmentStatus,
  notes?: string,
  cancellation_reason?: string
): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}/admin/appointments/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status, notes, cancellation_reason }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui status appointment.');
  return json.data;
}

export async function updateAdminAppointment(id: number, payload: Partial<Appointment>): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}/admin/appointments/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui appointment.');
  return json.data;
}

export async function deleteAdminAppointment(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/appointments/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal menghapus appointment.');
}

// 4. ADMIN PATIENTS
export async function fetchAdminPatients(params?: {
  search?: string;
  status?: string;
  page?: number;
}): Promise<{ data: Patient[]; total: number; current_page: number; last_page: number }> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', params.page.toString());

  const res = await fetch(`${API_BASE_URL}/admin/patients?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat data pasien.');
  return json.data;
}

export async function fetchAdminPatientDetail(id: number): Promise<Patient> {
  const res = await fetch(`${API_BASE_URL}/admin/patients/${id}`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat detail pasien.');
  return json.data;
}

export async function updateAdminPatient(id: number, payload: Partial<Patient>): Promise<Patient> {
  const res = await fetch(`${API_BASE_URL}/admin/patients/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui data pasien.');
  return json.data;
}

// 5. ADMIN DOCTORS
export async function fetchAdminDoctors(): Promise<BookingDoctor[]> {
  const res = await fetch(`${API_BASE_URL}/admin/doctors`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat data dokter.');
  return json.data;
}

export async function createAdminDoctor(payload: Record<string, unknown>): Promise<BookingDoctor> {
  const res = await fetch(`${API_BASE_URL}/admin/doctors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal menambahkan dokter.');
  return json.data;
}

export async function updateAdminDoctor(id: number, payload: Partial<BookingDoctor>): Promise<BookingDoctor> {
  const res = await fetch(`${API_BASE_URL}/admin/doctors/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui dokter.');
  return json.data;
}

export async function toggleAdminDoctor(id: number): Promise<BookingDoctor> {
  const res = await fetch(`${API_BASE_URL}/admin/doctors/${id}/toggle`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal mengubah status dokter.');
  return json.data;
}

// 6. DOCTOR PORTAL ENDPOINTS
export type DoctorOverviewData = {
  doctor: BookingDoctor;
  today_date?: string;
  metrics: {
    today_appointments: number;
    waiting_patients: number;
    in_progress: number;
    completed_today: number;
    upcoming_appointments?: number;
    total_patients: number;
    [key: string]: number | string | undefined;
  };
  today_queue: Appointment[];
  upcoming_queue?: Appointment[];
  recent_patients: Appointment[];
  today_appointments?: Appointment[];
  upcoming_appointments?: Appointment[];
};

export type DoctorOverviewResponse = DoctorOverviewData;

export async function fetchDoctorOverview(): Promise<DoctorOverviewData> {
  const res = await fetch(`${API_BASE_URL}/doctor/dashboard/overview`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat overview dokter.');
  return json.data;
}

export async function fetchDoctorAppointments(params?: {
  date?: string;
  status?: string;
  search?: string;
  page?: number;
}): Promise<{ data: Appointment[]; total: number; current_page: number; last_page: number }> {
  const query = new URLSearchParams();
  if (params?.date) query.set('date', params.date);
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', params.page.toString());

  const res = await fetch(`${API_BASE_URL}/doctor/appointments?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat jadwal appointment.');
  return json.data;
}

export async function fetchDoctorAppointmentDetail(id: number): Promise<{
  appointment: Appointment;
  patient_history: Appointment[];
}> {
  const res = await fetch(`${API_BASE_URL}/doctor/appointments/${id}`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat detail appointment pasien.');
  return json.data;
}

export async function updateDoctorAppointmentStatus(
  id: number,
  status: AppointmentStatus | string,
  notes?: string
): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}/doctor/appointments/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status, notes }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal mengubah status konsultasi.');
  return json.data;
}

export async function saveDoctorNotes(
  id: number,
  payload: {
    diagnosis?: string;
    doctor_notes?: string;
    treatment_plan?: string;
    prescription?: string;
    mark_completed?: boolean;
  }
): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}/doctor/appointments/${id}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal menyimpan catatan medis.');
  return json.data;
}

export async function updatePatientMedicalRecordByDoctor(
  patientId: number,
  payload: {
    allergies?: string;
    medical_history?: string;
    skin_type?: string;
    notes?: string;
  }
): Promise<Patient> {
  const res = await fetch(`${API_BASE_URL}/doctor/patients/${patientId}/medical-record`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui rekam medis pasien.');
  return json.data;
}

export async function fetchDoctorPatients(params?: {
  search?: string;
  page?: number;
}): Promise<{ data: Patient[]; total: number; current_page: number; last_page: number }> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', params.page.toString());

  const res = await fetch(`${API_BASE_URL}/doctor/patients?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat daftar pasien dokter.');
  return json.data;
}

// Aliases for convenience
export const getDoctorOverview = fetchDoctorOverview;
export const getDoctorAppointments = fetchDoctorAppointments;
export const getDoctorAppointmentDetail = fetchDoctorAppointmentDetail;
export const getDoctorPatients = fetchDoctorPatients;
export const updatePatientMedicalRecord = updatePatientMedicalRecordByDoctor;

export const localDoctors: BookingDoctor[] = [
  {
    id: 1,
    name: 'dr. Yoshi Wijaya, Sp.KK',
    title: 'Spesialis Kulit & Kelamin',
    specialization: 'Dermatologist & Laser Specialist',
    phone: '081211462862',
    experience: '8+ Tahun Pengalaman',
    rating: 4.9,
    review_count: 142,
    avatar_color: 'from-rose-400 to-pink-500',
    bio: 'Fokus pada penanganan jerawat inflamasi, bekas luka atrophic, dan peremajaan kulit modern.',
    skills: ['Laser Treatment', 'Acne Scar Subcision', 'Medical Peeling', 'Anti-Aging Injectables'],
    schedule_days: 'Senin - Jumat',
    available_days: [1, 2, 3, 4, 5],
    work_start_time: '10:00',
    work_end_time: '20:00',
    status: 'active',
  },
  {
    id: 2,
    name: 'dr. Sinta Rahmawati, Sp.DV',
    title: 'Spesialis Dermatologi & Venereologi',
    specialization: 'Anti-Aging & Melasma Expert',
    phone: '081211462862',
    experience: '10+ Tahun Pengalaman',
    rating: 4.9,
    review_count: 198,
    avatar_color: 'from-amber-400 to-rose-400',
    bio: 'Ahli terapi hiperpigmentasi membandel, melasma hormonal, dan skin barrier restoration.',
    skills: ['Melasma Therapy', 'Pico Laser', 'Skin Barrier Repair', 'Collagen Booster'],
    schedule_days: 'Selasa - Sabtu',
    available_days: [2, 3, 4, 5, 6],
    work_start_time: '10:00',
    work_end_time: '20:00',
    status: 'active',
  },
  {
    id: 3,
    name: 'dr. Alana Christie, Sp.KK',
    title: 'Dokter Estetika Klinis',
    specialization: 'Clinical Aesthetic Physician',
    phone: '081211462862',
    experience: '6+ Tahun Pengalaman',
    rating: 4.8,
    review_count: 110,
    avatar_color: 'from-emerald-400 to-teal-500',
    bio: 'Mengedepankan perawatan preventif, glowing radiant finish, dan formulasi home-care presisi.',
    skills: ['Glow Peeling', 'Hydrafacial Pro', 'Botox & Contour', 'Custom Serum Therapy'],
    schedule_days: 'Senin - Kamis & Sabtu',
    available_days: [1, 2, 3, 4, 6],
    work_start_time: '10:00',
    work_end_time: '20:00',
    status: 'active',
  },
];
