import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTournament } from '../../context/TournamentContext';
import { usePreventBodyScroll } from '../../hooks/usePreventBodyScroll';
import AdvanceKnockoutModal from '../group/AdvanceKnockoutModal';
import {
  Users,
  Plus,
  Trash2,
  X,
  Shuffle,
  GitBranch,
  CheckCircle2,
  Layers,
  Award,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Play,
  Calendar,
} from 'lucide-react';

export default function TeamManagerModal({ tournament, onClose, onApplied }) {
  usePreventBodyScroll(true);

  const {
    teams,
    matches,
    addTeam,
    removeTeam,
    createCustomBracket,
    generateGroupStage,
    generateGroupMatchesFromExistingGroups,
    refreshData,
    getGroupStandings,
  } = useTournament();

  useEffect(() => {
    if (refreshData) refreshData();
  }, []);

  const tournamentTeams = teams.filter((t) => String(t.tournamentId) === String(tournament?.id));

  const hasGroupStage = tournament?.format === 'GROUP_KNOCKOUT' || tournament?.format === 'ROUND_ROBIN';

  // Tab: 'GROUPS' (Bảng đấu), 'BRACKET' (Nhánh đấu), 'TEAMS' (Quản lý VĐV)
  const [activeTab, setActiveTab] = useState(() => (hasGroupStage ? 'GROUPS' : 'BRACKET'));

  // State mở modal tùy chọn đội vào vòng trong & chia nhánh
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isGeneratingGroupMatches, setIsGeneratingGroupMatches] = useState(false);

  // Xử lý tạo lịch thi đấu từ các bảng hiện tại
  const handleGenerateGroupMatches = async () => {
    setIsGeneratingGroupMatches(true);
    try {
      await generateGroupMatchesFromExistingGroups(tournament.id);
      if (onApplied) onApplied();
    } finally {
      setIsGeneratingGroupMatches(false);
    }
  };

  const handleShuffleAndGenerateGroupStage = async () => {
    if (confirm('Bạn có chắc muốn bốc thăm chia lại các bảng và tạo mới toàn bộ trận đấu vòng bảng?')) {
      setIsGeneratingGroupMatches(true);
      try {
        await generateGroupStage(tournament.id, expectedGroupCount, true);
        if (onApplied) onApplied();
      } finally {
        setIsGeneratingGroupMatches(false);
      }
    }
  };

  // Kiểm tra giải đấu là nội dung Đôi (Đôi Nam, Đôi Nữ, Đôi Nam Nữ)
  const isDoubles = tournament.category?.toLowerCase().includes('đôi');

  // Form thêm VĐV / Cặp đấu
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [singlesPlayerName, setSinglesPlayerName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Bảng A');

  // Lấy các trận đấu Vòng 1 hiện tại của giải đấu (nếu đã có nhánh)
  const existingRound1Matches = matches
    .filter((m) => String(m.tournamentId) === String(tournament?.id) && m.stage !== 'GROUP' && Number(m.roundNumber) === 1)
    .sort((a, b) => a.matchOrder - b.matchOrder);

  // Kiểm tra tình trạng vòng bảng
  const groupMatches = matches.filter(
    (m) => String(m.tournamentId) === String(tournament?.id) && m.stage === 'GROUP'
  );
  const isGroupStageGenerated = groupMatches.length > 0;
  const isGroupStageCompleted =
    isGroupStageGenerated && groupMatches.every((m) => m.status === 'COMPLETED');

  // Kích thước nhánh đấu (4, 8 hoặc 16)
  const [manualBracketSize, setManualBracketSize] = useState(() => {
    if (existingRound1Matches.length > 0) {
      return existingRound1Matches.length * 2;
    }
    const count = tournamentTeams.length;
    if (count > 8) return 16;
    if (count > 4) return 8;
    return 4;
  });

  // State danh sách các cặp đấu: [{ team1Id: '', team2Id: '' }, ...]
  const [customPairs, setCustomPairs] = useState(() => {
    if (existingRound1Matches.length > 0) {
      return existingRound1Matches.map((m) => ({
        team1Id: m.team1Id || '',
        team2Id: m.team2Id || '',
      }));
    }
    const pairCount = (tournamentTeams.length > 8 ? 16 : tournamentTeams.length > 4 ? 8 : 4) / 2;
    const initialPairs = [];
    for (let i = 0; i < pairCount; i++) {
      initialPairs.push({
        team1Id: tournamentTeams[i]?.id || '',
        team2Id: tournamentTeams[pairCount * 2 - 1 - i]?.id || '',
      });
    }
    return initialPairs;
  });

  // Tự động nạp các cặp đấu khi matches được cập nhật/tải từ Backend
  useEffect(() => {
    const r1 = matches
      .filter((m) => String(m.tournamentId) === String(tournament?.id) && m.stage !== 'GROUP' && Number(m.roundNumber) === 1)
      .sort((a, b) => a.matchOrder - b.matchOrder);

    if (r1.length > 0) {
      setManualBracketSize(r1.length * 2);
      setCustomPairs(
        r1.map((m) => ({
          team1Id: m.team1Id || '',
          team2Id: m.team2Id || '',
        }))
      );
    }
  }, [matches, tournament?.id]);

  // Gom nhóm các đội theo groupName
  const groupedTeams = {};
  const expectedGroupCount = tournament?.groupCount || 2;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < expectedGroupCount; i++) {
    groupedTeams[`Bảng ${alphabet[i]}`] = [];
  }
  tournamentTeams.forEach((t) => {
    const gName = t.groupName || 'Bảng A';
    if (!groupedTeams[gName]) groupedTeams[gName] = [];
    groupedTeams[gName].push(t);
  });

  // Đồng bộ khi thay đổi kích thước nhánh (Bracket Size)
  const handleBracketSizeChange = (newSize) => {
    setManualBracketSize(newSize);
    const pairCount = newSize / 2;
    const nextPairs = [];
    for (let i = 0; i < pairCount; i++) {
      nextPairs.push(
        customPairs[i] || {
          team1Id: tournamentTeams[i]?.id || '',
          team2Id: tournamentTeams[newSize - 1 - i]?.id || '',
        }
      );
    }
    setCustomPairs(nextPairs);
  };

  // Nút Bốc Thăm Ngẫu Nhiên -> Điền trước kết quả vào các ô bên dưới (Preview)
  const handleRandomDrawPreview = () => {
    if (tournamentTeams.length < 2) {
      alert(`Cần tối thiểu 2 ${isDoubles ? 'cặp đấu' : 'VĐV'} để bốc thăm.`);
      return;
    }

    const shuffled = [...tournamentTeams].sort(() => Math.random() - 0.5);
    const slots = new Array(manualBracketSize).fill(null);
    for (let i = 0; i < shuffled.length && i < manualBracketSize; i++) {
      slots[i] = shuffled[i].id;
    }

    const pairCount = manualBracketSize / 2;
    const previewPairs = [];
    for (let i = 0; i < pairCount; i++) {
      previewPairs.push({
        team1Id: slots[i] || '',
        team2Id: slots[manualBracketSize - 1 - i] || '',
      });
    }

    setCustomPairs(previewPairs);
  };

  // Nút Xếp Theo Thứ Tự Đăng Ký -> Điền trước kết quả
  const handleOrderDrawPreview = () => {
    const slots = new Array(manualBracketSize).fill(null);
    for (let i = 0; i < tournamentTeams.length && i < manualBracketSize; i++) {
      slots[i] = tournamentTeams[i].id;
    }

    const pairCount = manualBracketSize / 2;
    const previewPairs = [];
    for (let i = 0; i < pairCount; i++) {
      previewPairs.push({
        team1Id: slots[i] || '',
        team2Id: slots[manualBracketSize - 1 - i] || '',
      });
    }

    setCustomPairs(previewPairs);
  };

  // Xử lý bốc thăm chia bảng vòng bảng
  const handleGenerateGroupStageAction = () => {
    generateGroupStage(tournament.id, tournament.groupCount || 2, true);
    onClose();
  };

  // Thêm thành viên/cặp đấu mới
  const handleAddTeam = (e) => {
    e.preventDefault();

    let formattedName = '';
    if (isDoubles) {
      if (!player1Name.trim() || !player2Name.trim()) {
        alert('Vui lòng nhập đầy đủ tên của cả 2 Vận động viên.');
        return;
      }
      formattedName = `${player1Name.trim()} & ${player2Name.trim()}`;
    } else {
      if (!singlesPlayerName.trim()) {
        alert('Vui lòng nhập tên Vận động viên.');
        return;
      }
      formattedName = singlesPlayerName.trim();
    }

    addTeam(tournament.id, {
      name: formattedName,
      groupName: selectedGroup,
      avatar: isDoubles ? '👥' : '🏸',
    });

    setPlayer1Name('');
    setPlayer2Name('');
    setSinglesPlayerName('');
  };

  // Áp dụng lưu cấu hình nhánh đấu vào giải
  const handleApplyBracket = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const selectedIds = [];
    for (let i = 0; i < customPairs.length; i++) {
      const team1Id = customPairs[i]?.team1Id ? String(customPairs[i].team1Id).trim() : '';
      const team2Id = customPairs[i]?.team2Id ? String(customPairs[i].team2Id).trim() : '';

      if (!team1Id && !team2Id) {
        alert(`Trận #${i + 1} phải có ít nhất 1 đội tham gia (hoặc nhận suất BYE).`);
        return;
      }
      if (team1Id && team2Id && team1Id === team2Id) {
        alert(`Trận #${i + 1} không thể chọn 2 đối thủ trùng nhau!`);
        return;
      }
      if (team1Id) {
        if (selectedIds.includes(team1Id)) {
          alert(`Có VĐV/Cặp đấu đang được chọn trùng vào nhiều trận khác nhau.`);
          return;
        }
        selectedIds.push(team1Id);
      }
      if (team2Id) {
        if (selectedIds.includes(team2Id)) {
          alert(`Có VĐV/Cặp đấu đang được chọn trùng vào nhiều trận khác nhau.`);
          return;
        }
        selectedIds.push(team2Id);
      }
    }

    const sanitizedPairs = customPairs.map((p) => ({
      team1Id: p?.team1Id && String(p.team1Id).trim() !== '' ? p.team1Id : null,
      team2Id: p?.team2Id && String(p.team2Id).trim() !== '' ? p.team2Id : null,
    }));

    await createCustomBracket(tournament.id, sanitizedPairs, manualBracketSize);
    if (onApplied) onApplied();
    onClose();
  };

  const handlePairChange = (pairIndex, slot, value) => {
    const next = [...customPairs];
    next[pairIndex] = { ...next[pairIndex], [slot]: value };
    setCustomPairs(next);
  };

  const calculatedByeCount = Math.max(0, manualBracketSize - tournamentTeams.length);

  return createPortal(
    <div className="fixed inset-0 z-[99999] w-screen h-screen min-h-screen flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      {/* Click outside to close backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight truncate">
                Quản Lý Đội & Bốc Thăm
              </h3>
              <p className="text-[11px] text-emerald-100/90 truncate">
                {tournament.name} • <span className="text-emerald-200 font-semibold">{tournament.category}</span>
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

        {/* Modal Navigation Tabs (Bảng Đấu, Nhánh Đấu, Quản Lý VĐV) */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 sm:px-6 shrink-0 overflow-x-auto">
          {hasGroupStage && (
            <button
              onClick={() => setActiveTab('GROUPS')}
              className={`py-3 px-4 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'GROUPS'
                  ? 'border-emerald-600 text-emerald-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bảng Đấu ({Object.keys(groupedTeams).length} Bảng)</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('BRACKET')}
            className={`py-3 px-4 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'BRACKET'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sơ Đồ Nhánh Đấu (Knockout)</span>
          </button>

          <button
            onClick={() => setActiveTab('TEAMS')}
            className={`py-3 px-4 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'TEAMS'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Danh Sách & Thêm VĐV ({tournamentTeams.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white">
          {/* TAB 1: BẢNG ĐẤU */}
          {activeTab === 'GROUPS' && hasGroupStage && (
            <div className="space-y-6">
              {/* Header: Tạo các trận vòng bảng */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Danh Sách Các Bảng Đấu
                  </h4>
                  <p className="text-xs text-slate-500">
                    {isGroupStageGenerated
                      ? `✓ Đã tạo ${groupMatches.length} trận đấu vòng bảng`
                      : 'Chưa tạo lịch thi đấu cho các bảng'}
                  </p>
                </div>
                {!isGroupStageGenerated && (
                  <button
                    type="button"
                    onClick={handleGenerateGroupMatches}
                    disabled={isGeneratingGroupMatches || tournamentTeams.length < 2}
                    className="px-4 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-700/20 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-white text-white" />
                    <span>{isGeneratingGroupMatches ? 'Đang tạo...' : 'Tạo các trận vòng bảng'}</span>
                  </button>
                )}

              </div>

              {/* Danh sách các bảng & thành viên */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(groupedTeams).map(([groupName, groupTeamList]) => (
                  <div
                    key={groupName}
                    className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          {groupName}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {groupTeamList.length} đội
                        </span>
                      </div>

                      {groupTeamList.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4 text-center">
                          Chưa có đội nào trong bảng này.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {groupTeamList.map((t, idx) => (
                            <div
                              key={t.id}
                              className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-800"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                                  {idx + 1}
                                </span>
                                <span className="truncate">{t.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SƠ ĐỒ NHÁNH ĐẤU KNOCKOUT */}
          {activeTab === 'BRACKET' && (
            <div className="space-y-6">
              {/* Điều khiển quy mô & Bốc thăm */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Sắp Xếp Cặp Đấu Knockout
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Quy mô: {manualBracketSize} vị trí{' '}
                    {calculatedByeCount > 0 && (
                      <span className="text-emerald-600 font-bold">
                        (Có {calculatedByeCount} suất BYE vào thẳng)
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {[4, 8, 16].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleBracketSizeChange(size)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${manualBracketSize === size
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      {size} Đội ({size / 2} Trận)
                    </button>
                  ))}
                </div>
              </div>

              {/* Nút hành động nhanh: Bốc thăm ngẫu nhiên & Xếp theo thứ tự */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRandomDrawPreview}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Shuffle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Bốc Ngẫu Nhiên</span>
                </button>
                <button
                  type="button"
                  onClick={handleOrderDrawPreview}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Xếp Theo Thứ Tự</span>
                </button>
              </div>

              {/* Danh sách các cặp đấu vòng 1 */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Các cặp đấu Vòng 1 ({customPairs.length} trận):
                </p>

                <div className="grid grid-cols-1 gap-2.5">
                  {customPairs.map((pair, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-2 text-xs"
                    >
                      <span className="w-16 font-extrabold text-slate-700 shrink-0">
                        Trận #{pIdx + 1}
                      </span>

                      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                        {/* Đội 1 */}
                        <select
                          value={pair.team1Id || ''}
                          onChange={(e) => handlePairChange(pIdx, 'team1Id', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="">-- Suất Trống / BYE --</option>
                          {tournamentTeams.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} {t.group ? `(${t.group})` : ''}
                            </option>
                          ))}
                        </select>

                        {/* Đội 2 */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-400 shrink-0">vs</span>
                          <select
                            value={pair.team2Id || ''}
                            onChange={(e) => handlePairChange(pIdx, 'team2Id', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="">-- Suất Trống / BYE --</option>
                            {tournamentTeams.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name} {t.group ? `(${t.group})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nút Áp Dụng Tạo Sơ Đồ Nhánh */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleApplyBracket}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Áp Dụng & Tạo Sơ Đồ Nhánh Đấu</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DANH SÁCH & THÊM VẬN ĐỘNG VIÊN */}
          {activeTab === 'TEAMS' && (
            <div className="space-y-6">
              {/* Form thêm VĐV / Cặp đấu */}
              <form onSubmit={handleAddTeam} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    Thêm {isDoubles ? 'Cặp Đấu Mới' : 'Vận Động Viên Mới'}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {tournament.category}
                  </span>
                </div>

                {isDoubles ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Tên VĐV 1 *
                      </label>
                      <input
                        type="text"
                        required
                        value={player1Name}
                        onChange={(e) => setPlayer1Name(e.target.value)}
                        placeholder="VD: Hoàng Anh"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Tên VĐV 2 *
                      </label>
                      <input
                        type="text"
                        required
                        value={player2Name}
                        onChange={(e) => setPlayer2Name(e.target.value)}
                        placeholder="VD: Nam MS"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Tên Vận Động Viên *
                    </label>
                    <input
                      type="text"
                      required
                      value={singlesPlayerName}
                      onChange={(e) => setSinglesPlayerName(e.target.value)}
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {/* Chọn bảng đấu nếu có */}
                {hasGroupStage && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Phân vào Bảng đấu (tùy chọn)
                    </label>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    >
                      {Object.keys(groupedTeams).map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Vào Giải Đấu</span>
                  </button>
                </div>
              </form>

              {/* Danh sách các đội hiện tại */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">
                    Danh Sách VĐV Đã Tham Gia ({tournamentTeams.length})
                  </h4>
                </div>

                {tournamentTeams.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Chưa có vận động viên nào đăng ký tham gia giải này.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {tournamentTeams.map((t, idx) => (
                      <div
                        key={t.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-[11px] shrink-0">
                            {idx + 1}
                          </span>
                          <div className="truncate">
                            <p className="font-bold text-slate-800 truncate">{t.name}</p>
                            {t.groupName && (
                              <span className="text-[10px] text-slate-500">{t.groupName}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => removeTeam(t.id, tournament.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa khỏi giải"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advance Knockout Modal */}
      <AdvanceKnockoutModal
        tournament={tournament}
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        onApplied={() => {
          setActiveTab('BRACKET');
        }}
      />
    </div>,
    document.body
  );
}
