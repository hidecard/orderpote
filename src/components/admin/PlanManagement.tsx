import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import type { Plan } from '../../lib/schema';
import { getPlans, createPlan, updatePlan, deletePlan } from '../../lib/db';

export default function PlanManagement() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price_monthly: 0,
    price_yearly: 0,
    trial_days: 10,
    description: '',
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      alert('Plans ကို ရယူရာတွင် အမှားအယွင်းရှိနေပါသည်။');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.price_monthly < 0 || formData.price_yearly < 0) {
      alert('ကျေးဇူးပြု၍ လိုအပ်သည့် အချက်အလက်များကို ဖြည့်စွက်ပါ။');
      return;
    }

    try {
      if (editingId) {
        await updatePlan(editingId, formData);
        alert('Plan အောင်မြင်စွာ အဆင့်မြှင့်တင်ပြီးပါပြီ။');
      } else {
        await createPlan(formData as Omit<Plan, 'id' | 'created_at'>);
        alert('Plan အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ။');
      }
      
      setFormData({ name: '', price_monthly: 0, price_yearly: 0, trial_days: 10, description: '' });
      setEditingId(null);
      setShowForm(false);
      await fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Plan သိမ်းဆည်းရာတွင် အမှားအယွင်းရှိနေပါသည်။');
    }
  };

  const handleEdit = (plan: Plan) => {
    setFormData({
      name: plan.name,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      trial_days: plan.trial_days,
      description: plan.description || '',
    });
    setEditingId(plan.id);
    setShowForm(true);
  };

  const handleDelete = async (planId: string) => {
    if (confirm('ဤ Plan ကို ဖျက်ရန် သေချာပါသလား?')) {
      try {
        await deletePlan(planId);
        alert('Plan အောင်မြင်စွာ ဖျက်ပြီးပါပြီ။');
        await fetchPlans();
      } catch (error) {
        console.error('Error deleting plan:', error);
        alert('Plan ဖျက်ရာတွင် အမှားအယွင်းရှိနေပါသည်။');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', price_monthly: 0, price_yearly: 0, trial_days: 10, description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1a7f8c]/20 border-t-[#1a7f8c]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-black text-gray-900">Plan စီမံခန့်ခွဲမှု</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#1a7f8c] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#156a75] transition-colors"
          >
            <Plus className="w-5 h-5" /> Plan အသစ်ထည့်သွင်းရန်
          </button>
        </div>
        <p className="text-gray-500 font-medium">လစ်စဉ်/နှစ်စဉ် ကြေးနှုန်းများ၊ Trial သက်တမ်းများကို စီမံခန့်ခွဲပါ</p>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            {editingId ? 'Plan ပြင်ဆင်ရန်' : 'Plan အသစ်ဖန်တီးရန်'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">Plan အမည် *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1a7f8c] focus:bg-white outline-none font-medium"
                  placeholder="ဥပမာ - Starter, Professional, Enterprise"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">Trial ရက်အရေအတွက် *</label>
                <input
                  type="number"
                  value={formData.trial_days}
                  onChange={(e) => setFormData({ ...formData, trial_days: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1a7f8c] focus:bg-white outline-none font-medium"
                  placeholder="10"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">လစ်စဉ်ကြေးနှုန်း (Kyats) *</label>
                <input
                  type="number"
                  value={formData.price_monthly}
                  onChange={(e) => setFormData({ ...formData, price_monthly: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1a7f8c] focus:bg-white outline-none font-medium"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">နှစ်စဉ်ကြေးနှုန်း (Kyats) *</label>
                <input
                  type="number"
                  value={formData.price_yearly}
                  onChange={(e) => setFormData({ ...formData, price_yearly: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1a7f8c] focus:bg-white outline-none font-medium"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">အကျဉ်းချုပ်</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1a7f8c] focus:bg-white outline-none font-medium"
                placeholder="Plan အကြောင်းအကျဉ်း..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 bg-[#1a7f8c] text-white py-3 rounded-xl font-black hover:bg-[#156a75] transition-colors"
              >
                <Save className="w-5 h-5" /> သိမ်းဆည်းရန်
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-600 py-3 rounded-xl font-black hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" /> ပယ်ဖျက်ရန်
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">Trial: {plan.trial_days} ရက်</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 border-t border-gray-100 pt-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">လစ်စဉ်ကြေးနှုန်း</p>
                <p className="text-2xl font-black text-[#1a7f8c]">{plan.price_monthly.toLocaleString()} K</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">နှစ်စဉ်ကြေးနှုန်း</p>
                <p className="text-2xl font-black text-[#1a7f8c]">{plan.price_yearly.toLocaleString()} K</p>
              </div>
              {plan.description && (
                <div className="pt-2">
                  <p className="text-sm text-gray-600 font-medium">{plan.description}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <p className="text-gray-500 font-bold text-lg">Plan များ မရှိသေးပါ။ အသစ်ထည့်သွင်းရန် အပေါ်ရှိ ခလုတ်ကို နှိပ်ပါ။</p>
        </div>
      )}
    </div>
  );
}
