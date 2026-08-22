import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Lock,
  KeyRound,
  LogOut,
  Sparkles,
  Database,
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface DashboardProps {
  onOpenInspector: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenInspector }) => {
  const { user, logout, auditLogs, fetchAuditLogs } = useAuth();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  if (!user) return null;

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-cyan-950/60 border border-cyan-300/30 shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {user.name}
                  </h1>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider rounded-full font-bold flex items-center gap-1 ${
                      user.role === 'admin'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    }`}
                  >
                    {user.role === 'admin' ? (
                      <ShieldAlert className="w-3 h-3" />
                    ) : (
                      <ShieldCheck className="w-3 h-3" />
                    )}
                    Role: {user.role}
                  </span>
                </div>

                <p className="text-sm text-slate-400 font-mono flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {user.email}
                </p>
              </div>
            </div>

            {/* Header CTA Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenInspector}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-cyan-300 rounded-xl text-xs font-mono font-medium flex items-center gap-2 transition-all shadow-md"
              >
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>Inspect JWT Cookie</span>
              </button>

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-950/40"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Command Center</span>
                </Link>
              )}

              <button
                onClick={logout}
                className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl text-xs font-medium flex items-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Account Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <UserIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Identity Credentials</h3>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center">
                <span className="text-slate-400">User ID:</span>
                <span className="text-slate-200 font-bold truncate max-w-[150px]">{user._id}</span>
              </div>
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center">
                <span className="text-slate-400">Account Role:</span>
                <span className="text-amber-400 uppercase font-bold">{user.role}</span>
              </div>
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center">
                <span className="text-slate-400">Member Since:</span>
                <span className="text-slate-300">{joinDate}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Security & Password Storage */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Cryptography & Storage</h3>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center">
                <span className="text-slate-400">Password Cipher:</span>
                <span className="text-emerald-400 font-bold">Bcrypt (Salt 10)</span>
              </div>
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center">
                <span className="text-slate-400">Token Storage:</span>
                <span className="text-cyan-400 font-bold">HTTP-Only Cookie</span>
              </div>
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center">
                <span className="text-slate-400">XSS Protection:</span>
                <span className="text-emerald-400 font-bold">JavaScript Isolated</span>
              </div>
            </div>
          </div>

          {/* Card 3: Session Security */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Active Session Guard</h3>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center">
                <span className="text-slate-400">Cookie SameSite:</span>
                <span className="text-emerald-300 font-bold">SameSite=Lax</span>
              </div>
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center">
                <span className="text-slate-400">Session Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center">
                <span className="text-slate-400">Database Engine:</span>
                <span className="text-indigo-300 font-bold flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" /> MongoDB / Mongoose
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Audit Timeline for this user */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Security Audit Log</h3>
                <p className="text-xs text-slate-400">
                  Recent authentication events associated with your account
                </p>
              </div>
            </div>

            <button
              onClick={fetchAuditLogs}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
            >
              Sync Log Feed
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-mono">
                No recent security audit events recorded.
              </div>
            ) : (
              auditLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.type === 'LOGIN_SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : log.type === 'REGISTER'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {log.type}
                    </span>
                    <span className="text-slate-300 font-medium">{log.details}</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-600" />
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span>IP: {log.ip}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
