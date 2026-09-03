<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutValidateRequest;
use App\Services\CheckoutService;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    /**
     * @param CheckoutService $checkoutService
     */
    public function __construct(
        protected CheckoutService $checkoutService
    ) {}

    /**
     * Validate checkout items and calculate server-authoritative subtotal and weight.
     *
     * @param CheckoutValidateRequest $request
     * @return JsonResponse
     */
    public function validate(CheckoutValidateRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = $this->checkoutService->validateAndCalculate(
            $request->user(),
            $validated['items'],
            $validated['address_id'] ?? null
        );

        return response()->json($result, 200);
    }
}
