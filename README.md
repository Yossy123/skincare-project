# Mini E-Commerce Application (Lumière Beauté)

Initial foundation for a modern mini e-commerce application inspired by a luxury beauty and cosmetics store.

---

## Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | [Next.js](https://nextjs.org/) (v16+) | React framework with App Router and TypeScript |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (v4+) | Utility-first responsive CSS styling |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight, fast client state management |
| **Backend** | [Laravel](https://laravel.com/) (v11/v12) | PHP REST API backend |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Relational database (`mini_ecommerce`) |
| **Cache & Queue** | [Redis](https://redis.io/) (`predis`) | High-performance cache, session, and queue driver |
| **API Architecture** | REST | JSON endpoints with CORS configuration |

---

## Repository Structure

```
mini-ecommerce/ (workspace root)
├── frontend/                     # Next.js TypeScript Frontend
│   ├── src/
│   │   ├── app/                  # Next.js App Router (layout.tsx, page.tsx, globals.css)
│   │   ├── components/           # UI Components (HealthStatusCard.tsx)
│   │   ├── lib/                  # Utilities & API Client (api.ts)
│   │   └── store/                # Zustand State Stores (useAppStore.ts)
│   ├── .env.example              # Frontend environment variables template
│   ├── .env.local                # Local environment configuration (gitignored)
│   ├── package.json              # Frontend scripts and dependencies
│   ├── tsconfig.json             # TypeScript compiler configuration
│   └── tailwind.config.ts        # Tailwind CSS configuration
│
├── backend/                      # Laravel REST API Backend
│   ├── app/Http/Controllers/Api/ # REST API Controllers (HealthController.php)
│   ├── config/                   # Framework configuration (cors.php, database.php)
│   ├── routes/                   # Route definitions (api.php, web.php)
│   ├── tests/                    # Automated Feature and Unit tests
│   ├── .env.example              # Backend environment variables template
│   ├── .env                      # Local environment configuration (gitignored)
│   ├── composer.json             # Backend dependencies (predis, sanctum)
│   └── artisan                   # Laravel CLI tool
│
├── docs/                         # Project Documentation
│   ├── architecture.md           # Architecture overview & diagrams
│   ├── api.md                    # REST API endpoint documentation
│   └── setup.md                  # Comprehensive developer setup guide
│
├── .gitignore                    # Global git ignore configuration
└── README.md                     # Project documentation & quick start guide
```

---

## Quick Start Guide

### Prerequisites

- **PHP 8.2+** with `pdo_pgsql` extension enabled
- **Composer 2.x**
- **Node.js 18+** & **npm**
- **PostgreSQL** running on port `5432` (database `mini_ecommerce`)
- **Redis** running on port `6379`

---

### Running the Backend Independently

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Copy the environment file (if not already copied):
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. Run migrations against PostgreSQL:
   ```bash
   php artisan migrate
   ```

4. Run the automated backend test suite:
   ```bash
   php artisan test
   ```

5. Start the backend development server:
   ```bash
   php artisan serve --port=8000
   ```

The REST API will be accessible at `http://localhost:8000/api`.

---

### Running the Frontend Independently

1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Copy the environment file:
   ```bash
   cp .env.example .env.local
   ```

3. Build check for TypeScript and Tailwind:
   ```bash
   npm run build
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

The frontend will be accessible at `http://localhost:3000`.

---

## Health Check Verification

The REST API provides a health check endpoint at `GET /api/health`:

### Expected Response:
```json
{
  "status": "ok"
}
```

### Direct verification via cURL / PowerShell:
```bash
curl http://localhost:8000/api/health
```

### Verification via Frontend:
Open `http://localhost:3000` in your browser. The frontend interacts directly with `/api/health` via Zustand and displays real-time connection status and latency.

---

## Security & Secrets

- Secrets and sensitive credentials are never committed.
- All `.env` and `.env.local` files are ignored by `.gitignore`.
- Template `.env.example` files are provided in both `frontend/` and `backend/`.

---

## Phase Progression

- **Phase 1 (Completed)**: Core foundation, repository structure, Next.js + TypeScript, Tailwind CSS, Zustand, Laravel REST API, PostgreSQL, Redis (`predis`), CORS, and `/api/health` endpoint.
- **Phase 2 (Upcoming)**: Product catalog & shopping cart state.
- **Phase 3 (Upcoming)**: Authentication, address management, checkout, Midtrans payment gateway, and shipping courier integrations.
