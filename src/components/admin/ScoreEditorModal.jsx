import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTournament } from '../../context/TournamentContext';
import { usePreventBodyScroll } from '../../hooks/usePreventBodyScroll';
import { Trophy, Shield, CheckCircle2, AlertCircle, X, Calendar, Clock, MapPin, Video } from 'lucide-react';

export default function ScoreEditorModal({ match, onClose }) {
  usePreventBodyScroll(true);

  const { updateMatchScore, tournaments, teams = [] } = useTournament();

  const tournament = tournaments.find((t) => String(t.id) === String(match.tournamentId)) || {
    maxSets: 1,
    pointsToWinSet: 21,
    maxPointsCap: 30,
  };

  const initialSets = () => {
    if (match.setScores && match.setScores.length > 0) {
      return match.setScores.map((s) => ({
        setNumber: s.setNumber,
        team1Score: Number(s.team1Score) || 0,
        team2Score: Number(s.team2Score) || 0,
        videoUrl: s.videoUrl || s.video_url || '',
      }));
    }
    const count = Number(tournament?.maxSets ?? tournament?.max_sets ?? 1);
    const sets = [];
    for (let i = 1; i <= Math.max(1, count); i++) {
      sets.push({ setNumber: i, team1Score: 0, team2Score: 0, videoUrl: '' });
    }
    return sets;
  };

  const getInitialScheduledTime = () => {
    const raw = match.scheduledTime || match.scheduled_time || '';
    if (!raw) return '';
    const formatted = raw.replace(' ', 'T');
    if (formatted.length >= 16) {
      return formatted.slice(0, 16);
    }
    return raw;
  };

  const [sets, setSets] = useState(initialSets);
  const [scheduledTime, setScheduledTime] = useState(getInitialScheduledTime);
  const [court, setCourt] = useState(() => match.court || 'Sân 1');
  const [errorMsg, setErrorMsg] = useState('');

  const t1Id = match.team1Id || match.team1_id;
  const t2Id = match.team2Id || match.team2_id;
  const team1 = match.team1 || teams.find((t) => String(t.id) === String(t1Id));
  const team2 = match.team2 || teams.find((t) => String(t.id) === String(t2Id));

  const team1Name = team1?.name || (t1Id ? `VĐV #${String(t1Id).slice(0, 6)}` : 'Chờ xác định');
  const team2Name = team2?.name || (t2Id ? `VĐV #${String(t2Id).slice(0, 6)}` : 'Chờ xác định');

  const handleScoreChange = (index, team, val) => {
    const parsed = Math.max(0, Math.min(tournament.maxPointsCap || 30, Number(val) || 0));
    const newSets = [...sets];
    newSets[index][team] = parsed;
    setSets(newSets);
  };

  const handleVideoUrlChange = (index, val) => {
    const newSets = [...sets];
    newSets[index].videoUrl = val;
    setSets(newSets);
  };

  // Preview real-time winner determination
  const setsToWin = Math.ceil(tournament.maxSets / 2);
  let t1SetWins = 0;
  let t2SetWins = 0;

  sets.forEach((s) => {
    const s1 = s.team1Score;
    const s2 = s.team2Score;
    const ptWin = tournament.pointsToWinSet || 21;
    const ptCap = tournament.maxPointsCap || 30;

    if (s1 >= ptCap || (s1 >= ptWin && s1 - s2 >= 2)) t1SetWins++;
    else if (s2 >= ptCap || (s2 >= ptWin && s2 - s1 >= 2)) t2SetWins++;
  });

  const liveWinner = t1SetWins >= setsToWin ? team1Name : t2SetWins >= setsToWin ? team2Name : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!t1Id || !t2Id) {
      setErrorMsg('Không thể cập nhật tỷ số khi trận đấu chưa đủ 2 đội tham gia.');
      return;
    }

    // Chuẩn hóa lưu dạng chuỗi string đầy đủ ngày tháng năm và thời gian (ví dụ: '2026-08-28T14:30:00')
    let fullTimeString = scheduledTime ? String(scheduledTime).trim() : '';
    if (fullTimeString && fullTimeString.length === 16 && fullTimeString.includes('T')) {
      fullTimeString = `${fullTimeString}:00`;
    }

    updateMatchScore(match.id, sets, { scheduledTime: fullTimeString, court });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] w-screen h-[100dvh] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-hidden">
      {/* Click outside to close backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[82dvh] sm:max-h-[88dvh] flex flex-col">
        {/* Sticky Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm sm:text-base font-bold">Cập Nhật Thời Gian & Tỷ Số</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form - Scrollable */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1 overscroll-contain">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section: Thời Gian & Sân Thi Đấu */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Thời Gian & Địa Điểm Thi Đấu</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Scheduled Time */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                  Thời gian (Ngày & Giờ)
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Court */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                  Sân thi đấu
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Sân 1, Sân 2..."
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Unified Scoreboard Card */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 shadow-xs">
            {/* Round Badge at top */}
            <div className="flex items-center justify-center mb-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-emerald-800 text-xs font-extrabold rounded-full border border-slate-200 shadow-2xs">
                {match.roundName || `Vòng ${match.roundNumber}`}
              </span>
            </div>

            {/* Teams Header - Responsive Flex Layout */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-200/60">
              {/* Team 1 Info */}
              <div className="flex-1 min-w-0 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Đội 1</span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug mt-0.5 break-words" title={team1Name}>
                  {team1Name}
                </h4>
              </div>

              {/* VS Divider */}
              <div className="shrink-0 px-2 sm:px-3 flex flex-col items-center justify-center">
                <span className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 font-black text-[10px] flex items-center justify-center shadow-xs">
                  VS
                </span>
              </div>

              {/* Team 2 Info */}
              <div className="flex-1 min-w-0 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Đội 2</span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug mt-0.5 break-words" title={team2Name}>
                  {team2Name}
                </h4>
              </div>
            </div>

            {/* Set Score Input Rows */}
            <div className="pt-4 space-y-3.5">
              {sets.map((set, idx) => (
                <div key={set.setNumber} className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
                  {/* Score Inputs */}
                  <div className="flex items-center justify-between gap-3">
                    {/* Team 1 Score Input */}
                    <div className="flex-1 flex justify-center">
                      <input
                        type="number"
                        min="0"
                        max={tournament.maxPointsCap || 30}
                        value={set.team1Score}
                        onChange={(e) => handleScoreChange(idx, 'team1Score', e.target.value)}
                        className="w-16 h-11 text-center text-xl font-black font-mono bg-slate-50/80 border-2 border-slate-200 hover:border-emerald-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 rounded-xl transition-all shadow-2xs text-slate-900"
                      />
                    </div>

                    {/* Set Badge in Center */}
                    <div className="shrink-0 flex flex-col items-center justify-center px-2">
                      <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                        Set {set.setNumber}
                      </span>
                      <span className="text-slate-300 font-bold text-sm">:</span>
                    </div>

                    {/* Team 2 Score Input */}
                    <div className="flex-1 flex justify-center">
                      <input
                        type="number"
                        min="0"
                        max={tournament.maxPointsCap || 30}
                        value={set.team2Score}
                        onChange={(e) => handleScoreChange(idx, 'team2Score', e.target.value)}
                        className="w-16 h-11 text-center text-xl font-black font-mono bg-slate-50/80 border-2 border-slate-200 hover:border-emerald-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 rounded-xl transition-all shadow-2xs text-slate-900"
                      />
                    </div>
                  </div>

                  {/* YouTube Video URL Input for this Set */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-red-50 text-red-600 border border-red-200/60 flex items-center justify-center shrink-0" title="Gắn link YouTube video cho set này">
                      <Video className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="url"
                      placeholder={`Link YouTube video Set ${set.setNumber} (ví dụ: https://youtube.com/...)`}
                      value={set.videoUrl || ''}
                      onChange={(e) => handleVideoUrlChange(idx, e.target.value)}
                      className="flex-1 text-[11px] bg-slate-50/60 border border-slate-200 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/10 rounded-lg px-2.5 py-1.5 text-slate-800 placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Winner Indicator if determined */}
          {liveWinner && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <span>Đội thắng: <strong className="text-emerald-950">{liveWinner}</strong></span>
            </div>
          )}

          {/* Hidden submit trigger */}
          <button type="submit" id="score-editor-submit-btn" className="hidden" />
        </form>

        {/* Sticky Dedicated Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200/70 flex items-center justify-end gap-2.5 shrink-0 shadow-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('score-editor-submit-btn')?.click()}
            className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Lưu Thông Tin & Tỷ Số</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
