<?php

namespace App\Services\Orders;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderCancellationService
{
    /**
     * Valid cancellation reasons.
     */
    public const VALID_CANCELLATION_REASONS = [
        'customer_request',
        'payment_issue',
        'product_unavailable',
        'shipping_issue',
        'duplicate_order',
        'fraud_suspicious',
        'other',
    ];

    public function __construct(
        protected OrderAuditService $auditService,
        protected AdminOrderQueryService $queryService
    ) {}

    /**
     * Cancel order and idempotently restore reserved inventory stock.
     * Eligible statuses: PENDING_PAYMENT, PAID, PROCESSING.
     *
     * @param  array{reason: string, note?: string}  $payload
     *
     * @throws ValidationException
     */
    public function cancelOrder(int $orderId, User $admin, array $payload): Order
    {
        $reason = trim((string) ($payload['reason'] ?? ''));
        $note = trim((string) ($payload['note'] ?? ''));

        if (empty($reason) || ! in_array($reason, self::VALID_CANCELLATION_REASONS, true)) {
            throw ValidationException::withMessages([
                'reason' => ['Please select a valid cancellation reason from the predefined list.'],
            ]);
        }

        if ($reason === 'other' && empty($note)) {
            throw ValidationException::withMessages([
                'note' => ['Please provide a descriptive note when selecting "Other" as the cancellation reason.'],
            ]);
        }

        return DB::transaction(function () use ($orderId, $admin, $reason, $note) {
            /** @var Order $order */
            $order = Order::with('orderItems')->where('id', $orderId)->lockForUpdate()->firstOrFail();

            if (! $order->canBeCancelled()) {
                throw ValidationException::withMessages([
                    'status' => ["Order #{$order->id} with status '{$order->status}' cannot be cancelled."],
                ]);
            }

            $previousStatus = strtoupper($order->status);

            // Idempotent Inventory Stock Restoration
            if ($order->stock_restored_at === null) {
                foreach ($order->orderItems as $item) {
                    $product = Product::where('id', $item->product_id)->lockForUpdate()->first();
                    if ($product) {
                        $product->increment('stock', $item->quantity);
                    }
                }
                $order->stock_restored_at = now();
            }

            // Update order state
            $order->status = 'CANCELLED';
            $order->cancellation_reason = $reason;
            $order->cancellation_note = $note ?: null;
            $order->cancelled_by = $admin->id;
            $order->cancelled_at = now();
            $order->save();

            // Record Audit Log
            $this->auditService->log(
                orderId: $order->id,
                adminId: $admin->id,
                action: 'ORDER_CANCELLED',
                previousStatus: $previousStatus,
                newStatus: 'CANCELLED',
                note: $note ?: "Order cancelled. Reason: {$reason}.",
                reason: $reason,
                metadata: [
                    'restored_stock' => true,
                    'stock_restored_at' => $order->stock_restored_at?->toIso8601String(),
                ]
            );

            return $this->queryService->getOrderDetail($order->id);
        });
    }
}
