# Architecture Overview

## Mini E-Commerce System Architecture (Beauty & Cosmetics)

This document describes the architectural foundation for the Mini E-Commerce application.

```
+-------------------------------------------------------------------------+
|                              FRONTEND LAYER                             |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |                  Next.js 15+ (App Router & SSR/CSR)             |   |
|   |                                                                 |   |
|   |  - TypeScript: Strict static typing                             |   |
|   |  - Tailwind CSS: Modern luxury cosmetics aesthetic              |   |
|   |  - Zustand: Global store for client state                       |   |
|   |  - API Client: Modular HTTP client with environment base URL    |   |
|   +-----------------------------------------------------------------+   |
+-------------------------------------------------------------------------+
                                    |
                                    | REST API Calls (CORS enabled)
                                    v
+-------------------------------------------------------------------------+
|                              BACKEND LAYER                              |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |                  Laravel 11+ REST API Framework                 |   |
|   |                                                                 |   |
|   |  - API Router: routes/api.php                                   |   |
|   |  - CORS Middleware: config/cors.php                             |   |
|   |  - Controllers: App\Http\Controllers\Api\*                      |   |
|   |  - Eloquent ORM: Clean data access abstractions                 |   |
|   +-----------------------------------------------------------------+   |
+-------------------------------------------------------------------------+
                 |                                      |
                 | SQL                                  | TCP
                 v                                      v
+--------------------------------+     +----------------------------------+
|           DATA LAYER           |     |        CACHE & QUEUE LAYER       |
|                                |     |                                  |
|        PostgreSQL 16+          |     |           Redis 5.0+             |
|   - Relational store           |     |   - Session handling             |
|   - ACID transaction integrity |     |   - High performance cache       |
|   - Database: mini_ecommerce   |     |   - Async jobs / queues          |
+--------------------------------+     +----------------------------------+
```

## Database Schema Design (PostgreSQL)

```
+---------------------------------------------------------------------------------+
|                                 DATABASE SCHEMA                                 |
|                                                                                 |
|  +------------------+         +------------------+         +-----------------+  |
|  |      users       |1 ----- N|    addresses     |         |   categories    |  |
|  +------------------+         +------------------+         +-----------------+  |
|          | 1                                                        | 1         |
|          |                                                          |           |
|          | N                                                        | N         |
|  +------------------+         +------------------+         +-----------------+  |
|  |      orders      |1 ----- N|   order_items    |N ----- 1|    products     |  |
|  +------------------+         +------------------+         +-----------------+  |
|     | 1        | 1            (Price snapshot)                                  |
|     |          |                                                                |
|     | 1        | 1                                                              |
|  +----------+ +-----------+                                                     |
|  | payments | | shipments |                                                     |
|  +----------+ +-----------+                                                     |
+---------------------------------------------------------------------------------+
```

### Table Relationships & Cardinality

1. **`users`**
   - `addresses`: 1-to-Many (`$user->addresses()`)
   - `orders`: 1-to-Many (`$user->orders()`)

2. **`categories`**
   - `products`: 1-to-Many (`$category->products()`)

3. **`products`**
   - `category`: Many-to-1 (`$product->category()`)
   - `order_items`: 1-to-Many (`$product->orderItems()`)

4. **`addresses`**
   - `user`: Many-to-1 (`$address->user()`)

5. **`orders`**
   - `user`: Many-to-1 (`$order->user()`)
   - `order_items`: 1-to-Many (`$order->orderItems()`)
   - `payment`: 1-to-1 (`$order->payment()`)
   - `shipment`: 1-to-1 (`$order->shipment()`)

6. **`order_items`**
   - `order`: Many-to-1 (`$orderItem->order()`)
   - `product`: Many-to-1 (`$orderItem->product()`)
   - **Snapshot rule**: `product_name` and `unit_price` are captured at order time and never mutate with subsequent product price edits.

7. **`payments`**
   - `order`: 1-to-1 (`$payment->order()`)

8. **`shipments`**
   - `order`: 1-to-1 (`$shipment->order()`)


```
mini-ecommerce/
├── frontend/                     # Next.js TypeScript application
│   ├── src/
│   │   ├── app/                  # Next.js App Router (pages & layouts)
│   │   ├── components/           # Reusable UI components
│   │   ├── lib/                  # API client and utilities
│   │   └── store/                # Zustand global stores
│   ├── .env.example              # Frontend environment variables template
│   ├── .env.local                # Local environment overrides (gitignored)
│   └── package.json
│
├── backend/                      # Laravel REST API application
│   ├── app/
│   │   └── Http/
│   │       └── Controllers/Api/  # REST API Controllers
│   ├── config/                   # CORS, database, cache configs
│   ├── routes/
│   │   └── api.php               # API route definitions
│   ├── tests/                    # Feature & Unit test suites
│   ├── .env.example              # Backend environment template
│   ├── .env                      # Local environment overrides (gitignored)
│   └── composer.json
│
├── docs/                         # Architecture, API, and setup documentation
│   ├── architecture.md
│   ├── api.md
│   └── setup.md
│
├── .gitignore                    # Global repository ignore rules
└── README.md                     # Main project guide and quick start
```

## Scalability & Modularity Principles

1. **Decoupled Frontend and Backend**: Both layers run as independent processes communicating strictly via REST contracts over HTTP.
2. **Environment Isolation**: No hardcoded API endpoints, credentials, or secrets. All configuration values are loaded dynamically from `.env` files.
3. **Stateless API Design**: API requests are stateless and scalable horizontally.
4. **Caching & Queue Readiness**: Redis is pre-configured for queueing background tasks and high-speed data caching.
5. **Phase Progression**: Foundation is established first without premature feature coupling.
