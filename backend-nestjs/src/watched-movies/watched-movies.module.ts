import { Module } from '@nestjs/common';
import { WatchedMoviesService } from './watched-movies.service';
import { WatchedMoviesController } from './watched-movies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchedMovie } from './entities/watched-movie.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([WatchedMovie]), HttpModule],
  controllers: [WatchedMoviesController],
  providers: [WatchedMoviesService],
})
export class WatchedMoviesModule {}
