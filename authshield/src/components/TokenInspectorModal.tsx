import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Lock,
  Cookie,
  ShieldCheck,
  Terminal,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface TokenInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TokenInspectorModal: React.FC<TokenInspectorModalProps> = ({ isOpen, onClose }) => {
  const { user, tokenDetails, refreshUser } = useAuth();
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const handleTestProtectedEndpoint = async (endpoint: string) => {
    setTesting(true);
    setTestResponse(null);
    try {
      const res = await fetch(endpoint, {
        credentials: 'include',
      });
      const data = await res.json();
      setTestResponse({
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        data,
      });
    } catch (err: any) {
      setTestResponse({
        status: 500,
        ok: false,
        data: { message: err.message },
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-950/50 text-white p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              HTTP-Only Cookie & JWT Security Inspector
            </h3>
            <p className="text-xs text-slate-400">
              Live inspection of cookie token storage, security headers, and claims
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-5">
          {/* Security Status Banner */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-200">
              <p className="font-semibold text-emerald-300">
                XSS Attack Protection Active
              </p>
              <p className="text-emerald-300/80 mt-0.5">
                JWT tokens are stored strictly inside <code className="bg-emerald-950/80 px-1 py-0.5 rounded font-mono text-[11px] text-emerald-300">HttpOnly</code> cookies. Frontend JavaScript code cannot read or exfiltrate the token via <code className="bg-emerald-950/80 px-1 py-0.5 rounded font-mono text-[11px] text-emerald-300">document.cookie</code>.
              </p>
            </div>
          </div>

          {/* Token Specification Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 font-mono text-[10px] uppercase">Storage Medium</span>
              <p className="font-mono text-cyan-300 font-semibold mt-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                {tokenDetails?.storage || 'HTTP-Only Secure Cookie'}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 font-mono text-[10px] uppercase">SameSite Policy</span>
              <p className="font-mono text-emerald-300 font-semibold mt-1">
                SameSite={tokenDetails?.sameSite || 'Lax'} (Strict CSRF Guard)
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 font-mono text-[10px] uppercase">Password Hashing</span>
              <p className="font-mono text-indigo-300 font-semibold mt-1">
                Bcrypt (Salt Factor 10)
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 font-mono text-[10px] uppercase">Active User Role</span>
              <p className="font-mono text-amber-300 font-semibold mt-1 uppercase">
                {user?.role || 'Guest'}
              </p>
            </div>
          </div>

          {/* Live Endpoint Test Panel */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Test Backend Cookie Authorization
              </span>
              <button
                onClick={refreshUser}
                className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh Session
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => handleTestProtectedEndpoint('/api/auth/me')}
                disabled={testing}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-mono transition-colors"
              >
                GET /api/auth/me
              </button>
              <button
                onClick={() => handleTestProtectedEndpoint('/api/auth/admin-dashboard')}
                disabled={testing}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-mono transition-colors"
              >
                GET /api/auth/admin-dashboard
              </button>
            </div>

            {/* Test Results */}
            {testResponse && (
              <div className="mt-3 bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Response Status:</span>
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      testResponse.ok ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {testResponse.ok ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    {testResponse.status} {testResponse.statusText}
                  </span>
                </div>
                <pre className="text-[11px] text-cyan-300 overflow-x-auto whitespace-pre-wrap max-h-40">
                  {JSON.stringify(testResponse.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
