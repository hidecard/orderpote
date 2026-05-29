import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../context/StaffAuthContext';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function StaffLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useStaffAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Redirect to seller dashboard (staff will see permission-filtered sidebar)
        navigate('/dashboard');
      } else {
        setError('အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားနေပါသည်');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('ဝင်ရောက်ရာတွင် အမှားတစ်စုံတစ်ခု ဖြစ်ပါသည်');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a7f8c] to-[#158a96] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ဝန်ထမ်း ဝင်ရောက်ရန်</h1>
          <p className="text-gray-600">Staff Login</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              အီးမေးလ်
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                placeholder="staff@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              စကားဝှက်
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1a7f8c] text-white py-3 rounded-lg font-semibold hover:bg-[#158a96] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'ဝင်ရောက်နေသည်...' : 'ဝင်ရောက်မည်'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/login" className="text-[#1a7f8c] hover:underline text-sm">
            Seller အဖြစ် ဝင်ရောက်ရန်
          </a>
        </div>
      </div>
    </div>
  );
}
