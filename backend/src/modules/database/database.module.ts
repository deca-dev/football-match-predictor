import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match, Analysis, User, Favorite } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, Analysis, User, Favorite]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}