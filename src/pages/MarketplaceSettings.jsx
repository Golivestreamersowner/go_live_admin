import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { marketplaceAdminService } from '../services/marketplaceAdminService';

const MarketplaceSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [platformType, setPlatformType] = useState('percent');
  // percent edited as a whole number (20 = 20%); fixed edited as dollars ("3.00").
  const [platformValue, setPlatformValue] = useState('10');
  // Vendor cap is always a fraction of cost, edited as a whole percentage (20 = 20%).
  const [vendorPct, setVendorPct] = useState('20');
  // Flat tax estimate applied to subtotal at checkout, edited as a whole percentage (8 = 8%).
  const [taxPct, setTaxPct] = useState('0');
  const [requireProductApproval, setRequireProductApproval] = useState(true);
  const [requireBannerApproval, setRequireBannerApproval] = useState(true);
  const [savingApprovals, setSavingApprovals] = useState(false);
  const [themeColor, setThemeColor] = useState('#F62E1B');
  const [savingTheme, setSavingTheme] = useState(false);
  const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await marketplaceAdminService.getSettings();
        setPlatformType(data.platformMarkup?.type || 'percent');
        setPlatformValue(
          data.platformMarkup?.type === 'fixed'
            ? ((data.platformMarkup?.value ?? 0) / 100).toFixed(2)
            : String(Math.round((data.platformMarkup?.value ?? 0) * 100)),
        );
        setVendorPct(String(Math.round((data.vendorMarkupCapPct ?? 0) * 100)));
        setTaxPct(String(Math.round((data.taxRatePct ?? 0) * 100)));
        setRequireProductApproval(data.requireProductApproval ?? true);
        setRequireBannerApproval(data.requireBannerApproval ?? true);
        setThemeColor(data.themeColor || '#F62E1B');
      } catch (error) {
        toast.error('Failed to load marketplace settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const n = Number(platformValue);
    if (!Number.isFinite(n) || n < 0) {
      toast.error('Platform markup must be a number >= 0');
      return;
    }
    const vendorFraction = Number(vendorPct) / 100;
    if (!Number.isFinite(vendorFraction) || vendorFraction < 0) {
      toast.error('Vendor markup cap must be a number >= 0');
      return;
    }
    const taxFraction = Number(taxPct) / 100;
    if (!Number.isFinite(taxFraction) || taxFraction < 0 || taxFraction > 1) {
      toast.error('Tax rate must be a percentage between 0 and 100');
      return;
    }
    setSaving(true);
    try {
      await marketplaceAdminService.updateSettings({
        platformMarkup: {
          type: platformType,
          value: platformType === 'percent' ? n / 100 : Math.round(n * 100),
        },
        vendorMarkupCapPct: vendorFraction,
        taxRatePct: taxFraction,
      });
      toast.success('Settings saved');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleApprovalToggle = async (field, value) => {
    const setter = field === 'requireProductApproval' ? setRequireProductApproval : setRequireBannerApproval;
    const previous = field === 'requireProductApproval' ? requireProductApproval : requireBannerApproval;
    setter(value); // optimistic — feels instant, reverted below on failure
    setSavingApprovals(true);
    try {
      await marketplaceAdminService.updateSettings({ [field]: value });
      toast.success('Settings saved');
    } catch (error) {
      setter(previous);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSavingApprovals(false);
    }
  };

  const handleSaveTheme = async (e) => {
    e.preventDefault();
    if (!HEX_RE.test(themeColor)) {
      toast.error('Enter a valid 6-digit hex color, e.g. #F62E1B');
      return;
    }
    setSavingTheme(true);
    try {
      await marketplaceAdminService.updateSettings({ themeColor });
      toast.success('Theme color saved');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save theme color');
    } finally {
      setSavingTheme(false);
    }
  };

  // Live example so an admin can see exactly what the numbers mean before saving.
  const exampleCost = 15;
  const platformCut =
    platformType === 'percent' ? exampleCost * (Number(platformValue || 0) / 100) : Number(platformValue || 0);
  const vendorCut = exampleCost * (Number(vendorPct || 0) / 100);

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading settings…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketplace Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Controls the platform's own cut and how much a vendor may add on top.
        </p>
      </div>

      <Card className="max-w-xl">
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Pricing markup</CardTitle>
            <CardDescription>
              Both are applied on top of the product's manufacturing cost (from the Cost
              Table), not on top of the retail price. Final price = cost + vendor's markup +
              platform's markup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Your (platform) markup</Label>
              <div className="flex gap-2">
                <select
                  className="border rounded-md px-3 py-2 text-sm"
                  value={platformType}
                  onChange={(e) => setPlatformType(e.target.value)}
                >
                  <option value="percent">%</option>
                  <option value="fixed">$</option>
                </select>
                <Input
                  type="number"
                  min="0"
                  step={platformType === 'percent' ? '1' : '0.01'}
                  value={platformValue}
                  onChange={(e) => setPlatformValue(e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                The platform's guaranteed cut, added on top of cost — always recovered, no
                matter what the vendor charges on top of it.
              </p>
            </div>
            <div>
              <Label htmlFor="vendorPct">Vendor markup cap (%)</Label>
              <Input
                id="vendorPct"
                type="number"
                min="0"
                step="1"
                value={vendorPct}
                onChange={(e) => setVendorPct(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                The most a vendor may add on top of cost for their own margin (a fraction of
                cost, whether the vendor expresses their own rule as % or a flat $ amount).
              </p>
            </div>

            <div className="rounded-md bg-gray-50 border p-4 text-sm">
              <p className="font-medium text-gray-900 mb-1">Example — $15.00 cost item</p>
              <p className="text-gray-600">
                You keep <span className="font-semibold text-gray-900">${platformCut.toFixed(2)}</span>; a vendor
                can add up to <span className="font-semibold text-gray-900">${vendorCut.toFixed(2)}</span> more —
                final price up to{' '}
                <span className="font-semibold text-gray-900">
                  ${(exampleCost + platformCut + vendorCut).toFixed(2)}
                </span>
                .
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save settings'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="max-w-xl">
        <form onSubmit={handleSaveTheme}>
          <CardHeader>
            <CardTitle>Shop theme color</CardTitle>
            <CardDescription>
              The accent color used throughout the mobile app's shop section — buttons, prices,
              selected filters. Defaults to the app's own brand color; change it here to give
              the shop section a different look without a code change.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={HEX_RE.test(themeColor) ? themeColor : '#F62E1B'}
                onChange={(e) => setThemeColor(e.target.value.toUpperCase())}
                className="h-10 w-14 cursor-pointer rounded-md border p-1"
                aria-label="Pick shop theme color"
              />
              <Input
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                placeholder="#F62E1B"
                className="w-32 font-mono"
                maxLength={7}
              />
              <span
                className="rounded-full px-4 py-1.5 text-sm font-semibold text-white"
                style={{ backgroundColor: HEX_RE.test(themeColor) ? themeColor : '#ccc' }}
              >
                Preview
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={savingTheme}>
              {savingTheme ? 'Saving…' : 'Save theme color'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="max-w-xl">
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Buyer tax estimate</CardTitle>
            <CardDescription>
              Our fulfillment partner has no way to quote real tax before an order is placed,
              so this flat rate is charged to the buyer at checkout as an estimate. The actual
              amount the fulfillment partner charges is compared against it afterward and
              flagged as a margin warning on the Orders page if it ran over.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="taxPct">Tax rate (%)</Label>
              <Input
                id="taxPct"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxPct}
                onChange={(e) => setTaxPct(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Applied to each vendor's subtotal (not shipping) at checkout. Set to 0 to
                collect no tax.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save settings'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Admin review</CardTitle>
          <CardDescription>
            Turn either of these off to let submissions go live immediately, with no admin
            step at all. Takes effect right away for new submissions — anything already
            sitting in review is unaffected.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Require approval for new products</p>
              <p className="mt-0.5 text-xs text-gray-500">
                When off, a vendor hitting "Publish" goes straight to the marketplace.
              </p>
            </div>
            <Switch
              checked={requireProductApproval}
              disabled={savingApprovals}
              onCheckedChange={(v) => handleApprovalToggle('requireProductApproval', v)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Require approval for shop banners</p>
              <p className="mt-0.5 text-xs text-gray-500">
                When off, a vendor's uploaded banner goes live immediately.
              </p>
            </div>
            <Switch
              checked={requireBannerApproval}
              disabled={savingApprovals}
              onCheckedChange={(v) => handleApprovalToggle('requireBannerApproval', v)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketplaceSettings;
