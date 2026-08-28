import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTournament } from '../../context/TournamentContext';
import { usePreventBodyScroll } from '../../hooks/usePreventBodyScroll';
import { Shield, Lock, User, X, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  usePreventBodyScroll(isOpen);

  const { loginAdmin } = useTournament();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await loginAdmin(username, password);
    setLoading(false);

    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(res.error || 'Tài khoản hoặc mật khẩu không chính xác');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] w-screen h-screen min-h-screen flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      {/* Background overlay click dismiss */}
      <div 
        className="fixed inset-0 w-full h-full" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Centered Modal Card */}
      <div className="relative z-10 bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-6 py-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Đăng Nhập Quản Trị Viên</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tài Khoản Quản Trị
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mật Khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Đang xác thực...</span>
              ) : (
                <>
                  <span>Đăng Nhập Quản Trị</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
