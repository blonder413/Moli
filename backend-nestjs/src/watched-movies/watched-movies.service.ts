import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWatchedMovieDto } from './dto/create-watched-movie.dto';
import { UpdateWatchedMovieDto } from './dto/update-watched-movie.dto';
import { WatchedMovie } from './entities/watched-movie.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { TmdbSearchResponse } from './interfaces/response.interface';
import { TmdbMovieDetailResponse } from './interfaces/detail-movie.interface';

@Injectable()
export class WatchedMoviesService {
  private readonly tmdbApiUrl = 'https://api.themoviedb.org';
  private readonly tmdbApiToken: string;

  constructor(
    @InjectRepository(WatchedMovie)
    private readonly watchedMovieRepository: Repository<WatchedMovie>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.tmdbApiToken = this.configService.get<string>('TMDB_API_TOKEN') ?? '';
  }

  async searchExternalMovies(
    query: string,
    includeAdult: boolean = true,
  ): Promise<TmdbSearchResponse> {
    const url = `${this.tmdbApiUrl}/3/search/movie?query=${query}&include_adult=${includeAdult}&language=es-MX&page=1`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${this.tmdbApiToken.trim()}`,
        Accept: 'application/json',
      },
    });
    return response.data as TmdbSearchResponse;
  }

  // 🍿 Obtener detalles avanzados (Trailers y JustWatch)
  async getExternalMovieDetails(
    tmdbId: number,
  ): Promise<TmdbMovieDetailResponse> {
    const url = `${this.tmdbApiUrl}/3/movie/${tmdbId}?language=es-MX&append_to_response=videos,watch/providers`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${this.tmdbApiToken.trim()}`,
        Accept: 'application/json',
      },
    });

    return response.data as TmdbMovieDetailResponse;
  }

  // POST /watched-movies
  async create(
    createWatchedMovieDto: CreateWatchedMovieDto,
  ): Promise<WatchedMovie> {
    const existingRecord = await this.watchedMovieRepository.findOne({
      where: {
        userId: createWatchedMovieDto.userId,
        tmdbId: createWatchedMovieDto.tmdbId,
      },
    });

    if (existingRecord) {
      throw new ConflictException('This movie is already in your catalog');
    }

    const newMovie = this.watchedMovieRepository.create(createWatchedMovieDto);
    return await this.watchedMovieRepository.save(newMovie);
  }

  // GET /watched-movies (Lista todas las películas guardadas)
  async findAll(): Promise<WatchedMovie[]> {
    return await this.watchedMovieRepository.find();
  }

  // GET /watched-movies/user/:userId (Filtra las películas de un usuario específico)
  async findByUserId(userId: string, page: number = 1, search?: string) {
    const limit = 20;
    const skip = (page - 1) * limit;
    const searchTrimmed = search ? search.trim() : '';

    const queryBuilder = this.watchedMovieRepository
      .createQueryBuilder('watchedMovie')
      .where('watchedMovie.userId = :userId', { userId })
      .orderBy('watchedMovie.createdAt', 'DESC');

    // 👇 SOLUCON DE RAÍZ: Buscamos directamente en tu tabla local usando comodines SQL
    if (searchTrimmed !== '') {
      queryBuilder.andWhere(
        '(watchedMovie.movieTitle LIKE :search OR watchedMovie.chosenPlatform LIKE :search OR CAST(watchedMovie.tmdbId AS CHAR) LIKE :search)',
        { search: `%${searchTrimmed}%` },
      );
    }

    const [records, totalItems] = await queryBuilder
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    return {
      records,
      meta: {
        totalItems,
        itemCount: records.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit) || 1,
        currentPage: page,
      },
    };
  }

  // GET /watched-movies/:id
  async findOne(id: string): Promise<WatchedMovie> {
    const movie = await this.watchedMovieRepository.findOne({ where: { id } });
    if (!movie)
      throw new NotFoundException(`Movie record with ID ${id} not found`);
    return movie;
  }

  // PATCH /watched-movies/:id
  async update(
    id: string,
    updateWatchedMovieDto: UpdateWatchedMovieDto,
  ): Promise<WatchedMovie> {
    const movie = await this.findOne(id);
    const updatedMovie = Object.assign(movie, updateWatchedMovieDto);
    return await this.watchedMovieRepository.save(updatedMovie);
  }

  // DELETE /watched-movies/:id
  async remove(id: string): Promise<{ message: string }> {
    const movie = await this.findOne(id);
    await this.watchedMovieRepository.remove(movie);
    return { message: `Movie record with ID ${id} successfully deleted` };
  }
}
