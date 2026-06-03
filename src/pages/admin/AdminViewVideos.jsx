import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../api/client.js';
import { CATEGORIES } from '../../constants/categories.js';

// Short visibility tag mirroring the upload form's options.
const BADGE_SHORT = ['Everyone', 'First Ref+', 'Bronze+', 'Silver+', 'Gold+', 'Platinum+', 'Master+', 'Ambassador'];
const visLabel = (v) => (v.accessLevel === 'vip' ? 'VIP only' : BADGE_SHORT[v.minBadge || 0]);

const catsOf = (v) => (v.categories?.length ? v.categories : v.category ? [v.category] : []);

export default function AdminViewVideos() {
  const [videos, setVideos] = useState([]);
  const [filter, setFilter] = useState('all'); // category filter

  useEffect(() => {
    adminApi.get('/web/admin/videos').then((r) => setVideos(r.data.videos)).catch(() => {});
  }, []);

  // Categories that actually have videos, in canonical order, with counts.
  const cats = useMemo(() => {
    const counts = {};
    for (const v of videos) for (const c of catsOf(v)) counts[c] = (counts[c] || 0) + 1;
    return CATEGORIES.filter((c) => counts[c]).map((c) => ({ name: c, count: counts[c] }));
  }, [videos]);

  const shown = filter === 'all' ? videos : videos.filter((v) => catsOf(v).includes(filter));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">View videos</h1>
        <p className="text-sm text-slate-500">Watch each video and its sample exactly as stored.</p>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        <FilterChip label="All" count={videos.length} active={filter === 'all'} onClick={() => setFilter('all')} />
        {cats.map((c) => (
          <FilterChip
            key={c.name}
            label={c.name}
            count={c.count}
            active={filter === c.name}
            onClick={() => setFilter(c.name)}
          />
        ))}
      </div>

      {shown.length === 0 && <p className="text-sm text-slate-500">No videos to show.</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {shown.map((v) => (
          <ViewCard key={v._id} v={v} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
        active ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 shadow-sm hover:bg-slate-50'
      }`}
    >
      {label} <span className={active ? 'text-white/70' : 'text-slate-400'}>({count})</span>
    </button>
  );
}

function ViewCard({ v }) {
  const hasSample = v.sampleType && v.sampleType !== 'none';
  return (
    <div className="card space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-slate-800">{v.title}</p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
            v.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
          }`}
        >
          {v.isActive ? 'active' : 'hidden'}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">{visLabel(v)}</span>
        {catsOf(v).map((c) => (
          <span key={c} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{c}</span>
        ))}
      </div>

      {/* Main video */}
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Main video</p>
        <Player type={v.videoType} youtubeId={v.youtubeId} url={v.videoUrl} title={v.title} />
      </div>

      {/* Sample / teaser video */}
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Sample video {hasSample ? '' : '— none'}
        </p>
        {hasSample ? (
          <Player
            type={v.sampleType}
            youtubeId={v.sampleYoutubeId}
            url={v.sampleVideoUrl}
            title={`${v.title} (sample)`}
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
            No sample added
          </div>
        )}
      </div>
    </div>
  );
}

function Player({ type, youtubeId, url, title }) {
  if (type === 'upload') {
    return <video className="aspect-video w-full rounded-xl bg-black" src={url} controls preload="metadata" />;
  }
  if (youtubeId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
      No video source
    </div>
  );
}
