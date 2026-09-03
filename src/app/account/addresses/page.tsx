'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AddressCard } from '@/components/AddressCard';
import { AddressFormModal } from '@/components/AddressFormModal';
import { useAuthStore, useAuthHydrated } from '@/store/useAuthStore';
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  Address,
  AddressPayload,
} from '@/lib/api';
import {
  MapPin,
  Plus,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

export default function AddressesPage() {
  const router = useRouter();
  const isAuthHydrated = useAuthHydrated();
  const { token, user } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Load addresses callback
  const loadAddresses = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAddresses(token);
      setAddresses(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load addresses';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Auth protection & initial load
  useEffect(() => {
    if (!isAuthHydrated) return;

    if (!user || !token) {
      router.push('/login?redirect=/account/addresses');
      return;
    }

    loadAddresses();
  }, [isAuthHydrated, user, token, router, loadAddresses]);

  // Handle Create or Update save
  const handleSaveAddress = async (payload: AddressPayload, addressId?: number) => {
    if (!token) return;
    setActionLoading(true);
    try {
      if (addressId) {
        await updateAddress(addressId, payload, token);
      } else {
        await createAddress(payload, token);
      }
      await loadAddresses();
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Set as Default
  const handleSetDefault = async (address: Address) => {
    if (!token || address.is_default) return;
    setActionLoading(true);
    try {
      await updateAddress(address.id, { is_default: true }, token);
      await loadAddresses();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to set default address';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm('Are you sure you want to remove this shipping address?')) return;

    setActionLoading(true);
    try {
      await deleteAddress(id, token);
      await loadAddresses();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete address';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  if (!isAuthHydrated || (!user && loading)) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50/60 dark:bg-zinc-950">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-16 text-center text-zinc-400">
          Loading your account addresses...
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/60 dark:bg-zinc-950">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <Link href="/" className="hover:text-rose-500 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-500">Account</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 dark:text-zinc-100 font-medium">Shipping Addresses</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-rose-100 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs font-medium mb-2">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Address Book</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-zinc-900 dark:text-zinc-50 font-normal">
              Shipping Addresses
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage where your luxury orders and complimentary cosmetics samples are delivered
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-500/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Addresses Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 rounded-3xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="max-w-md mx-auto text-center p-10 bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 shadow-xs my-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              No addresses saved yet
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Add your primary shipping destination to make future checkouts seamless.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Address</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
                isActionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </main>

      {/* Address Create/Edit Modal */}
      <AddressFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={editingAddress}
      />

      <Footer />
    </div>
  );
}
