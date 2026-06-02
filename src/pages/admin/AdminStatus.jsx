import { useEffect, useState } from 'react';
import { adminApi } from '../../api/client.js';

export default function AdminStatus() {
  const [subs, setSubs] = useState([]);
  const [filter, setFilter] = useState('pending');

  const load = () => {
    const q = filter ? `?status=${filter}` : '';
    adminApi.get(`/web/admin/status${q}`).then((r) => setSubs(r.data.submissions)).catch(() => {});
  };
  useEffect(() => { load(); }, [filter]);

  const moderate = async (id, action) => {
    let reason = '';
    if (action === 'reject') reason = prompt('Reason for rejection (optional):') || '';
    await adminApi.patch(`/web/admin/status/${id}`, { action, reason });
    load();
  };

  const badge = {
    pending: 'bg-amber-100 text-amber-700',
    verified: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Status Review</h1>
        <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      {subs.length === 0 && <p className="text-sm text-slate-500">Nothing here.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subs.map((s) => (
          <div key={s._id} className="card space-y-3">
            <a href={s.imageUrl} target="_blank" rel="noreferrer" className="block">
              <img
                src={s.imageUrl}
                alt="status"
                className="h-44 w-full rounded-xl bg-slate-100 object-cover"
                onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
              />
            </a>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {s.customerId?.name || 'Customer'}
                </p>
                <p className="text-xs text-slate-400">{s.customerId?.phoneNumber?.[0] || ''}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge[s.status]}`}>
                {s.status}
              </span>
            </div>
            {s.status !== 'verified' && (
              <button onClick={() => moderate(s._id, 'approve')} className="btn-primary w-full py-2">
                Approve
              </button>
            )}
            {s.status !== 'rejected' && (
              <button
                onClick={() => moderate(s._id, 'reject')}
                className="btn w-full bg-red-50 py-2 text-red-600 hover:bg-red-100"
              >
                Reject
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
