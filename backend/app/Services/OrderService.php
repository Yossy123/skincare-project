<?php

namespace App\Services;

use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(
        protected ShippingService $shippingService,
        protected RajaOngkirService $rajaOngkirService
    ) {}

    /**
     * Create a new order with atomic transaction, pessimistic row locking, and immutable snapshots.
     *
     * @param User $user
     * @param array{items: array<int, array{product_id: int, quantity: int}>, address_id: int, courier: string, service: string} $payload
     * @return Order
     *
     * @throws ValidationException
     */
    public function createOrder(User $user, array $payload): Order
    {
        return DB::transaction(function () use ($user, $payload) {
            // 1. Verify Shipping Address Ownership
            $address = Address::where('id', $payload['address_id'])
                ->where('user_id', $user->id)
                ->first();

            if (!$address) {
                throw ValidationException::withMessages([
                    'address_id' => ['Selected delivery address is invalid or does not belong to your account.'],
                ]);
            }

            // 2. Aggregate quantities by product ID
            $quantitiesByProductId = [];
            foreach ($payload['items'] as $item) {
                $productId = (int) $item['product_id'];
                $qty = max(1, (int) $item['quantity']);
                $quantitiesByProductId[$productId] = ($quantitiesByProductId[$productId] ?? 0) + $qty;
            }

            if (empty($quantitiesByProductId)) {
                throw ValidationException::withMessages([
                    'items' => ['Your order must contain at least one item.'],
                ]);
            }

            // 3. Query products with Pessimistic Locking (FOR UPDATE) to prevent race conditions
            $productIds = array_keys($quantitiesByProductId);
            $products = Product::whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $orderItemsData = [];
            $subtotal = 0.0;
            $totalWeight = 0;

            foreach ($quantitiesByProductId as $productId => $quantity) {
                $product = $products->get($productId);

                if (!$product) {
                    throw ValidationException::withMessages([
                        'items' => ["Product with ID {$productId} was not found."],
                    ]);
                }

                if (!$product->is_active) {
                    throw ValidationException::withMessages([
                        'items' => ["Product '{$product->name}' is no longer active."],
                    ]);
                }

                if ($product->stock < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => [
                            "Insufficient stock for '{$product->name}'. Requested: {$quantity}, Available in stock: {$product->stock}.",
                        ],
                    ]);
                }

                $unitPrice = (float) $product->price;
                $itemWeight = (int) $product->weight;
                $lineSubtotal = $unitPrice * $quantity;
                $lineWeight = $itemWeight * $quantity;

                $subtotal += $lineSubtotal;
                $totalWeight += $lineWeight;

                $orderItemsData[] = [
                    'product_model' => $product,
                    'product_id' => $product->id,
                    'product_name' => $product->name, // Frozen Snapshot
                    'unit_price' => $unitPrice,       // Frozen Snapshot
                    'quantity' => $quantity,
                    'subtotal' => $lineSubtotal,       // Frozen Snapshot
                ];
            }

            // 4. Re-calculate authoritative shipping rate from server
            $courier = strtolower(trim($payload['courier']));
            $requestedService = strtoupper(trim($payload['service']));

            $shippingRates = $this->shippingService->getShippingRates(
                $address,
                $totalWeight,
                $courier,
                $user
            );

            // Find requested courier service rate
            $matchedRate = null;
            foreach ($shippingRates as $rate) {
                if (
                    strtoupper($rate['courier']) === strtoupper($courier)
                    && strtoupper($rate['service']) === $requestedService
                ) {
                    $matchedRate = $rate;
                    break;
                }
            }

            if (!$matchedRate) {
                throw ValidationException::withMessages([
                    'shipping' => ['The selected courier and service is unavailable. Please recalculate shipping rates and try again.'],
                ]);
            }

            $shippingCost = (float) $matchedRate['price'];
            $shippingEtd = $matchedRate['formatted_etd'];

            // 5. Total calculation
            $total = $subtotal + $shippingCost;

            // 6. Create Order with PENDING_PAYMENT status
            $order = Order::create([
                'user_id' => $user->id,
                'status' => 'PENDING_PAYMENT',
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'shipping_courier' => strtoupper($courier),
                'shipping_service' => $matchedRate['service'] ?? $requestedService,
                'shipping_etd' => $shippingEtd,
                'shipping_address' => [
                    'name' => $address->name,
                    'phone' => $address->phone,
                    'province' => $address->province,
                    'city' => $address->city,
                    'district' => $address->district,
                    'postal_code' => $address->postal_code,
                    'address' => $address->address,
                ],
            ]);

            // 7. Create Immutable Order Items & Reserve/Reduce Stock
            foreach ($orderItemsData as $itemData) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $itemData['product_id'],
                    'product_name' => $itemData['product_name'],
                    'unit_price' => $itemData['unit_price'],
                    'quantity' => $itemData['quantity'],
                    'subtotal' => $itemData['subtotal'],
                ]);

                // Reduce inventory stock safely
                $itemData['product_model']->decrement('stock', $itemData['quantity']);
            }

            // 8. Create Initial Shipment record
            Shipment::create([
                'order_id' => $order->id,
                'courier' => strtoupper($courier),
                'service' => $matchedRate['service'] ?? $requestedService,
                'tracking_number' => null,
                'status' => 'pending',
            ]);

            return $order->load(['orderItems', 'shipment']);
        });
    }

    /**
     * Retrieve paginated orders for a user.
     *
     * @param User $user
     * @param int $perPage
     * @return LengthAwarePaginator<Order>
     */
    public function getUserOrders(User $user, int $perPage = 10): LengthAwarePaginator
    {
        return $user->orders()
            ->with(['orderItems', 'shipment', 'payment'])
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    /**
     * Retrieve a single order for a user.
     *
     * @param User $user
     * @param int $orderId
     * @return Order|null
     */
    public function getUserOrderById(User $user, int $orderId): ?Order
    {
        return $user->orders()
            ->with(['orderItems', 'shipment', 'payment'])
            ->find($orderId);
    }
}
