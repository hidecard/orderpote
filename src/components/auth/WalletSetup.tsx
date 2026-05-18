import React, { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Wallet } from '../../lib/schema';

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

export default function WalletSetup() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Partial<Wallet>[]>([]);
  const [currentWallet, setCurrentWallet] = useState({
    provider: WALLET_PROVIDERS[0],
    account_name: '',
    account_number: '',
  });
  const [storeName, setStoreName] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addWallet = () => {
    if (currentWallet.account_name && currentWallet.account_number) {
      setWallets([
        ...wallets,
        {
          ...currentWallet,
          id: `wallet-${Date.now()}`,
          user_id: user?.id || '',
          is_primary: wallets.length === 0,
          created_at: new Date().toISOString(),
        },
      ]);
      setCurrentWallet({
        provider: WALLET_PROVIDERS[0],
        account_name: '',
        account_number: '',
      });
    }
  };

  const removeWallet = (index: number) => {
    const newWallets = wallets.filter((_, i) => i !== index);
    // If removing primary wallet, make the first one primary
    if (wallets[index].is_primary && newWallets.length > 0) {
      newWallets[0].is_primary = true;
    }
    setWallets(newWallets);
  };

  const setPrimaryWallet = (index: number) => {
    setWallets(
      wallets.map((wallet, i) => ({
        ...wallet,
        is_primary: i === index,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wallets.length === 0) {
      alert('Please add at least one wallet');
      return;
    }
    if (!storeName || !storePhone) {
      alert('Please fill in store details');
      return;
    }

    setIsLoading(true);
    // TODO: Save wallets and store settings to database
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">Setup Your Wallet</h1>
          <p className="text-gray-600">Add your payment methods to receive orders</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Settings */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold mb-4">Store Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Your Store Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Phone
                </label>
                <input
                  type="tel"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="09xxxxxxxxx"
                  required
                />
              </div>
            </div>
          </div>

          {/* Wallet Setup */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
            
            {/* Add Wallet Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider
                  </label>
                  <select
                    value={currentWallet.provider}
                    onChange={(e) =>
                      setCurrentWallet({ ...currentWallet, provider: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {WALLET_PROVIDERS.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={currentWallet.account_name}
                    onChange={(e) =>
                      setCurrentWallet({ ...currentWallet, account_name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Account holder name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number/Phone
                  </label>
                  <input
                    type="text"
                    value={currentWallet.account_number}
                    onChange={(e) =>
                      setCurrentWallet({ ...currentWallet, account_number: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Account number"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addWallet}
                className="mt-4 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add Wallet
              </button>
            </div>

            {/* Wallet List */}
            {wallets.length > 0 && (
              <div className="space-y-3">
                {wallets.map((wallet, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {wallet.is_primary && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                      <div>
                        <p className="font-semibold">{wallet.provider}</p>
                        <p className="text-sm text-gray-600">{wallet.account_name}</p>
                        <p className="text-sm text-gray-500">{wallet.account_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!wallet.is_primary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryWallet(index)}
                          className="text-sm text-purple-600 hover:text-purple-700"
                        >
                          Set Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeWallet(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
