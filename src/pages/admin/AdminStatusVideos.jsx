import { Fragment, useEffect, useState } from 'react';
import { adminApi } from '../../api/client.js';
import { LEVEL_BY_STATUS } from '../../constants/levels.js';

export default function AdminStatusVideos() {
  const [links, setLinks] = useState({}); // { [statusNumber]: youtubeLink }
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () =>
    adminApi
      .get('/web/admin/status-videos')
      .then((r) => {
        const map = {};
        for (const it of r.data.items) map[it.statusNumber] = it.youtubeLink || '';
        setLinks(map);
      })
      .catch(() => {});
  useEffect(() => { load(); }, []);

  const setLink = (n, v) => setLinks((m) => ({ ...m, [n]: v }));

  const save = async () => {
    setBusy(true);
    setMsg('');
    try {
      const items = Array.from({ length: 60 }, (_, i) => ({
        statusNumber: i + 1,
        youtubeLink: links[i + 1] || '',
      }));
      await adminApi.put('/web/admin/status-videos', { items });
      setMsg('Saved.');
    } catch {
      setMsg('Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const filled = Object.values(links).filter((v) => v && v.trim()).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Status videos</h1>
          <p className="text-sm text-slate-500">
            One YouTube link per WhatsApp status (1–60). {filled}/60 set.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm text-slate-500">{msg}</span>}
          <button className="btn-primary" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save all'}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {Array.from({ length: 60 }, (_, i) => i + 1).map((n) => {
          const level = LEVEL_BY_STATUS[n];
          return (
            <Fragment key={n}>
              {level && (
                <div className="flex items-center gap-2 bg-brand-50 px-4 py-2">
                  <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">
                    Level {level.index}
                  </span>
                  <span className="text-sm font-semibold text-brand-800">
                    {level.name} — reached at {level.statuses} statuses
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-2.5 last:border-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                  {n}
                </span>
                <span className="hidden w-24 shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400 sm:block">
                  Status {n}
                </span>
                <input
                  className="input flex-1"
                  placeholder="YouTube link for this status…"
                  value={links[n] || ''}
                  onChange={(e) => setLink(n, e.target.value)}
                />
              </div>
            </Fragment>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button className="btn-primary" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Save all'}
        </button>
      </div>
    </div>
  );
}
