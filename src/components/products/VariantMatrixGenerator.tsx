import { useState, useEffect } from 'react';

interface Attribute {
  id: string;
  name: string;
  values: string[];
}

interface VariantRow {
  id: string;
  combination: Record<string, string>;
  displayName: string;
  price: number;
  stock: number;
  costPrice: number;
}

interface VariantMatrixGeneratorProps {
  attributes: Attribute[];
  onVariantsChange: (variants: VariantRow[]) => void;
  existingVariants?: VariantRow[];
}

// Generate all possible combinations from attributes
function generateCombinations(attributes: Attribute[]): VariantRow[] {
  if (attributes.length === 0) return [];

  const combinations: VariantRow[] = [];
  const attributeNames = attributes.map(attr => attr.name);
  const attributeValues = attributes.map(attr => attr.values);

  // Cartesian product to generate all combinations
  function cartesian(...arrays: string[][]): string[][] {
    if (arrays.length === 0) return [[]];
    const [first, ...rest] = arrays;
    const restCombinations = cartesian(...rest);
    return first.flatMap(value => restCombinations.map(combo => [value, ...combo]));
  }

  const allCombinations = cartesian(...attributeValues);

  allCombinations.forEach((combo, index) => {
    const combination: Record<string, string> = {};
    attributeNames.forEach((name, i) => {
      combination[name] = combo[i];
    });

    const displayName = Object.entries(combination)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    combinations.push({
      id: `variant-${Date.now()}-${index}`,
      combination,
      displayName,
      price: 0,
      stock: 0,
      costPrice: 0,
    });
  });

  return combinations;
}

export default function VariantMatrixGenerator({ attributes, onVariantsChange, existingVariants = [] }: VariantMatrixGeneratorProps) {
  const [variants, setVariants] = useState<VariantRow[]>([]);

  useEffect(() => {
    if (attributes.length === 0) {
      setVariants([]);
      onVariantsChange([]);
      return;
    }

    const newVariants = generateCombinations(attributes);

    // Try to match with existing variants to preserve their values
    const mergedVariants = newVariants.map(newVariant => {
      const existing = existingVariants.find(ev => 
        JSON.stringify(ev.combination) === JSON.stringify(newVariant.combination)
      );
      return existing ? { ...newVariant, price: existing.price, stock: existing.stock, costPrice: existing.costPrice } : newVariant;
    });

    setVariants(mergedVariants);
    onVariantsChange(mergedVariants);
  }, [attributes, existingVariants]);

  const updateVariant = (variantId: string, field: keyof VariantRow, value: number) => {
    const updatedVariants = variants.map(v => 
      v.id === variantId ? { ...v, [field]: value } : v
    );
    setVariants(updatedVariants);
    onVariantsChange(updatedVariants);
  };

  if (attributes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Variant Matrix (ဗားရီးယန့် ဇယား)</h3>
        <p className="text-sm text-gray-600">
          Attribute များ ထည့်သွင်းပြီးမှ Variant Matrix ကို အလိုအလျောက် ဖန်တီးပေးပါမည်။
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Variant Matrix (ဗားရီးယန့် ဇယား) - {variants.length} မျိုး
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        ဖြစ်နိုင်ခြေရှိသော Variant အားလုံးကို အောက်တွင် အလိုအလျောက် ဖန်တီးထားပါသည်။ တစ်ခုချင်းစီအတွက် ရောင်းဈေး၊ Stock နှင့် သွင်းဈေးကို ဖြည့်သွင်းပါ။
      </p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Variant</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">ရောင်းဈေး (ကျပ်)</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Stock</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">သွင်းဈေး/COGS (ကျပ်)</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="text-sm font-medium text-gray-900">{variant.displayName}</div>
                </td>
                <td className="py-3 px-4">
                  <input
                    type="number"
                    min="0"
                    value={variant.price || ''}
                    onChange={(e) => updateVariant(variant.id, 'price', Number(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                    placeholder="0"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="number"
                    min="0"
                    value={variant.stock || ''}
                    onChange={(e) => updateVariant(variant.id, 'stock', Number(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                    placeholder="0"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="number"
                    min="0"
                    value={variant.costPrice || ''}
                    onChange={(e) => updateVariant(variant.id, 'costPrice', Number(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1a7f8c] focus:border-transparent"
                    placeholder="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {variants.length > 0 && (
        <div className="mt-4 p-4 bg-[#1a7f8c]/10 rounded-lg">
          <p className="text-sm text-[#1a7f8c]">
            <strong>စုစုပေါင်း: </strong> 
            {variants.length} မျိုးရှိပါသည်။ 
            ရောင်းဈေး၊ Stock နှင့် သွင်းဈေးကို ဖြည့်သွင်းပြီးမှ Product ကို Save လုပ်ပါ။
          </p>
        </div>
      )}
    </div>
  );
}
