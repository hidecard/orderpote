import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Copy, Upload, X, CheckCircle } from 'lucide-react';
import { MYANMAR_REGIONS, TOWNSHIPS_BY_REGION } from '../../lib/myanmar-data';
import type { Product, ProductVariant, Wallet } from '../../lib/schema';
import { getProductBySlug, getProductVariants, getPrimaryWallet, createOrder } from '../../lib/db';

interface CheckoutFormProps {
  productSlug: string;
  variantId: string;
  quantity: number;
}

export default function CheckoutForm({ productSlug, variantId, quantity }: CheckoutFormProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [primaryWallet, setPrimaryWallet] = useState<Wallet | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerRegion, setCustomerRegion] = useState('');
  const [customerTownship, setCustomerTownship] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchCheckoutData() {
      try {
        const productData = await getProductBySlug(productSlug);
        if (!productData) return;

        const variantsData = await getProductVariants(productData.id);
        const variantData = variantsData.find(v => v.id === variantId) || variantsData[0];
        
        const walletData = await getPrimaryWallet(productData.user_id);
        setProduct(productData);
        setVariant(variantData || null);
        setPrimaryWallet(walletData);
      } catch (error) {
        console.error('Error fetching checkout data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCheckoutData();
  }, [productSlug, variantId]);

  const handleCopyAccountNumber = () => {
    if (primaryWallet) {
      navigator.clipboard.writeText(primaryWallet.account_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Client-side compression
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = 800;
          const maxHeight = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                setPaymentScreenshot(compressedFile);
                setScreenshotPreview(event.target?.result as string);
              }
            },
            'image/jpeg',
            0.7
          );
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!product || !variant) {
      alert('Product is not ready for checkout');
      return;
    }

    if (!primaryWallet) {
      alert('Seller has not set up a payment wallet yet');
      return;
    }

    if (!customerName || !customerPhone || !customerRegion || !customerTownship || !customerAddress || !paymentScreenshot) {
      alert('Please fill in all fields and upload payment screenshot');
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await createOrder({
        product_id: product.id,
        variant_id: variant.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        customer_region: customerRegion,
        customer_township: customerTownship,
        quantity,
        total_price: variant ? variant.price * quantity : 0,
        payment_status: 'pending',
        delivery_status: 'pending',
        payment_screenshot_url: screenshotPreview,
      });

      // Save phone to localStorage for MyOrders page
      localStorage.setItem('orderpote_last_phone', customerPhone);

      // Redirect to order tracking page
      window.location.href = `/order-tracking/${order.id}`;
    } catch (error) {
      console.error('Error submitting order:', error);
      if (error instanceof Error) {
        if (error.message === 'Insufficient stock') {
          alert('Sorry, this product is out of stock or the requested quantity is not available.');
        } else if (error.message === 'Product variant not found') {
          alert('Product variant not found. Please try again.');
        } else {
          alert('Failed to submit order. Please try again.');
        }
      } else {
        alert('Failed to submit order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = variant ? variant.price * quantity : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!product || !variant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Checkout Unavailable</h1>
          <p className="text-gray-600">This product is not ready for checkout.</p>
        </div>
      </div>
    );
  }

  if (!primaryWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Not Ready</h1>
          <p className="text-gray-600">The seller has not set up a payment wallet yet. Please contact the seller before ordering.</p>
        </div>
      </div>
    );
  }

  const availableTownships = customerRegion ? TOWNSHIPS_BY_REGION[customerRegion] || [] : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <h2 className="font-semibold mb-3">Order Summary</h2>
          <div className="flex gap-4">
            <img
              src={product.cover_image_url || 'https://via.placeholder.com/400x400?text=Product'}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-600">{variant.name}</p>
              <p className="text-sm text-gray-600">Quantity: {quantity}</p>
              <p className="text-lg font-bold text-purple-600 mt-2">
                {totalPrice.toLocaleString()} Ks
              </p>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <h2 className="font-semibold mb-3">Payment Information</h2>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-purple-900">{primaryWallet.provider}</span>
              <span className="text-sm text-purple-700">Primary Account</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Account Name</p>
                <p className="font-semibold">{primaryWallet.account_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Number</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{primaryWallet.account_number}</p>
                  <button
                    onClick={handleCopyAccountNumber}
                    className="p-1 bg-purple-200 rounded hover:bg-purple-300 transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-purple-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Copy the account number and transfer {totalPrice.toLocaleString()} Ks via {primaryWallet.provider}
          </p>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-4 space-y-4">
          <h2 className="font-semibold mb-3">Customer Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="09xxxxxxxxx"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region/State *
              </label>
              <select
                value={customerRegion}
                onChange={(e) => {
                  setCustomerRegion(e.target.value);
                  setCustomerTownship('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select region...</option>
                {MYANMAR_REGIONS.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Township *
              </label>
              <select
                value={customerTownship}
                onChange={(e) => setCustomerTownship(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={!customerRegion}
                required
              >
                <option value="">Select township...</option>
                {availableTownships.map((township) => (
                  <option key={township} value={township}>
                    {township}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Address *
            </label>
            <textarea
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Street address, building, floor, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Screenshot *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="screenshot-upload"
              />
              <label
                htmlFor="screenshot-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {screenshotPreview ? (
                  <div className="relative">
                    <img
                      src={screenshotPreview}
                      alt="Payment Screenshot"
                      className="max-h-48 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setPaymentScreenshot(null);
                        setScreenshotPreview('');
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-gray-600">Upload payment screenshot</p>
                    <p className="text-sm text-gray-500">Image will be compressed automatically</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !paymentScreenshot}
            className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting Order...' : 'Submit Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
