<?php

namespace App\Services;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AddressService
{
    public function __construct(
        protected RajaOngkirService $rajaOngkirService
    ) {}

    /**
     * Retrieve all addresses belonging to the user (default address first).
     *
     * @param User $user
     * @return Collection<int, Address>
     */
    public function getAddressesForUser(User $user): Collection
    {
        return $user->addresses()
            ->orderByDesc('is_default')
            ->orderByDesc('id')
            ->get();
    }

    /**
     * Create a new address for the user with automatic RajaOngkir destination resolution.
     *
     * @param User $user
     * @param array<string, mixed> $data
     * @return Address
     */
    public function createAddress(User $user, array $data): Address
    {
        return DB::transaction(function () use ($user, $data) {
            $existingCount = $user->addresses()->count();
            $shouldBeDefault = !empty($data['is_default']) || $existingCount === 0;

            if ($shouldBeDefault) {
                $user->addresses()->where('is_default', true)->update(['is_default' => false]);
            }

            $data['user_id'] = $user->id;
            $data['is_default'] = $shouldBeDefault;

            // Always resolve from the submitted address fields on the server.
            // Never trust a destination ID supplied by the client.
            $data['rajaongkir_destination_id'] = $this->resolveDestinationId($data);

            return Address::create($data);
        });
    }

    /**
     * Update an address with automatic RajaOngkir destination resolution.
     *
     * @param Address $address
     * @param array<string, mixed> $data
     * @return Address
     */
    public function updateAddress(Address $address, array $data): Address
    {
        return DB::transaction(function () use ($address, $data) {
            if (!empty($data['is_default']) && !$address->is_default) {
                Address::where('user_id', $address->user_id)
                    ->where('id', '!=', $address->id)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }

            $locationFields = ['district', 'city', 'province', 'postal_code'];
            $locationChanged = count(array_intersect(array_keys($data), $locationFields)) > 0;

            // Re-resolve when the location changes or the stored destination is missing.
            // Ignore any client-provided destination ID.
            unset($data['rajaongkir_destination_id']);
            if ($locationChanged || empty($address->rajaongkir_destination_id)) {
                $mergedData = array_merge($address->toArray(), $data);
                $data['rajaongkir_destination_id'] = $this->resolveDestinationId($mergedData);
            }

            $address->update($data);

            // Ensure user always has a default address if they have at least one address
            $hasDefault = Address::where('user_id', $address->user_id)
                ->where('is_default', true)
                ->exists();

            if (!$hasDefault) {
                $firstAddress = Address::where('user_id', $address->user_id)
                    ->orderByDesc('id')
                    ->first();
                if ($firstAddress) {
                    $firstAddress->update(['is_default' => true]);
                    if ($firstAddress->id === $address->id) {
                        $address->is_default = true;
                    }
                }
            }

            return $address->fresh();
        });
    }

    /**
     * Delete an address.
     *
     * @param Address $address
     * @return void
     */
    public function deleteAddress(Address $address): void
    {
        DB::transaction(function () use ($address) {
            $wasDefault = $address->is_default;
            $userId = $address->user_id;

            $address->delete();

            if ($wasDefault) {
                $latestRemaining = Address::where('user_id', $userId)
                    ->orderByDesc('id')
                    ->first();

                if ($latestRemaining) {
                    $latestRemaining->update(['is_default' => true]);
                }
            }
        });
    }

    /**
     * Resolve RajaOngkir destination ID server-side from address fields.
     *
     * @param array<string, mixed> $data
     * @return int
     */
    protected function resolveDestinationId(array $data): int
    {
        $district = $data['district'] ?? '';
        $city = $data['city'] ?? '';
        $province = $data['province'] ?? '';
        $postalCode = $data['postal_code'] ?? '';

        $query = trim("{$district} {$city} {$province} {$postalCode}");
        if (empty($query)) {
            $query = trim("{$city} {$province}");
        }

        if (!empty($query)) {
            $destinations = $this->rajaOngkirService->searchDestinations($query);
            if (!empty($destinations) && isset($destinations[0]['id'])) {
                return (int) $destinations[0]['id'];
            }
        }

        throw ValidationException::withMessages([
            'address' => ['Unable to resolve this address to a valid shipping destination. Please verify the location and try again.'],
        ]);
    }
}
