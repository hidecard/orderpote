import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Truck, Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoreByUserId } from '../../lib/db';
import { getSuppliersByStoreId, createSupplier } from '../../lib/db';
import { getProductsByUserId } from '../../lib/db';
import { getProductVariants } from '../../lib/db';
import { createPurchaseOrder } from '../../lib/db';
import type { Supplier, Product, ProductVariant } from '../../lib/schema';

export default function PurchaseOrderIntake() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [storeId, setStoreId] = useState<string>('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [showNewSupplierForm, setShowNewSupplierForm] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', contact_person: '', phone: '', email: '', address: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadStoreData(user.id);
    } else {
      setIsLoading(false);
      setError('အသုံးပြုသူ ဝင်ရောက်မထားပါ');
    }
  }, [user]);

  const loadStoreData = async (uid: string) => {
    try {
      const store = await getStoreByUserId(uid);
      if (store) {
        setStoreId(store.id);
        const [suppliersData, productsData] = await Promise.all([
          getSuppliersByStoreId(store.id),
          getProductsByUserId(uid),
        ]);
        setSuppliers(suppliersData);
        setProducts(productsData);
      } else {
        setError('ဆိုင်မရှိသေးပါ။ ဆိုင်ဖန်တီးပြီးမှ စတင်သုံးပါ');
      }
    } catch (err) {
      console.error('Error loading store data:', err);
      setError('ဒေတာဖတ်ရှုရာတွင် အမှားတစ်စုံတစ်ခု ဖြစ်ပါသည်။');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductChange = async (productId: string) => {
    setSelectedProduct(productId);
    setSelectedVariant('');
    if (productId) {
      const variantsData = await getProductVariants(productId);
      setVariants(variantsData);
    } else {
      setVariants([]);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name) {
      setError('ဆပ်ပလိယာ အမည် ထည့်သွင်းပါ');
      return;
    }
    if (!user) {
      setError('အသုံးပြုသူ ဝင်ရောက်မထားပါ');
      return;
    }

    try {
      const supplier = await createSupplier({
        user_id: user.id,
        store_id: storeId,
        name: newSupplier.name,
        contact_person: newSupplier.contact_person,
        phone: newSupplier.phone,
        email: newSupplier.email,
        address: newSupplier.address,
        notes: '',
      });
      setSuppliers([...suppliers, supplier]);
      setSelectedSupplier(supplier.id);
      setNewSupplier({ name: '', contact_person: '', phone: '', email: '', address: '' });
      setShowNewSupplierForm(false);
    } catch (err) {
      console.error('Error creating supplier:', err);
      setError('ဆပ်ပလိယာ ဖန်တီးရာတွင် အမှားတစ်စုံတစ်ခု ဖြစ်ပါသည်။');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('အသုံးပြုသူ ဝင်ရောက်မထားပါ');
      return;
    }
    if (!selectedSupplier) {
      setError('ဆပ်ပလိယာ ရွေးချယ်ပါ');
      return;
    }
    if (!selectedProduct) {
      setError('ပစ္စည်း ရွေးချယ်ပါ');
      return;
    }
    if (!selectedVariant) {
      setError('ဗားရီးယန့် ရွေးချယ်ပါ');
      return;
    }
    if (quantity <= 0) {
      setError('အရေအတွက် 0 ထက် ကြီးရပါမည်');
      return;
    }
    if (unitCost <= 0) {
      setError('သွင်းဈေး 0 ထက် ကြီးရပါမည်');
      return;
    }

    setIsSaving(true);
    try {
      const totalCost = quantity * unitCost;
      await createPurchaseOrder({
        user_id: user.id,
        store_id: storeId,
        supplier_id: selectedSupplier,
        product_id: selectedProduct,
        variant_id: selectedVariant,
        quantity,
        unit_cost: unitCost,
        total_cost: totalCost,
        status: 'received',
        notes: notes || undefined,
      });

      alert('Purchase Order အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ။ Stock နှင့် COGS တို့ကို အလိုအလျောက် အပ်ဒိတ်လုပ်ပြီးပါပြီ။');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating purchase order:', err);
      setError('Purchase Order ဖန်တီးရာတွင် အမှားတစ်စုံတစ်ခု ဖြစ်ပါသည်။');
    } finally {
      setIsSaving(false);
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Order အသစ်ဆောက်ရန်</h1>
        <p className="text-gray-600">ဆိုင်ထဲသို့ Stock အသစ်သွင်းရန် Purchase Order ဖန်တီးပါ</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#1a7f8c]" />
            ဆပ်ပလိယာ ရွေးချယ်ခြင်း
          </h2>

          {!showNewSupplierForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ဆပ်ပလိယာ <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                  required
                >
                  <option value="">ဆပ်ပလိယာ ရွေးချယ်ပါ</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name} {supplier.contact_person && `(${supplier.contact_person})`}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowNewSupplierForm(true)}
                className="flex items-center gap-2 text-[#1a7f8c] hover:text-[#158a96] font-medium"
              >
                <Plus className="w-4 h-4" />
                ဆပ်ပလိယာအသစ် ထည့်သွင်းရန်
              </button>
            </div>
          ) : (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">ဆပ်ပလိယာအသစ် ဖန်တီးရန်</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ဆပ်ပလိယာ အမည် <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ဆက်သွယ်ရမည့်သူ
                  </label>
                  <input
                    type="text"
                    value={newSupplier.contact_person}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contact_person: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ဖုန်းနံပါတ်
                  </label>
                  <input
                    type="text"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    အီးမေးလ်
                  </label>
                  <input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    လိပ်စာ
                  </label>
                  <input
                    type="text"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateSupplier}
                  className="px-4 py-2 bg-[#1a7f8c] text-white rounded-lg hover:bg-[#158a96] font-medium"
                >
                  သိမ်းမည်
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewSupplierForm(false);
                    setNewSupplier({ name: '', contact_person: '', phone: '', email: '', address: '' });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  ပယ်ဖျက်မည်
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Product & Variant Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#1a7f8c]" />
            ပစ္စည်း & ဗားရီးယန့် ရွေးချယ်ခြင်း
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ပစ္စည်း <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                required
              >
                <option value="">ပစ္စည်း ရွေးချယ်ပါ</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ဗားရီးယန့် <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                  required
                >
                  <option value="">ဗားရီးယန့် ရွေးချယ်ပါ</option>
                  {variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.name} - လက်ရှိ Stock: {variant.stock}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Quantity & Cost */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#1a7f8c]" />
            အရေအတွက် & သွင်းဈေး
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                အရေအတွက် (Qty) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                သွင်းဈေး (Cost per unit - ကျပ်) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                required
              />
            </div>
          </div>

          {quantity > 0 && unitCost > 0 && (
            <div className="mt-4 p-4 bg-[#1a7f8c]/10 rounded-lg">
              <p className="text-lg font-semibold text-[#1a7f8c]">
                စုစုပေါင်း ကုန်ကျစရိတ်: {quantity * unitCost} ကျပ်
              </p>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              မှတ်ချက် (Notes)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
              placeholder="မှတ်ချက် ရေးသားနိုင်ပါသည်..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#1a7f8c] text-white rounded-lg hover:bg-[#158a96] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                သိမ်းဆည်းနေသည်...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Purchase Order သိမ်းဆည်းမည်
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            <X className="w-5 h-5" />
            ပယ်ဖျက်မည်
          </button>
        </div>
      </form>
    </div>
  );
}
