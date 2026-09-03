'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
  fetchAdminProducts,
  fetchAdminCategories,
  adminCreateProduct,
  adminUpdateProduct,
  adminToggleProduct,
  adminAdjustStock,
  AdminProductListItem,
  AdminCategoryItem,
  AdminProductPaginatedResponse,
} from '@/lib/api';
import {
  Search,
  Plus,
  Edit,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Package,
  Layers,
  Power,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  TrendingUp,
  TrendingDown,
  Warehouse,
  Image as ImageIcon,
} from 'lucide-react';

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const { token } = useAuthStore();

  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [meta, setMeta] = useState<AdminProductPaginatedResponse | null>(null);

  // Filters
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [categoryId, setCategoryId] = useState<string>(searchParams.get('category_id') || '');
  const [isActiveFilter, setIsActiveFilter] = useState<string>(searchParams.get('is_active') || '');
  const [stockStatus, setStockStatus] = useState<string>(searchParams.get('stock_status') || '');

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Create / Edit Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductListItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategoryId, setFormCategoryId] = useState<number>(0);
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formWeight, setFormWeight] = useState<number>(100);
  const [formStock, setFormStock] = useState<number>(10);
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Stock Adjustment Modal
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<AdminProductListItem | null>(null);
  const [stockAdjustmentType, setStockAdjustmentType] = useState<'set' | 'increment' | 'decrement'>('increment');
  const [stockAmount, setStockAmount] = useState<number>(5);
  const [stockReason, setStockReason] = useState<string>('');

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetchAdminProducts(
          {
            page,
            per_page: 15,
            search: search || undefined,
            category_id: categoryId || undefined,
            is_active: isActiveFilter || undefined,
            stock_status: stockStatus || undefined,
          },
          token
        ),
        fetchAdminCategories(token),
      ]);
      setProducts(prodRes.data);
      setMeta(prodRes);
      setCategories(catRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load products';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token, page, search, categoryId, isActiveFilter, stockStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSlug('');
    setFormCategoryId(categories[0]?.id || 1);
    setFormPrice(150000);
    setFormWeight(100);
    setFormStock(20);
    setFormImage('');
    setFormDescription('');
    setFormIsActive(true);
    setError(null);
    setProductModalOpen(true);
  };

  const openEditModal = (prod: AdminProductListItem) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormSlug(prod.slug);
    setFormCategoryId(prod.category_id);
    setFormPrice(Number(prod.price));
    setFormWeight(prod.weight);
    setFormStock(prod.stock);
    setFormImage(prod.image || '');
    setFormDescription(prod.description || '');
    setFormIsActive(prod.is_active);
    setError(null);
    setProductModalOpen(true);
  };

  const openStockModal = (prod: AdminProductListItem) => {
    setSelectedProductForStock(prod);
    setStockAdjustmentType('increment');
    setStockAmount(5);
    setStockReason('');
    setError(null);
    setStockModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!formName.trim()) {
      setError('Product name is required.');
      return;
    }
    if (formPrice < 0) {
      setError('Product price cannot be negative.');
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      if (editingProduct) {
        await adminUpdateProduct(
          editingProduct.id,
          {
            name: formName.trim(),
            slug: formSlug.trim() || undefined,
            category_id: formCategoryId,
            price: Number(formPrice),
            weight: Number(formWeight),
            stock: Number(formStock),
            image: formImage.trim() || undefined,
            description: formDescription.trim() || undefined,
            is_active: formIsActive,
          },
          token
        );
        setSuccessMessage(`Product '${formName}' updated successfully.`);
      } else {
        await adminCreateProduct(
          {
            name: formName.trim(),
            slug: formSlug.trim() || undefined,
            category_id: formCategoryId,
            price: Number(formPrice),
            weight: Number(formWeight),
            stock: Number(formStock),
            image: formImage.trim() || undefined,
            description: formDescription.trim() || undefined,
            is_active: formIsActive,
          },
          token
        );
        setSuccessMessage(`Product '${formName}' created successfully.`);
      }
      setProductModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (prod: AdminProductListItem) => {
    if (!token) return;
    setError(null);
    try {
      const updated = await adminToggleProduct(prod.id, token);
      setProducts((prev) => prev.map((p) => (p.id === prod.id ? updated : p)));
      setSuccessMessage(
        `Product '${prod.name}' is now ${updated.is_active ? 'Active' : 'Disabled'}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle product status';
      setError(msg);
    }
  };

  const handleStockAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedProductForStock) return;

    setActionLoading(true);
    setError(null);
    try {
      const updated = await adminAdjustStock(
        selectedProductForStock.id,
        {
          type: stockAdjustmentType,
          amount: Number(stockAmount),
          reason: stockReason.trim() || undefined,
        },
        token
      );
      setProducts((prev) =>
        prev.map((p) => (p.id === selectedProductForStock.id ? updated : p))
      );
      setStockModalOpen(false);
      setSuccessMessage(
        `Stock for '${selectedProductForStock.name}' updated to ${updated.stock} units.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to adjust stock';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white font-normal">
            Product & Inventory Management
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage product catalog, pricing, SKU specifications, and warehouse stock levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Product</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-xs text-emerald-400 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product by title, slug, or description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={isActiveFilter}
              onChange={(e) => {
                setIsActiveFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>

            <select
              value={stockStatus}
              onChange={(e) => {
                setStockStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="">All Stock Levels</option>
              <option value="in_stock">In Stock (&gt;5)</option>
              <option value="low_stock">Low Stock (≤5)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-all shadow-md shadow-rose-500/20 cursor-pointer"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-[11px] text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Product</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Price</th>
                <th className="py-3.5 px-4 font-semibold">Stock Level</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-rose-500" />
                    <span>Loading products catalog...</span>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center shrink-0 overflow-hidden">
                          {prod.image ? (
                            <img
                              src={
                                prod.image.startsWith('http')
                                  ? prod.image
                                  : `http://localhost:8000/storage/${prod.image}`
                              }
                              alt={prod.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&auto=format&fit=crop&q=80';
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-zinc-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                            <span>{prod.name}</span>
                            <Link
                              href={`/products/${prod.slug}`}
                              target="_blank"
                              title="View on storefront"
                              className="text-zinc-500 hover:text-rose-400"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            SKU: {prod.slug} • {prod.weight}g
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/80">
                        {prod.category?.name || 'Unassigned'}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-semibold text-white">
                      Rp {Number(prod.price).toLocaleString('id-ID')}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold font-mono px-2 py-0.5 rounded-md text-[11px] ${
                            prod.stock <= 0
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                              : prod.stock <= 5
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {prod.stock} units
                        </span>

                        <button
                          type="button"
                          onClick={() => openStockModal(prod)}
                          title="Adjust stock quantity"
                          className="p-1 rounded-md bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 cursor-pointer"
                        >
                          <Warehouse className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(prod)}
                        title={prod.is_active ? 'Click to deactivate' : 'Click to activate'}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                          prod.is_active
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25'
                            : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:bg-zinc-700'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{prod.is_active ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(prod)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <Package className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    <span>No products found matching the criteria.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {meta && meta.last_page > 1 && (
          <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between text-xs text-zinc-400">
            <div>
              Showing <span className="font-semibold text-zinc-200">{meta.from || 0}</span> to{' '}
              <span className="font-semibold text-zinc-200">{meta.to || 0}</span> of{' '}
              <span className="font-semibold text-zinc-200">{meta.total}</span> products
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-zinc-200 font-semibold px-2">
                Page {meta.current_page} of {meta.last_page}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page >= meta.last_page}
                className="p-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setProductModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-white">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create New Product'}
              </h3>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Lumière Radiance Vitamin C Serum 30ml"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Category *</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Slug (URL SKU)</label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="Leave blank to auto-generate"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Price (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Weight (Grams) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formWeight}
                    onChange={(e) => setFormWeight(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Available Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Image URL / Storage Path</label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="e.g. products/vitamin-c-serum.jpg or https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Product Description</label>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detailed formula ingredients, skin benefits, and usage instructions..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="prodIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded-md border-zinc-800 text-rose-500 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="prodIsActive" className="text-zinc-300 cursor-pointer font-medium">
                  Active (Display in catalog and available for checkout)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {stockModalOpen && selectedProductForStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setStockModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-white">Stock Adjustment</h3>
              <Warehouse className="w-5 h-5 text-rose-400" />
            </div>

            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-zinc-200">{selectedProductForStock.name}</div>
                <div className="text-[10px] text-zinc-500">Current Stock Level</div>
              </div>
              <div className="text-base font-bold font-mono text-white">
                {selectedProductForStock.stock} units
              </div>
            </div>

            <form onSubmit={handleStockAdjustmentSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Adjustment Action *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStockAdjustmentType('increment')}
                    className={`py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      stockAdjustmentType === 'increment'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Inward (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStockAdjustmentType('decrement')}
                    className={`py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      stockAdjustmentType === 'decrement'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Outward (-)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStockAdjustmentType('set')}
                    className={`py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      stockAdjustmentType === 'set'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    <span>Set Exact</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Quantity Amount *</label>
                <input
                  type="number"
                  min={stockAdjustmentType === 'set' ? '0' : '1'}
                  required
                  value={stockAmount}
                  onChange={(e) => setStockAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-sm font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Reason / Notes (Optional)</label>
                <input
                  type="text"
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  placeholder="e.g. Warehouse restock batch #49, Damaged inventory audit"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStockModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Updating...' : 'Confirm Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
