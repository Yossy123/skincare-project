import { AdminOrderDetail } from '@/lib/api';

export type { AdminOrderDetail };

export interface OrderActionModals {
  shipModalOpen: boolean;
  cancelModalOpen: boolean;
  refundModalOpen: boolean;
}
