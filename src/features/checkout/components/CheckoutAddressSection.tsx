'use client';

import React from 'react';
import { AddressSelector } from '@/components/AddressSelector';
import { Address } from '@/lib/api';
import { MapPin } from 'lucide-react';

interface CheckoutAddressSectionProps {
  addresses: Address[];
  selectedAddressId: number | null;
  onSelectAddress: (address: Address) => void;
  onOpenNewAddressModal: () => void;
}

export function CheckoutAddressSection({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onOpenNewAddressModal,
}: CheckoutAddressSectionProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-rose-50 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center">
            1
          </span>
          <h2 className="font-serif text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Delivery Address
          </h2>
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className="p-6 text-center border-2 border-dashed border-rose-200 dark:border-zinc-700 rounded-2xl space-y-3">
          <MapPin className="w-8 h-8 mx-auto text-rose-400" />
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            You haven&apos;t added any delivery addresses to your account yet.
          </p>
          <button
            type="button"
            onClick={onOpenNewAddressModal}
            className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            Add Shipping Address
          </button>
        </div>
      ) : (
        <AddressSelector
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          onSelectAddress={onSelectAddress}
          onAddNewAddress={onOpenNewAddressModal}
        />
      )}
    </div>
  );
}
