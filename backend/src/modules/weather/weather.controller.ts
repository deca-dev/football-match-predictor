import { Controller, Get, Query, Logger } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { GetWeatherDto, WeatherResponseDto } from './dto';

@Controller('weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);

  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  async getWeather(@Query() query: GetWeatherDto): Promise<WeatherResponseDto> {
    this.logger.log(`GET /weather - city: ${query.city}`);
    return this.weatherService.getWeather(query);
  }
}