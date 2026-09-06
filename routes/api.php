<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ShippingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health Check
Route::get('/health', [HealthController::class, 'index']);

// Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

// Authenticated User Profile
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

// Customer Addresses (CRUD)
Route::apiResource('addresses', AddressController::class)->middleware('auth:sanctum');

// Checkout Foundation (Server Calculation & Validation)
Route::post('/checkout/validate', [CheckoutController::class, 'validate'])->middleware('auth:sanctum');

// Orders (Customer Endpoints)
Route::apiResource('orders', OrderController::class)->only(['index', 'store', 'show'])->middleware('auth:sanctum');
Route::post('/payments', [PaymentController::class, 'store'])->middleware('auth:sanctum');
Route::post('/webhooks/midtrans', [PaymentController::class, 'webhook']);

// Shipping & Courier Rates (Biteship)
Route::prefix('shipping')->group(function () {
    Route::post('/rates', [ShippingController::class, 'rates']);
    Route::get('/destinations', [ShippingController::class, 'destinations']);
    Route::post('/webhook/biteship', [\App\Http\Controllers\Api\ShippingWebhookController::class, 'handleBiteship']);
});

// Categories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/categories/{slug}/products', [CategoryController::class, 'products']);

// Products
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

// Admin Back Office (Protected by Sanctum and Admin Role)
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    // Executive Overview Dashboard
    Route::get('/dashboard/overview', [\App\Http\Controllers\Api\Admin\AdminDashboardController::class, 'overview']);

    // E-Commerce Analytics Suite
    Route::prefix('analytics')->group(function () {
        Route::get('/sales', [\App\Http\Controllers\Api\Admin\AdminAnalyticsController::class, 'sales']);
        Route::get('/orders', [\App\Http\Controllers\Api\Admin\AdminAnalyticsController::class, 'orders']);
        Route::get('/products', [\App\Http\Controllers\Api\Admin\AdminAnalyticsController::class, 'products']);
        Route::get('/customers', [\App\Http\Controllers\Api\Admin\AdminAnalyticsController::class, 'customers']);
        Route::get('/payments', [\App\Http\Controllers\Api\Admin\AdminAnalyticsController::class, 'payments']);
        Route::get('/shipping', [\App\Http\Controllers\Api\Admin\AdminAnalyticsController::class, 'shipping']);
    });

    // Admin Orders Management & Operational Actions
    Route::prefix('orders')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\Admin\AdminOrderController::class, 'index']);
        Route::get('/{id}', [\App\Http\Controllers\Api\Admin\AdminOrderController::class, 'show']);
        Route::post('/{id}/process', [\App\Http\Controllers\Api\Admin\AdminOrderController::class, 'process']);
        Route::post('/{id}/ship', [\App\Http\Controllers\Api\Admin\AdminOrderController::class, 'ship']);
        Route::post('/{id}/deliver', [\App\Http\Controllers\Api\Admin\AdminOrderController::class, 'deliver']);
        Route::post('/{id}/complete', [\App\Http\Controllers\Api\Admin\AdminOrderController::class, 'complete']);
        Route::post('/{id}/cancel', [\App\Http\Controllers\Api\Admin\AdminOrderController::class, 'cancel']);
        Route::post('/{id}/refund', [\App\Http\Controllers\Api\Admin\AdminOperationsController::class, 'refund']);
    });

    // Admin Products Management & Inventory Control
    Route::prefix('products')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'store']);
        Route::get('/{id}', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'show']);
        Route::post('/{id}', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'update']);
        Route::put('/{id}', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'update']);
        Route::patch('/{id}/toggle', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'toggle']);
        Route::post('/{id}/stock', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'adjustStock']);
    });

    // Admin Categories Management
    Route::prefix('categories')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\Admin\AdminCategoryController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Api\Admin\AdminCategoryController::class, 'store']);
        Route::get('/{id}', [\App\Http\Controllers\Api\Admin\AdminCategoryController::class, 'show']);
        Route::put('/{id}', [\App\Http\Controllers\Api\Admin\AdminCategoryController::class, 'update']);
        Route::patch('/{id}/toggle', [\App\Http\Controllers\Api\Admin\AdminCategoryController::class, 'toggle']);
        Route::delete('/{id}', [\App\Http\Controllers\Api\Admin\AdminCategoryController::class, 'destroy']);
    });

    // Admin Customers Management
    Route::prefix('customers')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\Admin\AdminCustomerController::class, 'index']);
        Route::get('/{id}', [\App\Http\Controllers\Api\Admin\AdminCustomerController::class, 'show']);
        Route::patch('/{id}/toggle', [\App\Http\Controllers\Api\Admin\AdminCustomerController::class, 'toggle']);
    });

    // Advanced Operations & Background Sync
    Route::prefix('operations')->group(function () {
        Route::get('/alerts', [\App\Http\Controllers\Api\Admin\AdminOperationsController::class, 'alerts']);
        Route::post('/expire-pending', [\App\Http\Controllers\Api\Admin\AdminOperationsController::class, 'expirePending']);
        Route::post('/sync-shipments', [\App\Http\Controllers\Api\Admin\AdminOperationsController::class, 'syncShipments']);
    });
});
