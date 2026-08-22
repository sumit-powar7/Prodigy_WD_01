import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, AdminStats, AuditLog } from '../types';
import {
  ShieldAlert,
  Users,
  Lock,
  Activity,
  Server,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Shield,
  UserCheck,
  Terminal,
  Loader2,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rawApiResponse, setRawApiResponse] = useState<any>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Admin Metrics
      const statsRes = await fetch('/api/auth/admin-dashboard', { credentials: 'include' });
      const statsData = await statsRes.json();

      if (statsRes.ok && statsData.success) {
        setStats(statsData.stats);
        setRawApiResponse(statsData);
      } else {
        setError(statsData.message || 'Failed to fetch admin metrics');
      }

      // 2. Fetch User Directory
      const usersRes = await fetch('/api/auth/users', { credentials: 'include' });
      const usersData = await usersRes.json();
      if (usersRes.ok && usersData.users) {
        setUsersList(usersData.users);
      }

      // 3. Fetch Audit Logs
      const logsRes = await fetch('/api/auth/audit-logs', { credentials: 'include' });
      const logsData = await logsRes.json();
      if (logsRes.ok && logsData.logs) {
        setAuditLogs(logsData.logs);
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to admin security endpoints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleRole = async (targetUserId: string, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setUpdatingUser(targetUserId);

    try {
      const res = await fetch(`/api/auth/users/${targetUserId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh local user list
        setUsersList((prev) =>
          prev.map((u) => (u._id === targetUserId ? { ...u, role: newRole } : u))
        );
        fetchAdminData();
      } else {
        alert(`Failed to update role: ${data.message}`);
      }
    } catch (err: any) {
      alert(`Error updating role: ${err.message}`);
    } finally {
      setUpdatingUser(null);
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Admin Command Center
                  </h1>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-mono uppercase font-bold">
                    Restricted Area
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Full-stack security oversight, RBAC permissions & audit telemetry
                </p>
              </div>
            </div>

            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 rounded-xl text-xs font-mono font-medium flex items-center gap-2 transition-all self-start sm:self-auto shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-300 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Security Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase">Total User Accounts</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">
              {stats?.totalUsers ?? usersList.length}
            </p>
            <span className="text-[10px] text-cyan-400 font-mono mt-1 inline-block">
              {stats?.adminCount ?? 0} Admins • {stats?.standardUserCount ?? 0} Standard Users
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase">Password Security</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-400 font-mono">
              Bcrypt 10 Salt
            </p>
            <span className="text-[10px] text-slate-400 font-mono mt-1 inline-block">
              One-Way Password Encryption
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase">Session Token Storage</span>
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-amber-300 font-mono">
              HTTP-Only JWT
            </p>
            <span className="text-[10px] text-amber-400/80 font-mono mt-1 inline-block">
              SameSite=Lax Cookie Policy
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase">System Status</span>
              <Server className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-indigo-300 font-mono flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Operational
            </p>
            <span className="text-[10px] text-slate-400 font-mono mt-1 inline-block">
              Express + Mongoose Active
            </span>
          </div>
        </div>

        {/* User Directory Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                User Directory & Role Management
              </h3>
              <p className="text-xs text-slate-400">
                View registered users and dynamically toggle roles (User / Admin) for testing
              </p>
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter users or emails..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">User Profile</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5">Current Role</th>
                  <th className="p-3.5">Registered Date</th>
                  <th className="p-3.5 text-right">Role Toggle Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      No matching user accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-sans font-bold text-white flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-300 font-mono text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{u.name}</span>
                        {u._id === user?._id && (
                          <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-300">{u.email}</td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold inline-flex items-center gap-1 ${
                            u.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          }`}
                        >
                          {u.role === 'admin' ? (
                            <ShieldAlert className="w-3 h-3" />
                          ) : (
                            <UserCheck className="w-3 h-3" />
                          )}
                          {u.role}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleToggleRole(u._id, u.role)}
                          disabled={updatingUser === u._id}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all border ${
                            u.role === 'admin'
                              ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700'
                              : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {updatingUser === u._id ? (
                            <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                          ) : u.role === 'admin' ? (
                            'Demote to User'
                          ) : (
                            'Promote to Admin'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-Time Security Audit Log & Raw API Response Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audit Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Real-Time Security Audit Log
            </h3>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <p className="text-xs font-mono text-slate-500 py-4 text-center">
                  No security events recorded yet.
                </p>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-1.5 py-0.2 text-[9px] rounded font-bold uppercase ${
                            log.type === 'LOGIN_SUCCESS'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : log.type === 'LOGIN_FAILED'
                              ? 'bg-red-500/20 text-red-300'
                              : log.type === 'ROLE_CHANGE'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                        >
                          {log.type}
                        </span>
                        <span className="text-slate-200">{log.userEmail}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{log.details}</p>
                    </div>

                    <span className="text-[10px] text-slate-500 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Raw Endpoint Response Inspector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-amber-400" />
              Admin API JSON Endpoint Output
            </h3>

            <p className="text-xs text-slate-400">
              Response from <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded font-mono">GET /api/auth/admin-dashboard</code> protected by <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded font-mono">authorize('admin')</code> middleware:
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-64 text-amber-300/90 leading-relaxed">
              <pre>{JSON.stringify(rawApiResponse, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
