'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AddressFormModal } from '@/components/AddressFormModal';
import { useCartStore, useCartHydrated } from '@/store/useCartStore';
import { useAuthStore, useAuthHydrated } from '@/store/useAuthStore';
import { fetchAddresses, createAddress, Address, AddressPayload } from '@/lib/api';
import { ChevronRight, ShieldCheck, ArrowLeft } from 'lucide-react';

import { useCheckoutValidation } from '@/features/checkout/hooks/useCheckoutValidation';
import { useShippingRates } from '@/features/checkout/hooks/useShippingRates';
import { useCheckoutOrder } from '@/features/checkout/hooks/useCheckoutOrder';
import { CheckoutError } from '@/features/checkout/components/CheckoutError';
import { CheckoutAddressSection } from '@/features/checkout/components/CheckoutAddressSection';
import { CheckoutShippingSection } from '@/features/checkout/components/CheckoutShippingSection';
import { CheckoutPaymentSection } from '@/features/checkout/components/CheckoutPaymentSection';
import { CheckoutSummary } from '@/features/checkout/components/CheckoutSummary';

export default function CheckoutPage() {
  const router = useRouter();

  const isAuthHydrated = useAuthHydrated();
  const isCartHydrated = useCartHydrated();

  const { token, user } = useAuthStore();
  const { items: cartItems, clearCart } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Modular Hooks
  const {
    checkoutData,
    loading,
    validationError,
    runCheckoutValidation,
  } = useCheckoutValidation(token, cartItems);

  const {
    shippingRates,
    selectedRate,
    setSelectedRate,
    shippingLoading,
    shippingError,
    loadShippingRates,
  } = useShippingRates(token, cartItems);

  const {
    placingOrder,
    orderError,
    handlePlaceOrder,
  } = useCheckoutOrder(token, cartItems, clearCart);

  // Initial Load: Authenticate and fetch addresses + cart validation
  useEffect(() => {
    if (!isAuthHydrated || !isCartHydrated) return;

    if (!user || !token) {
      router.push('/login?redirect=/checkout');
      return;
    }

    if (cartItems.length === 0) {
      router.push('/cart');
      return;
    }

    fetchAddresses(token)
      .then((addrList) => {
        setAddresses(addrList);
        const defaultAddr = addrList.find((a) => a.is_default) || addrList[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          runCheckoutValidation(defaultAddr.id);
        } else {
          runCheckoutValidation();
        }
      })
      .catch((err) => {
        console.error('Failed to load addresses:', err);
        runCheckoutValidation();
      });
  }, [isAuthHydrated, isCartHydrated, user, token, cartItems, router, runCheckoutValidation]);

  // Reactive Effect: Whenever selectedAddressId or checkoutData total weight changes, fetch shipping rates
  useEffect(() => {
    if (!selectedAddressId || !checkoutData || checkoutData.summary.total_weight <= 0) return;

    const activeAddress = addresses.find((a) => a.id === selectedAddressId);
    if (activeAddress) {
      const destination =
        activeAddress.postal_code ||
        activeAddress.id ||
        `${activeAddress.district}, ${activeAddress.city}, ${activeAddress.province}`;

      loadShippingRates(destination, checkoutData.summary.total_weight);
    }
  }, [selectedAddressId, addresses, checkoutData, loadShippingRates]);

  const handleSelectAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    runCheckoutValidation(address.id);
  };

  const handleSaveNewAddress = async (payload: AddressPayload) => {
    if (!token) return;
    const newAddr = await createAddress(payload, token);
    const updatedAddresses = await fetchAddresses(token);
    setAddresses(updatedAddresses);
    setSelectedAddressId(newAddr.id);
    runCheckoutValidation(newAddr.id);
  };

  const activeAddress = addresses.find((a) => a.id === selectedAddressId);

  const handleRetryShipping = () => {
    if (activeAddress && checkoutData) {
      const destination =
        activeAddress.postal_code ||
        activeAddress.id ||
        `${activeAddress.district}, ${activeAddress.city}, ${activeAddress.province}`;
      loadShippingRates(destination, checkoutData.summary.total_weight);
    }
  };

  if (!isAuthHydrated || !isCartHydrated || (!user && loading)) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50/60 dark:bg-zinc-950">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-16 text-center text-zinc-400">
          Preparing secure checkout...
        </main>
        <Footer />
      </div>
    );
  }

  const canPlaceOrder = Boolean(token && selectedAddressId && selectedRate && cartItems.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/60 dark:bg-zinc-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <Link href="/" className="hover:text-rose-500 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/cart" className="hover:text-rose-500 transition-colors">Shopping Bag</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 dark:text-zinc-100 font-medium">Checkout Flow</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-rose-100 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs font-medium mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
              <span>Server-Authoritative Checkout</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-zinc-900 dark:text-zinc-50 font-normal">
              Review & Shipping
            </h1>
          </div>

          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Edit Bag</span>
          </Link>
        </div>

        {/* Error Alerts */}
        <CheckoutError
          validationError={validationError}
          orderError={orderError}
          onRevalidate={() => runCheckoutValidation(selectedAddressId)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Checkout Content */}
          <div className="lg:col-span-7 space-y-8">
            <CheckoutAddressSection
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={handleSelectAddress}
              onOpenNewAddressModal={() => setIsAddressModalOpen(true)}
            />

            <CheckoutShippingSection
              totalWeightFormatted={checkoutData?.summary.formatted_total_weight}
              shippingLoading={shippingLoading}
              shippingError={shippingError}
              shippingRates={shippingRates}
              selectedRate={selectedRate}
              onSelectRate={setSelectedRate}
              onRetry={handleRetryShipping}
            />

            <CheckoutPaymentSection
              loading={loading}
              checkoutData={checkoutData}
            />
          </div>

          {/* Sidebar Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <CheckoutSummary
              checkoutData={checkoutData}
              selectedRate={selectedRate}
              canPlaceOrder={canPlaceOrder}
              placingOrder={placingOrder}
              onPlaceOrder={() => handlePlaceOrder(selectedAddressId, selectedRate)}
            />
          </div>
        </div>
      </main>

      {/* New Address Modal */}
      <AddressFormModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveNewAddress}
      />

      <Footer />
    </div>
  );
}
