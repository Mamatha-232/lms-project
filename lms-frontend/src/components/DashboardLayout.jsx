import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, BookOpen, ClipboardList, GraduationCap,
  Users, Settings, UserCircle, LogOut, Bell, PlusCircle, BarChart3,
  ChevronRight
} from 'lucide-react';
import './DashboardLayout.css';

const navItems = {
  STUDENT: [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/student/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/student/assignments', icon: ClipboardList, label: 'Assignments' },
    { to: '/student/grades', icon: GraduationCap, label: 'Grades' },
    { to: '/student/profile', icon: UserCircle, label: 'Profile' },
  ],
  TEACHER: [
    { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/teacher/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/teacher/create-course', icon: PlusCircle, label: 'Create Course' },
    { to: '/teacher/assignments', icon: ClipboardList, label: 'Submissions' },
    { to: '/teacher/students', icon: Users, label: 'Students' },
    { to: '/teacher/profile', icon: UserCircle, label: 'Profile' },
  ],
  ADMIN: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/courses', icon: BookOpen, label: 'Course Management' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ],
};

const roleBadgeColors = {
  ADMIN: { bg: 'rgba(255, 110, 132, 0.15)', text: 'var(--error)' },
  TEACHER: { bg: 'rgba(163, 166, 255, 0.15)', text: 'var(--primary)' },
  STUDENT: { bg: 'rgba(255, 165, 217, 0.15)', text: 'var(--tertiary)' },
};

function getPageTitle(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return 'Home';
  const last = segments[segments.length - 1];
  const titleMap = {
    student: 'Dashboard', teacher: 'Dashboard', admin: 'Dashboard',
    courses: 'Courses', assignments: 'Assignments', grades: 'Grades',
    profile: 'Profile', students: 'Students', 'create-course': 'Create Course',
    users: 'User Management', reports: 'Reports', settings: 'Settings',
  };
  // if it looks like an ID, go one level up
  if (!isNaN(Number(last)) || last.length > 16) return titleMap[segments[segments.length - 2]] || 'Course Detail';
  return titleMap[last] || last.charAt(0).toUpperCase() + last.slice(1);
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const items = navItems[user?.role] || [];
  const roleStyle = roleBadgeColors[user?.role] || roleBadgeColors.STUDENT;
  const pageTitle = getPageTitle(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">
            <GraduationCap size={22} />
          </div>
          <span className="logo-text">Lumina</span>
        </div>

        {/* Role badge in sidebar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px 20px',
          marginBottom: 4,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: roleStyle.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: roleStyle.text, fontWeight: 700, fontSize: '0.85rem',
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </div>
            <div style={{
              fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.05em',
              color: roleStyle.text,
            }}>
              {user?.role}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 className="page-greeting">
              {pageTitle}
            </h2>
          </div>
          <div className="top-bar-right">
            <button className="notification-btn" aria-label="Notifications">
              <Bell size={18} />
              <span className="notification-dot" />
            </button>
            <div className="user-avatar" title={user?.email}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
