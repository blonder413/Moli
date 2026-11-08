import { PartialType } from '@nestjs/mapped-types';
import { CreateWatchedMovieDto } from './create-watched-movie.dto';

export class UpdateWatchedMovieDto extends PartialType(CreateWatchedMovieDto) {}
