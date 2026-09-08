'use client';

import React, { Suspense, useEffect, useState, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { FilterBar } from '@/components/FilterBar';
import { Pagination } from '@/components/Pagination';
import { CatalogSkeleton } from '@/components/CatalogSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import {
  fetchCategories,
  fetchCategoryBySlug,
  fetchProducts,
  Category,
  Product,
  PaginationMeta,
} from '@/lib/api';
import { Sparkles, ChevronRight } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

function CategoryCatalogContent({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get('search') || '';
  const currentSort = (searchParams.get('sort') as 'latest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc') || 'latest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load category details and category list
  useEffect(() => {
    fetchCategoryBySlug(slug)
      .then(setCategory)
      .catch((err) => setError(err.message || 'Category not found'));

    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error(err));
  }, [slug]);

  // Fetch products for this category
  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchProducts({
          category: slug,
          search: currentSearch,
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
  }, [slug, currentSearch, currentSort, currentPage]);

  const updateFilters = (updates: Record<string, string | number | undefined>) => {
    // If switching category, navigate to that category's URL
    if ('category' in updates) {
      const newCat = updates.category;
      if (!newCat) {
        router.push('/products');
        return;
      }
      router.push(`/categories/${newCat}`);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || (key === 'page' && value === 1)) {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });

    if ('search' in updates || 'sort' in updates) {
      if (!('page' in updates)) {
        params.delete('page');
      }
    }

    router.push(`/categories/${slug}?${params.toString()}`);
  };

  const handleResetFilters = () => {
    router.push(`/categories/${slug}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
        <Link href="/" className="hover:text-rose-500 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <Link href="/products" className="hover:text-rose-500 transition-colors">Products</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-900 dark:text-zinc-100 font-medium">
          {category?.name || slug}
        </span>
      </nav>

      {/* Category Header Banner */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-linear-to-r from-rose-100/70 via-pink-50/50 to-stone-50/80 dark:from-rose-950/40 dark:via-zinc-900 dark:to-zinc-900 border border-rose-200/60 dark:border-zinc-800">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-zinc-800/90 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Curated Collection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-zinc-900 dark:text-zinc-50 font-normal">
            {category?.name || 'Category'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mt-2 leading-relaxed">
            {category?.description || 'Explore our exclusive collection of luxury formulations.'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        categories={categories}
        selectedCategory={slug}
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
          title="Could not load category"
          message={error}
          onRetry={() => router.refresh()}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title={`No products found in ${category?.name || 'this category'}`}
          description={
            currentSearch
              ? `No products matched "${currentSearch}".`
              : 'Products in this collection will arrive soon.'
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

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);

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
          <CategoryCatalogContent slug={resolvedParams.slug} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
