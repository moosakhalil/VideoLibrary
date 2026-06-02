import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { customer, setCustomer, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(customer?.name || '');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const { data } = await api.patch('/web/me', { name });
      setCustomer(data.customer);
      setMsg('Saved!');
    } catch {
      setMsg('Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const doLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Profile</h1>

      <form onSubmit={save} className="card space-y-3">
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-400">Name</label>
          <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-400">Phone</label>
          <input className="input mt-1 bg-slate-50" value={customer?.phone || ''} disabled />
        </div>
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </button>
        {msg && <p className="text-center text-sm text-slate-600">{msg}</p>}
      </form>

      <button className="btn bg-red-50 w-full text-red-600 hover:bg-red-100" onClick={doLogout}>
        Log out
      </button>
    </div>
  );
}
