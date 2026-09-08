'use client';

import React from 'react';
import { Address } from '@/lib/api';
import { CheckCircle2, Plus } from 'lucide-react';

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId: number | null;
  onSelectAddress: (address: Address) => void;
  onAddNewAddress: () => void;
}

export function AddressSelector({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
}: AddressSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {addresses.map((address) => {
          const isSelected = selectedAddressId === address.id;
          const displayName = address.recipient_name || address.name;
          const displayAddressLine = address.address_line || address.address;

          return (
            <div
              key={address.id}
              onClick={() => onSelectAddress(address)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                isSelected
                  ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-400 dark:border-rose-700 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-rose-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {displayName}
                    </span>
                    {address.label && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-stone-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {address.label}
                      </span>
                    )}
                  </div>

                  {address.is_default && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 shrink-0">
                      Default
                    </span>
                  )}
                </div>

                <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                  {address.phone}
                </div>

                <div className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">
                  {displayAddressLine}, {address.district}, {address.city}, {address.province} {address.postal_code}
                </div>
                {address.address_detail && (
                  <div className="text-[11px] text-zinc-400 dark:text-zinc-500 italic mt-0.5 line-clamp-1">
                    {address.address_detail}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-rose-100/60 dark:border-zinc-800 text-xs">
                <span className={`font-medium ${isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-400'}`}>
                  {isSelected ? 'Selected' : 'Select'}
                </span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-rose-500" />}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onAddNewAddress}
        className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-rose-200 dark:border-zinc-700 hover:border-rose-400 dark:hover:border-zinc-600 text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Add a new shipping address</span>
      </button>
    </div>
  );
}
