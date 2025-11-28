import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('favorites')
export class Favorite {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    teamName: string;

    @Column({ nullable: true })
    teamBadge: string;

    @Column()
    league: string;

    @Column({ nullable: true })
    teamId: string;

    @Column({ nullable: true })
    stadium: string;

    @Column({ nullable: true })
    stadiumCapacity: string;

    @Column({ nullable: true })
    foundedYear: string;

    @Column({ nullable: true })
    teamDescription: string;

    @Column({ nullable: true })
    website: string;

    @Column({ nullable: true })
    twitter: string;

    @Column({ nullable: true })
    instagram: string;

    @Column({ nullable: true })
    facebook: string;

    @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}