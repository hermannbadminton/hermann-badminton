import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  Calendar,
  CheckCircle2,
  Flame,
  Clock,
  MapPin,
  Edit3,
  Eye,
  Trophy,
} from 'lucide-react';

// Hàm định dạng ngày giờ thi đấu hiển thị đầy đủ ngày/tháng/năm và giờ:phút
const formatMatchSchedule = (scheduledTimeStr) => {
  if (!scheduledTimeStr || !String(scheduledTimeStr).trim()) {
    return {
      dateText: '',
      timeText: '',
      hasSchedule: false,
    };
  }

  try {
    let d = new Date(scheduledTimeStr);

    // Hỗ trợ nếu chuỗi lưu dạng DD/MM/YYYY HH:mm
    if (isNaN(d.getTime()) && scheduledTimeStr.includes('/')) {
      const parts = scheduledTimeStr.split(' ');
      const dateParts = parts[0].split('/');
      if (dateParts.length === 3) {
        d = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${parts[1] || '00:00'}`);
      }
    }

    if (!isNaN(d.getTime())) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const matchDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const diffDays = Math.round((matchDay - today) / (1000 * 60 * 60 * 24));

      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();

      let dateText = `${day}/${month}/${year}`;
      if (diffDays === 0) dateText = `Hôm Nay (${day}/${month})`;
      else if (diffDays === 1) dateText = `Ngày Mai (${day}/${month})`;
      else if (diffDays === -1) dateText = `Hôm Qua (${day}/${month})`;

      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const timeText = `${hours}:${minutes}`;

      return { dateText, timeText, hasSchedule: true };
    }
  } catch (e) {
    // fallback
  }

  if (scheduledTimeStr.includes('T') || scheduledTimeStr.includes(' ')) {
    const clean = scheduledTimeStr.replace('T', ' ');
    const parts = clean.split(' ');
    return {
      dateText: parts[0] || '',
      timeText: parts[1] ? parts[1].slice(0, 5) : '',
      hasSchedule: Boolean(parts[0]),
    };
  }

  return {
    dateText: scheduledTimeStr,
    timeText: '',
    hasSchedule: true,
  };
};

export default function GroupScheduleTab({
  tournament,
  onSelectMatch,
  isAdmin,
}) {
  const { teams, matches, getGroupStandings } = useTournament();

  const standings = getGroupStandings(tournament.id);
  const groupNames = Object.keys(standings).sort();

  // Lọc tất cả các trận đấu vòng bảng của giải đấu
  const allGroupMatches = matches
    .filter((m) => m.tournamentId === tournament.id && m.stage === 'GROUP')
    .sort((a, b) => a.matchOrder - b.matchOrder);

  if (allGroupMatches.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-700">Chưa có lịch thi đấu vòng bảng</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          {isAdmin
            ? 'Vui lòng vào tab Quản Trị -> Bốc thăm chia bảng để tự động tạo lịch thi đấu.'
            : 'Ban tổ chức đang chuẩn bị sắp xếp lịch thi đấu vòng bảng.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* DANH SÁCH CÁC BẢNG TỪ A ĐẾN HẾT */}
      <div className="space-y-8">
        {groupNames.map((gName) => {
          const groupMatches = allGroupMatches.filter((m) => m.groupName === gName);
          const totalThisGroup = groupMatches.length;
          const completedThisGroup = groupMatches.filter((m) => m.status === 'COMPLETED').length;

          return (
            <div key={gName} className="space-y-3">
              {/* Section Header Bảng */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    {gName}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {completedThisGroup}/{totalThisGroup} trận hoàn tất
                    </span>
                  </h3>
                </div>
              </div>

              {/* Grid 2 Cột Trận Đấu */}
              {groupMatches.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center text-slate-400 text-xs">
                  Chưa có trận đấu nào trong {gName}.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {groupMatches.map((m) => {
                    const isCompleted = m.status === 'COMPLETED';
                    const isInProgress = m.status === 'IN_PROGRESS';
                    const t1 = teams.find((t) => t.id === m.team1Id) || {
                      name: 'Đang cập nhật...',
                      avatar: '🏸',
                    };
                    const t2 = teams.find((t) => t.id === m.team2Id) || {
                      name: 'Đang cập nhật...',
                      avatar: '🏸',
                    };

                    const t1Won = isCompleted && m.winnerId === m.team1Id;
                    const t2Won = isCompleted && m.winnerId === m.team2Id;

                    // Đếm số set thắng
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

                    // Xác định danh sách các set hiển thị
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
                        className={`group bg-white rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md overflow-hidden flex flex-col ${isInProgress
                          ? 'border-amber-400 bg-white ring-2 ring-amber-400/30'
                          : isCompleted
                            ? 'border-slate-200 hover:border-emerald-500'
                            : 'border-slate-200 hover:border-slate-400'
                          }`}
                      >
                        {/* ================= PHẦN TRÊN: THỜI GIAN THI ĐẤU & SÂN & TRẠNG THÁI ================= */}
                        <div className="px-3.5 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-xs gap-2 flex-wrap">
                          {/* Bên trái: Trận #, Sân, Ngày & Giờ */}
                          <div className="flex items-center gap-2 flex-wrap">

                            {/* Badge Sân Thi Đấu */}
                            {m.court && (
                              <span className="inline-flex items-center gap-1 text-[12px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200/70">
                                <MapPin className="w-3 h-3 text-emerald-600" />
                                {m.court}
                              </span>
                            )}


                          </div>

                          {/* Bên phải: Trạng thái trận đấu */}
                          <div className="shrink-0">
                            {/* Thời gian thi đấu */}
                            {sched.hasSchedule ? (
                              <div className="flex items-center gap-1.5 text-slate-500 text-[12px] font-medium">
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
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                Chưa có thời gian thi đấu
                              </span>
                            )}
                          </div>
                        </div>

                        {/* ================= PHẦN GIỮA: 2 ĐỘI & ĐIỂM TỪNG SET THIẾT KẾ MỚI ================= */}
                        <div className="p-3 sm:p-3.5 space-y-2 flex-1">
                          {/* Label Header cho các cột Điểm Set */}
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

                          {/* Hàng Đội 1 */}
                          <div
                            className={`flex items-center justify-between p-2 sm:px-3 rounded-xl transition-colors ${t1Won
                              ? 'bg-emerald-50/90 text-emerald-950 font-bold border border-emerald-200/70 shadow-2xs'
                              : isCompleted && !t1Won
                                ? 'text-slate-400 bg-slate-50/50'
                                : 'text-slate-800 bg-slate-50/40 hover:bg-slate-50'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2 flex-1">
                              <img
                                src={'https://img.bwfbadminton.com/image/upload/v2/assets/flag-circle-svg-custom/VIE.png'}
                                alt="flag"
                                className="w-5 h-5 rounded-full object-cover shrink-0 shadow-2xs border border-slate-200/60"
                              />
                              <p
                                className={`text-xs sm:text-sm truncate ${t1Won
                                  ? 'font-black text-emerald-950'
                                  : isCompleted && !t1Won
                                    ? 'font-medium text-slate-400'
                                    : 'font-bold text-slate-900'
                                  }`}
                              >
                                {t1.name}
                              </p>
                            </div>

                            {/* Các ô điểm từng Set của Đội 1 */}
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
                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${isSetWin
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

                          {/* Hàng Đội 2 */}
                          <div
                            className={`flex items-center justify-between p-2 sm:px-3 rounded-xl transition-colors ${t2Won
                              ? 'bg-emerald-50/90 text-emerald-950 font-bold border border-emerald-200/70 shadow-2xs'
                              : isCompleted && !t2Won
                                ? 'text-slate-400 bg-slate-50/50'
                                : 'text-slate-800 bg-slate-50/40 hover:bg-slate-50'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2 flex-1">
                              <img
                                src={'https://img.bwfbadminton.com/image/upload/v2/assets/flag-circle-svg-custom/VIE.png'}
                                alt="flag"
                                className="w-5 h-5 rounded-full object-cover shrink-0 shadow-2xs border border-slate-200/60"
                              />
                              <p
                                className={`text-xs sm:text-sm truncate ${t2Won
                                  ? 'font-black text-emerald-950'
                                  : isCompleted && !t2Won
                                    ? 'font-medium text-slate-400'
                                    : 'font-bold text-slate-900'
                                  }`}
                              >
                                {t2.name}
                              </p>
                            </div>

                            {/* Các ô điểm từng Set của Đội 2 */}
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
                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${isSetWin
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

