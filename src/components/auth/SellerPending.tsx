import { useEffect, useState } from 'react';
import { AlertCircle, Clock, Store, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoreByUserId } from '../../lib/db';
import type { Store as StoreRecord } from '../../lib/schema';

export default function SellerPending() {
  const { user, logout } = useAuth();
  const [store, setStore] = useState<StoreRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStore() {
      if (!user) {
        window.location.href = '/login';
        return;
      }

      const currentStore = await getStoreByUserId(user.id);
      if (!currentStore) {
        window.location.href = '/become-seller';
        return;
      }

      if (currentStore.approval_status === 'approved') {
        window.location.href = '/dashboard';
        return;
      }

      setStore(currentStore);
      setIsLoading(false);
    }

    fetchStore();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fbfc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1a7f8c]/20 border-t-[#1a7f8c]"></div>
      </div>
    );
  }

  const isRejected = store?.approval_status === 'rejected';
  const Icon = isRejected ? AlertCircle : Clock;

  return (
    <div className="min-h-screen bg-[#f8fbfc] flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 w-full max-w-xl border border-gray-100">
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 ${isRejected ? 'bg-red-50' : 'bg-[#1a7f8c]/10'}`}>
            <Icon className={`w-10 h-10 ${isRejected ? 'text-red-500' : 'text-[#1a7f8c]'}`} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">
            {isRejected ? 'လျှောက်ထားမှု ငြင်းပယ်ခံရသည်' : 'အတည်ပြုချက်ကို စောင့်ဆိုင်းနေသည်'}
          </h1>
          <p className="text-gray-500 font-medium text-lg">
            {isRejected ? 'ကျေးဇူးပြု၍ အကြောင်းပြချက်ကို စစ်ဆေးပြီး ပြန်လည်ပြင်ဆင်ပေးပါ။' : 'သင့်ဆိုင်ကို အသုံးမပြုမီ Admin မှ အတည်ပြုပေးရန် လိုအပ်ပါသည်။'}
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-5">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-sm">
              <Store className="w-7 h-7 text-[#1a7f8c]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black text-gray-900">{store?.name}</h2>
              <p className="text-gray-500 font-bold">ဖုန်းနံပါတ် - {store?.phone}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isRejected ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                <span className={`text-sm font-black ${isRejected ? 'text-red-600' : 'text-yellow-600'}`}>
                  {isRejected ? 'ငြင်းပယ်ထားသည်' : 'Admin အတည်ပြုချက် စောင့်ဆိုင်းဆဲ'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isRejected && store?.rejection_reason && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-5 rounded-2xl mb-8">
            <p className="font-black mb-1">ငြင်းပယ်ရသည့် အကြောင်းရင်း -</p>
            <p className="font-medium opacity-90">{store.rejection_reason}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1a7f8c] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#156a75] transition-all shadow-lg shadow-[#1a7f8c]/20"
          >
            <RefreshCw className="w-5 h-5" /> အခြေအနေ စစ်ဆေးမည်
          </button>
          <button
            type="button"
            onClick={logout}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-100 text-gray-600 py-4 rounded-2xl font-black text-lg hover:bg-gray-50 transition-all"
          >
            <LogOut className="w-5 h-5" /> ထွက်မည်
          </button>
        </div>
      </div>
      
      <p className="mt-10 text-gray-400 text-sm font-medium">© ၂၀၂၆ OrderPote. All rights reserved.</p>
    </div>
  );
}
