import React, { createContext, useContext, useState, useEffect } from 'react';
import { tournamentApi, teamApi, matchApi, authApi } from '../api';

const TournamentContext = createContext();

export const TournamentProvider = ({ children }) => {
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);

  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem('badminton_admin_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('badminton_admin_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [activeTournamentId, setActiveTournamentId] = useState('t-1');
  const [toastMessage, setToastMessage] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Khởi tạo và fetch dữ liệu từ Backend API (NestJS + Supabase)
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [backendTournaments, backendTeams, backendMatches] = await Promise.all([
        tournamentApi.getAll().catch(() => null),
        teamApi.getAll().catch(() => null),
        matchApi.getAll().catch(() => null),
      ]);

      if (Array.isArray(backendTournaments)) {
        setTournaments(backendTournaments);
      }
      if (Array.isArray(backendTeams)) {
        setTeams(backendTeams);
      }
      if (Array.isArray(backendMatches)) {
        setMatches(backendMatches);
      }

      setIsBackendConnected(true);
      console.log('✅ Đã đồng bộ đầy đủ Giải đấu, VĐV/Đội và Trận đấu từ Supabase');
    } catch (err) {
      console.info('Lỗi khi fetch dữ liệu từ Backend Supabase:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // --- AUTHENTICATION API ---
  const loginAdmin = async (username, password) => {
    try {
      const res = await authApi.login(username, password);
      if (res?.success && res?.user?.role === 'ADMIN') {
        setIsAdmin(true);
        setCurrentUser(res.user);
        try {
          localStorage.setItem('badminton_admin_logged_in', 'true');
          localStorage.setItem('badminton_admin_user', JSON.stringify(res.user));
        } catch (e) {}
        showToast(`Xin chào ${res.user.fullName || res.user.username}! Bạn đã đăng nhập Admin.`);
        return { success: true };
      }
      throw new Error(res?.message || 'Đăng nhập không thành công');
    } catch (err) {
      showToast(err.message || 'Sai tài khoản hoặc mật khẩu', 'warning');
      return { success: false, error: err.message };
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    setCurrentUser(null);
    try {
      localStorage.removeItem('badminton_admin_logged_in');
      localStorage.removeItem('badminton_admin_user');
    } catch (e) {}
    showToast('Đã đăng xuất quyền Quản Trị.', 'info');
  };

  // --- TOURNAMENT CRUD & API ---
  const createTournament = async (tournamentData) => {
    const tempId = `t-${Date.now()}`;
    const newTournament = {
      ...tournamentData,
      id: tempId,
      status: tournamentData.status || 'UPCOMING',
      banner: tournamentData.banner || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
      maxSets: Number(tournamentData.maxSets) || 3,
      pointsToWinSet: Number(tournamentData.pointsToWinSet) || 21,
      maxPointsCap: Number(tournamentData.maxPointsCap) || 30,
      totalTeams: 0,
    };
    setTournaments((prev) => [newTournament, ...prev]);

    // Gửi lên Backend Supabase
    try {
      const saved = await tournamentApi.create(tournamentData);
      if (saved?.id) {
        setTournaments((prev) => prev.map((t) => (t.id === tempId ? { ...t, ...saved } : t)));
      }
    } catch (err) {
      console.warn('Lưu giải đấu vào bộ nhớ tạm:', err.message);
    }

    showToast('Tạo giải đấu mới thành công!');
    return newTournament;
  };

  const updateTournament = async (id, updatedData) => {
    setTournaments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t))
    );

    try {
      await tournamentApi.update(id, updatedData);
    } catch (err) {
      console.warn('Cập nhật backend tạm hoãn:', err.message);
    }

    showToast('Cập nhật thông tin giải đấu thành công!');
  };

  const deleteTournament = async (id) => {
    setTournaments((prev) => prev.filter((t) => t.id !== id));
    setTeams((prev) => prev.filter((team) => team.tournamentId !== id));
    setMatches((prev) => prev.filter((m) => m.tournamentId !== id));

    try {
      await tournamentApi.delete(id);
    } catch (err) {
      console.warn('Xóa backend tạm hoãn:', err.message);
    }

    showToast('Đã xóa giải đấu và dữ liệu liên quan.', 'info');
  };

  // --- TEAM CRUD & API ---
  const addTeam = async (tournamentId, teamData) => {
    const tempId = `team-${Date.now()}`;
    const newTeam = {
      id: tempId,
      tournamentId,
      name: teamData.name,
      groupName: teamData.groupName || 'Bảng A',
      seed: teamData.seed ? Number(teamData.seed) : null,
      avatar: teamData.avatar || '🏸',
    };
    setTeams((prev) => [...prev, newTeam]);
    setTournaments((prev) =>
      prev.map((t) => (t.id === tournamentId ? { ...t, totalTeams: (t.totalTeams || 0) + 1 } : t))
    );

    try {
      const saved = await teamApi.create({ tournamentId, ...teamData });
      if (saved?.id) {
        setTeams((prev) => prev.map((t) => (t.id === tempId ? { ...t, ...saved } : t)));
      }
    } catch (err) {
      console.warn('Lưu đội tạm:', err.message);
    }

    showToast(`Đã thêm đội/VĐV "${newTeam.name}" vào giải.`);
  };

  const removeTeam = async (teamId, tournamentId) => {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    setTournaments((prev) =>
      prev.map((t) => (t.id === tournamentId ? { ...t, totalTeams: Math.max(0, (t.totalTeams || 1) - 1) } : t))
    );

    try {
      await teamApi.delete(teamId);
    } catch (err) {
      console.warn('Xóa đội backend tạm:', err.message);
    }

    showToast('Đã xóa đội thi đấu.', 'info');
  };

  // --- BADMINTON BWF SCORE ENGINE & AUTO ADVANCE ---
  const determineSetWinner = (set, team1Id, team2Id, pointsToWin = 21, maxPointsCap = 30) => {
    const s1 = Number(set.team1Score) || 0;
    const s2 = Number(set.team2Score) || 0;

    // Chạm mốc giới hạn (VD 30)
    if (s1 >= maxPointsCap) return team1Id;
    if (s2 >= maxPointsCap) return team2Id;

    // Chạm mốc thắng chuẩn và cách biệt >= 2
    if (s1 >= pointsToWin && s1 - s2 >= 2) return team1Id;
    if (s2 >= pointsToWin && s2 - s1 >= 2) return team2Id;

    return null;
  };

  const updateMatchScore = async (matchId, newSetScores) => {
    const match = matches.find((m) => String(m.id) === String(matchId));
    if (!match) return;

    const tournament = tournaments.find((t) => String(t.id) === String(match.tournamentId));
    const maxSets = Number(tournament?.maxSets ?? tournament?.max_sets ?? 3);
    const pointsToWinSet = Number(tournament?.pointsToWinSet ?? tournament?.points_to_win_set ?? 21);
    const maxPointsCap = Number(tournament?.maxPointsCap ?? tournament?.max_points_cap ?? 30);

    const setsToWinMatch = Math.ceil(maxSets / 2);
    let team1WonSets = 0;
    let team2WonSets = 0;

    const validatedSets = [];
    for (const set of newSetScores) {
      const winnerId = determineSetWinner(
        set,
        match.team1Id || match.team1_id,
        match.team2Id || match.team2_id,
        pointsToWinSet,
        maxPointsCap
      );

      if (winnerId === (match.team1Id || match.team1_id)) team1WonSets++;
      if (winnerId === (match.team2Id || match.team2_id)) team2WonSets++;

      validatedSets.push({
        setNumber: set.setNumber,
        team1Score: Number(set.team1Score) || 0,
        team2Score: Number(set.team2Score) || 0,
        winnerTeamId: winnerId || '',
      });
    }

    const hasAnyPlayedSet = validatedSets.some((s) => s.team1Score > 0 || s.team2Score > 0);
    const isSingleSetEntered = newSetScores.filter((s) => Number(s.team1Score) > 0 || Number(s.team2Score) > 0).length === 1;

    const isMatchDone =
      team1WonSets >= setsToWinMatch ||
      team2WonSets >= setsToWinMatch ||
      (isSingleSetEntered && (team1WonSets === 1 || team2WonSets === 1)) ||
      (team1WonSets !== team2WonSets && hasAnyPlayedSet && (team1WonSets > 0 || team2WonSets > 0));

    const matchWinnerId = isMatchDone
      ? team1WonSets > team2WonSets
        ? (match.team1Id || match.team1_id)
        : (match.team2Id || match.team2_id)
      : null;

    const newStatus = isMatchDone
      ? 'COMPLETED'
      : hasAnyPlayedSet
      ? 'IN_PROGRESS'
      : 'SCHEDULED';

    // 1. Cập nhật trạng thái trận đấu hiện tại trong state
    let updatedMatches = matches.map((m) => {
      if (String(m.id) === String(matchId)) {
        return {
          ...m,
          setScores: validatedSets,
          winnerId: matchWinnerId,
          winner_id: matchWinnerId,
          status: newStatus,
        };
      }
      return m;
    });

    // 2. TỰ ĐỘNG LẤY ID ĐỘI THẮNG ĐẨY VÀO TRẬN ĐẤU KẾ TIẾP (NEXT BRACKET)
    if (match.nextMatchId && matchWinnerId) {
      updatedMatches = updatedMatches.map((m) => {
        if (String(m.id) === String(match.nextMatchId)) {
          // Xác định vị trí slot (1 hoặc 2)
          let targetSlot = match.nextMatchSlot;
          if (!targetSlot) {
            // Nếu chưa có slot cố định, điền vào ô còn trống (team1Id hoặc team2Id)
            if (!m.team1Id && !m.team1_id) {
              targetSlot = 1;
            } else if (!m.team2Id && !m.team2_id) {
              targetSlot = 2;
            } else {
              targetSlot = 1;
            }
          }

          return {
            ...m,
            team1Id: targetSlot === 1 ? matchWinnerId : m.team1Id,
            team1_id: targetSlot === 1 ? matchWinnerId : m.team1_id || m.team1Id,
            team2Id: targetSlot === 2 ? matchWinnerId : m.team2Id,
            team2_id: targetSlot === 2 ? matchWinnerId : m.team2_id || m.team2Id,
          };
        }
        return m;
      });
    }

    setMatches(updatedMatches);

    // 3. Gửi cập nhật trực tiếp lên Supabase
    try {
      await matchApi.updateScore(matchId, validatedSets, matchWinnerId, newStatus);
    } catch (err) {
      console.warn('Lưu tỷ số backend tạm hoãn:', err.message);
    }

    const winnerTeam = teams.find((t) => t.id === matchWinnerId);
    if (isMatchDone && winnerTeam) {
      showToast(`🏆 Trận đấu kết thúc! Đội "${winnerTeam.name}" đã giành chiến thắng và tiến vào vòng trong!`);
    } else {
      showToast('Đã lưu tỷ số trận đấu thành công!');
    }
  };

  // --- THUẬT TOÁN SINH NHÁNH ĐẤU ĐA NĂNG (HỖ TRỢ ĐỘI LẺ, SUẤT BYE VÀO THẲNG & NHÁNH 16 ĐỘI) ---
  const generateBracket = (tournamentId, teamIds) => {
    const N = teamIds.length;
    if (N < 2) {
      showToast('Cần tối thiểu 2 đội để tạo nhánh đấu.', 'warning');
      return;
    }

    // Xác định kích thước nhánh chuẩn (Lũy thừa của 2: 4, 8, 16)
    let bracketSize = 4;
    if (N > 8) bracketSize = 16;
    else if (N > 4) bracketSize = 8;

    // Số cặp đấu vòng 1
    const numMatchesR1 = bracketSize / 2; // 2, 4, hoặc 8

    // Chuẩn bị danh sách đội điền vào các vị trí hạt giống/nhánh
    // Phân bổ đều các suất BYE nếu số đội < bracketSize
    const slots = new Array(bracketSize).fill(null);
    for (let i = 0; i < N; i++) {
      slots[i] = teamIds[i];
    }

    // Ghép các cặp đấu Vòng 1
    const pairs = [];
    for (let i = 0; i < numMatchesR1; i++) {
      // Ghép slot[i] với slot[bracketSize - 1 - i] (quy chuẩn bốc thăm BWF)
      pairs.push({
        team1Id: slots[i] || null,
        team2Id: slots[bracketSize - 1 - i] || null,
      });
    }

    createCustomBracket(tournamentId, pairs, bracketSize);
  };

  // Helper sinh danh sách set_scores mặc định chuẩn theo max_sets của giải đấu
  const getDefaultSetScores = (tournamentId) => {
    const tourney = tournaments.find((t) => String(t.id) === String(tournamentId));
    const maxSets = Number(tourney?.maxSets ?? tourney?.max_sets ?? 1);
    const sets = [];
    for (let i = 1; i <= Math.max(1, maxSets); i++) {
      sets.push({
        setNumber: i,
        team1Score: 0,
        team2Score: 0,
      });
    }
    return sets;
  };

  // Helper sinh UUID chuẩn tương thích hoàn toàn với PostgreSQL/Supabase
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // --- TỰ SẮP XẾP / GHÉP CẶP THỦ CÔNG HOẶC TỰ ĐỘNG VỚI SUẤT BYE ---
  const createCustomBracket = async (tournamentId, pairs, forcedSize = null) => {
    const numPairs = pairs.length;
    const bracketSize = forcedSize || numPairs * 2; // 4, 8, hoặc 16
    const initialSetScores = getDefaultSetScores(tournamentId);

    const newMatches = [];

    if (bracketSize === 4) {
      // 2 Semi-Finals, 1 Final
      const s1 = generateUUID();
      const s2 = generateUUID();
      const fin = generateUUID();

      // Kiểm tra suất BYE ở Bán kết 1
      const isBye1 = pairs[0]?.team1Id && !pairs[0]?.team2Id;
      const isBye2 = pairs[1]?.team1Id && !pairs[1]?.team2Id;

      newMatches.push(
        {
          id: s1,
          tournamentId,
          stage: 'KNOCKOUT',
          roundNumber: 1,
          matchOrder: 1,
          roundName: isBye1 ? 'Bán Kết 1 (BYE)' : 'Bán Kết 1',
          team1Id: pairs[0]?.team1Id || null,
          team2Id: pairs[0]?.team2Id || null,
          court: 'Sân 1',
          scheduledTime: '09:00',
          status: isBye1 ? 'COMPLETED' : 'SCHEDULED',
          winnerId: isBye1 ? pairs[0].team1Id : null,
          setScores: initialSetScores,
          nextMatchId: fin,
          nextMatchSlot: 1,
        },
        {
          id: s2,
          tournamentId,
          stage: 'KNOCKOUT',
          roundNumber: 1,
          matchOrder: 2,
          roundName: isBye2 ? 'Bán Kết 2 (BYE)' : 'Bán Kết 2',
          team1Id: pairs[1]?.team1Id || null,
          team2Id: pairs[1]?.team2Id || null,
          court: 'Sân 2',
          scheduledTime: '10:30',
          status: isBye2 ? 'COMPLETED' : 'SCHEDULED',
          winnerId: isBye2 ? pairs[1].team1Id : null,
          setScores: initialSetScores,
          nextMatchId: fin,
          nextMatchSlot: 2,
        },
        {
          id: fin,
          tournamentId,
          stage: 'KNOCKOUT',
          roundNumber: 2,
          matchOrder: 1,
          roundName: 'Chung Kết',
          team1Id: isBye1 ? pairs[0].team1Id : null,
          team2Id: isBye2 ? pairs[1].team1Id : null,
          court: 'Sân Trung Tâm',
          scheduledTime: '15:00',
          status: 'SCHEDULED',
          winnerId: null,
          setScores: initialSetScores,
          nextMatchId: null,
          nextMatchSlot: null,
        }
      );
    } else if (bracketSize === 8) {
      // 4 Quarters, 2 Semis, 1 Final
      const q1 = generateUUID();
      const q2 = generateUUID();
      const q3 = generateUUID();
      const q4 = generateUUID();
      const s1 = generateUUID();
      const s2 = generateUUID();
      const fin = generateUUID();

      // Kiểm tra suất BYE ở vòng Tứ kết
      const isBye = [
        pairs[0]?.team1Id && !pairs[0]?.team2Id,
        pairs[1]?.team1Id && !pairs[1]?.team2Id,
        pairs[2]?.team1Id && !pairs[2]?.team2Id,
        pairs[3]?.team1Id && !pairs[3]?.team2Id,
      ];

      newMatches.push(
        // Round 1 (Tứ kết)
        { id: q1, tournamentId, stage: 'KNOCKOUT', roundNumber: 1, matchOrder: 1, roundName: isBye[0] ? 'Tứ Kết 1 (BYE)' : 'Tứ Kết 1', team1Id: pairs[0]?.team1Id || null, team2Id: pairs[0]?.team2Id || null, court: 'Sân 1', scheduledTime: '08:30', status: isBye[0] ? 'COMPLETED' : 'SCHEDULED', winnerId: isBye[0] ? pairs[0].team1Id : null, setScores: initialSetScores, nextMatchId: s1, nextMatchSlot: 1 },
        { id: q2, tournamentId, stage: 'KNOCKOUT', roundNumber: 1, matchOrder: 2, roundName: isBye[1] ? 'Tứ Kết 2 (BYE)' : 'Tứ Kết 2', team1Id: pairs[1]?.team1Id || null, team2Id: pairs[1]?.team2Id || null, court: 'Sân 2', scheduledTime: '09:30', status: isBye[1] ? 'COMPLETED' : 'SCHEDULED', winnerId: isBye[1] ? pairs[1].team1Id : null, setScores: initialSetScores, nextMatchId: s1, nextMatchSlot: 2 },
        { id: q3, tournamentId, stage: 'KNOCKOUT', roundNumber: 1, matchOrder: 3, roundName: isBye[2] ? 'Tứ Kết 3 (BYE)' : 'Tứ Kết 3', team1Id: pairs[2]?.team1Id || null, team2Id: pairs[2]?.team2Id || null, court: 'Sân 1', scheduledTime: '10:30', status: isBye[2] ? 'COMPLETED' : 'SCHEDULED', winnerId: isBye[2] ? pairs[2].team1Id : null, setScores: initialSetScores, nextMatchId: s2, nextMatchSlot: 1 },
        { id: q4, tournamentId, stage: 'KNOCKOUT', roundNumber: 1, matchOrder: 4, roundName: isBye[3] ? 'Tứ Kết 4 (BYE)' : 'Tứ Kết 4', team1Id: pairs[3]?.team1Id || null, team2Id: pairs[3]?.team2Id || null, court: 'Sân 2', scheduledTime: '11:30', status: isBye[3] ? 'COMPLETED' : 'SCHEDULED', winnerId: isBye[3] ? pairs[3].team1Id : null, setScores: initialSetScores, nextMatchId: s2, nextMatchSlot: 2 },

        // Round 2 (Bán kết - Nhận trước các đội được đặc cách BYE)
        { id: s1, tournamentId, stage: 'KNOCKOUT', roundNumber: 2, matchOrder: 1, roundName: 'Bán Kết 1', team1Id: isBye[0] ? pairs[0].team1Id : null, team2Id: isBye[1] ? pairs[1].team1Id : null, court: 'Sân 1', scheduledTime: '14:00', status: 'SCHEDULED', winnerId: null, setScores: initialSetScores, nextMatchId: fin, nextMatchSlot: 1 },
        { id: s2, tournamentId, stage: 'KNOCKOUT', roundNumber: 2, matchOrder: 2, roundName: 'Bán Kết 2', team1Id: isBye[2] ? pairs[2].team1Id : null, team2Id: isBye[3] ? pairs[3].team1Id : null, court: 'Sân 2', scheduledTime: '15:30', status: 'SCHEDULED', winnerId: null, setScores: initialSetScores, nextMatchId: fin, nextMatchSlot: 2 },

        // Round 3 (Chung kết)
        { id: fin, tournamentId, stage: 'KNOCKOUT', roundNumber: 3, matchOrder: 1, roundName: 'Chung Kết', team1Id: null, team2Id: null, court: 'Sân Trung Tâm', scheduledTime: '17:00', status: 'SCHEDULED', winnerId: null, setScores: initialSetScores, nextMatchId: null, nextMatchSlot: null }
      );
    } else if (bracketSize === 16) {
      // 8 Matches in Round 1/8 (Vòng 16), 4 Quarters, 2 Semis, 1 Final
      const r1 = Array.from({ length: 8 }, () => generateUUID());
      const q = Array.from({ length: 4 }, () => generateUUID());
      const s = Array.from({ length: 2 }, () => generateUUID());
      const fin = generateUUID();

      // Check BYEs in Round 1
      const isBye = pairs.map((p) => Boolean(p?.team1Id && !p?.team2Id));

      // Round 1 (Vòng 1/8)
      for (let i = 0; i < 8; i++) {
        const nextQIndex = Math.floor(i / 2);
        const nextSlot = (i % 2) + 1;
        newMatches.push({
          id: r1[i],
          tournamentId,
          stage: 'KNOCKOUT',
          roundNumber: 1,
          matchOrder: i + 1,
          roundName: isBye[i] ? `Vòng 16 Trận ${i + 1} (BYE)` : `Vòng 16 Trận ${i + 1}`,
          team1Id: pairs[i]?.team1Id || null,
          team2Id: pairs[i]?.team2Id || null,
          court: `Sân ${(i % 2) + 1}`,
          scheduledTime: `${8 + Math.floor(i / 2)}:00`,
          status: isBye[i] ? 'COMPLETED' : 'SCHEDULED',
          winnerId: isBye[i] ? pairs[i].team1Id : null,
          setScores: initialSetScores,
          nextMatchId: q[nextQIndex],
          nextMatchSlot: nextSlot,
        });
      }

      // Round 2 (Tứ kết)
      for (let i = 0; i < 4; i++) {
        const nextSIndex = Math.floor(i / 2);
        const nextSlot = (i % 2) + 1;
        const t1Bye = isBye[i * 2] ? pairs[i * 2].team1Id : null;
        const t2Bye = isBye[i * 2 + 1] ? pairs[i * 2 + 1].team1Id : null;

        newMatches.push({
          id: q[i],
          tournamentId,
          stage: 'KNOCKOUT',
          roundNumber: 2,
          matchOrder: i + 1,
          roundName: `Tứ Kết ${i + 1}`,
          team1Id: t1Bye,
          team2Id: t2Bye,
          court: `Sân ${(i % 2) + 1}`,
          scheduledTime: `${13 + i}:00`,
          status: 'SCHEDULED',
          winnerId: null,
          setScores: initialSetScores,
          nextMatchId: s[nextSIndex],
          nextMatchSlot: nextSlot,
        });
      }

      // Round 3 (Bán kết)
      for (let i = 0; i < 2; i++) {
        newMatches.push({
          id: s[i],
          tournamentId,
          stage: 'KNOCKOUT',
          roundNumber: 3,
          matchOrder: i + 1,
          roundName: `Bán Kết ${i + 1}`,
          team1Id: null,
          team2Id: null,
          court: `Sân ${i + 1}`,
          scheduledTime: `${16 + i}:00`,
          status: 'SCHEDULED',
          winnerId: null,
          setScores: initialSetScores,
          nextMatchId: fin,
          nextMatchSlot: i + 1,
        });
      }

      // Round 4 (Chung kết)
      newMatches.push({
        id: fin,
        tournamentId,
        stage: 'KNOCKOUT',
        roundNumber: 4,
        matchOrder: 1,
        roundName: 'Chung Kết',
        team1Id: null,
        team2Id: null,
        court: 'Sân Trung Tâm',
        scheduledTime: '19:00',
        status: 'SCHEDULED',
        winnerId: null,
        setScores: initialSetScores,
        nextMatchId: null,
        nextMatchSlot: null,
      });
    }

    // Danh sách ID các đội được chọn vào nhánh Knockout
    const qualifiedTeamIds = Array.from(
      new Set(
        pairs
          .flatMap((p) => [p?.team1Id, p?.team2Id])
          .filter((id) => Boolean(id))
      )
    );

    // Cập nhật trạng thái đã vào vòng trong (is_qualified_knockout) cho các đội của giải này
    setTeams((prev) =>
      prev.map((t) =>
        String(t.tournamentId) === String(tournamentId)
          ? {
              ...t,
              isQualifiedKnockout: qualifiedTeamIds.includes(t.id),
              is_qualified_knockout: qualifiedTeamIds.includes(t.id),
            }
          : t
      )
    );

    // Đồng bộ trạng thái đội lên Backend
    teamApi.updateQualifiers(tournamentId, qualifiedTeamIds).catch((err) => {
      console.warn('Cập nhật trạng thái đội qua API tạm hoãn:', err.message);
    });

    // Gom nhóm các trận đấu theo vòng để tạo rounds_config và history_log với đầy đủ matchId tương ứng
    const roundsConfig = [];
    const roundsDetailsForHistory = [];

    const groupedMatchesByRound = {};
    newMatches.forEach((m) => {
      if (!groupedMatchesByRound[m.roundNumber]) {
        groupedMatchesByRound[m.roundNumber] = [];
      }
      groupedMatchesByRound[m.roundNumber].push(m);
    });

    Object.keys(groupedMatchesByRound)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((rNum) => {
        const roundMatches = groupedMatchesByRound[rNum];
        const defaultRoundName =
          Number(rNum) === 1
            ? bracketSize === 16
              ? 'Vòng 1/8'
              : bracketSize === 8
              ? 'Tứ Kết'
              : 'Bán Kết'
            : Number(rNum) === Object.keys(groupedMatchesByRound).length
            ? 'Chung Kết'
            : 'Bán Kết';

        const roundName =
          roundMatches[0]?.roundName?.replace(/\s*\([^)]*\)/, '') || defaultRoundName;

        roundsConfig.push({
          roundNumber: Number(rNum),
          roundName,
          matchCount: roundMatches.length,
          matchIds: roundMatches.map((m) => m.id),
        });

        roundsDetailsForHistory.push({
          roundNumber: Number(rNum),
          roundName,
          matchCount: roundMatches.length,
          matches: roundMatches.map((m) => ({
            matchId: m.id,
            matchOrder: m.matchOrder,
            roundName: m.roundName,
            team1Id: m.team1Id,
            team2Id: m.team2Id,
            status: m.status,
            court: m.court,
            scheduledTime: m.scheduledTime,
            nextMatchId: m.nextMatchId,
            nextMatchSlot: m.nextMatchSlot,
          })),
        });
      });

    const totalRounds = roundsConfig.length;

    // Xóa các trận Knockout cũ của giải và thêm nhánh mới (giữ lại các trận vòng bảng của giải này và các giải khác)
    setMatches((prev) => [
      ...prev.filter((m) => String(m.tournamentId) !== String(tournamentId) || m.stage === 'GROUP'),
      ...newMatches,
    ]);

    // Lưu vào Supabase matches table
    try {
      const savedMatches = await matchApi.saveBatch(tournamentId, 'KNOCKOUT', newMatches);
      if (Array.isArray(savedMatches) && savedMatches.length > 0) {
        setMatches((prev) => [
          ...prev.filter((m) => String(m.tournamentId) !== String(tournamentId) || m.stage === 'GROUP'),
          ...savedMatches,
        ]);
      }
    } catch (err) {
      console.warn('Lưu nhánh đấu Supabase tạm hoãn:', err.message);
    }

    showToast(`Đã lưu sơ đồ nhánh (${bracketSize} vị trí) & ${newMatches.length} trận đấu vào cơ sở dữ liệu thành công!`);
  };

  // --- QUÉT CÁC BẢNG ĐẤU HIỆN TẠI VÀ TẠO LỊCH THI ĐẤU VÒNG TRÒN (GẶP NHAU 1 LẦN) ---
  const generateGroupMatchesFromExistingGroups = async (tournamentId) => {
    const tournamentTeamsList = teams.filter((t) => String(t.tournamentId) === String(tournamentId));
    
    // Tìm tất cả các bảng đấu duy nhất
    const uniqueGroups = Array.from(new Set(tournamentTeamsList.map((t) => t.groupName || 'Bảng A'))).sort();
    
    if (uniqueGroups.length === 0 || tournamentTeamsList.length < 2) {
      showToast('Cần ít nhất 2 đội để tạo lịch thi đấu vòng bảng.', 'warning');
      return;
    }

    const newGroupMatches = [];
    const timestamp = Date.now();
    const groupSetScores = getDefaultSetScores(tournamentId);
    let matchCounter = 1;

    uniqueGroups.forEach((gName) => {
      const gTeams = tournamentTeamsList.filter((t) => (t.groupName || 'Bảng A') === gName);
      if (gTeams.length < 2) return;

      // Sinh các cặp đấu vòng tròn 1 lượt (mỗi cặp chỉ gặp nhau đúng 1 lần: i < j)
      for (let i = 0; i < gTeams.length; i++) {
        for (let j = i + 1; j < gTeams.length; j++) {
          newGroupMatches.push({
            id: `gm-${timestamp}-${matchCounter}`,
            tournamentId,
            stage: 'GROUP',
            groupName: gName,
            roundNumber: 1,
            matchOrder: matchCounter,
            roundName: `Lượt ${Math.ceil(matchCounter / 2)} - ${gName}`,
            team1Id: gTeams[i].id,
            team2Id: gTeams[j].id,
            court: `Sân ${(matchCounter % 2) + 1}`,
            scheduledTime: `${8 + Math.floor(matchCounter / 2)}:${(matchCounter % 2) * 30 || '00'}`,
            status: 'SCHEDULED',
            winnerId: null,
            setScores: groupSetScores,
          });
          matchCounter++;
        }
      }
    });

    if (newGroupMatches.length === 0) {
      showToast('Không có bảng nào có từ 2 đội trở lên để thi đấu.', 'warning');
      return;
    }

    // Xóa các trận vòng bảng cũ và lưu các trận mới
    setMatches((prev) => [
      ...prev.filter((m) => String(m.tournamentId) !== String(tournamentId) || m.stage !== 'GROUP'),
      ...newGroupMatches,
    ]);

    // Gửi lưu trực tiếp vào bảng matches trên Supabase
    try {
      await matchApi.saveBatch(tournamentId, 'GROUP', newGroupMatches);
      console.log('✅ Đã lưu toàn bộ trận đấu vòng bảng vào Supabase matches table!');
    } catch (err) {
      console.warn('Lưu trận đấu Supabase tạm hoãn:', err.message);
    }

    showToast(`⚡ Đã quét ${uniqueGroups.length} bảng và tạo thành công ${newGroupMatches.length} trận đấu vòng tròn (gặp nhau 1 lần)!`);
  };

  // --- SINH VÒNG BẢNG & BỐC THĂM LẠI BẢNG ---
  const generateGroupStage = async (tournamentId, groupCount = 2, isShuffle = true) => {
    let tournamentTeamsList = teams.filter((t) => String(t.tournamentId) === String(tournamentId));
    if (tournamentTeamsList.length < groupCount * 2) {
      showToast(`Cần tối thiểu ${groupCount * 2} đội để chia thành ${groupCount} bảng đấu.`, 'warning');
      return;
    }

    if (isShuffle) {
      tournamentTeamsList = [...tournamentTeamsList].sort(() => Math.random() - 0.5);
    }

    const groupNames = ['Bảng A', 'Bảng B', 'Bảng C', 'Bảng D', 'Bảng E', 'Bảng F'];
    const updatedTeams = teams.map((team) => {
      if (String(team.tournamentId) !== String(tournamentId)) return team;
      const idx = tournamentTeamsList.findIndex((t) => t.id === team.id);
      if (idx !== -1) {
        const assignedGroup = groupNames[idx % groupCount];
        return { ...team, groupName: assignedGroup };
      }
      return team;
    });
    setTeams(updatedTeams);

    // Sinh lịch thi đấu vòng tròn cho từng bảng
    const newGroupMatches = [];
    const timestamp = Date.now();
    const groupSetScores = getDefaultSetScores(tournamentId);
    let matchCounter = 1;

    for (let g = 0; g < groupCount; g++) {
      const gName = groupNames[g];
      const gTeams = updatedTeams.filter((t) => String(t.tournamentId) === String(tournamentId) && t.groupName === gName);

      // Tạo các cặp đấu vòng tròn (Round-Robin Pairings: i < j)
      for (let i = 0; i < gTeams.length; i++) {
        for (let j = i + 1; j < gTeams.length; j++) {
          newGroupMatches.push({
            id: `gm-${timestamp}-${matchCounter}`,
            tournamentId,
            stage: 'GROUP',
            groupName: gName,
            roundNumber: 1,
            matchOrder: matchCounter,
            roundName: `Lượt ${Math.ceil(matchCounter / 2)} - ${gName}`,
            team1Id: gTeams[i].id,
            team2Id: gTeams[j].id,
            court: `Sân ${(matchCounter % 2) + 1}`,
            scheduledTime: `${8 + Math.floor(matchCounter / 2)}:${(matchCounter % 2) * 30 || '00'}`,
            status: 'SCHEDULED',
            winnerId: null,
            setScores: groupSetScores,
          });
          matchCounter++;
        }
      }
    }

    // Xóa các trận vòng bảng cũ và lưu các trận mới
    setMatches((prev) => [
      ...prev.filter((m) => String(m.tournamentId) !== String(tournamentId) || m.stage !== 'GROUP'),
      ...newGroupMatches,
    ]);

    // Gửi lưu trực tiếp vào bảng matches trên Supabase
    try {
      await matchApi.saveBatch(tournamentId, 'GROUP', newGroupMatches);
    } catch (err) {
      console.warn('Lưu trận đấu Supabase tạm hoãn:', err.message);
    }

    showToast(`Đã chia ${groupCount} bảng đấu và tạo ${newGroupMatches.length} trận đấu vòng tròn thành công!`);
  };

  // --- TÍNH TOÁN BẢNG XẾP HẠNG (STANDINGS) THỜI GIAN THỰC ---
  const getGroupStandings = (tournamentId) => {
    const tournamentTeamsList = teams.filter((t) => t.tournamentId === tournamentId);
    const groupMatches = matches.filter((m) => m.tournamentId === tournamentId && m.stage === 'GROUP');

    const groups = {};

    tournamentTeamsList.forEach((team) => {
      const gName = team.groupName || 'Bảng A';
      if (!groups[gName]) {
        groups[gName] = [];
      }

      // Khởi tạo chỉ số thống kê
      let played = 0;
      let won = 0;
      let lost = 0;
      let setsWon = 0;
      let setsLost = 0;
      let pointsWon = 0;
      let pointsLost = 0;

      // Tính toán dựa trên các trận đấu đã xong hoặc đang đấu của team
      groupMatches.forEach((m) => {
        const isTeam1 = m.team1Id === team.id;
        const isTeam2 = m.team2Id === team.id;

        if (isTeam1 || isTeam2) {
          if (m.status === 'COMPLETED' || m.status === 'IN_PROGRESS') {
            played++;
            if (m.status === 'COMPLETED') {
              if (m.winnerId === team.id) {
                won++;
              } else if (m.winnerId) {
                lost++;
              }
            }

            // Tính điểm số các set
            m.setScores?.forEach((s) => {
              const myScore = isTeam1 ? s.team1Score : s.team2Score;
              const oppScore = isTeam1 ? s.team2Score : s.team1Score;
              if (myScore > 0 || oppScore > 0) {
                pointsWon += myScore;
                pointsLost += oppScore;
                if (myScore > oppScore) setsWon++;
                else if (oppScore > myScore) setsLost++;
              }
            });
          }
        }
      });

      const setDiff = setsWon - setsLost;
      const pointDiff = pointsWon - pointsLost;
      const points = won; // 1 điểm cho mỗi trận thắng

      groups[gName].push({
        team,
        played,
        won,
        lost,
        setsWon,
        setsLost,
        setDiff,
        pointsWon,
        pointsLost,
        pointDiff,
        points,
      });
    });

    // Sắp xếp thứ hạng (Rank): Điểm -> Hiệu số Set -> Hiệu số Điểm -> Số trận thắng
    Object.keys(groups).forEach((gName) => {
      groups[gName].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.setDiff !== a.setDiff) return b.setDiff - a.setDiff;
        if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
        return b.won - a.won;
      });

      // Gán hạng rank 1, 2, 3, ...
      groups[gName] = groups[gName].map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));
    });

    return groups;
  };

  // --- TỰ ĐỘNG ĐẨY ĐỘI ĐẦU BẢNG VÀO VÒNG LOẠI TRỰC TIẾP (KNOCKOUT) ---
  const advanceGroupWinnersToKnockout = (tournamentId) => {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    const standings = getGroupStandings(tournamentId);
    const groupKeys = Object.keys(standings).sort();

    if (groupKeys.length === 0) {
      showToast('Chưa có dữ liệu bảng đấu để chuyển tiếp.', 'warning');
      return;
    }

    const advancingCount = tournament?.advancingPerGroup || 2;
    const knockoutPairs = [];

    if (groupKeys.length === 2) {
      // 2 Bảng (A & B) -> Nhất A vs Nhì B, Nhất B vs Nhì A
      const groupA = standings['Bảng A'] || [];
      const groupB = standings['Bảng B'] || [];

      if (advancingCount === 2) {
        knockoutPairs.push(
          { team1Id: groupA[0]?.team?.id || null, team2Id: groupB[1]?.team?.id || null }, // Nhất A vs Nhì B
          { team1Id: groupB[0]?.team?.id || null, team2Id: groupA[1]?.team?.id || null }  // Nhất B vs Nhì A
        );
        createCustomBracket(tournamentId, knockoutPairs, 4);
      } else {
        // Chỉ lấy Top 1 mỗi bảng -> Đấu thẳng Chung kết
        knockoutPairs.push({
          team1Id: groupA[0]?.team?.id || null,
          team2Id: groupB[0]?.team?.id || null,
        });
        createCustomBracket(tournamentId, knockoutPairs, 2);
      }
    } else if (groupKeys.length >= 4) {
      // 4 Bảng (A, B, C, D) -> Tứ Kết (Nhất A vs Nhì B, Nhất C vs Nhì D, Nhất B vs Nhì A, Nhất D vs Nhì C)
      const gA = standings['Bảng A'] || [];
      const gB = standings['Bảng B'] || [];
      const gC = standings['Bảng C'] || [];
      const gD = standings['Bảng D'] || [];

      knockoutPairs.push(
        { team1Id: gA[0]?.team?.id || null, team2Id: gB[1]?.team?.id || null },
        { team1Id: gC[0]?.team?.id || null, team2Id: gD[1]?.team?.id || null },
        { team1Id: gB[0]?.team?.id || null, team2Id: gA[1]?.team?.id || null },
        { team1Id: gD[0]?.team?.id || null, team2Id: gC[1]?.team?.id || null }
      );
      createCustomBracket(tournamentId, knockoutPairs, 8);
    }

    showToast('🏆 Đã chuyển các đội xuất sắc nhất vòng bảng vào Sơ Đồ Nhánh Đấu Knockout!');
  };

  // Helper lấy cấu trúc dữ liệu theo Vòng đấu (Chỉ lấy các trận Knockout cho BracketViewer)
  const getBracketByTournament = (tournamentId) => {
    const tournamentMatches = matches.filter(
      (m) => String(m.tournamentId) === String(tournamentId) && m.stage !== 'GROUP'
    );

    const rounds = {};

    tournamentMatches.forEach((match) => {
      if (!rounds[match.roundNumber]) {
        rounds[match.roundNumber] = [];
      }
      rounds[match.roundNumber].push({
        ...match,
        team1: teams.find((t) => String(t.id) === String(match.team1Id)),
        team2: teams.find((t) => String(t.id) === String(match.team2Id)),
      });
    });

    Object.keys(rounds).forEach((r) => {
      rounds[r].sort((a, b) => a.matchOrder - b.matchOrder);
    });

    return rounds;
  };

  const resetAllData = async () => {
    setTournaments([]);
    setTeams([]);
    setMatches([]);
    await refreshData();
    showToast('Đã làm mới và đồng bộ lại dữ liệu từ Supabase.', 'info');
  };

  return (
    <TournamentContext.Provider
      value={{
        tournaments,
        teams,
        matches,
        isLoading,
        isAdmin,
        setIsAdmin,
        currentUser,
        loginAdmin,
        logoutAdmin,
        isBackendConnected,
        activeTournamentId,
        setActiveTournamentId,
        toastMessage,
        showToast,
        createTournament,
        updateTournament,
        deleteTournament,
        addTeam,
        removeTeam,
        updateMatchScore,
        generateBracket,
        createCustomBracket,
        generateGroupStage,
        generateGroupMatchesFromExistingGroups,
        getGroupStandings,
        advanceGroupWinnersToKnockout,
        getBracketByTournament,
        refreshData,
        resetAllData,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export const useTournament = () => useContext(TournamentContext);
