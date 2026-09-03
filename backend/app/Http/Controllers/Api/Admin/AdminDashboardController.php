<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Analytics\AdminDashboardService;
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

        return response()->json([
            'data' => $overview,
        ], 200);
    }
}
