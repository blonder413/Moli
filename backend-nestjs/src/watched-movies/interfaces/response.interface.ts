// Estructura de cada película individual que devuelve la API de TMDb
export interface TmdbMovieResult {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

// Estructura del objeto de paginación completo que retorna response.data
export interface TmdbSearchResponse {
  page: number;
  results: TmdbMovieResult[];
  total_pages: number;
  total_results: number;
}
