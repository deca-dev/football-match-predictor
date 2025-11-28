import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto } from './dto';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('favorites')
@UseGuards(JwtGuard)
export class FavoritesController {
  private readonly logger = new Logger(FavoritesController.name);

  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async getUserFavorites(@Req() req: any) {
    const userId = req.user.sub;
    this.logger.log(`GET /favorites - userId: ${userId}`);
    return this.favoritesService.getUserFavorites(userId);
  }

  @Post()
  async addFavorite(@Req() req: any, @Body() dto: AddFavoriteDto) {
    const userId = req.user.sub;
    this.logger.log(
      `POST /favorites - userId: ${userId}, team: ${dto.teamName}`,
    );
    return this.favoritesService.addFavorite(userId, dto);
  }

  @Delete(':teamName')
  async removeFavorite(@Req() req: any, @Param('teamName') teamName: string) {
    const userId = req.user.sub;
    this.logger.log(`DELETE /favorites/${teamName} - userId: ${userId}`);
    return this.favoritesService.removeFavorite(userId, teamName);
  }
  @Get(':teamId/next-match')
  async getTeamNextMatch(@Req() req: any, @Param('teamId') teamId: string) {
    this.logger.log(`GET /favorites/${teamId}/next-match`);
    return this.favoritesService.getTeamNextMatch(teamId);
  }

  @Get(':teamId/last-matches')
  async getTeamLastMatches(@Req() req: any, @Param('teamId') teamId: string) {
    this.logger.log(`GET /favorites/${teamId}/last-matches`);
    return this.favoritesService.getTeamLastMatches(teamId);
  }
}
