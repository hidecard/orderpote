import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Store, Save, ArrowLeft, Camera, Shield, CheckCircle2, Layout, Phone, User, MapPin, AlignLeft, Tag, BellRing } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoreByUserId, updateStore, getProductsByUserId, updateProduct } from '../../lib/db';
import type { Store as StoreType, Product } from '../../lib/schema';
import { StoreSettingsSkeleton } from '../ui/Skeleton';

export default function StoreSettings() {
  const { user } = useAuth();
  const [store, setStore] = useState<StoreType | null>(null);
  const [storeName, setStoreName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [thresholds, setThresholds] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchStore() {
      if (!user) {
        setIsFetching(false);
        return;
      }

      try {
        const storeData = await getStoreByUserId(user.id);
        if (storeData) {
          setStore(storeData);
          setStoreName(storeData.name);
          setContactPerson(storeData.contact_person);
          setStorePhone(storeData.phone);
          setCategory(storeData.category);
          setAddress(storeData.address);
          setDescription(storeData.description);
          setLogoUrl(storeData.logo_url || '');
        }
        const prods = await getProductsByUserId(user.id);
        setProducts(prods);
        const map: Record<string, number> = {};
        prods.forEach((p) => {
          map[p.id] = (p as any).low_stock_threshold ?? 5;
        });
        setThresholds(map);
      } catch (error) {
        console.error('Error fetching store:', error);
        setError('ဆိုင်အချက်အလက်များ ရယူ၍မရပါ။');
      } finally {
        setIsFetching(false);
      }
    }

    fetchStore();
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user || !store) {
      setError('ဦးစွာ အကောင့်ဝင်ပါ။');
      return;
    }

    if (!storeName || !contactPerson || !storePhone || !category || !address || !description) {
      setError('လိုအပ်သော အချက်အလက်များအားလုံး ဖြည့်သွင်းပါ။');
      return;
    }

    setIsLoading(true);
    try {
      await updateStore(store.id, {
        name: storeName,
        logo_url: logoUrl || undefined,
        contact_person: contactPerson,
        phone: storePhone,
        category,
        address,
        description,
      });

      setSuccess('ဆိုင်ဆက်တင်များကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။');
      
      const updatedStore = await getStoreByUserId(user.id);
      if (updatedStore) {
        setStore(updatedStore);
      }
    } catch (error) {
      console.error('Error updating store:', error);
      setError('သိမ်းဆည်းမှု မအောင်မြင်ပါ။ နောက်တစ်ကြိမ် ပြန်လည်ကြိုးစားကြည့်ပါ။');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <StoreSettingsSkeleton />;
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] shadow-xl p-10 max-w-md text-center border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tighter mb-3">ဆိုင်မတွေ့ပါ</h1>
          <p className="text-gray-500 font-medium mb-8">သင့်ဆိုင်အချက်အလက်များ မရှိသေးပါ။ ဦးစွာ ဆိုင်ဖန်တီးပါ။</p>
          <a href="/dashboard" className="inline-block w-full bg-brand-dark text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-primary hover:text-brand-dark transition-all">ပြန်သွားမည်</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
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
              <h1 className="text-3xl font-black text-brand-dark tracking-tighter">ဆိုင်ဆက်တင်များ</h1>
              <p className="text-gray-500 font-medium">သင့်ဆိုင်၏ အချက်အလက်များကို စီမံခန့်ခွဲပါ</p>
            </div>
          </div>
          <div className={`px-5 py-2.5 rounded-full border flex items-center gap-2 transition-all ${
            store.approval_status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
            store.approval_status === 'rejected' ? 'bg-red-50 border-red-100 text-red-700' :
            'bg-amber-50 border-amber-100 text-amber-700'
          }`}>
            <Shield className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">
              Status: {store.approval_status === 'approved' ? 'အတည်ပြုပြီး' : store.approval_status === 'rejected' ? 'ပယ်ချခံရသည်' : 'စောင့်ဆိုင်းဆဲ'}
            </span>
          </div>
        </div>

        {/* Alerts */}
        {(error || success) && (
          <div className={`mb-8 p-5 rounded-[1.5rem] border animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-4 ${
            error ? 'bg-red-50 border-red-100 text-red-700' : 'bg-brand-primary/5 border-brand-primary/20 text-brand-dark'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${error ? 'bg-red-100' : 'bg-brand-primary/20'}`}>
              {error ? <AlignLeft className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 text-brand-primary" />}
            </div>
            <p className="text-sm font-black tracking-tight">{error || success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Logo & Quick Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-dark/5 border border-gray-100 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="relative inline-block group">
                  <div className="w-40 h-40 bg-gray-50 rounded-[3rem] border-4 border-white shadow-xl overflow-hidden flex items-center justify-center group-hover:border-brand-primary/20 transition-all duration-500">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Store logo" className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-16 h-16 text-gray-200" />
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 w-12 h-12 bg-brand-dark text-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center cursor-pointer hover:bg-brand-primary hover:text-brand-dark transition-all transform active:scale-90">
                    <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setLogoUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                
                <h2 className="mt-6 text-2xl font-black text-brand-dark tracking-tighter">{storeName || 'သင့်ဆိုင်အမည်'}</h2>
                <p className="text-gray-400 font-bold text-sm tracking-wide uppercase mt-1">{category || 'Category'}</p>
              </div>
            </div>

            {/* Threshold Info */}
            <div className="bg-brand-dark rounded-[2.5rem] p-8 text-white shadow-2xl shadow-brand-dark/20 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-primary/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <BellRing className="w-6 h-6 text-brand-primary" />
                  <h3 className="text-lg font-black tracking-tight">စတော့ အသိပေးချက်</h3>
                </div>
                <p className="text-white/60 text-sm font-medium leading-relaxed">
                  ပစ္စည်းတစ်ခုချင်းစီအတွက် စတော့နည်းနေပါက သင့်ကို အလိုအလျောက် အသိပေးမည်ဖြစ်ပါသည်။
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Form Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-dark/5 border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                  <Layout className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-brand-dark tracking-tight">ဆိုင်အချက်အလက်များ</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Store Information Details</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                <div className="space-y-6">
                  {/* Basic Info Group */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">ဆိုင်အမည် (Store Name)</label>
                      <div className="relative group">
                        <Store className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-primary transition-colors" />
                        <input
                          type="text"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary transition-all outline-none font-bold text-brand-dark"
                          placeholder="ဆိုင်အမည် ရိုက်ထည့်ပါ"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">လုပ်ငန်းအမျိုးအစား (Category)</label>
                      <div className="relative group">
                        <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-primary transition-colors" />
                        <input
                          type="text"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary transition-all outline-none font-bold text-brand-dark"
                          placeholder="အဝတ်အထည်၊ အစားအသောက် စသည်"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Info Group */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">ဆက်သွယ်ရမည့်သူ (Contact)</label>
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-primary transition-colors" />
                        <input
                          type="text"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary transition-all outline-none font-bold text-brand-dark"
                          placeholder="ပိုင်ရှင် သို့မဟုတ် မန်နေဂျာ"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">ဆိုင်ဖုန်း (Phone)</label>
                      <div className="relative group">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-primary transition-colors" />
                        <input
                          type="tel"
                          value={storePhone}
                          onChange={(e) => setStorePhone(e.target.value)}
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary transition-all outline-none font-bold text-brand-dark"
                          placeholder="၀၉-XXXXXXXXX"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address & Description */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">ဆိုင်လိပ်စာ (Address)</label>
                    <div className="relative group">
                      <MapPin className="absolute left-5 top-5 w-5 h-5 text-gray-300 group-focus-within:text-brand-primary transition-colors" />
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary transition-all outline-none font-bold text-brand-dark min-h-[100px]"
                        placeholder="ဆိုင်လိပ်စာ အပြည့်အစုံ"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">ဆိုင်ဖော်ပြချက် (Description)</label>
                    <div className="relative group">
                      <AlignLeft className="absolute left-5 top-5 w-5 h-5 text-gray-300 group-focus-within:text-brand-primary transition-colors" />
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary transition-all outline-none font-bold text-brand-dark min-h-[120px]"
                        placeholder="ရောင်းချမည့် ပစ္စည်းအမျိုးအစားများနှင့် ဆိုင်အကြောင်း အကျဉ်းချုပ်"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-brand-dark text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-brand-primary hover:text-brand-dark transition-all shadow-xl shadow-brand-dark/10 disabled:opacity-50 active:scale-[0.98] transform flex items-center justify-center gap-3"
                  >
                    {isLoading ? 'သိမ်းဆည်းနေသည်...' : (
                      <>
                        အပြောင်းအလဲများ သိမ်းဆည်းမည် <Save className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Low Stock Management */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-dark/5 border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                  <BellRing className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-brand-dark tracking-tight">ပစ္စည်းတစ်ခုချင်းစီ၏ စတော့ကန့်သတ်ချက်</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Low Stock Threshold Settings</p>
                </div>
              </div>

              <div className="p-8 space-y-4">
                {products.length === 0 ? (
                  <p className="text-center py-10 text-gray-400 font-bold">ပစ္စည်းများ မရှိသေးပါ။</p>
                ) : (
                  products.map((p) => (
                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-brand-primary/20 transition-all group">
                      <div>
                        <div className="text-sm font-black text-brand-dark group-hover:text-brand-primary transition-colors">{p.name}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{p.slug}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative w-24">
                          <input
                            type="number"
                            min={0}
                            value={thresholds[p.id] ?? 5}
                            onChange={(e) => setThresholds({ ...thresholds, [p.id]: Number(e.target.value) })}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl font-black text-brand-dark text-center focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                          />
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await updateProduct(p.id, { low_stock_threshold: thresholds[p.id] });
                              setSuccess(`${p.name} အတွက် စတော့ကန့်သတ်ချက် သိမ်းဆည်းပြီးပါပြီ။`);
                              const refreshed = await getProductsByUserId((user as any).id);
                              setProducts(refreshed);
                            } catch (err) {
                              console.error('Failed to update threshold', err);
                              setError('အပ်ဒိတ်လုပ်ရန် မအောင်မြင်ပါ။');
                            }
                          }}
                          className="px-5 py-2.5 bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-primary hover:text-brand-dark transition-all shadow-lg active:scale-95 transform"
                        >
                          သိမ်းမည်
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
