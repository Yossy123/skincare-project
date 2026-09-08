'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  fetchAdminOrderDetail,
  adminProcessOrder,
  adminShipOrder,
  adminDeliverOrder,
  adminCompleteOrder,
  adminCancelOrder,
  adminRefundOrder,
  AdminOrderDetail,
} from '@/lib/api';

export function useAdminOrderDetail(orderId: number, token: string | null) {
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId && token));
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!token || !orderId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminOrderDetail(orderId, token);
      setOrder(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load order details';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token, orderId]);

  useEffect(() => {
    let isMounted = true;
    if (!token || !orderId) {
      return;
    }

    fetchAdminOrderDetail(orderId, token)
      .then((data) => {
        if (isMounted) {
          setOrder(data);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load order details';
          setError(msg);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, orderId]);

  const handleProcess = async () => {
    if (!token || !order) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await adminProcessOrder(order.id, token);
      setOrder(updated);
      setSuccessMessage(`Order #${order.id} status updated to PROCESSING.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process order';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleShip = async (payload: { tracking_number: string; courier: string; service: string }) => {
    if (!token || !order) return false;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await adminShipOrder(order.id, payload, token);
      setOrder(updated);
      setSuccessMessage(`Order #${order.id} marked as SHIPPED with Tracking #${payload.tracking_number}.`);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to ship order';
      setError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliver = async () => {
    if (!token || !order) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await adminDeliverOrder(order.id, token);
      setOrder(updated);
      setSuccessMessage(`Order #${order.id} confirmed as DELIVERED.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to deliver order';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!token || !order) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await adminCompleteOrder(order.id, token);
      setOrder(updated);
      setSuccessMessage(`Order #${order.id} marked as COMPLETED.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete order';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (payload: { reason: string; note?: string }) => {
    if (!token || !order) return false;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await adminCancelOrder(order.id, payload, token);
      setOrder(updated);
      setSuccessMessage(`Order #${order.id} has been cancelled and stock restored.`);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel order';
      setError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async (payload: { reason: string; amount?: number }) => {
    if (!token || !order) return false;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await adminRefundOrder(order.id, payload, token);
      setOrder(updated);
      const refundedAmountStr = Number(payload.amount || order.total).toLocaleString('id-ID');
      setSuccessMessage(`Refund of Rp ${refundedAmountStr} processed via Midtrans.`);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process refund';
      setError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    order,
    loading,
    actionLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    loadOrder,
    handleProcess,
    handleShip,
    handleDeliver,
    handleComplete,
    handleCancel,
    handleRefund,
  };
}
