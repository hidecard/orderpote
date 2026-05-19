import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X, Plus, Trash2, ArrowLeft } from 'lucide-react';
import type { Product, ProductVariant, ProductImage } from '../../lib/schema';
import { 
  getProductById, 
  getProductImages, 
  getProductVariants,
  updateProduct,
  deleteProduct,
  createProductImage,
  deleteProductImage,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant
} from '../../lib/db';

export default function EditProductForm() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [existingVariants, setExistingVariants] = useState<ProductVariant[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [updatedVariants, setUpdatedVariants] = useState<{ id: string; name: string; price: number; stock: number }[]>([]);
  const [currentVariant, setCurrentVariant] = useState({
    name: '',
    price: '',
    stock: '',
  });
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProductData() {
      if (!productId) return;

      try {
        const productData = await getProductById(productId);
        if (productData) {
          setProduct(productData);
          setName(productData.name);
          setDescription(productData.description || '');
          setIsActive(productData.is_active);

          const imagesData = await getProductImages(productId);
          setExistingImages(imagesData);

          const variantsData = await getProductVariants(productId);
          setExistingVariants(variantsData);
          setUpdatedVariants(variantsData.map(v => ({ id: v.id, name: v.name, price: v.price, stock: v.stock })));
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductData();
  }, [productId]);

  const readImageAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxSize = 900;
          let { width, height } = img;

          if (width > height && width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          } else if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }

          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.78));
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const uploadedImages = await Promise.all(Array.from(files).map(readImageAsDataUrl));
      setNewImages([...newImages, ...uploadedImages]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      await deleteProductImage(imageId);
      setExistingImages(existingImages.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const setAsCover = async (imageId: string) => {
    if (!product) return;
    try {
      await updateProduct(product.id, { cover_image_url: existingImages.find(img => img.id === imageId)?.image_url });
      setProduct({ ...product, cover_image_url: existingImages.find(img => img.id === imageId)?.image_url });
    } catch (error) {
      console.error('Error setting cover image:', error);
      alert('Failed to set cover image');
    }
  };

  const addVariant = () => {
    if (currentVariant.name && currentVariant.price && currentVariant.stock) {
      const newVariant = {
        id: `new-${Date.now()}`,
        name: currentVariant.name,
        price: parseInt(currentVariant.price),
        stock: parseInt(currentVariant.stock),
      };
      setUpdatedVariants([...updatedVariants, newVariant]);
      setCurrentVariant({ name: '', price: '', stock: '' });
    }
  };

  const removeVariant = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;
    
    // If it's an existing variant, delete from database
    if (!variantId.startsWith('new-')) {
      try {
        await deleteProductVariant(variantId);
      } catch (error) {
        console.error('Error deleting variant:', error);
        alert('Failed to delete variant');
        return;
      }
    }
    
    setUpdatedVariants(updatedVariants.filter(v => v.id !== variantId));
  };

  const updateVariant = (variantId: string, field: 'name' | 'price' | 'stock', value: string | number) => {
    setUpdatedVariants(updatedVariants.map(v => 
      v.id === variantId ? { ...v, [field]: value } : v
    ));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!product || !productId) {
      alert('Product not found');
      return;
    }

    if (!name) {
      alert('Please fill in product name');
      return;
    }

    if (updatedVariants.length === 0) {
      alert('Please add at least one product variant');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update product basic info
      await updateProduct(productId, {
        name,
        description,
        is_active: isActive,
      });

      // Add new images
      for (let i = 0; i < newImages.length; i++) {
        await createProductImage({
          product_id: productId,
          image_url: newImages[i],
          sort_order: existingImages.length + i,
        });
      }

      // Update existing variants and create new ones
      for (const variant of updatedVariants) {
        if (variant.id.startsWith('new-')) {
          await createProductVariant({
            product_id: productId,
            name: variant.name,
            price: variant.price,
            stock: variant.stock,
          });
        } else {
          const existing = existingVariants.find((v) => v.id === variant.id);
          if (existing) {
            const variantUpdates: Partial<{
              name: string;
              price: number;
              stock: number;
            }> = {};

            if (existing.name !== variant.name) {
              variantUpdates.name = variant.name;
            }
            if (existing.price !== variant.price) {
              variantUpdates.price = variant.price;
            }
            if (existing.stock !== variant.stock) {
              variantUpdates.stock = variant.stock;
            }

            if (Object.keys(variantUpdates).length > 0) {
              await updateProductVariant(variant.id, variantUpdates);
            }
          }
        }
      }

      alert('Product updated successfully');
      navigate('/products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!product || !confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      await deleteProduct(product.id);
      alert('Product deleted successfully');
      navigate('/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Product not found</p>
      </div>
    );
  }

  const allImages = [...existingImages, ...newImages.map((url, i) => ({ id: `new-${i}`, image_url: url, sort_order: existingImages.length + i, created_at: new Date().toISOString() }))];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe your product..."
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Product Images</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-600">Click to upload new images</p>
              <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
            </label>
          </div>

          {allImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {allImages.map((image, index) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.image_url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {image.id.startsWith('new-') ? (
                      <button
                        type="button"
                        onClick={() => removeNewImage(parseInt(image.id.replace('new-', '')))}
                        className="bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        {!image.id.startsWith('new-') && product.cover_image_url !== image.image_url && (
                          <button
                            type="button"
                            onClick={() => setAsCover(image.id)}
                            className="bg-purple-500 text-white p-1 rounded-full shadow hover:bg-purple-600 text-xs"
                            title="Set as cover"
                          >
                            ★
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeExistingImage(image.id)}
                          className="bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  {product.cover_image_url === image.image_url && (
                    <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Variants */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Product Variants (Inventory)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variant Name
              </label>
              <input
                type="text"
                value={currentVariant.name}
                onChange={(e) =>
                  setCurrentVariant({ ...currentVariant, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Size: M, Color: Black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (Kyats)
              </label>
              <input
                type="number"
                value={currentVariant.price}
                onChange={(e) =>
                  setCurrentVariant({ ...currentVariant, price: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock
              </label>
              <input
                type="number"
                value={currentVariant.stock}
                onChange={(e) =>
                  setCurrentVariant({ ...currentVariant, stock: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-4"
          >
            <Plus className="w-5 h-5" />
            Add New Variant
          </button>

          {updatedVariants.length > 0 && (
            <div className="space-y-2">
              {updatedVariants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Variant name"
                    />
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateVariant(variant.id, 'price', parseInt(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Price"
                    />
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Stock"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(variant.id)}
                    className="ml-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Product Status</h2>
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
            <span className="text-sm font-medium text-gray-700">
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            When inactive, buyers will see "This item is temporarily closed"
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleDeleteProduct}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Product
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
