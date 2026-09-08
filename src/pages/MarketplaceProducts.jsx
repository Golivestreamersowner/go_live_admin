import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
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

const STATUS_OPTIONS = ['pending_review', '', 'draft', 'rejected', 'publishing', 'published', 'failed'];

const STATUS_BADGE = {
  draft: 'secondary',
  pending_review: 'default',
  rejected: 'destructive',
  publishing: 'default',
  published: 'default',
  failed: 'destructive',
};

const money = (cents) => `$${((cents ?? 0) / 100).toFixed(2)}`;

const MarketplaceProducts = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('pending_review');
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const limit = 20;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await marketplaceAdminService.getProducts({ page, limit, status: status || undefined });
      setItems(data.items);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="mt-1 text-sm text-gray-500">
          New products a streamer submits wait here for approval before they go live.
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
            <div className="p-6 text-sm text-gray-500">No products match this filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Variants</TableHead>
                    <TableHead>Price range</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((product) => {
                    const prices = (product.variants ?? []).map((v) => v.price);
                    const min = prices.length ? Math.min(...prices) : 0;
                    const max = prices.length ? Math.max(...prices) : 0;
                    return (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="font-medium text-gray-900">{product.title}</div>
                          <div className="text-xs text-gray-500">
                            Blueprint {product.blueprintId} · Provider {product.printProviderId}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{product.vendorId?.name || '—'}</div>
                          <div className="text-xs text-gray-500">{product.vendorId?.email || ''}</div>
                        </TableCell>
                        <TableCell>{product.variants?.length ?? 0}</TableCell>
                        <TableCell>
                          {min === max ? money(min) : `${money(min)} – ${money(max)}`}
                        </TableCell>
                        <TableCell>
                          {product.review?.submittedAt
                            ? new Date(product.review.submittedAt).toLocaleDateString()
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_BADGE[product.status] || 'secondary'}>
                            {product.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => setReviewing(product)}>
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

      {reviewing && (
        <ReviewDialog
          productId={reviewing._id}
          onClose={() => setReviewing(null)}
          onDecided={() => {
            setReviewing(null);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
};

const ReviewDialog = ({ productId, onClose, onDecided }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [markupType, setMarkupType] = useState('percent');
  const [markupValue, setMarkupValue] = useState('');
  const [enabledVariants, setEnabledVariants] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await marketplaceAdminService.getProduct(productId);
        if (cancelled) return;
        setProduct(data);
        setTitle(data.title);
        setDescription(data.description || '');
        setMarkupType(data.vendorMarkup?.type || 'percent');
        setMarkupValue(
          data.vendorMarkup?.type === 'percent'
            ? String(Math.round((data.vendorMarkup?.value ?? 0) * 100))
            : String(((data.vendorMarkup?.value ?? 0) / 100).toFixed(2)),
        );
        setEnabledVariants(
          Object.fromEntries((data.variants ?? []).map((v) => [v.variantId, v.isEnabled !== false])),
        );
      } catch (error) {
        toast.error('Failed to load product');
        onClose();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const buildEdits = () => {
    if (!product) return {};
    const n = Number(markupValue);
    const value = markupType === 'percent' ? n / 100 : Math.round(n * 100);
    return {
      title,
      description,
      blueprintId: product.blueprintId,
      printProviderId: product.printProviderId,
      vendorMarkup: { type: markupType, value },
      variants: (product.variants ?? []).map((v) => ({
        variantId: v.variantId,
        isEnabled: enabledVariants[v.variantId] !== false,
      })),
      printAreas: product.printAreas ?? [],
    };
  };

  const handleApprove = async () => {
    setSaving(true);
    try {
      await marketplaceAdminService.approveProduct(productId, buildEdits());
      toast.success('Product approved — publishing');
      onDecided();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve product');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) {
      toast.error('A rejection note is required');
      return;
    }
    setSaving(true);
    try {
      await marketplaceAdminService.rejectProduct(productId, rejectNote.trim());
      toast.success('Product rejected');
      onDecided();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review product</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-sm text-gray-500">Loading…</div>
        ) : product ? (
          <div className="space-y-5 py-2">
            <div className="text-sm text-gray-500">
              Submitted by <span className="font-medium text-gray-900">{product.vendorId?.name || '—'}</span>
              {product.vendorId?.email ? ` (${product.vendorId.email})` : ''}
              {product.review?.submittedAt && (
                <> · {new Date(product.review.submittedAt).toLocaleString()}</>
              )}
            </div>

            {!!product.printify?.mockups?.length && (
              <div>
                <Label>Product mockups</Label>
                <div className="mt-1 flex gap-2 overflow-x-auto pb-1">
                  {product.printify.mockups.map((m, idx) => (
                    <img
                      key={idx}
                      src={m.src}
                      alt={m.position || `Mockup ${idx + 1}`}
                      title={m.position}
                      className="h-28 w-28 shrink-0 rounded-md border border-gray-200 object-cover"
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="reviewTitle">Title</Label>
              <Input id="reviewTitle" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="reviewDescription">Description</Label>
              <Textarea
                id="reviewDescription"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <Label>Vendor markup</Label>
              <div className="flex gap-2">
                <select
                  className="border rounded-md px-3 py-2 text-sm"
                  value={markupType}
                  onChange={(e) => setMarkupType(e.target.value)}
                >
                  <option value="percent">%</option>
                  <option value="fixed">$</option>
                </select>
                <Input
                  type="number"
                  step="0.01"
                  value={markupValue}
                  onChange={(e) => setMarkupValue(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Variants &amp; pricing</Label>
              <div className="mt-1 max-h-56 overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Enabled</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Vendor keeps</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Retail price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(product.variants ?? []).map((v) => (
                      <TableRow key={v.variantId}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={enabledVariants[v.variantId] !== false}
                            onChange={(e) =>
                              setEnabledVariants((s) => ({ ...s, [v.variantId]: e.target.checked }))
                            }
                          />
                        </TableCell>
                        <TableCell>{v.title || `Variant ${v.variantId}`}</TableCell>
                        <TableCell>{money(v.costCents)}</TableCell>
                        <TableCell>{money(v.vendorMarkupCents)}</TableCell>
                        <TableCell>{money(v.platformCommissionCents)}</TableCell>
                        <TableCell className="font-medium">{money(v.price)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {showRejectForm && (
              <div>
                <Label htmlFor="rejectNote">Rejection note (shown to the vendor)</Label>
                <Textarea
                  id="rejectNote"
                  rows={3}
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="e.g. Description needs to mention material; markup exceeds the cap"
                />
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter>
          {showRejectForm ? (
            <>
              <Button variant="outline" onClick={() => setShowRejectForm(false)} disabled={saving}>
                Back
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={saving}>
                <X className="w-4 h-4 mr-2" />
                {saving ? 'Rejecting…' : 'Confirm reject'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="destructive" onClick={() => setShowRejectForm(true)} disabled={saving || loading}>
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button onClick={handleApprove} disabled={saving || loading}>
                <Check className="w-4 h-4 mr-2" />
                {saving ? 'Approving…' : 'Approve & publish'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarketplaceProducts;
