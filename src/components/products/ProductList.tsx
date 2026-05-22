import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Link as LinkIcon, Package, Plus, Search, Trash2, Edit } from 'lucide-react';
import type { Product } from '../../lib/schema';
import { useAuth } from '../../context/AuthContext';
import { deleteProduct, getProductsByUserId, updateProductActiveStatus } from '../../lib/db';

type ProductStatusFilter = 'all' | 'active' | 'inactive';

export default function ProductList() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProductStatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const productData = await getProductsByUserId(user.id);
        if (isMounted) setProducts(productData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'active' && product.is_active) ||
        (filterStatus === 'inactive' && !product.is_active);
      return matchesSearch && matchesFilter;
    });
  }, [filterStatus, products, searchQuery]);

  const getShareLink = (slug: string) => `${window.location.origin}/order/${slug}`;

  const copyLink = async (slug: string) => {
    await navigator.clipboard.writeText(getShareLink(slug));
    alert('Product link copied');
  };

  const toggleStatus = async (product: Product) => {
    const nextStatus = !product.is_active;
    await updateProductActiveStatus(product.id, nextStatus);
    setProducts((currentProducts) =>
      currentProducts.map((item) =>
        item.id === product.id ? { ...item, is_active: nextStatus } : item
      )
    );
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setIsLoading(true);
      await deleteProduct(id);
      setProducts((currentProducts) => currentProducts.filter((product) => product.id !== id));
    } catch (err) {
      console.error('Failed to delete product', err);
      alert('Failed to delete product. See console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a7f8c]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ပစ္စည်းများ</h1>
          <p className="text-gray-600 mt-1">ပစ္စည်းများဖန်တီးပြီး ဝယ်ယူသူများနှင့် အော်ဒါလင့်ခ်များ မျှဝေပါ။</p>
        </div>
        <a
          href="/products/add"
          className="flex items-center justify-center gap-2 bg-[#1a7f8c] text-white px-6 py-3 rounded-lg hover:bg-[#156a75] transition-colors"
        >
          <Plus className="w-5 h-5" />
          ပစ္စည်းအသစ် ထည့်မည်
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
            placeholder="ပစ္စည်းများ ရှာဖွေရန်..."
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ProductStatusFilter)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
        >
          <option value="all">အခြေအနေအားလုံး</option>
          <option value="active">အသုံးပြုနေသည်</option>
          <option value="inactive">ရပ်နားထားသည်</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="relative">
              {product.cover_image_url ? (
                <img src={product.cover_image_url} alt={product.name} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                  }`}
                >
                  {product.is_active ? 'အသုံးပြုနေသည်' : 'ရပ်နားထားသည်'}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {product.description || 'ဖော်ပြချက်မရှိပါ'}
              </p>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs font-medium text-gray-500 mb-1">မျှဝေလင့်ခ်</p>
                <p className="text-sm text-gray-700 break-all">{getShareLink(product.slug)}</p>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => copyLink(product.slug)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#1a7f8c]/10 text-[#1a7f8c] rounded-lg hover:bg-[#1a7f8c]/20 transition-colors text-sm"
                >
                  <LinkIcon className="w-4 h-4" />
                  ကူးယူမည်
                </button>
                <a
                  href={getShareLink(product.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </a>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = `/products/edit/${product.id}`}
                  className="flex-1 px-3 py-2 border border-[#1a7f8c]/30 text-[#1a7f8c] rounded-lg hover:bg-[#1a7f8c]/10 transition-colors text-sm flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  ပြင်ဆင်မည်
                </button>
                <button
                  onClick={() => toggleStatus(product)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  {product.is_active ? 'ရပ်နားမည်' : 'အသုံးပြုမည်'}
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  aria-label={`Delete ${product.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">ပစ္စည်းမတွေ့ပါ</p>
          <a
            href="/products/add"
            className="inline-block mt-4 text-[#1a7f8c] hover:text-[#156a75] font-semibold"
          >
            ပထမပစ္စည်း ထည့်မည်
          </a>
        </div>
      )}
    </div>
  );
}
