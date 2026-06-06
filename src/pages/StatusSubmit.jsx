import { useEffect, useState } from 'react';
import api from '../api/client.js';
import InfoBanner from '../components/InfoBanner.jsx';

export default function StatusSubmit() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/web/me/status').then((r) => setData(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">WhatsApp Status</h1>

      <InfoBanner title="How WhatsApp statuses work">
        Each business status you post and that gets verified counts toward your level — and unlocks
        the reward video for that milestone, shown below. Verification is handled by our team.
      </InfoBanner>

      <div className="card text-center">
        <p className="text-xs uppercase tracking-wide text-slate-400">Verified total</p>
        <p className="text-3xl font-bold text-emerald-600">{data?.verifiedTotal ?? '…'}</p>
        <p className="text-xs text-slate-500">These count toward your level.</p>
      </div>

      {/* Reward video unlocked at the current verified-status count */}
      {data?.video && (
        <div className="card space-y-2">
          <p className="text-sm font-semibold text-slate-700">
            🎁 Your reward video for {data.verifiedTotal} verified{' '}
            {data.verifiedTotal === 1 ? 'status' : 'statuses'}
          </p>
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${data.video.youtubeId}`}
              title={`Status ${data.video.statusNumber} reward video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="text-xs text-slate-500">
            Get more statuses verified to unlock the next reward video.
          </p>
        </div>
      )}
    </div>
  );
}
