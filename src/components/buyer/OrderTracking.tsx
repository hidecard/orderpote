import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Package, Truck, Download, ExternalLink, RefreshCw } from 'lucide-react';
import type { Order } from '../../lib/schema';
import { getOrderById } from '../../lib/db';

interface OrderTrackingProps {
  orderId: string;
}

export default function OrderTracking({ orderId }: OrderTrackingProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      setIsLoading(true);
      try {
        const orderData = await getOrderById(orderId);
        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order:', error);
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();

    // Set up real-time updates (polling)
    const interval = setInterval(() => {
      fetchOrder();
    }, 10000);

    return () => clearInterval(interval);
  }, [orderId]);

  const getStatusStep = (status: string) => {
    const steps: Record<string, number> = {
      pending: 0,
      paid: 1,
      preparing: 2,
      shipped: 3,
      delivered: 4,
    };
    return steps[status] || 0;
  };

  const generatePDF = () => {
    // TODO: Implement PDF generation
    alert('PDF generation will be implemented with jsPDF library');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600">This order may not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(order.delivery_status);

  const timelineSteps = [
    { key: 'pending', label: 'Pending', icon: Clock, description: 'Order placed, awaiting payment verification' },
    { key: 'paid', label: 'Paid', icon: CheckCircle, description: 'Payment verified successfully' },
    { key: 'preparing', label: 'Preparing', icon: Package, description: 'Order is being prepared for shipment' },
    { key: 'shipped', label: 'Shipped', icon: Truck, description: 'Order has been shipped' },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle, description: 'Order has been delivered' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Receipt</h1>
              <p className="text-gray-600">Order ID: {order.id}</p>
            </div>
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Order placed on {new Date(order.created_at).toLocaleDateString('my-MM', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <h2 className="text-xl font-semibold mb-6">Order Status</h2>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div
              className="absolute left-4 top-0 w-0.5 bg-purple-600 transition-all duration-500"
              style={{ height: `${(currentStep / (timelineSteps.length - 1)) * 100}%` }}
            ></div>

            {/* Timeline Steps */}
            <div className="space-y-8">
              {timelineSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div key={step.key} className="relative flex items-start gap-4">
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <StepIcon className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold ${
                          isCurrent ? 'text-purple-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Product</span>
              <span className="font-semibold">Premium Cotton T-Shirt</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Variant</span>
              <span className="font-semibold">Size: M, Color: Black</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity</span>
              <span className="font-semibold">{order.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Price</span>
              <span className="font-bold text-purple-600">{order.total_price.toLocaleString()} Ks</span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name</span>
              <span className="font-semibold">{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone</span>
              <span className="font-semibold">{order.customer_phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Address</span>
              <span className="font-semibold text-right">{order.customer_address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Region/Township</span>
              <span className="font-semibold">{order.customer_region}, {order.customer_township}</span>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        {order.delivery_status === 'shipped' && order.delivery_service && order.tracking_id && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-4">
            <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Service</span>
                <span className="font-semibold">{order.delivery_service}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tracking ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{order.tracking_id}</span>
                  <button
                    onClick={() => {
                      // TODO: Open tracking link based on delivery service
                      window.open(`https://www.royalexpress.com.mm/tracking/${order.tracking_id}`, '_blank');
                    }}
                    className="p-1 bg-purple-100 rounded hover:bg-purple-200 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-purple-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Status */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">Payment Status</h2>
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                order.payment_status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            ></div>
            <span className="font-semibold capitalize">{order.payment_status}</span>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => {
            // TODO: Refresh order data
            window.location.reload();
          }}
          className="w-full bg-white border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh Status
        </button>

        {/* My Orders Link */}
        <div className="mt-4 text-center">
          <a href="/my-orders" className="text-purple-600 hover:text-purple-700 font-semibold">
            View My Orders
          </a>
        </div>
      </div>
    </div>
  );
}
