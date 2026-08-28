import React from 'react';
import { Clock, MapPin, CheckCircle2, Flame, Edit3, Eye } from 'lucide-react';

export default function MatchCard({ match, onSelect, isAdmin }) {
  const isCompleted = match.status === 'COMPLETED';
  const isInProgress = match.status === 'IN_PROGRESS';

  const isByeMatch = isCompleted && ((match.team1Id && !match.team2Id) || (!match.team1Id && match.team2Id));

  const team1Name = match.team1?.name || (match.team1Id ? `Đội #${match.team1Id}` : isByeMatch ? 'BYE (Không có đối thủ)' : 'Chờ xác định');
  const team2Name = match.team2?.name || (match.team2Id ? `Đội #${match.team2Id}` : isByeMatch ? 'BYE (Không có đối thủ)' : 'Chờ xác định');

  const team1IsWinner = isCompleted && match.winnerId === match.team1Id;
  const team2IsWinner = isCompleted && match.winnerId === match.team2Id;

  return (
    <div
      onClick={() => onSelect(match)}
      className={`w-72 bg-white rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden shadow-sm hover:shadow-lg group ${
        isInProgress
          ? 'border-amber-400 ring-2 ring-amber-400/20'
          : isCompleted
          ? 'border-slate-200 hover:border-emerald-500'
          : 'border-slate-200/90 hover:border-slate-400'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/80 border-b border-slate-100 text-[11px] font-medium">
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="font-bold text-slate-700">{match.roundName || `Trận #${match.matchOrder}`}</span>
          {match.court && (
            <span className="text-[10px] bg-slate-200/70 px-1.5 py-0.2 rounded text-slate-600">
              {match.court}
            </span>
          )}
        </div>

        {/* Status Badge */}
        <div>
          {isByeMatch ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Vào Thẳng (BYE)
            </span>
          ) : isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Đã Xong
            </span>
          ) : isInProgress ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
              <Flame className="w-3 h-3" />
              LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
              <Clock className="w-3 h-3" />
              {match.scheduledTime || 'Chờ'}
            </span>
          )}
        </div>
      </div>

      {/* Team 1 Slot */}
      <div
        className={`flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 transition-colors ${
          team1IsWinner
            ? 'bg-emerald-50 text-emerald-950 font-bold'
            : isCompleted && !team1IsWinner
            ? 'text-slate-400 bg-slate-50/40'
            : 'text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <img
            src={
              match.team1?.avatar && match.team1.avatar.startsWith('http')
                ? match.team1.avatar
                : 'https://img.bwfbadminton.com/image/upload/v2/assets/flag-circle-svg-custom/VIE.png'
            }
            alt="flag"
            className="w-4 h-4 rounded-full object-cover shrink-0 shadow-2xs border border-slate-200/60"
          />
          <div className="truncate">
            <p className="text-xs truncate font-semibold">
              {team1Name}
            </p>
          </div>
        </div>

        {/* Scores */}
        <div className="flex items-center gap-1.5 ml-2 font-mono text-xs">
          {match.setScores?.map((set, idx) => {
            const hasScore = set.team1Score > 0 || set.team2Score > 0;
            const isSetWin = set.team1Score > set.team2Score;
            return (
              <span
                key={idx}
                className={`w-5 text-center py-0.5 rounded ${
                  isSetWin
                    ? 'font-extrabold text-emerald-700 bg-emerald-100/60'
                    : hasScore
                    ? 'text-slate-500 bg-slate-100'
                    : 'text-slate-300'
                }`}
              >
                {set.team1Score}
              </span>
            );
          })}
        </div>
      </div>

      {/* Team 2 Slot */}
      <div
        className={`flex items-center justify-between px-3.5 py-2.5 transition-colors ${
          team2IsWinner
            ? 'bg-emerald-50 text-emerald-950 font-bold'
            : isCompleted && !team2IsWinner
            ? 'text-slate-400 bg-slate-50/40'
            : 'text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <img
            src={
              match.team2?.avatar && match.team2.avatar.startsWith('http')
                ? match.team2.avatar
                : 'https://img.bwfbadminton.com/image/upload/v2/assets/flag-circle-svg-custom/VIE.png'
            }
            alt="flag"
            className="w-4 h-4 rounded-full object-cover shrink-0 shadow-2xs border border-slate-200/60"
          />
          <div className="truncate">
            <p className="text-xs truncate font-semibold">
              {team2Name}
            </p>
          </div>
        </div>

        {/* Scores */}
        <div className="flex items-center gap-1.5 ml-2 font-mono text-xs">
          {match.setScores?.map((set, idx) => {
            const hasScore = set.team1Score > 0 || set.team2Score > 0;
            const isSetWin = set.team2Score > set.team1Score;
            return (
              <span
                key={idx}
                className={`w-5 text-center py-0.5 rounded ${
                  isSetWin
                    ? 'font-extrabold text-emerald-700 bg-emerald-100/60'
                    : hasScore
                    ? 'text-slate-500 bg-slate-100'
                    : 'text-slate-300'
                }`}
              >
                {set.team2Score}
              </span>
            );
          })}
        </div>
      </div>

      {/* Hover Action Footer */}
      <div className="px-3 py-1 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-emerald-700 transition-colors">
        <span>Click để {isAdmin ? 'chấm điểm' : 'xem chi tiết'}</span>
        {isAdmin ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </div>
    </div>
  );
}
