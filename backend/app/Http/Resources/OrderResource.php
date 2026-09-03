<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Order
 */
class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'status' => $this->status,
            'subtotal' => (float) $this->subtotal,
            'formatted_subtotal' => 'Rp ' . number_format((float) $this->subtotal, 0, ',', '.'),
            'shipping_cost' => (float) $this->shipping_cost,
            'formatted_shipping_cost' => 'Rp ' . number_format((float) $this->shipping_cost, 0, ',', '.'),
            'total' => (float) $this->total,
            'formatted_total' => 'Rp ' . number_format((float) $this->total, 0, ',', '.'),
            'shipping_courier' => $this->shipping_courier,
            'shipping_service' => $this->shipping_service,
            'shipping_etd' => $this->shipping_etd,
            'shipping_address' => $this->shipping_address,
            'items' => OrderItemResource::collection($this->whenLoaded('orderItems')),
            'shipment' => $this->whenLoaded('shipment', function () {
                return $this->shipment ? [
                    'id' => $this->shipment->id,
                    'courier' => $this->shipment->courier,
                    'service' => $this->shipment->service,
                    'tracking_number' => $this->shipment->tracking_number,
                    'status' => $this->shipment->status,
                ] : null;
            }),
            'payment' => $this->whenLoaded('payment', function () {
                return $this->payment ? [
                    'id' => $this->payment->id,
                    'payment_type' => $this->payment->payment_type,
                    'status' => $this->payment->status,
                    'amount' => (float) $this->payment->amount,
                ] : null;
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
