import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function Referrals() {
  const [ref, setRef] = useState(null);
  const [list, setList] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/web/me/referral').then((r) => setRef(r.data)).catch(() => {});
    api.get('/web/me/referrals').then((r) => setList(r.data)).catch(() => {});
  }, []);

  const copy = async () => {
    if (!ref) return;
    try {
      await navigator.clipboard.writeText(ref.shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const stateLabel = {
    'became-customer': { text: 'Became customer', cls: 'text-emerald-600' },
    'said-hi': { text: 'Said hi ✓', cls: 'text-brand-600' },
    invited: { text: 'Invited', cls: 'text-slate-400' },
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Referrals</h1>

      <div className="card space-y-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Your referral code</p>
        <p className="text-center text-2xl font-bold tracking-widest text-brand-700">
          {ref?.referralCode || '…'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <a
            className="btn bg-green-500 text-white hover:bg-green-600"
            href={ref?.whatsappShareUrl || '#'}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp share
          </a>
          <button className="btn-ghost" onClick={copy}>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </div>

      {list && (
        <div className="card">
          <div className="mb-3 grid grid-cols-3 gap-2 text-center">
            <Stat label="Qualified" value={list.qualified} />
            <Stat label="Customers" value={list.becameCustomers} />
            <Stat label="Total" value={list.total} />
          </div>
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">People you referred</p>
          <div className="divide-y divide-slate-100">
            {list.people.length === 0 && (
              <p className="py-3 text-sm text-slate-500">No referrals yet. Share your code!</p>
            )}
            {list.people.map((p) => {
              const s = stateLabel[p.state] || stateLabel.invited;
              return (
                <div key={p.id} className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-slate-700">{p.name}</span>
                  <span className={`text-xs font-semibold ${s.cls}`}>{s.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 py-2">
      <p className="text-lg font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
