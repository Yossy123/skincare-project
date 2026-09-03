'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AddressSelector } from '@/components/AddressSelector';
import { AddressFormModal } from '@/components/AddressFormModal';
import { useCartStore, useCartHydrated } from '@/store/useCartStore';
import { useAuthStore, useAuthHydrated } from '@/store/useAuthStore';
import {
  fetchAddresses,
  createAddress,
  validateCheckout,
  fetchShippingRates,
  createOrder,
  Address,
  AddressPayload,
  CheckoutValidationResponse,
  ShippingRate,
} from '@/lib/api';
import {
  ShoppingBag,
  MapPin,
  Truck,
  CreditCard,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Package,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();

  const isAuthHydrated = useAuthHydrated();
  const isCartHydrated = useCartHydrated();

  const { token, user } = useAuthStore();
  const { items: cartItems, clearCart } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [checkoutData, setCheckoutData] = useState<CheckoutValidationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Shipping Rates State
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  // Order Placement State
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Fetch Shipping Rates from backend
  const loadShippingRates = useCallback(
    async (destination: string | number, weightGrams: number) => {
      if (!destination || weightGrams <= 0) return;

      setShippingLoading(true);
      setShippingError(null);

      try {
        const rates = await fetchShippingRates(
          {
            destination,
            weight: weightGrams,
            couriers: ['jne', 'sicepat', 'jnt', 'tiki', 'pos'],
          },
          token || undefined
        );

        setShippingRates(rates);

        // Auto-select first/cheapest courier rate if none selected yet or if current selection is invalid
        if (rates.length > 0) {
          setSelectedRate((prev) => {
            if (prev) {
              const matched = rates.find(
                (r) => r.courier === prev.courier && r.service === prev.service
              );
              return matched || rates[0];
            }
            return rates[0];
          });
        } else {
          setSelectedRate(null);
        }
      } catch (err: unknown) {
        console.error('Shipping calculation error:', err);
        const msg = err instanceof Error ? err.message : 'Shipping rates could not be loaded. Please try again.';
        setShippingError(msg);
      } finally {
        setShippingLoading(false);
      }
    },
    [token]
  );

  // Validate checkout items with backend
  const runCheckoutValidation = useCallback(
    async (addressId?: number | null) => {
      if (!token || cartItems.length === 0) return;

      setLoading(true);
      setValidationError(null);

      try {
        const payloadItems = cartItems.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        }));

        const response = await validateCheckout(
          {
            items: payloadItems,
            address_id: addressId ?? selectedAddressId,
          },
          token
        );

        setCheckoutData(response);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to validate checkout calculation.';
        setValidationError(msg);
      } finally {
        setLoading(false);
      }
    },
    [token, cartItems, selectedAddressId]
  );

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

    // Load customer addresses
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
        activeAddress.rajaongkir_destination_id ||
        activeAddress.id ||
        `${activeAddress.district}, ${activeAddress.city}, ${activeAddress.province}`;

      loadShippingRates(destination, checkoutData.summary.total_weight);
    }
  }, [selectedAddressId, addresses, checkoutData, loadShippingRates]);

  // Handle address selection change
  const handleSelectAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    runCheckoutValidation(address.id);
  };

  // Handle new address creation from modal
  const handleSaveNewAddress = async (payload: AddressPayload) => {
    if (!token) return;
    const newAddr = await createAddress(payload, token);
    const updatedAddresses = await fetchAddresses(token);
    setAddresses(updatedAddresses);
    setSelectedAddressId(newAddr.id);
    runCheckoutValidation(newAddr.id);
  };

  // Handle Order Placement
  const handlePlaceOrder = async () => {
    if (!token || !selectedAddressId || !selectedRate || cartItems.length === 0) {
      setOrderError('Please select a delivery address and shipping courier service before placing your order.');
      return;
    }

    setPlacingOrder(true);
    setOrderError(null);

    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
        address_id: selectedAddressId,
        courier: selectedRate.courier,
        service: selectedRate.service,
      };

      const createdOrder = await createOrder(orderPayload, token);

      // Clear the cart upon successful order creation
      clearCart();

      // Navigate to order confirmation summary
      router.push(`/account/orders/${createdOrder.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      setOrderError(msg);
      setPlacingOrder(false);
    }
  };

  // Calculate final total (Subtotal + Shipping)
  const subtotal = checkoutData?.summary.subtotal || 0;
  const shippingCost = selectedRate?.price || 0;
  const grandTotal = subtotal + shippingCost;
  const formattedGrandTotal = 'Rp ' + Number(grandTotal).toLocaleString('id-ID');

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

  const activeAddress = addresses.find((a) => a.id === selectedAddressId);

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

        {/* Validation / Order Error Alerts */}
        {(validationError || orderError) && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Checkout Notice</p>
              <p className="mt-1">{orderError || validationError}</p>
              {validationError && (
                <button
                  onClick={() => runCheckoutValidation()}
                  className="mt-2 text-rose-700 dark:text-rose-300 font-bold underline cursor-pointer"
                >
                  Re-validate Cart
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Checkout Content (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Shipping Address Selection */}
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
                    onClick={() => setIsAddressModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold shadow-xs"
                  >
                    Add Shipping Address
                  </button>
                </div>
              ) : (
                <AddressSelector
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  onSelectAddress={handleSelectAddress}
                  onAddNewAddress={() => setIsAddressModalOpen(true)}
                />
              )}
            </div>

            {/* Step 2: Courier & Shipping Method (RajaOngkir) */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-rose-50 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h2 className="font-serif text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    Shipping Courier (RajaOngkir)
                  </h2>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{checkoutData?.summary.formatted_total_weight || '0 g'}</span>
                </span>
              </div>

              {shippingLoading ? (
                <div className="space-y-3 py-4 animate-pulse">
                  <div className="h-16 bg-stone-100 dark:bg-zinc-800 rounded-2xl" />
                  <div className="h-16 bg-stone-100 dark:bg-zinc-800 rounded-2xl" />
                </div>
              ) : shippingError ? (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-amber-800 dark:text-amber-200 text-xs flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Shipping rates could not be loaded. Please try again.</span>
                  </div>
                  <button
                    onClick={() => {
                      if (activeAddress && checkoutData) {
                        const destination =
                          activeAddress.rajaongkir_destination_id ||
                          activeAddress.id ||
                          `${activeAddress.district}, ${activeAddress.city}, ${activeAddress.province}`;
                        loadShippingRates(destination, checkoutData.summary.total_weight);
                      }
                    }}
                    className="inline-flex items-center gap-1 font-bold underline text-amber-900 dark:text-amber-100 shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                </div>
              ) : shippingRates.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500">
                  Select a valid delivery address to view available courier services.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {shippingRates.map((rate, idx) => {
                      const isSelected =
                        selectedRate?.courier === rate.courier &&
                        selectedRate?.service === rate.service;

                      const courierColors: Record<string, string> = {
                        JNE: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
                        SICEPAT: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
                        JNT: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
                        POS: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900',
                        TIKI: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
                      };

                      const badgeClass =
                        courierColors[rate.courier] ||
                        'text-zinc-600 bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300';

                      return (
                        <div
                          key={`${rate.courier}-${rate.service}-${idx}`}
                          onClick={() => setSelectedRate(rate)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-400 dark:border-rose-700 shadow-sm'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-rose-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${badgeClass}`}>
                                {rate.courier}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
                                <Clock className="w-3 h-3 text-zinc-400" />
                                <span>{rate.formatted_etd}</span>
                              </span>
                            </div>

                            <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                              {rate.service}
                            </h4>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                              {rate.description || rate.courier_name}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 mt-3 border-t border-rose-100/60 dark:border-zinc-800 text-xs">
                            <span className="font-bold text-zinc-900 dark:text-zinc-50">
                              {rate.formatted_price}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-rose-500" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Verified Products List */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-rose-50 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                  <h2 className="font-serif text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    Validated Products & Inventory
                  </h2>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>DB Verified</span>
                </span>
              </div>

              {loading && !checkoutData ? (
                <div className="space-y-3 animate-pulse py-4">
                  <div className="h-16 bg-stone-100 dark:bg-zinc-800 rounded-2xl" />
                  <div className="h-16 bg-stone-100 dark:bg-zinc-800 rounded-2xl" />
                </div>
              ) : checkoutData?.items ? (
                <div className="space-y-3 divide-y divide-rose-50 dark:divide-zinc-800">
                  {checkoutData.items.map((item) => (
                    <div
                      key={item.product_id}
                      className="pt-3 first:pt-0 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-zinc-800 dark:to-zinc-800 border border-rose-100 dark:border-zinc-700 flex items-center justify-center shrink-0">
                          <Sparkles className="w-6 h-6 text-rose-400" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-serif text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {item.name}
                          </h4>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                            <span>{item.formatted_price}</span>
                            <span>×</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200">
                              {item.quantity}
                            </span>
                            {item.weight > 0 && <span>• {item.weight * item.quantity}g</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-50">
                          {item.formatted_line_subtotal}
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          In Stock ({item.stock})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Sidebar Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-6 sticky top-28">
              <h3 className="font-serif text-xl font-semibold text-zinc-900 dark:text-zinc-50 pb-4 border-b border-rose-100 dark:border-zinc-800">
                Payment Summary
              </h3>

              <div className="space-y-3.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Product Subtotal</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {checkoutData?.summary.formatted_subtotal || 'Rp 0'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-zinc-400" />
                    <span>Courier Delivery</span>
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {selectedRate ? (
                      <span>{selectedRate.formatted_price} ({selectedRate.courier})</span>
                    ) : (
                      <span className="text-zinc-400">Select courier</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Package Weight</span>
                  </span>
                  <span>{checkoutData?.summary.formatted_total_weight || '0 g'}</span>
                </div>

                <div className="flex justify-between pt-4 border-t border-rose-100/70 dark:border-zinc-800 text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  <span>Total Due</span>
                  <span className="text-rose-600 dark:text-rose-400">
                    {formattedGrandTotal}
                  </span>
                </div>
              </div>

              {/* Order Placement Action */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || !selectedAddressId || !selectedRate || cartItems.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer text-center"
                >
                  {placingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Secure Order...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Place Order & Prepare Payment</span>
                    </>
                  )}
                </button>

                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Atomic Order Security:
                  </p>
                  <p>
                    • Stock will be reserved and locked atomically.
                  </p>
                  <p>
                    • Order item prices and delivery addresses are frozen upon order creation.
                  </p>
                </div>
              </div>
            </div>
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
