import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Referrals from './pages/Referrals.jsx';
import StatusSubmit from './pages/StatusSubmit.jsx';
import Rewards from './pages/Rewards.jsx';
import Videos from './pages/Videos.jsx';
import Profile from './pages/Profile.jsx';

import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminVideos from './pages/admin/AdminVideos.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminStatus from './pages/admin/AdminStatus.jsx';
import AdminCustomers from './pages/admin/AdminCustomers.jsx';

function Protected({ children }) {
  const { customer, loading } = useAuth();
  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-400">Loading…</div>;
  }
  if (!customer) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Customer site */}
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/status" element={<StatusSubmit />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin panel */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminVideos />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="status" element={<AdminStatus />} />
        <Route path="customers" element={<AdminCustomers />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
