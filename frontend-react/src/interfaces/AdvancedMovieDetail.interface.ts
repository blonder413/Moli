export interface AdvancedMovieDetail {
  id: number;
  backdrop_path: string | null;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  videos?: {
    results: Array<{ site: string; type: string; key: string }>;
  };
  "watch/providers"?: {
    results?: {
      [key: string]: { flatrate?: Array<{ provider_name: string }> };
    };
  };
  credits?: {
    cast?: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
  };
}
