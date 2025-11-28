import { IsString, IsOptional } from 'class-validator';

export class AddFavoriteDto {
  @IsString()
  teamName: string;

  @IsString()
  @IsOptional()
  teamBadge?: string;

  @IsString()
  league: string;

  @IsString()
  @IsOptional()
  teamId?: string;

  @IsString()
  @IsOptional()
  stadium?: string;

  @IsString()
  @IsOptional()
  stadiumCapacity?: string;

  @IsString()
  @IsOptional()
  foundedYear?: string;

  @IsString()
  @IsOptional()
  teamDescription?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  twitter?: string;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  facebook?: string;
}
