import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Home', icon: '🏆' },
  { to: '/referrals', label: 'Warm Leads', icon: '🤝' },
  { to: '/status', label: 'Status', icon: '📸' },
  { to: '/rewards', label: 'Rewards', icon: '🎁' },
  { to: '/videos', label: 'Videos', icon: '▶️' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export default function TopNav() {
  const { customer, logout } = useAuth();
  const navigate = useNavigate();

  const doLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-lg text-white">
            🏆
          </span>
          <span className="hidden text-lg font-bold text-slate-800 sm:block">
            Rewards & Knowledge
          </span>
        </NavLink>

        {/* Nav links — scroll horizontally on small screens */}
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto sm:justify-center">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <span>{l.icon}</span>
              <span className="hidden md:inline">{l.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-3">
          {customer?.badge?.name && (
            <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 lg:block">
              {customer.badge.name}
            </span>
          )}
          <button
            onClick={doLogout}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
