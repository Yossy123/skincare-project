/**
 * Shared type definitions for the API client layer.
 * All interfaces/types that are used across multiple domain modules live here.
 */

export interface HealthResponse {
  status: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: 'customer' | 'admin';
  phone: string | null;
  email_verified_at?: string | null;
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Address {
  id: number;
  user_id: number;
  label?: string | null;
  recipient_name?: string | null;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  address: string;
  address_line?: string | null;
  address_detail?: string | null;
  biteship_area_id?: string | null;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AddressPayload {
  label?: string | null;
  recipient_name?: string | null;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  address: string;
  address_line?: string | null;
  address_detail?: string | null;
  biteship_area_id?: string | null;
  is_default?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  products_count?: number;
  created_at?: string;
}

export interface Product {
  id: number;
  category_id: number;
  category?: Category;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  formatted_price: string;
  weight: number;
  stock: number;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMetaLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links?: PaginationMetaLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links?: PaginationLinks;
  meta?: PaginationMeta;
}

export interface ProductFilterParams {
  search?: string;
  category?: string;
  sort?: 'latest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
  page?: number;
  per_page?: number;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CheckoutItemPayload {
  product_id: number;
  quantity: number;
}

export interface CheckoutValidatePayload {
  items: CheckoutItemPayload[];
  address_id?: number | null;
}

export interface ValidatedCheckoutItem {
  product_id: number;
  name: string;
  slug: string;
  image: string | null;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  price: number;
  formatted_price: string;
  weight: number;
  stock: number;
  quantity: number;
  line_subtotal: number;
  formatted_line_subtotal: string;
}

export interface CheckoutSummary {
  subtotal: number;
  formatted_subtotal: string;
  total_weight: number;
  formatted_total_weight: string;
  total_items: number;
}

export interface CheckoutValidationResponse {
  items: ValidatedCheckoutItem[];
  summary: CheckoutSummary;
  shipping_address: Address | null;
  is_valid: boolean;
}

export interface ShippingRate {
  courier: string;
  courier_name: string;
  service: string;
  description: string;
  price: number;
  formatted_price: string;
  etd: string;
  formatted_etd: string;
}

export interface DestinationResult {
  id: number;
  label: string;
  province_name: string;
  city_name: string;
  district_name: string;
  subdistrict_name: string;
  zip_code: string;
}

export interface ShippingRatePayload {
  destination: string | number;
  weight: number;
  couriers?: string[] | string;
  items?: Array<{ product_id: number; quantity: number }>;
}

export interface OrderStorePayload {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  address_id: number;
  courier: string;
  service: string;
}

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  unit_price: number;
  formatted_unit_price: string;
  quantity: number;
  subtotal: number;
  formatted_subtotal: string;
}

export interface Shipment {
  id: number;
  biteship_order_id?: string | null;
  biteship_tracking_id?: string | null;
  biteship_waybill_id?: string | null;
  courier: string;
  service: string;
  tracking_number: string | null;
  status: string;
}

export interface Payment {
  id: number;
  payment_type: string | null;
  status: string;
  amount: number;
  snap_token?: string | null;
  redirect_url?: string | null;
  expires_at?: string | null;
}

export interface Order {
  id: number;
  user_id: number;
  status: string;
  subtotal: number;
  formatted_subtotal: string;
  shipping_cost: number;
  formatted_shipping_cost: string;
  total: number;
  formatted_total: string;
  shipping_courier: string;
  shipping_service: string;
  shipping_etd?: string | null;
  shipping_address: {
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    postal_code: string;
    address: string;
  };
  items: OrderItem[];
  shipment?: Shipment | null;
  payment?: Payment | null;
  created_at: string;
  updated_at: string;
}
