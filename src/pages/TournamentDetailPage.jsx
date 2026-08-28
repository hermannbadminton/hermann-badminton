import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import BracketViewer from '../components/bracket/BracketViewer';
import GroupStageViewer from '../components/group/GroupStageViewer';
import MatchDetailModal from '../components/bracket/MatchDetailModal';
import ScoreEditorModal from '../components/admin/ScoreEditorModal';
import TournamentModal from '../components/admin/TournamentModal';
import TeamManagerModal from '../components/admin/TeamManagerModal';
import {
  Trophy,
  Calendar,
  MapPin,
  Award,
  Users,
  BookOpen,
  ArrowLeft,
  Share2,
  ShieldCheck,
  Edit,
  Flame,
  Layers,
} from 'lucide-react';

export default function TournamentDetailPage({ tournamentId, onBack }) {
  const { tournaments, teams, isAdmin, getBracketByTournament, isLoading } = useTournament();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const cleanStr = String(dateStr).split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const getCategoryBadge = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('nữ') && !cat.includes('nam')) {
      return (
        <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-md shadow-rose-950/40 border border-pink-300/40 tracking-wide uppercase">
          {category}
        </span>
      );
    }
    if (cat.includes('nam nữ') || cat.includes('hỗn hợp')) {
      return (
        <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-600 text-white shadow-md shadow-purple-950/40 border border-purple-300/40 tracking-wide uppercase">
          {category}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/40 border border-sky-300/40 tracking-wide uppercase">
        {category || 'Đôi Nam'}
      </span>
    );
  };

  const tournament = tournaments.find((t) => String(t.id) === String(tournamentId));

  const hasGroupStage = tournament?.format === 'GROUP_KNOCKOUT' || tournament?.format === 'ROUND_ROBIN';
  const hasKnockout = tournament?.format !== 'ROUND_ROBIN';

  // Tabs: 'GROUPS' | 'BRACKET' | 'RULES'
  const [activeTab, setActiveTab] = useState(() => (hasGroupStage ? 'GROUPS' : 'BRACKET'));

  React.useEffect(() => {
    if (tournament) {
      setActiveTab(hasGroupStage ? 'GROUPS' : 'BRACKET');
    }
  }, [tournament?.id, hasGroupStage]);

  const [selectedMatchForDetail, setSelectedMatchForDetail] = useState(null);
  const [selectedMatchForAdminScore, setSelectedMatchForAdminScore] = useState(null);
  const [isManagingTeams, setIsManagingTeams] = useState(false);
  const [isEditingTournament, setIsEditingTournament] = useState(false);

  if (!tournament) {
    if (isLoading) {
      return (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm animate-pulse space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-700 font-bold text-sm">Đang tải thông tin giải đấu...</p>
        </div>
      );
    }
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <p className="text-slate-500 font-semibold mb-4">Không tìm thấy thông tin giải đấu.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const tournamentTeams = teams.filter((t) => t.tournamentId === tournament.id);
  const bracketRounds = getBracketByTournament(tournament.id);

  const handleMatchCardClick = (match) => {
    if (isAdmin) {
      setSelectedMatchForAdminScore(match);
    } else {
      setSelectedMatchForDetail(match);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Danh Sách Giải</span>
        </button>
      </div>

      {/* Hero Tournament Banner - Màu sắc sáng & hiện đại */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 border border-emerald-500/30 text-white">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src={tournament.banner}
            alt={tournament.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-emerald-900/30 to-transparent z-10" />

        <div className="relative z-20 p-6 md:p-10 flex flex-col justify-between min-h-[200px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-sm ${tournament.status === 'ONGOING'
                  ? 'bg-amber-400 text-slate-950 flex items-center gap-1 animate-pulse'
                  : tournament.status === 'UPCOMING'
                    ? 'bg-blue-400 text-slate-950 font-extrabold'
                    : 'bg-emerald-900 text-emerald-100'
                }`}
            >
              {tournament.status === 'ONGOING' && <Flame className="w-3.5 h-3.5" />}
              {tournament.status === 'ONGOING'
                ? 'Đang Khởi Tranh'
                : tournament.status === 'UPCOMING'
                  ? 'Sắp Diễn Ra'
                  : 'Đã Hoàn Tất'}
            </span>

            {getCategoryBadge(tournament.category)}

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-100 border border-emerald-300/40 backdrop-blur-md shadow-sm">
              {tournament.format === 'GROUP_KNOCKOUT'
                ? 'Vòng Bảng + Knockout'
                : tournament.format === 'ROUND_ROBIN'
                  ? 'Vòng Tròn Tính Điểm'
                  : 'Loại Trực Tiếp'}
            </span>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight drop-shadow-md text-white">
              {tournament.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-emerald-100/90 font-medium">
              <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1 rounded-full backdrop-blur-sm">
                <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                <span>
                  {formatDate(tournament.startDate)} ~ {formatDate(tournament.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1 rounded-full backdrop-blur-sm">
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                <span className="truncate max-w-xs">{tournament.location}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1 rounded-full backdrop-blur-sm">
                <Award className="w-3.5 h-3.5 text-emerald-300" />
                <span>
                  {tournament.maxSets} Set • 21 Điểm (Cap {tournament.maxPointsCap || 30})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector with horizontal scroll */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto custom-scrollbar pb-0.5">
        {hasGroupStage && (
          <button
            onClick={() => setActiveTab('GROUPS')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${activeTab === 'GROUPS'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <Layers className="w-4 h-4" />
            <span>Vòng Bảng (Group Stage)</span>
          </button>
        )}

        {hasKnockout && (
          <button
            onClick={() => setActiveTab('BRACKET')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${activeTab === 'BRACKET'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Sơ Đồ Nhánh Đấu (Knockout)</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('RULES')}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${activeTab === 'RULES'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Thể Thức & Luật Thi Đấu</span>
        </button>
      </div>

      {/* TAB CONTENT 1: GROUP STAGE VIEWER */}
      {activeTab === 'GROUPS' && hasGroupStage && (
        <GroupStageViewer
          tournament={tournament}
          onSelectMatch={handleMatchCardClick}
          isAdmin={isAdmin}
          onSwitchToBracket={() => setActiveTab('BRACKET')}
        />
      )}

      {/* TAB CONTENT 2: BRACKET TREE */}
      {activeTab === 'BRACKET' && hasKnockout && (
        <div className="space-y-4">
          <BracketViewer
            rounds={bracketRounds}
            onSelectMatch={handleMatchCardClick}
            isAdmin={isAdmin}
          />
        </div>
      )}

      {/* TAB CONTENT: RULES & FORMAT */}
      {activeTab === 'RULES' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Quy Định & Nội Quy Giải Đấu</h3>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              {tournament.rulesDescription || 'Áp dụng luật thi đấu Liên đoàn Cầu lông Thế giới (BWF).'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                Số Set Tối Đa
              </h4>
              <p className="text-2xl font-black text-emerald-950 font-mono">
                {tournament.maxSets || 3} Set
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                Điểm Thắng 1 Set
              </h4>
              <p className="text-2xl font-black text-emerald-950 font-mono">
                {tournament.pointsToWinSet || 21} Điểm
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                Điểm Chạm Kịch Trần
              </h4>
              <p className="text-2xl font-black text-emerald-950 font-mono">
                {tournament.maxPointsCap || 30} Điểm
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Details for Public View */}
      {selectedMatchForDetail && (
        <MatchDetailModal
          match={selectedMatchForDetail}
          onClose={() => setSelectedMatchForDetail(null)}
          onSwitchToAdmin={(match) => setSelectedMatchForAdminScore(match)}
        />
      )}

      {/* Modal Score Editor for Admin */}
      {selectedMatchForAdminScore && (
        <ScoreEditorModal
          match={selectedMatchForAdminScore}
          onClose={() => setSelectedMatchForAdminScore(null)}
        />
      )}

      {/* Modal Edit Tournament */}
      {isEditingTournament && (
        <TournamentModal
          tournament={tournament}
          onClose={() => setIsEditingTournament(false)}
        />
      )}

      {/* Modal Manage Teams */}
      {isManagingTeams && (
        <TeamManagerModal
          tournament={tournament}
          onClose={() => setIsManagingTeams(false)}
          onApplied={() => {
            setActiveTab('BRACKET');
          }}
        />
      )}
    </div>
  );
}
