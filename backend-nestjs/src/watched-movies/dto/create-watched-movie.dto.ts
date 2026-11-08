import {
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class CreateWatchedMovieDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  tmdbId: number;

  @IsOptional()
  @IsString()
  movieTitle?: string;

  @IsString()
  originalTitle: string;

  @IsString()
  releaseYear: string;

  @IsOptional()
  @IsBoolean()
  isWatched?: boolean;

  @IsOptional()
  @IsDateString()
  watchedAt?: Date;

  @IsOptional()
  @IsString()
  chosenPlatform?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  personalRating?: number;
}
