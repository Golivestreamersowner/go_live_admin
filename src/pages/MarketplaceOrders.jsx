import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Ban, Eye } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { marketplaceAdminService } from '../services/marketplaceAdminService';

const STATUS_OPTIONS = ['', 'pending', 'submitted', 'in_production', 'shipped', 'delivered', 'cancelled', 'failed'];

const STATUS_BADGE = {
  pending: 'secondary',
  submitted: 'default',
  in_production: 'default',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'secondary',
  failed: 'destructive',
};

// Cancelling only makes sense before a sale is fully wrapped up — a
// delivered or already-cancelled order has nothing left to reverse.
const CANCELLABLE_STATUSES = ['pending', 'submitted', 'in_production', 'shipped', 'failed'];

const money = (cents) => `$${((cents ?? 0) / 100).toFixed(2)}`;

const MarketplaceOrders = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [viewTargetId, setViewTargetId] = useState(null);
  const limit = 20;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await marketplaceAdminService.getOrders({ page, limit, status: status || undefined });
      setItems(data.items);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketplace Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          Every vendor's suborders across the whole marketplace.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700" htmlFor="statusFilter">
              Status
            </label>
            <select
              id="statusFilter"
              className="border rounded-md px-3 py-1.5 text-sm"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s || 'all'} value={s}>
                  {s ? s.replace(/_/g, ' ') : 'All statuses'}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Loading…</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">No orders match this filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Platform profit</TableHead>
                    <TableHead>Vendor payout</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{order.vendorId?.name || '—'}</TableCell>
                      <TableCell>{order.buyerId?.name || '—'}</TableCell>
                      <TableCell>
                        {order.items?.reduce((n, i) => n + i.quantity, 0) ?? 0}
                      </TableCell>
                      <TableCell>{money(order.subtotal)}</TableCell>
                      <TableCell>{money(order.platformMarkup)}</TableCell>
                      <TableCell>{money(order.vendorPayout)}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE[order.status] || 'secondary'}>
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                        {order.printify?.marginWarning && (
                          <Badge variant="destructive" className="ml-1">
                            margin loss
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setViewTargetId(order._id)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {CANCELLABLE_STATUSES.includes(order.status) && (
                          <Button variant="ghost" size="sm" onClick={() => setCancelTarget(order)}>
                            <Ban className="w-4 h-4 mr-1 text-red-500" />
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <span className="text-sm text-gray-500">
          Page {page} of {pages}
        </span>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>

      {cancelTarget && (
        <CancelDialog
          order={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onCancelled={() => {
            setCancelTarget(null);
            fetchOrders();
          }}
        />
      )}

      {viewTargetId && (
        <OrderDetailDialog orderId={viewTargetId} onClose={() => setViewTargetId(null)} />
      )}
    </div>
  );
};

const OrderDetailDialog = ({ orderId, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    marketplaceAdminService
      .getOrderDetail(orderId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load order details');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const addr = detail?.shippingAddress;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Order details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-6 text-sm text-gray-500">Loading…</div>
        ) : error ? (
          <div className="py-6 text-sm text-red-600">{error}</div>
        ) : (
          <div className="space-y-4 py-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Status</span>
              <Badge variant={STATUS_BADGE[detail.status] || 'secondary'}>
                {detail.status.replace(/_/g, ' ')}
              </Badge>
            </div>

            <div>
              <h3 className="mb-1 font-medium text-gray-900">Customer</h3>
              <p className="text-gray-700">{detail.buyerId?.name || '—'}</p>
              <p className="text-gray-500">{detail.buyerId?.email || '—'}</p>
            </div>

            <div>
              <h3 className="mb-1 font-medium text-gray-900">Payment</h3>
              <p className="text-gray-700">{detail.payment?.method}</p>
              {detail.payment?.payerName || detail.payment?.payerEmail ? (
                <p className="text-gray-500">
                  Paid by {detail.payment?.payerName || '—'}
                  {detail.payment?.payerEmail ? ` (${detail.payment.payerEmail})` : ''}
                </p>
              ) : (
                <p className="text-gray-400">Payer identity not available for this order.</p>
              )}
            </div>

            <div>
              <h3 className="mb-1 font-medium text-gray-900">Shipping address</h3>
              {addr ? (
                <div className="text-gray-700">
                  <p>
                    {addr.firstName} {addr.lastName}
                  </p>
                  <p>{addr.email}</p>
                  {addr.phone && <p>{addr.phone}</p>}
                  <p>{addr.address1}</p>
                  {addr.address2 && <p>{addr.address2}</p>}
                  <p>
                    {addr.city}
                    {addr.region ? `, ${addr.region}` : ''} {addr.zip}
                  </p>
                  <p>{addr.country}</p>
                </div>
              ) : (
                <p className="text-gray-400">No shipping address on file.</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                No separate billing address is collected — PayPal handles billing on its own side;
                the payer identity above is the closest equivalent we have.
              </p>
            </div>

            <div>
              <h3 className="mb-1 font-medium text-gray-900">Items</h3>
              <ul className="space-y-1">
                {(detail.items || []).map((item, idx) => (
                  <li key={idx} className="flex justify-between text-gray-700">
                    <span>
                      {item.title} × {item.quantity}
                    </span>
                    <span>{money(item.unitPrice * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{money(detail.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span>{money(detail.shippingPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax</span>
                <span>{money(detail.taxPrice)}</span>
              </div>
              <div className="mt-1 flex justify-between font-medium text-gray-900">
                <span>Vendor payout</span>
                <span>{money(detail.vendorPayout)}</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CancelDialog = ({ order, onClose, onCancelled }) => {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      toast.error('A cancellation reason is required');
      return;
    }
    setSaving(true);
    try {
      await marketplaceAdminService.cancelSuborder(order._id, reason.trim());
      toast.success('Order cancelled and buyer refunded');
      onCancelled();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setSaving(false);
    }
  };

  const refundAmount = (order.subtotal ?? 0) + (order.shippingPrice ?? 0);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this order?</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2 text-sm">
          <p className="text-gray-600">
            This refunds <span className="font-semibold text-gray-900">{money(refundAmount)}</span>{' '}
            to the buyer via PayPal (this vendor's share only), attempts to cancel the
            fulfillment order, and reverses the vendor's payout if it was already credited.
          </p>
          <div>
            <Label htmlFor="cancelReason">Reason (required)</Label>
            <Textarea
              id="cancelReason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Buyer requested cancellation, item out of stock"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Back
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={saving}>
            {saving ? 'Cancelling…' : 'Confirm cancel & refund'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarketplaceOrders;
