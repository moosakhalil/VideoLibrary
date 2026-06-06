import { useEffect, useState } from 'react';
import api from '../api/client.js';
import InfoBanner from '../components/InfoBanner.jsx';

export default function Rewards() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/web/me/rewards').then((r) => setData(r.data)).catch(() => {});
  }, []);

  const vip = data?.vipCatalog;

  const stateBadge = {
    available: 'bg-emerald-100 text-emerald-700',
    used: 'bg-slate-200 text-slate-500',
    expired: 'bg-red-100 text-red-600',
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Rewards</h1>

      <InfoBanner title="How rewards work">
        As you reach higher levels you earn discounts on your next purchase, and at the top levels
        you get temporary access to the VIP batch catalog. Discounts show here as available, used,
        or expired — keep leveling up to unlock more.
      </InfoBanner>

      <div className="card">
        <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Discounts</p>
        <div className="space-y-2">
          {data?.discounts?.length === 0 && (
            <p className="text-sm text-slate-500">No discounts yet — reach Bronze to earn 1% off.</p>
          )}
          {data?.discounts?.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <span className="text-sm font-medium text-slate-700">
                {d.discountValue}% off next buy
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${stateBadge[d.state]}`}>
                {d.state}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* VIP catalog only while access is active */}
      {vip?.isActive ? (
        <div className="card border-2 border-violet-200">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-bold text-violet-700">💎 VIP Batch Catalog</p>
            <span className="text-xs font-semibold text-violet-600">active</span>
          </div>
          <p className="mb-3 text-sm text-slate-600">
            Exclusive batch pricing — available to you while your VIP access is active.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {['Cement Batch −5%', 'Steel Batch −4%', 'Tiles Batch −6%', 'Paint Batch −3%'].map(
              (item) => (
                <div key={item} className="rounded-xl bg-violet-50 px-3 py-3 text-sm font-medium text-violet-700">
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <div className="card text-sm text-slate-500">
          🔒 The VIP catalog unlocks at <b>Knowledge Master</b> / <b>Ambassador</b> level for 2 days.
        </div>
      )}
    </div>
  );
}
