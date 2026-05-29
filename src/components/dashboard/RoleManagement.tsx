import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { getStaffRoles, createStaffRole, updateStaffRole, deleteStaffRole } from '../../lib/db';
import type { StaffRole } from '../../lib/schema';

const AVAILABLE_PERMISSIONS = [
  { key: 'products.view', label: 'ပစ္စည်းများ ကြည့်ရှုခွင့်' },
  { key: 'products.edit', label: 'ပစ္စည်းများ ပြင်ဆင်ခွင့်' },
  { key: 'orders.view', label: 'အော်ဒါများ ကြည့်ရှုခွင့်' },
  { key: 'orders.process', label: 'အော်ဒါများ ထုတ်လုပ်ခွင့်' },
  { key: 'orders.update_status', label: 'အော်ဒါ အခြေအနေ ပြောင်းလဲခွင့်' },
  { key: 'suppliers.view', label: 'Supplier များ ကြည့်ရှုခွင့်' },
  { key: 'purchase_orders.create', label: 'Purchase Order ဖန်တီးခွင့်' },
  { key: 'financial_dashboard.view', label: 'ငွေကြေး ဒက်ရှ်ဘုတ် ကြည့်ရှုခွင့်' },
  { key: 'staff.view', label: 'ဝန်ထမ်းများ ကြည့်ရှုခွင့်' },
  { key: 'staff.manage', label: 'ဝန်ထမ်းများ စီမံခန့်ခွဲခွင့်' },
];

export default function RoleManagement() {
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<StaffRole | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    permissions: [] as string[],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRoles() {
      try {
        const rolesData = await getStaffRoles();
        setRoles(rolesData);
      } catch (err) {
        console.error('Error fetching roles:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoles();
  }, []);

  const handleCreate = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      display_name: '',
      description: '',
      permissions: [],
    });
    setShowModal(true);
  };

  const handleEdit = (role: StaffRole) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description || '',
      permissions: role.permissions,
    });
    setShowModal(true);
  };

  const handleDelete = async (roleId: string) => {
    if (roleId.startsWith('role-')) {
      setError('ပုံသေ တာဝန်များကို ဖျက်၍ မရပါ');
      return;
    }
    
    if (!confirm('ဤတာဝန်ကို ဖျက်မည်မှာ သေချာပါသလား?')) return;

    try {
      await deleteStaffRole(roleId);
      setRoles(roles.filter(r => r.id !== roleId));
    } catch (err) {
      console.error('Error deleting role:', err);
      setError('တာဝန် ဖျက်ရာတွင် အမှားတစ်စုံတစ်ခု ဖြစ်ပါသည်');
    }
  };

  const handleTogglePermission = (permission: string) => {
    if (formData.permissions.includes(permission)) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => p !== permission),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permission],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingRole) {
        if (editingRole.id.startsWith('role-')) {
          setError('ပုံသေ တာဝန်များကို ပြင်ဆင်၍ မရပါ');
          return;
        }

        await updateStaffRole(editingRole.id, {
          name: formData.name,
          display_name: formData.display_name,
          description: formData.description,
          permissions: formData.permissions,
        });

        setRoles(roles.map(r => 
          r.id === editingRole.id 
            ? { ...r, name: formData.name, display_name: formData.display_name, description: formData.description, permissions: formData.permissions }
            : r
        ));
      } else {
        const newRole = await createStaffRole({
          name: formData.name,
          display_name: formData.display_name,
          description: formData.description,
          permissions: formData.permissions,
        });

        setRoles([...roles, newRole]);
      }

      setShowModal(false);
      setFormData({
        name: '',
        display_name: '',
        description: '',
        permissions: [],
      });
    } catch (err) {
      console.error('Error saving role:', err);
      setError('တာဝန် သိမ်းဆည်းရာတွင် အမှားတစ်စုံတစ်ခု ဖြစ်ပါသည်');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">တာဝန် စီမံခန့်ခွဲမှု</h1>
        <p className="text-gray-600">Role Management</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">တာဝန်များ</h2>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-[#1a7f8c] text-white px-4 py-2 rounded-lg hover:bg-[#158a96] transition-colors"
          >
            <Plus className="w-4 h-4" />
            တာဝန်အသစ် ထည့်သွင်းရန်
          </button>
        </div>

        {roles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>တာဝန်မရှိသေးပါ</p>
          </div>
        ) : (
          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-[#1a7f8c]/10 p-3 rounded-full">
                    <Shield className="w-6 h-6 text-[#1a7f8c]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{role.display_name}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {role.permissions.includes('*') ? (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">အကုန်ခွင့်</span>
                      ) : (
                        role.permissions.slice(0, 3).map((perm) => (
                          <span key={perm} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {perm}
                          </span>
                        ))
                      )}
                      {role.permissions.length > 3 && !role.permissions.includes('*') && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          +{role.permissions.length - 3} ခု
                        </span>
                      )}
                    </div>
                    {role.id.startsWith('role-') && (
                      <span className="text-xs text-gray-400 mt-1">ပုံသေ တာဝန်</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!role.id.startsWith('role-') && (
                    <>
                      <button
                        onClick={() => handleEdit(role)}
                        className="p-2 text-gray-600 hover:text-[#1a7f8c] hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingRole ? 'တာဝန် ပြင်ဆင်ရန်' : 'တာဝန်အသစ် ထည့်သွင်းရန်'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  တာဝန်အမည် (အင်္ဂလိပ်)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                  placeholder="custom_role"
                  required
                  disabled={!!editingRole}
                />
                {editingRole && (
                  <p className="text-xs text-gray-500 mt-1">တာဝန်အမည်ကို ပြောင်း၍ မရပါ</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ပြရိုဖိုင်အမည်
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                  placeholder="Custom Role"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ရှင်းလင်းချက်
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                  rows={2}
                  placeholder="ဤတာဝန်၏ ရှင်းလင်းချက်"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ခွင့်များ
                </label>
                <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <label key={perm.key} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.key)}
                        onChange={() => handleTogglePermission(perm.key)}
                        className="w-4 h-4 text-[#1a7f8c] border-gray-300 rounded focus:ring-[#1a7f8c]"
                      />
                      <span className="text-sm text-gray-700">{perm.label}</span>
                    </label>
                  ))}
                </div>
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
                  {editingRole ? 'ပြင်ဆင်မည်' : 'ထည့်သွင်းမည်'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
