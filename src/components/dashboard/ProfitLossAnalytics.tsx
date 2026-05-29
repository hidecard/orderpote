import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStaffAuth } from '../../context/StaffAuthContext';
import { getStoreByUserId, calculateProfitLoss } from '../../lib/db';

interface ProfitLossData {
  totalRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  netProfit: number;
  orderCount: number;
}

interface ProfitLossAnalyticsProps {
  sellerId?: string;
}

export default function ProfitLossAnalytics({ sellerId: propSellerId }: ProfitLossAnalyticsProps) {
  const { user } = useAuth();
  const { staff } = useStaffAuth();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month');
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfitLoss() {
      // Get the seller ID from prop, user, or staff
      const sellerId = propSellerId || (user ? user.id : (staff ? staff.store_id : null));
      
      if (!sellerId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const store = await getStoreByUserId(sellerId);
        if (!store) return;

        const now = new Date();
        let startDate: string;
        let endDate: string = now.toISOString();

        if (period === 'today') {
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          startDate = startOfDay.toISOString();
        } else if (period === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          startDate = weekAgo.toISOString();
        } else {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          startDate = monthAgo.toISOString();
        }

        const profitLoss = await calculateProfitLoss(store.id, startDate, endDate);
        setData(profitLoss);
      } catch (error) {
        console.error('Error fetching profit loss:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfitLoss();
  }, [user, staff, period, propSellerId]);

  if (isLoading || !data) {
    return null;
  }

  const profitMargin = data.totalRevenue > 0 ? ((data.grossProfit / data.totalRevenue) * 100).toFixed(1) : '0';
  const isProfitable = data.netProfit >= 0;

  const formatDate = () => {
    if (period === 'today') return 'ယနေ့';
    if (period === 'week') return 'ရက်သတ္တပတ်';
    if (period === 'month') return 'လတစ်လ';
    return '';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a7f8c]/10 p-2 rounded-full">
            <DollarSign className="w-6 h-6 text-[#1a7f8c]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">အမြတ်အစွန်း ဘဏ္ဍာရေး ခွဲခြမ်းစိတ်ဖြာမှု</h3>
            <p className="text-sm text-gray-600">Profit & Loss Analytics</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              period === 'today' ? 'bg-[#1a7f8c] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ယနေ့
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              period === 'week' ? 'bg-[#1a7f8c] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ရက်သတ္တပတ်
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              period === 'month' ? 'bg-[#1a7f8c] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            လတစ်လ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">စုစုပေါင်း ရောင်းရငွေ</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-700">{data.totalRevenue.toLocaleString()} Ks</p>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">စုစုပေါင်း COGS</span>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-700">{data.totalCOGS.toLocaleString()} Ks</p>
        </div>

        <div className={`rounded-lg p-4 border ${isProfitable ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">အသားတင်အမြတ် (Gross Profit)</span>
            {isProfitable ? <TrendingUp className="w-4 h-4 text-blue-600" /> : <TrendingDown className="w-4 h-4 text-orange-600" />}
          </div>
          <p className={`text-2xl font-bold ${isProfitable ? 'text-blue-700' : 'text-orange-700'}`}>
            {data.grossProfit.toLocaleString()} Ks
          </p>
        </div>

        <div className={`rounded-lg p-4 border ${isProfitable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">အမြတ်အစွန်း (Net Profit)</span>
            {isProfitable ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
          </div>
          <p className={`text-2xl font-bold ${isProfitable ? 'text-green-700' : 'text-red-700'}`}>
            {data.netProfit.toLocaleString()} Ks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">အော်ဒါ အရေအတွက် ({formatDate()})</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{data.orderCount} ခု</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">အမြတ်အစွန်း ရာခိုင်နှုန်း</span>
          </div>
          <p className={`text-xl font-bold ${isProfitable ? 'text-green-700' : 'text-red-700'}`}>
            {profitMargin}%
          </p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-[#1a7f8c]/10 rounded-lg">
        <p className="text-sm text-[#1a7f8c]">
          <strong>မှတ်ချက်:</strong> COGS တွက်ချက်မှုသည် Moving Average COGS စနစ်ကို အသုံးပြုထားပါသည်။ 
          သွင်းဈေး ပြောင်းလဲလာသည်နှင့်အမျှ COGS သည် အလိုအလျောက် ပြောင်းလဲသွားပါမည်။
        </p>
      </div>
    </div>
  );
}
