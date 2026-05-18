import { useEffect, useState } from 'react';
import { CheckCircle, ChevronRight, Clock, Package, Search, Truck } from 'lucide-react';
import type { Order } from '../../lib/schema';
import { getOrdersByCustomerPhone, getProductById } from '../../lib/db';

type OrderWithProductName = Order & { product_name?: string };

export default function MyOrders() {
  const [orders, setOrders] = useState<OrderWithProductName[]>([]);
  const [phone, setPhone] = useState(localStorage.getItem('orderpote_last_phone') || '');
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async (phoneNumber: string) => {
    if (!phoneNumber.trim()) return;

    setIsLoading(true);
    try {
      const ordersData = await getOrdersByCustomerPhone(phoneNumber.trim());
      const ordersWithProducts = await Promise.all(
        ordersData.map(async (order) => {
          const product = await getProductById(order.product_id);
          return { ...order, product_name: product?.name || 'Product' };
        })
      );
      setOrders(ordersWithProducts);
      localStorage.setItem('orderpote_last_phone', phoneNumber.trim());
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const lastPhone = localStorage.getItem('orderpote_last_phone');
    if (lastPhone) {
      Promise.resolve().then(() => fetchOrders(lastPhone));
    }
  }, []);

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      paid: CheckCircle,
      preparing: Package,
      shipped: Truck,
      delivered: CheckCircle,
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      preparing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            fetchOrders(phone);
          }}
          className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col sm:flex-row gap-3"
        >
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter phone number used at checkout"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-purple-600 text-white px-5 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            Find Orders
          </button>
        </form>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">No orders found</p>
            <p className="text-gray-500 mt-2">Enter the phone number used when placing the order.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = getStatusIcon(order.delivery_status);
              return (
                <button
                  key={order.id}
                  type="button"
                  className="w-full text-left bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
                  onClick={() => (window.location.href = `/order-tracking/${order.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <StatusIcon className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold">{order.id}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Product</span>
                      <span className="font-semibold text-right">{order.product_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total</span>
                      <span className="font-bold text-purple-600">{order.total_price.toLocaleString()} Ks</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.delivery_status)}`}>
                        {order.delivery_status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date</span>
                      <span className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('my-MM', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
