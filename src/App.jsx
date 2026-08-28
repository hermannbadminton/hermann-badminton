import React, { useState, useEffect } from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import TournamentModal from './components/admin/TournamentModal';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

function ToastContainer() {
  const { toastMessage } = useTournament();
  if (!toastMessage) return null;

  const { msg, type } = toastMessage;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-bold text-white backdrop-blur-md border ${
          type === 'info'
            ? 'bg-slate-900/95 border-slate-700'
            : type === 'warning'
            ? 'bg-amber-600/95 border-amber-400'
            : 'bg-emerald-600/95 border-emerald-400'
        }`}
      >
        {type === 'info' ? (
          <Info className="w-4 h-4 text-blue-400" />
        ) : type === 'warning' ? (
          <AlertCircle className="w-4 h-4 text-amber-200" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
        )}
        <span>{msg}</span>
      </div>
    </div>
  );
}

// Helper phân tích đường dẫn URL hiện tại
const parseRouteFromUrl = () => {
  const path = window.location.pathname;
  if (path.startsWith('/tournament/') || path.startsWith('/tournaments/')) {
    const id = path.split('/')[2];
    if (id) {
      return { view: 'detail', tournamentId: decodeURIComponent(id) };
    }
  }
  if (path === '/admin') {
    return { view: 'admin', tournamentId: null };
  }
  return { view: 'home', tournamentId: null };
};

function MainApp() {
  const initialRoute = parseRouteFromUrl();
  const [currentView, setCurrentView] = useState(initialRoute.view);
  const [selectedTournamentId, setSelectedTournamentId] = useState(initialRoute.tournamentId || 't-1');
  const [isCreatingTournament, setIsCreatingTournament] = useState(false);

  // Điều hướng và cập nhật thanh địa chỉ URL của trình duyệt
  const navigateTo = (view, tournamentId = null, replace = false) => {
    let path = '/';
    if (view === 'detail' && tournamentId) {
      path = `/tournament/${encodeURIComponent(tournamentId)}`;
    } else if (view === 'admin') {
      path = '/admin';
    }

    if (window.location.pathname !== path) {
      if (replace) {
        window.history.replaceState({ view, tournamentId }, '', path);
      } else {
        window.history.pushState({ view, tournamentId }, '', path);
      }
    }
    setCurrentView(view);
    if (tournamentId) {
      setSelectedTournamentId(tournamentId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Lắng nghe sự kiện Back/Forward của trình duyệt
  useEffect(() => {
    const handlePopState = () => {
      const route = parseRouteFromUrl();
      setCurrentView(route.view);
      if (route.tournamentId) {
        setSelectedTournamentId(route.tournamentId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectTournament = (id) => {
    navigateTo('detail', id);
  };

  const handleBackToHome = () => {
    navigateTo('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navigation */}
      <Navbar currentView={currentView} setCurrentView={(view) => navigateTo(view)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentView === 'home' && (
          <HomePage
            onSelectTournament={handleSelectTournament}
            onOpenCreateTournament={() => setIsCreatingTournament(true)}
          />
        )}

        {currentView === 'detail' && (
          <TournamentDetailPage
            tournamentId={selectedTournamentId}
            onBack={handleBackToHome}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardPage onSelectTournament={handleSelectTournament} />
        )}
      </main>

      {/* Quick Modal Create Tournament */}
      {isCreatingTournament && (
        <TournamentModal onClose={() => setIsCreatingTournament(false)} />
      )}

      {/* Global Toast Notifications */}
      <ToastContainer />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <TournamentProvider>
      <MainApp />
    </TournamentProvider>
  );
}
