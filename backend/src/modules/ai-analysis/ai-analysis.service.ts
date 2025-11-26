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
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor(
    @InjectRepository(Analysis)
    private analysisRepository: Repository<Analysis>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('apis.ai.key') || '';
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
    analysis.model = 'gemini-2.0-flash';
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
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return generatedText || this.getMockAnalysis(match, weatherData)
    } catch (error) {
      this.logger.error(`Gemini API error: ${error.message}`);
      return this.getMockAnalysis(match, weatherData);
    }
  }

  private buildPrompt(match: Match, weatherData?: any): string {
    const matchDate = new Date(match.dateEvent);
    const now = new Date();
    const isPastMatch = matchDate < now;

    let prompt = '';

    if (isPastMatch) {
      prompt = `You are a football analyst. Generate a BRIEF retrospective match analysis in Spanish (maximum 100 words).

Format your response EXACTLY like this example:
"Análisis del Partido: Team A X - X Team B
Con condiciones climáticas de X°C y viento de X km/h, el partido se desarrolló de manera [descripción]. [Team ganador] dominó gracias a [razón]. El clima [favoreció/dificultó] el juego técnico. Los goles llegaron por [descripción breve]. Partido [intenso/tranquilo] que confirma [conclusión]."

Match: ${match.homeTeam} ${match.homeScore || '?'} - ${match.awayScore || '?'} ${match.awayTeam}
Venue: ${match.venue || 'Unknown'}
Date: ${match.dateEvent}
Status: ${match.status || 'Finished'}`;
    } else {
      prompt = `You are a football analyst. Generate a BRIEF match prediction in Spanish (maximum 100 words).

Format your response EXACTLY like this example:
"Análisis del Partido: Team A vs Team B
Basado en las condiciones climáticas, se espera un partido competitivo. La temperatura de X°C y viento de X km/h favorecen un juego técnico. [Team] podría tener ventaja por [reason]. El clima es ideal/difícil para el rendimiento físico. El viento puede afectar pases largos."

Match: ${match.homeTeam} vs ${match.awayTeam}
Venue: ${match.venue || 'Unknown'}
Date: ${match.dateEvent}`;
    }

    if (weatherData) {
      prompt += `

Weather:
- Temperature: ${weatherData.temperature}°C
- Wind: ${weatherData.windSpeed} km/h
- Humidity: ${weatherData.humidity}%
- Conditions: ${weatherData.conditions}`;
    }

    prompt += `

IMPORTANT:
- Response must be in SPANISH
- Maximum 100 words
- Be direct and concise
- ${isPastMatch ? 'Analyze what happened based on the score and conditions' : 'Focus on how weather affects the upcoming match'}
- ${isPastMatch ? 'Give insights on the result' : 'Give a tactical prediction'}`;

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