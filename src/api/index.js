import { apiClient } from './client';

export const tournamentApi = {
  getAll: (status) => apiClient.get('/tournaments', { params: { status } }),
  getById: (id) => apiClient.get(`/tournaments/${id}`),
  create: (data) => apiClient.post('/tournaments', data),
  update: (id, data) => apiClient.patch(`/tournaments/${id}`, data),
  delete: (id) => apiClient.delete(`/tournaments/${id}`),
};

export const teamApi = {
  getAll: () => apiClient.get('/teams'),
  getByTournament: (tournamentId) => apiClient.get(`/teams/tournament/${tournamentId}`),
  create: (data) => apiClient.post('/teams', data),
  update: (id, data) => apiClient.patch(`/teams/${id}`, data),
  updateQualifiers: (tournamentId, qualifiedTeamIds) => apiClient.post(`/teams/tournament/${tournamentId}/qualify`, { qualifiedTeamIds }),
  delete: (id) => apiClient.delete(`/teams/${id}`),
};

export const matchApi = {
  getAll: () => apiClient.get('/matches'),
  getByTournament: (tournamentId) => apiClient.get(`/matches/tournament/${tournamentId}`),
  getBracket: (tournamentId) => apiClient.get(`/matches/tournament/${tournamentId}/bracket`),
  saveBatch: (tournamentId, stage, matches) => apiClient.post('/matches/batch', { tournamentId, stage, matches }),
  updateScore: (id, setScores, winnerId, status) => apiClient.patch(`/matches/${id}/score`, { setScores, winnerId, status }),
};

export const authApi = {
  login: (username, password) => apiClient.post('/auth/login', { username, password }),
};
