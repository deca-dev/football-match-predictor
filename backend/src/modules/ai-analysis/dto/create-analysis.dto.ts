import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateAnalysisDto {
  @IsString()
  matchId: string;

  @IsOptional()
  @IsObject()
  weatherData?: {
    temperature: number;
    windSpeed: number;
    humidity: number;
    conditions: string;
  };
}