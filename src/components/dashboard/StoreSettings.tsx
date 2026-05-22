import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Store, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoreByUserId, updateStore, getProductsByUserId, updateProduct } from '../../lib/db';
import type { Store as StoreType, Product } from '../../lib/schema';

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
        setError('Failed to load store data');
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
      setError('Please log in first');
      return;
    }

    if (!storeName || !contactPerson || !storePhone || !category || !address || !description) {
      setError('Please fill in all required fields');
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

      setSuccess('Store settings updated successfully!');
      
      // Refresh store data
      const updatedStore = await getStoreByUserId(user.id);
      if (updatedStore) {
        setStore(updatedStore);
      }
    } catch (error) {
      console.error('Error updating store:', error);
      setError('Failed to update store settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a7f8c]"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">ဆိုင်မတွေ့ပါ</h1>
          <p className="text-gray-600">သင့်ဆိုင်မရှိသေးပါ။ ဦးစွာ ဖန်တီးပါ။</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">ဆိုင်ဆက်တင်များ</h1>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#1a7f8c]/10 rounded-lg">
              <Store className="w-6 h-6 text-[#1a7f8c]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">ဆိုင်အချက်အလက် ပြင်ဆင်မည်</h2>
              <p className="text-sm text-gray-600">သင့်ဆိုင်အသေးစိတ် အပ်ဒိတ်လုပ်ပါ</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ဆိုင်အမည် *
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                placeholder="ကျွန်ုပ်၏ စတိုးဆိုင်"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ဆက်သွယ်ရမည့်သူ *
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                  placeholder="ပိုင်ရှင် သို့မဟုတ် မန်နေဂျာ အမည်"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ဆိုင်ဖုန်း *
                </label>
                <input
                  type="tel"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                  placeholder="09xxxxxxxxx"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  လုပ်ငန်းအမျိုးအစား *
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                  placeholder="အဝတ်အထည်၊ အစားအသောက် စသည်"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  လိုဂို (ရွေးချယ်နိုင်သည်)
                </label>
                <input
                  type="file"
                  accept="image/*"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                />
                {logoUrl && (
                  <img src={logoUrl} alt="Logo preview" className="mt-2 h-20 w-auto rounded" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ဆိုင်လိပ်စာ *
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                placeholder="ဆိုင် သို့မဟုတ် လုပ်ငန်းလိပ်စာ အပြည့်အစုံ"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ဆိုင်ဖော်ပြချက် *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                placeholder="ဘာရောင်းသနည်း? အသေးစိတ် ဖော်ပြပါ။"
                rows={4}
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1a7f8c] text-white py-3 rounded-lg font-semibold hover:bg-[#156a75] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {isLoading ? 'သိမ်းဆည်းနေသည်...' : 'သိမ်းဆည်းမည်'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">စတော့နည်းနေသည့် အကြောင်းကြားချက်များ (ပစ္စည်းတစ်ခုချင်းစီ)</h3>
            <p className="text-sm text-gray-500 mb-4">ပစ္စည်းတစ်ခုချင်းစီအတွက် စတော့နည်းနေသည့်အခါ အကြောင်းကြားချက်ရရှိရန် ကန့်သတ်ချက် သတ်မှတ်ပါ။</p>

            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.slug}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={thresholds[p.id] ?? 5}
                      onChange={(e) => setThresholds({ ...thresholds, [p.id]: Number(e.target.value) })}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={async () => {
                        try {
                          await updateProduct(p.id, { low_stock_threshold: thresholds[p.id] });
                          // refresh products
                          const refreshed = await getProductsByUserId((user as any).id);
                          setProducts(refreshed);
                        } catch (err) {
                          console.error('Failed to update threshold', err);
                        }
                      }}
                      className="bg-[#1a7f8c] text-white px-3 py-2 rounded-lg text-sm"
                    >
                      သိမ်းဆည်းမည်
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">အတည်ပြုမှု အခြေအနေ:</span>
              <span className={`font-semibold ${
                store.approval_status === 'approved' ? 'text-green-600' :
                store.approval_status === 'rejected' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {store.approval_status.charAt(0).toUpperCase() + store.approval_status.slice(1)}
              </span>
            </div>
            {store.rejection_reason && (
              <div className="mt-2 text-sm text-red-600">
                <span className="font-semibold">ပယ်ချရမည့် အကြောင်းပြချက်:</span> {store.rejection_reason}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
