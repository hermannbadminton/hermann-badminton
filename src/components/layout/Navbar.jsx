import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import LoginModal from '../auth/LoginModal';
import { Trophy, Shield, User, RotateCcw, Activity } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView }) {
  const { isAdmin, setIsAdmin, logoutAdmin, resetAllData, tournaments, isBackendConnected } = useTournament();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const ongoingCount = tournaments.filter((t) => t.status === 'ONGOING').length;

  const handleAdminToggle = () => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
    } else {
      logoutAdmin();
      if (currentView === 'admin') {
        setCurrentView('home');
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo & Brand */}
          <div
            onClick={() => setCurrentView('home')}
            className="flex items-center cursor-pointer group shrink-0"
          >
            <img
              src="/logo.png"
              alt="Hermann Badminton Logo"
              className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAdmin && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1 whitespace-nowrap ${
                  currentView === 'admin'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Quản Trị</span>
              </button>
            )}

            {/* Quick Admin Toggle / Login Button */}
            <button
              onClick={handleAdminToggle}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm whitespace-nowrap ${
                isAdmin
                  ? 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400/20'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isAdmin ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Admin (Đăng xuất)</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>
                    Đăng nhập
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => setCurrentView('admin')}
      />
    </header>
  );
}
