'use client';

import React from 'react';
import { Category } from '@/lib/api';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface FilterBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  selectedSort: string;
  onSortChange: (sort: 'latest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc') => void;
  onResetFilters: () => void;
  totalProducts?: number;
}

export function FilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedSort,
  onSortChange,
  onResetFilters,
  totalProducts,
}: FilterBarProps) {
  const hasActiveFilters = Boolean(searchQuery || selectedCategory || (selectedSort && selectedSort !== 'latest'));

  return (
    <div className="space-y-4 mb-8 bg-white dark:bg-zinc-900/80 p-4 sm:p-6 rounded-2xl border border-rose-100 dark:border-zinc-800 shadow-xs">
      {/* Top Row: Search Input + Sorting Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search serums, creams, lip tints, fragrances..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <label htmlFor="sort-select" className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Sort:</span>
          </label>
          <select
            id="sort-select"
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value as 'latest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc')}
            className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 cursor-pointer"
          >
            <option value="latest">Latest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Category Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 shrink-0 flex items-center gap-1 mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Category:</span>
        </span>

        <button
          onClick={() => onSelectCategory('')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
            !selectedCategory
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs shadow-rose-500/20 font-semibold'
              : 'bg-stone-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-700 border border-rose-100/60 dark:border-zinc-700'
          }`}
        >
          All Products
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.slug)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat.slug
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs shadow-rose-500/20 font-semibold'
                : 'bg-stone-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-700 border border-rose-100/60 dark:border-zinc-700'
            }`}
          >
            {cat.name}
            {cat.products_count !== undefined && (
              <span className="ml-1.5 text-[10px] opacity-75">
                ({cat.products_count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Filters Summary & Reset */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-rose-50 dark:border-zinc-800 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span>Filtering results</span>
            {totalProducts !== undefined && (
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                ({totalProducts} products found)
              </span>
            )}
          </div>

          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-medium cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}
