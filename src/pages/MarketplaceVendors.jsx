import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Ban, CheckCircle2, Search } from 'lucide-react';
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

const money = (cents) => `$${((cents ?? 0) / 100).toFixed(2)}`;

const MarketplaceVendors = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [suspended, setSuspended] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const limit = 20;

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const data = await marketplaceAdminService.getVendors({ page, limit, search, suspended });
      setItems(data.items);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, suspended]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchVendors();
  };

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <p className="mt-1 text-sm text-gray-500">
          Every streamer eligible to sell on the marketplace. Suspend a vendor to immediately
          block new products or edits — their existing dashboard, orders, and earnings stay
          visible to them either way.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <Input
                placeholder="Search name, email, or username…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
              <Button type="submit" variant="outline" size="sm">
                <Search className="w-4 h-4" />
              </Button>
            </form>
            <select
              className="border rounded-md px-3 py-1.5 text-sm"
              value={suspended}
              onChange={(e) => {
                setPage(1);
                setSuspended(e.target.value);
              }}
            >
              <option value="">All vendors</option>
              <option value="false">Active only</option>
              <option value="true">Suspended only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Loading…</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">No vendors match this filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Pending review</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total payout</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((v) => (
                    <TableRow key={v._id}>
                      <TableCell>
                        <div className="font-medium text-gray-900">{v.name}</div>
                        <div className="text-xs text-gray-500">{v.email}</div>
                      </TableCell>
                      <TableCell>{v.productCount}</TableCell>
                      <TableCell>{v.publishedCount}</TableCell>
                      <TableCell>{v.pendingReviewCount}</TableCell>
                      <TableCell>{v.orderCount}</TableCell>
                      <TableCell>{money(v.totalPayoutCents)}</TableCell>
                      <TableCell>
                        <Badge variant={v.marketplaceSuspended ? 'destructive' : 'default'}>
                          {v.marketplaceSuspended ? 'Suspended' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setSelectedVendorId(v._id)}>
                          Manage
                        </Button>
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

      {selectedVendorId && (
        <VendorDetailDialog
          vendorId={selectedVendorId}
          onClose={() => setSelectedVendorId(null)}
          onChanged={() => {
            setSelectedVendorId(null);
            fetchVendors();
          }}
        />
      )}
    </div>
  );
};

const VendorDetailDialog = ({ vendorId, onClose, onChanged }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [reason, setReason] = useState('');
  const [bannerSaving, setBannerSaving] = useState(false);
  const [showRejectBannerForm, setShowRejectBannerForm] = useState(false);
  const [bannerRejectNote, setBannerRejectNote] = useState('');

  const loadDetail = async () => {
    try {
      const data = await marketplaceAdminService.getVendor(vendorId);
      setDetail(data);
      return data;
    } catch (error) {
      toast.error('Failed to load vendor');
      onClose();
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadDetail();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  const handleApproveBanner = async () => {
    setBannerSaving(true);
    try {
      await marketplaceAdminService.approveBanner(vendorId);
      toast.success('Banner approved');
      await loadDetail();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve banner');
    } finally {
      setBannerSaving(false);
    }
  };

  const handleRejectBanner = async () => {
    if (!bannerRejectNote.trim()) {
      toast.error('A rejection note is required');
      return;
    }
    setBannerSaving(true);
    try {
      await marketplaceAdminService.rejectBanner(vendorId, bannerRejectNote.trim());
      toast.success('Banner rejected');
      setShowRejectBannerForm(false);
      setBannerRejectNote('');
      await loadDetail();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject banner');
    } finally {
      setBannerSaving(false);
    }
  };

  const handleSuspend = async () => {
    if (!reason.trim()) {
      toast.error('A reason is required to suspend a vendor');
      return;
    }
    setSaving(true);
    try {
      await marketplaceAdminService.setVendorSuspended(vendorId, true, reason.trim());
      toast.success('Vendor suspended');
      onChanged();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to suspend vendor');
    } finally {
      setSaving(false);
    }
  };

  const handleReinstate = async () => {
    setSaving(true);
    try {
      await marketplaceAdminService.setVendorSuspended(vendorId, false);
      toast.success('Vendor reinstated');
      onChanged();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reinstate vendor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vendor</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-sm text-gray-500">Loading…</div>
        ) : detail ? (
          <div className="space-y-5 py-2">
            <div>
              <p className="font-medium text-gray-900">{detail.vendor.name}</p>
              <p className="text-sm text-gray-500">{detail.vendor.email}</p>
              <div className="mt-2">
                <Badge variant={detail.vendor.marketplaceSuspended ? 'destructive' : 'default'}>
                  {detail.vendor.marketplaceSuspended ? 'Suspended' : 'Active'}
                </Badge>
              </div>
              {detail.vendor.marketplaceSuspended && detail.vendor.marketplaceSuspensionReason && (
                <p className="mt-2 rounded-md bg-red-50 p-2 text-xs text-red-700">
                  <span className="font-medium">Suspension reason:</span>{' '}
                  {detail.vendor.marketplaceSuspensionReason}
                </p>
              )}
            </div>

            {detail.vendor.marketplaceBanner?.url && (
              <div>
                <Label>Shop banner</Label>
                <div className="mt-1 space-y-2">
                  <img
                    src={detail.vendor.marketplaceBanner.url}
                    alt="Shop banner"
                    className="w-full max-h-40 rounded-md border object-cover"
                  />
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        detail.vendor.marketplaceBanner.status === 'approved'
                          ? 'default'
                          : detail.vendor.marketplaceBanner.status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {detail.vendor.marketplaceBanner.status}
                    </Badge>
                    {detail.vendor.marketplaceBanner.status === 'pending' && !showRejectBannerForm && (
                      <>
                        <Button size="sm" onClick={handleApproveBanner} disabled={bannerSaving}>
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setShowRejectBannerForm(true)}
                          disabled={bannerSaving}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                  {detail.vendor.marketplaceBanner.status === 'rejected' &&
                    detail.vendor.marketplaceBanner.rejectionNote && (
                      <p className="rounded-md bg-red-50 p-2 text-xs text-red-700">
                        <span className="font-medium">Rejection reason:</span>{' '}
                        {detail.vendor.marketplaceBanner.rejectionNote}
                      </p>
                    )}
                  {showRejectBannerForm && (
                    <div className="space-y-2">
                      <Textarea
                        rows={2}
                        value={bannerRejectNote}
                        onChange={(e) => setBannerRejectNote(e.target.value)}
                        placeholder="e.g. Image is low resolution, unrelated to the shop"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setShowRejectBannerForm(false)} disabled={bannerSaving}>
                          Cancel
                        </Button>
                        <Button size="sm" variant="destructive" onClick={handleRejectBanner} disabled={bannerSaving}>
                          {bannerSaving ? 'Rejecting…' : 'Confirm reject'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md border p-3">
                <p className="text-lg font-semibold text-gray-900">{detail.products.length}</p>
                <p className="text-xs text-gray-500">Products</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-lg font-semibold text-gray-900">{detail.suborders.length}</p>
                <p className="text-xs text-gray-500">Orders</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-lg font-semibold text-gray-900">{money(detail.totalPayoutCents)}</p>
                <p className="text-xs text-gray-500">Total payout</p>
              </div>
            </div>

            <div>
              <Label>Recent products</Label>
              <div className="mt-1 max-h-40 overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-xs text-gray-500">
                          No products yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      detail.products.map((p) => (
                        <TableRow key={p._id}>
                          <TableCell>{p.title}</TableCell>
                          <TableCell>{p.status.replace(/_/g, ' ')}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {showSuspendForm && (
              <div>
                <Label htmlFor="suspendReason">Reason (required)</Label>
                <Textarea
                  id="suspendReason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Repeated trademark violations, counterfeit designs"
                />
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter>
          {showSuspendForm ? (
            <>
              <Button variant="outline" onClick={() => setShowSuspendForm(false)} disabled={saving}>
                Back
              </Button>
              <Button variant="destructive" onClick={handleSuspend} disabled={saving}>
                <Ban className="w-4 h-4 mr-2" />
                {saving ? 'Suspending…' : 'Confirm suspend'}
              </Button>
            </>
          ) : detail?.vendor.marketplaceSuspended ? (
            <Button onClick={handleReinstate} disabled={saving || loading}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {saving ? 'Reinstating…' : 'Reinstate vendor'}
            </Button>
          ) : (
            <Button variant="destructive" onClick={() => setShowSuspendForm(true)} disabled={saving || loading}>
              <Ban className="w-4 h-4 mr-2" />
              Suspend vendor
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarketplaceVendors;
