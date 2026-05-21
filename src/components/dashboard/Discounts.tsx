import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createCouponCode, deleteCouponCode, getCouponsBySellerId, updateCouponCode } from '../../lib/db';
import type { CouponCode } from '../../lib/schema';

export default function Discounts() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discount_percentage: 10,
    description: '',
    active: true,
    max_uses: 0,
    starts_at: '',
    ends_at: '',
  });

  useEffect(() => {
    async function loadCoupons() {
      if (!user) return;
      setLoading(true);
      try {
        const results = await getCouponsBySellerId(user.id);
        setCoupons(results);
      } catch (error) {
        console.error('Failed to fetch coupons', error);
      } finally {
        setLoading(false);
      }
    }

    loadCoupons();
  }, [user]);

  const refreshCoupons = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const results = await getCouponsBySellerId(user.id);
      setCoupons(results);
    } catch (error) {
      console.error('Failed to refresh coupons', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!user) return;
    if (!form.code.trim()) {
      alert('Please enter a coupon code.');
      return;
    }
    if (form.discount_percentage <= 0 || form.discount_percentage > 100) {
      alert('Discount percentage must be between 1 and 100.');
      return;
    }

    setCreating(true);
    try {
      await createCouponCode({
        seller_id: user.id,
        code: form.code.trim().toUpperCase(),
        discount_percentage: form.discount_percentage,
        description: form.description.trim() || undefined,
        active: form.active,
        max_uses: form.max_uses,
        starts_at: form.starts_at || undefined,
        ends_at: form.ends_at || undefined,
      });
      setForm({ code: '', discount_percentage: 10, description: '', active: true, max_uses: 0, starts_at: '', ends_at: '' });
      await refreshCoupons();
      alert('Coupon created successfully');
    } catch (error) {
      console.error('Failed to create coupon', error);
      alert('Failed to create coupon. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (coupon: CouponCode) => {
    try {
      await updateCouponCode(coupon.id, { active: !coupon.active });
      await refreshCoupons();
    } catch (error) {
      console.error('Failed to update coupon status', error);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Delete this coupon code?')) return;
    try {
      await deleteCouponCode(couponId);
      await refreshCoupons();
    } catch (error) {
      console.error('Failed to delete coupon', error);
      alert('Failed to delete coupon. Please try again.');
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Discounts & Coupon Codes</h1>
            <p className="text-sm text-gray-600 mt-1">Create promo codes and percentage discounts for your store.</p>
          </div>
          <button
            onClick={refreshCoupons}
            className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Your Coupon Codes</h2>
          {loading ? (
            <div className="text-sm text-gray-500">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className="text-sm text-gray-500">No coupon codes available. Create one to start offering discounts.</div>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{coupon.code}</p>
                      <p className="text-sm text-gray-600">{coupon.discount_percentage}% off</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {coupon.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  {coupon.description && <p className="mt-2 text-sm text-gray-600">{coupon.description}</p>}
                  <div className="mt-3 grid gap-2 text-sm text-gray-600">
                    <div>Uses: {coupon.uses}{coupon.max_uses > 0 ? ` / ${coupon.max_uses}` : ''}</div>
                    <div>Valid: {coupon.starts_at || 'Anytime'} – {coupon.ends_at || 'No end date'}</div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(coupon)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      {coupon.active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Create New Coupon</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                placeholder="E.g. SAVE15"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
              <input
                type="number"
                value={form.discount_percentage}
                onChange={(e) => setForm({ ...form, discount_percentage: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                min={1}
                max={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                rows={3}
                placeholder="Optional description for the discount"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Uses</label>
                <input
                  type="number"
                  value={form.max_uses}
                  onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  min={0}
                />
                <p className="mt-1 text-xs text-gray-500">0 means unlimited uses.</p>
              </div>
              <div className="flex items-end gap-2">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid From</label>
                <input
                  type="date"
                  value={form.starts_at}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                <input
                  type="date"
                  value={form.ends_at}
                  onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>
            <button
              type="button"
              disabled={creating}
              onClick={handleCreateCoupon}
              className="w-full rounded-lg bg-purple-600 px-4 py-3 text-white text-sm hover:bg-purple-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
