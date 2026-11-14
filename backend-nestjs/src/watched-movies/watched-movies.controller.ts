import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { WatchedMoviesService } from './watched-movies.service';
import { CreateWatchedMovieDto } from './dto/create-watched-movie.dto';
import { UpdateWatchedMovieDto } from './dto/update-watched-movie.dto';

@Controller('watched-movies')
export class WatchedMoviesController {
  constructor(private readonly watchedMoviesService: WatchedMoviesService) {}

  @Get('now-playing')
  getNowPlaying() {
    return this.watchedMoviesService.getNowPlayingMovies();
  }

  @Get('upcoming')
  getUpcoming() {
    return this.watchedMoviesService.getUpcomingMovies();
  }

  // 🔍 GET /watched-movies/search?query=Batman
  @Get('search')
  searchExternal(
    @Query('query') query: string,
    @Query('includeAdult') includeAdult?: string,
  ) {
    const hasAdult = includeAdult === 'true';
    return this.watchedMoviesService.searchExternalMovies(query, hasAdult);
  }

  // 🍿 GET /watched-movies/details/268
  @Get('details/:tmdbId')
  getExternalDetails(@Param('tmdbId', ParseIntPipe) tmdbId: number) {
    return this.watchedMoviesService.getExternalMovieDetails(tmdbId);
  }



  @Post()
  create(@Body() createWatchedMovieDto: CreateWatchedMovieDto) {
    return this.watchedMoviesService.create(createWatchedMovieDto);
  }

  @Get()
  findAll() {
    return this.watchedMoviesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.watchedMoviesService.findOne(id);
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('search') search?: string,
  ) {
    // Convertimos el parámetro de página a número entero seguro
    const parsedPage = Number.parseInt(page ?? '1', 10);
    return this.watchedMoviesService.findByUserId(userId, parsedPage, search);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWatchedMovieDto: UpdateWatchedMovieDto,
  ) {
    return this.watchedMoviesService.update(id, updateWatchedMovieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.watchedMoviesService.remove(id);
  }
}
