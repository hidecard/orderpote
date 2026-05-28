import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Image as ImageIcon, Package, Truck, XCircle } from 'lucide-react';
import type { Order } from '../../lib/schema';
import { getOrderById, updateOrderDeliveryStatus, updateOrderPaymentStatus } from '../../lib/db';

interface OrderDetailProps {
  orderId: string;
  onBack: () => void;
}

export default function OrderDetail({ orderId, onBack }: OrderDetailProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [deliveryService, setDeliveryService] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showScreenshot, setShowScreenshot] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrder() {
      try {
        const orderData = await getOrderById(orderId);
        if (!isMounted) return;

        setOrder(orderData);
        setDeliveryService(orderData?.delivery_service || '');
        setTrackingId(orderData?.tracking_id || '');
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const updatePaymentStatus = async (status: 'pending' | 'paid' | 'failed') => {
    if (!order) return;
    await updateOrderPaymentStatus(order.id, status);
    setOrder({ ...order, payment_status: status });
  };

  const updateDeliveryStatus = async (status: 'pending' | 'preparing' | 'shipped' | 'delivered') => {
    if (!order) return;
    await updateOrderDeliveryStatus(order.id, status, deliveryService, trackingId);
    setOrder({ ...order, delivery_status: status, delivery_service: deliveryService, tracking_id: trackingId });
  };

  const saveDeliveryDetails = async () => {
    if (!order) return;
    await updateOrderDeliveryStatus(order.id, order.delivery_status, deliveryService, trackingId);
    setOrder({ ...order, delivery_service: deliveryService, tracking_id: trackingId });
    alert('Delivery details saved');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-5 h-5" />
          Back to Orders
        </button>
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600">This order may have been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-5 h-5" />
        Back to Orders
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <p className="text-sm text-gray-500">Delivery Fee: {(order.delivery_fee || 0).toLocaleString()} Ks</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Status</h2>
            <span className={`inline-block px-4 py-2 rounded-full font-semibold mb-4 ${getStatusColor(order.payment_status)}`}>
              {order.payment_status.toUpperCase()}
            </span>
            <p className="mb-4 text-sm font-semibold text-gray-700">
              Method: {order.payment_method === 'cod' ? 'COD' : 'Prepaid'}
            </p>

            {order.payment_screenshot_url ? (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Payment Screenshot</p>
                <button
                  type="button"
                  onClick={() => setShowScreenshot(true)}
                  className="relative block w-full"
                >
                  <img
                    src={order.payment_screenshot_url}
                    alt="Payment Screenshot"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <span className="absolute top-2 right-2 bg-white p-2 rounded-full shadow">
                    <ImageIcon className="w-4 h-4" />
                  </span>
                </button>
              </div>
            ) : (
              <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                {order.payment_method === 'cod'
                  ? 'Cash on Delivery order. No payment screenshot required.'
                  : 'No payment screenshot uploaded.'}
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

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Delivery Status</h2>
            <span className={`inline-block px-4 py-2 rounded-full font-semibold mb-4 ${getStatusColor(order.delivery_status)}`}>
              {order.delivery_status.toUpperCase()}
            </span>

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

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Service</label>
                <input
                  type="text"
                  value={deliveryService}
                  onChange={(e) => setDeliveryService(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Royal Express, KMD, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tracking ID</label>
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
        </div>
      </div>

      {showScreenshot && order.payment_screenshot_url && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
          onClick={() => setShowScreenshot(false)}
        >
          <div className="max-w-4xl max-h-[90vh] p-4">
            <img
              src={order.payment_screenshot_url}
              alt="Payment Screenshot"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
