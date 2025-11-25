import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Match } from '../database/entities';
import { GetMatchesDto } from './dto';

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);
  private readonly sportsApiKey: string;
  private readonly sportsApiBaseUrl: string;

  private readonly leagueIds = {
    spanish: '4335',
    mls: '4346',
  };

  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    private configService: ConfigService,
  ) {
    this.sportsApiKey = this.configService.get<string>('apis.sports.key') || '3';
    this.sportsApiBaseUrl = this.configService.get<string>('apis.sports.baseUrl') || 'https://www.thesportsdb.com/api/v1/json';
  }

  async findAll(query: GetMatchesDto): Promise<Match[]> {
    const { league, season } = query;
    const currentSeason = season || this.getCurrentSeason(league);

    this.logger.log(`Fetching matches for ${league} - season ${currentSeason}`);

    // Check cache first
    const cachedMatches = await this.matchRepository.find({
      where: { league, season: currentSeason },
      order: { dateEvent: 'ASC' },
      take: 50,
    });

    if (cachedMatches.length > 0) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (cachedMatches[0].updatedAt > oneHourAgo) {
        this.logger.log(`Returning ${cachedMatches.length} cached matches`);
        return cachedMatches;
      }
    }

    // Fetch from API
    try {
      const matches = await this.fetchMatchesFromAPI(league, currentSeason);
      this.logger.log(`Fetched ${matches.length} matches from API`);
      await this.saveMatches(matches);
      return matches;
    } catch (error) {
      this.logger.error(`Error fetching matches: ${error.message}`);
      if (cachedMatches.length > 0) {
        return cachedMatches;
      }
      throw error;
    }
  }

  async findOne(id: string): Promise<Match> {
    const match = await this.matchRepository.findOne({ where: { id } });
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    return match;
  }

  private async fetchMatchesFromAPI(league: string, season: string): Promise<Match[]> {
    const leagueId = this.leagueIds[league];
    const url = `${this.sportsApiBaseUrl}/${this.sportsApiKey}/eventsseason.php`;

    const response = await axios.get(url, {
      params: { id: leagueId, s: season },
    });

    if (!response.data?.events) {
      return [];
    }

    return response.data.events.map((event: any) => {
      const match = new Match();
      match.externalId = event.idEvent;
      match.homeTeam = event.strHomeTeam;
      match.awayTeam = event.strAwayTeam;
      match.homeTeamBadge = event.strHomeTeamBadge;
      match.awayTeamBadge = event.strAwayTeamBadge;
      match.league = league;
      match.season = season;
      match.dateEvent = new Date(event.dateEvent + 'T' + (event.strTime || '00:00:00'));
      match.venue = event.strVenue;
      match.city = event.strCity || this.getCityForTeam(event.strHomeTeam);
      match.country = event.strCountry;
      match.homeScore = event.intHomeScore;
      match.awayScore = event.intAwayScore;
      match.status = event.strStatus;
      return match;
    });
  }

  private async saveMatches(matches: Match[]): Promise<void> {
    for (const match of matches) {
      const existing = await this.matchRepository.findOne({
        where: { externalId: match.externalId },
      });

      if (existing) {
        await this.matchRepository.update(existing.id, match);
      } else {
        await this.matchRepository.save(match);
      }
    }
  }

  private getCurrentSeason(league: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    if (league === 'spanish') {
      return month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    }
    return year.toString();
  }

  private getCityForTeam(teamName: string): string {
    const cityMap: { [key: string]: string } = {
      'Real Madrid': 'Madrid',
      'Barcelona': 'Barcelona',
      'Atletico Madrid': 'Madrid',
      'Sevilla': 'Sevilla',
      'LA Galaxy': 'Los Angeles',
      'LAFC': 'Los Angeles',
    };
    return cityMap[teamName] || '';
  }
}