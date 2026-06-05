import { useEffect, useState } from 'react';
import { adminApi } from '../../api/client.js';
import InfoBanner from '../../components/InfoBanner.jsx';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () =>
    adminApi.get('/web/admin/categories').then((r) => setCategories(r.data.categories)).catch(() => {});
  useEffect(() => { load(); }, []);

  const toggle = async (c) => {
    if (!c.id) return;
    setBusyId(c.id);
    setMsg('');
    // Optimistic flip so the switch feels instant.
    setCategories((list) => list.map((x) => (x.id === c.id ? { ...x, isActive: !x.isActive } : x)));
    try {
      await adminApi.patch(`/web/admin/categories/${c.id}`, { isActive: !c.isActive });
    } catch {
      setMsg('Could not update. Reloading…');
      load();
    } finally {
      setBusyId(null);
    }
  };

  const activeCount = categories.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
        <p className="text-sm text-slate-500">
          Turn a category off to instantly hide all of its videos from customers.
          {' '}<b>{activeCount}</b> of {categories.length} active.
        </p>
        {msg && <p className="mt-1 text-sm text-red-500">{msg}</p>}
      </div>

      <InfoBanner title="How categories work">
        Categories group your videos for customers. Turn one off to instantly hide every video in
        it — without deleting anything — and turn it back on whenever you like. Only categories
        that are on, and that contain at least one video, appear to customers.
      </InfoBanner>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {categories.map((c) => (
          <div key={c.name} className="flex items-center gap-3 border-b border-slate-100 p-4 last:border-0">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-700">{c.name}</p>
              <p className="text-xs text-slate-400">
                {c.videoCount} video{c.videoCount === 1 ? '' : 's'}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {c.isActive ? 'shown to customers' : 'hidden'}
            </span>
            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={c.isActive}
              disabled={busyId === c.id}
              onClick={() => toggle(c)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50 ${
                c.isActive ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                  c.isActive ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="p-4 text-sm text-slate-500">Loading categories…</p>
        )}
      </div>
    </div>
  );
}
