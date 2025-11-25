import { Controller, Get, Query, Param, Logger } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { GetMatchesDto, MatchResponseDto } from './dto';

@Controller('matches')
export class MatchesController {
  private readonly logger = new Logger(MatchesController.name);

  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  async findAll(@Query() query: GetMatchesDto): Promise<MatchResponseDto[]> {
    this.logger.log(`GET /matches - league: ${query.league}`);
    return this.matchesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MatchResponseDto> {
    this.logger.log(`GET /matches/${id}`);
    return this.matchesService.findOne(id);
  }
}