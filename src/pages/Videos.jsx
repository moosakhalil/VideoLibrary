import { Fragment, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';
import { CATEGORIES } from '../constants/categories.js';

export default function Videos() {
  const [data, setData] = useState(null);
  const [playing, setPlaying] = useState(null); // video id currently playing (YouTube)
  const [category, setCategory] = useState('all'); // selected category filter

  useEffect(() => {
    api.get('/web/videos/library').then((r) => setData(r.data)).catch(() => {});
  }, []);

  // Categories that actually have videos, in canonical order, plus a count each.
  const cats = useMemo(() => {
    if (!data?.groups) return [];
    const counts = {};
    for (const g of data.groups) {
      for (const v of g.videos) for (const c of v.categories || []) counts[c] = (counts[c] || 0) + 1;
    }
    return CATEGORIES.filter((c) => counts[c]).map((c) => ({ name: c, count: counts[c] }));
  }, [data]);

  if (!data) return <p className="text-sm text-slate-500">Loading…</p>;

  if (!data.groups?.length) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Videos</h1>
        <p className="mt-2 text-sm text-slate-500">No videos available yet.</p>
      </div>
    );
  }

  // Apply the category filter, then drop any tier that ends up empty.
  const groups = data.groups
    .map((g) => ({
      ...g,
      videos: category === 'all' ? g.videos : g.videos.filter((v) => (v.categories || []).includes(category)),
    }))
    .filter((g) => g.videos.length);

  const total = cats.reduce((n, c) => n + c.count, 0);

  const idx = data.badgeIndex || 0;

  return (
    <div>
      {/* Level hero */}
      <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Knowledge Videos</h1>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-white/60">Your level</p>
            <p className="mt-1 text-2xl font-extrabold sm:text-3xl">{data.badgeName || 'No badge yet'}</p>
          </div>

          <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl bg-white/15 backdrop-blur sm:h-28 sm:w-28">
            <span className="text-4xl font-extrabold leading-none sm:text-5xl">{idx}</span>
            <span className="mt-1 text-xs font-medium text-white/70">of 7 levels</span>
          </div>
        </div>

        {/* Segmented progress */}
        <div className="mt-6">
          <div className="flex gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`h-2.5 flex-1 rounded-full transition ${i < idx ? 'bg-white' : 'bg-white/25'}`}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-medium text-white/75">
            <span>Level {idx}/7</span>
            {data.nextLevel ? (
              <span>Next: {data.nextLevel.name}</span>
            ) : (
              <span>🎉 Top level reached</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left-side category filter menu */}
        <aside className="lg:w-60 lg:shrink-0">
          <div className="sticky top-4 rounded-2xl bg-white p-3 shadow-sm">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Categories
            </p>
            <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              <CatButton
                label="All categories"
                count={total}
                active={category === 'all'}
                onClick={() => setCategory('all')}
              />
              {cats.map((c) => (
                <CatButton
                  key={c.name}
                  label={c.name}
                  count={c.count}
                  active={category === c.name}
                  onClick={() => setCategory(c.name)}
                />
              ))}
            </nav>
          </div>
        </aside>

        {/* Right side: levels stacked, highest on top — a divider after each */}
        <div className="min-w-0 flex-1">
          {groups.length === 0 && (
            <p className="text-sm text-slate-500">No videos in this category yet.</p>
          )}
          {groups.map((g) => (
            <section key={g.key} className="mb-8 border-b border-slate-200 pb-8 last:mb-0 last:border-0">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800">
                  {g.locked && '🔒 '}
                  {g.label}
                </h2>
                <span className="text-xs text-slate-400">{g.videos.length} video(s)</span>
              </div>

              {/* Locked levels: the unlock note sits in the grid right after the first video */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {g.videos.map((v, i) => (
                  <Fragment key={v.id}>
                    <VideoCard v={v} playing={playing} setPlaying={setPlaying} />
                    {g.locked && i === 0 && <UnlockNote g={g} />}
                  </Fragment>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function UnlockNote({ g }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-amber-50 px-4 py-4 text-center">
      {g.vip ? (
        <p className="text-base font-bold text-amber-800">
          Reach Knowledge Master to unlock VIP catalog videos
        </p>
      ) : (
        <p className="text-base font-bold text-amber-800">
          To unlock full videos: {g.referralsNeeded} more warm lead
          {g.referralsNeeded === 1 ? '' : 's'} & {g.statusesNeeded} more WhatsApp status
          {g.statusesNeeded === 1 ? '' : 'es'}
        </p>
      )}
      <p className="mt-1 text-xs text-amber-600">Previews shown alongside.</p>
    </div>
  );
}

function CatButton({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
        active ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <span className="whitespace-nowrap lg:whitespace-normal">{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function YouTubeFrame({ id, title }) {
  return (
    <div className="aspect-video w-full">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube.com/embed/${id}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function Thumb({ youtubeId, title, onClick }) {
  return (
    <button className="relative block aspect-video w-full" onClick={onClick}>
      <img
        className="h-full w-full object-cover"
        src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
        alt={title}
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-2xl text-white">▶</span>
      </span>
    </button>
  );
}

function VideoCard({ v, playing, setPlaying }) {
  const isPlaying = playing === v.id;

  // ----- Unlocked: full video -----
  if (!v.locked) {
    return (
      <div className="card overflow-hidden p-0">
        {v.videoType === 'upload' ? (
          <video className="aspect-video w-full bg-black" src={v.videoUrl} controls preload="metadata" />
        ) : isPlaying ? (
          <YouTubeFrame id={v.youtubeId} title={v.title} />
        ) : (
          <Thumb youtubeId={v.youtubeId} title={v.title} onClick={() => setPlaying(v.id)} />
        )}
        <div className="p-3">
          <p className="text-sm font-medium text-slate-700">{v.title}</p>
          <CategoryTags categories={v.categories} />
        </div>
      </div>
    );
  }

  // ----- Locked: sample (if any) only -----
  return (
    <div className="card overflow-hidden border-2 border-amber-200 p-0">
      <div className="relative">
        {v.hasSample ? (
          v.sampleType === 'upload' ? (
            <video className="aspect-video w-full bg-black" src={v.sampleVideoUrl} controls preload="metadata" />
          ) : isPlaying ? (
            <YouTubeFrame id={v.sampleYoutubeId} title={`${v.title} (sample)`} />
          ) : (
            <Thumb youtubeId={v.sampleYoutubeId} title={v.title} onClick={() => setPlaying(v.id)} />
          )
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center bg-slate-800 text-white">
            <span className="text-3xl">🔒</span>
            <span className="mt-1 text-xs text-slate-300">Locked</span>
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
          🔒 {v.requiredBadge}
        </span>
        {v.hasSample && (
          <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
            Sample
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-slate-700">{v.title}</p>
        <CategoryTags categories={v.categories} />
      </div>
    </div>
  );
}

function CategoryTags({ categories }) {
  if (!categories?.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {categories.map((c) => (
        <span key={c} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
          {c}
        </span>
      ))}
    </div>
  );
}
