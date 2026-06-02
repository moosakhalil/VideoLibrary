import { Outlet } from 'react-router-dom';
import TopNav from './TopNav.jsx';

// Responsive website shell: full-width top navbar + centered content column
// that widens on desktop (max-w-6xl) and stays comfortable on phones.
export default function Layout() {
  return (
    <div className="min-h-full bg-slate-100">
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
