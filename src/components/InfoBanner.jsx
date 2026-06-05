// A short "how this page works" explanation shown at the top of every page,
// so the purpose of each screen is easy to remember at a glance. The "?" badge
// marks it as a help/explanation block, distinct from regular content.
export default function InfoBanner({ title, children }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-900">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
        ?
      </span>
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-brand-800">{children}</p>
      </div>
    </div>
  );
}
