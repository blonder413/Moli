import type { WatchedMovieRecord } from "../interfaces/WatchedMovieRecord.interface";

export interface TmdbMovie {
  id?: number;
  tmdbId?: number;
  titleSpanish?: string;
  title?: string;
  original_title: string;
  overview?: string;
  releaseDate?: string;
  release_date?: string;
  posterUrl?: string | null;
  poster_path?: string | null;
  vote_average?: number;
}

interface MovieCardProps {
  movie: TmdbMovie;
  localRecord?: WatchedMovieRecord;
  onViewDetails: (id: number) => void;
  onAddToLibrary: (movie: TmdbMovie, isWatched: boolean) => void;
}

const MovieCard = ({
  movie,
  localRecord,
  onViewDetails,
  onAddToLibrary,
}: MovieCardProps) => {
  const id = movie.tmdbId || movie.id || 0;
  const title = movie.titleSpanish || movie.title || "Título Desconocido";
  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;
  const releaseYear = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
  const hasDifferentOriginalTitle =
    Boolean(movie.original_title) && movie.original_title !== title;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between group relative">
      {/* Carátula y Calificación */}
      <div className="relative aspect-[2/3] bg-slate-800 w-full overflow-hidden">
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs p-2 text-center">
            Sin Póster
          </div>
        )}

        {movie.vote_average !== undefined && movie.vote_average > 0 && (
          <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md z-10">
            <span className="text-[10px]">⭐</span>
            <span className="text-[11px] font-black text-amber-400">
              {Number(movie.vote_average).toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Información y Botones */}
      <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
        <div className="space-y-2">
          <div className="relative h-[40px] flex flex-col justify-center overflow-hidden">
            <h3
              className={`font-bold text-sm text-white transition-all duration-300 leading-tight ${
                hasDifferentOriginalTitle
                  ? "group-hover:opacity-0 group-hover:-translate-y-3"
                  : ""
              }`}
            >
              {title}
            </h3>

            {hasDifferentOriginalTitle && (
              <h3 className="font-bold text-sm text-indigo-400 absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-[-50%] transition-all duration-300 pointer-events-none leading-tight line-clamp-2">
                🎬 {movie.original_title}
              </h3>
            )}
          </div>

          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/40">
            <span>📅 {releaseYear}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => onViewDetails(id)}
            className="w-full py-1 px-2 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-800 hover:border-indigo-500/40 text-[11px] font-medium text-slate-300 hover:text-indigo-400 rounded flex items-center justify-center gap-1 cursor-pointer"
          >
            Ver Detalles
          </button>

          {localRecord ? (
            <div className="w-full pt-1">
              <span
                className={`w-full block py-1.5 px-2 text-center text-[10px] font-bold tracking-wide rounded-md border ${
                  localRecord.isWatched
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                    : "bg-amber-950/40 border-amber-500/30 text-amber-400"
                }`}
              >
                {localRecord.isWatched ? "🎉 ¡Ya la viste!" : "⏳ En tus pendientes"}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => onAddToLibrary(movie, false)}
                className="py-1 px-1 bg-slate-850 hover:bg-slate-750 font-semibold text-[10px] rounded transition-colors text-center cursor-pointer text-slate-300"
              >
                ⏳ Pendiente
              </button>
              <button
                type="button"
                onClick={() => onAddToLibrary(movie, true)}
                className="py-1 px-1 bg-indigo-600 hover:bg-indigo-500 font-semibold text-[10px] rounded transition-colors text-center cursor-pointer text-white"
              >
                ✅ La vi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
