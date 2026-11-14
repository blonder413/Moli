export interface TmdbMovie {
  id?: number;
  tmdbId: number;
  titleSpanish?: string;
  title?: string;
  original_title: string;
  overview: string;
  releaseDate?: string;
  release_date?: string;
  posterUrl?: string | null;
  poster_path?: string | null;
  vote_average: number;
}
