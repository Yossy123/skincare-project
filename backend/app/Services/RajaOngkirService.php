<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RajaOngkirService
{
    protected string $apiKey;
    protected string $baseUrl;
    protected int $originId;
    protected int $timeout;

    public function __construct()
    {
        $this->apiKey = (string) config('services.rajaongkir.api_key', '');
        $this->baseUrl = rtrim((string) config('services.rajaongkir.base_url', 'https://rajaongkir.komerce.id/api/v1/'), '/') . '/';
        $this->originId = (int) config('services.rajaongkir.origin_id', 17547);
        $this->timeout = (int) config('services.rajaongkir.timeout', 10);
    }

    /**
     * Get default store origin destination ID.
     *
     * @return int
     */
    public function getOriginId(): int
    {
        return $this->originId;
    }

    /**
     * Search domestic destinations (cached for 24 hours per query).
     *
     * @param string $search
     * @return array<int, array{id: int, label: string, province_name: string, city_name: string, district_name: string, subdistrict_name: string, zip_code: string}>
     */
    public function searchDestinations(string $search): array
    {
        $search = trim($search);
        if (empty($search)) {
            return [];
        }

        $cacheKey = 'rajaongkir_destinations_' . md5(strtolower($search));

        return Cache::remember($cacheKey, 86400, function () use ($search) {
            try {
                $response = Http::withHeaders(['key' => $this->apiKey])
                    ->timeout($this->timeout)
                    ->get($this->baseUrl . 'destination/domestic-destination', [
                        'search' => $search,
                    ]);

                if ($response->successful()) {
                    $json = $response->json();
                    return $json['data'] ?? [];
                }

                Log::warning("RajaOngkir destination search returned HTTP {$response->status()}: " . $response->body());
            } catch (Exception $e) {
                Log::warning('RajaOngkir searchDestinations failed: ' . $e->getMessage());
            }

            return [];
        });
    }

    /**
     * Calculate domestic shipping cost using RajaOngkir Komerce API.
     *
     * @param int $originId
     * @param int $destinationId
     * @param int $weightInGrams
     * @param string|array<int, string> $couriers
     * @return array<int, array{courier: string, courier_name: string, service: string, description: string, price: float, formatted_price: string, etd: string, formatted_etd: string}>
     */
    public function calculateDomesticCost(int $originId, int $destinationId, int $weightInGrams, mixed $couriers = 'jne:sicepat:jnt:tiki:pos'): array
    {
        $weightInGrams = max(1, $weightInGrams);
        $courierString = $this->formatCouriersParam($couriers);

        try {
            $response = Http::asForm()
                ->withHeaders([
                    'key' => $this->apiKey,
                ])
                ->timeout($this->timeout)
                ->post($this->baseUrl . 'calculate/domestic-cost', [
                    'origin' => $originId,
                    'destination' => $destinationId,
                    'weight' => $weightInGrams,
                    'courier' => $courierString,
                    'price' => 'lowest',
                ]);

            if ($response->successful()) {
                $json = $response->json();
                $rates = $json['data'] ?? [];

                if (!empty($rates)) {
                    $requestedCouriers = array_filter(
                        array_map('strtoupper', explode(':', $courierString))
                    );

                    return array_values(array_filter(
                        $this->normalizeDomesticRates($rates),
                        fn (array $rate): bool => in_array($rate['courier'], $requestedCouriers, true)
                    ));
                }
            } else {
                Log::warning("RajaOngkir calculateDomesticCost returned HTTP {$response->status()}: " . $response->body());
            }
        } catch (Exception $e) {
            Log::warning("RajaOngkir calculateDomesticCost request failed: " . $e->getMessage());
        }

        // Return fallback simulation when offline or external API is unavailable
        return $this->getFallbackRates($originId, $destinationId, $weightInGrams, $couriers);
    }

    /**
     * Format couriers array or string into colon-separated string.
     *
     * @param mixed $couriers
     * @return string
     */
    protected function formatCouriersParam(mixed $couriers): string
    {
        if (is_array($couriers)) {
            $cleaned = array_map(function ($c) {
                return strtolower(trim($c));
            }, $couriers);
            return implode(':', array_filter($cleaned));
        }

        if (is_string($couriers)) {
            $couriers = str_replace([',', ' '], ':', $couriers);
            return strtolower(trim($couriers, ':'));
        }

        return 'jne:sicepat:jnt:tiki:pos';
    }

    /**
     * Normalize provider raw response into standard internal format.
     *
     * @param array<int, array<string, mixed>> $rates
     * @return array<int, array{courier: string, courier_name: string, service: string, description: string, price: float, formatted_price: string, etd: string, formatted_etd: string}>
     */
    protected function normalizeDomesticRates(array $rates): array
    {
        $normalized = [];

        foreach ($rates as $rate) {
            $courierCode = strtoupper($rate['code'] ?? 'COURIER');
            $courierName = $rate['name'] ?? $courierCode;
            $service = strtoupper($rate['service'] ?? 'REG');
            $description = $rate['description'] ?? $service;
            $cost = (float) ($rate['cost'] ?? 0);
            $etdRaw = trim((string) ($rate['etd'] ?? '2-3'));

            // Clean up ETD string (e.g. "2-3 day" -> "2-3")
            $etdClean = str_ireplace(['days', 'day', 'hari'], '', $etdRaw);
            $etdClean = trim($etdClean);
            if (empty($etdClean)) {
                $etdClean = '2-3';
            }

            $normalized[] = [
                'courier' => $courierCode,
                'courier_name' => $courierName,
                'service' => $service,
                'description' => $description,
                'price' => $cost,
                'formatted_price' => 'Rp ' . number_format($cost, 0, ',', '.'),
                'etd' => $etdClean,
                'formatted_etd' => "{$etdClean} Hari",
            ];
        }

        // Sort by price ascending
        usort($normalized, function ($a, $b) {
            return $a['price'] <=> $b['price'];
        });

        return $normalized;
    }

    /**
     * Fallback rates estimator for local testing or when external API is unreachable.
     *
     * @param int $originId
     * @param int $destinationId
     * @param int $weightInGrams
     * @param mixed $couriers
     * @return array<int, array{courier: string, courier_name: string, service: string, description: string, price: float, formatted_price: string, etd: string, formatted_etd: string}>
     */
    public function getFallbackRates(int $originId, int $destinationId, int $weightInGrams, mixed $couriers = null): array
    {
        $requestedCouriers = array_filter(
            array_map('strtoupper', explode(':', $this->formatCouriersParam($couriers ?? 'jne:sicepat:jnt:tiki:pos')))
        );
        $weightKg = max(1, ceil($weightInGrams / 1000));
        $isSameLocation = ($originId === $destinationId);
        $multiplier = $isSameLocation ? 0.9 : 1.1;

        $availableServices = [
            [
                'courier' => 'JNE',
                'courier_name' => 'Jalur Nugraha Ekakurir (JNE)',
                'service' => 'REG',
                'description' => 'Layanan Reguler',
                'base' => 10000,
                'etd' => '1-2',
            ],
            [
                'courier' => 'JNE',
                'courier_name' => 'Jalur Nugraha Ekakurir (JNE)',
                'service' => 'YES',
                'description' => 'Yakin Esok Sampai',
                'base' => 20000,
                'etd' => '1',
            ],
            [
                'courier' => 'SICEPAT',
                'courier_name' => 'SiCepat Express',
                'service' => 'REG',
                'description' => 'Reguler Service',
                'base' => 9000,
                'etd' => '1-2',
            ],
            [
                'courier' => 'POS',
                'courier_name' => 'POS Indonesia (POS)',
                'service' => 'Pos Reguler',
                'description' => 'Layanan Standar Pos',
                'base' => 9000,
                'etd' => '2-3',
            ],
            [
                'courier' => 'TIKI',
                'courier_name' => 'Citra Van Titipan Kilat (TIKI)',
                'service' => 'REG',
                'description' => 'Reguler Service',
                'base' => 9000,
                'etd' => '2',
            ],
        ];

        $rates = [];
        foreach ($availableServices as $srv) {
            if (!in_array($srv['courier'], $requestedCouriers, true)) {
                continue;
            }

            $price = (float) round($srv['base'] * $multiplier * $weightKg);

            $rates[] = [
                'courier' => $srv['courier'],
                'courier_name' => $srv['courier_name'],
                'service' => $srv['service'],
                'description' => $srv['description'],
                'price' => $price,
                'formatted_price' => 'Rp ' . number_format($price, 0, ',', '.'),
                'etd' => $srv['etd'],
                'formatted_etd' => "{$srv['etd']} Hari",
            ];
        }

        usort($rates, function ($a, $b) {
            return $a['price'] <=> $b['price'];
        });

        return $rates;
    }

    /**
     * Fallback standard Indonesian destinations for search query.
     *
     * @param string $search
     * @return array<int, array{id: int, label: string, province_name: string, city_name: string, district_name: string, subdistrict_name: string, zip_code: string}>
     */
    protected function getFallbackDestinations(string $search): array
    {
        $all = [
            [
                'id' => 17547,
                'label' => 'GROGOL SELATAN, KEBAYORAN LAMA, JAKARTA SELATAN, DKI JAKARTA, 12220',
                'province_name' => 'DKI JAKARTA',
                'city_name' => 'JAKARTA SELATAN',
                'district_name' => 'KEBAYORAN LAMA',
                'subdistrict_name' => 'GROGOL SELATAN',
                'zip_code' => '12220',
            ],
            [
                'id' => 17549,
                'label' => 'KEBAYORAN LAMA SELATAN, KEBAYORAN LAMA, JAKARTA SELATAN, DKI JAKARTA, 12240',
                'province_name' => 'DKI JAKARTA',
                'city_name' => 'JAKARTA SELATAN',
                'district_name' => 'KEBAYORAN LAMA',
                'subdistrict_name' => 'KEBAYORAN LAMA SELATAN',
                'zip_code' => '12240',
            ],
            [
                'id' => 17551,
                'label' => 'SENAYAN, KEBAYORAN BARU, JAKARTA SELATAN, DKI JAKARTA, 12190',
                'province_name' => 'DKI JAKARTA',
                'city_name' => 'JAKARTA SELATAN',
                'district_name' => 'KEBAYORAN BARU',
                'subdistrict_name' => 'SENAYAN',
                'zip_code' => '12190',
            ],
            [
                'id' => 17500,
                'label' => 'GAMBIR, GAMBIR, JAKARTA PUSAT, DKI JAKARTA, 10110',
                'province_name' => 'DKI JAKARTA',
                'city_name' => 'JAKARTA PUSAT',
                'district_name' => 'GAMBIR',
                'subdistrict_name' => 'GAMBIR',
                'zip_code' => '10110',
            ],
            [
                'id' => 2200,
                'label' => 'COBLONG, BANDUNG, JAWA BARAT, 40132',
                'province_name' => 'JAWA BARAT',
                'city_name' => 'BANDUNG',
                'district_name' => 'COBLONG',
                'subdistrict_name' => 'DAGO',
                'zip_code' => '40132',
            ],
        ];

        $searchLower = strtolower($search);
        $filtered = array_filter($all, function ($item) use ($searchLower) {
            return str_contains(strtolower($item['label']), $searchLower);
        });

        return [];
    }
}
