import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Link as LinkIcon, QrCode } from 'lucide-react';
import type { Product } from '../../lib/schema';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      user_id: 'user-123',
      store_id: 'store-123',
      name: 'Sample Product 1',
      description: 'This is a sample product',
      slug: 'sample-product-1',
      cover_image_url: 'https://via.placeholder.com/400x400?text=Product+1',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && product.is_active) ||
      (filterStatus === 'inactive' && !product.is_active);
    return matchesSearch && matchesFilter;
  });

  const copyLink = (slug: string) => {
    const link = `https://orderpote.com/order/${slug}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  const toggleStatus = (id: string) => {
    setProducts(
      products.map((product) =>
        product.id === id ? { ...product, is_active: !product.is_active } : product
      )
    );
  };

  const deleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter((product) => product.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <a
          href="/products/add"
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </a>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Search products..."
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="relative">
              <img
                src={product.cover_image_url || 'https://via.placeholder.com/400x400'}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.is_active
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {product.description}
              </p>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => copyLink(product.slug)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm"
                >
                  <LinkIcon className="w-4 h-4" />
                  Copy Link
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                  <QrCode className="w-4 h-4" />
                  QR Code
                </button>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => toggleStatus(product.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  {product.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
          <p className="text-gray-500 text-lg">No products found</p>
          <a
            href="/products/add"
            className="inline-block mt-4 text-purple-600 hover:text-purple-700 font-semibold"
          >
            Add your first product
          </a>
        </div>
      )}
    </div>
  );
}
