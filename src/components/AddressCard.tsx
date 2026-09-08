'use client';

import React from 'react';
import { Address } from '@/lib/api';
import { MapPin, Phone, CheckCircle2, Edit3, Trash2 } from 'lucide-react';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
  onSetDefault: (address: Address) => void;
  isActionLoading?: boolean;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isActionLoading = false,
}: AddressCardProps) {
  const displayName = address.recipient_name || address.name;
  const displayAddressLine = address.address_line || address.address;

  return (
    <div
      className={`relative p-5 sm:p-6 rounded-3xl border transition-all duration-200 ${
        address.is_default
          ? 'bg-linear-to-br from-rose-50/70 via-white to-pink-50/40 dark:from-rose-950/20 dark:via-zinc-900 dark:to-zinc-900 border-rose-300 dark:border-rose-900/60 shadow-md shadow-rose-950/5'
          : 'bg-white dark:bg-zinc-900 border-rose-100/80 dark:border-zinc-800 shadow-xs hover:border-rose-200 dark:hover:border-zinc-700'
      }`}
    >
      {/* Header: Name, Label & Default Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-serif text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {displayName}
          </h3>

          {address.label && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-stone-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              {address.label}
            </span>
          )}

          {address.is_default && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500 text-white shadow-2xs">
              <CheckCircle2 className="w-3 h-3" />
              <span>Default Address</span>
            </span>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-3">
        <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        <span>{address.phone}</span>
      </div>

      {/* Full Address Details */}
      <div className="flex items-start gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-zinc-800 dark:text-zinc-200">{displayAddressLine}</p>
          {address.address_detail && (
            <p className="text-zinc-600 dark:text-zinc-400 text-xs italic mt-0.5">
              Note: {address.address_detail}
            </p>
          )}
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
            {address.district}, {address.city}, {address.province} {address.postal_code}
          </p>
        </div>
      </div>

      {/* Actions Toolbar */}
      <div className="flex items-center justify-between pt-4 border-t border-rose-100/60 dark:border-zinc-800/80 text-xs gap-2">
        <div>
          {!address.is_default && (
            <button
              onClick={() => onSetDefault(address)}
              disabled={isActionLoading}
              className="text-rose-600 dark:text-rose-400 font-semibold hover:underline disabled:opacity-50 cursor-pointer"
            >
              Set as default
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(address)}
            disabled={isActionLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-100 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-750 font-medium transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => onDelete(address.id)}
            disabled={isActionLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-transparent text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium transition-colors cursor-pointer"
            title="Delete address"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
