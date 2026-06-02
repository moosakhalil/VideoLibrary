import { useEffect, useRef, useState } from 'react';
import api from '../api/client.js';

export default function StatusSubmit() {
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef();

  const load = () => api.get('/web/me/status').then((r) => setData(r.data)).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!file) return setMsg('Please choose a screenshot first.');
    const form = new FormData();
    form.append('screenshot', file);
    setBusy(true);
    try {
      await api.post('/web/me/status', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMsg('Uploaded! Staff will review it soon.');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      load();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  const badge = {
    pending: 'bg-amber-100 text-amber-700',
    verified: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">WhatsApp Status</h1>

      <div className="card text-center">
        <p className="text-xs uppercase tracking-wide text-slate-400">Verified total</p>
        <p className="text-3xl font-bold text-emerald-600">{data?.verifiedTotal ?? '…'}</p>
        <p className="text-xs text-slate-500">These count toward your level.</p>
      </div>

      <form onSubmit={submit} className="card space-y-3">
        <p className="text-sm font-medium text-slate-700">Upload a status screenshot</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-brand-700"
        />
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? 'Uploading…' : 'Submit for review'}
        </button>
        {msg && <p className="text-center text-sm text-slate-600">{msg}</p>}
      </form>

      <div className="card">
        <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Your submissions</p>
        <div className="space-y-2">
          {data?.submissions?.length === 0 && (
            <p className="text-sm text-slate-500">No submissions yet.</p>
          )}
          {data?.submissions?.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <span className="text-sm text-slate-600">
                {new Date(s.createdAt).toLocaleDateString()}
                {s.status === 'rejected' && s.rejectionReason ? ` — ${s.rejectionReason}` : ''}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge[s.status]}`}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
