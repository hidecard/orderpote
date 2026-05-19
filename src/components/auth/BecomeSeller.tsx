import { useState } from 'react';
import type { FormEvent } from 'react';
import { Store, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createStore } from '../../lib/db';

export default function BecomeSeller() {
  const { user, becomeSeller } = useAuth();
  const [storeName, setStoreName] = useState('');
  const [contactPerson, setContactPerson] = useState(user?.name || '');
  const [storePhone, setStorePhone] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('ကျေးဇူးပြု၍ အရင်ဆုံး အကောင့်ဝင်ပါ။');
      return;
    }

    if (!storeName || !contactPerson || !storePhone || !category || !address || !description) {
      setError('ကျေးဇူးပြု၍ အချက်အလက်အားလုံးကို ဖြည့်စွက်ပါ။');
      return;
    }

    setIsLoading(true);
    try {
      // Create store with pending approval status
      await createStore({
        user_id: user.id,
        name: storeName,
        logo_url: logoUrl || undefined,
        contact_person: contactPerson,
        phone: storePhone,
        category,
        address,
        description,
        approval_status: 'pending',
      });

      // Update user to seller status
      await becomeSeller();

      window.location.href = '/seller-pending';
    } catch (error) {
      console.error('Error creating seller account:', error);
      setError('လျှောက်ထားမှု မအောင်မြင်ပါ။ ထပ်မံကြိုးစားကြည့်ပါ။');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbfc] flex flex-col items-center justify-center p-4 font-sans py-12">
      <a href="/" className="mb-8 flex items-center gap-2 text-gray-500 hover:text-[#1a7f8c] transition-colors font-bold">
        <ArrowLeft className="w-5 h-5" /> ပင်မစာမျက်နှာသို့
      </a>

      <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 w-full max-w-2xl border border-gray-100">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1a7f8c]/10 rounded-3xl mb-6">
            <Store className="w-10 h-10 text-[#1a7f8c]" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">ရောင်းချသူအဖြစ် လျှောက်ထားရန်</h1>
          <p className="text-gray-500 font-medium">သင့်ဆိုင်အချက်အလက်များကို ဖြည့်စွက်ပေးပါ</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-black text-base mb-2">နောက်ထပ် ဘာတွေလုပ်ရမလဲ?</p>
              <ul className="space-y-2 font-medium opacity-90">
                <li className="flex items-center gap-2">• ဆိုင်အချက်အလက်များကို တင်သွင်းပါ</li>
                <li className="flex items-center gap-2">• ကျွန်ုပ်တို့အဖွဲ့မှ စစ်ဆေးပေးပါမည်</li>
                <li className="flex items-center gap-2">• ၂၄ နာရီမှ ၄၈ နာရီအတွင်း အတည်ပြုပေးပါမည်</li>
                <li className="flex items-center gap-2">• အတည်ပြုပြီးပါက ပစ္စည်းများ စတင်တင်နိုင်ပါပြီ</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                ဆိုင်အမည် (Store Name) *
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1a7f8c] focus:bg-white focus:border-transparent transition-all outline-none font-medium"
                placeholder="ဥပမာ - My Awesome Shop"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  ဆက်သွယ်ရမည့်သူ *
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1a7f8c] focus:bg-white focus:border-transparent transition-all outline-none font-medium"
                  placeholder="ပိုင်ရှင် သို့မဟုတ် မန်နေဂျာအမည်"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  ဆိုင်ဖုန်းနံပါတ် *
                </label>
                <input
                  type="tel"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1a7f8c] focus:bg-white focus:border-transparent transition-all outline-none font-medium"
                  placeholder="၀၉xxxxxxxxx"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  လုပ်ငန်းအမျိုးအစား *
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1a7f8c] focus:bg-white focus:border-transparent transition-all outline-none font-medium"
                  placeholder="အဝတ်အထည်၊ အစားအသောက်၊ စသည်..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  ဆိုင် Logo URL (ရှိလျှင်)
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1a7f8c] focus:bg-white focus:border-transparent transition-all outline-none font-medium"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                ဆိုင်လိပ်စာ *
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1a7f8c] focus:bg-white focus:border-transparent transition-all outline-none font-medium"
                placeholder="ဆိုင် သို့မဟုတ် လုပ်ငန်းလိပ်စာ အပြည့်အစုံ"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                ဆိုင်အကြောင်းအကျဉ်း *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1a7f8c] focus:bg-white focus:border-transparent transition-all outline-none font-medium"
                placeholder="ဘာတွေရောင်းချပါသလဲ? အသေးစိတ်ဖော်ပြပေးပါ။"
                rows={4}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1a7f8c] text-white py-5 rounded-2xl font-black text-xl hover:bg-[#156a75] transition-all shadow-lg shadow-[#1a7f8c]/20 disabled:opacity-50"
            >
              {isLoading ? 'တင်သွင်းနေသည်...' : 'လျှောက်လွှာတင်မည်'}
            </button>

            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="w-full text-gray-500 py-2 hover:text-gray-800 font-bold transition-colors"
            >
              မလုပ်တော့ပါ
            </button>
          </div>
        </form>
      </div>
      
      <p className="mt-12 text-gray-400 text-sm font-medium">© ၂၀၂၆ OrderPote. All rights reserved.</p>
    </div>
  );
}
