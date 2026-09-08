'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  fetchAdminCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminToggleCategory,
  adminDeleteCategory,
  AdminCategoryItem,
} from '@/lib/api';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Layers,
  Power,
  X,
  AlertTriangle,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const { token } = useAuthStore();

  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategoryItem | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Delete Confirm Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategoryItem | null>(null);

  const loadCategories = useCallback(async (showLoading = false) => {
    if (!token) return;
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminCategories(token);
      setCategories(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load categories';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    if (token) {
      fetchAdminCategories(token)
        .then((data) => {
          if (!isMounted) return;
          setCategories(data);
          setError(null);
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (!isMounted) return;
          const msg = err instanceof Error ? err.message : 'Failed to load categories';
          setError(msg);
          setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setIsActive(true);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: AdminCategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setIsActive(cat.is_active);
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      if (editingCategory) {
        await adminUpdateCategory(
          editingCategory.id,
          {
            name: name.trim(),
            slug: slug.trim() || undefined,
            description: description.trim() || undefined,
            is_active: isActive,
          },
          token
        );
        setSuccessMessage(`Category '${name}' updated successfully.`);
      } else {
        await adminCreateCategory(
          {
            name: name.trim(),
            slug: slug.trim() || undefined,
            description: description.trim() || undefined,
            is_active: isActive,
          },
          token
        );
        setSuccessMessage(`Category '${name}' created successfully.`);
      }
      setModalOpen(false);
      loadCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save category';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (cat: AdminCategoryItem) => {
    if (!token) return;
    setError(null);
    try {
      await adminToggleCategory(cat.id, token);
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_active: !c.is_active } : c))
      );
      setSuccessMessage(`Category '${cat.name}' is now ${!cat.is_active ? 'Active' : 'Inactive'}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle category';
      setError(msg);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!token || !categoryToDelete) return;
    setActionLoading(true);
    setError(null);
    try {
      await adminDeleteCategory(categoryToDelete.id, token);
      setDeleteModalOpen(false);
      setSuccessMessage(`Category '${categoryToDelete.name}' deleted.`);
      loadCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete category';
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
            Category Management
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Organize catalog hierarchy, product classifications, and category visibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadCategories(true)}
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
            <span>New Category</span>
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

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && categories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-zinc-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
            <span>Loading categories...</span>
          </div>
        ) : categories.length > 0 ? (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base text-white font-medium group-hover:text-rose-400 transition-colors">
                      {cat.name}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500">/{cat.slug}</div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    cat.is_active
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}
                >
                  {cat.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>

              <p className="text-xs text-zinc-400 line-clamp-2 min-h-8">
                {cat.description || 'No description provided.'}
              </p>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
                  <Layers className="w-3.5 h-3.5 text-rose-400" />
                  <span>{cat.products_count ?? 0} Products</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggle(cat)}
                    title={cat.is_active ? 'Deactivate' : 'Activate'}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      cat.is_active
                        ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        : 'border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCategoryToDelete(cat);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-zinc-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-zinc-500">
            <FolderTree className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <span>No categories created yet. Click &quot;New Category&quot; above.</span>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-white">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lip Care & Tint"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">
                  Slug <span className="text-zinc-500 font-normal">(Leave blank to auto-generate)</span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. lip-care-tint"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of this category..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="catIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded-md border-zinc-800 text-rose-500 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="catIsActive" className="text-zinc-300 cursor-pointer font-medium">
                  Active (Visible on storefront)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setDeleteModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-rose-900/50 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-white">Delete Category</h3>
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>

            <p className="text-xs text-zinc-400">
              Are you sure you want to delete category{' '}
              <strong className="text-white">&apos;{categoryToDelete.name}&apos;</strong>?
            </p>

            {(categoryToDelete.products_count ?? 0) > 0 && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900 text-rose-300 text-xs">
                ⚠️ This category currently has{' '}
                <strong>{categoryToDelete.products_count} product(s)</strong> attached. You must
                reassign or delete those products first before this category can be removed.
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={actionLoading || (categoryToDelete.products_count ?? 0) > 0}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
