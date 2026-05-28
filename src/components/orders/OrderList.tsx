import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Download, Image as ImageIcon, Search, Truck } from 'lucide-react';
import type { Order } from '../../lib/schema';
import { useAuth } from '../../context/AuthContext';
import { getOrdersBySellerId, updateOrderDeliveryStatus, updateOrderPaymentStatus } from '../../lib/db';

type PaymentFilter = 'all' | 'pending' | 'paid' | 'failed';
type DeliveryFilter = 'all' | 'pending' | 'preparing' | 'shipped' | 'delivered';

export default function OrderList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState<PaymentFilter>('all');
  const [filterDelivery, setFilterDelivery] = useState<DeliveryFilter>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showScreenshot, setShowScreenshot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrders() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const orderData = await getOrdersBySellerId(user.id);
        if (isMounted) setOrders(orderData);
      } catch (error) {
        console.error('Error fetching seller orders:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_phone.includes(searchQuery);
      const matchesPayment = filterPayment === 'all' || order.payment_status === filterPayment;
      const matchesDelivery = filterDelivery === 'all' || order.delivery_status === filterDelivery;
      return matchesSearch && matchesPayment && matchesDelivery;
    });
  }, [filterDelivery, filterPayment, orders, searchQuery]);

  const updatePaymentStatus = async (orderId: string, status: 'pending' | 'paid' | 'failed') => {
    await updateOrderPaymentStatus(orderId, status);
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, payment_status: status } : order
      )
    );
  };

  const updateDeliveryStatus = async (orderId: string, status: 'pending' | 'preparing' | 'shipped' | 'delivered') => {
    await updateOrderDeliveryStatus(orderId, status);
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, delivery_status: status } : order
      )
    );
  };

  const exportOrders = () => {
    const rows = filteredOrders
      .filter((order) => selectedOrders.length === 0 || selectedOrders.includes(order.id))
      .map((order) => [
        order.id,
        order.customer_name,
        order.customer_phone,
        order.total_price,
        order.delivery_fee || 0,
        order.payment_method || 'prepaid',
        order.payment_status,
        order.delivery_status,
        order.created_at,
      ]);
    const csv = [['Order ID', 'Customer', 'Phone', 'Total', 'Delivery Fee', 'Payment Method', 'Payment', 'Delivery', 'Created At'], ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'orders.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      preparing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">အော်ဒါများ</h1>
          <p className="text-gray-600 mt-1">သင့်မျှဝေထားသော ပစ္စည်းလင့်ခ်များမှ အော်ဒါများ</p>
        </div>
        <button
          onClick={exportOrders}
          disabled={filteredOrders.length === 0}
          className="flex items-center justify-center gap-2 bg-[#1a7f8c] text-white px-6 py-3 rounded-lg hover:bg-[#156a75] transition-colors disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          CSV တင်ပို့မည်
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
            placeholder="အမည်၊ အော်ဒါ ID သို့မဟုတ် ဖုန်းနံပါတ်ဖြင့် ရှာဖွေရန်..."
          />
        </div>
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value as PaymentFilter)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
        >
          <option value="all">ငွေပေးချေမှု အခြေအနေအားလုံး</option>
          <option value="pending">စောင့်ဆိုင်းဆဲ</option>
          <option value="paid">ပေးပြီးပြီ</option>
          <option value="failed">မအောင်မြင်ပါ</option>
        </select>
        <select
          value={filterDelivery}
          onChange={(e) => setFilterDelivery(e.target.value as DeliveryFilter)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
        >
          <option value="all">ပို့ဆောင်မှု အခြေအနေအားလုံး</option>
          <option value="pending">စောင့်ဆိုင်းဆဲ</option>
          <option value="preparing">ပြင်ဆင်နေသည်</option>
          <option value="shipped">ပို့ပြီးပြီ</option>
          <option value="delivered">ပေးပြီးပြီ</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    onChange={(e) => {
                      setSelectedOrders(e.target.checked ? filteredOrders.map((order) => order.id) : []);
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">အော်ဒါ ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">ဝယ်ယူသူ</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">ဖုန်း</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">စုစုပေါင်း</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">ငွေပေးချေမှု</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">ပို့ဆောင်မှု</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">လုပ်ဆောင်ချက်များ</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => {
                        setSelectedOrders((current) =>
                          e.target.checked
                            ? [...current, order.id]
                            : current.filter((id) => id !== order.id)
                        );
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <a href={`/orders/${order.id}`} className="text-[#1a7f8c] hover:text-[#156a75]">
                      {order.id}
                    </a>
                  </td>
                  <td className="px-4 py-3">{order.customer_name}</td>
                  <td className="px-4 py-3">{order.customer_phone}</td>
                  <td className="px-4 py-3 font-semibold">{order.total_price.toLocaleString()} ကျပ်</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                    <div className="mt-1 text-xs font-semibold text-gray-500">
                      {order.payment_method === 'cod' ? 'COD' : 'Prepaid'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.delivery_status)}`}>
                      {order.delivery_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {order.payment_screenshot_url && (
                        <button
                          onClick={() => setShowScreenshot(order.payment_screenshot_url || null)}
                          className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                          title="View Screenshot"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      )}
                      {order.payment_method === 'cod' && (
                        <span className="rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                          COD
                        </span>
                      )}
                      {order.payment_status === 'pending' && (
                        <button
                          onClick={() => updatePaymentStatus(order.id, 'paid')}
                          className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100"
                          title="Mark as Paid"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {order.delivery_status === 'pending' && (
                        <button
                          onClick={() => updateDeliveryStatus(order.id, 'preparing')}
                          className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                          title="Start Preparing"
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">အော်ဒါမတွေ့ပါ</p>
          </div>
        )}
      </div>

      {showScreenshot && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
          onClick={() => setShowScreenshot(null)}
        >
          <div className="max-w-4xl max-h-[90vh] p-4">
            <img
              src={showScreenshot}
              alt="Payment Screenshot"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
