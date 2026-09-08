'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuthStore, useAuthHydrated } from '@/store/useAuthStore';
import {
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const redirectUrl =
    rawRedirect && !rawRedirect.startsWith('/login') && !rawRedirect.startsWith('/register')
      ? rawRedirect
      : '/';

  const isHydrated = useAuthHydrated();
  const { user, login, loading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (isHydrated && user) {
      if (user.role === 'admin') {
        router.push(redirectUrl && redirectUrl !== '/' ? redirectUrl : '/admin/dashboard');
      } else if (user.role === 'doctor') {
        router.push(redirectUrl && redirectUrl !== '/' ? redirectUrl : '/doctor/dashboard');
      } else {
        router.push(redirectUrl);
      }
    }
  }, [isHydrated, user, router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!email || !password) {
      setValidationError('Please enter both your email and password.');
      return;
    }

    const success = await login({ email: email.trim(), password });
    if (success) {
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === 'admin') {
        router.push(redirectUrl && redirectUrl !== '/' ? redirectUrl : '/admin/dashboard');
      } else if (currentUser?.role === 'doctor') {
        router.push(redirectUrl && redirectUrl !== '/' ? redirectUrl : '/doctor/dashboard');
      } else {
        router.push(redirectUrl);
      }
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setValidationError(null);
    clearError();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 w-full">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 p-6 sm:p-10 shadow-xl shadow-rose-950/5">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mb-3 shadow-xs border border-rose-100/60 dark:border-zinc-700">
            <Sparkles className="w-6 h-6 text-rose-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-zinc-900 dark:text-zinc-50 font-normal">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Sign in to access your Lumière beauty bag & orders
          </p>
        </div>

        {/* Error Alert */}
        {(error || validationError) && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{validationError || error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@lumiere.com"
                className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-white bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 shadow-md shadow-rose-500/20 transition-all cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Fill */}
        <div className="mt-6 p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 space-y-2">
          <div className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
            <span>Quick Demo Accounts:</span>
            <span className="text-[10px] text-zinc-400 font-normal">Click to auto-fill</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('customer@lumiere.com', 'password')}
              className="px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-rose-100 dark:border-zinc-700 hover:border-rose-300 text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-rose-600 dark:text-rose-400 text-xs">Customer</div>
              <div className="text-[9px] text-zinc-400 truncate">customer@...</div>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('doctor.yoshi@lumiere.com', 'password')}
              className="px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-emerald-100 dark:border-zinc-700 hover:border-emerald-400 text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">Dokter</div>
              <div className="text-[9px] text-zinc-400 truncate">doctor.yoshi@...</div>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin@lumiere.com', 'password')}
              className="px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-rose-100 dark:border-zinc-700 hover:border-rose-300 text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs">Admin</div>
              <div className="text-[9px] text-zinc-400 truncate">admin@...</div>
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center text-xs text-zinc-500">
          Don&apos;t have an account yet?{' '}
          <Link
            href={`/register${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="font-semibold text-rose-600 dark:text-rose-400 hover:underline"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50/60 dark:bg-zinc-950">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={<div className="p-12 text-center text-zinc-400">Loading sign in form...</div>}>
          <LoginFormContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
