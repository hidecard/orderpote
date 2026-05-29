import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, Mail, Phone, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoreByUserId, getStaffAccountsByStoreId, getStaffRoles, createStaffAccount, updateStaffAccount, deleteStaffAccount, updateStaffPassword } from '../../lib/db';
import type { StaffAccount, StaffRole } from '../../lib/schema';

export default function StaffManagement() {
  const { user } = useAuth();
  const [staffAccounts, setStaffAccounts] = useState<(StaffAccount & { role_name: string; role_display_name: string })[]>([]);
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<(StaffAccount & { role_name: string; role_display_name: string }) | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role_id: '',
    password: '',
    is_active: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const store = await getStoreByUserId(user.id);
        if (!store) return;

        const [staffData, rolesData] = await Promise.all([
          getStaffAccountsByStoreId(store.id),
          getStaffRoles(),
        ]);

        setStaffAccounts(staffData);
        setRoles(rolesData);
      } catch (err) {
        console.error('Error fetching staff data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleCreate = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role_id: '',
      password: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (staff: StaffAccount & { role_name: string; role_display_name: string }) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone || '',
      role_id: staff.role_id,
      password: '',
      is_active: staff.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (staffId: string) => {
    if (!confirm('ဤဝန်ထမ်းကို ဖျက်မည်မှာ သေချာပါသလား?')) return;

    try {
      await deleteStaffAccount(staffId);
      setStaffAccounts(staffAccounts.filter(s => s.id !== staffId));
    } catch (err) {
      console.error('Error deleting staff:', err);
      setError('ဝန်ထမ်း ဖျက်ရာတွင် အမှားတစ်စုံတစ်ခု ဖြစ်ပါသည်');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) return;

    try {
      const store = await getStoreByUserId(user.id);
      if (!store) {
        setError('ဆိုင်မရှိပါ');
        return;
      }

      if (editingStaff) {
        // Update existing staff
        await updateStaffAccount(editingStaff.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          role_id: formData.role_id,
          is_active: formData.is_active,
        });

        if (formData.password) {
          await updateStaffPassword(editingStaff.id, formData.password);
        }

        setStaffAccounts(staffAccounts.map(s => 
          s.id === editingStaff.id 
            ? { ...s, name: formData.name, email: formData.email, phone: formData.phone, role_id: formData.role_id, is_active: formData.is_active }
            : s
        ));
      } else {
        // Create new staff
        if (!formData.password) {
          setError('စကားဝှက် ထည့်သွင်းပါ');
          return;
        }

        const newStaff = await createStaffAccount({
          store_id: store.id,
          role_id: formData.role_id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          is_active: formData.is_active,
        }, formData.password);

        const role = roles.find(r => r.id === formData.role_id);
        setStaffAccounts([...staffAccounts, {
          ...newStaff,
          role_name: role?.name || '',
          role_display_name: role?.display_name || '',
        }]);
      }

      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role_id: '',
        password: '',
        is_active: true,
      });
    } catch (err) {
      console.error('Error saving staff:', err);
      setError('ဝန်ထမ်း သိမ်းဆည်းရာတွင် အမှားတစ်စုံတစ်ခု ဖြစ်ပါသည်');
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ဝန်ထမ်း စီမံခန့်ခွဲမှု</h1>
        <p className="text-gray-600">Staff Management</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">ဝန်ထမ်းများ</h2>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-[#1a7f8c] text-white px-4 py-2 rounded-lg hover:bg-[#158a96] transition-colors"
          >
            <Plus className="w-4 h-4" />
            ဝန်ထမ်းအသစ် ထည့်သွင်းရန်
          </button>
        </div>

        {staffAccounts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>ဝန်ထမ်းမရှိသေးပါ</p>
          </div>
        ) : (
          <div className="space-y-4">
            {staffAccounts.map((staff) => (
              <div key={staff.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-[#1a7f8c]/10 p-3 rounded-full">
                    <User className="w-6 h-6 text-[#1a7f8c]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{staff.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {staff.email}
                      </span>
                      {staff.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {staff.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        {staff.role_display_name}
                      </span>
                    </div>
                    {!staff.is_active && (
                      <span className="text-xs text-red-600 mt-1">ပိတ်ထားပါသည်</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(staff)}
                    className="p-2 text-gray-600 hover:text-[#1a7f8c] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(staff.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingStaff ? 'ဝန်ထမ်း ပြင်ဆင်ရန်' : 'ဝန်ထမ်းအသစ် ထည့်သွင်းရန်'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  အမည်
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  အီးမေးလ်
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ဖုန်းနံပါတ်
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  တာဝန်
                </label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                  required
                >
                  <option value="">ရွေးချယ်ပါ</option>
                  {roles && roles.length > 0 ? (
                    roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.display_name} - {role.description}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      တာဝန်များ မရှိပါ
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {editingStaff ? 'စကားဝှက် ပြောင်းရန် (မပြောင်းလိုပါက ဗလာထားပါ)' : 'စကားဝှက်'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                  placeholder={editingStaff ? '••••••••' : ''}
                  required={!editingStaff}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#1a7f8c] border-gray-300 rounded focus:ring-[#1a7f8c]"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  အသုံးပြုနိုင်သည်
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ပယ်ဖျက်မည်
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#1a7f8c] text-white rounded-lg hover:bg-[#158a96] transition-colors"
                >
                  {editingStaff ? 'ပြင်ဆင်မည်' : 'ထည့်သွင်းမည်'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
