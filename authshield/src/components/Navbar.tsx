import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  User as UserIcon,
  ShieldAlert,
  LogOut,
  KeyRound,
  LayoutDashboard,
  Lock,
} from 'lucide-react';

interface NavbarProps {
  onOpenInspector: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenInspector }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950/50 group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-6 h-6 text-cyan-200" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                AuthShield
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded">
                JWT + Cookie
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-none">
              Enterprise Full-Stack Auth
            </p>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Dashboard Navigation */}
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  location.pathname === '/dashboard'
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>

              {/* Admin Dashboard Navigation */}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    location.pathname === '/admin'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* Live Cookie Inspector Trigger */}
              <button
                onClick={onOpenInspector}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm"
                title="Inspect HTTP-Only JWT Cookie & Security Headers"
              >
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Token Inspector</span>
              </button>

              {/* User Profile Badge */}
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
                  <UserIcon className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">
                    {user.name}
                  </p>
                  <span
                    className={`inline-block px-1.5 py-0.2 text-[9px] font-mono uppercase tracking-wider rounded font-bold ${
                      user.role === 'admin'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 hover:text-red-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-cyan-950/40 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
