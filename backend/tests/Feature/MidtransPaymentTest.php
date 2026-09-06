<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MidtransPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Config::set('services.midtrans.server_key', 'test-server-key');
        Config::set('services.midtrans.snap_base_url', 'https://app.sandbox.midtrans.com');
    }

    public function test_owner_can_create_snap_payment_using_server_total(): void
    {
        Http::fake(['app.sandbox.midtrans.com/*' => Http::response([
            'token' => 'snap-token-123',
            'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-123',
        ], 201)]);

        $user = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $user->id, 'status' => 'PENDING_PAYMENT', 'total' => 125000]);
        $response = $this->actingAs($user)->postJson('/api/payments', ['order_id' => $order->id]);

        $response->assertCreated()->assertJsonPath('data.token', 'snap-token-123')->assertJsonPath('data.amount', 125000);
        $this->assertDatabaseHas('payments', ['order_id' => $order->id, 'amount' => 125000, 'snap_token' => 'snap-token-123']);
        Http::assertSent(fn ($request) => $request->url() === 'https://app.sandbox.midtrans.com/snap/v1/transactions'
            && $request['transaction_details']['gross_amount'] === 125000);
    }

    public function test_valid_notification_marks_payment_paid_and_is_idempotent(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $user->id, 'status' => 'PENDING_PAYMENT', 'total' => 125000]);
        Payment::factory()->create(['order_id' => $order->id, 'status' => 'pending', 'amount' => 125000]);
        $notification = $this->notification($order, 'settlement');

        $this->postJson('/api/webhooks/midtrans', $notification)->assertOk();
        $this->postJson('/api/webhooks/midtrans', $notification)->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'PAID']);
        $this->assertDatabaseHas('payments', ['order_id' => $order->id, 'status' => 'paid', 'transaction_id' => 'trx-123']);
    }

    public function test_invalid_signature_or_amount_is_rejected(): void
    {
        $order = Order::factory()->create(['status' => 'PENDING_PAYMENT', 'total' => 125000]);
        Payment::factory()->create(['order_id' => $order->id, 'status' => 'pending', 'amount' => 125000]);

        $invalid = $this->notification($order, 'settlement');
        $invalid['signature_key'] = 'invalid';
        $this->postJson('/api/webhooks/midtrans', $invalid)->assertUnauthorized();
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'PENDING_PAYMENT']);

        $wrongAmount = $this->notification($order, 'settlement', '1.00');
        $this->postJson('/api/webhooks/midtrans', $wrongAmount)->assertUnauthorized();
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'PENDING_PAYMENT']);
    }

    /** @return array<string, string> */
    private function notification(Order $order, string $status, string $gross = '125000.00'): array
    {
        $orderId = 'ORDER-'.$order->id;
        $statusCode = '200';
        return [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $gross,
            'transaction_status' => $status,
            'transaction_id' => 'trx-123',
            'payment_type' => 'qris',
            'fraud_status' => 'accept',
            'signature_key' => hash('sha512', $orderId.$statusCode.$gross.'test-server-key'),
        ];
    }
}
