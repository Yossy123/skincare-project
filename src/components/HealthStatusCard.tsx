'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { API_BASE_URL } from '@/lib/api';
import { Activity, CheckCircle2, XCircle, RefreshCw, Server, Database, Zap } from 'lucide-react';

export function HealthStatusCard() {
  const {
    healthState,
    healthData,
    latencyMs,
    lastCheckedAt,
    errorMessage,
    checkBackendHealth,
  } = useAppStore();

  useEffect(() => {
    // Automatically ping API health on initial client load
    checkBackendHealth();
  }, [checkBackendHealth]);

  return (
    <div className="w-full max-w-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl border border-rose-100 dark:border-zinc-800 shadow-xl shadow-rose-950/5 p-6 md:p-8 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-rose-100/70 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <Activity className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
              API Connectivity & Health
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Endpoint: <code className="font-mono text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded">{API_BASE_URL}/health</code>
          </p>
        </div>

        <button
          onClick={() => checkBackendHealth()}
          disabled={healthState === 'loading'}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm shadow-rose-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${healthState === 'loading' ? 'animate-spin' : ''}`} />
          {healthState === 'loading' ? 'Checking...' : 'Ping /api/health'}
        </button>
      </div>

      {/* Health Status Indicator */}
      <div className="mt-6">
        {healthState === 'loading' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Connecting to Laravel API...</span> Checking response status.
            </div>
          </div>
        )}

        {healthState === 'healthy' && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <div className="text-sm font-semibold flex items-center gap-2">
                    <span>Backend Status: Online & Healthy</span>
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                      HTTP 200 OK
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5 font-mono">
                    Response: {JSON.stringify(healthData)}
                  </p>
                </div>
              </div>

              {latencyMs !== null && (
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-medium px-2 py-1 rounded-md bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                    {latencyMs}ms
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {healthState === 'error' && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-100">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold">Backend Unreachable or Returned Error</div>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 font-mono">
                  {errorMessage}
                </p>
                <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-2">
                  Ensure the Laravel backend server is running (<code className="bg-rose-100 dark:bg-rose-900 px-1 py-0.5 rounded">php artisan serve --port=8000</code>).
                </p>
              </div>
            </div>
          </div>
        )}

        {healthState === 'idle' && (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm">
            Click the button above to test the connection to the Laravel backend.
          </div>
        )}
      </div>

      {/* Tech Stack Diagnostics Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-xs">
            <Server className="w-4 h-4 text-rose-500" />
            <span>Laravel REST API</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            v11+ API Routing & CORS
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-xs">
            <Database className="w-4 h-4 text-sky-500" />
            <span>PostgreSQL</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            mini_ecommerce (port 5432)
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-xs">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Redis Cache/Queue</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            predis driver (port 6379)
          </p>
        </div>
      </div>

      {lastCheckedAt && (
        <div className="mt-4 text-right">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Last checked: {lastCheckedAt}
          </span>
        </div>
      )}
    </div>
  );
}
