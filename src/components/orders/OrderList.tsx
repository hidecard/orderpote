import { useState } from 'react';
import { Search, Download, CheckCircle, Truck, Image as ImageIcon } from 'lucide-react';
import type { Order } from '../../lib/schema';

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-001',
      product_id: 'prod-1',
      customer_name: 'John Doe',
      customer_phone: '09123456789',
      customer_address: '123 Main St',
      customer_region: 'Yangon',
      customer_township: 'Bahan',
      quantity: 2,
      total_price: 50000,
      payment_status: 'pending',
      delivery_status: 'pending',
      payment_screenshot_url: 'https://via.placeholder.com/400x600?text=Screenshot',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ORD-002',
      product_id: 'prod-2',
      customer_name: 'Jane Smith',
      customer_phone: '09987654321',
      customer_address: '456 Oak Ave',
      customer_region: 'Mandalay',
      customer_township: 'Chan Aye Thar Zan',
      quantity: 1,
      total_price: 35000,
      payment_status: 'paid',
      delivery_status: 'preparing',
      delivery_service: 'Royal Express',
      tracking_id: 'RE123456789',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState<'all' | 'pending' | 'paid' | 'failed'>('all');
  const [filterDelivery, setFilterDelivery] = useState<'all' | 'pending' | 'preparing' | 'shipped' | 'delivered'>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showScreenshot, setShowScreenshot] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery);
    const matchesPayment =
      filterPayment === 'all' || order.payment_status === filterPayment;
    const matchesDelivery =
      filterDelivery === 'all' || order.delivery_status === filterDelivery;
    return matchesSearch && matchesPayment && matchesDelivery;
  });

  const updatePaymentStatus = (orderId: string, status: 'pending' | 'paid' | 'failed') => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, payment_status: status } : order
      )
    );
  };

  const updateDeliveryStatus = (orderId: string, status: 'pending' | 'preparing' | 'shipped' | 'delivered') => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, delivery_status: status } : order
      )
    );
  };


  const exportOrders = () => {
    // TODO: Implement CSV/Excel export
    alert('Exporting selected orders...');
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        {selectedOrders.length > 0 && (
          <button
            onClick={exportOrders}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export Selected ({selectedOrders.length})
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Search by name, order ID, or phone..."
          />
        </div>
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={filterDelivery}
          onChange={(e) => setFilterDelivery(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Delivery Status</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders(filteredOrders.map((o) => o.id));
                      } else {
                        setSelectedOrders([]);
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Order ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Customer</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Total</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Payment</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Delivery</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
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
                        if (e.target.checked) {
                          setSelectedOrders([...selectedOrders, order.id]);
                        } else {
                          setSelectedOrders(selectedOrders.filter((id) => id !== order.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{order.id}</td>
                  <td className="px-4 py-3">{order.customer_name}</td>
                  <td className="px-4 py-3">{order.customer_phone}</td>
                  <td className="px-4 py-3 font-semibold">{order.total_price.toLocaleString()} Ks</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
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
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        )}
      </div>

      {/* Screenshot Lightbox */}
      {showScreenshot && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
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
