# Development Setup Guide

Follow this guide to get the Mini E-Commerce project running locally.

## Prerequisites

- **PHP**: 8.2 or higher (with `pdo_pgsql` enabled)
- **Composer**: 2.x
- **Node.js**: 18.x or higher & **npm**
- **PostgreSQL**: 14+ running on port `5432`
- **Redis**: 5.0+ running on port `6379`

---

## 1. Backend Setup (Laravel)

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   composer install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. Verify database credentials in `backend/.env`:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=mini_ecommerce
   DB_USERNAME=postgres
   DB_PASSWORD=postgres

   REDIS_CLIENT=predis
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   ```

5. Run database migrations:
   ```bash
   php artisan migrate
   ```

6. Run the automated backend tests:
   ```bash
   php artisan test
   ```

7. Start the Laravel development server:
   ```bash
   php artisan serve --port=8000
   ```
   The backend API will be available at `http://localhost:8000`.

---

## 2. Frontend Setup (Next.js)

1. Open a second terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Ensure `NEXT_PUBLIC_API_URL` is set:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. Build test to verify TypeScript & styles:
   ```bash
   npm run build
   ```

5. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend application will be available at `http://localhost:3000`.

---

## 3. Verifying End-to-End Connectivity

1. Open your browser and navigate to `http://localhost:3000`.
2. The **API Connectivity & Health** card will automatically ping `GET http://localhost:8000/api/health`.
3. You will see the green status badge indicating `HTTP 200 OK` and response `{ "status": "ok" }`.
