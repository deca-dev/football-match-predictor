import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GetWeatherDto, WeatherResponseDto } from './dto';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('apis.weather.key') || '';
    this.baseUrl = this.configService.get<string>('apis.weather.baseUrl') || 'https://api.openweathermap.org/data/2.5';
  }

  async getWeather(query: GetWeatherDto): Promise<WeatherResponseDto> {
    const { city, country } = query;
    const location = country ? `${city},${country}` : city;

    this.logger.log(`Fetching weather for: ${location}`);

    if (!this.apiKey) {
      this.logger.warn('No weather API key configured, returning mock data');
      return this.getMockWeather(city);
    }

    try {
      const url = `${this.baseUrl}/weather`;
      const response = await axios.get(url, {
        params: {
          q: location,
          appid: this.apiKey,
          units: 'metric',
        },
      });

      return this.mapResponse(response.data);
    } catch (error) {
      this.logger.error(`Error fetching weather: ${error.message}`);
      
      if (error.response?.status === 404) {
        throw new BadRequestException(`City not found: ${city}`);
      }
      
      // Return mock data if API fails
      this.logger.warn('API failed, returning mock data');
      return this.getMockWeather(city);
    }
  }

  private mapResponse(data: any): WeatherResponseDto {
    return {
      city: data.name,
      country: data.sys?.country || '',
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      description: data.weather[0]?.description || '',
      icon: data.weather[0]?.icon || '',
      conditions: data.weather[0]?.main || '',
      timestamp: new Date(),
    };
  }

  private getMockWeather(city: string): WeatherResponseDto {
    return {
      city: city,
      country: 'ES',
      temperature: 18,
      feelsLike: 17,
      humidity: 65,
      windSpeed: 12,
      description: 'partly cloudy',
      icon: '02d',
      conditions: 'Clouds',
      timestamp: new Date(),
    };
  }
}