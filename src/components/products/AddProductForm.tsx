import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Copy, Upload, X, Plus, Trash2, Package, Layout, DollarSign, Box, CheckCircle2, ArrowLeft, ChevronRight, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { generateSlug, generateId } from '../../lib/utils';
import type { ProductVariant } from '../../lib/schema';
import { useAuth } from '../../context/AuthContext';
import { createProduct, createProductImage, createProductVariant, getPrimaryWallet, getStoreByUserId } from '../../lib/db';

export default function AddProductForm() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
  const [error, setError] = useState('');

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
      setError('စျေးနှုန်းနှင့် လက်ကျန်ကို ဖြည့်သွင်းပါ');
    }
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const copyCreatedLink = async () => {
    if (!createdLink) return;
    await navigator.clipboard.writeText(createdLink);
    alert('Link ကို ကူးယူပြီးပါပြီ');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || images.length === 0) {
      setError('ပစ္စည်းအမည်နှင့် ပုံအနည်းဆုံးတစ်ပုံ ထည့်သွင်းပေးပါ။');
      return;
    }

    if (variants.length === 0) {
      setError('ပစ္စည်းအမျိုးအစား (Variant) အနည်းဆုံးတစ်ခု ထည့်သွင်းပေးပါ။');
      return;
    }

    if (!user) {
      setError('ကျေးဇူးပြု၍ အကောင့်အရင်ဝင်ပါ။');
      return;
    }

    setIsSubmitting(true);
    const slug = `${generateSlug(name)}-${Date.now().toString(36)}`;

    try {
      const store = await getStoreByUserId(user.id);
      if (!store || store.approval_status !== 'approved') {
        setError('သင့်ဆိုင်ကို အတည်ပြုပြီးမှသာ ပစ္စည်းတင်နိုင်မည် ဖြစ်ပါသည်။');
        return;
      }

      const wallet = await getPrimaryWallet(user.id);
      if (!wallet) {
        setError('ငွေပေးချေမှုအကောင့် အရင်ထည့်သွင်းပေးပါ။');
        window.location.href = '/profile-settings';
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
          size: variant.size,
          color: variant.color,
          color_hex: variant.color_hex,
          price: variant.price || 0,
          stock: variant.stock || 0,
        });
      }

      const link = `${window.location.origin}/order/${product.slug}`;
      setCreatedLink(link);
      await navigator.clipboard.writeText(link);
    } catch (error) {
      console.error('Error creating product:', error);
      setError('ပစ္စည်းတင်ရန် မအောင်မြင်ပါ။ နောက်တစ်ကြိမ် ပြန်ကြိုးစားကြည့်ပါ။');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-brand-primary hover:border-brand-primary/20 transition-all group"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-brand-dark tracking-tighter">ပစ္စည်းအသစ် ထည့်မည်</h1>
              <p className="text-gray-500 font-medium">ပစ္စည်းအချက်အလက်များကို Pro ဆန်ဆန် ဖြည့်သွင်းပါ</p>
            </div>
          </div>
        </div>

        {createdLink && (
          <div className="mb-10 bg-brand-primary/10 border border-brand-primary/20 rounded-[2.5rem] p-8 md:p-12 text-center animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-brand-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-primary/20">
              <CheckCircle2 className="w-10 h-10 text-brand-dark" />
            </div>
            <h2 className="text-2xl font-black text-brand-dark mb-2">ပစ္စည်းတင်ပြီးပါပြီ</h2>
            <p className="text-gray-600 font-medium mb-8">Product Link ကို ကူးယူပြီး မျှဝေလိုက်ပါ</p>
            
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <div className="flex-1 px-6 py-4 bg-white border border-brand-primary/20 rounded-2xl font-bold text-sm text-brand-dark truncate">
                {createdLink}
              </div>
              <button
                onClick={copyCreatedLink}
                className="flex items-center justify-center gap-2 bg-brand-dark text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-brand-dark transition-all shadow-xl shadow-brand-dark/10"
              >
                <Copy className="w-4 h-4" /> Link Copy ကူးမည်
              </button>
              <a
                href={createdLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-white text-brand-dark border border-gray-200 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                <ExternalLink className="w-4 h-4" /> ကြည့်မည်
              </a>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-700 animate-in slide-in-from-top-4">
             <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <X className="w-5 h-5" />
             </div>
             <p className="text-sm font-black tracking-tight">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-dark/5 border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                <Layout className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-brand-dark tracking-tight">အခြေခံအချက်အလက်</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Basic Information</p>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">ပစ္စည်းအမည် (Product Name)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary transition-all outline-none font-bold text-brand-dark"
                  placeholder="ပစ္စည်းအမည်ကို ရှင်းလင်းစွာ ရေးသားပါ"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">ဖော်ပြချက် (Description)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary transition-all outline-none font-bold text-brand-dark"
                  placeholder="ပစ္စည်းအကြောင်း အသေးစိတ် ဖော်ပြပါ..."
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-dark/5 border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-brand-dark tracking-tight">ပစ္စည်းပုံများ</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Product Images</p>
              </div>
            </div>
            
            <div className="p-8">
              <div className="border-4 border-dashed border-gray-50 rounded-[2rem] p-10 text-center hover:border-brand-primary/20 transition-all group bg-gray-50/50">
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
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-4">
                     <Upload className="w-8 h-8 text-brand-primary" />
                  </div>
                  <p className="text-brand-dark font-black text-sm uppercase tracking-widest mb-1">Click to upload</p>
                  <p className="text-xs text-gray-400 font-bold">PNG, JPG up to 10MB (အနည်းဆုံး ၁ ပုံ)</p>
                </label>
              </div>

              {images.length > 0 && (
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => moveImage(index, index - 1)}
                            className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-brand-dark hover:bg-brand-primary"
                          >
                            ←
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index < images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveImage(index, index + 1)}
                            className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-brand-dark hover:bg-brand-primary"
                          >
                            →
                          </button>
                        )}
                      </div>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-brand-primary text-brand-dark text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-lg">
                          Cover
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-dark/5 border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                <Box className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-brand-dark tracking-tight">အမျိုးအစားများနှင့် စျေးနှုန်း</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Variants & Pricing</p>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Variant Creation Form */}
              <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">အရွယ်အစား (Size)</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['S', 'M', 'L', 'XL', 'Free'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setCurrentVariant({ ...currentVariant, size })}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${
                            currentVariant.size === size
                              ? 'bg-brand-dark text-white border-brand-dark'
                              : 'bg-white text-gray-500 border-gray-100 hover:border-brand-primary'
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
                      className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-brand-dark outline-none focus:ring-4 focus:ring-brand-primary/10"
                      placeholder="သို့မဟုတ် ကိုယ်တိုင်ရေးပါ"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">အရောင် (Color)</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {[
                        { name: 'Black', hex: '#000000' },
                        { name: 'White', hex: '#FFFFFF' },
                        { name: 'Red', hex: '#EF4444' },
                        { name: 'Blue', hex: '#3B82F6' },
                      ].map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setCurrentVariant({ ...currentVariant, color: c.name, color_hex: c.hex })}
                          className={`w-8 h-8 rounded-full border-2 shadow-sm transition-all ${
                            currentVariant.color === c.name ? 'ring-2 ring-brand-primary ring-offset-2 scale-110' : 'border-white'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentVariant.color}
                        onChange={(e) => setCurrentVariant({ ...currentVariant, color: e.target.value })}
                        className="flex-1 px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-brand-dark outline-none focus:ring-4 focus:ring-brand-primary/10"
                        placeholder="အရောင်အမည်"
                      />
                      <input
                        type="color"
                        value={currentVariant.color_hex || '#000000'}
                        onChange={(e) => setCurrentVariant({ ...currentVariant, color_hex: e.target.value })}
                        className="w-14 h-12 bg-white border border-gray-100 rounded-xl cursor-pointer p-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">စျေးနှုန်း (Ks)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input
                        type="number"
                        value={currentVariant.price}
                        onChange={(e) => setCurrentVariant({ ...currentVariant, price: e.target.value })}
                        className="w-full pl-10 pr-6 py-3 bg-white border border-gray-100 rounded-xl font-bold text-brand-dark outline-none focus:ring-4 focus:ring-brand-primary/10"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">လက်ကျန် (Stock)</label>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input
                        type="number"
                        value={currentVariant.stock}
                        onChange={(e) => setCurrentVariant({ ...currentVariant, stock: e.target.value })}
                        className="w-full pl-10 pr-6 py-3 bg-white border border-gray-100 rounded-xl font-bold text-brand-dark outline-none focus:ring-4 focus:ring-brand-primary/10"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addVariant}
                  className="w-full bg-brand-primary text-brand-dark py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/10 hover:bg-brand-dark hover:text-white transition-all active:scale-[0.98] transform flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> အမျိုးအစား ထည့်သွင်းမည်
                </button>
              </div>

              {/* Added Variants List */}
              {variants.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ထည့်သွင်းပြီး အမျိုးအစားများ</h4>
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm group hover:border-brand-primary/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-brand-dark font-black text-xs border border-gray-100">
                          {variant.size || 'N/A'}
                        </div>
                        <div>
                          <p className="font-black text-brand-dark text-sm">{variant.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-xs font-bold text-brand-primary">{variant.price?.toLocaleString()} Ks</span>
                             <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock: {variant.stock}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="w-10 h-10 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status & Final Submit */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-dark/5 border border-gray-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-primary"></div>
              </label>
              <div>
                <span className="text-sm font-black text-brand-dark uppercase tracking-widest block">
                  {isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product Status</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto min-w-[240px] bg-brand-dark text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-brand-primary hover:text-brand-dark transition-all shadow-2xl shadow-brand-dark/20 disabled:opacity-50 active:scale-[0.98] transform flex items-center justify-center gap-3"
            >
              {isSubmitting ? 'Publishing...' : (
                <>
                  Product တင်မည် <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
