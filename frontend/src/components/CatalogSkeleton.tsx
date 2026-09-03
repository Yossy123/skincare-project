import React from 'react';

export function CatalogSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-rose-100/60 dark:border-zinc-800 p-4 space-y-4 animate-pulse"
        >
          {/* Image skeleton */}
          <div className="w-full aspect-square rounded-xl bg-rose-50 dark:bg-zinc-800"></div>

          {/* Title & category skeleton */}
          <div className="space-y-2">
            <div className="h-3 w-1/3 bg-rose-100/60 dark:bg-zinc-800 rounded-full"></div>
            <div className="h-4 w-4/5 bg-zinc-200 dark:bg-zinc-700 rounded-md"></div>
            <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-md"></div>
          </div>

          {/* Footer skeleton */}
          <div className="flex items-center justify-between pt-2 border-t border-rose-50 dark:border-zinc-800">
            <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-md"></div>
            <div className="h-7 w-16 bg-rose-100/80 dark:bg-zinc-800 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-3xl bg-rose-50 dark:bg-zinc-800"></div>
        <div className="space-y-6">
          <div className="h-4 w-24 bg-rose-100 dark:bg-zinc-800 rounded-full"></div>
          <div className="h-8 w-4/5 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
          <div className="h-7 w-32 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
          <div className="h-24 w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl"></div>
          <div className="h-12 w-full bg-rose-100 dark:bg-zinc-800 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
