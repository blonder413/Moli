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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col md:flex-row animate-fade-in">
        {/* Botón de Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full p-2 z-10 cursor-pointer transition-colors"
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        {/* Panel Izquierdo: Imagen del Póster */}
        <div className="w-full md:w-1/3 bg-slate-950 aspect-[2/3] md:aspect-auto">
          {detail.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${detail.poster_path}`}
              alt={detail.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
              Sin Póster
            </div>
          )}
        </div>

        {/* Panel Derecho: Cuerpo de Información */}
        <div className="p-6 flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-black text-white">{detail.title}</h2>
            <p className="text-xs text-slate-400 italic">
              Título Original: {detail.original_title} • 📅{" "}
              {detail.release_date || "N/A"}
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Sinopsis
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {detail.overview || "Sin descripción disponible."}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider">
              Reparto Principal
            </h4>
            {detail.credits?.cast && detail.credits.cast.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {detail.credits.cast.slice(0, 6).map((actor) => (
                  <div
                    key={actor.id}
                    className="px-2.5 py-1 bg-slate-950/60 border border-slate-800 text-xs rounded-lg flex flex-col sm:flex-row gap-1 items-baseline"
                  >
                    <span className="font-bold text-slate-200">
                      {actor.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      como {actor.character}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Información de elenco no disponible.
              </p>
            )}
          </div>

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
                    className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded"
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
                  // 👇 Esto forzará el formato correcto: https://youtube.com
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
