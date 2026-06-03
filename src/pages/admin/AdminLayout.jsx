import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { setAdminToken } from '../../api/client.js';

const tabs = [
  { to: '/admin', label: 'Videos', end: true },
  { to: '/admin/view', label: 'View videos' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/status-videos', label: 'Status videos' },
  { to: '/admin/status', label: 'Status review' },
  { to: '/admin/customers', label: 'Customers' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const hasToken = !!localStorage.getItem('adminToken');
  if (!hasToken) return <Navigate to="/admin/login" replace />;

  const logout = () => {
    setAdminToken(null);
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-full bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛠️</span>
            <span className="font-bold">Admin Panel</span>
          </div>
          <button onClick={logout} className="rounded-lg px-3 py-1.5 text-sm hover:bg-white/10">
            Logout
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'border-white text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
