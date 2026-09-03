/**
 * Compatibility barrel — re-exports everything from the modular API directory.
 *
 * All existing `import { … } from '@/lib/api'` statements continue to work
 * without modification because this file now proxies every export from
 * `./api/index.ts`.
 *
 * For new code, prefer importing directly from the domain module:
 *   import { loginUser } from '@/lib/api/auth';
 *   import { fetchAdminOrders } from '@/lib/api/admin/orders';
 */

export * from './api/index';
