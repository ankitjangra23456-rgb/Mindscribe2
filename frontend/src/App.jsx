import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login              from './pages/Login';
import Register           from './pages/Register';
import StudentDashboard   from './pages/StudentDashboard';
import FacultyDashboard   from './pages/FacultyDashboard';
import AdminDashboard     from './pages/AdminDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AIFeedbackView     from './pages/AIFeedbackView';
import Profile            from './pages/Profile';
import Settings           from './pages/Settings';

// Components
import ExamRunner from './components/ExamRunner';

/* ── Loading screen ── */
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center animate-pulse">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <p className="text-slate-500 text-sm font-semibold">Loading ExamX AI...</p>
      </div>
    </div>
  );
}

/* ── Root redirect — choose home page based on role ── */
function RootRedirect() {
  const { user, loading, activeRole } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user)   return <Navigate to="/register" replace />;

  if (activeRole === 'Admin')     return <Navigate to="/admin"     replace />;
  if (activeRole === 'Faculty')   return <Navigate to="/faculty"   replace />;
  if (activeRole === 'Recruiter') return <Navigate to="/recruiter" replace />;
  return <Navigate to="/student" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Root ── */}
      <Route path="/" element={<RootRedirect />} />

      {/* ── Student Protected Routes ── */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['Student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/exams" element={<ProtectedRoute allowedRoles={['Student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/practice" element={<ProtectedRoute allowedRoles={['Student']}><ExamRunner /></ProtectedRoute>} />
      <Route path="/student/coding" element={<ProtectedRoute allowedRoles={['Student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/results" element={<ProtectedRoute allowedRoles={['Student']}><AIFeedbackView /></ProtectedRoute>} />
      <Route path="/student/ai-feedback" element={<ProtectedRoute allowedRoles={['Student']}><AIFeedbackView /></ProtectedRoute>} />
      <Route path="/student/certificates" element={<ProtectedRoute allowedRoles={['Student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/exam-runner" element={<ProtectedRoute allowedRoles={['Student']}><ExamRunner /></ProtectedRoute>} />

      {/* ── Faculty Protected Routes ── */}
      <Route path="/faculty" element={<ProtectedRoute allowedRoles={['Faculty', 'Admin']}><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/faculty/*" element={<ProtectedRoute allowedRoles={['Faculty', 'Admin']}><FacultyDashboard /></ProtectedRoute>} />

      {/* ── Admin Protected Routes ── */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />

      {/* ── Recruiter Protected Routes ── */}
      <Route path="/recruiter" element={<ProtectedRoute allowedRoles={['Recruiter', 'Admin']}><RecruiterDashboard /></ProtectedRoute>} />
      <Route path="/recruiter/*" element={<ProtectedRoute allowedRoles={['Recruiter', 'Admin']}><RecruiterDashboard /></ProtectedRoute>} />

      {/* ── Shared Protected Routes ── */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* ── 404 fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
