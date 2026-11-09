import { useState, useEffect } from "react";
import axios from "axios";
import type { LibraryMovieDetail } from "../interfaces/LibraryMovieDetail.interface";
import type { WatchedMovieRecord } from "../interfaces/WatchedMovieRecord.interface";

interface LibraryCardProps {
  record: WatchedMovieRecord;
  onViewDetails: (id: number) => void;
  onTitleLoaded?: (tmdbId: number, title: string) => void; // 👈 NUEVA PROP
}

const LibraryCard = ({
  record,
  onViewDetails,
  onTitleLoaded,
}: LibraryCardProps) => {
  const [movieDetail, setMovieDetail] = useState<LibraryMovieDetail | null>(
    null,
  );

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/watched-movies/details/${record.tmdbId}`,
        );
        setMovieDetail(response.data);

        // 👇 LE AVISAMOS A LA PÁGINA PRINCIPAL EL TÍTULO REAL QUE APENAS SE ENCONTRÓ
        if (onTitleLoaded && response.data) {
          const realTitle =
            response.data.titleSpanish || response.data.title || "";
          onTitleLoaded(record.tmdbId, realTitle);
        }
      } catch (error) {
        console.error(
          `No se pudieron cargar los detalles para el ID ${record.tmdbId}:`,
          error,
        );
      }
    };
    loadDetails();
  }, [record.tmdbId]);

  const title =
    movieDetail?.titleSpanish ||
    movieDetail?.title ||
    `ID de Película: ${record.tmdbId}`;
  const posterFinalUrl = movieDetail?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movieDetail.poster_path}`
    : null;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col justify-between relative shadow-md group animate-fade-in">
      {/* Etiqueta de Estado */}
      <div className="absolute top-2 right-2 z-10">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            record.isWatched
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
          }`}
        >
          {record.isWatched ? "VISTA" : "PENDIENTE"}
        </span>
      </div>

      {/* Carátula con Efecto de Zoom Protegido */}
      <div className="relative aspect-[2/3] bg-slate-800 w-full overflow-hidden">
        {posterFinalUrl ? (
          <img
            src={posterFinalUrl}
            alt={title}
            // El zoom se recorta perfectamente dentro del marco de la tarjeta
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px] p-2 text-center">
            {movieDetail ? "Sin Imagen" : "Cargando datos..."}
          </div>
        )}
        {movieDetail && (movieDetail as any).vote_average > 0 && (
          <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md z-10">
            <span className="text-[10px]">⭐</span>
            <span className="text-[11px] font-black text-amber-400">
              {Number((movieDetail as any).vote_average).toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Cuerpo y Botón de Acción */}
      <div className="p-3 flex flex-col gap-2 flex-1 justify-between">
        <div className="space-y-2">
          {/* Contenedor exclusivo para el intercambio de títulos */}
          <div className="relative h-[40px] flex flex-col justify-center overflow-hidden">
            {/* 1. Título en Español (Se desliza hacia arriba) */}
            <h3
              className={`font-bold text-xs text-white transition-all duration-300 leading-tight ${
                record.originalTitle && record.originalTitle !== title
                  ? "group-hover:opacity-0 group-hover:-translate-y-3"
                  : ""
              }`}
            >
              {title}
            </h3>

            {/* 2. Título Original (Toma el lugar exacto de forma absoluta) */}
            {record.originalTitle && record.originalTitle !== title && (
              <h3 className="font-bold text-xs text-cyan-400 absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-[-50%] transition-all duration-300 pointer-events-none leading-tight line-clamp-2">
                🎬 {record.originalTitle}
              </h3>
            )}
          </div>

          {/* 3. Metadatos de la película: Mostramos el año de lanzamiento en lugar de la auditoría interna */}
          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/60 font-medium">
            <span>📅 Estreno: </span>
            <span className="text-slate-300 font-semibold">
              {record.releaseYear || "N/A"}
            </span>
          </div>
        </div>

        {/* Botón de Detalles */}
        <button
          onClick={() => onViewDetails(record.tmdbId)}
          className="w-full mt-1 py-1.5 px-3 bg-gradient-to-r from-slate-800 to-slate-900/80 hover:from-cyan-950/40 hover:to-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-medium text-slate-300 hover:text-cyan-400 rounded-lg transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
        >
          <svg
            className="w-3 h-3 opacity-80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Detalles & Tráiler
        </button>
      </div>
    </div>
  );
};

export default LibraryCard;
