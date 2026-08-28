import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import TournamentModal from '../components/admin/TournamentModal';
import TeamManagerModal from '../components/admin/TeamManagerModal';
import ScoreEditorModal from '../components/admin/ScoreEditorModal';
import {
  Trophy,
  Users,
  Shield,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  ExternalLink,
  Flame,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboardPage({ onSelectTournament }) {
  const { tournaments, deleteTournament, teams, matches } = useTournament();

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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-xs tracking-wide">
          🏸 {category}
        </span>
      );
    }
    if (cat.includes('nam nữ') || cat.includes('hỗn hợp')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xs tracking-wide">
          🏸 {category}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs tracking-wide">
        🏸 {category || 'Đôi Nam'}
      </span>
    );
  };

  const [isCreatingTournament, setIsCreatingTournament] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [managingTeamsTournament, setManagingTeamsTournament] = useState(null);
  const [scoringMatch, setScoringMatch] = useState(null);

  // Quick stats
  const totalTournaments = tournaments.length;
  const ongoingTournaments = tournaments.filter((t) => t.status === 'ONGOING').length;
  const totalTeams = teams.length;
  const inProgressMatches = matches.filter((m) => m.status === 'IN_PROGRESS');

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner - Giao diện sáng & hiện đại */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
            <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
            Hermann Badminton Admin
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Quản Lý Giải Đấu & Nhánh Thi Đấu
          </h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-slate-500 mt-1 max-w-xl">
            Tạo mới giải đấu, thiết lập luật CLB, bốc thăm phân nhánh và cập nhật kết quả tự động.
          </p>
        </div>
      </div>

      {/* Tournaments Management Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm sm:text-base font-bold text-slate-800">
            Danh Sách Giải Đấu ({tournaments.length})
          </h3>

          <button
            onClick={() => setIsCreatingTournament(true)}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Giải Đấu Mới</span>
          </button>
        </div>

        {/* 1. MOBILE VIEW: Responsive Card List (Visible on mobile/tablet) */}
        <div className="block lg:hidden divide-y divide-slate-100">
          {tournaments.map((t) => {
            const count = teams.filter((team) => team.tournamentId === t.id).length;
            return (
              <div key={t.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                {/* Header: Title & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {t.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {getCategoryBadge(t.category)}
                      <span className="text-[11px] text-emerald-700 font-bold">
                        {count} đội tham gia
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${t.status === 'ONGOING'
                        ? 'bg-amber-100 text-amber-800'
                        : t.status === 'UPCOMING'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                  >
                    {t.status === 'ONGOING'
                      ? 'Đang Đấu'
                      : t.status === 'UPCOMING'
                        ? 'Sắp Đấu'
                        : 'Đã Xong'}
                  </span>
                </div>

                {/* Details info */}
                <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{formatDate(t.startDate)} ~ {formatDate(t.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{t.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-slate-700 font-semibold">
                    <Trophy className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{t.maxSets} Set • Chạm {t.pointsToWinSet} (Cap {t.maxPointsCap})</span>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 flex-1">
                    <button
                      onClick={() => setManagingTeamsTournament(t)}
                      className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Đội ({count})</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingTournament(t)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      title="Sửa thông tin giải"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc chắn muốn xóa giải đấu "${t.name}" không?`)) {
                          deleteTournament(t.id);
                        }
                      }}
                      className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                      title="Xóa giải đấu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. DESKTOP VIEW: Full Data Table (Visible on large screens) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="px-6 py-3.5">Tên Giải Đấu</th>
                <th className="px-6 py-3.5">Nội Dung</th>
                <th className="px-6 py-3.5">Thời Gian & Địa Điểm</th>
                <th className="px-6 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {tournaments.map((t) => {
                const count = teams.filter((team) => team.tournamentId === t.id).length;
                return (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        {count} đội đã đăng ký
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="font-semibold">{formatDate(t.startDate)} ~ {formatDate(t.endDate)}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{t.location}</div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => onSelectTournament(t.id)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                        title="Xem nhánh đấu"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Nhánh Đấu
                      </button>
                      <button
                        onClick={() => setManagingTeamsTournament(t)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                        title="Quản lý đội & bốc thăm"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Đội ({count})
                      </button>
                      <button
                        onClick={() => setEditingTournament(t)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Sửa thông tin giải"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa giải đấu "${t.name}" không?`)) {
                            deleteTournament(t.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa giải đấu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isCreatingTournament && (
        <TournamentModal onClose={() => setIsCreatingTournament(false)} />
      )}

      {editingTournament && (
        <TournamentModal
          tournament={editingTournament}
          onClose={() => setEditingTournament(null)}
        />
      )}

      {managingTeamsTournament && (
        <TeamManagerModal
          tournament={managingTeamsTournament}
          onClose={() => setManagingTeamsTournament(null)}
        />
      )}

      {scoringMatch && (
        <ScoreEditorModal
          match={scoringMatch}
          onClose={() => setScoringMatch(null)}
        />
      )}
    </div>
  );
}
