import { Fragment, useEffect, useState } from 'react';
import { adminApi } from '../../api/client.js';
import { LEVEL_BY_STATUS } from '../../constants/levels.js';
import InfoBanner from '../../components/InfoBanner.jsx';

export default function AdminStatusVideos() {
  const [links, setLinks] = useState({}); // { [statusNumber]: edited youtubeLink }
  const [saved, setSaved] = useState({}); // { [statusNumber]: persisted youtubeLink }
  const [rowBusy, setRowBusy] = useState(null); // statusNumber currently saving/deleting
  const [rowMsg, setRowMsg] = useState({}); // { [statusNumber]: short status text }

  const load = () =>
    adminApi
      .get('/web/admin/status-videos')
      .then((r) => {
        const map = {};
        for (const it of r.data.items) map[it.statusNumber] = it.youtubeLink || '';
        setLinks(map);
        setSaved(map);
      })
      .catch(() => {});
  useEffect(() => { load(); }, []);

  const setLink = (n, v) => {
    setLinks((m) => ({ ...m, [n]: v }));
    setRowMsg((m) => ({ ...m, [n]: '' }));
  };

  const saveRow = async (n) => {
    setRowBusy(n);
    try {
      const youtubeLink = (links[n] || '').trim();
      await adminApi.put(`/web/admin/status-videos/${n}`, { youtubeLink });
      setSaved((m) => ({ ...m, [n]: youtubeLink }));
      setLinks((m) => ({ ...m, [n]: youtubeLink }));
      setRowMsg((m) => ({ ...m, [n]: 'Saved' }));
    } catch {
      setRowMsg((m) => ({ ...m, [n]: 'Could not save' }));
    } finally {
      setRowBusy(null);
    }
  };

  const deleteRow = async (n) => {
    if (!confirm(`Remove the video for Status ${n}?`)) return;
    setRowBusy(n);
    try {
      await adminApi.delete(`/web/admin/status-videos/${n}`);
      setSaved((m) => ({ ...m, [n]: '' }));
      setLinks((m) => ({ ...m, [n]: '' }));
      setRowMsg((m) => ({ ...m, [n]: 'Deleted' }));
    } catch {
      setRowMsg((m) => ({ ...m, [n]: 'Could not delete' }));
    } finally {
      setRowBusy(null);
    }
  };

  const filled = Object.values(saved).filter((v) => v && v.trim()).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Status videos</h1>
        <p className="text-sm text-slate-500">
          One YouTube link per WhatsApp status (1–60). {filled}/60 set.
        </p>
      </div>

      <InfoBanner title="How status videos work">
        Each WhatsApp status (1–60) can have its own reward video. Every time a customer
        uploads a status and an admin verifies it, their verified count goes up — and they
        unlock the video saved for that milestone. So a customer with 2 verified statuses sees
        the video set for <span className="font-semibold">Status 2</span>; at 3 they see{' '}
        <span className="font-semibold">Status 3</span>’s video. Only the video for their
        current verified count is shown. Leave a status blank to show no video at that count.
      </InfoBanner>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {Array.from({ length: 60 }, (_, i) => i + 1).map((n) => {
          const level = LEVEL_BY_STATUS[n];
          const cur = links[n] || '';
          const persisted = saved[n] || '';
          const dirty = cur.trim() !== persisted.trim();
          const busy = rowBusy === n;
          const note = rowMsg[n];
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
                  className="input min-w-0 flex-1"
                  placeholder="YouTube link for this status…"
                  value={cur}
                  onChange={(e) => setLink(n, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => saveRow(n)}
                  disabled={busy || !dirty}
                  className="shrink-0 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {busy ? '…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => deleteRow(n)}
                  disabled={busy || !persisted.trim()}
                  className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                >
                  Delete
                </button>
                {note && (
                  <span
                    className={`hidden w-16 shrink-0 text-xs md:block ${
                      note.startsWith('Could') ? 'text-red-500' : 'text-emerald-600'
                    }`}
                  >
                    {note}
                  </span>
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
