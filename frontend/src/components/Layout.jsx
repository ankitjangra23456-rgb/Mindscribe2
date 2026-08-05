import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import AIChatAssistant from './AIChatAssistant';
import {
  LayoutDashboard, BookOpen, Target, Code2, BarChart2, Award,
  Sparkles, User, Settings, LogOut, Bell, ChevronDown,
  PlusCircle, Users, Briefcase, Shield, Menu, X, Search,
  FileText, Activity, Moon, Sun
} from 'lucide-react';

const NAV_CONFIG = {
  Student: [
    { label: 'Dashboard',    path: '/student',                icon: LayoutDashboard },
    { label: 'My Exams',     path: '/student/exams',          icon: BookOpen },
    { label: 'Practice Zone',path: '/student/practice',       icon: Target },
    { label: 'Coding Arena', path: '/student/coding',         icon: Code2 },
    { label: 'Results',      path: '/student/results',        icon: BarChart2 },
    { label: 'Certificates', path: '/student/certificates',   icon: Award },
    { label: 'AI Feedback',  path: '/student/ai-feedback',    icon: Sparkles },
  ],
  Faculty: [
    { label: 'Dashboard',      path: '/faculty',              icon: LayoutDashboard },
    { label: 'Question Bank',  path: '/faculty/questions',    icon: BookOpen },
    { label: 'Create Exam',    path: '/faculty/create-exam',  icon: PlusCircle },
    { label: 'My Exams',       path: '/faculty/exams',        icon: Target },
    { label: 'Students',       path: '/faculty/students',     icon: Users },
    { label: 'Results & SCI',  path: '/faculty/results',      icon: BarChart2 },
    { label: 'Analytics',      path: '/faculty/analytics',    icon: Activity },
    { label: 'AI Generator',   path: '/faculty/ai-gen',       icon: Sparkles },
  ],
  Admin: [
    { label: 'Dashboard',      path: '/admin',                icon: LayoutDashboard },
    { label: 'Universities',   path: '/admin/universities',   icon: Briefcase },
    { label: 'Courses',        path: '/admin/courses',        icon: BookOpen },
    { label: 'Departments',    path: '/admin/departments',    icon: FileText },
    { label: 'Students',       path: '/admin/students',       icon: Users },
    { label: 'Faculty',        path: '/admin/faculty',        icon: User },
    { label: 'Exams',          path: '/admin/exams',          icon: Target },
    { label: 'Certificates',   path: '/admin/certificates',   icon: Award },
    { label: 'Recruiters',     path: '/admin/recruiters',     icon: Briefcase },
    { label: 'Analytics',      path: '/admin/analytics',      icon: BarChart2 },
    { label: 'Audit Logs',     path: '/admin/logs',           icon: Shield },
  ],
  Recruiter: [
    { label: 'Dashboard',       path: '/recruiter',           icon: LayoutDashboard },
    { label: 'Search Candidates',path: '/recruiter/search',   icon: Search },
    { label: 'Skill Reports',   path: '/recruiter/reports',   icon: Award },
    { label: 'My Shortlist',    path: '/recruiter/shortlist', icon: Target },
    { label: 'Interviews',      path: '/recruiter/interviews',icon: Users },
    { label: 'Messages',        path: '/recruiter/messages',  icon: Sparkles },
  ],
};

const ROLE_COLORS = {
  Student:   'bg-blue-100 text-blue-700',
  Faculty:   'bg-purple-100 text-purple-700',
  Admin:     'bg-rose-100 text-rose-700',
  Recruiter: 'bg-amber-100 text-amber-700',
};

export default function Layout({ children }) {
  const { user, logout, activeRole, switchRole } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleMenu,    setRoleMenu]    = useState(false);
  const [notifMenu,   setNotifMenu]   = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const navItems = NAV_CONFIG[activeRole] || NAV_CONFIG.Student;

  const handleRoleSwitch = (role) => {
    setRoleMenu(false);
    if (switchRole) switchRole(role);
    toast(`Switched to ${role} Console`, 'success', 2000);
    const first = NAV_CONFIG[role]?.[0]?.path;
    if (first) navigate(first);
  };

  const isActive = (path) =>
    path === '/student' || path === '/faculty' || path === '/admin' || path === '/recruiter'
      ? location.pathname === path
      : location.pathname.startsWith(path);

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        document.getElementById('global-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* ── Top Header ── */}
      <header className="h-16 border-b flex items-center px-4 md:px-6 gap-4 sticky top-0 z-40 shadow-sm" style={{ backgroundColor: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>

        {/* Mobile sidebar toggle */}
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:text-slate-800">
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:flex items-baseline gap-0.5">
            <span className="text-lg font-extrabold text-slate-900">ExamX</span>
            <span className="text-lg font-extrabold text-blue-600">AI</span>
          </div>
        </Link>

        {/* Role selector */}
        <div className="relative">
          <button
            onClick={() => setRoleMenu(!roleMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-semibold text-slate-700 transition-all"
          >
            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${ROLE_COLORS[activeRole]}`}>{activeRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleMenu && (
            <div className="absolute left-0 mt-2 w-44 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-50">
              {Object.keys(NAV_CONFIG)
                .filter(role => {
                  const userRoles = user?.roles || [];
                  return userRoles.includes('Admin') || userRoles.includes(role);
                })
                .map(role => (
                  <button
                    key={role}
                    onClick={() => handleRoleSwitch(role)}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                      activeRole === role
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {role} Console
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center flex-1 max-w-xs relative">
          <Search className="w-4 h-4 absolute left-3 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search... (Ctrl+/)"
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            className="input-base w-full pl-9 pr-4 py-2 text-sm"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => {
              toggleTheme();
              toast(isDark ? 'Switched to Light Mode' : 'Switched to Dark Mode', 'info', 2000);
            }}
            className="p-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifMenu(!notifMenu)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
            </button>

            {notifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50 text-xs">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-900">Notifications</span>
                  <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">Mark all as read</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {[
                    { title: 'New Exam Published', desc: 'Data Structures Mid Term is live now.', time: '10m ago' },
                    { title: 'AI Report Ready', desc: 'Your SCI score updated to 88%.', time: '1h ago' },
                    { title: 'Proctor Alert Clean', desc: 'Session verified cleanly.', time: '3h ago' },
                  ].map((n, i) => (
                    <div key={i} className="p-3 hover:bg-slate-50 cursor-pointer">
                      <p className="font-bold text-slate-800">{n.title}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">{n.desc}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Avatar + name */}
          <Link to="/profile" className="flex items-center gap-2.5 hover:bg-slate-100 rounded-xl px-2 py-1.5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.full_name || 'User'}</p>
              <p className="text-xs text-slate-400 leading-tight truncate max-w-[120px]">{user?.email}</p>
            </div>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Mobile Sidebar Overlay ── */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)}></div>
            <aside className="relative w-64 h-full bg-white flex flex-col shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-extrabold text-slate-900">ExamX</span>
                  <span className="text-lg font-extrabold text-blue-600">AI</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 text-slate-500 hover:text-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent navItems={navItems} isActive={isActive} logout={logout} navigate={navigate} setSidebarOpen={setSidebarOpen} />
            </aside>
          </div>
        )}

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:flex w-60 xl:w-64 border-r flex-col shrink-0" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border-color)' }}>
          <SidebarContent navItems={navItems} isActive={isActive} logout={logout} navigate={navigate} />
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6 xl:p-8 scrollbar-thin" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="max-w-7xl mx-auto page-enter">
            {children}
          </div>
        </main>
      </div>
      <AIChatAssistant />
    </div>
  );
}

function SidebarContent({ navItems, isActive, logout, navigate, setSidebarOpen }) {
  return (
    <>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map(item => {
          const Icon   = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen?.(false)}
              className={`nav-item ${active ? 'nav-active' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom account links */}
      <div className="p-3 space-y-0.5 border-t border-slate-100">
        <Link to="/profile"
          onClick={() => setSidebarOpen?.(false)}
          className="nav-item text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <User className="w-4 h-4 text-slate-400" />
          <span>Profile</span>
        </Link>
        <Link to="/settings"
          onClick={() => setSidebarOpen?.(false)}
          className="nav-item text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </Link>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="nav-item w-full text-left text-rose-600 hover:bg-rose-50"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
}
