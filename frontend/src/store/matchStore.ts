import { create } from 'zustand';
import { matchesApi, weatherApi, analysisApi } from '../services/api';
import type { Match, Weather, Analysis } from '../services/api';

interface MatchStore {
  matches: Match[];
  selectedMatch: Match | null;
  matchDetails: any | null;
  weather: Weather | null;
  analysis: Analysis | null;
  loading: boolean;
  error: string | null;
  league: 'spanish' | 'mls';

  setLeague: (league: 'spanish' | 'mls') => void;
  fetchMatches: () => Promise<void>;
  selectMatch: (match: Match) => void;
  fetchWeather: (city: string) => Promise<void>;
  fetchAnalysis: (matchId: string) => Promise<void>;
  clearSelection: () => void;
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  matches: [],
  selectedMatch: null,
  matchDetails: null,
  weather: null,
  analysis: null,
  loading: false,
  error: null,
  league: 'spanish',

  setLeague: (league) => {
    set({ league, matches: [], selectedMatch: null, weather: null, analysis: null });
    get().fetchMatches();
  },

  fetchMatches: async () => {
    set({ loading: true, error: null });
    try {
      const response = await matchesApi.getAll(get().league);
      set({ matches: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  selectMatch: async (match) => {
  set({ selectedMatch: match, weather: null, analysis: null, matchDetails: null });
  try {
    const response = await matchesApi.getDetails(match.id);
    set({ matchDetails: response.data });
  } catch (error) {
    console.error('Error fetching match details:', error);
  }
},

  fetchWeather: async (city) => {
    try {
      const response = await weatherApi.get(city);
      set({ weather: response.data });
    } catch (error: any) {
      console.error('Weather fetch error:', error.message);
    }
  },

  fetchAnalysis: async (matchId) => {
    try {
      const weather = get().weather;
      const response = await analysisApi.create(matchId, weather ? {
        temperature: weather.temperature,
        windSpeed: weather.windSpeed,
        humidity: weather.humidity,
        conditions: weather.conditions,
      } : undefined);
      set({ analysis: response.data });
    } catch (error: any) {
      console.error('Analysis fetch error:', error.message);
    }
  },

  clearSelection: () => {
  set({ selectedMatch: null, weather: null, analysis: null, matchDetails: null });
},
}));