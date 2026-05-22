import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Share2 } from 'lucide-react';
import SeoMeta from '../common/SeoMeta';
import type { Product, ProductVariant, Review, Store } from '../../lib/schema';
import { getProductBySlug, getProductImages, getProductVariants, getProductReviews, trackPageView, getStoreByUserId } from '../../lib/db';

interface ProductLandingPageProps {
  slug: string;
}

function getProductDescription(product: Product) {
  return product.description || `Order ${product.name} on OrderPote.`;
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
          title="Loading Product | OrderPote"
          description="Loading this OrderPote product page."
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
          title="Product Not Found | OrderPote"
          description="This OrderPote product may have been removed or is no longer available."
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
    return (
      <>
        <SeoMeta
          title={`${product.name} | OrderPote`}
          description="This OrderPote product is temporarily unavailable."
          image={product.cover_image_url || images[0] || '/logo.png'}
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

  return (
    <div className="min-h-screen bg-[#f8fbfc]">
      <SeoMeta
        title={`${product.name} | OrderPote`}
        description={getProductDescription(product)}
        image={product.cover_image_url || images[0] || '/logo.png'}
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
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Select Variant</h3>
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
