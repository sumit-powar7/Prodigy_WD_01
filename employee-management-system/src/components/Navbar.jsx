import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, LogOut, ShieldCheck, User } from 'lucide-react';

const Navbar = () => {
  const { admin, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 leading-tight tracking-tight">
              StaffHub <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 ml-2">ADMIN</span>
            </h1>
            <p className="text-xs text-slate-400">Employee Management Portal</p>
          </div>
        </div>

        {/* Right Section - Admin User Profile & Logout */}
        {admin && (
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-200 leading-none">{admin.name || 'Administrator'}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{admin.email}</p>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
              title="Logout from Admin account"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-100">Confirm Logout</h3>
            <p className="text-sm text-slate-400 text-center mt-2">
              Are you sure you want to log out of your Admin session?
            </p>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium bg-red-600 text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
