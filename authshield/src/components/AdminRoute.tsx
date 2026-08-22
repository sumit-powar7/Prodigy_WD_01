import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center animate-pulse">
            <ShieldAlert className="w-8 h-8 text-indigo-400" />
          </div>
          <Loader2 className="w-16 h-16 text-indigo-400 animate-spin absolute top-0 left-0 opacity-70" />
        </div>
        <p className="text-sm font-medium tracking-wide text-slate-400 animate-pulse">
          Evaluating Admin Role Privilege...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl shadow-red-950/40">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-red-400">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <span className="inline-block px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-300 font-mono text-xs uppercase tracking-widest rounded-full mb-3">
            403 Forbidden Access
          </span>

          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            Administrator Authorization Required
          </h2>

          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Your current account (<span className="text-slate-200 font-medium">{user.email}</span>) holds the{' '}
            <span className="text-amber-400 font-semibold font-mono">"{user.role}"</span> role and does not have privilege to view the Admin Command Center.
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-left mb-6 text-xs text-slate-400 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span>Required Role:</span>
              <span className="text-emerald-400 font-bold">admin</span>
            </div>
            <div className="flex justify-between">
              <span>Your Role:</span>
              <span className="text-amber-400 font-bold">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span>Auth Method:</span>
              <span className="text-cyan-400">JWT Cookie</span>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to User Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
