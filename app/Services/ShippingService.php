<?php

namespace App\Services;

use App\Models\Address;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class ShippingService
{
    public function __construct(
        protected RajaOngkirService $rajaOngkirService
    ) {}

    /**
     * Calculate and aggregate normalized shipping rates from supported couriers.
     *
     * @param mixed $destination (Destination ID, Address ID, Address model, or string location)
     * @param int $weightInGrams (Package weight in grams)
     * @param mixed $couriers (Couriers to query, e.g. 'jne:sicepat:jnt:tiki:pos')
     * @param User|null $user (Optional authenticated user for address ownership validation)
     * @return array<int, array{courier: string, courier_name: string, service: string, description: string, price: float, formatted_price: string, etd: string, formatted_etd: string}>
     *
     * @throws ValidationException
     */
    public function getShippingRates(mixed $destination, int $weightInGrams, mixed $couriers = null, ?User $user = null): array
    {
        if ($weightInGrams <= 0) {
            throw ValidationException::withMessages([
                'weight' => ['Package weight must be at least 1 gram.'],
            ]);
        }

        if ($weightInGrams > 30000) {
            throw ValidationException::withMessages([
                'weight' => ['Package weight exceeds maximum courier limit of 30 kg (30,000g).'],
            ]);
        }

        $destinationId = $this->resolveDestinationId($destination, $user);
        $originId = $this->rajaOngkirService->getOriginId();

        $rates = $this->rajaOngkirService->calculateDomesticCost(
            $originId,
            $destinationId,
            $weightInGrams,
            $couriers ?? 'jne:sicepat:jnt:tiki:pos'
        );

        return $rates;
    }

    /**
     * Resolve destination parameter to a valid RajaOngkir domestic destination ID.
     *
     * @param mixed $destination
     * @param User|null $user
     * @return int
     *
     * @throws ValidationException
     */
    public function resolveDestinationId(mixed $destination, ?User $user = null): int
    {
        if (empty($destination)) {
            throw ValidationException::withMessages([
                'destination' => ['Destination location or address is required for shipping calculation.'],
            ]);
        }

        // 1. If an Address instance was passed
        if ($destination instanceof Address) {
            if ($destination->rajaongkir_destination_id) {
                return (int) $destination->rajaongkir_destination_id;
            }
            return $this->resolveFromAddressString(
                "{$destination->district}, {$destination->city}, {$destination->province}, {$destination->postal_code}"
            );
        }

        // 2. If an integer destination ID or address ID
        if (is_numeric($destination)) {
            $num = (int) $destination;

            // If it matches an address in database
            $query = Address::where('id', $num);
            if ($user) {
                $query->where('user_id', $user->id);
            }
            $address = $query->first();

            if ($address) {
                if ($address->rajaongkir_destination_id) {
                    return (int) $address->rajaongkir_destination_id;
                }
                return $this->resolveFromAddressString(
                    "{$address->district}, {$address->city}, {$address->province}, {$address->postal_code}"
                );
            }

            // Direct destination ID
            if ($num > 0) {
                return $num;
            }
        }

        // 3. If a string location query
        if (is_string($destination)) {
            return $this->resolveFromAddressString($destination);
        }

        throw ValidationException::withMessages([
            'destination' => ['Unable to resolve the shipping destination. Please verify the address and try again.'],
        ]);
    }

    /**
     * Search RajaOngkir destination API for matching location string.
     *
     * @param string $location
     * @return int
     */
    protected function resolveFromAddressString(string $location): int
    {
        $destinations = $this->rajaOngkirService->searchDestinations($location);

        if (!empty($destinations) && isset($destinations[0]['id'])) {
            return (int) $destinations[0]['id'];
        }

        throw ValidationException::withMessages([
            'destination' => ['Unable to resolve the shipping destination. Please verify the address and try again.'],
        ]);
    }
}
