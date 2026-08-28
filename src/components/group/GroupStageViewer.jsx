import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  Award,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';

import AdvanceKnockoutModal from './AdvanceKnockoutModal';

export default function GroupStageViewer({ tournament, onSelectMatch, isAdmin, onSwitchToBracket }) {
  const { teams, matches, getGroupStandings, advanceGroupWinnersToKnockout } = useTournament();

  const standings = getGroupStandings(tournament.id);
  const groupNames = Object.keys(standings).sort();

  const [activeGroup, setActiveGroup] = useState(() => groupNames[0] || 'Bảng A');
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);

  // Lọc các trận đấu thuộc bảng đang chọn
  const groupMatches = matches
    .filter((m) => m.tournamentId === tournament.id && m.stage === 'GROUP' && m.groupName === activeGroup)
    .sort((a, b) => a.matchOrder - b.matchOrder);

  // Số đội đi tiếp mỗi bảng
  const advancingCount = tournament.advancingPerGroup || 2;

  if (groupNames.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-700">Chưa có dữ liệu bảng đấu</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          {isAdmin
            ? 'Vui lòng vào tab Quản Trị -> Bốc thăm chia bảng để tạo lịch thi đấu vòng bảng cho các đội.'
            : 'Ban tổ chức đang chuẩn bị bốc thăm chia bảng thi đấu.'}
        </p>
      </div>
    );
  }

  const currentGroupStandings = standings[activeGroup] || [];

  return (
    <div className="space-y-6">
      {/* Group Navigation Tabs & Advance Button */}
      {tournament.groupCount !== 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 w-full overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Chọn Bảng:
            </span>
            {groupNames.map((gName) => {
              const isSelected = activeGroup === gName;
              return (
                <button
                  key={gName}
                  onClick={() => setActiveGroup(gName)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                >
                  <span>{gName}</span>
                  <span className="text-[10px] opacity-80 font-normal">
                    ({standings[gName]?.length || 0} đội)
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Advance Knockout Modal */}
      <AdvanceKnockoutModal
        tournament={tournament}
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        onApplied={() => {
          if (onSwitchToBracket) onSwitchToBracket();
        }}
      />

      {/* 2-COLUMN LAYOUT: Left = Standings Table, Right = Group Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT BÊN TRÁI: BẢNG XẾP HẠNG CHI TIẾT */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
                  Bảng Xếp Hạng • {activeGroup}
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                  <tr>
                    <th className="py-3 px-3 text-center w-10">Hạng</th>
                    <th className="py-3 px-4">Đội / Vận Động Viên</th>
                    <th className="py-3 px-2 text-center" title="Số trận đã đấu">Trận</th>
                    <th className="py-3 px-2 text-center text-emerald-700" title="Số trận thắng">Thắng</th>
                    <th className="py-3 px-2 text-center text-rose-600" title="Số trận thua">Thua</th>
                    <th className="py-3 px-3 text-center font-extrabold text-slate-800" title="Tổng điểm xếp hạng">Điểm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {currentGroupStandings.map((row) => {
                    const isAdvancing = row.rank <= advancingCount;
                    return (
                      <tr
                        key={row.team.id}
                        className={`hover:bg-slate-50/80 transition-colors ${isAdvancing ? 'bg-emerald-50/20' : ''
                          }`}
                      >
                        {/* Hạng Rank */}
                        <td className="py-3.5 px-3 text-center font-bold">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black ${row.rank === 1
                              ? 'bg-amber-400 text-white shadow-sm'
                              : row.rank === 2
                                ? 'bg-slate-300 text-slate-800'
                                : row.rank === 3
                                  ? 'bg-amber-700/80 text-white'
                                  : 'text-slate-400'
                              }`}
                          >
                            {row.rank}
                          </span>
                        </td>

                        {/* Tên Đội */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{row.team.avatar || '🏸'}</span>
                            <div className="min-w-0 flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-slate-900 truncate">
                                {row.team.name}
                              </p>
                              {row.team.isQualifiedKnockout && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  🏆 Vào Knockout
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Chỉ số thống kê */}
                        <td className="py-3.5 px-2 text-center font-mono font-semibold text-slate-600">
                          {row.played}
                        </td>
                        <td className="py-3.5 px-2 text-center font-mono font-bold text-emerald-700">
                          {row.won}
                        </td>
                        <td className="py-3.5 px-2 text-center font-mono text-slate-400">
                          {row.lost}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-black text-sm text-slate-900">
                          {row.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>* 1 Trận Thắng = 1 Điểm</span>
            </div>
          </div>
        </div>

        {/* CỘT BÊN PHẢI: CHI TIẾT CÁC TRẬN ĐẤU CỦA BẢNG */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
                  Lịch Thi Đấu & Tỷ Số • {activeGroup}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {groupMatches.length} trận đấu vòng tròn
                </p>
              </div>
            </div>

            {groupMatches.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                Chưa có trận đấu nào được tạo cho bảng này.
              </p>
            ) : (
              <div className="space-y-3">
                {groupMatches.map((m) => {
                  const isCompleted = m.status === 'COMPLETED';
                  const isInProgress = m.status === 'IN_PROGRESS';
                  const t1 = teams.find((t) => t.id === m.team1Id) || { name: 'Đang cập nhật...', avatar: '🏸' };
                  const t2 = teams.find((t) => t.id === m.team2Id) || { name: 'Đang cập nhật...', avatar: '🏸' };

                  const t1Won = isCompleted && m.winnerId === m.team1Id;
                  const t2Won = isCompleted && m.winnerId === m.team2Id;

                  return (
                    <div
                      key={m.id}
                      onClick={() => onSelectMatch(m)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${isInProgress
                        ? 'border-amber-400 bg-amber-50/20 ring-2 ring-amber-400/20'
                        : isCompleted
                          ? 'border-slate-200 bg-white hover:border-emerald-500'
                          : 'border-slate-200/90 bg-white hover:border-slate-400'
                        }`}
                    >
                      {/* Match Header */}
                      <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-100 text-slate-500 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">{m.roundName}</span>
                        </div>

                        <div>
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                              <CheckCircle2 className="w-3 h-3" />
                              Đã Xong
                            </span>
                          ) : isInProgress ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full animate-pulse">
                              <Flame className="w-3 h-3" />
                              Đang diễn ra
                            </span>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>

                      {/* Team 1 Row */}
                      <div
                        className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-colors ${t1Won
                          ? 'bg-emerald-50/80 text-emerald-950 font-bold'
                          : isCompleted && !t1Won
                            ? 'text-slate-400'
                            : 'text-slate-800'
                          }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="text-sm shrink-0">{t1.avatar || '🏸'}</span>
                          <span className="text-xs font-bold truncate">
                            {t1.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-xs shrink-0">
                          {m.setScores?.map((s, idx) => (
                            <span
                              key={idx}
                              className={`w-6 text-center py-0.5 rounded font-bold ${s.team1Score > s.team2Score
                                ? 'text-emerald-700 bg-emerald-100/70 font-black'
                                : isCompleted
                                  ? 'text-slate-400 bg-slate-100'
                                  : 'text-slate-600 bg-slate-100'
                                }`}
                            >
                              {s.team1Score}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Team 2 Row */}
                      <div
                        className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-colors mt-1 ${t2Won
                          ? 'bg-emerald-50/80 text-emerald-950 font-bold'
                          : isCompleted && !t2Won
                            ? 'text-slate-400'
                            : 'text-slate-800'
                          }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="text-sm shrink-0">{t2.avatar || '🏸'}</span>
                          <span className="text-xs font-bold truncate">
                            {t2.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-xs shrink-0">
                          {m.setScores?.map((s, idx) => (
                            <span
                              key={idx}
                              className={`w-6 text-center py-0.5 rounded font-bold ${s.team2Score > s.team1Score
                                ? 'text-emerald-700 bg-emerald-100/70 font-black'
                                : isCompleted
                                  ? 'text-slate-400 bg-slate-100'
                                  : 'text-slate-600 bg-slate-100'
                                }`}
                            >
                              {s.team2Score}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
