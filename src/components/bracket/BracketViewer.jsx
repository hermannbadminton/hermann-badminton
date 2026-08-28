import React, { useState, useRef } from 'react';
import MatchCard from './MatchCard';
import { ZoomIn, ZoomOut, Maximize2, Trophy, Sparkles } from 'lucide-react';

export default function BracketViewer({ rounds, onSelectMatch, isAdmin }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef(null);

  const roundNumbers = Object.keys(rounds).sort((a, b) => Number(a) - Number(b));
  const totalRounds = roundNumbers.length;

  const getRoundLabel = (roundIndex, total) => {
    const diff = total - roundIndex;
    if (diff === 1) return 'Chung Kết';
    if (diff === 2) return 'Bán Kết';
    if (diff === 3) return 'Tứ Kết';
    if (diff === 4) return 'Vòng 1/8 (Vòng 16)';
    return `Vòng ${roundIndex + 1}`;
  };

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.min(1.4, Math.max(0.7, Number((prev + delta).toFixed(1)))));
  };

  const resetZoom = () => setZoomLevel(1);

  if (!rounds || roundNumbers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-700">Chưa có dữ liệu nhánh đấu</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          {isAdmin
            ? 'Vui lòng vào tab Quản Trị để phân cặp hoặc tạo nhánh đấu tự động cho các đội.'
            : 'Ban tổ chức đang chuẩn bị sơ đồ bốc thăm cho giải đấu này.'}
        </p>
      </div>
    );
  }

  // Tìm nhà vô địch nếu trận chung kết đã xong
  const finalRoundMatches = rounds[roundNumbers[roundNumbers.length - 1]] || [];
  const finalMatch = finalRoundMatches[0];
  const championTeam = finalMatch && finalMatch.status === 'COMPLETED'
    ? (finalMatch.winnerId === finalMatch.team1Id ? finalMatch.team1 : finalMatch.team2)
    : null;

  return (
    <div className="relative bg-slate-900/5 rounded-2xl border border-slate-200/80 overflow-hidden shadow-inner backdrop-blur-sm">
      {/* Top Toolbar: Zoom & Controls */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-white border-b border-slate-200/80 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider truncate">
            Sơ Đồ Nhánh Đấu
          </span>
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium whitespace-nowrap shrink-0">
            • {totalRounds} Vòng
          </span>
        </div>

        {/* Zoom Tool Buttons */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 bg-slate-100 p-0.5 sm:p-1 rounded-lg shrink-0">
          <button
            onClick={() => handleZoom(-0.1)}
            title="Thu nhỏ"
            className="p-1 text-slate-600 hover:bg-white rounded transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <span className="text-[10px] sm:text-[11px] font-mono font-semibold text-slate-700 w-8 sm:w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.1)}
            title="Phóng to"
            className="p-1 text-slate-600 hover:bg-white rounded transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={resetZoom}
            title="Mặc định 100%"
            className="p-1 text-slate-600 hover:bg-white rounded transition-colors ml-0.5 border-l border-slate-200 pl-1.5 hidden sm:block"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Champion Banner if Available */}
      {championTeam && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 px-6 py-2.5 text-white flex items-center justify-center gap-2 shadow-sm animate-fade-in">
          <Trophy className="w-5 h-5 text-yellow-100 animate-bounce" />
          <span className="text-xs font-extrabold uppercase tracking-wider drop-shadow-sm">
            Nhà Vô Địch Giải Đấu: {championTeam.name} {championTeam.club ? `(${championTeam.club})` : ''} 🏆
          </span>
        </div>
      )}

      {/* Scrollable Bracket Board */}
      <div
        ref={containerRef}
        className="overflow-x-auto custom-scrollbar p-8 min-h-[520px] flex items-center"
      >
        <div
          className="flex gap-14 min-w-max transition-transform duration-150 origin-top-left"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {roundNumbers.map((roundKey, roundIndex) => {
            const matchesInRound = rounds[roundKey];
            const isFinal = roundIndex === totalRounds - 1;

            return (
              <div key={roundKey} className="flex flex-col w-72">
                {/* Round Title Header */}
                <div className="text-center mb-6">
                  <div
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                      isFinal
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/20'
                        : 'bg-emerald-600 text-white shadow-emerald-600/20'
                    }`}
                  >
                    {isFinal && <Trophy className="w-3.5 h-3.5" />}
                    <span>{getRoundLabel(roundIndex, totalRounds)}</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 mt-1">
                    {matchesInRound.length} cặp đấu
                  </p>
                </div>

                {/* Match Cards Container with automatic flex spacing */}
                <div className="flex flex-col justify-around flex-1 gap-10 py-2">
                  {matchesInRound.map((match) => (
                    <div key={match.id} className="relative flex items-center">
                      <MatchCard
                        match={match}
                        onSelect={onSelectMatch}
                        isAdmin={isAdmin}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
