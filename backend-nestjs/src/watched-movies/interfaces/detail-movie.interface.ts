export interface TmdbPlatform {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface TmdbMovieDetailResponse {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  videos?: {
    results: Array<{ site: string; type: string; key: string }>;
  };
  'watch/providers'?: {
    results?: {
      [countryCode: string]: { flatrate?: TmdbPlatform[] };
    };
  };
}
