import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Link as LinkIcon, Package, Plus, Search, Trash2, Edit, MoreVertical, CheckCircle2, XCircle, Copy, Eye } from 'lucide-react';
import type { Product } from '../../lib/schema';
import { useAuth } from '../../context/AuthContext';
import { deleteProduct, getProductsByUserId, updateProductActiveStatus } from '../../lib/db';
import { ProductListSkeleton } from '../ui/Skeleton';

type ProductStatusFilter = 'all' | 'active' | 'inactive';

export default function ProductList() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProductStatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

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
    setCopySuccess(slug);
    setTimeout(() => setCopySuccess(null), 2000);
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
    if (!confirm('ဤပစ္စည်းကို ဖျက်ရန် သေချာပါသလား?')) return;

    try {
      setIsLoading(true);
      await deleteProduct(id);
      setProducts((currentProducts) => currentProducts.filter((product) => product.id !== id));
    } catch (err) {
      console.error('Failed to delete product', err);
      alert('ပစ္စည်းဖျက်သိမ်းမှု မအောင်မြင်ပါ။');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <ProductListSkeleton />;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tighter mb-2">ပစ္စည်းများ</h1>
          <p className="text-gray-500 font-medium">သင့်ဆိုင်ရှိ ပစ္စည်းများကို စီမံခန့်ခွဲပြီး အရောင်းလင့်ခ်များ မျှဝေပါ။</p>
        </div>
        <a
          href="/products/add"
          className="inline-flex items-center justify-center gap-3 bg-brand-dark text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-primary hover:text-brand-dark transition-all shadow-xl shadow-brand-dark/10 active:scale-95 transform"
        >
          <Plus className="w-5 h-5" />
          ပစ္စည်းအသစ် ထည့်မည်
        </a>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-brand-dark/5 border border-gray-100 p-3 mb-10 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:bg-white transition-all outline-none font-bold text-brand-dark"
            placeholder="ပစ္စည်းအမည်ဖြင့် ရှာဖွေရန်..."
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ProductStatusFilter)}
            className="px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none appearance-none cursor-pointer"
          >
            <option value="all">အားလုံး</option>
            <option value="active">ရောင်းချနေဆဲ</option>
            <option value="inactive">ရပ်နားထားသည်</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <div key={product.id} className="group bg-white rounded-[2.5rem] shadow-xl shadow-brand-dark/5 border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-500 hover:-translate-y-1">
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden">
              {product.cover_image_url ? (
                <img 
                  src={product.cover_image_url} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-200" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-5 right-5">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${
                  product.is_active 
                    ? 'bg-brand-primary/90 text-brand-dark' 
                    : 'bg-gray-900/80 text-white'
                }`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Quick Actions Overlay */}
              <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                <button 
                  onClick={() => window.location.href = `/products/edit/${product.id}`}
                  className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-dark hover:bg-brand-primary transition-colors shadow-xl"
                  title="Edit"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => copyLink(product.slug)}
                  className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-dark hover:bg-brand-primary transition-colors shadow-xl"
                  title="Copy Link"
                >
                  {copySuccess === product.slug ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <LinkIcon className="w-5 h-5" />}
                </button>
                <a 
                  href={getShareLink(product.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-dark hover:bg-brand-primary transition-colors shadow-xl"
                  title="View Store"
                >
                  <Eye className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Content Container */}
            <div className="p-8">
              <div className="flex justify-between items-start gap-4 mb-4">
                <h3 className="font-black text-xl text-brand-dark tracking-tight line-clamp-1">{product.name}</h3>
                <button 
                  onClick={() => toggleStatus(product)}
                  className={`p-2 rounded-xl transition-colors ${product.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-300 hover:bg-gray-50'}`}
                  title={product.is_active ? 'Pause' : 'Activate'}
                >
                  {product.is_active ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </button>
              </div>
              
              <p className="text-sm text-gray-500 font-medium mb-6 line-clamp-2 min-h-[40px]">
                {product.description || 'ဖော်ပြချက်မရှိပါ'}
              </p>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                      <LinkIcon className="w-4 h-4" />
                   </div>
                   <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest truncate max-w-[100px]">
                      {product.slug}
                   </span>
                </div>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="w-10 h-10 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 mt-10">
          <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
            <Package className="w-12 h-12 text-gray-200" />
          </div>
          <h3 className="text-2xl font-black text-brand-dark tracking-tighter mb-3">ပစ္စည်းမတွေ့ပါ</h3>
          <p className="text-gray-500 font-medium mb-10">ရှာဖွေမှုနှင့် ကိုက်ညီသော ပစ္စည်းမရှိသေးပါ။</p>
          <a
            href="/products/add"
            className="inline-flex items-center gap-3 bg-brand-primary text-brand-dark px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:bg-brand-dark hover:text-white transition-all"
          >
            <Plus className="w-5 h-5" /> ပထမဆုံးပစ္စည်း ထည့်မည်
          </a>
        </div>
      )}
    </div>
  );
}
