import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X, Plus, Trash2, ArrowLeft, Layout, ImageIcon, Box, CheckCircle2, DollarSign, Package, ChevronRight, Star } from 'lucide-react';
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

function parseVariantName(name: string): { size?: string; color?: string } {
  const parts = name.split(' - ');
  if (parts.length === 2) {
    const size = parts[0].trim();
    const color = parts[1].trim();
    const sizePatterns = /^(XS|S|M|L|XL|XXL|\d+XL?|\d+)$/i;
    if (sizePatterns.test(size)) return { size, color };
  }
  return {};
}

function getVariantSize(variant: ProductVariant): string | undefined {
  if (variant.size) return variant.size;
  const parsed = parseVariantName(variant.name);
  return parsed.size || variant.name;
}

function getVariantColor(variant: ProductVariant): string | undefined {
  if (variant.color) return variant.color;
  const parsed = parseVariantName(variant.name);
  return parsed.color;
}

function getVariantColorHex(variant: ProductVariant): string {
  if (variant.color_hex) return variant.color_hex;
  return '#000000';
}

export default function EditProductForm() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [existingVariants, setExistingVariants] = useState<ProductVariant[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [updatedVariants, setUpdatedVariants] = useState<{ id: string; name: string; size?: string; color?: string; color_hex?: string; price: number; stock: number }[]>([]);
  const [currentVariant, setCurrentVariant] = useState({
    name: '',
    size: '',
    color: '',
    color_hex: '',
    price: '',
    stock: '',
  });
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
          setUpdatedVariants(variantsData.map(v => ({ 
            id: v.id, 
            name: v.name, 
            size: v.size || getVariantSize(v), 
            color: v.color || getVariantColor(v), 
            color_hex: v.color_hex || getVariantColorHex(v),
            price: v.price, 
            stock: v.stock 
          })));
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
            height *= maxSize / width; width = maxSize;
          } else if (height > maxSize) {
            width *= maxSize / height; height = maxSize;
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
    if (!confirm('ဤပုံကို ဖျက်ရန် သေချာပါသလား?')) return;
    try {
      await deleteProductImage(imageId);
      setExistingImages(existingImages.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const setAsCover = async (imageId: string) => {
    if (!product) return;
    try {
      const img = existingImages.find(img => img.id === imageId);
      if (img) {
        await updateProduct(product.id, { cover_image_url: img.image_url });
        setProduct({ ...product, cover_image_url: img.image_url });
      }
    } catch (error) {
      console.error('Error setting cover image:', error);
    }
  };

  const addVariant = () => {
    if (currentVariant.price && currentVariant.stock) {
      const newVariant = {
        id: `new-${Date.now()}`,
        name: currentVariant.size && currentVariant.color 
          ? `${currentVariant.size} - ${currentVariant.color}`
          : currentVariant.size || currentVariant.color || currentVariant.name,
        size: currentVariant.size,
        color: currentVariant.color,
        color_hex: currentVariant.color_hex,
        price: parseInt(currentVariant.price),
        stock: parseInt(currentVariant.stock),
      };
      setUpdatedVariants([...updatedVariants, newVariant]);
      setCurrentVariant({ name: '', size: '', color: '', color_hex: '', price: '', stock: '' });
    } else {
      setError('စျေးနှုန်းနှင့် လက်ကျန်ကို ဖြည့်သွင်းပါ');
    }
  };

  const removeVariant = async (variantId: string) => {
    if (!confirm('ဤအမျိုးအစားကို ဖျက်ရန် သေချာပါသလား?')) return;
    if (!variantId.startsWith('new-')) {
      try {
        await deleteProductVariant(variantId);
      } catch (error) {
        console.error('Error deleting variant:', error);
        return;
      }
    }
    setUpdatedVariants(updatedVariants.filter(v => v.id !== variantId));
  };

  const updateVariant = (variantId: string, field: 'name' | 'size' | 'color' | 'color_hex' | 'price' | 'stock', value: string | number) => {
    setUpdatedVariants(updatedVariants.map(v => v.id === variantId ? { ...v, [field]: value } : v));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!product || !productId) return;
    if (!name) { setError('ပစ္စည်းအမည် ဖြည့်သွင်းပေးပါ။'); return; }
    if (updatedVariants.length === 0) { setError('အမျိုးအစား အနည်းဆုံးတစ်ခု ရှိရပါမည်။'); return; }

    setIsSubmitting(true);
    try {
      await updateProduct(productId, { name, description, is_active: isActive });
      for (let i = 0; i < newImages.length; i++) {
        await createProductImage({ product_id: productId, image_url: newImages[i], sort_order: existingImages.length + i });
      }
      for (const variant of updatedVariants) {
        if (variant.id.startsWith('new-')) {
          await createProductVariant({ product_id: productId, name: variant.name, size: variant.size, color: variant.color, color_hex: variant.color_hex, price: variant.price, stock: variant.stock });
        } else {
          const existing = existingVariants.find((v) => v.id === variant.id);
          if (existing) {
            const updates: any = {};
            if (existing.name !== variant.name) updates.name = variant.name;
            if (existing.size !== variant.size) updates.size = variant.size;
            if (existing.color !== variant.color) updates.color = variant.color;
            if (existing.color_hex !== variant.color_hex) updates.color_hex = variant.color_hex;
            if (existing.price !== variant.price) updates.price = variant.price;
            if (existing.stock !== variant.stock) updates.stock = variant.stock;
            if (Object.keys(updates).length > 0) await updateProductVariant(variant.id, updates);
          }
        }
      }
      navigate('/products');
    } catch (error) {
      console.error('Error updating product:', error);
      setError('ပြင်ဆင်မှု မအောင်မြင်ပါ။');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!product || !confirm('ဤပစ္စည်းကို ဖျက်ရန် သေချာပါသလား?')) return;
    try {
      setIsSubmitting(true);
      await deleteProduct(product.id);
      navigate('/products');
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const allImages = [...existingImages, ...newImages.map((url, i) => ({ id: `new-${i}`, image_url: url, sort_order: existingImages.length + i, created_at: new Date().toISOString() }))];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/products')} className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-brand-primary transition-all group">
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-brand-dark tracking-tighter">ပစ္စည်းပြင်ဆင်ရန်</h1>
              <p className="text-gray-500 font-medium">ပစ္စည်းအချက်အလက်များကို အပ်ဒိတ်လုပ်ပါ</p>
            </div>
          </div>
          <button onClick={handleDeleteProduct} className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all">
            Delete Product
          </button>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-700">
             <X className="w-5 h-5" />
             <p className="text-sm font-black tracking-tight">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-dark/5 border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                <Layout className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-brand-dark tracking-tight">အခြေခံအချက်အလက်</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">ပစ္စည်းအမည်</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary transition-all outline-none font-bold text-brand-dark" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">ဖော်ပြချက်</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary transition-all outline-none font-bold text-brand-dark" />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-dark/5 border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-brand-dark tracking-tight">ပစ္စည်းပုံများ</h3>
            </div>
            <div className="p-8">
              <div className="border-4 border-dashed border-gray-50 rounded-[2rem] p-10 text-center hover:border-brand-primary/20 transition-all group bg-gray-50/50 mb-8">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-brand-primary mb-2" />
                  <p className="text-brand-dark font-black text-sm uppercase">Click to upload new images</p>
                </label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {allImages.map((image, index) => (
                  <div key={image.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                    <img src={(image as any).image_url} alt="Product" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!image.id.startsWith('new-') && product?.cover_image_url !== (image as any).image_url && (
                        <button type="button" onClick={() => setAsCover(image.id)} className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-brand-dark"><Star className="w-4 h-4 fill-brand-dark" /></button>
                      )}
                      <button type="button" onClick={() => image.id.startsWith('new-') ? removeNewImage(parseInt(image.id.replace('new-', ''))) : removeExistingImage(image.id)} className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white"><X className="w-4 h-4" /></button>
                    </div>
                    {product?.cover_image_url === (image as any).image_url && <div className="absolute top-2 left-2 bg-brand-primary text-brand-dark text-[8px] font-black uppercase px-2 py-1 rounded-md shadow-lg">Cover</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-dark/5 border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                <Box className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-brand-dark tracking-tight">အမျိုးအစားများနှင့် စျေးနှုန်း</h3>
            </div>
            <div className="p-8 space-y-8">
              <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Size / Color</label>
                    <div className="flex gap-2">
                      <input type="text" value={currentVariant.size} onChange={(e) => setCurrentVariant({ ...currentVariant, size: e.target.value })} className="flex-1 px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold" placeholder="Size" />
                      <input type="text" value={currentVariant.color} onChange={(e) => setCurrentVariant({ ...currentVariant, color: e.target.value })} className="flex-1 px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold" placeholder="Color" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price</label>
                      <input type="number" value={currentVariant.price} onChange={(e) => setCurrentVariant({ ...currentVariant, price: e.target.value })} className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock</label>
                      <input type="number" value={currentVariant.stock} onChange={(e) => setCurrentVariant({ ...currentVariant, stock: e.target.value })} className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold" placeholder="0" />
                    </div>
                  </div>
                </div>
                <button type="button" onClick={addVariant} className="w-full bg-brand-primary text-brand-dark py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all active:scale-95"><Plus className="w-4 h-4" /> အမျိုးအစားသစ် ထည့်မည်</button>
              </div>

              <div className="space-y-3">
                {updatedVariants.map((variant) => (
                  <div key={variant.id} className="p-5 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <input type="text" value={variant.size || ''} onChange={(e) => updateVariant(variant.id, 'size', e.target.value)} className="px-4 py-2 bg-gray-50 border-none rounded-xl font-bold text-xs" placeholder="Size" />
                      <input type="text" value={variant.color || ''} onChange={(e) => updateVariant(variant.id, 'color', e.target.value)} className="px-4 py-2 bg-gray-50 border-none rounded-xl font-bold text-xs" placeholder="Color" />
                      <input type="number" value={variant.price} onChange={(e) => updateVariant(variant.id, 'price', parseInt(e.target.value))} className="px-4 py-2 bg-gray-50 border-none rounded-xl font-bold text-xs" placeholder="Price" />
                      <input type="number" value={variant.stock} onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value))} className="px-4 py-2 bg-gray-50 border-none rounded-xl font-bold text-xs" placeholder="Stock" />
                    </div>
                    <button type="button" onClick={() => removeVariant(variant.id)} className="w-10 h-10 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-dark/5 border border-gray-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="sr-only peer" />
                <div className="w-14 h-8 bg-gray-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-primary"></div>
              </label>
              <span className="text-sm font-black text-brand-dark uppercase">Active Status</span>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full md:w-auto min-w-[240px] bg-brand-dark text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-brand-primary hover:text-brand-dark transition-all flex items-center justify-center gap-3 shadow-2xl shadow-brand-dark/20">{isSubmitting ? 'Saving...' : <>အပြောင်းအလဲများ သိမ်းဆည်းမည် <ChevronRight className="w-5 h-5" /></>}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
