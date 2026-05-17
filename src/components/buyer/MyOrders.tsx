import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Package, Truck, ChevronRight } from 'lucide-react';
import type { Order } from '../../lib/schema';
import { getOrdersByCustomerPhone } from '../../lib/db';

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true);
      try {
        // Get phone from localStorage (stored during checkout)
        const lastPhone = localStorage.getItem('orderpote_last_phone');
        if (lastPhone) {
          const ordersData = await getOrdersByCustomerPhone(lastPhone);
          setOrders(ordersData);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending: Clock,
      paid: CheckCircle,
      preparing: Package,
      shipped: Truck,
      delivered: CheckCircle,
    };
    return icons[status] || Clock;
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">No orders yet</p>
            <p className="text-gray-500 mt-2">Your order history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = getStatusIcon(order.delivery_status);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => (window.location.href = `/order/${order.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <StatusIcon className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold">{order.id}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product</span>
                      <span className="font-semibold">Premium Cotton T-Shirt</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total</span>
                      <span className="font-bold text-purple-600">{order.total_price.toLocaleString()} Ks</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          order.delivery_status
                        )}`}
                      >
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
