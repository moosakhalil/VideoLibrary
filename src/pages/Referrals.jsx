import { useEffect, useState } from 'react';
import api from '../api/client.js';
import InfoBanner from '../components/InfoBanner.jsx';

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

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Warm Leads</h1>

      <InfoBanner title="How warm leads work">
        Share your referral code or WhatsApp link with people you know. When someone you invited
        messages the business and says hi, they become a “warm lead” and count toward your level.
      </InfoBanner>

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
        <div className="card text-center">
          <p className="text-xs uppercase tracking-wide text-slate-400">Your warm leads</p>
          <p className="text-3xl font-bold text-brand-700">{list.qualified ?? 0}</p>
          <p className="text-xs text-slate-500">These count toward your level.</p>
        </div>
      )}
    </div>
  );
}
