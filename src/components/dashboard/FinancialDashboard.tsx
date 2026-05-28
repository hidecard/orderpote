import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Package, Download, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getFinancialStats, getProfitByDate, getProfitByProduct, getFinancialReportData } from '../../lib/db';

const COLORS = ['#1a7f8c', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function FinancialDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProductCost: 0,
    totalDeliveryCost: 0,
    totalCost: 0,
    netProfit: 0,
    totalOrders: 0,
    profitMargin: '0.00',
  });
  const [profitByDate, setProfitByDate] = useState<any[]>([]);
  const [profitByProduct, setProfitByProduct] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // 30 days default
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    async function fetchFinancialData() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const [financialStats, profitDate, profitProduct] = await Promise.all([
          getFinancialStats(user.id),
          getProfitByDate(user.id, parseInt(dateRange)),
          getProfitByProduct(user.id, 10),
        ]);

        setStats(financialStats);
        setProfitByDate(profitDate);
        setProfitByProduct(profitProduct);
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFinancialData();
  }, [user, dateRange]);

  const handleExportCSV = async () => {
    if (!user) return;

    try {
      const reportData = await getFinancialReportData(
        user.id,
        startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate || new Date().toISOString().split('T')[0]
      );

      const headers = ['Order ID', 'Product Name', 'Customer Name', 'Quantity', 'Revenue (Ks)', 'Product Cost (Ks)', 'Delivery Fee (Ks)', 'Profit (Ks)', 'Payment Status', 'Delivery Status', 'Date'];
      const csvContent = [
        headers.join(','),
        ...reportData.map(row => [
          row.orderId,
          `"${row.productName}"`,
          `"${row.customerName}"`,
          row.quantity,
          row.revenue,
          row.productCost,
          row.deliveryFee,
          row.profit,
          row.paymentStatus,
          row.deliveryStatus,
          row.createdAt,
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a7f8c]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">ငွေကြေး ဒက်ရှ်ဘုတ် (Financial Dashboard)</h1>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-[#1a7f8c] text-white px-4 py-2 rounded-lg hover:bg-[#156a75] transition-colors"
        >
          <Download className="w-4 h-4" />
          CSV Export
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">ကာလရွေးချယ်ရန်:</span>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
          >
            <option value="7">ရက် ၇ ရက်</option>
            <option value="30">ရက် ၃၀ ရက်</option>
            <option value="90">ရက် ၉၀ ရက်</option>
            <option value="365">တစ်နှစ်</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
            />
            <span className="text-gray-500">မှ</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">စုစုပေါင်း ဝင်ငွေ (Revenue)</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalRevenue.toLocaleString()} ကျပ်
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">ပေးပြီးအော်ဒါများသာ</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ပစ္စည်းကုန်ကျစရိတ် (COGS)</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalProductCost.toLocaleString()} ကျပ်
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">ရင်းနှီးစျေးနှုန်း</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ပို့ဆောင်ခကုန်ကျစရိတ် (Delivery)</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalDeliveryCost.toLocaleString()} ကျပ်
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <TrendingDown className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">ပို့ဆောင်ခများ</p>
        </div>

        <div className={`bg-white rounded-xl shadow-md p-6 ${stats.netProfit >= 0 ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">စစ်မှန်သော အသားတင်အမြတ် (Net Profit)</p>
              <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.netProfit.toLocaleString()} ကျပ်
              </p>
            </div>
            <div className={`p-3 rounded-full ${stats.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {stats.netProfit >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">အမြတ်ရာခိုင်နှုန်း: {stats.profitMargin}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Profit Over Time Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">အမြတ် မျဉ်းကွက် (Profit Trend)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={profitByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="ဝင်ငွေ" />
              <Line type="monotone" dataKey="productCost" stroke="#ef4444" strokeWidth={2} name="ပစ္စည်းကုန်ကျစရိတ်" />
              <Line type="monotone" dataKey="deliveryCost" stroke="#f59e0b" strokeWidth={2} name="ပို့ဆောင်ခ" />
              <Line type="monotone" dataKey="profit" stroke="#1a7f8c" strokeWidth={3} name="အသားတင်အမြတ်" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Profit by Product Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">ပစ္စည်းအလိုက် အမြတ် (Profit by Product)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profitByProduct}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="profit" fill="#1a7f8c" name="အသားတင်အမြတ်" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Breakdown Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">ကုန်ကျစရိတ် ခွဲခြမ်းစိတ် (Cost Breakdown)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'ပစ္စည်းကုန်ကျစရိတ်', value: stats.totalProductCost },
                  { name: 'ပို့ဆောင်ခ', value: stats.totalDeliveryCost },
                  { name: 'အသားတင်အမြတ်', value: stats.netProfit > 0 ? stats.netProfit : 0 },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">အမြတ်အကောင်းဆုံး ပစ္စည်းများ (Top Profitable Products)</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">ပစ္စည်း</th>
                  <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">ဝင်ငွေ</th>
                  <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">အသားတင်အမြတ်</th>
                  <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">အော်ဒါ</th>
                </tr>
              </thead>
              <tbody>
                {profitByProduct.slice(0, 5).map((product, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm">{product.productName}</td>
                    <td className="py-2 px-3 text-sm text-right">{product.revenue.toLocaleString()}</td>
                    <td className={`py-2 px-3 text-sm text-right font-semibold ${product.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.profit.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-sm text-right">{product.ordersCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">အချက်အလက်များ (Details)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">စုစုပေါင်း ကုန်ကျစရိတ်</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCost.toLocaleString()} ကျပ်</p>
            <p className="text-sm text-gray-500">ပစ္စည်း + ပို့ဆောင်ခ</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">စုစုပေါင်း အော်ဒါ</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            <p className="text-sm text-gray-500">ပေးပြီးအော်ဒါများ</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ပျမ်းမျှ အော်ဒါတန်ဖိုး</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(0).toLocaleString() : 0} ကျပ်
            </p>
            <p className="text-sm text-gray-500">တစ်အော်ဒါလျှင်</p>
          </div>
        </div>
      </div>
    </div>
  );
}
