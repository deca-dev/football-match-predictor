import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  externalId: string; 

  @Column()
  homeTeam: string;

  @Column()
  awayTeam: string;

  @Column({ nullable: true })
  homeTeamBadge: string;

  @Column({ nullable: true })
  awayTeamBadge: string;

  @Column()
  league: string; 

  @Column()
  season: string; 

  @Column({ type: 'timestamp' })
  dateEvent: Date;

  @Column({ nullable: true })
  venue: string; 

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  homeScore: string;

  @Column({ nullable: true })
  awayScore: string;

  @Column({ nullable: true })
  status: string; 

  @Column('jsonb', { nullable: true })
  weatherData: any;

  @Column('text', { nullable: true })
  aiAnalysis: string; 

  @Column({ type: 'timestamp', nullable: true })
  analyzedAt: Date; 

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}