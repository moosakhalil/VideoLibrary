import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function Videos() {
  const [data, setData] = useState(null);
  const [playing, setPlaying] = useState(null); // video id currently playing (YouTube)

  useEffect(() => {
    api.get('/web/videos/library').then((r) => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return <p className="text-sm text-slate-500">Loading…</p>;

  if (!data.groups?.length) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Videos</h1>
        <p className="mt-2 text-sm text-slate-500">No videos available yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Knowledge Videos</h1>
        <p className="text-sm text-slate-500">
          Your level: <b>{data.badgeName || 'No badge yet'}</b>
        </p>
      </div>

      {/* All levels stacked, highest on top — a divider line after each level */}
      <div>
        {data.groups.map((g) => (
          <section key={g.key} className="mb-8 border-b border-slate-200 pb-8 last:mb-0 last:border-0">
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">
                {g.locked && '🔒 '}
                {g.label}
              </h2>
              <span className="text-xs text-slate-400">{g.videos.length} video(s)</span>
            </div>

            {/* Centered bold unlock requirement for locked levels */}
            {g.locked && (
              <div className="mb-4 rounded-2xl bg-amber-50 px-4 py-4 text-center">
                {g.vip ? (
                  <p className="text-base font-bold text-amber-800">
                    Reach Knowledge Master to unlock VIP catalog videos
                  </p>
                ) : (
                  <p className="text-base font-bold text-amber-800">
                    To unlock full videos: {g.referralsNeeded} more referral
                    {g.referralsNeeded === 1 ? '' : 's'} & {g.statusesNeeded} more WhatsApp status
                    {g.statusesNeeded === 1 ? '' : 'es'}
                  </p>
                )}
                <p className="mt-1 text-xs text-amber-600">Previews shown below.</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {g.videos.map((v) => (
                <VideoCard key={v.id} v={v} playing={playing} setPlaying={setPlaying} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
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
        <div className="flex items-center justify-between gap-2 p-3">
          <p className="text-sm font-medium text-slate-700">{v.title}</p>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{v.category}</span>
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
      <div className="flex items-center justify-between gap-2 p-3">
        <p className="text-sm font-medium text-slate-700">{v.title}</p>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{v.category}</span>
      </div>
    </div>
  );
}
