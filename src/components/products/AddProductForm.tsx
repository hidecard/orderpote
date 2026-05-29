import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Copy, Upload, X, Plus, Trash2 } from 'lucide-react';
import { generateSlug, generateId } from '../../lib/utils';
import type { ProductVariant } from '../../lib/schema';
import { useAuth } from '../../context/AuthContext';
import { createProduct, createProductImage, createProductVariant, getPrimaryWallet, getStoreByUserId, createProductAttribute, createProductVariantWithAttributes } from '../../lib/db';
import CustomAttributeInput from './CustomAttributeInput';
import VariantMatrixGenerator from './VariantMatrixGenerator';

interface Attribute {
  id: string;
  name: string;
  values: string[];
}

interface VariantRow {
  id: string;
  combination: Record<string, string>;
  displayName: string;
  price: number;
  stock: number;
  costPrice: number;
}

export default function AddProductForm() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>([]);
  const [currentVariant, setCurrentVariant] = useState({
    name: '',
    size: '',
    color: '',
    color_hex: '',
    price: '',
    stock: '',
  });
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdLink, setCreatedLink] = useState('');
  
  // Custom attributes state
  const [useCustomAttributes, setUseCustomAttributes] = useState(false);
  const [customAttributes, setCustomAttributes] = useState<Attribute[]>([]);
  const [variantMatrix, setVariantMatrix] = useState<VariantRow[]>([]);

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
      const newImages = await Promise.all(Array.from(files).map(readImageAsDataUrl));
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
    if (currentVariant.price && currentVariant.stock) {
      setVariants([
        ...variants,
        {
          ...currentVariant,
          id: generateId(),
          name: currentVariant.size && currentVariant.color 
            ? `${currentVariant.size} - ${currentVariant.color}`
            : currentVariant.size || currentVariant.color || currentVariant.name,
          price: parseInt(currentVariant.price),
          stock: parseInt(currentVariant.stock),
          created_at: new Date().toISOString(),
        },
      ]);
      setCurrentVariant({ name: '', size: '', color: '', color_hex: '', price: '', stock: '' });
    } else {
      alert('စျေးနှုန်းနှင့် လက်ကျန်ကို ဖြည့်သွင်းပါ (Please fill in price and stock)');
    }
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const copyCreatedLink = async () => {
    if (!createdLink) return;
    await navigator.clipboard.writeText(createdLink);
    alert('Product link copied');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || images.length === 0) {
      alert('Please fill in product name and add at least one image');
      return;
    }

    // Check variants based on mode
    if (useCustomAttributes) {
      if (variantMatrix.length === 0) {
        alert('Please add at least one attribute to generate variants');
        return;
      }
      // Check if all variants have price and stock
      const invalidVariants = variantMatrix.filter(v => v.price <= 0 || v.stock < 0);
      if (invalidVariants.length > 0) {
        alert('Please fill in price and stock for all variants');
        return;
      }
    } else {
      if (variants.length === 0) {
        alert('Please add at least one product variant with price and stock');
        return;
      }
    }

    if (!user) {
      alert('Please log in first');
      return;
    }

    setIsSubmitting(true);
    const slug = `${generateSlug(name)}-${Date.now().toString(36)}`;

    try {
      const store = await getStoreByUserId(user.id);
      if (!store || store.approval_status !== 'approved') {
        alert('Your shop must be approved before publishing products');
        return;
      }

      const wallet = await getPrimaryWallet(user.id);
      if (!wallet) {
        alert('Please set up a payment wallet before publishing products');
        window.location.href = '/wallet-setup';
        return;
      }

      // Create product
      const product = await createProduct({
        user_id: user.id,
        store_id: store.id,
        name,
        description,
        slug,
        cover_image_url: images[0],
        is_active: isActive,
        cost_price: parseInt(costPrice) || 0,
      });

      // Create product images
      for (let i = 0; i < images.length; i++) {
        await createProductImage({
          product_id: product.id,
          image_url: images[i],
          sort_order: i,
        });
      }

      // Create product variants based on mode
      if (useCustomAttributes) {
        // Save custom attributes to database
        for (let i = 0; i < customAttributes.length; i++) {
          await createProductAttribute({
            product_id: product.id,
            name: customAttributes[i].name,
            values: customAttributes[i].values,
            sort_order: i,
          });
        }

        // Create variants from matrix
        for (const variantRow of variantMatrix) {
          await createProductVariantWithAttributes({
            product_id: product.id,
            name: variantRow.displayName,
            price: variantRow.price,
            stock: variantRow.stock,
            cost_price: variantRow.costPrice,
          }, variantRow.combination);
        }
      } else {
        // Use traditional variant system
        for (const variant of variants) {
          await createProductVariant({
            product_id: product.id,
            name: variant.name || '',
            size: variant.size,
            color: variant.color,
            color_hex: variant.color_hex,
            price: variant.price || 0,
            stock: variant.stock || 0,
          });
        }
      }

      const link = `${window.location.origin}/order/${product.slug}`;
      setCreatedLink(link);
      await navigator.clipboard.writeText(link);
      alert(`Product created and link copied:\n${link}`);
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

      {createdLink && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="font-semibold text-green-900 mb-2">Product published</p>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={createdLink}
              readOnly
              className="flex-1 px-4 py-3 border border-green-200 rounded-lg bg-white text-sm"
            />
            <button
              type="button"
              onClick={copyCreatedLink}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
            <a
              href={createdLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center border border-green-300 text-green-700 px-5 py-3 rounded-lg hover:bg-green-100 transition-colors"
            >
              Open
            </a>
          </div>
        </div>
      )}

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ရင်းနှီးစျေးနှုန်း (Cost Price - COGS)
              </label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">ပစ္စည်းတစ်ခုချင်းစီရဲ့ ရင်းနှီးရတဲ့ စျေးနှုန်း (ကျပ်)</p>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">ပစ္စည်းအမျိုးအစားများ (Product Variants)</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomAttributes}
                onChange={(e) => setUseCustomAttributes(e.target.checked)}
                className="w-4 h-4 text-[#1a7f8c] border-gray-300 rounded focus:ring-[#1a7f8c]"
              />
              <span className="text-sm text-gray-700">Custom Attributes သုံးမည်</span>
            </label>
          </div>

          {!useCustomAttributes ? (
            <>
              <p className="text-sm text-gray-600 mb-4">အရွယ်အစား (Size) နှင့် အရောင် (Color) ကို ရွေးချယ်ပါ</p>
              
              <div className="space-y-4 mb-4">
                {/* Size Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    အရွယ်အစား (Size)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setCurrentVariant({ ...currentVariant, size })}
                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                          currentVariant.size === size
                            ? 'border-[#1a7f8c] bg-[#1a7f8c] text-white'
                            : 'border-gray-300 hover:border-[#1a7f8c] text-gray-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={currentVariant.size}
                    onChange={(e) => setCurrentVariant({ ...currentVariant, size: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="သိုမဟုတ် ကိုယ်တိုင်ရေးသားပါ"
                  />
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    အရောင် (Color)
                  </label>
                  <div className="flex flex-wrap gap-3 mb-2">
                    {[
                      { name: 'Black', hex: '#000000' },
                      { name: 'White', hex: '#FFFFFF' },
                      { name: 'Red', hex: '#EF4444' },
                      { name: 'Blue', hex: '#3B82F6' },
                      { name: 'Green', hex: '#10B981' },
                      { name: 'Yellow', hex: '#F59E0B' },
                      { name: 'Purple', hex: '#8B5CF6' },
                      { name: 'Pink', hex: '#EC4899' },
                    ].map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setCurrentVariant({ ...currentVariant, color: color.name, color_hex: color.hex })}
                        className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                          currentVariant.color === color.name
                            ? 'border-[#1a7f8c] ring-2 ring-[#1a7f8c] ring-offset-2'
                            : 'border-gray-300 hover:border-[#1a7f8c]'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {currentVariant.color === color.name && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentVariant.color}
                      onChange={(e) => setCurrentVariant({ ...currentVariant, color: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="အရောင်အမည်"
                    />
                    <input
                      type="color"
                      value={currentVariant.color_hex || '#000000'}
                      onChange={(e) => setCurrentVariant({ ...currentVariant, color_hex: e.target.value })}
                      className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Price and Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      စျေးနှုန်း (Price) *
                    </label>
                    <input
                      type="number"
                      value={currentVariant.price}
                      onChange={(e) => setCurrentVariant({ ...currentVariant, price: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      လက်ကျန် (Stock) *
                    </label>
                    <input
                      type="number"
                      value={currentVariant.stock}
                      onChange={(e) => setCurrentVariant({ ...currentVariant, stock: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 bg-[#1a7f8c] text-white px-4 py-2 rounded-lg hover:bg-[#156a75] transition-colors font-semibold mb-4"
              >
                <Plus className="w-5 h-5" />
                အမျိုးအစားထည့်ရန် (Add Variant)
              </button>

              {variants.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700">ထည့်ပြီးအမျိုးအစားများ:</h3>
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {variant.color_hex && (
                          <div
                            className="w-8 h-8 rounded-full border-2"
                            style={{ backgroundColor: variant.color_hex }}
                          />
                        )}
                        <div>
                          <p className="font-semibold">{variant.name}</p>
                          <p className="text-sm text-gray-600">
                            {variant.size && `Size: ${variant.size} `}
                            {variant.color && `Color: ${variant.color}`}
                          </p>
                          <p className="text-sm text-[#1a7f8c] font-semibold">
                            {variant.price?.toLocaleString()} Ks - Stock: {variant.stock}
                          </p>
                        </div>
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
            </>
          ) : (
            <>
              <CustomAttributeInput 
                attributes={customAttributes} 
                onChange={setCustomAttributes} 
              />
              <VariantMatrixGenerator 
                attributes={customAttributes}
                onVariantsChange={setVariantMatrix}
              />
            </>
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
            onClick={() => window.location.href = '/products'}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
