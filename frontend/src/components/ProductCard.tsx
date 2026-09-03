'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/api';
import { useCartStore } from '@/store/useCartStore';
import { Sparkles, Eye, Plus, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const { addItem } = useCartStore();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      weight: product.weight,
      stock: product.stock,
    }, 1);
  };

  // Beauty placeholder gradient if image is not uploaded yet
  const categoryGradients: Record<string, string> = {
    skincare: 'from-rose-100 via-pink-50 to-amber-50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-zinc-900',
    makeup: 'from-pink-100 via-rose-100 to-red-50 dark:from-pink-950/40 dark:via-rose-950/30 dark:to-zinc-900',
    fragrance: 'from-amber-100 via-rose-50 to-orange-50 dark:from-amber-950/30 dark:via-rose-950/20 dark:to-zinc-900',
    'body-care': 'from-emerald-50 via-teal-50 to-rose-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-zinc-900',
    'hair-care': 'from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/30 dark:via-pink-950/20 dark:to-zinc-900',
  };

  const bgGradient = (product.category?.slug && categoryGradients[product.category.slug]) ||
    'from-rose-50 via-stone-50 to-pink-50 dark:from-zinc-900 dark:to-zinc-800';

  return (
    <div className="group relative flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-rose-100/70 dark:border-zinc-800 shadow-xs hover:shadow-xl hover:shadow-rose-500/5 hover:border-rose-300 dark:hover:border-zinc-700 transition-all duration-300 overflow-hidden">
      {/* Product Image / Visual Showcase */}
      <Link
        href={`/products/${product.slug}`}
        className={`relative w-full aspect-square bg-gradient-to-br ${bgGradient} flex items-center justify-center p-6 overflow-hidden`}
      >
        {/* Decorative cosmetic icon & bottle silhouette */}
        <div className="flex flex-col items-center justify-center text-center p-4 transition-transform duration-500 group-hover:scale-105">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md shadow-md flex items-center justify-center text-rose-500 mb-2 border border-rose-100/60 dark:border-zinc-700">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400" />
          </div>
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 max-w-[140px] truncate">
            {product.category?.name || 'Cosmetics'}
          </span>
        </div>

        {/* Category Pill Tag */}
        {product.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 shadow-xs backdrop-blur-xs border border-zinc-100 dark:border-zinc-800">
            {product.category.name}
          </span>
        )}

        {/* Stock Status Badge */}
        {isOutOfStock ? (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-white dark:bg-zinc-700">
            Sold Out
          </span>
        ) : isLowStock ? (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
            Only {product.stock} left
          </span>
        ) : null}

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-rose-950/20 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-2xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs font-semibold shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-rose-500" />
            View
          </span>
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <Link
          href={`/products/${product.slug}`}
          className="font-serif text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 hover:text-rose-600 dark:hover:text-rose-400 line-clamp-2 transition-colors mb-1.5"
        >
          {product.name}
        </Link>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3 leading-relaxed flex-1">
          {product.description || 'Premium clean cosmetics formulation crafted with nourishing botanical botanicals.'}
        </p>

        {/* Price & Action Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-rose-50 dark:border-zinc-800/80 mt-auto gap-2">
          <div>
            <div className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {product.formatted_price}
            </div>
            {product.weight > 0 && (
              <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {product.weight}g
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className="p-2 rounded-xl text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
              title="Add 1 to bag"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
            <Link
              href={`/products/${product.slug}`}
              className="px-2.5 py-1.5 text-xs font-medium rounded-xl text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
