import { IsString, IsOptional, IsNumber } from 'class-validator';

export class GetWeatherDto {
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  country?: string;
}