import React, { useState } from 'react';
import { Upload, X, Plus, Trash2 } from 'lucide-react';
import { generateSlug, generateId } from '../../lib/utils';
import type { Product, ProductVariant } from '../../lib/schema';
import { useAuth } from '../../context/AuthContext';
import { createProduct, createProductImage, createProductVariant } from '../../lib/db';

export default function AddProductForm() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>([]);
  const [currentVariant, setCurrentVariant] = useState({
    name: '',
    price: '',
    stock: '',
  });
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, you'd upload to a storage service
      // For now, use placeholder URLs
      const newImages = Array.from(files).map((_, index) => 
        `https://via.placeholder.com/400x400?text=Image+${images.length + index + 1}`
      );
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
  };

  const addVariant = () => {
    if (currentVariant.name && currentVariant.price && currentVariant.stock) {
      setVariants([
        ...variants,
        {
          ...currentVariant,
          id: generateId(),
          price: parseInt(currentVariant.price),
          stock: parseInt(currentVariant.stock),
          created_at: new Date().toISOString(),
        },
      ]);
      setCurrentVariant({ name: '', price: '', stock: '' });
    }
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || images.length === 0) {
      alert('Please fill in product name and add at least one image');
      return;
    }

    if (!user) {
      alert('Please log in first');
      return;
    }

    setIsSubmitting(true);
    const slug = generateSlug(name);

    try {
      // Create product
      const product = await createProduct({
        user_id: user.id,
        store_id: user.id, // Using user_id as store_id for now (TODO: create separate store)
        name,
        description,
        slug,
        cover_image_url: images[0],
        is_active: isActive,
      });

      // Create product images
      for (let i = 0; i < images.length; i++) {
        await createProductImage({
          product_id: product.id,
          image_url: images[i],
          sort_order: i,
        });
      }

      // Create product variants
      for (const variant of variants) {
        await createProductVariant({
          product_id: product.id,
          name: variant.name || '',
          price: variant.price || 0,
          stock: variant.stock || 0,
        });
      }

      alert(`Product created! Share link: https://orderpote.com/order/${slug}`);
      window.location.href = '/products';
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Product</h1>

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
          <h2 className="text-xl font-semibold mb-4">Product Images *</h2>
          
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
              <p className="text-gray-600">Click to upload images</p>
              <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
            </label>
          </div>

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index - 1)}
                        className="bg-white p-1 rounded-full shadow hover:bg-gray-100"
                      >
                        ←
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index + 1)}
                        className="bg-white p-1 rounded-full shadow hover:bg-gray-100"
                      >
                        →
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {index === 0 && (
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
          <h2 className="text-xl font-semibold mb-4">Product Variants</h2>
          
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
            Add Variant
          </button>

          {variants.length > 0 && (
            <div className="space-y-2">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{variant.name}</p>
                    <p className="text-sm text-gray-600">
                      {variant.price} Kyats - Stock: {variant.stock}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-600 hover:text-red-700"
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
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
            {isSubmitting ? 'Publishing...' : 'Publish Product'}
          </button>
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
