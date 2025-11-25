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

export default api;