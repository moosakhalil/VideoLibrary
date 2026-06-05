import { useEffect, useRef, useState } from 'react';
import { adminApi } from '../../api/client.js';
import InfoBanner from '../../components/InfoBanner.jsx';

// Per-kind "how it works" explanation shown at the top of the page.
const INFO = {
  promotional: {
    title: 'How the promotional video works',
    body:
      'Pick a date on the calendar and set the promotional video customers see that day. A date ' +
      'turns green once it has a video and blue while you’re editing it. You can open past dates ' +
      'to review what was shown — and customers get a date filter to watch previous days’ promos, ' +
      'so this builds a daily archive.',
  },
  today: {
    title: 'How Today’s video works',
    body:
      'Pick a date and set the video shown in the customer’s “Today’s video” section that day. A ' +
      'date turns green once it has a video and blue while you’re editing it. You can set videos ' +
      'ahead of time for upcoming dates; past dates are locked.',
  },
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const pad = (n) => String(n).padStart(2, '0');
const ymd = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

// "Today" in Asia/Karachi (GMT+5) so it matches what customers are served,
// regardless of the admin's own device timezone.
function karachiToday() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (t) => Number(parts.find((p) => p.type === t).value);
  return { y: get('year'), m: get('month') - 1, d: get('day') };
}

// Reusable calendar manager for a "kind" of dated video (promotional | today).
// allowPast: let the admin browse past dates to review videos that were shown
// (read-only — the backend rejects saving for a past date).
export default function AdminDatedVideos({ kind, title, blurb, allowPast = false }) {
  const t0 = karachiToday();
  const todayStr = ymd(t0.y, t0.m, t0.d);

  const [view, setView] = useState({ y: t0.y, m: t0.m });
  const [entries, setEntries] = useState({}); // date -> item
  const [selected, setSelected] = useState(todayStr);
  const [source, setSource] = useState('youtube'); // youtube | upload
  const [youtubeLink, setYoutubeLink] = useState('');
  const [vtitle, setVtitle] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef();

  const load = () =>
    adminApi
      .get(`/web/admin/dated-videos?kind=${kind}`)
      .then((r) => {
        const map = {};
        for (const it of r.data.items) map[it.date] = it;
        setEntries(map);
      })
      .catch(() => {});
  useEffect(() => { load(); }, [kind]);

  // Populate the editor whenever the selected date (or loaded data) changes.
  useEffect(() => {
    const e = entries[selected];
    setSource(e?.videoType || 'youtube');
    setYoutubeLink(e?.videoType === 'youtube' ? e.youtubeId || '' : '');
    setVtitle(e?.title || '');
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
    setMsg('');
  }, [selected, entries]);

  const shift = (delta) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  // Disable backward navigation once we're at the current (Karachi) month —
  // unless this calendar allows browsing past dates (promotional).
  const atCurrentMonth = view.y < t0.y || (view.y === t0.y && view.m <= t0.m);
  const canGoBack = allowPast || !atCurrentMonth;

  const firstWeekday = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const save = async () => {
    setBusy(true);
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('kind', kind);
      fd.append('date', selected);
      fd.append('title', vtitle);
      if (source === 'upload') {
        if (!file) { setBusy(false); return setMsg('Choose a video file.'); }
        fd.append('video', file);
      } else {
        if (!youtubeLink.trim()) { setBusy(false); return setMsg('Paste a YouTube link.'); }
        fd.append('youtubeId', youtubeLink.trim());
      }
      await adminApi.post('/web/admin/dated-videos', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMsg('Saved.');
      await load();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const e = entries[selected];
    if (!e) return;
    if (!confirm('Remove the video for this date?')) return;
    await adminApi.delete(`/web/admin/dated-videos/${e.id}`);
    await load();
  };

  const current = entries[selected];
  const isSelectedPast = selected < todayStr; // past dates are view-only
  const prettyDate = (() => {
    const [y, m, d] = selected.split('-').map(Number);
    return `${MONTHS[m - 1]} ${d}, ${y}`;
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {blurb && <p className="text-sm text-slate-500">{blurb}</p>}
      </div>

      {INFO[kind] && <InfoBanner title={INFO[kind].title}>{INFO[kind].body}</InfoBanner>}

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Calendar */}
        <div className="lg:w-80 lg:shrink-0">
          <div className="card">
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => shift(-1)}
                disabled={!canGoBack}
                className={`rounded-lg px-2 py-1 ${
                  !canGoBack ? 'cursor-not-allowed text-slate-300' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                ‹
              </button>
              <p className="font-semibold text-slate-800">{MONTHS[view.m]} {view.y}</p>
              <button onClick={() => shift(1)} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">›</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
              {WEEKDAYS.map((w) => <div key={w} className="py-1">{w}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((d, i) => {
                if (!d) return <div key={`b${i}`} />;
                const ds = ymd(view.y, view.m, d);
                const has = !!entries[ds];
                const isSel = ds === selected;
                const isToday = ds === todayStr;
                const isPast = ds < todayStr;
                const locked = isPast && !allowPast; // can't pick a passed date (unless browsing)
                return (
                  <button
                    key={ds}
                    disabled={locked}
                    title={locked ? 'Past date — cannot be selected' : undefined}
                    onClick={() => !locked && setSelected(ds)}
                    className={`relative flex h-10 items-center justify-center rounded-lg text-sm transition ${
                      locked
                        ? 'cursor-not-allowed text-slate-300 line-through'
                        : isSel
                        ? 'bg-brand-600 font-bold text-white' // selected → full blue box
                        : has
                        ? 'bg-emerald-500 font-bold text-white' // has a video → full green box
                        : isPast
                        ? 'text-slate-400 hover:bg-slate-100' // past, browsable, no video
                        : 'text-slate-700 hover:bg-slate-100'
                    } ${isToday && !isSel ? 'ring-1 ring-brand-300' : ''}`}
                  >
                    {d}
                    {has && isSel && (
                      <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-emerald-500" /> has a video
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-brand-600" /> selected
              </span>
            </p>
          </div>
        </div>

        {/* Editor for the selected date */}
        <div className="min-w-0 flex-1">
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-800">{prettyDate}</p>
              {current && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  video set
                </span>
              )}
            </div>

            {/* Current saved preview */}
            {current && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Currently saved</p>
                <Player item={current} />
              </div>
            )}

            {isSelectedPast ? (
              <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">
                {current
                  ? '📅 Past date — showing the video that was set. Past dates are view-only.'
                  : 'No video was set for this date.'}
              </p>
            ) : (
              <>
            {/* Source toggle */}
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setSource('youtube')}
                className={`rounded-lg py-2 text-sm font-semibold transition ${
                  source === 'youtube' ? 'bg-white text-brand-700 shadow' : 'text-slate-500'
                }`}
              >
                ▶️ YouTube link
              </button>
              <button
                type="button"
                onClick={() => setSource('upload')}
                className={`rounded-lg py-2 text-sm font-semibold transition ${
                  source === 'upload' ? 'bg-white text-brand-700 shadow' : 'text-slate-500'
                }`}
              >
                ⬆️ Upload file
              </button>
            </div>

            <div>
              <label className="text-xs uppercase text-slate-400">Title (optional)</label>
              <input className="input mt-1" value={vtitle} onChange={(e) => setVtitle(e.target.value)} />
            </div>

            {source === 'youtube' ? (
              <div>
                <label className="text-xs uppercase text-slate-400">YouTube URL or ID</label>
                <input
                  className="input mt-1"
                  placeholder="https://youtu.be/… or 11-char ID"
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label className="text-xs uppercase text-slate-400">Video file (mp4, webm, mov · ≤200MB)</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-brand-700"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <button className="btn-primary" onClick={save} disabled={busy}>
                {busy ? 'Saving…' : current ? 'Replace video' : 'Save video'}
              </button>
              {current && (
                <button onClick={remove} className="text-sm font-medium text-red-500 hover:underline">
                  Remove
                </button>
              )}
              {msg && <span className="text-sm text-slate-500">{msg}</span>}
            </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Player({ item }) {
  if (item.videoType === 'upload') {
    return <video className="aspect-video w-full rounded-xl bg-black" src={item.videoUrl} controls preload="metadata" />;
  }
  if (item.youtubeId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${item.youtubeId}`}
          title={item.title || 'video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return null;
}
