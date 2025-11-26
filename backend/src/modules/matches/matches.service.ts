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
  private readonly leagueNextUrl = 'eventsnextleague.php';

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
      order: { dateEvent: 'DESC' },
      take: 100,
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
    const baseUrl = `${this.sportsApiBaseUrl}/${this.sportsApiKey}`;

    this.logger.log(`Fetching matches for league ${leagueId}, season ${season}`);

    const allMatches: Match[] = [];

    // Fetch ALL SEASON matches
    try {
      const seasonResponse = await axios.get(`${baseUrl}/eventsseason.php`, {
        params: { id: leagueId, s: season },
      });
      if (seasonResponse.data?.events) {
        const seasonMatches = seasonResponse.data.events.map((event: any) => this.mapEventToMatch(event, league, season));
        allMatches.push(...seasonMatches);
        this.logger.log(`Fetched ${seasonMatches.length} season matches`);
      }
    } catch (error) {
      this.logger.warn(`Error fetching season matches: ${error.message}`);
    }

    // Also fetch UPCOMING (for most recent data)
    try {
      const upcomingResponse = await axios.get(`${baseUrl}/eventsnextleague.php`, {
        params: { id: leagueId },
      });
      if (upcomingResponse.data?.events) {
        const upcoming = upcomingResponse.data.events.map((event: any) => this.mapEventToMatch(event, league, season));
        // Only add if not already in list
        for (const match of upcoming) {
          if (!allMatches.find(m => m.externalId === match.externalId)) {
            allMatches.push(match);
          }
        }
      }
    } catch (error) {
      this.logger.warn(`Error fetching upcoming matches: ${error.message}`);
    }

    // Sort by date (newest first)
    allMatches.sort((a, b) => new Date(b.dateEvent).getTime() - new Date(a.dateEvent).getTime());

    return allMatches;
  }

  private mapEventToMatch(event: any, league: string, season: string): Match {
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
    match.city = event.strCity || this.getCityFromVenue(event.strVenue) || this.getCityForTeam(event.strHomeTeam);
    match.country = event.strCountry;
    match.homeScore = event.intHomeScore;
    match.awayScore = event.intAwayScore;
    match.status = event.strStatus;
    return match;
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
      // La Liga
      'Real Madrid': 'Madrid',
      'Barcelona': 'Barcelona',
      'Atletico Madrid': 'Madrid',
      'Sevilla': 'Sevilla',
      'Valencia': 'Valencia',
      'Athletic Bilbao': 'Bilbao',
      'Real Sociedad': 'San Sebastian',
      'Real Betis': 'Sevilla',
      'Villarreal': 'Villarreal',
      'Getafe': 'Madrid',
      'Elche': 'Elche',
      'Celta Vigo': 'Vigo',
      'Osasuna': 'Pamplona',
      'Mallorca': 'Palma',
      'Girona': 'Girona',
      'Rayo Vallecano': 'Madrid',
      'Cadiz': 'Cadiz',
      'Almeria': 'Almeria',
      'Espanyol': 'Barcelona',
      'Deportivo Alaves': 'Vitoria',
      'Levante': 'Valencia',
      'Las Palmas': 'Las Palmas',
      'Leganes': 'Madrid',
      'Real Valladolid': 'Valladolid',
      // MLS
      'LA Galaxy': 'Los Angeles',
      'LAFC': 'Los Angeles',
      'Seattle Sounders': 'Seattle',
      'Portland Timbers': 'Portland',
      'New York Red Bulls': 'New York',
      'NYCFC': 'New York',
      'Atlanta United': 'Atlanta',
      'Inter Miami': 'Miami',
      'Austin FC': 'Austin',
      'FC Dallas': 'Dallas',
      'Houston Dynamo': 'Houston',
      'Sporting Kansas City': 'Kansas City',
      'Minnesota United': 'Minneapolis',
      'Chicago Fire': 'Chicago',
      'Columbus Crew': 'Columbus',
      'DC United': 'Washington',
      'Philadelphia Union': 'Philadelphia',
      'New England Revolution': 'Boston',
      'CF Montreal': 'Montreal',
      'Toronto FC': 'Toronto',
      'Vancouver Whitecaps': 'Vancouver',
      'Colorado Rapids': 'Denver',
      'Real Salt Lake': 'Salt Lake City',
      'San Jose Earthquakes': 'San Jose',
      'Charlotte FC': 'Charlotte',
      'Nashville SC': 'Nashville',
      'Orlando City': 'Orlando',
      'Cincinnati': 'Cincinnati',
      'St. Louis City': 'St. Louis',
    };
    return cityMap[teamName] || '';
  }

  private getCityFromVenue(venue: string): string {
    if (!venue) return '';

    const venueMap: { [key: string]: string } = {
      // La Liga Stadiums
      'Santiago Bernabeu': 'Madrid',
      'Camp Nou': 'Barcelona',
      'Metropolitano': 'Madrid',
      'Riyadh Air Metropolitano': 'Madrid',
      'Ramon Sanchez Pizjuan': 'Sevilla',
      'Mestalla': 'Valencia',
      'San Mames': 'Bilbao',
      'Reale Arena': 'San Sebastian',
      'Benito Villamarin': 'Sevilla',
      'Estadio de la Ceramica': 'Villarreal',
      'Coliseum Alfonso Perez': 'Madrid',
      'Coliseum': 'Madrid',
      'Estadio Coliseum': 'Madrid',
      'Martinez Valero': 'Elche',
      'Estadio Martinez Valero': 'Elche',
      'Balaidos': 'Vigo',
      'Estadio Abanca-Balaidos': 'Vigo',
      'El Sadar': 'Pamplona',
      'Estadio El Sadar': 'Pamplona',
      'Son Moix': 'Palma',
      'Estadi Mallorca Son Moix': 'Palma',
      'Montilivi': 'Girona',
      'Estadi Municipal de Montilivi': 'Girona',
      'Vallecas': 'Madrid',
      'Estadio de Vallecas': 'Madrid',
      'Nuevo Mirandilla': 'Cadiz',
      'Power Horse Stadium': 'Almeria',
      'RCDE Stadium': 'Barcelona',
      'Mendizorroza': 'Vitoria',
      'Estadio de Mendizorroza': 'Vitoria',
      'Ciudad de Valencia': 'Valencia',
      'Estadio Ciudad de Valencia': 'Valencia',
      'Gran Canaria': 'Las Palmas',
      'Butarque': 'Madrid',
      'Jose Zorrilla': 'Valladolid',
      'Estadio de La Cartuja': 'Sevilla',
      // MLS Stadiums
      'Dignity Health Sports Park': 'Los Angeles',
      'BMO Stadium': 'Los Angeles',
      'Lumen Field': 'Seattle',
      'Providence Park': 'Portland',
      'Red Bull Arena': 'New York',
      'Yankee Stadium': 'New York',
      'Mercedes-Benz Stadium': 'Atlanta',
      'Chase Stadium': 'Miami',
      'Q2 Stadium': 'Austin',
      'Toyota Stadium': 'Dallas',
      'Shell Energy Stadium': 'Houston',
      'Children Mercy Park': 'Kansas City',
      'Allianz Field': 'Minneapolis',
      'Soldier Field': 'Chicago',
      'Lower.com Field': 'Columbus',
      'Audi Field': 'Washington',
      'Subaru Park': 'Philadelphia',
      'Gillette Stadium': 'Boston',
      'Stade Saputo': 'Montreal',
      'BMO Field': 'Toronto',
      'BC Place': 'Vancouver',
      'Dicks Sporting Goods Park': 'Denver',
      'America First Field': 'Salt Lake City',
      'PayPal Park': 'San Jose',
      'Bank of America Stadium': 'Charlotte',
      'Geodis Park': 'Nashville',
      'Exploria Stadium': 'Orlando',
      'TQL Stadium': 'Cincinnati',
      'CityPark': 'St. Louis',
    };

    if (venueMap[venue]) return venueMap[venue];

    for (const [key, city] of Object.entries(venueMap)) {
      if (venue.toLowerCase().includes(key.toLowerCase())) {
        return city;
      }
    }

    return '';
  }

  async getMatchDetails(id: string): Promise<any> {
    const match = await this.matchRepository.findOne({ where: { id } });
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    const baseUrl = `${this.sportsApiBaseUrl}/${this.sportsApiKey}`;

    let homeTeamStats: any = null;
    let awayTeamStats: any = null;
    let headToHead: any[] = [];

    try {
      // Get team details
      const homeTeamRes = await axios.get(`${baseUrl}/searchteams.php`, {
        params: { t: match.homeTeam },
      });
      if (homeTeamRes.data?.teams?.[0]) {
        homeTeamStats = {
          id: homeTeamRes.data.teams[0].idTeam,
          name: homeTeamRes.data.teams[0].strTeam,
          stadium: homeTeamRes.data.teams[0].strStadium,
          stadiumCapacity: homeTeamRes.data.teams[0].intStadiumCapacity,
          founded: homeTeamRes.data.teams[0].intFormedYear,
          badge: homeTeamRes.data.teams[0].strBadge,
          description: homeTeamRes.data.teams[0].strDescriptionES || homeTeamRes.data.teams[0].strDescriptionEN,
        };
      }

      const awayTeamRes = await axios.get(`${baseUrl}/searchteams.php`, {
        params: { t: match.awayTeam },
      });
      if (awayTeamRes.data?.teams?.[0]) {
        awayTeamStats = {
          id: awayTeamRes.data.teams[0].idTeam,
          name: awayTeamRes.data.teams[0].strTeam,
          stadium: awayTeamRes.data.teams[0].strStadium,
          stadiumCapacity: awayTeamRes.data.teams[0].intStadiumCapacity,
          founded: awayTeamRes.data.teams[0].intFormedYear,
          badge: awayTeamRes.data.teams[0].strBadge,
          description: awayTeamRes.data.teams[0].strDescriptionES || awayTeamRes.data.teams[0].strDescriptionEN,
        };
      }

      // Get head-to-head (last 5 matches between teams)
      const h2hRes = await axios.get(`${baseUrl}/searchevents.php`, {
        params: { e: `${match.homeTeam}_vs_${match.awayTeam}` },
      });
      if (h2hRes.data?.event) {
        headToHead = h2hRes.data.event.slice(0, 5).map((e: any) => ({
          date: e.dateEvent,
          homeTeam: e.strHomeTeam,
          awayTeam: e.strAwayTeam,
          homeScore: e.intHomeScore,
          awayScore: e.intAwayScore,
          venue: e.strVenue,
        }));
      }
    } catch (error) {
      this.logger.warn(`Error fetching team stats: ${error.message}`);
    }

    return {
      match,
      homeTeamStats,
      awayTeamStats,
      headToHead,
    };
  }
}