import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTournament } from '../../context/TournamentContext';
import { usePreventBodyScroll } from '../../hooks/usePreventBodyScroll';
import {
  Trophy,
  Users,
  CheckCircle2,
  Sparkles,
  Shuffle,
  ArrowRight,
  GitBranch,
  X,
  Award,
} from 'lucide-react';

export default function AdvanceKnockoutModal({
  tournament,
  isOpen,
  onClose,
  onApplied,
}) {
  usePreventBodyScroll(isOpen);

  const { teams, getGroupStandings, createCustomBracket } = useTournament();

  if (!isOpen) return null;

  const standings = getGroupStandings(tournament.id);
  const groupNames = Object.keys(standings).sort();

  // State: danh sách ID các đội được chọn vào vòng trong
  const [selectedTeamIds, setSelectedTeamIds] = useState(() => {
    const initialIds = [];
    const isSingle = groupNames.length === 1;
    groupNames.forEach((gName) => {
      const groupTeams = standings[gName] || [];
      // Nếu 1 bảng: lấy 4 đội; nếu nhiều bảng: >= 4 đội lấy 2 đội (Nhất + Nhì), < 4 đội lấy 1 đội (Nhất)
      const advancingForThisGroup = isSingle
        ? Math.min(4, groupTeams.length)
        : groupTeams.length >= 4
        ? 2
        : (tournament.advancingPerGroup || 1);
      groupTeams.slice(0, advancingForThisGroup).forEach((item) => {
        if (item.team?.id) initialIds.push(item.team.id);
      });
    });
    return initialIds;
  });

  // Kích thước nhánh đấu Knockout
  const count = selectedTeamIds.length;
  const [bracketSize, setBracketSize] = useState(() => {
    if (count > 8) return 16;
    if (count > 4) return 8;
    return 4;
  });

  // State phân cặp: [{ team1Id: '', team2Id: '' }, ...]
  const [customPairs, setCustomPairs] = useState([]);

  // Tự động phân cặp khi danh sách đội chọn hoặc kích thước nhánh thay đổi
  useEffect(() => {
    const pairCount = bracketSize / 2;
    const newPairs = [];

    // Lấy danh sách đối tượng team được chọn
    const selectedTeamsList = [];
    groupNames.forEach((gName) => {
      (standings[gName] || []).forEach((item) => {
        if (selectedTeamIds.includes(item.team?.id)) {
          selectedTeamsList.push({
            ...item.team,
            groupName: gName,
            rank: item.rank,
          });
        }
      });
    });

    // Trường hợp 1 bảng: 4 đội -> Bán kết (Top 1 vs Top 4, Top 2 vs Top 3)
    if (groupNames.length === 1 && pairCount === 2 && selectedTeamsList.length >= 4) {
      newPairs.push(
        { team1Id: selectedTeamsList[0]?.id || '', team2Id: selectedTeamsList[3]?.id || '' }, // Top 1 vs Top 4
        { team1Id: selectedTeamsList[1]?.id || '', team2Id: selectedTeamsList[2]?.id || '' }  // Top 2 vs Top 3
      );
    }
    // Mặc định chéo bảng nếu có 2 bảng (A vs B)
    else if (groupNames.length === 2 && selectedTeamsList.length >= 2) {
      const topA = selectedTeamsList.filter((t) => t.groupName === 'Bảng A');
      const topB = selectedTeamsList.filter((t) => t.groupName === 'Bảng B');

      if (pairCount === 2 && topA.length >= 2 && topB.length >= 2) {
        // Bán kết 4 đội: Nhất A vs Nhì B, Nhất B vs Nhì A
        newPairs.push(
          { team1Id: topA[0]?.id || '', team2Id: topB[1]?.id || '' },
          { team1Id: topB[0]?.id || '', team2Id: topA[1]?.id || '' }
        );
      } else {
        for (let i = 0; i < pairCount; i++) {
          newPairs.push({
            team1Id: selectedTeamsList[i * 2]?.id || '',
            team2Id: selectedTeamsList[i * 2 + 1]?.id || '',
          });
        }
      }
    } else {
      // Ghép thứ tự mặc định
      for (let i = 0; i < pairCount; i++) {
        newPairs.push({
          team1Id: selectedTeamsList[i]?.id || '',
          team2Id: selectedTeamsList[pairCount * 2 - 1 - i]?.id || '',
        });
      }
    }

    setCustomPairs(newPairs);
  }, [selectedTeamIds, bracketSize]);

  // Chọn preset nhanh
  const handleSelectPreset = (topCount) => {
    const ids = [];
    groupNames.forEach((gName) => {
      const groupTeams = standings[gName] || [];
      groupTeams.slice(0, topCount).forEach((item) => {
        if (item.team?.id) ids.push(item.team.id);
      });
    });
    setSelectedTeamIds(ids);

    const total = ids.length;
    if (total > 8) setBracketSize(16);
    else if (total > 4) setBracketSize(8);
    else setBracketSize(4);
  };

  // Toggle chọn/bỏ chọn từng đội
  const handleToggleTeam = (teamId) => {
    setSelectedTeamIds((prev) => {
      const next = prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId];

      const total = next.length;
      if (total > 8) setBracketSize(16);
      else if (total > 4) setBracketSize(8);
      else setBracketSize(4);

      return next;
    });
  };

  // Bốc thăm ngẫu nhiên
  const handleRandomize = () => {
    const shuffled = [...selectedTeamIds].sort(() => Math.random() - 0.5);
    const pairCount = bracketSize / 2;
    const pairs = [];
    for (let i = 0; i < pairCount; i++) {
      pairs.push({
        team1Id: shuffled[i] || '',
        team2Id: shuffled[bracketSize - 1 - i] || '',
      });
    }
    setCustomPairs(pairs);
  };

  // Thay đổi slot trong cặp đấu
  const handlePairSlotChange = (pairIndex, slot, value) => {
    const next = [...customPairs];
    next[pairIndex] = { ...next[pairIndex], [slot]: value };
    setCustomPairs(next);
  };

  // Áp dụng lưu nhánh Knockout
  const handleApply = (e) => {
    e.preventDefault();

    if (selectedTeamIds.length < 2) {
      alert('Vui lòng chọn tối thiểu 2 đội vào vòng trong để chia nhánh.');
      return;
    }

    createCustomBracket(tournament.id, customPairs, bracketSize);
    if (onApplied) onApplied();
    onClose();
  };

  const selectedTeamsData = teams.filter((t) => selectedTeamIds.includes(t.id));

  return createPortal(
    <div className="fixed inset-0 z-[99999] w-screen h-screen min-h-screen flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Content */}
      <div className="relative z-10 bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[90vh] flex flex-col transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-5 sm:px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                Chọn Đội Vào Vòng Trong & Chia Nhánh Knockout
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                {tournament.name} • Tùy chọn số lượng đội và xếp cặp trực tiếp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* STEP 1: CHỌN ĐỘI ĐI TIẾP TỪ CÁC BẢNG */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  Chọn Các Đội Đi Tiếp Vào Vòng Trong ({selectedTeamIds.length} đội đã chọn)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tích chọn các đội có thành tích tốt hoặc bấm nút chọn nhanh bên dưới:
                </p>
              </div>

              {/* Nút Preset Nhanh */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleSelectPreset(1)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition-colors border border-slate-200"
                >
                  ⚡ Top 1 mỗi bảng
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset(2)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition-colors border border-slate-200"
                >
                  ⚡ Top 2 mỗi bảng
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset(99)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition-colors border border-slate-200"
                >
                  ⚡ Tất cả
                </button>
              </div>
            </div>

            {/* Danh sách các bảng và đội */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupNames.map((gName) => {
                const groupTeams = standings[gName] || [];
                return (
                  <div
                    key={gName}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                        {gName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">
                        {groupTeams.filter((t) => selectedTeamIds.includes(t.team?.id)).length}/{groupTeams.length} đội đi tiếp
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {groupTeams.map((item) => {
                        const isChecked = selectedTeamIds.includes(item.team?.id);
                        return (
                          <label
                            key={item.team?.id}
                            className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                              isChecked
                                ? 'bg-white border-emerald-500 shadow-sm text-slate-800'
                                : 'bg-transparent border-transparent text-slate-500 hover:bg-white/60'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleTeam(item.team?.id)}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                              />
                              <span className="w-5 text-center font-bold text-[11px] text-slate-400">
                                #{item.rank}
                              </span>
                              <span className="truncate">{item.team?.name}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-slate-400 font-normal">
                                {item.won}T - {item.lost}B ({item.points}đ)
                              </span>
                              {isChecked && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  ✓ Vào
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* STEP 2: TÙY CHỌNH PHÂN CẶP NHÁNH ĐẤU KNOCKOUT */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-black flex items-center justify-center">
                    2
                  </span>
                  Thiết Lập Nhánh Đấu Vòng Knockout
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tùy chỉnh đối thủ từng trận hoặc bốc thăm ngẫu nhiên:
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Chọn Bracket Size */}
                <select
                  value={bracketSize}
                  onChange={(e) => setBracketSize(Number(e.target.value))}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-100 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={4}>Nhánh 4 Đội (Bán Kết)</option>
                  <option value={8}>Nhánh 8 Đội (Tứ Kết)</option>
                  <option value={16}>Nhánh 16 Đội (Vòng 1/8)</option>
                </select>

                <button
                  type="button"
                  onClick={handleRandomize}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 border border-slate-200"
                >
                  <Shuffle className="w-3.5 h-3.5 text-slate-500" />
                  <span>Bốc Ngẫu Nhiên</span>
                </button>
              </div>
            </div>

            {/* Danh sách các cặp đấu vòng 1 */}
            <div className="space-y-3">
              {customPairs.map((pair, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
                >
                  <div className="w-16 sm:w-20 shrink-0 font-bold text-xs text-emerald-800">
                    Trận #{idx + 1}
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                    {/* Slot 1 */}
                    <select
                      value={pair.team1Id || ''}
                      onChange={(e) => handlePairSlotChange(idx, 'team1Id', e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Suất Trống / BYE --</option>
                      {selectedTeamsData.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.groupName || 'Vòng bảng'})
                        </option>
                      ))}
                    </select>

                    {/* Slot 2 */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-slate-400 uppercase shrink-0">
                        VS
                      </span>
                      <select
                        value={pair.team2Id || ''}
                        onChange={(e) => handlePairSlotChange(idx, 'team2Id', e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">-- Suất Trống / BYE --</option>
                        {selectedTeamsData.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.groupName || 'Vòng bảng'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Áp Dụng & Tạo Sơ Đồ Nhánh Knockout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
