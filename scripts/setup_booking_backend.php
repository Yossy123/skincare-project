<?php

$backendDir = realpath(__DIR__ . '/../../backend');

function putFile($path, $content) {
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
    file_put_contents($path, $content);
    echo "Wrote: " . $path . "\n";
}

putFile($backendDir . '/app/Models/Appointment.php', <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_code',
        'patient_id',
        'doctor_id',
        'service_id',
        'appointment_date',
        'start_time',
        'end_time',
        'consultation_mode',
        'complaint',
        'patient_notes',
        'photo_url',
        'doctor_notes',
        'diagnosis',
        'treatment_plan',
        'prescription',
        'status',
        'cancellation_reason',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'appointment_date' => 'date:Y-m-d',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(AppointmentStatusHistory::class)->orderByDesc('created_at');
    }

    public function logStatusChange(string $newStatus, ?int $changedBy = null, ?string $notes = null): void
    {
        $this->statusHistories()->create([
            'from_status' => $this->status,
            'to_status' => $newStatus,
            'changed_by' => $changedBy,
            'notes' => $notes,
        ]);
        $this->status = $newStatus;
        $this->save();
    }
}
PHP
);

putFile($backendDir . '/app/Http/Controllers/Api/BookingController.php', <<<'PHP'
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

        if (!$doctor->isActive()) {
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
        if (!in_array($dayOfWeek, $availableDays)) {
            return response()->json([
                'success' => true,
                'message' => 'Dokter tidak berpraktik pada hari ' . $date->locale('id')->isoFormat('dddd'),
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

        $workStart = Carbon::parse($request->date . ' ' . ($doctor->work_start_time ?? '09:00:00'));
        $workEnd = Carbon::parse($request->date . ' ' . ($doctor->work_end_time ?? '17:00:00'));

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
                $apptStart = Carbon::parse($request->date . ' ' . $appt->start_time);
                $apptEnd = Carbon::parse($request->date . ' ' . $appt->end_time);

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

            $current->addMinutes(60);
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
            'photo_url' => 'nullable|string|max:500',
        ]);

        $appointment = DB::transaction(function () use ($validated, $request) {
            // 1. Lock doctor & verify active status
            $doctor = Doctor::where('id', $validated['doctor_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if (!$doctor->isActive()) {
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

            if (!in_array($dayOfWeek, $availableDays)) {
                throw ValidationException::withMessages([
                    'date' => ['Dokter tidak berpraktik pada hari ' . $date->locale('id')->isoFormat('dddd')],
                ]);
            }

            // 4. Calculate start and end time
            $startTime = Carbon::parse($validated['date'] . ' ' . $validated['start_time'] . ':00');
            $endTime = $startTime->copy()->addMinutes($service->duration_minutes);

            $workStart = Carbon::parse($validated['date'] . ' ' . ($doctor->work_start_time ?? '09:00:00'));
            $workEnd = Carbon::parse($validated['date'] . ' ' . ($doctor->work_end_time ?? '17:00:00'));

            if ($startTime->lt($workStart) || $endTime->gt($workEnd)) {
                throw ValidationException::withMessages([
                    'start_time' => ['Jam yang dipilih berada di luar jam operasional praktik dokter (' . $doctor->work_start_time . ' - ' . $doctor->work_end_time . ').'],
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

            // 6. Find or Create Patient
            $user = $request->user();
            $userId = $user ? $user->id : null;

            $patient = Patient::firstOrNew(['phone' => $validated['phone']]);
            $patient->name = $validated['name'];
            if (!empty($validated['email'])) {
                $patient->email = $validated['email'];
            }
            if ($userId && !$patient->user_id) {
                $patient->user_id = $userId;
            }
            $patient->save();

            // 7. Generate Unique Booking Code
            do {
                $bookingCode = 'LMR-BKG-' . Carbon::parse($validated['date'])->format('Ymd') . '-' . strtoupper(Str::random(4));
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
PHP
);

putFile($backendDir . '/tests/Feature/BookingTest.php', <<<'PHP'
<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $doctorUser;
    protected User $otherDoctorUser;
    protected User $customerUser;
    protected Doctor $doctor;
    protected Doctor $otherDoctor;
    protected Service $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin.test@lumiere.com',
        ]);

        $this->doctorUser = User::factory()->create([
            'role' => 'doctor',
            'email' => 'doctor1.test@lumiere.com',
        ]);

        $this->otherDoctorUser = User::factory()->create([
            'role' => 'doctor',
            'email' => 'doctor2.test@lumiere.com',
        ]);

        $this->customerUser = User::factory()->create([
            'role' => 'customer',
            'email' => 'customer.test@lumiere.com',
            'phone' => '+628123456789',
        ]);

        $this->doctor = Doctor::create([
            'user_id' => $this->doctorUser->id,
            'name' => 'dr. Yoshi Test',
            'specialization' => 'Dermatology',
            'schedule_days' => 'Senin - Minggu',
            'available_days' => [0, 1, 2, 3, 4, 5, 6],
            'work_start_time' => '09:00:00',
            'work_end_time' => '17:00:00',
            'status' => 'active',
        ]);

        $this->otherDoctor = Doctor::create([
            'user_id' => $this->otherDoctorUser->id,
            'name' => 'dr. Alana Test',
            'specialization' => 'Anti-Aging',
            'schedule_days' => 'Senin - Minggu',
            'available_days' => [0, 1, 2, 3, 4, 5, 6],
            'work_start_time' => '09:00:00',
            'work_end_time' => '17:00:00',
            'status' => 'active',
        ]);

        $this->service = Service::create([
            'code' => 'SRV-TEST',
            'name' => 'Signature Glow Treatment',
            'description' => 'Test facial service',
            'duration_minutes' => 60,
            'price' => 200000,
            'category' => 'Facial',
            'is_active' => true,
        ]);
    }

    public function test_can_fetch_active_services_and_doctors(): void
    {
        $servicesRes = $this->getJson('/api/booking/services');
        $servicesRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonFragment(['code' => 'SRV-TEST']);

        $doctorsRes = $this->getJson('/api/booking/doctors');
        $doctorsRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonFragment(['name' => 'dr. Yoshi Test']);
    }

    public function test_can_calculate_available_slots(): void
    {
        $futureDate = Carbon::tomorrow()->format('Y-m-d');

        $response = $this->getJson("/api/booking/available-slots?doctor_id={$this->doctor->id}&date={$futureDate}&service_id={$this->service->id}");
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_doctor_available', true);

        $slots = $response->json('data.slots');
        $this->assertNotEmpty($slots);
        $this->assertEquals('09:00', $slots[0]['start']);
    }

    public function test_can_create_appointment_successfully(): void
    {
        $futureDate = Carbon::tomorrow()->format('Y-m-d');

        $payload = [
            'service_id' => $this->service->id,
            'doctor_id' => $this->doctor->id,
            'consultation_mode' => 'offline',
            'date' => $futureDate,
            'start_time' => '10:00',
            'name' => 'Jessica Doe',
            'phone' => '+6289988776655',
            'email' => 'jessica.doe@example.com',
            'notes' => 'Acne treatment notes',
        ];

        $response = $this->postJson('/api/booking', $payload);
        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'confirmed');

        $appointment = Appointment::where('doctor_id', $this->doctor->id)->first();
        $this->assertNotNull($appointment);
        $this->assertEquals($futureDate, Carbon::parse($appointment->appointment_date)->format('Y-m-d'));
        $this->assertEquals('10:00:00', $appointment->start_time);
        $this->assertEquals('confirmed', $appointment->status);

        $this->assertDatabaseHas('patients', [
            'phone' => '+6289988776655',
            'name' => 'Jessica Doe',
        ]);
    }

    public function test_rejects_slot_collision_double_booking(): void
    {
        $futureDate = Carbon::tomorrow()->format('Y-m-d');

        $payload = [
            'service_id' => $this->service->id,
            'doctor_id' => $this->doctor->id,
            'consultation_mode' => 'offline',
            'date' => $futureDate,
            'start_time' => '11:00',
            'name' => 'Patient One',
            'phone' => '+628111111111',
        ];

        // First booking succeeds
        $first = $this->postJson('/api/booking', $payload);
        $first->assertStatus(201);

        // Second booking for the exact same slot must be rejected with 422
        $payload2 = [
            'service_id' => $this->service->id,
            'doctor_id' => $this->doctor->id,
            'consultation_mode' => 'online',
            'date' => $futureDate,
            'start_time' => '11:00',
            'name' => 'Patient Two',
            'phone' => '+628222222222',
        ];

        $second = $this->postJson('/api/booking', $payload2);
        $second->assertStatus(422)
            ->assertJsonValidationErrors(['start_time']);
    }

    public function test_rejects_past_date(): void
    {
        $pastDate = Carbon::yesterday()->format('Y-m-d');

        $payload = [
            'service_id' => $this->service->id,
            'doctor_id' => $this->doctor->id,
            'consultation_mode' => 'offline',
            'date' => $pastDate,
            'start_time' => '10:00',
            'name' => 'Patient Past',
            'phone' => '+628333333333',
        ];

        $res = $this->postJson('/api/booking', $payload);
        $res->assertStatus(422)
            ->assertJsonValidationErrors(['date']);
    }

    public function test_doctor_can_only_access_their_own_appointments(): void
    {
        $futureDate = Carbon::tomorrow()->format('Y-m-d');

        $patient = Patient::create([
            'name' => 'Test Patient',
            'phone' => '+628999999999',
        ]);

        $doctorAppt = Appointment::create([
            'booking_code' => 'LMR-BKG-DOC1-001',
            'patient_id' => $patient->id,
            'doctor_id' => $this->doctor->id,
            'service_id' => $this->service->id,
            'appointment_date' => $futureDate,
            'start_time' => '09:00:00',
            'end_time' => '10:00:00',
            'status' => 'confirmed',
        ]);

        $otherDoctorAppt = Appointment::create([
            'booking_code' => 'LMR-BKG-DOC2-002',
            'patient_id' => $patient->id,
            'doctor_id' => $this->otherDoctor->id,
            'service_id' => $this->service->id,
            'appointment_date' => $futureDate,
            'start_time' => '14:00:00',
            'end_time' => '15:00:00',
            'status' => 'confirmed',
        ]);

        // Doctor 1 accesses their appointment -> OK
        $res1 = $this->actingAs($this->doctorUser, 'sanctum')
            ->getJson("/api/doctor/appointments/{$doctorAppt->id}");
        $res1->assertStatus(200)
            ->assertJsonPath('data.appointment.id', $doctorAppt->id);

        // Doctor 1 accesses Doctor 2 appointment -> 404 (isolated)
        $res2 = $this->actingAs($this->doctorUser, 'sanctum')
            ->getJson("/api/doctor/appointments/{$otherDoctorAppt->id}");
        $res2->assertStatus(404);
    }

    public function test_doctor_can_record_diagnosis_and_treatment_notes(): void
    {
        $futureDate = Carbon::tomorrow()->format('Y-m-d');

        $patient = Patient::create([
            'name' => 'Notes Patient',
            'phone' => '+628888888888',
        ]);

        $appt = Appointment::create([
            'booking_code' => 'LMR-BKG-NOTES-001',
            'patient_id' => $patient->id,
            'doctor_id' => $this->doctor->id,
            'service_id' => $this->service->id,
            'appointment_date' => $futureDate,
            'start_time' => '13:00:00',
            'end_time' => '14:00:00',
            'status' => 'in_progress',
        ]);

        $response = $this->actingAs($this->doctorUser, 'sanctum')
            ->postJson("/api/doctor/appointments/{$appt->id}/notes", [
                'diagnosis' => 'Moderate Acne Vulgaris',
                'treatment_plan' => 'Salicylic Acid Peel + LED Blue Light',
                'prescription' => 'Tretinoin 0.025% Cream',
                'doctor_notes' => 'Patient responded well to initial extraction',
                'mark_completed' => true,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.diagnosis', 'Moderate Acne Vulgaris')
            ->assertJsonPath('data.prescription', 'Tretinoin 0.025% Cream');

        $this->assertDatabaseHas('appointments', [
            'id' => $appt->id,
            'status' => 'completed',
            'diagnosis' => 'Moderate Acne Vulgaris',
        ]);
    }

    public function test_admin_can_access_all_appointments_and_patients(): void
    {
        $futureDate = Carbon::tomorrow()->format('Y-m-d');

        $patient = Patient::create([
            'name' => 'Admin Test Patient',
            'phone' => '+628777777777',
        ]);

        $appt = Appointment::create([
            'booking_code' => 'LMR-BKG-ADMIN-001',
            'patient_id' => $patient->id,
            'doctor_id' => $this->doctor->id,
            'service_id' => $this->service->id,
            'appointment_date' => $futureDate,
            'start_time' => '15:00:00',
            'end_time' => '16:00:00',
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/admin/appointments');
        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $patientRes = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/admin/patients/{$patient->id}");
        $patientRes->assertStatus(200)
            ->assertJsonPath('data.id', $patient->id);
    }
}
PHP
);
