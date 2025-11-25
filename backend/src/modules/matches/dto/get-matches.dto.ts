import { IsEnum, IsOptional, IsDateString } from 'class-validator';

export class GetMatchesDto {
  @IsEnum(['spanish', 'mls'], {
    message: 'league must be either spanish or mls',
  })
  league: 'spanish' | 'mls';

  @IsOptional()
  @IsDateString()
  date?: string; 

  @IsOptional()
  season?: string; 
}