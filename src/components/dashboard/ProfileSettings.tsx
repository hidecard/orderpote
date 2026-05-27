import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { User, ArrowLeft, Lock, Eye, EyeOff, Shield, CheckCircle2, Camera, Store, Plus, Trash2, Star, Wallet as WalletIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateUser, changePassword, getStoreByUserId, updateStore, getWalletsByUserId, createWallet, updateWalletPrimaryStatus, deleteWallet } from '../../lib/db';
import type { Store as StoreType, Wallet } from '../../lib/schema';
import { ProfileSkeleton } from '../ui/Skeleton';

const WALLET_PROVIDERS = [
  'KPay',
  'Wave Money',
  'AYA Pay',
  'CB Pay',
  'KBZ iBanking',
  'CB Bank',
  'AYA Bank',
  'KBZPay',
];

export default function ProfileSettings() {
  const { user } = useAuth();
  const [store, setStore] = useState<StoreType | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Wallet states
  const [savedWallets, setSavedWallets] = useState<Wallet[]>([]);
  const [newWallets, setNewWallets] = useState<Partial<Wallet>[]>([]);
  const [currentWallet, setCurrentWallet] = useState({
    provider: WALLET_PROVIDERS[0],
    account_name: '',
    account_number: '',
  });
  const [isSavingWallet, setIsSavingWallet] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (user) {
        setName(user.name);
        setPhone(user.phone || '');
        
        try {
          const [storeData, walletData] = await Promise.all([
            getStoreByUserId(user.id),
            getWalletsByUserId(user.id)
          ]);

          if (storeData) {
            setStore(storeData);
            setLogoUrl(storeData.logo_url || '');
          }
          setSavedWallets(walletData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
        
        setIsFetching(false);
      }
    }
    fetchData();
  }, [user]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update User Info
      await updateUser(user.id, {
        name,
        phone: phone || undefined,
      });

      // Update Store Logo if it changed
      if (store && logoUrl !== store.logo_url) {
        await updateStore(store.id, {
          logo_url: logoUrl || undefined,
        });
      }

      setSuccess('ပရိုဖိုင်နှင့် ဆိုင်အချက်အလက်များကို သိမ်းဆည်းပြီးပါပြီ။');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError('ပြင်ဆင်မှု မအောင်မြင်ပါ။ နောက်တစ်ကြိမ် ပြန်လည်ကြိုးစားကြည့်ပါ။');
      console.error('Error updating profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      setError('စကားဝှက်အသစ်နှစ်ခု တူညီမှုမရှိပါ။');
      return;
    }

    if (newPassword.length < 6) {
      setError('စကားဝှက်အသစ်သည် အနည်းဆုံး ၆ လုံးရှိရပါမည်။');
      return;
    }

    setIsChangingPassword(true);
    setError('');
    setSuccess('');

    try {
      const success = await changePassword(user.id, currentPassword, newPassword);
      if (success) {
        setSuccess('စကားဝှက်ကို အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError('လက်ရှိအသုံးပြုနေသော စကားဝှက် မှားယွင်းနေပါသည်။');
      }
    } catch (err) {
      setError('စကားဝှက်ပြောင်းလဲမှု မအောင်မြင်ပါ။');
      console.error('Error changing password:', err);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Wallet Actions
  const addWalletToList = () => {
    if (currentWallet.account_name && currentWallet.account_number) {
      setNewWallets([
        ...newWallets,
        {
          ...currentWallet,
          id: `temp-${Date.now()}`,
          user_id: user?.id || '',
          is_primary: savedWallets.length === 0 && newWallets.length === 0,
        },
      ]);
      setCurrentWallet({
        provider: WALLET_PROVIDERS[0],
        account_name: '',
        account_number: '',
      });
    }
  };

  const removeNewWallet = (index: number) => {
    setNewWallets(newWallets.filter((_, i) => i !== index));
  };

  const saveNewWallets = async () => {
    if (!user || newWallets.length === 0) return;
    setIsSavingWallet(true);
    setError('');
    try {
      for (const wallet of newWallets) {
        await createWallet({
          user_id: user.id,
          provider: wallet.provider || WALLET_PROVIDERS[0],
          account_name: wallet.account_name || '',
          account_number: wallet.account_number || '',
          is_primary: Boolean(wallet.is_primary),
        });
      }
      const updated = await getWalletsByUserId(user.id);
      setSavedWallets(updated);
      setNewWallets([]);
      setSuccess('ငွေပေးချေမှုအကောင့်အသစ်များကို သိမ်းဆည်းပြီးပါပြီ။');
    } catch (err) {
      setError('Wallet သိမ်းဆည်းမှု မအောင်မြင်ပါ။');
    } finally {
      setIsSavingWallet(false);
    }
  };

  const handleSetPrimaryWallet = async (walletId: string) => {
    if (!user) return;
    try {
      await updateWalletPrimaryStatus(user.id, walletId);
      const updated = await getWalletsByUserId(user.id);
      setSavedWallets(updated);
      setSuccess('အဓိကအသုံးပြုမည့် Wallet ကို ပြောင်းလဲပြီးပါပြီ။');
    } catch (err) {
      setError('Primary Wallet ပြောင်းလဲမှု မအောင်မြင်ပါ။');
    }
  };

  const handleDeleteWallet = async (walletId: string) => {
    if (!user) return;
    if (!window.confirm('ဤ Wallet ကို ဖျက်ရန် သေချာပါသလား?')) return;
    try {
      await deleteWallet(walletId);
      const updated = await getWalletsByUserId(user.id);
      setSavedWallets(updated);
      setSuccess('Wallet ကို ဖျက်ပြီးပါပြီ။');
    } catch (err) {
      setError('Wallet ဖျက်သိမ်းမှု မအောင်မြင်ပါ။');
    }
  };

  if (isFetching) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-brand-primary hover:border-brand-primary/20 transition-all group">
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </a>
            <div>
              <h1 className="text-3xl font-black text-brand-dark tracking-tighter">Profile Management</h1>
              <p className="text-gray-500 font-medium">ပရိုဖိုင်နှင့် ငွေပေးချေမှုများကို စီမံပါ</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Secured Account</span>
          </div>
        </div>

        {/* Alerts */}
        {(error || success) && (
          <div className={`mb-8 p-5 rounded-[1.5rem] border animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-4 ${
            error ? 'bg-red-50 border-red-100 text-red-700' : 'bg-brand-primary/5 border-brand-primary/20 text-brand-dark'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${error ? 'bg-red-100' : 'bg-brand-primary/20'}`}>
              {error ? <Lock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 text-brand-primary" />}
            </div>
            <p className="text-sm font-black tracking-tight">{error || success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-dark/5 border border-gray-100 p-8 text-center sticky top-24">
              <div className="relative inline-block mb-6 group">
                <div className="w-32 h-32 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-brand-primary/20 overflow-hidden border-4 border-white">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Store logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl font-black text-brand-dark">{user?.name.charAt(0)}</span>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-dark text-white rounded-2xl shadow-lg border-2 border-white flex items-center justify-center cursor-pointer hover:bg-brand-primary hover:text-brand-dark transition-all transform active:scale-90">
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
              <h2 className="text-2xl font-black text-brand-dark tracking-tighter mb-1">{user?.name}</h2>
              <p className="text-gray-400 font-bold text-sm mb-2">{user?.email}</p>
              {store && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 rounded-full text-brand-primary text-[10px] font-black uppercase tracking-widest mb-8">
                  <Store className="w-3 h-3" /> {store.name}
                </div>
              )}
              
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">အဆင့်</span>
                  <span className="text-sm font-black text-brand-primary">ရောင်းချသူ</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Wallets</span>
                  <span className="text-sm font-black text-brand-dark">{savedWallets.length} ခု</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* General Info Card */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-dark/5 border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-brand-dark tracking-tight">ကိုယ်ရေးအချက်အလက်</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Profile Info</p>
                </div>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">အမည်</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary transition-all outline-none font-bold text-brand-dark"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">ဖုန်းနံပါတ်</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary transition-all outline-none font-bold text-brand-dark"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto bg-brand-dark text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-primary hover:text-brand-dark transition-all shadow-xl"
                >
                  {isLoading ? 'သိမ်းဆည်းနေသည်...' : 'အချက်အလက် သိမ်းဆည်းမည်'}
                </button>
              </form>
            </div>

            {/* Wallet Section Card */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-dark/5 border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                  <WalletIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-brand-dark tracking-tight">ငွေပေးချေမှု အကောင့်များ</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Manage Wallets</p>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Saved Wallets */}
                {savedWallets.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">သိမ်းဆည်းထားသော Wallets</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedWallets.map((wallet) => (
                        <div key={wallet.id} className={`p-5 rounded-[2rem] border transition-all relative group ${wallet.is_primary ? 'bg-brand-primary/5 border-brand-primary/30' : 'bg-white border-gray-100'}`}>
                          <div className="flex justify-between items-start mb-4">
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${wallet.is_primary ? 'bg-brand-primary text-brand-dark' : 'bg-gray-100 text-gray-500'}`}>
                              {wallet.provider}
                            </div>
                            {wallet.is_primary && <Star className="w-4 h-4 text-brand-primary fill-brand-primary" />}
                          </div>
                          <p className="font-black text-brand-dark mb-1">{wallet.account_name}</p>
                          <p className="text-sm font-bold text-gray-400 mb-6">{wallet.account_number}</p>
                          
                          <div className="flex items-center gap-3">
                            {!wallet.is_primary && (
                              <button onClick={() => handleSetPrimaryWallet(wallet.id)} className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline">Set Primary</button>
                            )}
                            <button onClick={() => handleDeleteWallet(wallet.id)} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Wallet Form */}
                <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100">
                  <h4 className="text-xs font-black text-brand-dark uppercase tracking-widest mb-6">အကောင့်အသစ် ထည့်ရန်</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">အမျိုးအစား</label>
                      <select
                        value={currentWallet.provider}
                        onChange={(e) => setCurrentWallet({ ...currentWallet, provider: e.target.value })}
                        className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl font-bold text-brand-dark outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all appearance-none"
                      >
                        {WALLET_PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">အမည်</label>
                      <input
                        type="text"
                        value={currentWallet.account_name}
                        onChange={(e) => setCurrentWallet({ ...currentWallet, account_name: e.target.value })}
                        className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl font-bold text-brand-dark outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all"
                        placeholder="Account Name"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ဖုန်း သို့မဟုတ် အကောင့်နံပါတ်</label>
                      <input
                        type="text"
                        value={currentWallet.account_number}
                        onChange={(e) => setCurrentWallet({ ...currentWallet, account_number: e.target.value })}
                        className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl font-bold text-brand-dark outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all"
                        placeholder="09... / Account Number"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addWalletToList}
                    className="flex items-center gap-2 text-brand-primary font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform"
                  >
                    <Plus className="w-4 h-4" /> စာရင်းထဲသို့ ထည့်မည်
                  </button>
                </div>

                {/* New Wallets Staging */}
                {newWallets.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest ml-1">သိမ်းဆည်းရန် စောင့်ဆိုင်းနေသော အကောင့်များ</h4>
                    <div className="space-y-3">
                      {newWallets.map((w, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
                          <div>
                            <p className="font-black text-brand-dark text-sm">{w.provider} - {w.account_name}</p>
                            <p className="text-xs font-bold text-gray-500">{w.account_number}</p>
                          </div>
                          <button onClick={() => removeNewWallet(i)} className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={saveNewWallets}
                      disabled={isSavingWallet}
                      className="w-full bg-brand-primary text-brand-dark py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:bg-brand-dark hover:text-white transition-all"
                    >
                      {isSavingWallet ? 'သိမ်းဆည်းနေသည်...' : 'အကောင့်သစ်များ အတည်ပြုသိမ်းဆည်းမည်'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Password Change Card */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-dark/5 border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-brand-dark tracking-tight">စကားဝှက် ပြောင်းလဲရန်</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Security</p>
                </div>
              </div>
              
              <form onSubmit={handlePasswordChange} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">လက်ရှိ စကားဝှက်</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-primary transition-colors" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full pl-14 pr-14 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary transition-all outline-none font-bold text-brand-dark"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">စကားဝှက်အသစ်</label>
                    <div className="relative group">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary transition-all outline-none font-bold text-brand-dark"
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">အတည်ပြုပါ</label>
                    <div className="relative group">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary transition-all outline-none font-bold text-brand-dark"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isChangingPassword} className="w-full md:w-auto bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-500 transition-all shadow-xl">
                  {isChangingPassword ? 'ပြောင်းလဲနေသည်...' : 'စကားဝှက် ပြောင်းမည်'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
