export interface WatchedMovieRecord {
  id: string;
  userId: string;
  tmdbId: number;
  isWatched: boolean;
  personalRating: number | null;
  chosenPlatform: string | null;
  releaseYear: string;
  createdAt: string;
  originalTitle: string;
}
