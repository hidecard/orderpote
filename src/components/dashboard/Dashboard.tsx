import { DollarSign, ShoppingCart, Clock, Eye, CreditCard, AlertCircle } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { getDashboardStats, getSalesData, getTopProducts, getLeastSellingProducts, getLowStockVariants, getSellerSubscriptionWithPlan } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import type { SubscriptionWithPlan } from '../../lib/schema';

type SalesDataPoint = { name: string; sales: number };
type TopProductDataPoint = { name: string; value: number; color: string };
// Product view widget moved to separate page; removed inline ProductViewDataPoint

export default function Dashboard() {
  const { user } = useAuth();
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalViews: 0,
  });
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [topProductsData, setTopProductsData] = useState<TopProductDataPoint[]>([]);
  // productViews removed from dashboard (moved to dedicated page)
  const [leastProducts, setLeastProducts] = useState<TopProductDataPoint[]>([]);
  const [lowStock, setLowStock] = useState<{ variant_id: string; product_name: string; variant_name: string; stock: number }[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const [stats, sales, topProducts, least, low, sub] = await Promise.all([
          getDashboardStats(user.id),
          getSalesData(user.id, 7),
          getTopProducts(user.id, 5),
          getLeastSellingProducts(user.id, 5),
          getLowStockVariants(user.id, 5),
          getSellerSubscriptionWithPlan(user.id),
        ]);

        setKpiData(stats);
        setSalesData(sales);
        setTopProductsData(topProducts);
        setLeastProducts(least);
        setLowStock(low);
        setSubscription(sub);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a7f8c]"></div>
      </div>
    );
  }

  // Calculate days remaining for subscription/trial
  const getDaysRemaining = () => {
    if (!subscription) return null;
    const now = new Date();
    const ends = new Date(subscription.ends_at);
    const daysRemaining = Math.ceil((ends.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  };

  const daysRemaining = getDaysRemaining();
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">ဒက်ရှ်ဘုတ်</h1>

      {/* Subscription Status Alert */}
      {subscription && (
        <div className={`mb-6 rounded-xl p-4 flex items-start gap-4 border ${
          isExpired 
            ? 'bg-red-50 border-red-200' 
            : isExpiringSoon 
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-[#1a7f8c]/10 border-[#1a7f8c]/30'
        }`}>
          <div className={`p-2 rounded-lg ${
            isExpired
              ? 'bg-red-100'
              : isExpiringSoon
              ? 'bg-yellow-100'
              : 'bg-[#1a7f8c]/20'
          }`}>
            {isExpired ? (
              <AlertCircle className={`w-6 h-6 ${
                isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-[#1a7f8c]'
              }`} />
            ) : (
              <CreditCard className={`w-6 h-6 ${
                isExpiringSoon ? 'text-yellow-600' : 'text-[#1a7f8c]'
              }`} />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`font-bold ${
              isExpired
                ? 'text-red-900'
                : isExpiringSoon
                ? 'text-yellow-900'
                : 'text-[#1a7f8c]'
            }`}>
              {subscription.is_trial ? 'စမ်းသပ်ကာလ' : 'စာရင်းသွင်း'} အခြေအနေ
            </h3>
            <p className={`text-sm mt-1 ${
              isExpired
                ? 'text-red-700'
                : isExpiringSoon
                ? 'text-yellow-700'
                : 'text-[#1a7f8c]/80'
            }`}>
              {isExpired ? (
                <>သင့်{subscription.is_trial ? 'စမ်းသပ်ကာလ' : 'စာရင်းသွင်း'} ကာလကုန်ဆုံးပြီးပါပြီ။ ဆက်လက်အသုံးပြုရန် ပြန်လည်စာရင်းသွင်းပါ။</>
              ) : (
                <>
                  <strong>{subscription.plan_name}</strong> - နေ့ {daysRemaining} ရက် ကျန်ရှိသည်
                  {isExpiringSoon && ' - မကြာမီ ကုန်ဆုံးမည်!'}
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">စုစုပေါင်း ဝင်ငွေ</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpiData.totalRevenue.toLocaleString()} ကျပ်
              </p>
            </div>
            <div className="bg-[#1a7f8c]/10 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-[#1a7f8c]" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">ငွေပေးပြီး အော်ဒါများသာ</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">စုစုပေါင်း အော်ဒါများ</p>
              <p className="text-2xl font-bold text-gray-900">{kpiData.totalOrders}</p>
            </div>
            <div className="bg-[#1a7f8c]/10 p-3 rounded-full">
              <ShoppingCart className="w-6 h-6 text-[#1a7f8c]" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">သင့်ပစ္စည်းများမှ အော်ဒါအားလုံး</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">စောင့်ဆိုင်းဆဲ အော်ဒါများ</p>
              <p className="text-2xl font-bold text-gray-900">{kpiData.pendingOrders}</p>
            </div>
            <div className="bg-[#1a7f8c]/10 p-3 rounded-full">
              <Clock className="w-6 h-6 text-[#1a7f8c]" />
            </div>
          </div>
          <p className="text-sm text-[#1a7f8c] mt-2">ဆက်လက်လုပ်ဆောင်ရန် လိုအပ်သည်</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">စုစုပေါင်း ကြည့်ရှုမှုများ</p>
              <p className="text-2xl font-bold text-gray-900">{kpiData.totalViews}</p>
            </div>
            <div className="bg-[#1a7f8c]/10 p-3 rounded-full">
              <Eye className="w-6 h-6 text-[#1a7f8c]" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">ပစ္စည်းစာမျက်နှာ လာရောက်မှုများ</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">အရောင်း မျဉ်းကွက်</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#1a7f8c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Pie Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">အရောင်းအကောင်းဆုံး ပစ္စည်းများ</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topProductsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {topProductsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Traffic moved to a dedicated page (/product-traffic) */}

      {/* Seller Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">အရောင်းအကောင်းဆုံး</h2>
          {topProductsData[0] ? (
            <div>
              <p className="text-sm text-gray-600">{topProductsData[0].name}</p>
              <p className="text-2xl font-bold text-gray-900">{topProductsData[0].value} အော်ဒါ</p>
            </div>
          ) : (
            <p className="text-gray-500">အရောင်းမရှိသေးပါ</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">အရောင်းနည်းဆုံး</h2>
          {leastProducts.length === 0 ? (
            <p className="text-gray-500">ဒေတာမရှိပါ</p>
          ) : (
            <ul className="space-y-2">
              {leastProducts.map((p, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{p.name}</span>
                  <span className="text-sm text-gray-500">{p.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">စတော့နည်းနေသည်</h2>
          {lowStock.length === 0 ? (
            <p className="text-gray-500">စတော့ကုန်ဆုံးနီးသော ပစ္စည်းမရှိပါ</p>
          ) : (
            <ul className="space-y-2">
              {lowStock.map((v) => (
                <li key={v.variant_id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{v.product_name}</p>
                    <p className="text-xs text-gray-500">{v.variant_name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-sm ${v.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                    {v.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
