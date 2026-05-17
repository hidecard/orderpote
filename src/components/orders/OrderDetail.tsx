import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Truck, Package, Image as ImageIcon, Download } from 'lucide-react';
import { Order } from '../../lib/schema';

interface OrderDetailProps {
  orderId: string;
  onBack: () => void;
}

export default function OrderDetail({ orderId, onBack }: OrderDetailProps) {
  const [order, setOrder] = useState<Order>({
    id: orderId,
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
  });
  const [deliveryService, setDeliveryService] = useState('');
  const [trackingId, setTrackingId] = useState(order.tracking_id || '');

  const updatePaymentStatus = (status: 'pending' | 'paid' | 'failed') => {
    setOrder({ ...order, payment_status: status });
  };

  const updateDeliveryStatus = (status: 'pending' | 'preparing' | 'shipped' | 'delivered') => {
    setOrder({ ...order, delivery_status: status });
  };

  const saveDeliveryDetails = () => {
    setOrder({
      ...order,
      delivery_service: deliveryService,
      tracking_id,
    });
    alert('Delivery details saved!');
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
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Orders
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Order Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-semibold">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer Name</p>
              <p className="font-semibold">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold">{order.customer_phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-semibold">{order.customer_address}</p>
              <p className="text-sm text-gray-600">
                {order.customer_region}, {order.customer_township}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quantity</p>
              <p className="font-semibold">{order.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Price</p>
              <p className="font-semibold text-2xl">{order.total_price.toLocaleString()} Ks</p>
            </div>
          </div>
        </div>

        {/* Status and Actions */}
        <div className="space-y-6">
          {/* Payment Status */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Status</h2>
            <div className="flex items-center justify-between mb-4">
              <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(order.payment_status)}`}>
                {order.payment_status.toUpperCase()}
              </span>
            </div>

            {order.payment_screenshot_url && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Payment Screenshot</p>
                <div className="relative">
                  <img
                    src={order.payment_screenshot_url}
                    alt="Payment Screenshot"
                    className="w-full h-48 object-cover rounded-lg cursor-pointer"
                  />
                  <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-100">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {order.payment_status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => updatePaymentStatus('paid')}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Paid
                </button>
                <button
                  onClick={() => updatePaymentStatus('failed')}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  Mark as Failed
                </button>
              </div>
            )}
          </div>

          {/* Delivery Status */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Delivery Status</h2>
            <div className="flex items-center justify-between mb-4">
              <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(order.delivery_status)}`}>
                {order.delivery_status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => updateDeliveryStatus('preparing')}
                disabled={order.delivery_status !== 'pending'}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Package className="w-5 h-5" />
                Start Preparing
              </button>
              <button
                onClick={() => updateDeliveryStatus('shipped')}
                disabled={order.delivery_status !== 'preparing'}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Truck className="w-5 h-5" />
                Mark as Shipped
              </button>
              <button
                onClick={() => updateDeliveryStatus('delivered')}
                disabled={order.delivery_status !== 'shipped'}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                Mark as Delivered
              </button>
            </div>
          </div>

          {/* Delivery Details */}
          {(order.delivery_status === 'preparing' || order.delivery_status === 'shipped') && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Service
                  </label>
                  <select
                    value={deliveryService}
                    onChange={(e) => setDeliveryService(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select service...</option>
                    <option value="Royal Express">Royal Express</option>
                    <option value="Shop.com.mm">Shop.com.mm</option>
                    <option value="KMD">KMD</option>
                    <option value="Sun Express">Sun Express</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking ID
                  </label>
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter tracking number"
                  />
                </div>
                <button
                  onClick={saveDeliveryDetails}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
