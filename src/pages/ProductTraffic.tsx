import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProductViews } from '../lib/db';

type ProductView = { id: string; slug: string; name: string; views: number; orders: number };

export default function ProductTrafficPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ProductView[]>([]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const data = await getProductViews(user.id, 50);
        setRows(data as ProductView[]);
      } catch (err) {
        console.error('Failed to load product traffic', err);
      }
    }

    load();
  }, [user]);

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-4">ပစ္စည်းလာရောက်မှု</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ပစ္စည်း</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">လှုပ်ရှားမှု</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ပြောင်းလဲနှုန်း</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <a className="text-[#1a7f8c] hover:underline" href={`/product/${p.slug || p.id}`}>{p.name}</a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        <span className="text-sm">{p.views}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h4l3 8 4-16 3 8h4"></path></svg>
                        <span className="text-sm">{p.orders}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.views ? `${Math.round((p.orders / p.views) * 100)}%` : '0%'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
