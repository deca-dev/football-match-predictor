import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('analyses')
export class Analysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  matchId: string;

  @Column('text')
  content: string; 

  @Column('jsonb')
  matchData: any; 

  @Column('jsonb')
  weatherData: any;

  @Column()
  model: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  temperature: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  windSpeed: number;

  @Column({ nullable: true })
  weatherCondition: string;

  @CreateDateColumn()
  createdAt: Date;
}