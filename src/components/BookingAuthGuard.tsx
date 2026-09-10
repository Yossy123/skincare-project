'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAuthHydrated, useAuthStore } from '@/store/useAuthStore';

type BookingAuthGuardProps = {
  children: ReactNode;
};

/** Prevent unauthenticated users from accessing the booking form. */
export function BookingAuthGuard({ children }: BookingAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHydrated = useAuthHydrated();
  const user = useAuthStore((state) => state.user);

  const redirectPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`);
    }
  }, [isHydrated, user, router, redirectPath]);

  if (!isHydrated || !user) {
    return (
      <div className="max-w-md mx-auto rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-10 text-center shadow-lg shadow-rose-950/5">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center mb-4">
          <LogIn className="w-6 h-6 text-rose-500" />
        </div>
        <h2 className="text-lg font-serif text-zinc-900 dark:text-zinc-100">Login diperlukan</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          Silakan login terlebih dahulu untuk membuat booking.
        </p>
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
          className="inline-flex items-center justify-center mt-6 px-5 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors"
        >
          Login sekarang
        </Link>
      </div>
    );
  }

  return children;
}
