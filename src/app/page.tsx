'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { CatalogSkeleton } from '@/components/CatalogSkeleton';
import { HealthStatusCard } from '@/components/HealthStatusCard';
import { fetchCategories, fetchProducts, Category, Product } from '@/lib/api';
import { Sparkles, ArrowRight, Star, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProducts({ per_page: 8, sort: 'latest' }),
        ]);
        setCategories(cats);
        setFeaturedProducts(prods.data || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load store data';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/60 dark:bg-zinc-950">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-linear-to-b from-rose-100/60 via-pink-50/40 to-stone-50/60 dark:from-rose-950/30 dark:via-zinc-900 dark:to-zinc-950 py-16 sm:py-24 border-b border-rose-100/60 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-rose-200/80 dark:border-zinc-700 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-6 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Modern Clean Cosmetics & Skincare</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-zinc-900 dark:text-zinc-50 font-normal leading-[1.15]">
                Reveal Your Natural, Radiant Glow
              </h1>

              <p className="mt-5 text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-xl">
                Dermatologist-formulated botanical skincare and luminous makeup designed to nourish, protect, and illuminate every skin tone.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-white bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/categories/skincare"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-white/90 dark:bg-zinc-900/90 hover:bg-rose-50 dark:hover:bg-zinc-800 border border-rose-200/70 dark:border-zinc-700 transition-all shadow-xs"
                >
                  <span>Skincare Rituals</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 pt-6 border-t border-rose-200/50 dark:border-zinc-800 flex items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>4.9/5 Rating (1.2k+ Reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Dermatologist Approved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Glow Circle */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-125 h-125 bg-linear-to-br from-rose-200/40 via-pink-200/30 to-amber-100/30 dark:from-rose-900/20 dark:via-pink-900/10 dark:to-transparent blur-3xl pointer-events-none rounded-full"></div>
        </section>

        {/* Categories Grid Showcase */}
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-rose-500">
                Curated Collections
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-zinc-900 dark:text-zinc-100 mt-1">
                Shop By Category
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group flex flex-col p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-rose-100/70 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-rose-500/5 transition-all text-center"
                >
                  <div className="w-12 h-12 mx-auto rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-rose-400" />
                  </div>
                  <h3 className="font-serif font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-rose-600 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                    {cat.products_count ?? 0} products
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-rose-50/60 dark:bg-zinc-900 border border-rose-100/50"></div>
              ))}
            </div>
          )}
        </section>

        {/* Featured Products Section */}
        <section className="py-14 bg-white/70 dark:bg-zinc-900/50 border-y border-rose-100/60 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-rose-500">
                  Staff Picks & Best Sellers
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-zinc-900 dark:text-zinc-100 mt-1">
                  Featured Products
                </h2>
              </div>
              <Link
                href="/products"
                className="text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Browse All ({featuredProducts.length}+)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <CatalogSkeleton count={4} />
            ) : error ? (
              <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-200">
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* System Architecture & Health Indicator */}
        <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Infrastructure Status
            </span>
            <h3 className="text-xl font-serif text-zinc-900 dark:text-zinc-100 mt-1">
              Live Backend Connectivity
            </h3>
          </div>
          <div className="flex justify-center">
            <HealthStatusCard />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
