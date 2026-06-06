import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Rewards from './pages/Rewards.jsx';
import Videos from './pages/Videos.jsx';
import Profile from './pages/Profile.jsx';

import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminVideos from './pages/admin/AdminVideos.jsx';
import AdminViewVideos from './pages/admin/AdminViewVideos.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminStatusVideos from './pages/admin/AdminStatusVideos.jsx';
import AdminDatedVideos from './pages/admin/AdminDatedVideos.jsx';

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
        {/* Home is a tabbed shell — these three paths render the same page, with
            Progress / Warm Leads / Status selected by the URL. */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/referrals" element={<Dashboard />} />
        <Route path="/status" element={<Dashboard />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin panel */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminVideos />} />
        <Route path="view" element={<AdminViewVideos />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="status-videos" element={<AdminStatusVideos />} />
        <Route path="promotional" element={<AdminDatedVideos kind="promotional" title="Promotional video" blurb="Pick a date and set the promotional video shown to customers on that day. Browse past dates to review videos that were shown." allowPast />} />
        <Route path="today" element={<AdminDatedVideos kind="today" title="Today's video" blurb="Pick a date and set the video shown in the customer's Today's video section on that day." />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
