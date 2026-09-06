/**
 * Barrel file for modular API client.
 * Re-exports everything so consumers can import from '@/lib/api' or '@/lib/api/index'.
 */

// Infrastructure
export { API_BASE_URL } from './client';

// Shared types
export type {
  HealthResponse,
  User,
  AuthResponse,
  Address,
  AddressPayload,
  Category,
  Product,
  PaginationLinks,
  PaginationMetaLink,
  PaginationMeta,
  PaginatedResponse,
  ProductFilterParams,
  RegisterPayload,
  LoginPayload,
  CheckoutItemPayload,
  CheckoutValidatePayload,
  ValidatedCheckoutItem,
  CheckoutSummary,
  CheckoutValidationResponse,
  ShippingRate,
  DestinationResult,
  ShippingRatePayload,
  OrderStorePayload,
  OrderItem,
  Shipment,
  Payment,
  Order,
} from './types';

// Auth & user
export { fetchHealth, registerUser, loginUser, logoutUser, fetchMe } from './auth';

// Addresses
export { fetchAddresses, createAddress, updateAddress, deleteAddress } from './addresses';

// Products (customer)
export { fetchProducts, fetchProductBySlug } from './products';

// Categories (customer)
export { fetchCategories, fetchCategoryBySlug } from './categories';

// Checkout
export { validateCheckout } from './checkout';

// Shipping
export { fetchShippingRates, searchDestinations } from './shipping';

// Orders (customer)
export { createOrder, fetchOrders, fetchOrderById } from './orders';
export { createPayment } from './payments';
export type { PaymentResponse } from './payments';

// Admin — Dashboard
export type { AdminKPICard, AdminDashboardOverview } from './admin/dashboard';
export { fetchAdminOverview } from './admin/dashboard';

// Admin — Analytics
export type {
  SalesAnalyticsResponse,
  OrderAnalyticsResponse,
  ProductAnalyticsResponse,
  CustomerAnalyticsResponse,
  PaymentAnalyticsResponse,
  ShippingAnalyticsResponse,
} from './admin/analytics';
export {
  fetchSalesAnalytics,
  fetchOrderAnalytics,
  fetchProductAnalytics,
  fetchCustomerAnalytics,
  fetchPaymentAnalytics,
  fetchShippingAnalytics,
} from './admin/analytics';

// Admin — Order Management
export type {
  OrderAuditLogItem,
  AdminOrderListItem,
  AdminOrderDetail,
  AdminOrderPaginatedResponse,
} from './admin/orders';
export {
  fetchAdminOrders,
  fetchAdminOrderDetail,
  adminProcessOrder,
  adminShipOrder,
  adminDeliverOrder,
  adminCompleteOrder,
  adminCancelOrder,
} from './admin/orders';

// Admin — Product Management
export type {
  AdminProductListItem,
  AdminProductPaginatedResponse,
} from './admin/products';
export {
  fetchAdminProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminToggleProduct,
  adminAdjustStock,
} from './admin/products';

// Admin — Category Management
export type {
  AdminCategoryItem,
} from './admin/categories';
export {
  fetchAdminCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminToggleCategory,
  adminDeleteCategory,
} from './admin/categories';

// Admin — Customer Management
export type {
  CustomerAuditLogItem,
  AdminCustomerListItem,
  AdminCustomerPaginatedResponse,
  AdminCustomerDetailResponse,
} from './admin/customers';
export {
  fetchAdminCustomers,
  fetchAdminCustomerDetail,
  adminToggleCustomer,
} from './admin/customers';

// Admin — Advanced Operations
export type { OperationalAlertsData } from './admin/operations';
export {
  adminRefundOrder,
  fetchOperationalAlerts,
  adminExpirePendingOrders,
  adminSyncShipments,
} from './admin/operations';
