'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductDetailSkeleton } from '@/components/CatalogSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { ProductImage } from '@/components/ProductImage';
import { useCartStore } from '@/store/useCartStore';
import { fetchProductBySlug, Product } from '@/lib/api';
import {
  Sparkles,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductBySlug(resolvedParams.slug);
        setProduct(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Product not found';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [resolvedParams.slug]);

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityIncrease = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;

    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
        weight: product.weight,
        stock: product.stock,
      },
      quantity
    );

    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
    }, 3500);

    openCart();
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/60 dark:bg-zinc-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-8">
          <Link href="/" className="hover:text-rose-500 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/products" className="hover:text-rose-500 transition-colors">Products</Link>
          {product?.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              <Link
                href={`/categories/${product.category.slug}`}
                className="hover:text-rose-500 transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 dark:text-zinc-100 font-medium truncate max-w-[200px]">
            {product?.name || resolvedParams.slug}
          </span>
        </nav>

        {loading ? (
          <ProductDetailSkeleton />
        ) : error || !product ? (
          <div className="py-12">
            <ErrorState
              title="Product Not Found"
              message={`The product "${resolvedParams.slug}" does not exist or is currently unavailable.`}
              onRetry={() => router.push('/products')}
            />
            <div className="text-center mt-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Catalog</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Product Image Showcase (5 cols) */}
            <div className="lg:col-span-6">
              <div className="relative sticky top-28 overflow-hidden bg-gradient-to-br from-rose-100/70 via-pink-50/50 to-stone-100/80 dark:from-zinc-900 dark:to-zinc-800 rounded-3xl p-10 sm:p-16 border border-rose-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center shadow-xs">
                <ProductImage
                  image={product.image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md shadow-xl shadow-rose-950/5 flex items-center justify-center text-rose-500 mb-6 border border-rose-100/80 dark:border-zinc-700">
                  <Sparkles className="w-16 h-16 sm:w-20 sm:h-20 text-rose-400" />
                </div>
                <span className="text-xs font-serif tracking-widest text-zinc-500 uppercase">
                  {product.category?.name || 'Lumière Beauté'}
                </span>
                <span className="text-[11px] text-zinc-400 mt-1">
                  Clean Formula • Cruelty Free
                </span>
              </div>
            </div>

            {/* Product Details & Actions (7 cols) */}
            <div className="lg:col-span-6 flex flex-col">
              {/* Category Pill & Status */}
              <div className="flex items-center gap-3 mb-3">
                {product.category && (
                  <Link
                    href={`/categories/${product.category.slug}`}
                    className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/50 hover:bg-rose-100 transition-colors"
                  >
                    {product.category.name}
                  </Link>
                )}
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>In Stock ({product.stock} available)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Out of Stock</span>
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-zinc-900 dark:text-zinc-50 font-normal leading-tight mb-4">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {product.formatted_price}
                </span>
                {product.weight > 0 && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    Net Weight: {product.weight}g
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="prose prose-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pb-6 border-b border-rose-100 dark:border-zinc-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Formulation & Benefits
                </h4>
                <p>
                  {product.description ||
                    'Crafted with potent clean botanicals and scientifically balanced ingredients to deliver transformative hydration and radiant complexion.'}
                </p>
              </div>

              {/* Quantity Selector & Add to Cart */}
              <div className="py-6 border-b border-rose-100 dark:border-zinc-800 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Quantity:
                  </span>
                  <div className="flex items-center rounded-xl border border-rose-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
                    <button
                      onClick={handleQuantityDecrease}
                      disabled={quantity <= 1 || product.stock <= 0}
                      className="p-2.5 text-zinc-600 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {quantity}
                    </span>
                    <button
                      onClick={handleQuantityIncrease}
                      disabled={quantity >= product.stock || product.stock <= 0}
                      className="p-2.5 text-zinc-600 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-semibold text-white transition-all duration-300 shadow-md cursor-pointer ${
                      addedToast
                        ? 'bg-emerald-600 shadow-emerald-500/30 scale-[1.02]'
                        : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-rose-500/25 hover:scale-[1.01] active:scale-[0.99]'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {addedToast ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 animate-in zoom-in spin-in-45 duration-200" />
                        <span>Added to Shopping Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>{product.stock > 0 ? 'Add to Shopping Bag' : 'Currently Unavailable'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Toast feedback */}
                {addedToast && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Added <strong>{quantity}x {product.name}</strong> to your shopping bag!
                      </span>
                    </div>
                    <Link
                      href="/cart"
                      className="font-bold underline text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 shrink-0"
                    >
                      View Bag
                    </Link>
                  </div>
                )}
              </div>

              {/* Guarantees & Shipping Info */}
              <div className="pt-6 space-y-3 text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Free courier shipping on all orders above Rp 500.000</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>100% Genuine, freshly formulated botanical cosmetics</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Complimentary samples included with every shipment</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
