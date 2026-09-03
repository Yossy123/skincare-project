import React from 'react';
import { PaginationMeta } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.last_page <= 1) {
    return null;
  }

  const pages: number[] = [];
  const startPage = Math.max(1, meta.current_page - 2);
  const endPage = Math.min(meta.last_page, meta.current_page + 2);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-rose-100 dark:border-zinc-800 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
      <div>
        Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{meta.from || 0}</span> to{' '}
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{meta.to || 0}</span> of{' '}
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{meta.total}</span> products
      </div>

      <div className="flex items-center gap-1.5">
        {/* Prev Button */}
        <button
          onClick={() => onPageChange(meta.current_page - 1)}
          disabled={meta.current_page <= 1}
          className="p-2 rounded-xl border border-rose-100 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* First Page button if not in range */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-9 h-9 rounded-xl border border-rose-100 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors text-xs font-medium"
            >
              1
            </button>
            {startPage > 2 && <span className="px-1 text-zinc-400">...</span>}
          </>
        )}

        {/* Page numbers */}
        {pages.map((p) => {
          const isActive = p === meta.current_page;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs shadow-rose-500/20'
                  : 'border border-rose-100 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Last Page button if not in range */}
        {endPage < meta.last_page && (
          <>
            {endPage < meta.last_page - 1 && <span className="px-1 text-zinc-400">...</span>}
            <button
              onClick={() => onPageChange(meta.last_page)}
              className="w-9 h-9 rounded-xl border border-rose-100 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors text-xs font-medium"
            >
              {meta.last_page}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(meta.current_page + 1)}
          disabled={meta.current_page >= meta.last_page}
          className="p-2 rounded-xl border border-rose-100 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
