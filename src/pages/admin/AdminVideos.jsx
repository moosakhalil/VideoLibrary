import { useEffect, useRef, useState } from 'react';
import { adminApi } from '../../api/client.js';

const EMPTY = { title: '', youtubeId: '', category: '', visibility: 'all', sortOrder: 0, sampleYoutubeId: '' };

// "Visible to" options. Access is cumulative — a customer also sees every lower badge.
const VISIBILITY = [
  { value: 'all', label: 'Everyone (no badge needed)' },
  { value: '1', label: 'First Referral Knowledge & up' },
  { value: '2', label: 'Bronze Knowledge & up' },
  { value: '3', label: 'Silver Knowledge & up' },
  { value: '4', label: 'Gold Knowledge & up' },
  { value: '5', label: 'Platinum Knowledge & up' },
  { value: '6', label: 'Knowledge Master & up' },
  { value: '7', label: 'Knowledge Ambassador only' },
  { value: 'vip', label: 'VIP catalog only' },
];

// short tag shown in the list
const BADGE_SHORT = ['Everyone', 'First Ref+', 'Bronze+', 'Silver+', 'Gold+', 'Platinum+', 'Master+', 'Ambassador'];

// convert the dropdown value -> stored fields
function visToFields(visibility) {
  if (visibility === 'vip') return { accessLevel: 'vip', minBadge: 0 };
  if (visibility === 'all') return { accessLevel: 'all', minBadge: 0 };
  return { accessLevel: 'all', minBadge: Number(visibility) };
}
// convert a stored video -> dropdown value
function fieldsToVis(v) {
  if (v.accessLevel === 'vip') return 'vip';
  return v.minBadge > 0 ? String(v.minBadge) : 'all';
}

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [source, setSource] = useState('youtube'); // 'youtube' | 'upload'
  const [file, setFile] = useState(null);
  const [sampleSource, setSampleSource] = useState('none'); // 'none' | 'youtube' | 'upload'
  const [sampleFile, setSampleFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef();
  const sampleFileRef = useRef();

  const load = () => adminApi.get('/web/admin/videos').then((r) => setVideos(r.data.videos)).catch(() => {});
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const startEdit = (v) => {
    setEditingId(v._id);
    setSource(v.videoType);
    setForm({
      title: v.title,
      youtubeId: v.youtubeId,
      category: v.category,
      visibility: fieldsToVis(v),
      sortOrder: v.sortOrder,
      sampleYoutubeId: v.sampleYoutubeId || '',
    });
    setSampleSource(v.sampleType || 'none');
    setSampleFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancel = () => {
    setEditingId(null);
    setForm(EMPTY);
    setFile(null);
    setSource('youtube');
    setSampleSource('none');
    setSampleFile(null);
    if (fileRef.current) fileRef.current.value = '';
    if (sampleFileRef.current) sampleFileRef.current.value = '';
  };

  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    setBusy(true);
    const access = visToFields(form.visibility);
    try {
      if (editingId) {
        // Edit = metadata only (main media stays as-is). Sample YouTube/clear allowed.
        const body = {
          title: form.title,
          category: form.category,
          accessLevel: access.accessLevel,
          minBadge: access.minBadge,
          sortOrder: form.sortOrder,
          ...(source === 'youtube' ? { youtubeId: form.youtubeId } : {}),
        };
        if (sampleSource === 'none') body.sampleType = 'none';
        else if (sampleSource === 'youtube') body.sampleYoutubeId = form.sampleYoutubeId;
        await adminApi.patch(`/web/admin/videos/${editingId}`, body);
        setMsg('Video updated.');
      } else {
        // Create — always multipart so files (main and/or sample) can ride along.
        if (source === 'upload' && !file) { setBusy(false); return setMsg('Please choose a video file.'); }
        if (sampleSource === 'upload' && !sampleFile) { setBusy(false); return setMsg('Please choose a sample file (or switch sample to None/YouTube).'); }

        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('category', form.category);
        fd.append('accessLevel', access.accessLevel);
        fd.append('minBadge', String(access.minBadge));
        fd.append('sortOrder', String(form.sortOrder));
        if (source === 'youtube') fd.append('youtubeId', form.youtubeId);
        else fd.append('video', file);
        if (sampleSource === 'youtube') fd.append('sampleYoutubeId', form.sampleYoutubeId);
        else if (sampleSource === 'upload') fd.append('sampleVideo', sampleFile);

        await adminApi.post('/web/admin/videos', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMsg('Video saved.');
      }
      cancel();
      load();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this video?')) return;
    await adminApi.delete(`/web/admin/videos/${id}`);
    load();
  };

  const toggleActive = async (v) => {
    await adminApi.patch(`/web/admin/videos/${v._id}`, { isActive: !v.isActive });
    load();
  };

  const byCat = videos.reduce((acc, v) => {
    (acc[v.category] = acc[v.category] || []).push(v);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Knowledge Videos</h1>

      <form onSubmit={save} className="card space-y-4">
        <p className="font-semibold text-slate-700">{editingId ? 'Edit video' : 'Add a video'}</p>

        {/* Source toggle (only when adding) */}
        {!editingId && (
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
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs uppercase text-slate-400">Title</label>
            <input className="input mt-1" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>

          {/* Source-specific field */}
          {source === 'youtube' ? (
            <div>
              <label className="text-xs uppercase text-slate-400">YouTube URL or ID</label>
              <input
                className="input mt-1"
                placeholder="https://youtu.be/… or 11-char ID"
                value={form.youtubeId}
                onChange={(e) => set('youtubeId', e.target.value)}
                required={source === 'youtube'}
              />
            </div>
          ) : (
            <div>
              <label className="text-xs uppercase text-slate-400">
                {editingId ? 'Uploaded file (cannot change here)' : 'Video file (mp4, webm, mov · ≤200MB)'}
              </label>
              {editingId ? (
                <input className="input mt-1 bg-slate-50" value="— existing upload —" disabled />
              ) : (
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-brand-700"
                />
              )}
            </div>
          )}

          <div>
            <label className="text-xs uppercase text-slate-400">Category</label>
            <input
              className="input mt-1"
              list="cat-list"
              placeholder="e.g. Product Knowledge"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              required
            />
            <datalist id="cat-list">
              {Object.keys(byCat).map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div>
            <label className="text-xs uppercase text-slate-400">Visible to (badge)</label>
            <select className="input mt-1" value={form.visibility} onChange={(e) => set('visibility', e.target.value)}>
              {VISIBILITY.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              Customers at this badge — and every higher badge — can see it.
            </p>
          </div>
          <div>
            <label className="text-xs uppercase text-slate-400">Order</label>
            <input
              type="number"
              className="input mt-1"
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', e.target.value)}
            />
          </div>
        </div>

        {/* Sample / teaser video — shown to customers below the required badge */}
        <div className="rounded-xl border border-dashed border-slate-300 p-3">
          <p className="text-sm font-semibold text-slate-700">Sample video (optional)</p>
          <p className="mb-2 text-xs text-slate-400">
            Customers below the required badge see this teaser with an "upgrade to unlock" message.
          </p>
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">
            {['none', 'youtube', 'upload'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSampleSource(s)}
                className={`rounded-lg py-2 text-sm font-semibold capitalize transition ${
                  sampleSource === s ? 'bg-white text-brand-700 shadow' : 'text-slate-500'
                }`}
              >
                {s === 'none' ? 'No sample' : s === 'youtube' ? '▶️ YouTube' : '⬆️ Upload'}
              </button>
            ))}
          </div>
          {sampleSource === 'youtube' && (
            <input
              className="input mt-2"
              placeholder="Sample YouTube URL or ID"
              value={form.sampleYoutubeId}
              onChange={(e) => set('sampleYoutubeId', e.target.value)}
            />
          )}
          {sampleSource === 'upload' && (
            editingId ? (
              <input className="input mt-2 bg-slate-50" value="— re-add via a new video to change an uploaded sample —" disabled />
            ) : (
              <input
                ref={sampleFileRef}
                type="file"
                accept="video/*"
                onChange={(e) => setSampleFile(e.target.files?.[0] || null)}
                className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-brand-700"
              />
            )
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editingId ? 'Update video' : source === 'upload' ? 'Upload video' : 'Add video'}
          </button>
          {editingId && <button type="button" onClick={cancel} className="btn-ghost">Cancel</button>}
          {msg && <span className="text-sm text-slate-500">{msg}</span>}
        </div>
        {busy && source === 'upload' && !editingId && (
          <p className="text-xs text-slate-400">Uploading the file… large videos can take a moment.</p>
        )}
      </form>

      {videos.length === 0 && (
        <p className="text-sm text-slate-500">No videos yet. Add your first one above.</p>
      )}
      {Object.entries(byCat).map(([cat, list]) => (
        <div key={cat} className="space-y-2">
          <h2 className="font-bold text-slate-700">{cat} <span className="text-sm font-normal text-slate-400">({list.length})</span></h2>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {list.map((v) => (
              <div key={v._id} className="flex items-center gap-3 border-b border-slate-100 p-3 last:border-0">
                {v.videoType === 'upload' ? (
                  <div className="flex h-12 w-20 items-center justify-center rounded bg-slate-800 text-lg text-white">🎬</div>
                ) : (
                  <img src={`https://img.youtube.com/vi/${v.youtubeId}/default.jpg`} alt="" className="h-12 w-20 rounded object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700">{v.title}</p>
                  <p className="text-xs text-slate-400">
                    {v.videoType === 'upload' ? 'Uploaded file' : v.youtubeId} · order {v.sortOrder}
                    {v.sampleType && v.sampleType !== 'none' && ' · 🎬 sample'}
                  </p>
                </div>
                <span className="hidden rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 sm:inline">
                  {v.accessLevel === 'vip' ? 'VIP' : BADGE_SHORT[v.minBadge || 0]}
                </span>
                <button
                  onClick={() => toggleActive(v)}
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    v.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {v.isActive ? 'active' : 'hidden'}
                </button>
                <button onClick={() => startEdit(v)} className="text-sm text-brand-600 hover:underline">Edit</button>
                <button onClick={() => remove(v._id)} className="text-sm text-red-500 hover:underline">Delete</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
