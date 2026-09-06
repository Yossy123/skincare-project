# API Documentation

## Base URL

- Development: `http://localhost:8000/api`
- Content-Type: `application/json`
- Accept: `application/json`

---

## Authentication Endpoints (Sanctum)

- `POST /auth/register` - Customer registration.
- `POST /auth/login` - Customer authentication.
- `POST /auth/logout` - Revokes current access token (auth:sanctum).
- `GET /me` - Returns current customer profile (auth:sanctum).

---

## Customer Shipping Addresses (auth:sanctum)

- `GET /addresses` - List customer addresses (default address first).
- `POST /addresses` - Create a shipping address with Biteship-compatible postal code/area data.
- `PUT /addresses/{id}` - Update existing address.
- `DELETE /addresses/{id}` - Delete address (auto-promotes remaining default).

### Address Fields
- `label` (`string`, e.g. "Home", "Office", "Apartment", "Other")
- `recipient_name` / `name` (`string`, required)
- `phone` (`string`, required)
- `address_line` / `address` (`string`, required)
- `address_detail` (`string`, optional landmark / unit / patokan notes)
- `province` (`string`, required)
- `city` (`string`, required)
- `district` (`string`, required)
- `postal_code` (`string`, required)
- `biteship_area_id` (`string`, optional Biteship area identifier)
- `is_default` (`boolean`)

---

## Checkout Foundation (auth:sanctum)

- `POST /checkout/validate` - Validates items, inventory stock, active product availability, and calculates server-authoritative subtotal and cumulative package weight.

---

## Orders (auth:sanctum)

- `POST /orders` - Atomically creates order, deducts inventory stock, creates frozen snapshots, and sets status to `PENDING_PAYMENT`.
- `GET /orders` - Lists authenticated customer's orders.
- `GET /orders/{id}` - Shows order details (enforces user isolation with HTTP 403 for unauthorized users).

---

## Shipping & Courier Integration (Biteship API v1)

### 1. Calculate Shipping Rates
Calculates and normalizes domestic shipping delivery rates from supported couriers (JNE, SiCepat, J&T, POS Indonesia, TIKI, AnterAja, GoSend, Grab, Wahana) based on store origin, destination postal code / area ID, and authoritative package weight.

- **URL**: `/shipping/rates`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "destination": "40132",
    "weight": 350,
    "couriers": "jne,sicepat,jnt,tiki,pos"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "data": [
      {
        "courier": "SICEPAT",
        "courier_name": "SiCepat Express",
        "service": "HALU",
        "description": "Hemat Reguler",
        "price": 7500,
        "formatted_price": "Rp 7.500",
        "etd": "2-3",
        "formatted_etd": "2-3 Hari"
      },
      {
        "courier": "JNE",
        "courier_name": "Jalur Nugraha Ekakurir (JNE)",
        "service": "REG",
        "description": "Layanan Reguler",
        "price": 10000,
        "formatted_price": "Rp 10.000",
        "etd": "1-2",
        "formatted_etd": "1-2 Hari"
      }
    ]
  }
  ```

### 2. Search Domestic Destinations
- **URL**: `/shipping/destinations?search=Jakarta Selatan`
- **Method**: `GET`
- **Response (`200 OK`)**: Returns domestic area records with subdistrict, district, city, province, postal code, and Biteship area `id`.

### 3. Biteship Webhook
- **URL**: `/shipping/webhook/biteship`
- **Method**: `POST`
- **Description**: Receives asynchronous shipment status events from Biteship and updates order and shipment lifecycle states idempotently.

---

## Product & Category Endpoints

- `GET /categories` - List active categories.
- `GET /categories/{slug}` - Show single category.
- `GET /categories/{slug}/products` - List products in category.
- `GET /products` - Paginated products (supports `search`, `category`, `sort`, `page`, `per_page`).
- `GET /products/{slug}` - Show single product by slug.
- `GET /health` - API connectivity check.
