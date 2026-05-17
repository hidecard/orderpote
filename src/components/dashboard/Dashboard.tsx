import { DollarSign, ShoppingCart, Clock, Eye } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { getDashboardStats, getSalesData, getTopProducts, getProductViews } from '../../lib/db';

export default function Dashboard() {
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalViews: 0,
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);
  const [productViews, setProductViews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [stats, sales, topProducts, views] = await Promise.all([
          getDashboardStats('user-123'), // TODO: Get actual user ID from auth
          getSalesData(7),
          getTopProducts(5),
          getProductViews(10),
        ]);

        setKpiData(stats);
        setSalesData(sales);
        setTopProductsData(topProducts);
        setProductViews(views);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpiData.totalRevenue.toLocaleString()} Ks
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">+12.5% from last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{kpiData.totalOrders}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">+8.2% from last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{kpiData.pendingOrders}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-yellow-600 mt-2">Needs attention</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Page Views</p>
              <p className="text-2xl font-bold text-gray-900">{kpiData.totalViews}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">+15.3% from last month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Sales Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Pie Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
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

      {/* Product Views Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Product Traffic</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Product Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Page Views</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Orders</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {productViews.map((product, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4">{product.name}</td>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    {product.views}
                  </td>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-gray-400" />
                    {product.orders}
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      {((product.orders / product.views) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
