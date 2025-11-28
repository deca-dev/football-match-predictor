import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Favorite } from '../database/entities';
import { AddFavoriteDto } from './dto';

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);
  private readonly sportsApiUrl = 'https://www.thesportsdb.com/api/v1/json/3';

  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async addFavorite(userId: string, dto: AddFavoriteDto): Promise<Favorite> {
    // Check if already favorited
    const existing = await this.favoriteRepository.findOne({
      where: { userId, teamName: dto.teamName },
    });

    if (existing) {
      return existing;
    }

    // Fetch team details from TheSportsDB if not provided
    let teamData = { ...dto };
    if (!dto.stadium || !dto.teamId) {
      const fetchedData = await this.fetchTeamData(dto.teamName);
      if (fetchedData) {
        teamData = { ...dto, ...fetchedData };
      }
    }

    const favorite = this.favoriteRepository.create({
      userId,
      teamName: teamData.teamName,
      teamBadge: teamData.teamBadge,
      league: teamData.league,
      teamId: teamData.teamId,
      stadium: teamData.stadium,
      stadiumCapacity: teamData.stadiumCapacity,
      foundedYear: teamData.foundedYear,
      teamDescription: teamData.teamDescription,
      website: teamData.website,
      twitter: teamData.twitter,
      instagram: teamData.instagram,
      facebook: teamData.facebook,
    });

    return this.favoriteRepository.save(favorite);
  }

  async removeFavorite(userId: string, teamName: string): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, teamName },
    });

    if (!favorite) {
      throw new NotFoundException('Favorito no encontrado');
    }

    await this.favoriteRepository.remove(favorite);
  }

  async getTeamNextMatch(teamId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.sportsApiUrl}/eventsnext.php?id=${teamId}`,
      );
      const events = response.data.events;
      return events ? events[0] : null;
    } catch (error) {
      this.logger.error(`Error fetching next match for team ${teamId}`, error);
      return null;
    }
  }

  async getTeamLastMatches(teamId: string, count: number = 5): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.sportsApiUrl}/eventslast.php?id=${teamId}`,
      );
      const events = response.data.results;
      return events ? events.slice(0, count) : [];
    } catch (error) {
      this.logger.error(`Error fetching last matches for team ${teamId}`, error);
      return [];
    }
  }

  private async fetchTeamData(teamName: string): Promise<Partial<AddFavoriteDto> | null> {
    try {
      const response = await axios.get(
        `${this.sportsApiUrl}/searchteams.php?t=${encodeURIComponent(teamName)}`,
      );

      const teams = response.data.teams;
      if (!teams || teams.length === 0) {
        this.logger.warn(`Team not found: ${teamName}`);
        return null;
      }

      const team = teams[0];
      return {
        teamId: team.idTeam,
        teamBadge: team.strBadge,
        stadium: team.strStadium,
        stadiumCapacity: team.intStadiumCapacity,
        foundedYear: team.intFormedYear,
        teamDescription: team.strDescriptionES || team.strDescriptionEN,
        website: team.strWebsite,
        twitter: team.strTwitter,
        instagram: team.strInstagram,
        facebook: team.strFacebook,
      };
    } catch (error) {
      this.logger.error(`Error fetching team data for ${teamName}`, error);
      return null;
    }
  }
}