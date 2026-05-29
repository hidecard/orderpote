import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Wallet } from '../../lib/schema';
import { createWallet, getWalletsByUserId, updateWalletSelectionStatus, deleteWallet } from '../../lib/db';

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
  const [savedWallets, setSavedWallets] = useState<Wallet[]>([]);
  const [wallets, setWallets] = useState<Partial<Wallet>[]>([]);
  const [selectedWalletIds, setSelectedWalletIds] = useState<string[]>([]);
  const [currentWallet, setCurrentWallet] = useState({
    provider: WALLET_PROVIDERS[0],
    account_name: '',
    account_number: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchWallets() {
      if (!user) {
        setIsFetching(false);
        return;
      }

      try {
        const walletData = await getWalletsByUserId(user.id);
        if (isMounted) {
          setSavedWallets(walletData);
          // Select all wallets by default
          setSelectedWalletIds(walletData.map(w => w.id));
        }
      } catch (error) {
        console.error('Error fetching wallets:', error);
      } finally {
        if (isMounted) setIsFetching(false);
      }
    }

    fetchWallets();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const addWallet = () => {
    if (currentWallet.account_name && currentWallet.account_number) {
      const newWallet = {
        ...currentWallet,
        id: `wallet-${Date.now()}`,
        user_id: user?.id || '',
        is_primary: false,
        created_at: new Date().toISOString(),
      };
      setWallets([...wallets, newWallet]);
      // Auto-select new wallet
      setSelectedWalletIds([...selectedWalletIds, newWallet.id]);
      setCurrentWallet({
        provider: WALLET_PROVIDERS[0],
        account_name: '',
        account_number: '',
      });
    }
  };

  const removeWallet = (index: number) => {
    const walletToRemove = wallets[index];
    const newWallets = wallets.filter((_, i) => i !== index);
    setWallets(newWallets);
    // Remove from selection
    setSelectedWalletIds(selectedWalletIds.filter(id => id !== walletToRemove.id));
  };

  const toggleWalletSelection = (walletId: string) => {
    setSelectedWalletIds(prev =>
      prev.includes(walletId)
        ? prev.filter(id => id !== walletId)
        : [...prev, walletId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in first');
      return;
    }

    if (wallets.length === 0 && selectedWalletIds.length === 0) {
      alert('Please add at least one wallet');
      return;
    }

    setIsLoading(true);
    try {
      const createdWallets: Wallet[] = [];
      for (const wallet of wallets) {
        const createdWallet = await createWallet({
          user_id: user.id,
          provider: wallet.provider || WALLET_PROVIDERS[0],
          account_name: wallet.account_name || '',
          account_number: wallet.account_number || '',
          is_primary: false,
        });
        createdWallets.push(createdWallet);
      }

      setSavedWallets([...savedWallets, ...createdWallets]);
      setWallets([]);
      setSelectedWalletIds([...selectedWalletIds, ...createdWallets.map(w => w.id)]);
      alert('Wallet saved');
    } catch (error) {
      console.error('Error saving wallets:', error);
      alert('Failed to save wallets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSelection = async () => {
    if (!user) return;
    try {
      // Update is_primary status based on selection
      await updateWalletSelectionStatus(user.id, selectedWalletIds);
      alert('Wallet selection saved');
    } catch (error) {
      console.error('Error saving wallet selection:', error);
      alert('Failed to save wallet selection. Please try again.');
    }
  };

  const handleDeleteWallet = async (walletId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this wallet?')) return;
    
    try {
      await deleteWallet(walletId);
      const updatedWallets = await getWalletsByUserId(user.id);
      setSavedWallets(updatedWallets);
    } catch (error) {
      console.error('Error deleting wallet:', error);
      alert('Failed to delete wallet. Please try again.');
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">Setup Your Wallet</h1>
          <p className="text-gray-600">Add your payment methods to receive orders</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {savedWallets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Saved Wallets (Select for Checkout)</h3>
              <div className="space-y-3">
                {savedWallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedWalletIds.includes(wallet.id)}
                        onChange={() => toggleWalletSelection(wallet.id)}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <div>
                        <p className="font-semibold">{wallet.provider}</p>
                        <p className="text-sm text-gray-600">{wallet.account_name}</p>
                        <p className="text-sm text-gray-500">{wallet.account_number}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteWallet(wallet.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete wallet"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleSaveSelection}
                className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Save Selection
              </button>
            </div>
          )}

          {/* Wallet Setup */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Add Payment Method</h3>
            
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
                      <input
                        type="checkbox"
                        checked={wallet.id ? selectedWalletIds.includes(wallet.id) : false}
                        onChange={() => wallet.id && toggleWalletSelection(wallet.id)}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <div>
                        <p className="font-semibold">{wallet.provider}</p>
                        <p className="text-sm text-gray-600">{wallet.account_name}</p>
                        <p className="text-sm text-gray-500">{wallet.account_number}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeWallet(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || wallets.length === 0}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save New Wallets'}
          </button>
        </form>
      </div>
    </div>
  );
}
