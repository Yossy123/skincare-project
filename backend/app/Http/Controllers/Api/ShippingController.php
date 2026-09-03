<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ShippingRateRequest;
use App\Services\RajaOngkirService;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    public function __construct(
        protected ShippingService $shippingService,
        protected RajaOngkirService $rajaOngkirService
    ) {}

    /**
     * Calculate and return normalized shipping rates from supported couriers.
     *
     * @param ShippingRateRequest $request
     * @return JsonResponse
     */
    public function rates(ShippingRateRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $rates = $this->shippingService->getShippingRates(
            $validated['destination'],
            (int) $validated['weight'],
            $validated['couriers'] ?? null,
            $request->user()
        );

        return response()->json([
            'data' => $rates,
        ], 200);
    }

    /**
     * Search RajaOngkir domestic destinations by query string.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function destinations(Request $request): JsonResponse
    {
        $search = (string) $request->query('search', '');
        $destinations = $this->rajaOngkirService->searchDestinations($search);

        return response()->json([
            'data' => $destinations,
        ], 200);
    }
}
