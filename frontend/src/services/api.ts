import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Match {
  id: string;
  externalId: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamBadge?: string;
  awayTeamBadge?: string;
  league: string;
  season: string;
  dateEvent: string;
  venue?: string;
  city?: string;
  homeScore?: string;
  awayScore?: string;
  status?: string;
  weatherData?: any;
  aiAnalysis?: string;
}

export interface Weather {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  conditions: string;
}

export interface Analysis {
  id: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  analysis: string;
  temperature?: number;
  windSpeed?: number;
  weatherCondition?: string;
  model: string;
  createdAt: string;
}

export const matchesApi = {
  getAll: (league: 'spanish' | 'mls') => 
    api.get<Match[]>(`/matches?league=${league}`),
  
  getOne: (id: string) => 
    api.get<Match>(`/matches/${id}`),

  getDetails: (id: string) =>
    api.get<any>(`/matches/${id}/details`),
};

export const weatherApi = {
  get: (city: string) => 
    api.get<Weather>(`/weather?city=${city}`),
};

export const analysisApi = {
  create: (matchId: string, weatherData?: any) => 
    api.post<Analysis>('/ai-analysis', { matchId, weatherData }),
  
  get: (matchId: string) => 
    api.get<Analysis>(`/ai-analysis/${matchId}`),
};

export const authApi = {
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

export const favoritesApi = {
  getAll: (token: string) =>
    api.get('/favorites', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  add: (token: string, teamName: string, teamBadge: string, league: string) =>
    api.post('/favorites', { teamName, teamBadge, league }, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  remove: (token: string, teamName: string) =>
    api.delete(`/favorites/${encodeURIComponent(teamName)}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getNextMatch: (token: string, teamId: string) =>
    api.get(`/favorites/${teamId}/next-match`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getLastMatches: (token: string, teamId: string) =>
    api.get(`/favorites/${teamId}/last-matches`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export default api;