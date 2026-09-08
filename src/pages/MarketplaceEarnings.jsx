import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { marketplaceAdminService } from '../services/marketplaceAdminService';

const money = (cents) => `$${((cents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const StatCard = ({ label, value, hint }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </CardContent>
  </Card>
);

const MarketplaceEarnings = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await marketplaceAdminService.getEarnings({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setSummary(data);
    } catch (error) {
      toast.error('Failed to load earnings summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketplace Earnings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform profit is the guaranteed markup only — recovered cost is a pass-through
          to fulfillment, not profit.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              fetchSummary();
            }}
          >
            <div>
              <Label htmlFor="startDate">From</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="endDate">To</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button type="submit">Apply</Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Orders" value={summary.orderCount} />
            <StatCard label="Suborders" value={summary.suborderCount} />
            <StatCard
              label="Platform profit"
              value={money(summary.platformProfitCents)}
              hint="Guaranteed markup, always kept"
            />
            <StatCard
              label="Vendor payouts"
              value={money(summary.vendorPayoutCents)}
              hint="What vendors earned above the floor price"
            />
            <StatCard
              label="Cost recovered"
              value={money(summary.platformCostCents)}
              hint="Pass-through to fulfillment — not profit"
            />
            <StatCard label="Shipping collected" value={money(summary.shippingCents)} />
            <StatCard label="Product subtotal" value={money(summary.subtotalCents)} />
            <StatCard
              label="Margin warnings"
              value={
                <span className="flex items-center gap-1">
                  {summary.marginWarningCount}
                  {summary.marginWarningCount > 0 && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                </span>
              }
              hint="Orders where the fulfillment partner's actual bill exceeded what was collected"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Orders by status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {Object.entries(summary.statusBreakdown).map(([key, count]) => (
                  <div key={key} className="text-sm">
                    <span className="font-semibold text-gray-900">{count}</span>{' '}
                    <span className="text-gray-500">{key.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default MarketplaceEarnings;
