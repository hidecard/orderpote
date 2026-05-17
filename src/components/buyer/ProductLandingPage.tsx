import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Share2, Heart } from 'lucide-react';
import { Product, ProductVariant, Review } from '../../lib/schema';

interface ProductLandingPageProps {
  slug: string;
}

export default function ProductLandingPage({ slug }: ProductLandingPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch product data from database based on slug
    // Mock data for now
    const mockProduct: Product = {
      id: 'prod-1',
      user_id: 'user-123',
      store_id: 'store-123',
      name: 'Premium Cotton T-Shirt',
      description: 'High-quality cotton t-shirt perfect for everyday wear. Made from 100% organic cotton with a comfortable fit.',
      slug,
      cover_image_url: 'https://via.placeholder.com/400x400?text=Product+Image+1',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockImages = [
      'https://via.placeholder.com/400x400?text=Product+Image+1',
      'https://via.placeholder.com/400x400?text=Product+Image+2',
      'https://via.placeholder.com/400x400?text=Product+Image+3',
    ];

    const mockVariants: ProductVariant[] = [
      { id: 'var-1', product_id: 'prod-1', name: 'Size: M, Color: Black', price: 25000, stock: 15, created_at: new Date().toISOString() },
      { id: 'var-2', product_id: 'prod-1', name: 'Size: L, Color: Black', price: 25000, stock: 10, created_at: new Date().toISOString() },
      { id: 'var-3', product_id: 'prod-1', name: 'Size: M, Color: White', price: 25000, stock: 8, created_at: new Date().toISOString() },
      { id: 'var-4', product_id: 'prod-1', name: 'Size: L, Color: White', price: 25000, stock: 5, created_at: new Date().toISOString() },
    ];

    const mockReviews: Review[] = [
      { id: 'rev-1', product_id: 'prod-1', customer_name: 'John Doe', rating: 5, comment: 'Great quality! Very comfortable.', created_at: new Date().toISOString() },
      { id: 'rev-2', product_id: 'prod-1', customer_name: 'Jane Smith', rating: 4, comment: 'Good product, fast delivery.', created_at: new Date().toISOString() },
      { id: 'rev-3', product_id: 'prod-1', customer_name: 'Mike Johnson', rating: 5, comment: 'Love it! Will buy again.', created_at: new Date().toISOString() },
    ];

    setProduct(mockProduct);
    setImages(mockImages);
    setVariants(mockVariants);
    setSelectedVariant(mockVariants[0]);
    setReviews(mockReviews);
    setIsLoading(false);

    // Track page view
    // TODO: Send page view event to analytics
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
    window.location.href = `/checkout?product=${slug}&variant=${selectedVariant.id}&quantity=${quantity}`;
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600">This product may have been removed or is no longer available.</p>
        </div>
      </div>
    );
  }

  if (!product.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Temporarily Closed</h1>
          <p className="text-gray-600">This item is temporarily unavailable. Please check back later.</p>
        </div>
      </div>
    );
  }

  const totalPrice = selectedVariant ? selectedVariant.price * quantity : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized layout */}
      <div className="max-w-4xl mx-auto p-4">
        {/* Image Carousel */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
          <div className="relative aspect-square">
            <img
              src={images[currentImageIndex]}
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
                        index === currentImageIndex ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
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
          <div className="text-3xl font-bold text-purple-600 mb-4">
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
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{variant.name}</span>
                      <span className="text-sm text-gray-600">
                        {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <div className="text-purple-600 font-semibold">{variant.price.toLocaleString()} Ks</div>
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
                onClick={() => setQuantity(quantity + 1)}
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
            className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Buy Now
          </button>

          {/* Share Button */}
          <button className="w-full mt-3 border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
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
