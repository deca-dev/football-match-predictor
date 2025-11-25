export class AnalysisResponseDto {
  id: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  analysis: string;
  temperature?: number;
  windSpeed?: number;
  weatherCondition?: string;
  model: string;
  createdAt: Date;
}