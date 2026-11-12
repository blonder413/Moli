import { useState, useEffect } from "react";
import axios from "axios";
import type { AdvancedMovieDetail } from "../interfaces/AdvancedMovieDetail.interface";

interface DetailModalProps {
  tmdbId: number;
  onClose: () => void;
}

const DetailModal = ({ tmdbId, onClose }: DetailModalProps) => {
  const [detail, setDetail] = useState<AdvancedMovieDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAdvancedData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/watched-movies/details/${tmdbId}`,
        );
        setDetail(response.data);
      } catch (error) {
        console.error("Error al cargar datos avanzados:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAdvancedData();
  }, [tmdbId]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <p className="text-indigo-400 animate-pulse font-medium">
          Cargando cine-datos de TMDb...
        </p>
      </div>
    );
  }

  if (!detail) return null;

  // Extraer el tráiler oficial de YouTube de forma segura
  const trailerVideo = detail.videos?.results?.find(
    (v) => v.type === "Trailer" && v.site === "YouTube",
  );

  let videoKey = "";
  if (trailerVideo) {
    const rawKey = trailerVideo.key;
    // Si la clave contiene una barra diagonal (porque viene la URL completa), toma sólo lo que está después de la última barra
    videoKey = rawKey.includes("/")
      ? rawKey.substring(rawKey.lastIndexOf("/") + 1)
      : rawKey;
  }

  // Extraer las plataformas streaming prioritarias para la región de JustWatch (MX/CO)
  const providers =
    detail["watch/providers"]?.results?.["MX"]?.flatrate ||
    detail["watch/providers"]?.results?.["CO"]?.flatrate ||
    [];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Contenedor principal en columna (flex-col) para lucir el banner horizontal */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col animate-fade-in">
        {/* Botón de Cerrar flotante con fondo translúcido */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-950/70 hover:bg-slate-800 text-white rounded-full w-8 h-8 flex items-center justify-center z-20 cursor-pointer transition-colors backdrop-blur-md border border-slate-700/50"
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        {/* 👇 BANNER SUPERIOR PANORÁMICO (16:9) CON BACKDROP_PATH */}
        <div className="relative w-full aspect-video max-h-[300px] bg-slate-950 overflow-hidden shrink-0">
          {detail.backdrop_path ? (
            <>
              <img
                src={`https://image.tmdb.org/t/p/w780${detail.backdrop_path}`}
                alt={detail.title}
                className="w-full h-full object-cover"
              />
              {/* Degradado inferior para fundir la imagen con el contenido oscuro */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            </>
          ) : detail.backdrop_path ? (
            /* Respaldo por si la película no tiene imagen horizontal */
            <img
              src={`https://image.tmdb.org/t/p/w500${detail.poster_path}`}
              alt={detail.title}
              className="w-full h-full object-cover opacity-40 blur-sm"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
              Sin imagen de fondo
            </div>
          )}

          {/* Título superpuesto elegante en la base del banner */}
          <div className="absolute bottom-4 left-6 right-6 z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
              {detail.title}
            </h2>
            <p className="text-xs text-slate-300 italic drop-shadow">
              Título Original: {detail.original_title} • 📅{" "}
              {detail.release_date || "N/A"}
            </p>
          </div>
        </div>

        {/* Cuerpo de Información */}
        <div className="p-6 space-y-5">
          {/* Sinopsis */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Sinopsis
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {detail.overview || "Sin descripción disponible."}
            </p>
          </div>

          {/* Reparto Principal con Foto y Nombre */}
          {detail.credits?.cast && detail.credits.cast.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                Reparto Principal
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {detail.credits.cast.slice(0, 6).map((actor) => (
                  <div
                    key={actor.id}
                    className="p-2 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center gap-2.5 hover:border-violet-500/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                      {actor.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                          alt={actor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">
                          {actor.name?.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Nombre Real y Personaje */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-200 truncate">
                        {actor.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {actor.character}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plataformas Streaming */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Disponible En
            </h4>
            {providers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {providers.map((p, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded"
                  >
                    {p.provider_name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No reportado para streaming por suscripción en la región.
              </p>
            )}
          </div>

          {/* Reproductor Incrustado del Tráiler */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">
              Tráiler Oficial
            </h4>
            {trailerVideo && videoKey ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://youtube.com/embed/${videoKey}`}
                  title="YouTube Video Player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <p className="text-xs text-slate-500 bg-slate-950/50 p-3 rounded-lg text-center border border-slate-800/40">
                📺 Tráiler no disponible de forma oficial.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
