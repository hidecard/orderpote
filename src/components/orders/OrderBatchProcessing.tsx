import { useState, useEffect } from 'react';
import { CheckSquare, Square, Package, MapPin, Printer, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOrdersForProcessing } from '../../lib/db';
import QRCode from 'qrcode';

interface OrderWithDetails {
  id: string;
  product_name: string;
  variant_name?: string;
  variant_size?: string;
  variant_color?: string;
  quantity: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_region: string;
  customer_township: string;
  total_price: number;
  delivery_fee: number;
  created_at: string;
}

export default function OrderBatchProcessing() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showPackingSlip, setShowPackingSlip] = useState(false);
  const [showAddressLabels, setShowAddressLabels] = useState(false);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const ordersData = await getOrdersForProcessing(user.id);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const toggleAllOrders = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(o => o.id)));
    }
  };

  const getPickList = () => {
    const pickList: Record<string, number> = {};
    selectedOrders.forEach(orderId => {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const variantKey = `${order.product_name} - ${order.variant_size || ''} ${order.variant_color || ''}`.trim();
        pickList[variantKey] = (pickList[variantKey] || 0) + order.quantity;
      }
    });
    return pickList;
  };

  const getTownshipGroups = () => {
    const groups: Record<string, OrderWithDetails[]> = {};
    selectedOrders.forEach(orderId => {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const township = order.customer_township;
        if (!groups[township]) {
          groups[township] = [];
        }
        groups[township].push(order);
      }
    });
    return groups;
  };

  const printPackingSlip = () => {
    const selectedOrdersList = orders.filter(o => selectedOrders.has(o.id));
    const pickList = getPickList();
    const townshipGroups = getTownshipGroups();

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const pickListHtml = Object.entries(pickList).map(([variant, quantity]) => `
        <div class="pick-item">
          <span class="name">${variant}</span>
          <span class="quantity">${quantity} ထည်</span>
        </div>
      `).join('');

      const townshipHtml = Object.entries(townshipGroups).map(([township, orders]) => `
        <div class="township-group">
          <div class="township-name">${township} (${orders.length} အော်ဒါ)</div>
          ${orders.map(order => `
            <div class="order-item">
              <p class="product-name">${order.product_name}</p>
              <p class="variant-info">${order.variant_name || `${order.variant_size || ''} ${order.variant_color || ''}`.trim()} - ${order.quantity} ထည်</p>
              <p class="customer-info">${order.customer_name} - ${order.customer_phone}</p>
              <p class="customer-info">${order.customer_address}</p>
            </div>
          `).join('')}
        </div>
      `).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>ထုပ်ပိုးမှုအစီရင်ခံစာ</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                padding: 40px; 
                background: white;
                color: #333;
              }
              .header { 
                text-align: center; 
                border-bottom: 3px solid #1a7f8c; 
                padding-bottom: 20px; 
                margin-bottom: 30px; 
              }
              .header h1 { 
                color: #1a7f8c; 
                font-size: 28px; 
                margin-bottom: 10px; 
              }
              .header p { 
                color: #666; 
                font-size: 14px; 
                margin: 5px 0; 
              }
              .section { 
                margin-bottom: 30px; 
              }
              .section h2 { 
                color: #1a7f8c; 
                font-size: 20px; 
                margin-bottom: 15px; 
                border-left: 4px solid #1a7f8c; 
                padding-left: 10px; 
              }
              .pick-list { 
                background: #f8f9fa; 
                padding: 20px; 
                border-radius: 8px; 
                border: 1px solid #e9ecef;
              }
              .pick-item { 
                display: flex; 
                justify-content: space-between; 
                padding: 12px 0; 
                border-bottom: 1px solid #dee2e6; 
                font-size: 16px;
              }
              .pick-item:last-child { border-bottom: none; }
              .pick-item .name { font-weight: 500; }
              .pick-item .quantity { 
                font-weight: bold; 
                color: #1a7f8c; 
                font-size: 18px;
              }
              .township-group { 
                margin-bottom: 20px; 
              }
              .township-name { 
                color: #1a7f8c; 
                font-weight: bold; 
                font-size: 18px; 
                margin-bottom: 15px; 
                background: #e3f2fd;
                padding: 10px 15px;
                border-radius: 5px;
              }
              .order-item { 
                background: white;
                padding: 15px; 
                border: 1px solid #dee2e6;
                border-radius: 5px;
                margin-bottom: 10px;
              }
              .order-item p { 
                margin: 5px 0; 
                font-size: 14px;
              }
              .order-item .product-name { 
                font-weight: bold; 
                font-size: 16px;
                color: #333;
              }
              .order-item .variant-info { 
                color: #666; 
                font-size: 14px;
              }
              .order-item .customer-info { 
                color: #555; 
                font-size: 13px;
              }
              @media print { 
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .section { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>ထုပ်ပိုးမှုအစီရင်ခံစာ</h1>
              <p>ရက်စွဲ: ${new Date().toLocaleDateString('my-MM')}</p>
              <p>အော်ဒါစုစုပေါင်း: ${selectedOrdersList.length} ခု</p>
            </div>

            <div class="section">
              <h2>Pick List - ပစ္စည်းထုတ်ယူရန်စာရင်း</h2>
              <div class="pick-list">
                ${pickListHtml}
              </div>
            </div>

            <div class="section">
              <h2>Township Sorting - မြို့နယ်အလိုက်စုစည်းခြင်း</h2>
              ${townshipHtml}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const printAddressLabels = () => {
    const selectedOrdersList = orders.filter(o => selectedOrders.has(o.id));

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const labelsHtml = selectedOrdersList.map(order => `
        <div class="label">
          <div class="label-header">
            <div class="order-id">Order ID: ${order.id}</div>
            <div class="qr-code">
              ${qrCodes[order.id] ? `<img src="${qrCodes[order.id]}" alt="QR Code" width="50" height="50" />` : ''}
            </div>
          </div>
          <h3 class="label-name">${order.customer_name}</h3>
          <p class="label-info"><strong>ဖုန်း:</strong> ${order.customer_phone}</p>
          <p class="label-info"><strong>လိပ်စာ:</strong> ${order.customer_address}</p>
          <p class="label-info"><strong>မြို့နယ်:</strong> ${order.customer_region}, ${order.customer_township}</p>
          <div class="label-product">
            <p class="label-product-name">${order.product_name}</p>
            <p class="label-variant">${order.variant_name || `${order.variant_size || ''} ${order.variant_color || ''}`.trim()}</p>
            <p class="label-quantity">အရေအတွက်: ${order.quantity}</p>
          </div>
        </div>
      `).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>လိပ်စာကတ်များ</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                padding: 20px; 
                background: white;
              }
              .label-grid { 
                display: grid; 
                grid-template-columns: repeat(2, 1fr); 
                gap: 15px; 
              }
              .label { 
                border: 3px solid #1a7f8c; 
                padding: 20px; 
                border-radius: 10px; 
                page-break-inside: avoid;
                background: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .label-header { 
                display: flex; 
                justify-content: space-between; 
                align-items: start; 
                margin-bottom: 15px; 
                border-bottom: 2px solid #e9ecef;
                padding-bottom: 10px;
              }
              .order-id { 
                font-size: 11px; 
                color: #666; 
                font-weight: 500;
              }
              .qr-code img {
                border: 1px solid #ddd;
                padding: 5px;
                border-radius: 5px;
              }
              .label-name { 
                font-weight: bold; 
                font-size: 20px; 
                margin: 8px 0;
                color: #1a7f8c;
              }
              .label-info { 
                font-size: 15px; 
                color: #333; 
                margin: 6px 0;
                line-height: 1.4;
              }
              .label-info strong {
                color: #555;
              }
              .label-product { 
                border-top: 2px solid #1a7f8c; 
                padding-top: 12px; 
                margin-top: 12px;
                background: #f8f9fa;
                padding: 12px;
                border-radius: 5px;
              }
              .label-product-name { 
                font-weight: bold; 
                font-size: 16px;
                color: #333;
                margin-bottom: 5px;
              }
              .label-variant {
                font-size: 14px;
                color: #666;
                margin-bottom: 5px;
              }
              .label-quantity {
                font-size: 14px;
                color: #1a7f8c;
                font-weight: bold;
              }
              @media print { 
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .label { page-break-inside: avoid; }
                .label-grid { gap: 10px; }
              }
            </style>
          </head>
          <body>
            <div class="label-grid">
              ${labelsHtml}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a7f8c]"></div>
      </div>
    );
  }

  const selectedOrdersList = orders.filter(o => selectedOrders.has(o.id));
  const pickList = getPickList();
  const townshipGroups = getTownshipGroups();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">အော်ဒါ အုပ်စု ထုတ်လုပ်ခြင်း (Order Batch Processing)</h1>
      </div>

      {!showPackingSlip && !showAddressLabels ? (
        <>
          {/* Order Selection */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleAllOrders}
                  className="flex items-center gap-2 text-[#1a7f8c] hover:text-[#156a75]"
                >
                  {selectedOrders.size === orders.length ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {selectedOrders.size === orders.length ? 'အားလုံးဖျက်ရန်' : 'အားလုံးရွေးရန်'}
                  </span>
                </button>
                <span className="text-sm text-gray-600">
                  {selectedOrders.size} / {orders.length} အော်ဒါ ရွေးထားသည်
                </span>
              </div>
              {selectedOrders.size > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPackingSlip(true)}
                    className="flex items-center gap-2 bg-[#1a7f8c] text-white px-4 py-2 rounded-lg hover:bg-[#156a75] transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    ထုပ်ပိုးမှုအစီရင်ခံစာ (Packing Slip)
                  </button>
                  <button
                    onClick={() => setShowAddressLabels(true)}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    လိပ်စာကတ်များ (Address Labels)
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">ပို့ဆောင်ရန် အသင့်ဖြစ်နေသော အော်ဒါမရှိပါ</p>
              ) : (
                orders.map(order => (
                  <div
                    key={order.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedOrders.has(order.id) ? 'bg-[#1a7f8c]/10 border-[#1a7f8c]' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleOrderSelection(order.id)}
                  >
                    <div className="flex items-center gap-4">
                      {selectedOrders.has(order.id) ? (
                        <CheckSquare className="w-5 h-5 text-[#1a7f8c]" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{order.product_name}</p>
                        <p className="text-sm text-gray-600">
                          {order.variant_name || `${order.variant_size || ''} ${order.variant_color || ''}`.trim()} - {order.quantity} ထည်
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.customer_name} - {order.customer_township}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#1a7f8c]">{order.total_price.toLocaleString()} ကျပ်</p>
                      <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('my-MM')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Packing Slip View */}
          {showPackingSlip && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">ထုပ်ပိုးမှုအစီရင်ခံစာ (Smart Packing Slip)</h2>
                <button
                  onClick={() => setShowPackingSlip(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={printPackingSlip}
                  className="flex items-center gap-2 bg-[#1a7f8c] text-white px-4 py-2 rounded-lg hover:bg-[#156a75] transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print PDF
                </button>
                <button
                  onClick={() => setShowPackingSlip(false)}
                  className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  နောက်သို့
                </button>
              </div>

              <div id="packing-slip" className="bg-white p-8 border">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-[#1a7f8c] mb-2">ထုပ်ပိုးမှုအစီရင်ခံစာ</h1>
                  <p className="text-gray-600">ရက်စွဲ: {new Date().toLocaleDateString('my-MM')}</p>
                  <p className="text-gray-600">အော်ဒါစုစုပေါင်း: {selectedOrdersList.length} ခု</p>
                </div>

                {/* Pick List */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Pick List - ပစ္စည်းထုတ်ယူရန်စာရင်း
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {Object.entries(pickList).map(([variant, quantity]) => (
                      <div key={variant} className="flex justify-between py-2 border-b last:border-0">
                        <span className="font-medium">{variant}</span>
                        <span className="font-bold text-[#1a7f8c]">{quantity} ထည်</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Township Sorting */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Township Sorting - မြို့နယ်အလိုက်စုစည်းခြင်း
                  </h2>
                  {Object.entries(townshipGroups).map(([township, orders]) => (
                    <div key={township} className="mb-4">
                      <h3 className="font-bold text-lg text-[#1a7f8c] mb-2">
                        {township} ({orders.length} အော်ဒါ)
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {orders.map(order => (
                          <div key={order.id} className="py-2 border-b last:border-0">
                            <p className="font-medium">{order.product_name}</p>
                            <p className="text-sm text-gray-600">
                              {order.variant_name || `${order.variant_size || ''} ${order.variant_color || ''}`.trim()} - {order.quantity} ထည်
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.customer_name} - {order.customer_phone}
                            </p>
                            <p className="text-sm text-gray-500">{order.customer_address}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Address Labels View */}
          {showAddressLabels && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">လိပ်စာကတ်များ (Address Labels)</h2>
                <button
                  onClick={() => setShowAddressLabels(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={printAddressLabels}
                  className="flex items-center gap-2 bg-[#1a7f8c] text-white px-4 py-2 rounded-lg hover:bg-[#156a75] transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print PDF
                </button>
                <button
                  onClick={() => setShowAddressLabels(false)}
                  className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  နောက်သို့
                </button>
              </div>

              <div id="address-labels" className="bg-white p-8 border">
                <div className="grid grid-cols-2 gap-4">
                  {selectedOrdersList.map(order => (
                    <div key={order.id} className="border-2 border-gray-300 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-xs text-gray-500">Order ID: {order.id}</div>
                        {qrCodes[order.id] && (
                          <img src={qrCodes[order.id]} alt="QR Code" width={50} height={50} />
                        )}
                      </div>
                      <h3 className="font-bold text-lg mb-1">{order.customer_name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{order.customer_phone}</p>
                      <p className="text-sm text-gray-600 mb-1">{order.customer_address}</p>
                      <p className="text-sm text-gray-600 mb-1">{order.customer_region}, {order.customer_township}</p>
                      <div className="border-t pt-2 mt-2">
                        <p className="font-medium text-sm">{order.product_name}</p>
                        <p className="text-sm text-gray-600">
                          {order.variant_name || `${order.variant_size || ''} ${order.variant_color || ''}`.trim()}
                        </p>
                        <p className="text-sm text-gray-600">အရေအတွက်: {order.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
