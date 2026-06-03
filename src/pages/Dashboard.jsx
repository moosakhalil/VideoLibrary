import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Badge from '../components/Badge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';

export default function Dashboard() {
  const { customer } = useAuth();
  const [progress, setProgress] = useState(null);
  const [rewards, setRewards] = useState(null);

  useEffect(() => {
    api.get('/web/me/progress').then((r) => setProgress(r.data)).catch(() => {});
    api.get('/web/me/rewards').then((r) => setRewards(r.data)).catch(() => {});
  }, []);

  const ka = progress?.keepAlive;
  const availableDiscounts = (rewards?.discounts || []).filter((d) => d.state === 'available');
  const vip = rewards?.vipCatalog;

  const vipDaysLeft = vip?.expiresAt
    ? Math.max(0, Math.ceil((new Date(vip.expiresAt) - Date.now()) / 86400000))
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">My Progress</h1>

      {/* Hero badge card */}
      <div className="card flex flex-col items-center gap-4 bg-gradient-to-br from-brand-600 to-brand-700 text-white sm:flex-row sm:items-center sm:p-6">
        <Badge index={customer?.badge?.index} />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs uppercase tracking-wide text-brand-100">Current level</p>
          <p className="text-2xl font-bold">{customer?.badge?.name || 'No badge yet'}</p>
          {customer?.badge?.reward && <p className="text-sm text-brand-100">{customer.badge.reward}</p>}
          <div className="mt-2 flex justify-center gap-4 text-sm sm:justify-start">
            <span>🤝 {customer?.referralCount ?? 0} warm leads</span>
            <span>📸 {customer?.verifiedStatusCount ?? 0} statuses</span>
          </div>
        </div>
      </div>

      {/* Keep-alive */}
      {ka && (
        <div
          className={`card text-sm ${
            ka.isActive ? 'border-l-4 border-emerald-400' : 'border-l-4 border-amber-400'
          }`}
        >
          {ka.isActive ? (
            <p className="font-medium text-emerald-700">
              ✅ Active — {ka.recentActivities} activities in the last {ka.windowDays} days.
            </p>
          ) : (
            <p className="font-medium text-amber-700">
              ⚠️ You're close to inactive — get {ka.moreNeeded} more activity(s) in {ka.windowDays}{' '}
              days to stay active. You keep your badge either way.
            </p>
          )}
        </div>
      )}

      {/* Two-column on desktop: progress + rewards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {progress && (
          <div className="card space-y-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Next level</p>
            <ProgressBar label="Warm leads" have={progress.referrals.have} need={progress.referrals.need} />
            <ProgressBar
              label="WhatsApp statuses"
              have={progress.statuses.have}
              need={progress.statuses.need}
              color="bg-emerald-500"
            />
            <p className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">
              {progress.message}
            </p>
          </div>
        )}

        <div className="card space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">Active rewards</p>
          {availableDiscounts.length === 0 && !vip?.isActive && (
            <p className="text-sm text-slate-500">No active rewards yet — keep going!</p>
          )}
          {availableDiscounts.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <span className="text-sm font-medium text-slate-700">
                {d.discountValue}% off next buy
              </span>
              <span className="text-xs font-semibold text-emerald-600">available</span>
            </div>
          ))}
          {vip?.isActive && (
            <div className="flex items-center justify-between rounded-xl bg-violet-50 px-3 py-2">
              <span className="text-sm font-medium text-violet-700">VIP catalog</span>
              <span className="text-xs font-semibold text-violet-600">{vipDaysLeft} day(s) left</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
