import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--surface)' }}>
        <div className="animate-pulse">
          <div className="w-16 h-16 rounded-full" style={{ background: 'linear-gradient(135deg, var(--primary-dim), var(--primary))' }} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to the user's proper dashboard
    const dashboardMap = {
      ADMIN: '/admin',
      TEACHER: '/teacher',
      STUDENT: '/student',
    };
    return <Navigate to={dashboardMap[user?.role] || '/login'} replace />;
  }

  return <Outlet />;
}
