import React from 'react';
import { createPortal } from 'react-dom';
import { useTournament } from '../../context/TournamentContext';
import { usePreventBodyScroll } from '../../hooks/usePreventBodyScroll';
import { Shield, X, Video, ExternalLink, SquarePlay } from 'lucide-react';

export default function MatchDetailModal({ match, onClose, onSwitchToAdmin }) {
  usePreventBodyScroll(!!match);
  const { teams = [], isAdmin } = useTournament();

  if (!match) return null;

  const t1Id = match.team1Id || match.team1_id;
  const t2Id = match.team2Id || match.team2_id;

  const team1 = match.team1 || teams.find((t) => String(t.id) === String(t1Id));
  const team2 = match.team2 || teams.find((t) => String(t.id) === String(t2Id));

  const team1Name = team1?.name || (t1Id ? `VĐV #${String(t1Id).slice(0, 6)}` : 'Chờ xác định');
  const team2Name = team2?.name || (t2Id ? `VĐV #${String(t2Id).slice(0, 6)}` : 'Chờ xác định');

  const isCompleted = match.status === 'COMPLETED';

  const team1IsWinner = isCompleted && String(match.winnerId || match.winner_id) === String(t1Id);
  const team2IsWinner = isCompleted && String(match.winnerId || match.winner_id) === String(t2Id);

  // Tính tổng số set thắng của mỗi đội
  let team1Wins = 0;
  let team2Wins = 0;
  const sets = match.setScores && match.setScores.length > 0 ? match.setScores : [];

  sets.forEach((s) => {
    const s1 = Number(s.team1Score) || 0;
    const s2 = Number(s.team2Score) || 0;
    if (s1 > s2 && (s1 >= 21 || s.winnerTeamId === t1Id)) team1Wins++;
    else if (s2 > s1 && (s2 >= 21 || s.winnerTeamId === t2Id)) team2Wins++;
  });

  // Lọc các set hiển thị: nếu trận đấu đã kết thúc thì chỉ hiển thị các set thực tế đã đấu
  let displaySets = sets;
  if (isCompleted) {
    const playedSets = sets.filter(
      (s) => Number(s.team1Score) > 0 || Number(s.team2Score) > 0
    );
    if (playedSets.length > 0) {
      displaySets = playedSets;
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[99999] w-screen h-[100dvh] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-hidden">
      {/* Click outside to close backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[82dvh] sm:max-h-[88dvh] flex flex-col">
        {/* Sticky Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm sm:text-base font-bold">Chi Tiết Trận Đấu</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-5 overflow-y-auto flex-1 overscroll-contain">
          {/* Unified Scoreboard Card */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 sm:p-5 shadow-xs">
            {/* Round Badge at top of card */}
            <div className="flex items-center justify-center mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-emerald-800 text-xs font-extrabold rounded-full border border-slate-200 shadow-2xs">
                {match.roundName || `Vòng ${match.roundNumber || 1}`}
              </span>
            </div>

            {/* Teams Header - Responsive Flex Layout */}
            <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-slate-200/60">
              {/* Team 1 Info */}
              <div className="flex-1 min-w-0 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Đội 1</span>
                <h4
                  className={`text-xs sm:text-sm font-bold leading-snug mt-0.5 break-words ${
                    team1IsWinner ? 'text-emerald-700 font-extrabold' : 'text-slate-900'
                  }`}
                  title={team1Name}
                >
                  {team1Name}
                </h4>
                {team1IsWinner && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full whitespace-nowrap shadow-2xs">
                    Thắng Cuộc 🏆
                  </span>
                )}
              </div>

              {/* Match Score or VS in center */}
              <div className="shrink-0 px-2 sm:px-3 flex flex-col items-center justify-center">
                {isCompleted ? (
                  <div className="flex flex-col items-center bg-white border border-slate-200/80 px-2.5 sm:px-3.5 py-1 rounded-xl shadow-2xs">
                    <span className="text-base sm:text-xl font-black font-mono text-slate-800 whitespace-nowrap tracking-wider">
                      {team1Wins} - {team2Wins}
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Set</span>
                  </div>
                ) : (
                  <span className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 font-black text-[10px] flex items-center justify-center shadow-xs">
                    VS
                  </span>
                )}
              </div>

              {/* Team 2 Info */}
              <div className="flex-1 min-w-0 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Đội 2</span>
                <h4
                  className={`text-xs sm:text-sm font-bold leading-snug mt-0.5 break-words ${
                    team2IsWinner ? 'text-emerald-700 font-extrabold' : 'text-slate-900'
                  }`}
                  title={team2Name}
                >
                  {team2Name}
                </h4>
                {team2IsWinner && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full whitespace-nowrap shadow-2xs">
                    Thắng Cuộc 🏆
                  </span>
                )}
              </div>
            </div>

            {/* Set Scores List */}
            <div className="pt-3.5 space-y-3">
              {displaySets.length > 0 ? (
                displaySets.map((set) => {
                  const s1 = Number(set.team1Score) || 0;
                  const s2 = Number(set.team2Score) || 0;
                  const s1Won = s1 > s2 && (s1 >= 21 || set.winnerTeamId === t1Id);
                  const s2Won = s2 > s1 && (s2 >= 21 || set.winnerTeamId === t2Id);

                  return (
                    <div
                      key={set.setNumber}
                      className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Team 1 Score Box */}
                        <div className="flex-1 flex justify-center">
                          <div
                            className={`w-14 sm:w-16 h-10 sm:h-11 flex items-center justify-center text-base sm:text-lg font-black font-mono rounded-xl border shadow-xs ${
                              s1Won
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-black'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            {s1}
                          </div>
                        </div>

                        {/* Set Info in Center */}
                        <div className="shrink-0 flex flex-col items-center justify-center px-2">
                          <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                            Set {set.setNumber}
                          </span>
                          <span className="text-slate-300 font-bold text-xs">:</span>
                        </div>

                        {/* Team 2 Score Box */}
                        <div className="flex-1 flex justify-center">
                          <div
                            className={`w-14 sm:w-16 h-10 sm:h-11 flex items-center justify-center text-base sm:text-lg font-black font-mono rounded-xl border shadow-xs ${
                              s2Won
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-black'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            {s2}
                          </div>
                        </div>
                      </div>

                      {/* Video Link Button if attached */}
                      {(set.videoUrl || set.video_url) && (
                        <div className="pt-2 border-t border-slate-100 flex justify-center">
                          <a
                            href={set.videoUrl || set.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200/80 rounded-xl text-xs font-bold transition-all shadow-2xs group"
                          >
                            <Video className="w-3.5 h-3.5 text-red-600 group-hover:scale-110 transition-transform" />
                            <span>Theo dõi SET {set.setNumber}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-100">
                  Trận đấu chưa có tỷ số.
                </div>
              )}
            </div>

            {/* Match level Video Link (nếu có) */}
            {match.videoUrl && (
              <div className="flex justify-center pt-2">
                <a
                  href={match.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <Video className="w-4 h-4" />
                  <span>Xem Toàn Bộ Trận Đấu</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Dedicated Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200/70 flex items-center justify-between shrink-0 shadow-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Đóng
          </button>

          {isAdmin && onSwitchToAdmin && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToAdmin(match);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              Cập Nhật Tỷ Số (Admin)
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
