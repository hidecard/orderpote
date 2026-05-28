import type { Order, Product, ProductVariant, Store } from '../../lib/schema';

interface ReceiptTemplateProps {
  order: Order;
  product?: Product | null;
  variant?: ProductVariant | null;
  store?: Store | null;
}

export default function ReceiptTemplate({ order, product, variant, store }: ReceiptTemplateProps) {
  return (
    <div id="receipt-template" className="bg-white p-4 max-w-sm mx-auto" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', border: '2px dashed #e5e7eb' }}>
      {/* Header */}
      <div className="text-center mb-4 pb-3 border-b-2 border-purple-600">
        {store?.logo_url ? (
          <img
            src={store.logo_url}
            alt={`${store.name} Logo`}
            className="h-8 mx-auto mb-2 object-contain"
          />
        ) : (
          <img
            src="/logo.png"
            alt="OrderPote Logo"
            className="h-8 mx-auto mb-2 object-contain"
          />
        )}
        <h1 className="text-lg font-bold text-purple-600 mb-1">{store?.name || 'OrderPote'}</h1>
        <p className="text-gray-500 text-xs">{store?.description || 'Your Trusted Online Shopping Partner'}</p>
      </div>

      {/* Order Info */}
      <div className="mb-3 bg-purple-50 p-2 rounded">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-purple-700 text-xs font-semibold">Order ID</p>
            <p className="text-gray-900 text-xs">{order.id}</p>
          </div>
          <div>
            <p className="text-purple-700 text-xs font-semibold">Date</p>
            <p className="text-gray-900 text-xs">
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="mb-3">
        <div className="bg-gray-50 p-2 rounded border-l-4 border-purple-600">
          <div className="flex justify-between items-start mb-1">
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-xs">{product?.name || order.product_id}</p>
              {variant && variant.name && (
                <p className="text-xs text-gray-600">{variant.name}</p>
              )}
            </div>
            <div className="text-right ml-2">
              <p className="font-semibold text-gray-900 text-xs">x{order.quantity}</p>
            </div>
          </div>
          <div className="border-t border-gray-300 pt-1 flex justify-between">
            <span className="text-gray-600 text-xs">Total</span>
            <span className="text-sm font-bold text-purple-600">
              {order.total_price.toLocaleString()} Ks
            </span>
          </div>
          <div className="pt-1 flex justify-between">
            <span className="text-gray-600 text-xs">Delivery Fee</span>
            <span className="text-xs font-semibold text-gray-900">
              {(order.delivery_fee || 0).toLocaleString()} Ks
            </span>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="mb-3">
        <p className="text-purple-700 text-xs font-semibold mb-1">Customer Details</p>
        <div className="text-xs space-y-0.5">
          <p><span className="text-gray-500">Name:</span> <span className="text-gray-900">{order.customer_name}</span></p>
          <p><span className="text-gray-500">Phone:</span> <span className="text-gray-900">{order.customer_phone}</span></p>
          <p><span className="text-gray-500">Address:</span> <span className="text-gray-900">{order.customer_address}</span></p>
          <p><span className="text-gray-900">{order.customer_region}, {order.customer_township}</span></p>
        </div>
      </div>

      {/* Order Status */}
      <div className="mb-3">
        <div className="grid grid-cols-2 gap-2">
          <div className={`p-2 rounded text-center ${order.payment_status === 'paid' ? 'bg-green-100' : 'bg-yellow-100'}`}>
            <p className="text-xs font-semibold text-gray-700">Payment</p>
            <p className={`text-xs font-bold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
              {order.payment_status.toUpperCase()}
            </p>
            <p className="text-[10px] font-semibold text-gray-500">
              {order.payment_method === 'cod' ? 'COD' : 'PREPAID'}
            </p>
          </div>
          <div className="bg-purple-100 p-2 rounded text-center">
            <p className="text-xs font-semibold text-gray-700">Delivery</p>
            <p className="text-xs font-bold text-purple-600">
              {order.delivery_status.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Delivery Information */}
      {(order.delivery_service || order.tracking_id) && (
        <div className="mb-3">
          <p className="text-purple-700 text-xs font-semibold mb-1">Delivery Info</p>
          <div className="text-xs space-y-0.5">
            {order.delivery_service && (
              <p><span className="text-gray-500">Service:</span> <span className="text-gray-900">{order.delivery_service}</span></p>
            )}
            {order.tracking_id && (
              <p><span className="text-gray-500">Tracking:</span> <span className="text-gray-900">{order.tracking_id}</span></p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-2 border-t border-gray-300 text-center">
        <p className="text-gray-600 text-xs mb-1">Thank you for your order!</p>
        <p className="text-gray-500 text-xs">{store?.phone || 'contact@orderpote.com'}</p>
        {store?.address && (
          <p className="text-gray-500 text-xs">{store.address}</p>
        )}
        <p className="text-gray-400 text-xs mt-2">Powered by OrderPote</p>
      </div>
    </div>
  );
}
