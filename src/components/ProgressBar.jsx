export default function ProgressBar({ label, have, need, color = 'bg-brand-600' }) {
  const pct = need > 0 ? Math.min(100, Math.round((have / need) * 100)) : 100;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm font-medium text-slate-600">
        <span>{label}</span>
        <span>
          {have}/{need}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
