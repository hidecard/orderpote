import { useState } from 'react';
import type { FormEvent } from 'react';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isAdminEmail } from '../../lib/admin';

export default function RegisterForm() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('စကားဝှက်များ တူညီမှုမရှိပါ။');
      return;
    }

    if (password.length < 6) {
      setError('စကားဝှက်သည် အနည်းဆုံး ၆ လုံးရှိရပါမည်။');
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password, name);
      if (isAdminEmail(email)) {
        window.location.href = '/admin/store-approvals';
        return;
      }

      window.location.href = '/become-seller';
    } catch {
      setError('ဤအီးမေးလ်ဖြင့် အကောင့်ရှိပြီးသားဖြစ်နေပါသည်။');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbfc] flex flex-col items-center justify-center p-4 font-sans">
      <a href="/" className="mb-8 flex items-center gap-2 text-gray-500 hover:text-[#1a7f8c] transition-colors font-bold">
        <ArrowLeft className="w-5 h-5" /> ပင်မစာမျက်နှာသို့
      </a>

      <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 w-full max-w-md border border-gray-100">
        <div className="text-center mb-10">
          <img src="/logo.png" alt="OrderPote Logo" className="h-16 w-auto mx-auto mb-6" />
          <h1 className="text-3xl font-black text-gray-900 mb-2">အကောင့်အသစ်ဖွင့်ရန်</h1>
          <p className="text-gray-500 font-medium">အခမဲ့ စတင်ရောင်းချလိုက်ပါ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">
              အမည်အပြည့်အစုံ
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1a7f8c] focus:bg-white focus:border-transparent transition-all outline-none font-medium"
                placeholder="သင့်အမည်"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">
              အီးမေးလ် (Email)
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1a7f8c] focus:bg-white focus:border-transparent transition-all outline-none font-medium"
                placeholder="example@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">
              စကားဝှက် (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1a7f8c] focus:bg-white focus:border-transparent transition-all outline-none font-medium"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">
              စကားဝှက်ကို အတည်ပြုပါ
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1a7f8c] focus:bg-white focus:border-transparent transition-all outline-none font-medium"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1a7f8c] text-white py-4 rounded-xl font-black text-lg hover:bg-[#156a75] transition-all shadow-lg shadow-[#1a7f8c]/20 disabled:opacity-50"
          >
            {isLoading ? 'အကောင့်ဖွင့်နေသည်...' : 'အကောင့်အသစ်ဖွင့်မည်'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-gray-500 font-medium">အကောင့်ရှိပြီးသားလား?</p>
          <a href="/login" className="text-[#1a7f8c] hover:underline font-black text-lg">
            အကောင့်ဝင်ရန်
          </a>
        </div>
      </div>

      <p className="mt-8 text-gray-400 text-sm font-medium">© ၂၀၂၆ OrderPote. All rights reserved.</p>
    </div>
  );
}
