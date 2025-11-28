import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { MatchesModule } from './modules/matches/matches.module';
import { WeatherModule } from './modules/weather/weather.module';
import { AiAnalysisModule } from './modules/ai-analysis/ai-analysis.module';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { FavoritesModule } from './modules/favorites/favorites.module';

@Module({
  imports: [
    // env variables configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    // TypeORM Configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('database.host', 'localhost'),
        port: configService.get<number>('database.port', 5432),
        username: configService.get<string>('database.username', 'admin'),
        password: configService.get<string>('database.password', 'password123'),
        database: configService.get<string>('database.database', 'futbol_app'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: configService.get<string>('nodeEnv') === 'development',
      }),
    }),

    // Application Modules
    DatabaseModule,
    MatchesModule,
    WeatherModule,
    AiAnalysisModule,
    AuthModule,
    FavoritesModule,
  ],
})
export class AppModule {}
