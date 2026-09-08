<?php

// 1. Update BookingController.php
$bookingControllerFile = __DIR__ . '/../../backend/app/Http/Controllers/Api/BookingController.php';
$bookingCode = <<<'PHP'
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    /**
     * Get list of active services for booking.
     */
    public function getServices(): JsonResponse
    {
        $services = Service::where('is_active', true)
            ->orderBy('price')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $services,
        ]);
    }

    /**
     * Get list of active doctors.
     */
    public function getDoctors(): JsonResponse
    {
        $doctors = Doctor::where('status', 'active')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $doctors,
        ]);
    }

    /**
     * Calculate available booking time slots for a given doctor, date, and service.
     */
    public function getAvailableSlots(Request $request): JsonResponse
    {
        $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'date' => 'required|date_format:Y-m-d|after_or_equal:today',
            'service_id' => 'nullable|exists:services,id',
        ]);

        $doctor = Doctor::findOrFail($request->doctor_id);

        if (! $doctor->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'Dokter sedang tidak aktif.',
                'data' => [],
            ], 422);
        }

        $date = Carbon::parse($request->date);
        $dayOfWeek = $date->dayOfWeek; // 0 (Sun) to 6 (Sat)

        // Validate doctor's schedule days
        $availableDays = $doctor->available_days ?? [1, 2, 3, 4, 5];
        if (! in_array($dayOfWeek, $availableDays)) {
            return response()->json([
                'success' => true,
                'message' => 'Dokter tidak berpraktik pada hari '.$date->locale('id')->isoFormat('dddd'),
                'data' => [
                    'doctor' => $doctor,
                    'date' => $request->date,
                    'is_doctor_available' => false,
                    'slots' => [],
                ],
            ]);
        }

        $durationMinutes = 60;
        if ($request->filled('service_id')) {
            $service = Service::find($request->service_id);
            if ($service) {
                $durationMinutes = $service->duration_minutes;
            }
        }

        $workStart = Carbon::parse($request->date.' '.($doctor->work_start_time ?? '09:00:00'));
        $workEnd = Carbon::parse($request->date.' '.($doctor->work_end_time ?? '17:00:00'));

        // Query existing active bookings for this doctor on the date
        $bookedAppointments = Appointment::where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', $request->date)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->get(['start_time', 'end_time']);

        $slots = [];
        $current = $workStart->copy();
        $isToday = $date->isToday();
        $now = Carbon::now();

        while ($current->copy()->addMinutes($durationMinutes)->lte($workEnd)) {
            $slotStart = $current->copy();
            $slotEnd = $current->copy()->addMinutes($durationMinutes);

            $startStr = $slotStart->format('H:i');
            $endStr = $slotEnd->format('H:i');

            // Check overlap with existing appointments
            $isBooked = false;
            foreach ($bookedAppointments as $appt) {
                $apptStart = Carbon::parse($request->date.' '.$appt->start_time);
                $apptEnd = Carbon::parse($request->date.' '.$appt->end_time);

                // Check overlap: start < apptEnd && end > apptStart
                if ($slotStart->lt($apptEnd) && $slotEnd->gt($apptStart)) {
                    $isBooked = true;
                    break;
                }
            }

            // If date is today and slot is in the past, mark as booked / unavailable
            if ($isToday && $slotStart->lte($now)) {
                $isBooked = true;
            }

            $slots[] = [
                'start' => $startStr,
                'end' => $endStr,
                'is_booked' => $isBooked,
            ];

            $current->addMinutes($durationMinutes);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'doctor' => $doctor,
                'date' => $request->date,
                'is_doctor_available' => true,
                'slots' => $slots,
            ],
        ]);
    }

    /**
     * Create a new booking transactionally with pessimistic locking against collisions.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'doctor_id' => 'required|exists:doctors,id',
            'consultation_mode' => 'required|in:offline,online',
            'date' => 'required|date_format:Y-m-d|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string|max:2000',
            'photo_url' => 'nullable|string',
        ]);

        // Process Base64 image upload if provided
        if (! empty($validated['photo_url'])) {
            if (preg_match('/^data:image\/(\w+);base64,/', $validated['photo_url'], $matches)) {
                $imageType = strtolower($matches[1]);
                $allowed = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
                if (in_array($imageType, $allowed)) {
                    $imageData = substr($validated['photo_url'], strpos($validated['photo_url'], ',') + 1);
                    $decodedData = base64_decode($imageData);
                    if ($decodedData !== false) {
                        $extension = $imageType === 'jpeg' ? 'jpg' : $imageType;
                        $filename = 'bookings/' . Str::random(30) . '.' . $extension;
                        Storage::disk('public')->put($filename, $decodedData);
                        $validated['photo_url'] = '/storage/' . $filename;
                    }
                }
            }
        }

        $appointment = DB::transaction(function () use ($validated, $request) {
            // 1. Lock doctor & verify active status
            $doctor = Doctor::where('id', $validated['doctor_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if (! $doctor->isActive()) {
                throw ValidationException::withMessages([
                    'doctor_id' => ['Dokter yang dipilih sedang tidak aktif.'],
                ]);
            }

            // 2. Verify service
            $service = Service::where('id', $validated['service_id'])
                ->where('is_active', true)
                ->firstOrFail();

            // 3. Verify schedule day
            $date = Carbon::parse($validated['date']);
            $dayOfWeek = $date->dayOfWeek;
            $availableDays = $doctor->available_days ?? [1, 2, 3, 4, 5];

            if (! in_array($dayOfWeek, $availableDays)) {
                throw ValidationException::withMessages([
                    'date' => ['Dokter tidak berpraktik pada hari '.$date->locale('id')->isoFormat('dddd')],
                ]);
            }

            // 4. Calculate start and end time
            $startTime = Carbon::parse($validated['date'].' '.$validated['start_time'].':00');
            $endTime = $startTime->copy()->addMinutes($service->duration_minutes);

            $workStart = Carbon::parse($validated['date'].' '.($doctor->work_start_time ?? '09:00:00'));
            $workEnd = Carbon::parse($validated['date'].' '.($doctor->work_end_time ?? '17:00:00'));

            if ($startTime->lt($workStart) || $endTime->gt($workEnd)) {
                throw ValidationException::withMessages([
                    'start_time' => ['Jam yang dipilih berada di luar jam operasional praktik dokter ('.$doctor->work_start_time.' - '.$doctor->work_end_time.').'],
                ]);
            }

            // Prevent booking in the past for today
            if ($date->isToday() && $startTime->lte(Carbon::now())) {
                throw ValidationException::withMessages([
                    'start_time' => ['Jam yang dipilih sudah terlewat untuk hari ini.'],
                ]);
            }

            // 5. Pessimistic check for overlapping appointments
            $startTimeStr = $startTime->format('H:i:s');
            $endTimeStr = $endTime->format('H:i:s');

            $collision = Appointment::where('doctor_id', $doctor->id)
                ->whereDate('appointment_date', $validated['date'])
                ->whereNotIn('status', ['cancelled', 'no_show'])
                ->where(function ($query) use ($startTimeStr, $endTimeStr) {
                    $query->where(function ($q) use ($startTimeStr, $endTimeStr) {
                        $q->where('start_time', '<', $endTimeStr)
                            ->where('end_time', '>', $startTimeStr);
                    });
                })
                ->lockForUpdate()
                ->exists();

            if ($collision) {
                throw ValidationException::withMessages([
                    'start_time' => ['Slot jadwal jam ini sudah diambil oleh pasien lain. Silakan pilih jam atau dokter lain.'],
                ]);
            }

            // 6. Find or Create Patient and link user if authenticated
            $user = $request->user('sanctum') ?? auth('sanctum')->user() ?? $request->user();
            $userId = $user ? $user->id : null;

            $patient = Patient::firstOrNew(['phone' => $validated['phone']]);
            $patient->name = $validated['name'];
            if (! empty($validated['email'])) {
                $patient->email = $validated['email'];
            }
            if ($userId && ! $patient->user_id) {
                $patient->user_id = $userId;
            }
            $patient->save();

            // 7. Generate Unique Booking Code
            do {
                $bookingCode = 'LMR-BKG-'.Carbon::parse($validated['date'])->format('Ymd').'-'.strtoupper(Str::random(4));
            } while (Appointment::where('booking_code', $bookingCode)->exists());

            // 8. Create Appointment
            $appointment = Appointment::create([
                'booking_code' => $bookingCode,
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'service_id' => $service->id,
                'appointment_date' => $validated['date'],
                'start_time' => $startTimeStr,
                'end_time' => $endTimeStr,
                'consultation_mode' => $validated['consultation_mode'],
                'complaint' => $validated['notes'] ?? null,
                'patient_notes' => $validated['notes'] ?? null,
                'photo_url' => $validated['photo_url'] ?? null,
                'status' => 'confirmed',
                'created_by' => $userId,
            ]);

            // 9. Log Initial Status History
            $appointment->logStatusChange('confirmed', $userId, 'Reservasi baru dibuat melalui sistem booking klinik.');

            return $appointment->load(['patient', 'doctor', 'service']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Reservasi perawatan berhasil dikonfirmasi!',
            'data' => $appointment,
        ], 201);
    }

    /**
     * Lookup appointment by booking_code for public guest confirmation.
     */
    public function lookup(Request $request): JsonResponse
    {
        $request->validate([
            'booking_code' => 'required|string',
        ]);

        $appointment = Appointment::where('booking_code', $request->booking_code)
            ->with(['patient', 'doctor', 'service', 'statusHistories'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $appointment,
        ]);
    }
}
PHP;

file_put_contents($bookingControllerFile, $bookingCode);
echo "1. BookingController.php updated successfully.\n";

// 2. Update DoctorDashboardController.php
$doctorDashboardFile = __DIR__ . '/../../backend/app/Http/Controllers/Api/Doctor/DoctorDashboardController.php';
$doctorDashboardCode = <<<'PHP'
<?php

namespace App\Http\Controllers\Api\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorDashboardController extends Controller
{
    /**
     * Get doctor entity for the authenticated doctor user.
     */
    protected function getDoctor(Request $request): Doctor
    {
        $user = $request->user();
        $doctor = Doctor::where('user_id', $user->id)->first();

        if (! $doctor) {
            // Fallback for admin accessing doctor portal or matching doctor user
            $doctor = Doctor::whereHas('user', function ($q) use ($user) {
                $q->where('email', $user->email);
            })->orWhere('status', 'active')->firstOrFail();
        }

        return $doctor;
    }

    /**
     * Doctor Portal Overview: today's schedule, waiting list, upcoming schedule, and monthly summary.
     */
    public function overview(Request $request): JsonResponse
    {
        $doctor = $this->getDoctor($request);
        $today = Carbon::today()->format('Y-m-d');
        $startOfMonth = Carbon::now()->startOfMonth();

        // Today's appointments
        $todayAppointments = Appointment::where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', $today)
            ->with(['patient', 'service'])
            ->orderBy('start_time')
            ->get();

        // Upcoming appointments (future dates)
        $upcomingAppointments = Appointment::where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', '>', $today)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->with(['patient', 'service'])
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->limit(10)
            ->get();

        $waitingCount = $todayAppointments->where('status', 'checked_in')->count();
        $inProgressCount = $todayAppointments->where('status', 'in_progress')->count();
        $completedToday = $todayAppointments->where('status', 'completed')->count();
        $totalToday = $todayAppointments->count();

        $totalUpcoming = Appointment::where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', '>', $today)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->count();

        $monthPatientCount = Appointment::where('doctor_id', $doctor->id)
            ->where('appointment_date', '>=', $startOfMonth)
            ->where('status', 'completed')
            ->distinct('patient_id')
            ->count('patient_id');

        $recentPatients = Appointment::where('doctor_id', $doctor->id)
            ->with(['patient', 'service'])
            ->orderByDesc('appointment_date')
            ->orderByDesc('start_time')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'doctor' => $doctor,
                'today_date' => $today,
                'metrics' => [
                    'total_today' => $totalToday,
                    'today_appointments' => $totalToday,
                    'waiting' => $waitingCount,
                    'waiting_patients' => $waitingCount,
                    'in_progress' => $inProgressCount,
                    'completed_today' => $completedToday,
                    'upcoming_appointments' => $totalUpcoming,
                    'monthly_patients' => $monthPatientCount,
                    'total_patients' => $monthPatientCount,
                ],
                'today_queue' => $todayAppointments,
                'today_appointments' => $todayAppointments,
                'upcoming_queue' => $upcomingAppointments,
                'upcoming_appointments' => $upcomingAppointments,
                'recent_patients' => $recentPatients,
            ],
        ]);
    }

    /**
     * Doctor's appointments list with date and status filters.
     */
    public function appointments(Request $request): JsonResponse
    {
        $doctor = $this->getDoctor($request);

        $query = Appointment::where('doctor_id', $doctor->id)
            ->with(['patient', 'service', 'statusHistories']);

        if ($request->filled('date')) {
            $query->whereDate('appointment_date', $request->date);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('booking_code', 'ILIKE', "%{$search}%")
                    ->orWhereHas('patient', function ($pq) use ($search) {
                        $pq->where('name', 'ILIKE', "%{$search}%")
                            ->orWhere('phone', 'ILIKE', "%{$search}%");
                    });
            });
        }

        $appointments = $query->orderByDesc('appointment_date')
            ->orderByDesc('start_time')
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $appointments,
        ]);
    }

    /**
     * Appointment detail scoped strictly to this doctor, plus patient's past medical notes.
     */
    public function appointmentDetail(Request $request, int $id): JsonResponse
    {
        $doctor = $this->getDoctor($request);

        $appointment = Appointment::where('id', $id)
            ->where('doctor_id', $doctor->id)
            ->with(['patient', 'service', 'statusHistories'])
            ->firstOrFail();

        // Get past appointments of this patient for medical history context
        $patientHistory = Appointment::where('patient_id', $appointment->patient_id)
            ->where('id', '!=', $appointment->id)
            ->where('status', 'completed')
            ->with(['service', 'doctor'])
            ->orderByDesc('appointment_date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'appointment' => $appointment,
                'patient_history' => $patientHistory,
            ],
        ]);
    }

    /**
     * Doctor updates status (checked_in, in_progress, completed, no_show, cancelled).
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $doctor = $this->getDoctor($request);

        $validated = $request->validate([
            'status' => 'required|in:checked_in,in_progress,completed,no_show,cancelled',
            'notes' => 'nullable|string|max:1000',
        ]);

        $appointment = Appointment::where('id', $id)
            ->where('doctor_id', $doctor->id)
            ->firstOrFail();

        $appointment->logStatusChange(
            $validated['status'],
            $request->user()->id,
            $validated['notes'] ?? ('Status diperbarui oleh dr. '.$doctor->name)
        );

        return response()->json([
            'success' => true,
            'message' => 'Status konsultasi berhasil diubah menjadi '.$validated['status'],
            'data' => $appointment->load(['patient', 'service', 'statusHistories']),
        ]);
    }

    /**
     * Doctor saves consultation records (diagnosis, prescription, treatment plan, doctor notes).
     */
    public function saveNotes(Request $request, int $id): JsonResponse
    {
        $doctor = $this->getDoctor($request);

        $validated = $request->validate([
            'diagnosis' => 'nullable|string',
            'doctor_notes' => 'nullable|string',
            'treatment_plan' => 'nullable|string',
            'prescription' => 'nullable|string',
            'mark_completed' => 'nullable|boolean',
        ]);

        $appointment = Appointment::where('id', $id)
            ->where('doctor_id', $doctor->id)
            ->firstOrFail();

        $appointment->update([
            'diagnosis' => $validated['diagnosis'] ?? $appointment->diagnosis,
            'doctor_notes' => $validated['doctor_notes'] ?? $appointment->doctor_notes,
            'treatment_plan' => $validated['treatment_plan'] ?? $appointment->treatment_plan,
            'prescription' => $validated['prescription'] ?? $appointment->prescription,
        ]);

        if (! empty($validated['mark_completed'])) {
            $appointment->logStatusChange('completed', $request->user()->id, 'Konsultasi dan rekam medis diselesaikan oleh dokter.');
        }

        return response()->json([
            'success' => true,
            'message' => 'Catatan medis dan diagnosis berhasil disimpan.',
            'data' => $appointment->load(['patient', 'service', 'statusHistories']),
        ]);
    }

    /**
     * Update patient allergies and general medical history.
     */
    public function updatePatientMedicalRecord(Request $request, int $patientId): JsonResponse
    {
        $doctor = $this->getDoctor($request);

        // Security check: ensure patient has at least one appointment with this doctor
        $hasRelationship = Appointment::where('patient_id', $patientId)
            ->where('doctor_id', $doctor->id)
            ->exists();

        if (! $hasRelationship && ! $request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki otorisasi untuk mengubah data pasien ini.',
            ], 403);
        }

        $validated = $request->validate([
            'allergies' => 'nullable|string',
            'medical_history' => 'nullable|string',
        ]);

        $patient = Patient::findOrFail($patientId);
        $patient->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Riwayat medis & alergi pasien berhasil diperbarui.',
            'data' => $patient,
        ]);
    }

    /**
     * List all patients who have had appointments with this doctor.
     */
    public function patients(Request $request): JsonResponse
    {
        $doctor = $this->getDoctor($request);

        $patientIds = Appointment::where('doctor_id', $doctor->id)
            ->pluck('patient_id')
            ->unique();

        $patients = Patient::whereIn('id', $patientIds)
            ->withCount(['appointments' => function ($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id);
            }])
            ->orderBy('name')
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $patients,
        ]);
    }
}
PHP;

file_put_contents($doctorDashboardFile, $doctorDashboardCode);
echo "2. DoctorDashboardController.php updated successfully.\n";

// 3. Update migration file for photo_url
$migrationFile = __DIR__ . '/../../backend/database/migrations/2026_09_08_000006_change_photo_url_to_text_in_appointments_table.php';
$migrationCode = <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->text('photo_url')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('photo_url')->nullable()->change();
        });
    }
};
PHP;

file_put_contents($migrationFile, $migrationCode);
echo "3. Migration file written.\n";
