import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { AiAnalysisService } from './ai-analysis.service';
import { CreateAnalysisDto, AnalysisResponseDto } from './dto';

@Controller('ai-analysis')
export class AiAnalysisController {
  private readonly logger = new Logger(AiAnalysisController.name);

  constructor(private readonly aiAnalysisService: AiAnalysisService) {}

  @Post()
  async createAnalysis(@Body() dto: CreateAnalysisDto): Promise<AnalysisResponseDto> {
    this.logger.log(`POST /ai-analysis - matchId: ${dto.matchId}`);
    return this.aiAnalysisService.createAnalysis(dto);
  }

  @Get(':matchId')
  async getAnalysis(@Param('matchId') matchId: string): Promise<AnalysisResponseDto> {
    this.logger.log(`GET /ai-analysis/${matchId}`);
    return this.aiAnalysisService.getAnalysis(matchId);
  }
}