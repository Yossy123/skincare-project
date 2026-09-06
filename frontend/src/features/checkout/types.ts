import { Address, CheckoutValidationResponse, ShippingRate } from '@/lib/api';

export interface CheckoutState {
  addresses: Address[];
  selectedAddressId: number | null;
  selectedRate: ShippingRate | null;
  shippingRates: ShippingRate[];
  checkoutData: CheckoutValidationResponse | null;
  loading: boolean;
  shippingLoading: boolean;
  placingOrder: boolean;
  validationError: string | null;
  shippingError: string | null;
  orderError: string | null;
}
