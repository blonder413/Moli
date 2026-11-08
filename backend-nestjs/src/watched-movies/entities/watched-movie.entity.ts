import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('watched_movies')
export class WatchedMovie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  tmdbId: number;

  @Column({ nullable: true })
  movieTitle: string;

  @Column({ nullable: true })
  originalTitle: string;

  @Column({ nullable: true })
  releaseYear: string;

  @Column({ default: false })
  isWatched: boolean;

  @Column({ nullable: true })
  chosenPlatform: string;

  @Column({ nullable: true })
  personalRating: number;

  @CreateDateColumn()
  createdAt: Date;
}
