import { useEffect, useState } from 'react';
import { adminApi } from '../../api/client.js';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);

  const load = () =>
    adminApi.get('/web/admin/customers').then((r) => setCustomers(r.data.customers)).catch(() => {});
  useEffect(() => { load(); }, []);

  const addReferral = async (id) => {
    const name = prompt('Warm lead name (counts as a "said hi" warm lead):', 'Friend');
    if (name === null) return;
    await adminApi.post(`/web/admin/customers/${id}/referrals`, { name, repliedWithHi: true });
    load();
  };

  const resetPin = async (id) => {
    if (!confirm('Clear this customer\'s PIN? They will set a new one on next login.')) return;
    await adminApi.post(`/web/admin/customers/${id}/reset-pin`, {});
    load();
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">Customers</h1>

      {customers.length === 0 && (
        <p className="text-sm text-slate-500">No customers yet — they appear here after signing up.</p>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-400">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Badge</th>
              <th className="p-3 text-center">Warm leads</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="p-3 font-medium text-slate-700">{c.name || '—'}</td>
                <td className="p-3 text-slate-600">{c.phone}</td>
                <td className="p-3 text-slate-600">{c.badge}</td>
                <td className="p-3 text-center">{c.referralCount}</td>
                <td className="p-3 text-center">{c.verifiedStatusCount}</td>
                <td className="p-3 text-right">
                  <button onClick={() => addReferral(c.id)} className="mr-3 text-brand-600 hover:underline">
                    + Warm lead
                  </button>
                  <button onClick={() => resetPin(c.id)} className="text-red-500 hover:underline">
                    Reset PIN
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">
        "+ Warm lead" adds a verified warm lead. Approving status screenshots happens in the
        Status review tab. Both feed the reward engine's AND-gate automatically.
      </p>
    </div>
  );
}
