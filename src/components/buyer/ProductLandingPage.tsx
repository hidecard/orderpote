import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Share2 } from 'lucide-react';
import SeoMeta from '../common/SeoMeta';
import type { Product, ProductVariant, Review, Store } from '../../lib/schema';
import { getProductBySlug, getProductImages, getProductVariants, getProductReviews, trackPageView, getStoreByUserId } from '../../lib/db';

interface ProductLandingPageProps {
  slug: string;
}

function getProductDescription(product: Product) {
  return product.description || `${product.name} ကို OrderPote တွင် မှာယူပါ။`;
}

function parseVariantName(name: string): { size?: string; color?: string } {
  // Try to parse "Size - Color" format
  const parts = name.split(' - ');
  if (parts.length === 2) {
    const size = parts[0].trim();
    const color = parts[1].trim();
    // Check if first part looks like a size (common size patterns)
    const sizePatterns = /^(XS|S|M|L|XL|XXL|\d+XL?|\d+)$/i;
    if (sizePatterns.test(size)) {
      return { size, color };
    }
  }
  return {};
}

function getVariantSize(variant: ProductVariant): string | undefined {
  return variant.size || parseVariantName(variant.name).size;
}

function getVariantColor(variant: ProductVariant): string | undefined {
  return variant.color || parseVariantName(variant.name).color;
}

function getVariantColorHex(variant: ProductVariant): string {
  if (variant.color_hex) return variant.color_hex;
  
  // Map common color names to hex codes
  const colorMap: Record<string, string> = {
    'Black': '#000000',
    'White': '#FFFFFF',
    'Red': '#EF4444',
    'Blue': '#3B82F6',
    'Green': '#10B981',
    'Yellow': '#F59E0B',
    'Purple': '#8B5CF6',
    'Pink': '#EC4899',
    'Orange': '#F97316',
    'Brown': '#78350F',
    'Gray': '#6B7280',
    'Grey': '#6B7280',
  };
  
  const color = getVariantColor(variant);
  return color ? (colorMap[color] || '#000000') : '#000000';
}

export default function ProductLandingPage({ slug }: ProductLandingPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProductData() {
      setIsLoading(true);
      try {
        const productData = await getProductBySlug(slug);
        if (!productData) {
          setProduct(null);
          setIsLoading(false);
          return;
        }

        const [imagesData, variantsData, reviewsData] = await Promise.all([
          getProductImages(productData.id),
          getProductVariants(productData.id),
          getProductReviews(productData.id),
        ]);

        setProduct(productData);
        setImages(imagesData.map(img => img.image_url));
        setVariants(variantsData);
        setSelectedVariant(variantsData[0] || null);
        setReviews(reviewsData);
        const storeData = await getStoreByUserId(productData.user_id);
        setStore(storeData);

        // Track page view
        await trackPageView(productData.id);
      } catch (error) {
        console.error('Error fetching product data:', error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductData();
  }, [slug]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return;
    // Navigate to checkout page
    window.location.href = `/checkout?product=${encodeURIComponent(slug)}&variant=${encodeURIComponent(selectedVariant.id)}&quantity=${quantity}`;
  };

  const handleShare = async () => {
    const link = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: product?.name,
        text: product?.description || 'Check out this product',
        url: link,
      });
      return;
    }

    await navigator.clipboard.writeText(link);
    alert('Product link copied');
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  if (isLoading) {
    return (
      <>
        <SeoMeta
          title="ပစ္စည်းဖွင့်နေသည် | OrderPote"
          description="OrderPote ပစ္စည်းစာမျက်နှာကို ဖွင့်နေသည်။"
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <SeoMeta
          title="ပစ္စည်းမတွေ့ပါ | OrderPote"
          description="ဤ OrderPote ပစ္စည်းကို ဖျက်သိမ်းထားပါသည် သို့မဟုတ် ရရှိနိုင်ခြင်းမရှိပါ။"
          noIndex
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600">This product may have been removed or is no longer available.</p>
          </div>
        </div>
      </>
    );
  }

  if (!product.is_active) {
    const seoUrl = typeof window !== 'undefined' ? window.location.href : '';
    return (
      <>
        <SeoMeta
          title={`${product.name} | OrderPote`}
          description="ဤ OrderPote ပစ္စည်းသည် ယာယီရရှိနိုင်ခြင်းမရှိပါ။"
          image={product.cover_image_url || images[0] || '/logo.png'}
          url={seoUrl}
          type="product"
          noIndex
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Temporarily Closed</h1>
            <p className="text-gray-600">This item is temporarily unavailable. Please check back later.</p>
          </div>
        </div>
      </>
    );
  }

  const totalPrice = selectedVariant ? selectedVariant.price * quantity : 0;

  const seoTitle = store 
    ? `${product.name} | ${store.name} | OrderPote`
    : `${product.name} | OrderPote`;
  
  const seoDescription = store
    ? `${getProductDescription(product)} ${store.name} တွင် OrderPote ဖြင့် ဝယ်ယူပါ။`
    : getProductDescription(product);

  const seoImage = product.cover_image_url || images[0] || '/logo.png';
  const seoUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-[#f8fbfc]">
      <SeoMeta
        title={seoTitle}
        description={seoDescription}
        image={seoImage}
        url={seoUrl}
        type="product"
      />
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6 rounded-[1.5rem] overflow-hidden bg-white shadow-2xl border border-gray-100">
          <div className="bg-[#1a7f8c] px-6 py-6 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black leading-tight">{product.name}</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white">
                  <img src={store?.logo_url || '/logo.png'} alt={store?.name ? `${store.name} logo` : 'Shop logo'} className="h-full w-full object-contain" />
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#d7f0f5]">Shop</p>
                  <p className="text-lg font-semibold">{store?.name || 'Seller Store'}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white">
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <img
                src={images[currentImageIndex] || product.cover_image_url || 'https://via.placeholder.com/800x800?text=Product'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-[#1a7f8c]' : 'bg-gray-300'
                        }`}
                    />
                  ))}
                </div>
              </>
            )}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          
          {/* Rating */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">{averageRating.toFixed(1)} ({reviews.length} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="text-3xl font-bold text-[#1a7f8c] mb-4">
            {totalPrice.toLocaleString()} Ks
          </div>

          {/* Description */}
          <div className="text-gray-700 mb-4">
            <p>{product.description}</p>
          </div>

          {/* Variants */}
          {variants.length > 0 && (
            <div className="mb-4 space-y-4">
              {/* Size Selection */}
              {variants.some(v => getVariantSize(v)) && (
                <div>
                  <h3 className="font-semibold mb-2">အရွယ်အစား (Size)</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(variants.filter(v => getVariantSize(v)).map(v => getVariantSize(v)))).map((size) => {
                      const sizeVariants = variants.filter(v => getVariantSize(v) === size);
                      const hasStock = sizeVariants.some(v => v.stock > 0);
                      const stockCount = sizeVariants.reduce((sum, v) => sum + v.stock, 0);
                      const isSelected = selectedVariant && getVariantSize(selectedVariant) === size;
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            const availableVariant = sizeVariants.find(v => v.stock > 0);
                            if (availableVariant) setSelectedVariant(availableVariant);
                          }}
                          disabled={!hasStock}
                          className={`px-4 py-2 rounded-lg border-2 font-medium transition-all relative ${
                            isSelected
                              ? 'border-[#1a7f8c] bg-[#1a7f8c] text-white shadow-md'
                              : hasStock
                                ? 'border-gray-300 hover:border-[#1a7f8c] hover:bg-gray-50 text-gray-700'
                                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {size}
                          {hasStock && stockCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                              {stockCount > 99 ? '99+' : stockCount}
                            </span>
                          )}
                          {!hasStock && (
                            <span className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                              မရှိ
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {variants.some(v => getVariantColor(v)) && (
                <div>
                  <h3 className="font-semibold mb-2">အရောင် (Color)</h3>
                  <div className="flex flex-wrap gap-3">
                    {Array.from(new Set(variants.filter(v => getVariantColor(v)).map(v => getVariantColor(v)))).map((color) => {
                      const colorVariants = variants.filter(v => getVariantColor(v) === color);
                      const hasStock = colorVariants.some(v => v.stock > 0);
                      const stockCount = colorVariants.reduce((sum, v) => sum + v.stock, 0);
                      const isSelected = selectedVariant && getVariantColor(selectedVariant) === color;
                      const colorHex = getVariantColorHex(colorVariants[0]);
                      return (
                        <button
                          key={color}
                          onClick={() => {
                            const availableVariant = colorVariants.find(v => v.stock > 0);
                            if (availableVariant) setSelectedVariant(availableVariant);
                          }}
                          disabled={!hasStock}
                          className={`relative w-12 h-12 rounded-full border-3 transition-all shadow-sm ${
                            isSelected
                              ? 'border-[#1a7f8c] ring-4 ring-[#1a7f8c] ring-offset-2 scale-110'
                              : hasStock
                                ? 'border-gray-300 hover:border-[#1a7f8c] hover:scale-105'
                                : 'border-gray-200 opacity-50 cursor-not-allowed grayscale'
                          }`}
                          style={{ backgroundColor: colorHex }}
                          title={color}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                            </div>
                          )}
                          {hasStock && stockCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md">
                              {stockCount > 99 ? '99+' : stockCount}
                            </span>
                          )}
                          {!hasStock && (
                            <span className="absolute -top-1 -right-1 bg-gray-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md">
                              ✕
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price Display */}
              {selectedVariant && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm text-gray-600">ရွေးချယ်ထားသော:</span>
                    <span className="font-medium ml-2">
                      {getVariantSize(selectedVariant) && `${getVariantSize(selectedVariant)} `}
                      {getVariantColor(selectedVariant) && `${getVariantColor(selectedVariant)}`}
                    </span>
                  </div>
                  <div className="text-[#1a7f8c] font-bold text-xl">
                    {selectedVariant.price.toLocaleString()} Ks
                  </div>
                </div>
              )}

              {/* Fallback for variants without size/color */}
              {!variants.some(v => getVariantSize(v)) && !variants.some(v => getVariantColor(v)) && (
                <div>
                  <h3 className="font-semibold mb-2">ရွေးချယ်ပါ</h3>
                  <div className="space-y-2">
                    {variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={variant.stock === 0}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                          selectedVariant?.id === variant.id
                            ? 'border-[#1a7f8c] bg-[#eaf8fb]'
                              : 'border-gray-200 hover:border-gray-300'
                        } ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{variant.name}</span>
                          <span className="text-sm text-gray-600">
                            {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
                          </span>
                        </div>
                        <div className="text-[#1a7f8c] font-semibold">{variant.price.toLocaleString()} Ks</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                -
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(selectedVariant?.stock || quantity, quantity + 1))}
                disabled={!selectedVariant || quantity >= selectedVariant.stock}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Buy Button */}
          <button
            onClick={handleBuyNow}
            disabled={!selectedVariant || selectedVariant.stock === 0}
            className="w-full bg-[#1a7f8c] text-white py-4 rounded-xl font-semibold hover:bg-[#156a75] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Buy Now
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-full mt-3 border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share Product
          </button>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{review.customer_name}</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-gray-600">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
