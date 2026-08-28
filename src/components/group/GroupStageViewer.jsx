import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  Edit3,
  Eye,
  Award,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';

import AdvanceKnockoutModal from './AdvanceKnockoutModal';

const formatMatchSchedule = (scheduledTimeStr) => {
  if (!scheduledTimeStr || !String(scheduledTimeStr).trim()) {
    return { dateText: '', timeText: '', hasSchedule: false };
  }
  try {
    let d = new Date(scheduledTimeStr);
    if (isNaN(d.getTime()) && scheduledTimeStr.includes('/')) {
      const parts = scheduledTimeStr.split(' ');
      const dateParts = parts[0].split('/');
      if (dateParts.length === 3) {
        d = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${parts[1] || '00:00'}`);
      }
    }
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return { dateText: `${day}/${month}/${year}`, timeText: `${hours}:${minutes}`, hasSchedule: true };
    }
  } catch (e) {}
  return { dateText: scheduledTimeStr, timeText: '', hasSchedule: true };
};

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

                  let t1SetsWon = 0;
                  let t2SetsWon = 0;
                  const hasScores = m.setScores && m.setScores.length > 0;
                  const isPlayedOrScored =
                    isCompleted ||
                    isInProgress ||
                    (hasScores && m.setScores.some((s) => Number(s.team1Score) > 0 || Number(s.team2Score) > 0));

                  if (hasScores) {
                    m.setScores.forEach((s) => {
                      if (Number(s.team1Score) > Number(s.team2Score)) t1SetsWon++;
                      else if (Number(s.team2Score) > Number(s.team1Score)) t2SetsWon++;
                    });
                  }

                  let displaySets = m.setScores || [];
                  if (isCompleted) {
                    const playedSets = displaySets.filter(
                      (s) => Number(s.team1Score) > 0 || Number(s.team2Score) > 0
                    );
                    if (playedSets.length > 0) displaySets = playedSets;
                  }
                  if (displaySets.length === 0) {
                    displaySets = [
                      { setNumber: 1, team1Score: 0, team2Score: 0 },
                      { setNumber: 2, team1Score: 0, team2Score: 0 },
                      { setNumber: 3, team1Score: 0, team2Score: 0 },
                    ];
                  }

                  const sched = formatMatchSchedule(m.scheduledTime || m.scheduled_time);

                  return (
                    <div
                      key={m.id}
                      onClick={() => onSelectMatch(m)}
                      className={`group rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md overflow-hidden bg-white ${
                        isInProgress
                          ? 'border-amber-400 ring-2 ring-amber-400/30'
                          : isCompleted
                          ? 'border-slate-200 hover:border-emerald-500'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {/* Match Top Bar: Court, Time, Status */}
                      <div className="px-3.5 py-2 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-xs gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-700 text-xs">
                            {m.roundName || `Trận #${m.matchOrder}`}
                          </span>

                          {m.court && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200/70">
                              <MapPin className="w-3 h-3 text-emerald-600" />
                              {m.court}
                            </span>
                          )}

                          {sched.hasSchedule && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                              {sched.dateText && (
                                <span className="inline-flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  {sched.dateText}
                                </span>
                              )}
                              {sched.timeText && (
                                <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-200/60 px-1.5 py-0.2 rounded">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  {sched.timeText}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Đã xong
                            </span>
                          ) : isInProgress ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse shadow-xs">
                              <Flame className="w-3 h-3" />
                              LIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                              Chưa đấu
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Teams & Scores */}
                      <div className="p-3 sm:p-3.5 space-y-2">
                        {/* Header for set scores */}
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                          <span>Đội thi đấu</span>
                          <div className="flex items-center gap-1.5 text-center">
                            {displaySets.map((_, idx) => (
                              <span key={idx} className="w-7 sm:w-8">
                                S{idx + 1}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Team 1 */}
                        <div
                          className={`flex items-center justify-between p-2 sm:px-3 rounded-xl transition-colors ${
                            t1Won
                              ? 'bg-emerald-50/90 text-emerald-950 font-bold border border-emerald-200/70'
                              : isCompleted && !t1Won
                              ? 'text-slate-400 bg-slate-50/50'
                              : 'text-slate-800 bg-slate-50/40 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2 flex-1">
                            <img
                              src={
                                t1.avatar && t1.avatar.startsWith('http')
                                  ? t1.avatar
                                  : 'https://img.bwfbadminton.com/image/upload/v2/assets/flag-circle-svg-custom/VIE.png'
                              }
                              alt="flag"
                              className="w-5 h-5 rounded-full object-cover shrink-0 shadow-2xs border border-slate-200/60"
                            />
                            <p
                              className={`text-xs sm:text-sm truncate ${
                                t1Won
                                  ? 'font-black text-emerald-950'
                                  : isCompleted && !t1Won
                                  ? 'font-medium text-slate-400'
                                  : 'font-bold text-slate-900'
                              }`}
                            >
                              {t1.name}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 font-mono">
                            {displaySets.map((s, idx) => {
                              const hasScore =
                                isPlayedOrScored &&
                                (Number(s.team1Score) > 0 || Number(s.team2Score) > 0);
                              const isSetWin =
                                hasScore && Number(s.team1Score) > Number(s.team2Score);

                              return (
                                <span
                                  key={idx}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                                    isSetWin
                                      ? 'bg-emerald-600 text-white font-black shadow-2xs'
                                      : hasScore
                                      ? 'bg-white border border-slate-200 text-slate-700'
                                      : 'bg-slate-100/70 text-slate-300 border border-slate-200/50'
                                  }`}
                                >
                                  {hasScore ? s.team1Score : '-'}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Team 2 */}
                        <div
                          className={`flex items-center justify-between p-2 sm:px-3 rounded-xl transition-colors ${
                            t2Won
                              ? 'bg-emerald-50/90 text-emerald-950 font-bold border border-emerald-200/70'
                              : isCompleted && !t2Won
                              ? 'text-slate-400 bg-slate-50/50'
                              : 'text-slate-800 bg-slate-50/40 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2 flex-1">
                            <img
                              src={
                                t2.avatar && t2.avatar.startsWith('http')
                                  ? t2.avatar
                                  : 'https://img.bwfbadminton.com/image/upload/v2/assets/flag-circle-svg-custom/VIE.png'
                              }
                              alt="flag"
                              className="w-5 h-5 rounded-full object-cover shrink-0 shadow-2xs border border-slate-200/60"
                            />
                            <p
                              className={`text-xs sm:text-sm truncate ${
                                t2Won
                                  ? 'font-black text-emerald-950'
                                  : isCompleted && !t2Won
                                  ? 'font-medium text-slate-400'
                                  : 'font-bold text-slate-900'
                              }`}
                            >
                              {t2.name}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 font-mono">
                            {displaySets.map((s, idx) => {
                              const hasScore =
                                isPlayedOrScored &&
                                (Number(s.team1Score) > 0 || Number(s.team2Score) > 0);
                              const isSetWin =
                                hasScore && Number(s.team2Score) > Number(s.team1Score);

                              return (
                                <span
                                  key={idx}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                                    isSetWin
                                      ? 'bg-emerald-600 text-white font-black shadow-2xs'
                                      : hasScore
                                      ? 'bg-white border border-slate-200 text-slate-700'
                                      : 'bg-slate-100/70 text-slate-300 border border-slate-200/50'
                                  }`}
                                >
                                  {hasScore ? s.team2Score : '-'}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Footer Hover */}
                      <div className="px-3.5 py-1.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-emerald-700 transition-colors">
                        <span>{isAdmin ? 'Click để chấm điểm / sửa lịch' : 'Click để xem chi tiết'}</span>
                        {isAdmin ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
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
