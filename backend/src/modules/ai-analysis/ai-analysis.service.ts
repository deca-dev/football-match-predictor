import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Analysis, Match } from '../database/entities';
import { CreateAnalysisDto, AnalysisResponseDto } from './dto';

@Injectable()
export class AiAnalysisService {
  private readonly logger = new Logger(AiAnalysisService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(
    @InjectRepository(Analysis)
    private analysisRepository: Repository<Analysis>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('apis.ai.key') || '';
    this.baseUrl = this.configService.get<string>('apis.ai.baseUrl') || 'https://openrouter.ai/api/v1';
    this.model = this.configService.get<string>('apis.ai.model') || 'deepseek/deepseek-chat';
  }

  async createAnalysis(dto: CreateAnalysisDto): Promise<AnalysisResponseDto> {
    const { matchId, weatherData } = dto;

    // Find the match
    const match = await this.matchRepository.findOne({ where: { id: matchId } });
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    this.logger.log(`Creating analysis for: ${match.homeTeam} vs ${match.awayTeam}`);

    // Check for existing recent analysis
    const existingAnalysis = await this.analysisRepository.findOne({
      where: { matchId },
      order: { createdAt: 'DESC' },
    });

    if (existingAnalysis) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (existingAnalysis.createdAt > oneHourAgo) {
        this.logger.log('Returning cached analysis');
        return this.mapToResponse(existingAnalysis, match);
      }
    }

    // Generate new analysis
    const analysisText = await this.generateAnalysis(match, weatherData);

    // Save to database
    const analysis = new Analysis();
    analysis.matchId = matchId;
    analysis.content = analysisText;
    analysis.matchData = { homeTeam: match.homeTeam, awayTeam: match.awayTeam, venue: match.venue };
    analysis.weatherData = weatherData || null;
    analysis.model = this.model;
    analysis.temperature = weatherData?.temperature ?? 0;
    analysis.windSpeed = weatherData?.windSpeed ?? 0;
    analysis.weatherCondition = weatherData?.conditions ?? '';

    const savedAnalysis = await this.analysisRepository.save(analysis);

    // Update match with analysis
    await this.matchRepository.update(matchId, {
      aiAnalysis: analysisText,
      analyzedAt: new Date(),
    });

    return this.mapToResponse(savedAnalysis, match);
  }

  async getAnalysis(matchId: string): Promise<AnalysisResponseDto> {
    const match = await this.matchRepository.findOne({ where: { id: matchId } });
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    const analysis = await this.analysisRepository.findOne({
      where: { matchId },
      order: { createdAt: 'DESC' },
    });

    if (!analysis) {
      throw new NotFoundException(`No analysis found for match ${matchId}`);
    }

    return this.mapToResponse(analysis, match);
  }

  private async generateAnalysis(match: Match, weatherData?: any): Promise<string> {
    if (!this.apiKey) {
      this.logger.warn('No AI API key configured, returning mock analysis');
      return this.getMockAnalysis(match, weatherData);
    }

    const prompt = this.buildPrompt(match, weatherData);

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          max_tokens: 300,
          messages: [
            {
              role: 'system',
              content: 'You are a football analyst expert. Provide brief, insightful match predictions based on weather conditions and team context. Keep responses under 150 words.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.choices[0]?.message?.content || this.getMockAnalysis(match, weatherData);
    } catch (error) {
      this.logger.error(`AI API error: ${error.message}`);
      return this.getMockAnalysis(match, weatherData);
    }
  }

  private buildPrompt(match: Match, weatherData?: any): string {
    let prompt = `Analyze this football match:\n`;
    prompt += `Match: ${match.homeTeam} vs ${match.awayTeam}\n`;
    prompt += `Venue: ${match.venue || 'Unknown'}\n`;
    prompt += `Date: ${match.dateEvent}\n`;

    if (weatherData) {
      prompt += `\nWeather Conditions:\n`;
      prompt += `- Temperature: ${weatherData.temperature}°C\n`;
      prompt += `- Wind: ${weatherData.windSpeed} km/h\n`;
      prompt += `- Humidity: ${weatherData.humidity}%\n`;
      prompt += `- Conditions: ${weatherData.conditions}\n`;
    }

    prompt += `\nProvide a brief analysis of how weather might affect the game and any tactical advantages.`;

    return prompt;
  }

  private getMockAnalysis(match: Match, weatherData?: any): string {
    const temp = weatherData?.temperature || 18;
    const wind = weatherData?.windSpeed || 10;

    return `Match Analysis: ${match.homeTeam} vs ${match.awayTeam}\n\n` +
      `Based on the current conditions with ${temp}°C temperature and ${wind} km/h wind, ` +
      `this match promises to be competitive. The moderate weather conditions favor technical play. ` +
      `${match.homeTeam} has home advantage which could be decisive. ` +
      `The wind speed is manageable but may affect long passes and set pieces. ` +
      `Expect both teams to focus on ground-based build-up play.`;
  }

  private mapToResponse(analysis: Analysis, match: Match): AnalysisResponseDto {
    return {
      id: analysis.id,
      matchId: analysis.matchId,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      analysis: analysis.content,
      temperature: analysis.temperature,
      windSpeed: analysis.windSpeed,
      weatherCondition: analysis.weatherCondition,
      model: analysis.model,
      createdAt: analysis.createdAt,
    };
  }
}