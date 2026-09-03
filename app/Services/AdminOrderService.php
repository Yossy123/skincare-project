<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderAuditLog;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdminOrderService
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

    /**
     * List orders with filtering, search, and pagination for back office.
     *
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function listOrders(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Order::query()
            ->with([
                'user:id,name,email,phone',
                'payment:id,order_id,status,provider,amount',
                'shipment:id,order_id,courier,service,tracking_number,status',
            ]);

        // Search by Order ID or Customer Name/Email
        if (!empty($filters['search'])) {
            $search = trim((string) $filters['search']);
            $cleanId = ltrim(str_replace('#', '', $search), '0');

            $query->where(function ($q) use ($search, $cleanId) {
                if (is_numeric($cleanId) && (int) $cleanId > 0) {
                    $q->orWhere('orders.id', (int) $cleanId);
                }
                $q->orWhereHas('user', function ($uq) use ($search) {
                    $uq->where('name', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%");
                });
            });
        }

        // Filter by Order Status
        if (!empty($filters['order_status'])) {
            $status = strtoupper(trim((string) $filters['order_status']));
            $query->where(function ($q) use ($status) {
                $q->where('orders.status', $status)
                    ->orWhere('orders.status', strtolower($status));
            });
        }

        // Filter by Payment Status
        if (!empty($filters['payment_status'])) {
            $paymentStatus = strtolower(trim((string) $filters['payment_status']));
            $query->whereHas('payment', function ($pq) use ($paymentStatus) {
                $pq->where('status', $paymentStatus);
            });
        }

        // Filter by Courier
        if (!empty($filters['courier'])) {
            $courier = strtoupper(trim((string) $filters['courier']));
            $query->where('orders.shipping_courier', $courier);
        }

        // Filter by Date Range (Asia/Jakarta)
        if (!empty($filters['start_date'])) {
            $start = Carbon::parse($filters['start_date'], 'Asia/Jakarta')->startOfDay();
            $query->where('orders.created_at', '>=', $start);
        }

        if (!empty($filters['end_date'])) {
            $end = Carbon::parse($filters['end_date'], 'Asia/Jakarta')->endOfDay();
            $query->where('orders.created_at', '<=', $end);
        }

        return $query->orderByDesc('orders.created_at')
            ->paginate(max(1, min(100, $perPage)));
    }

    /**
     * Get complete order detail with relations, snapshots, and audit trail.
     *
     * @param int $orderId
     * @return Order
     */
    public function getOrderDetail(int $orderId): Order
    {
        return Order::with([
            'user:id,name,email,phone',
            'orderItems',
            'payment',
            'shipment',
            'cancelledBy:id,name,email',
            'auditLogs.admin:id,name,email',
        ])->findOrFail($orderId);
    }

    /**
     * Start processing an eligible PAID order.
     * Transition: PAID -> PROCESSING.
     *
     * @param int $orderId
     * @param User $admin
     * @return Order
     *
     * @throws ValidationException
     */
    public function processOrder(int $orderId, User $admin): Order
    {
        return DB::transaction(function () use ($orderId, $admin) {
            /** @var Order $order */
            $order = Order::where('id', $orderId)->lockForUpdate()->firstOrFail();

            if (!$order->canBeProcessed()) {
                throw ValidationException::withMessages([
                    'status' => ["Cannot process order #{$order->id}. Order must be in 'PAID' status (Current: '{$order->status}')."],
                ]);
            }

            $previousStatus = strtoupper($order->status);
            $order->status = 'PROCESSING';
            $order->save();

            // Record Audit Log
            OrderAuditLog::create([
                'order_id' => $order->id,
                'admin_id' => $admin->id,
                'action' => 'ORDER_PROCESSING',
                'previous_status' => $previousStatus,
                'new_status' => 'PROCESSING',
                'note' => 'Admin verified payment and initiated order fulfillment.',
            ]);

            return $this->getOrderDetail($order->id);
        });
    }

    /**
     * Ship a PROCESSING order and attach tracking number.
     * Transition: PROCESSING -> SHIPPED.
     *
     * @param int $orderId
     * @param User $admin
     * @param array{tracking_number: string, courier?: string, service?: string} $payload
     * @return Order
     *
     * @throws ValidationException
     */
    public function shipOrder(int $orderId, User $admin, array $payload): Order
    {
        $trackingNumber = trim((string) ($payload['tracking_number'] ?? ''));

        if (empty($trackingNumber)) {
            throw ValidationException::withMessages([
                'tracking_number' => ['A valid shipping courier tracking number is required to mark order as shipped.'],
            ]);
        }

        return DB::transaction(function () use ($orderId, $admin, $payload, $trackingNumber) {
            /** @var Order $order */
            $order = Order::where('id', $orderId)->lockForUpdate()->firstOrFail();

            if (!$order->canBeShipped()) {
                throw ValidationException::withMessages([
                    'status' => ["Cannot ship order #{$order->id}. Order must be in 'PROCESSING' status (Current: '{$order->status}')."],
                ]);
            }

            $courier = strtoupper(trim((string) ($payload['courier'] ?? $order->shipping_courier)));
            $service = strtoupper(trim((string) ($payload['service'] ?? $order->shipping_service)));

            $previousStatus = strtoupper($order->status);
            $order->status = 'SHIPPED';
            $order->shipping_courier = $courier;
            $order->shipping_service = $service;
            $order->save();

            // Update or create Shipment record
            Shipment::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'courier' => $courier,
                    'service' => $service,
                    'tracking_number' => $trackingNumber,
                    'status' => 'shipped',
                    'shipped_at' => now(),
                ]
            );

            // Record Audit Log
            OrderAuditLog::create([
                'order_id' => $order->id,
                'admin_id' => $admin->id,
                'action' => 'ORDER_SHIPPED',
                'previous_status' => $previousStatus,
                'new_status' => 'SHIPPED',
                'note' => "Shipped via {$courier} ({$service}) with Tracking #{$trackingNumber}.",
                'metadata' => [
                    'courier' => $courier,
                    'service' => $service,
                    'tracking_number' => $trackingNumber,
                ],
            ]);

            return $this->getOrderDetail($order->id);
        });
    }

    /**
     * Mark a SHIPPED order as DELIVERED.
     * Transition: SHIPPED -> DELIVERED.
     *
     * @param int $orderId
     * @param User $admin
     * @return Order
     *
     * @throws ValidationException
     */
    public function deliverOrder(int $orderId, User $admin): Order
    {
        return DB::transaction(function () use ($orderId, $admin) {
            /** @var Order $order */
            $order = Order::where('id', $orderId)->lockForUpdate()->firstOrFail();

            if (!$order->canBeDelivered()) {
                throw ValidationException::withMessages([
                    'status' => ["Cannot mark order #{$order->id} as delivered. Order must be in 'SHIPPED' status (Current: '{$order->status}')."],
                ]);
            }

            $previousStatus = strtoupper($order->status);
            $order->status = 'DELIVERED';
            $order->save();

            // Update shipment delivered timestamp
            $shipment = $order->shipment;
            if ($shipment) {
                $shipment->status = 'delivered';
                $shipment->delivered_at = now();
                $shipment->save();
            }

            // Record Audit Log
            OrderAuditLog::create([
                'order_id' => $order->id,
                'admin_id' => $admin->id,
                'action' => 'ORDER_DELIVERED',
                'previous_status' => $previousStatus,
                'new_status' => 'DELIVERED',
                'note' => 'Package confirmed delivered to customer destination.',
            ]);

            return $this->getOrderDetail($order->id);
        });
    }

    /**
     * Complete a DELIVERED order.
     * Transition: DELIVERED -> COMPLETED.
     *
     * @param int $orderId
     * @param User $admin
     * @return Order
     *
     * @throws ValidationException
     */
    public function completeOrder(int $orderId, User $admin): Order
    {
        return DB::transaction(function () use ($orderId, $admin) {
            /** @var Order $order */
            $order = Order::where('id', $orderId)->lockForUpdate()->firstOrFail();

            if (!$order->canBeCompleted()) {
                throw ValidationException::withMessages([
                    'status' => ["Cannot complete order #{$order->id}. Order must be in 'DELIVERED' status (Current: '{$order->status}')."],
                ]);
            }

            $previousStatus = strtoupper($order->status);
            $order->status = 'COMPLETED';
            $order->save();

            // Record Audit Log
            OrderAuditLog::create([
                'order_id' => $order->id,
                'admin_id' => $admin->id,
                'action' => 'ORDER_COMPLETED',
                'previous_status' => $previousStatus,
                'new_status' => 'COMPLETED',
                'note' => 'Order fulfilled and marked as completed.',
            ]);

            return $this->getOrderDetail($order->id);
        });
    }

    /**
     * Cancel order and idempotently restore reserved inventory stock.
     * Eligible statuses: PENDING_PAYMENT, PAID, PROCESSING.
     *
     * @param int $orderId
     * @param User $admin
     * @param array{reason: string, note?: string} $payload
     * @return Order
     *
     * @throws ValidationException
     */
    public function cancelOrder(int $orderId, User $admin, array $payload): Order
    {
        $reason = trim((string) ($payload['reason'] ?? ''));
        $note = trim((string) ($payload['note'] ?? ''));

        if (empty($reason) || !in_array($reason, self::VALID_CANCELLATION_REASONS, true)) {
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

            if (!$order->canBeCancelled()) {
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
            OrderAuditLog::create([
                'order_id' => $order->id,
                'admin_id' => $admin->id,
                'action' => 'ORDER_CANCELLED',
                'previous_status' => $previousStatus,
                'new_status' => 'CANCELLED',
                'reason' => $reason,
                'note' => $note ?: "Order cancelled. Reason: {$reason}.",
                'metadata' => [
                    'restored_stock' => true,
                    'stock_restored_at' => $order->stock_restored_at?->toIso8601String(),
                ],
            ]);

            return $this->getOrderDetail($order->id);
        });
    }
}
