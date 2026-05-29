import { useState } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';

interface Attribute {
  id: string;
  name: string;
  values: string[];
}

interface CustomAttributeInputProps {
  attributes: Attribute[];
  onChange: (attributes: Attribute[]) => void;
}

export default function CustomAttributeInput({ attributes, onChange }: CustomAttributeInputProps) {
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newAttributeValues, setNewAttributeValues] = useState('');

  const addAttribute = () => {
    if (!newAttributeName.trim() || !newAttributeValues.trim()) return;

    const valuesArray = newAttributeValues
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);

    if (valuesArray.length === 0) return;

    const newAttribute: Attribute = {
      id: `attr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newAttributeName.trim(),
      values: valuesArray,
    };

    onChange([...attributes, newAttribute]);
    setNewAttributeName('');
    setNewAttributeValues('');
  };

  const removeAttribute = (attributeId: string) => {
    onChange(attributes.filter(attr => attr.id !== attributeId));
  };

  const updateAttributeValue = (attributeId: string, index: number, newValue: string) => {
    onChange(
      attributes.map(attr => {
        if (attr.id === attributeId) {
          const newValues = [...attr.values];
          newValues[index] = newValue;
          return { ...attr, values: newValues };
        }
        return attr;
      })
    );
  };

  const addAttributeValue = (attributeId: string) => {
    onChange(
      attributes.map(attr => {
        if (attr.id === attributeId) {
          return { ...attr, values: [...attr.values, ''] };
        }
        return attr;
      })
    );
  };

  const removeAttributeValue = (attributeId: string, index: number) => {
    onChange(
      attributes.map(attr => {
        if (attr.id === attributeId) {
          return { ...attr, values: attr.values.filter((_, i) => i !== index) };
        }
        return attr;
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Attributes (စိတ်ကြိုက် အရည်အသွေးများ)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Size သိုမဟုတ် Color မဟုတ်ဘဲ မိမိဆိုင်အလိုက် Attribute များ (ဥပမာ - အလေးချိန်, Volume, အရသာ) ကို ထည့်သွင်းနိုင်ပါသည်။
        </p>

        {/* Existing Attributes */}
        {attributes.length > 0 && (
          <div className="space-y-4 mb-4">
            {attributes.map((attr) => (
              <div key={attr.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={attr.name}
                      onChange={(e) => {
                        onChange(
                          attributes.map(a => a.id === attr.id ? { ...a, name: e.target.value } : a)
                        );
                      }}
                      className="font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0"
                      placeholder="Attribute Name (e.g., အလေးချိန်)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttribute(attr.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {attr.values.map((value, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateAttributeValue(attr.id, index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                        placeholder="Value (e.g., 1 Kg)"
                      />
                      {attr.values.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAttributeValue(attr.id, index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addAttributeValue(attr.id)}
                    className="flex items-center gap-1 text-sm text-[#1a7f8c] hover:text-[#158a96]"
                  >
                    <Plus className="w-3 h-3" />
                    Value ထပ်ထည့်ရန်
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Attribute */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attribute Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newAttributeName}
              onChange={(e) => setNewAttributeName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
              placeholder="e.g., အလေးချိန်, Volume, အရသာ"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Values (comma-separated) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newAttributeValues}
              onChange={(e) => setNewAttributeValues(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
              placeholder="e.g., 1 Kg, 5 Kg, 10 Kg"
            />
            <p className="text-xs text-gray-500 mt-1">Values များကို comma (,) ဖြင့် ခွဲထားပါ</p>
          </div>
          <button
            type="button"
            onClick={addAttribute}
            disabled={!newAttributeName.trim() || !newAttributeValues.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a7f8c] text-white rounded-lg hover:bg-[#158a96] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Attribute ထည့်သွင်းရန်
          </button>
        </div>
      </div>
    </div>
  );
}
