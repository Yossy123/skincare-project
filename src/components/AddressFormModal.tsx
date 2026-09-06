'use client';

import React, { useState, useEffect } from 'react';
import { Address, AddressPayload } from '@/lib/api';
import { X, MapPin, AlertCircle } from 'lucide-react';

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: AddressPayload, addressId?: number) => Promise<void>;
  initialData?: Address | null;
}

function AddressFormInner({
  onClose,
  onSave,
  initialData,
}: {
  onClose: () => void;
  onSave: (payload: AddressPayload, addressId?: number) => Promise<void>;
  initialData?: Address | null;
}) {
  const isEditing = Boolean(initialData);

  const [label, setLabel] = useState(initialData?.label || 'Home');
  const [name, setName] = useState(initialData?.recipient_name || initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [province, setProvince] = useState(initialData?.province || 'DKI Jakarta');
  const [city, setCity] = useState(initialData?.city || 'Jakarta Selatan');
  const [district, setDistrict] = useState(initialData?.district || 'Kebayoran Baru');
  const [postalCode, setPostalCode] = useState(initialData?.postal_code || '12110');
  const [address, setAddress] = useState(initialData?.address_line || initialData?.address || '');
  const [addressDetail, setAddressDetail] = useState(initialData?.address_detail || '');
  const [isDefault, setIsDefault] = useState(Boolean(initialData?.is_default));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !phone || !address || !province || !city || !district || !postalCode) {
      setError('Please complete all required address fields.');
      return;
    }

    setLoading(true);
    try {
      await onSave(
        {
          label,
          recipient_name: name,
          name,
          phone,
          province,
          city,
          district,
          postal_code: postalCode,
          address,
          address_line: address,
          address_detail: addressDetail,
          is_default: isDefault,
        },
        initialData?.id
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save address';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 z-10 my-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-rose-100 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs font-semibold mb-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Shipping Destination</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif text-zinc-900 dark:text-zinc-50 font-normal">
            {isEditing ? 'Edit Shipping Address' : 'Add New Shipping Address'}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="my-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Address Label Badges */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Address Label
          </label>
          <div className="flex flex-wrap gap-2">
            {['Home', 'Office', 'Apartment', 'Other'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLabel(item)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  label === item
                    ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                    : 'bg-stone-50 dark:bg-zinc-800/80 border-rose-100 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-rose-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Recipient Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Recipient Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Elena Rostova"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Recipient Phone */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +62 812 3456 7890"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>

        {/* Street Address */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Street Address & Building / Suite *
          </label>
          <textarea
            required
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Jl. Senopati No. 45, RT.01/RW.02"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Province */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Province *
            </label>
            <input
              type="text"
              required
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder="e.g. DKI Jakarta"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* City / Regency */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              City / Regency *
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Jakarta Selatan"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* District / Subdistrict */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              District / Subdistrict (Kecamatan) *
            </label>
            <input
              type="text"
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Kebayoran Baru"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Postal Code */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Postal Code *
            </label>
            <input
              type="text"
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="e.g. 12110"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>

        {/* Address Detail / Landmark / Patokan */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Address Detail / Unit / Landmark (Patokan)
          </label>
          <input
            type="text"
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
            placeholder="e.g. Tower Rose Suite 14B, Beside Starbucks"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
          />
        </div>

        {/* Set as Default Checkbox */}
        <div className="pt-2 flex items-center gap-2.5">
          <input
            id="isDefault"
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-400 border-zinc-300 cursor-pointer"
          />
          <label
            htmlFor="isDefault"
            className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
          >
            Set this as my default shipping address
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-rose-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 shadow-md shadow-rose-500/20 transition-all cursor-pointer"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Shipping Address' : 'Save Shipping Address'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function AddressFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddressFormModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <AddressFormInner
        key={initialData?.id ? `edit-${initialData.id}` : 'create-new'}
        onClose={onClose}
        onSave={onSave}
        initialData={initialData}
      />
    </div>
  );
}
