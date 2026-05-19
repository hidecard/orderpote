import React, { useEffect, useState } from 'react';
import { getSellers, getPlans, getSellerSubscriptionWithPlan, assignPlanToSeller, cancelSubscription, createPlan } from '../../lib/db';
import type { User, Plan, SubscriptionWithPlan } from '../../lib/schema';

export default function SellerManagement() {
  const [sellers, setSellers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState({ name: '', price_per_month: 0, trial_days: 10, description: '' });
  const [planCreating, setPlanCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([getSellers(), getPlans()]);
      setSellers(s);
      setPlans(p);
    } catch (err) {
      console.error('Error loading sellers or plans:', err);
    } finally {
      setLoading(false);
    }
  }

  async function refreshPlans() {
    try {
      const p = await getPlans();
      setPlans(p);
    } catch (err) {
      console.error(err);
    }
  }

  async function refreshSellers() {
    try {
      const s = await getSellers();
      setSellers(s);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreatePlan() {
    if (!newPlan.name.trim()) {
      alert('Please give the plan a name');
      return;
    }

    setPlanCreating(true);
    try {
      await createPlan({
        name: newPlan.name,
        price_per_month: newPlan.price_per_month,
        description: newPlan.description,
        trial_days: newPlan.trial_days,
      });
      setNewPlan({ name: '', price_per_month: 0, trial_days: 10, description: '' });
      await refreshPlans();
      alert('Plan created successfully');
    } catch (err) {
      console.error('Failed to create plan', err);
      alert('Failed to create plan');
    } finally {
      setPlanCreating(false);
    }
  }

  async function handleAssignPlan(userId: string, planId: string) {
    if (!confirm('Assign this plan to the seller?')) return;
    setActionLoading(userId);
    try {
      await assignPlanToSeller(userId, planId);
      alert('Plan assigned');
      await refreshSellers();
    } catch (err) {
      console.error('Failed to assign plan', err);
      alert('Failed to assign plan');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleStartTrial(userId: string, planId: string) {
    if (!confirm('Start a 10-day trial for this seller?')) return;
    setActionLoading(userId);
    try {
      await assignPlanToSeller(userId, planId, 10);
      alert('Trial started for 10 days');
      await refreshSellers();
    } catch (err) {
      console.error('Failed to start trial', err);
      alert('Failed to start trial');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancelSubscription(subscriptionId: string) {
    if (!confirm('Cancel this subscription?')) return;
    setActionLoading(subscriptionId);
    try {
      await cancelSubscription(subscriptionId);
      alert('Subscription cancelled');
      await refreshSellers();
    } catch (err) {
      console.error('Failed to cancel subscription', err);
      alert('Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold">Seller Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage seller subscriptions, trials, and pricing plans.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Sellers</h2>
              <p className="text-sm text-gray-500">Assign plans, start trials, and cancel subscriptions.</p>
            </div>
            <button onClick={refreshSellers} className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 transition-colors">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10">Loading sellers...</div>
          ) : sellers.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No sellers registered yet.</div>
          ) : (
            <div className="space-y-4">
              {sellers.map((seller) => (
                <SellerRow
                  key={seller.id}
                  seller={seller}
                  plans={plans}
                  actionLoading={actionLoading}
                  onAssign={async (planId) => await handleAssignPlan(seller.id, planId)}
                  onStartTrial={async (planId) => await handleStartTrial(seller.id, planId)}
                  onCancel={handleCancelSubscription}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Plan</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                <input
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Basic, Standard, Pro"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price / month</label>
                  <input
                    type="number"
                    value={newPlan.price_per_month}
                    onChange={(e) => setNewPlan({ ...newPlan, price_per_month: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trial Days</label>
                  <input
                    type="number"
                    value={newPlan.trial_days}
                    onChange={(e) => setNewPlan({ ...newPlan, trial_days: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  rows={3}
                  placeholder="Highlight key benefits"
                />
              </div>
              <button
                onClick={handleCreatePlan}
                disabled={planCreating}
                className="w-full rounded-lg bg-purple-600 px-4 py-3 text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {planCreating ? 'Creating plan...' : 'Create Plan'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
            {plans.length === 0 ? (
              <p className="text-sm text-gray-500">No plans created yet. Create one to assign sellers.</p>
            ) : (
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div key={plan.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold">{plan.name}</div>
                        <div className="text-sm text-gray-500">{plan.description || 'No description'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">{plan.price_per_month.toLocaleString()} Ks / mo</div>
                        <div className="text-sm text-gray-500">Trial: {plan.trial_days} days</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SellerRow({ seller, plans, actionLoading, onAssign, onStartTrial, onCancel }: {
  seller: User;
  plans: Plan[];
  actionLoading: string | null;
  onAssign: (planId: string) => Promise<void>;
  onStartTrial: (planId: string) => Promise<void>;
  onCancel: (subscriptionId: string) => Promise<void>;
}) {
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (plans.length > 0 && !selectedPlan) {
      setSelectedPlan(plans[0].id);
    }
  }, [plans, selectedPlan]);

  useEffect(() => {
    let mounted = true;
    async function loadSub() {
      setLoading(true);
      try {
        const sub = await getSellerSubscriptionWithPlan(seller.id);
        if (mounted) setSubscription(sub);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadSub();
    return () => { mounted = false; };
  }, [seller.id]);

  return (
    <div className="rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-semibold">{seller.name}</div>
          <div className="text-sm text-gray-500">{seller.email}</div>
          <div className="text-sm text-gray-600 mt-2">Joined: {new Date(seller.created_at).toLocaleDateString()}</div>
          <div className="mt-2 text-sm text-gray-700">
            {loading ? (
              'Checking subscription...'
            ) : subscription ? (
              <>
                <span className="font-medium">{subscription.plan_name || 'Subscribed'}</span>
                {' — '}Ends: {new Date(subscription.ends_at).toLocaleDateString()}
                {subscription.is_trial && <span className="text-yellow-600"> (Trial)</span>}
              </>
            ) : (
              <span className="text-gray-500">No active subscription</span>
            )}
          </div>
        </div>

        <div className="space-y-3 min-w-[240px]">
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {plans.length === 0 ? (
              <option value="">No plans available</option>
            ) : (
              plans.map((plan) => (
                <option key={plan.id} value={plan.id}>{plan.name} — {plan.price_per_month.toLocaleString()} Ks/mo</option>
              ))
            )}
          </select>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <button
              className="rounded-lg bg-purple-600 px-3 py-2 text-white text-sm hover:bg-purple-700 disabled:opacity-50"
              disabled={!selectedPlan || !!actionLoading}
              onClick={async () => await onAssign(selectedPlan)}
            >
              Assign
            </button>
            <button
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              disabled={!selectedPlan || !!actionLoading}
              onClick={async () => await onStartTrial(selectedPlan)}
            >
              Start Trial
            </button>
            {subscription && (
              <button
                className="rounded-lg bg-red-600 px-3 py-2 text-white text-sm hover:bg-red-700 disabled:opacity-50"
                disabled={!!actionLoading}
                onClick={async () => await onCancel(subscription.id)}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
