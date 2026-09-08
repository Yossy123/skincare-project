'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { FilterBar } from '@/components/FilterBar';
import { Pagination } from '@/components/Pagination';
import { CatalogSkeleton } from '@/components/CatalogSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { fetchCategories, fetchProducts, Category, Product, PaginationMeta } from '@/lib/api';
import { Sparkles } from 'lucide-react';

function ProductsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSort = (searchParams.get('sort') as 'latest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc') || 'latest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories once
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  // Fetch products when query params change
  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchProducts({
          search: currentSearch,
          category: currentCategory,
          sort: currentSort,
          page: currentPage,
          per_page: 12,
        });

        if (isMounted) {
          setProducts(response.data);
          setMeta(response.meta || null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load products';
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [currentSearch, currentCategory, currentSort, currentPage]);

  // Update query params helper
  const updateFilters = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || (key === 'page' && value === 1)) {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });

    // Reset to page 1 if changing search, category, or sort
    if ('search' in updates || 'category' in updates || 'sort' in updates) {
      if (!('page' in updates)) {
        params.delete('page');
      }
    }

    router.push(`/products?${params.toString()}`);
  };

  const handleResetFilters = () => {
    router.push('/products');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Product Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif text-zinc-900 dark:text-zinc-50 font-normal">
          {currentCategory
            ? `${categories.find((c) => c.slug === currentCategory)?.name || 'Category'} Collection`
            : 'Explore All Formulations'}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          Discover scientifically proven botanicals, radiant pigments, and clinical formulas.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        categories={categories}
        selectedCategory={currentCategory}
        onSelectCategory={(cat) => updateFilters({ category: cat })}
        searchQuery={currentSearch}
        onSearchChange={(query) => updateFilters({ search: query })}
        selectedSort={currentSort}
        onSortChange={(sort) => updateFilters({ sort })}
        onResetFilters={handleResetFilters}
        totalProducts={meta?.total}
      />

      {/* Product Grid Area */}
      {loading ? (
        <CatalogSkeleton count={8} />
      ) : error ? (
        <ErrorState
          title="Could not retrieve products"
          message={error}
          onRetry={() => {
            router.refresh();
          }}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products matched your criteria"
          description={
            currentSearch
              ? `No products found matching "${currentSearch}". Try a different keyword.`
              : 'There are currently no active products in this selection.'
          }
          onReset={handleResetFilters}
        />
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          {meta && (
            <Pagination
              meta={meta}
              onPageChange={(page) => updateFilters({ page })}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50/60 dark:bg-zinc-950">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <CatalogSkeleton count={8} />
            </div>
          }
        >
          <ProductsCatalogContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
