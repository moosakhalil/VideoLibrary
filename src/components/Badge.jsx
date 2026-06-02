const STYLES = {
  0: { ring: 'bg-slate-200 text-slate-500', emoji: '🎓' },
  1: { ring: 'bg-emerald-100 text-emerald-700', emoji: '🌱' },
  2: { ring: 'bg-amber-100 text-amber-700', emoji: '🥉' },
  3: { ring: 'bg-slate-200 text-slate-700', emoji: '🥈' },
  4: { ring: 'bg-yellow-100 text-yellow-700', emoji: '🥇' },
  5: { ring: 'bg-sky-100 text-sky-700', emoji: '💎' },
  6: { ring: 'bg-violet-100 text-violet-700', emoji: '👑' },
  7: { ring: 'bg-fuchsia-100 text-fuchsia-700', emoji: '🏅' },
};

export default function Badge({ index = 0, name, size = 'lg' }) {
  const s = STYLES[index] || STYLES[0];
  const dim = size === 'sm' ? 'h-10 w-10 text-xl' : 'h-20 w-20 text-4xl';
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`flex items-center justify-center rounded-full ${s.ring} ${dim}`}>
        {s.emoji}
      </div>
      {name && <span className="text-center text-sm font-semibold text-slate-700">{name}</span>}
    </div>
  );
}
