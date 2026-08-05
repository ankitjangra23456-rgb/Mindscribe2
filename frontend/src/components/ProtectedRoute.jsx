import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading, activeRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Security check: Check if user has permission
  const userGrantedRoles = user.roles || [];
  const isAdmin = userGrantedRoles.includes('Admin');

  const hasRolePermission = allowedRoles && allowedRoles.length > 0
    ? (isAdmin || allowedRoles.some(r => userGrantedRoles.includes(r)))
    : true;

  if (!hasRolePermission || (allowedRoles && allowedRoles.length > 0 && !isAdmin && !allowedRoles.includes(activeRole))) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="card p-8 max-w-md w-full text-center space-y-4 shadow-lg border-rose-200">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-slate-500 text-sm">
            Your account role (<strong className="text-slate-800">{userGrantedRoles.join(', ') || activeRole}</strong>) does not have authorization to access this area.
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn-primary mx-auto text-xs px-5 py-2.5"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
}
