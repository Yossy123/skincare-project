<?php

$backendDir = realpath(__DIR__ . '/../../backend');

putFile($backendDir . '/app/Http/Controllers/Api/Admin/AdminDashboardController.php', <<<'PHP'
<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Services\Analytics\AdminDashboardService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function __construct(
        protected AdminDashboardService $dashboardService
    ) {}

    /**
     * Get high-level overview metrics for the executive dashboard.
     *
     * @return JsonResponse
     */
    public function overview(): JsonResponse
    {
        $overview = $this->dashboardService->getOverview();

        $today = Carbon::today()->format('Y-m-d');
        $startOfMonth = Carbon::now()->startOfMonth();

        $overview['clinical'] = [
            'total_patients' => Patient::count(),
            'new_patients_this_month' => Patient::where('created_at', '>=', $startOfMonth)->count(),
            'bookings_today' => Appointment::whereDate('appointment_date', $today)->count(),
            'bookings_pending' => Appointment::where('status', 'pending')->count(),
            'bookings_confirmed' => Appointment::where('status', 'confirmed')->count(),
            'bookings_completed' => Appointment::where('status', 'completed')->count(),
            'today_doctor_schedules' => Doctor::where('status', 'active')
                ->withCount(['appointments' => function ($q) use ($today) {
                    $q->whereDate('appointment_date', $today)->whereNotIn('status', ['cancelled', 'no_show']);
                }])
                ->get(),
        ];

        return response()->json([
            'data' => $overview,
        ], 200);
    }
}
PHP
);

function putFile($path, $content) {
    file_put_contents($path, $content);
    echo "Wrote: " . $path . "\n";
}
