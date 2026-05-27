import { useState } from 'react';
import type { FormEvent } from 'react';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoreByUserId, getStaffByUserId, getStoreById } from '../../lib/db';
import { isAdminUser } from '../../lib/admin';

export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      if (isAdminUser(user)) {
        window.location.href = '/admin/store-approvals';
        return;
      }

      const staff = await getStaffByUserId(user.id);
      let store = await getStoreByUserId(user.id);

      if (staff && !store) {
        store = await getStoreById(staff.store_id);
      }

      if (!user.is_seller || !store) {
        window.location.href = '/become-seller';
        return;
      }

      window.location.href = store.approval_status === 'approved' ? '/dashboard' : '/seller-pending';
    } catch {
      setError('အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
      {/* Left Side - Visual (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-brand-dark relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#84cc16_0%,transparent_50%)]"></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl inline-block mb-8 rotate-3">
            <img src="/real-logo.png" alt="ZayLink Logo" className="w-48 h-auto mx-auto" />
          </div>
          <h2 className="text-4xl font-black text-white mb-6 tracking-tighter">အရောင်းအဝယ်ကို <br/> စနစ်တကျ စီမံလိုက်ပါ</h2>
          <p className="text-lime-400 font-bold text-xl">ZayLink - Social Commerce Solution</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 bg-gray-50/50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="md:hidden text-center mb-10">
            <img src="/real-logo.png" alt="ZayLink Logo" className="h-20 w-auto mx-auto mb-4" />
          </div>

          <div className="mb-10 text-center md:text-left">
            <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-brand-primary transition-colors font-black uppercase text-[10px] tracking-[0.2em] mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </a>
            <h1 className="text-4xl font-black text-brand-dark tracking-tighter mb-3">မင်္ဂလာပါ</h1>
            <p className="text-gray-500 font-medium">သင့်အကောင့်သို့ ပြန်လည်ဝင်ရောက်ပါ</p>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-brand-dark/5 p-8 md:p-10 border border-gray-100 relative overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-xs font-black animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary transition-all outline-none font-bold text-brand-dark"
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-14 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary transition-all outline-none font-bold text-brand-dark"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <a href="#" className="text-[10px] font-black text-gray-400 hover:text-brand-primary transition-colors uppercase tracking-widest">Forgot Password?</a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-primary text-brand-dark py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-dark hover:text-white transition-all shadow-xl shadow-brand-primary/20 disabled:opacity-50 active:scale-[0.98] transform flex items-center justify-center gap-2 group"
              >
                {isLoading ? 'Processing...' : (
                  <>
                    အကောင့်ဝင်မည်
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-400 text-sm font-bold">
              အကောင့်မရှိသေးဘူးလား?{' '}
              <a href="/register" className="text-brand-primary hover:underline font-black decoration-2 underline-offset-4">
                အကောင့်သစ်ဖွင့်ရန်
              </a>
            </p>
          </div>

          <p className="mt-20 text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
            © ၂၀၂၆ ZayLink PRO. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
