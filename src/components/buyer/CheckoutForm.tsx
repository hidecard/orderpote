import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Copy, Upload, X, CheckCircle } from 'lucide-react';
import { MYANMAR_REGIONS, TOWNSHIPS_BY_REGION } from '../../lib/myanmar-data';
import type { Product, ProductVariant, Wallet } from '../../lib/schema';
import { getProductBySlug, getProductVariants, getPrimaryWallet, createOrder, validateCouponCode } from '../../lib/db';

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
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percentage: number } | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
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

  const handleApplyCoupon = async () => {
    if (!product) return;
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const coupon = await validateCouponCode(couponCode.trim(), product.user_id);
      if (!coupon) {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponError('Coupon code is not valid or has expired');
        return;
      }

      const baseTotal = variant ? variant.price * quantity : 0;
      const discount = Math.round((baseTotal * coupon.discount_percentage) / 100);
      setAppliedCoupon({ code: coupon.code, discount_percentage: coupon.discount_percentage });
      setDiscountAmount(discount);
      setCouponError('');
    } catch (error) {
      console.error('Coupon validation failed:', error);
      setCouponError('Failed to validate coupon. Please try again.');
    } finally {
      setCouponLoading(false);
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
      const baseTotal = variant ? variant.price * quantity : 0;
      const order = await createOrder({
        product_id: product.id,
        variant_id: variant.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        customer_region: customerRegion,
        customer_township: customerTownship,
        quantity,
        total_price: baseTotal - discountAmount,
        coupon_code: appliedCoupon?.code,
        discount_amount: discountAmount,
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
  const finalPrice = Math.max(0, totalPrice - discountAmount);

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
    <div className="min-h-screen bg-[#f8fbfc] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 rounded-[2rem] bg-white shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-[#1a7f8c] px-6 py-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d7f0f5]">OrderPote Checkout</p>
            <h1 className="mt-4 text-4xl font-black leading-tight">
              အော်ဒါ စာမျက်နှာ
            </h1>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] p-6 lg:p-8 bg-white">
            <div className="space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-[#ffffff] p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-3">အော်ဒါအကျဉ်းချုံး</h2>
                <div className="flex items-center gap-4">
                  <img
                    src={product.cover_image_url || 'https://via.placeholder.com/400x400?text=Product'}
                    alt={product.name}
                    className="w-28 h-28 object-cover rounded-3xl border border-gray-100"
                  />
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{variant.name}</p>
                    <p className="text-sm text-gray-500">အရေအတွက်: {quantity}</p>
                  </div>
                </div>
                <div className="mt-6 rounded-3xl bg-[#eaf8fb] p-4 border border-[#d4f1f5]">
                  <p className="text-sm text-gray-600">စုစုပေါင်း</p>
                  {discountAmount > 0 ? (
                    <div className="mt-2 flex items-end gap-3">
                      <p className="text-xl text-gray-500 line-through">{totalPrice.toLocaleString()} Ks</p>
                      <p className="text-3xl font-black text-[#1a7f8c]">{finalPrice.toLocaleString()} Ks</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-3xl font-black text-[#1a7f8c]">{totalPrice.toLocaleString()} Ks</p>
                  )}
                  {discountAmount > 0 && (
                    <p className="mt-3 text-sm text-green-700">လျှော့စျေး: {discountAmount.toLocaleString()} Ks</p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-3">ငွေပေးချေမှု အချက်အလက်</h2>
                <div className="rounded-3xl bg-[#f0fbfd] p-4 border border-[#d4f1f5]">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">ဘဏ်အမည်</p>
                      <p className="font-semibold text-gray-900">{primaryWallet.account_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">အကောင့်နံပါတ်</p>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{primaryWallet.account_number}</p>
                        <button
                          onClick={handleCopyAccountNumber}
                          className="rounded-full bg-[#1a7f8c] p-2 text-white hover:bg-[#156a75] transition-colors"
                        >
                          {copied ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {primaryWallet.provider} မှဖြင့် {finalPrice.toLocaleString()} Ks ကို ငွေလွှဲပါ။
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">ဝယ်သူ အချက်အလက်</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setAppliedCoupon(null);
                          setDiscountAmount(0);
                          setCouponError('');
                        }}
                        className="flex-1 rounded-2xl border border-gray-300 bg-[#f7fcfd] px-4 py-3 text-sm focus:border-[#1a7f8c] focus:outline-none focus:ring-2 focus:ring-[#b8f0f6]"
                        placeholder="Coupon code ရိုက်ထည့်ပါ"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="rounded-2xl bg-[#1a7f8c] px-4 py-3 text-sm font-bold text-white hover:bg-[#156a75] disabled:opacity-50"
                      >
                        {couponLoading ? 'စစ်ဆေးနေသည်...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-sm text-red-600 mt-2">{couponError}</p>}
                    {appliedCoupon && !couponError && (
                      <p className="text-sm text-green-700 mt-2">{appliedCoupon.discount_percentage}% လျော့စျေးအသုံးပြုထားသည်</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">အမည် *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-2xl border border-gray-300 bg-[#f7fcfd] px-4 py-3 text-sm focus:border-[#1a7f8c] focus:outline-none focus:ring-2 focus:ring-[#b8f0f6]"
                      placeholder="သင့်အမည်"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ဖုန်းနံပါတ် *</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-2xl border border-gray-300 bg-[#f7fcfd] px-4 py-3 text-sm focus:border-[#1a7f8c] focus:outline-none focus:ring-2 focus:ring-[#b8f0f6]"
                      placeholder="09xxxxxxxxx"
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">တိုင်းဒေသကြီး *</label>
                      <select
                        value={customerRegion}
                        onChange={(e) => {
                          setCustomerRegion(e.target.value);
                          setCustomerTownship('');
                        }}
                        className="w-full rounded-2xl border border-gray-300 bg-[#f7fcfd] px-4 py-3 text-sm focus:border-[#1a7f8c] focus:outline-none focus:ring-2 focus:ring-[#b8f0f6]"
                        required
                      >
                        <option value="">တိုင်းဒေသကြီး ရွေးပါ</option>
                        {MYANMAR_REGIONS.map((region) => (
                          <option key={region.id} value={region.id}>
                            {region.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">မြို့နယ် *</label>
                      <select
                        value={customerTownship}
                        onChange={(e) => setCustomerTownship(e.target.value)}
                        className="w-full rounded-2xl border border-gray-300 bg-[#f7fcfd] px-4 py-3 text-sm focus:border-[#1a7f8c] focus:outline-none focus:ring-2 focus:ring-[#b8f0f6]"
                        disabled={!customerRegion}
                        required
                      >
                        <option value="">မြို့နယ် ရွေးပါ</option>
                        {availableTownships.map((township) => (
                          <option key={township} value={township}>
                            {township}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">လိပ်စာ *</label>
                    <textarea
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      rows={3}
                      className="w-full rounded-2xl border border-gray-300 bg-[#f7fcfd] px-4 py-3 text-sm focus:border-[#1a7f8c] focus:outline-none focus:ring-2 focus:ring-[#b8f0f6]"
                      placeholder="လိပ်စာ၊ အဆောက်အအုံ၊ အခန်းနံပါတ်"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ငွေလွှဲ Screenshot *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-3xl p-6 text-center hover:border-[#1a7f8c] transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="screenshot-upload"
                      />
                      <label htmlFor="screenshot-upload" className="cursor-pointer flex flex-col items-center gap-3">
                        {screenshotPreview ? (
                          <div className="relative">
                            <img
                              src={screenshotPreview}
                              alt="Payment Screenshot"
                              className="max-h-48 rounded-3xl"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setPaymentScreenshot(null);
                                setScreenshotPreview('');
                              }}
                              className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 text-gray-400" />
                            <p className="text-gray-600 font-semibold">Screenshot တင်ပါ</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !paymentScreenshot}
                    className="w-full rounded-3xl bg-[#1a7f8c] px-6 py-4 text-base font-black text-white hover:bg-[#156a75] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'တင်ပြနေသည်...' : 'အော်ဒါတင်မည်'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
