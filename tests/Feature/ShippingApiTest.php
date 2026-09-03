<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use App\Services\RajaOngkirService;
use Tests\TestCase;

class ShippingApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test successful calculation and retrieval of normalized shipping rates with mocked RajaOngkir Komerce API.
     */
    public function test_can_calculate_and_retrieve_normalized_shipping_rates(): void
    {
        Http::fake([
            'rajaongkir.komerce.id/api/v1/calculate/domestic-cost*' => Http::response([
                'meta' => [
                    'message' => 'Success Calculate Domestic Shipping cost',
                    'code' => 200,
                    'status' => 'success',
                ],
                'data' => [
                    [
                        'name' => 'Jalur Nugraha Ekakurir (JNE)',
                        'code' => 'jne',
                        'service' => 'REG',
                        'description' => 'Layanan Reguler',
                        'cost' => 10000,
                        'etd' => '1-2 day',
                    ],
                    [
                        'name' => 'SiCepat Express',
                        'code' => 'sicepat',
                        'service' => 'HALU',
                        'description' => 'Harga Mulai Lima Ribu',
                        'cost' => 7500,
                        'etd' => '2-3 day',
                    ],
                ],
            ], 200),
        ]);

        $payload = [
            'destination' => '17547', // Destination ID
            'weight' => 350, // 350 grams
            'couriers' => 'jne:sicepat',
        ];

        $response = $this->postJson('/api/shipping/rates', $payload);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'courier',
                        'courier_name',
                        'service',
                        'description',
                        'price',
                        'formatted_price',
                        'etd',
                        'formatted_etd',
                    ],
                ],
            ])
            ->assertJsonPath('data.0.courier', 'SICEPAT') // sorted by price ascending (7500 < 10000)
            ->assertJsonPath('data.0.price', 7500)
            ->assertJsonPath('data.0.formatted_price', 'Rp 7.500')
            ->assertJsonPath('data.1.courier', 'JNE')
            ->assertJsonPath('data.1.price', 10000)
            ->assertJsonPath('data.1.formatted_price', 'Rp 10.000');
    }

    /**
     * Test shipping rate calculation gracefully handles provider failure and returns fallback estimates.
     */
    public function test_shipping_rates_handles_provider_failure_gracefully(): void
    {
        Http::fake([
            'rajaongkir.komerce.id/api/v1/calculate/domestic-cost*' => Http::response(['message' => 'Service Unavailable'], 503),
        ]);

        $payload = [
            'destination' => '17547',
            'weight' => 1000,
            'couriers' => 'jne:sicepat',
        ];

        $response = $this->postJson('/api/shipping/rates', $payload);

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertNotEmpty($data);
        $this->assertIsString($data[0]['courier']);
        $this->assertGreaterThan(0, $data[0]['price']);
    }

    /**
     * Fallback rates must never include couriers outside the requested scope.
     */
    public function test_fallback_rates_respect_requested_couriers(): void
    {
        $rates = app(RajaOngkirService::class)->getFallbackRates(17547, 2200, 1000, 'jne:sicepat');

        $this->assertNotEmpty($rates);
        $this->assertEqualsCanonicalizing(['JNE', 'SICEPAT'], array_values(array_unique(array_column($rates, 'courier'))));
        $this->assertNotContains('POS', array_column($rates, 'courier'));
        $this->assertNotContains('TIKI', array_column($rates, 'courier'));
    }

    /**
     * Destination resolution failure must be reported, never replaced by a default city.
     */
    public function test_destination_resolution_failure_is_rejected_without_fallback(): void
    {
        Http::fake([
            'rajaongkir.komerce.id/api/v1/destination/domestic-destination*' => Http::response([], 503),
        ]);

        $response = $this->postJson('/api/shipping/rates', [
            'destination' => 'an-invalid-destination-' . uniqid(),
            'weight' => 500,
            'couriers' => 'jne',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['destination']);
    }

    /**
     * Test shipping rates validation rejects zero or negative weight.
     */
    public function test_shipping_rates_validation_fails_on_zero_or_negative_weight(): void
    {
        $response = $this->postJson('/api/shipping/rates', [
            'destination' => '17547',
            'weight' => 0,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['weight']);
    }

    /**
     * Test shipping rates validation rejects weight exceeding 30 kg.
     */
    public function test_shipping_rates_validation_fails_on_excessive_weight(): void
    {
        $response = $this->postJson('/api/shipping/rates', [
            'destination' => '17547',
            'weight' => 50000,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['weight']);
    }

    /**
     * Test shipping rates validation rejects missing destination.
     */
    public function test_shipping_rates_validation_fails_on_missing_destination(): void
    {
        $response = $this->postJson('/api/shipping/rates', [
            'weight' => 500,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['destination']);
    }

    /**
     * Test API key is never exposed in response body.
     */
    public function test_api_key_is_not_exposed_in_response(): void
    {
        Http::fake([
            'rajaongkir.komerce.id/api/v1/calculate/domestic-cost*' => Http::response(['data' => []], 200),
        ]);

        $apiKey = config('services.rajaongkir.api_key');

        $response = $this->postJson('/api/shipping/rates', [
            'destination' => '17547',
            'weight' => 300,
        ]);

        $response->assertStatus(200);
        $content = $response->getContent();
        $this->assertStringNotContainsString($apiKey, $content);
    }

    /**
     * Test can search domestic destination locations.
     */
    public function test_can_search_domestic_destinations(): void
    {
        Http::fake([
            'rajaongkir.komerce.id/api/v1/destination/domestic-destination*' => Http::response([
                'meta' => [
                    'message' => 'Success Get Domestic Destinations',
                    'code' => 200,
                    'status' => 'success',
                ],
                'data' => [
                    [
                        'id' => 17547,
                        'label' => 'GROGOL SELATAN, KEBAYORAN LAMA, JAKARTA SELATAN, DKI JAKARTA, 12220',
                        'province_name' => 'DKI JAKARTA',
                        'city_name' => 'JAKARTA SELATAN',
                        'district_name' => 'KEBAYORAN LAMA',
                        'subdistrict_name' => 'GROGOL SELATAN',
                        'zip_code' => '12220',
                    ],
                ],
            ], 200),
        ]);

        $response = $this->getJson('/api/shipping/destinations?search=Jakarta%20Selatan');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'label',
                        'city_name',
                    ],
                ],
            ])
            ->assertJsonPath('data.0.id', 17547);
    }
}
