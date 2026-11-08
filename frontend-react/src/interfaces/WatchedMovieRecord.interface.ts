export interface WatchedMovieRecord {
    id: string;
    userId: string;
    tmdbId: number;
    isWatched: boolean;
    chosenPlatform: string | null;
    personalRating: number | null;
    createdAt: string;
}
