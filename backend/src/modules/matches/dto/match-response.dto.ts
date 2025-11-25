export class MatchResponseDto {
  id: string;
  externalId: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamBadge?: string;
  awayTeamBadge?: string;
  league: string;
  season: string;
  dateEvent: Date;
  venue?: string;
  city?: string;
  country?: string;
  homeScore?: string;
  awayScore?: string;
  status?: string;
  weatherData?: any;
  aiAnalysis?: string;
  analyzedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}