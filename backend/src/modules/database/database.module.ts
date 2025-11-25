import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match, Analysis, User } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, Analysis, User]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}