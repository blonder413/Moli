import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import LibraryCard from "./components/LibraryCard";
import DetailModal from "./components/DetailModal";
import type { WatchedMovieRecord } from "./interfaces/WatchedMovieRecord.interface";

// Interfaz para mapear las respuestas de películas externas
interface TmdbMovie {
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

// Interfaz para la metadata del control de paginación
interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export default function App() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  // 🧭 Control de pestañas de navegación ('search' o 'catalog')
  const [currentView, setCurrentView] = useState<"search" | "catalog">(
    "search",
  );

  // Estados para el Buscador Global (TMDb)
  const [query, setQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<TmdbMovie[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [includeAdult, setIncludeAdult] = useState<boolean>(false);

  // Estados para el Catálogo Personal (MariaDB)
  const [myLibrary, setMyLibrary] = useState<WatchedMovieRecord[]>([]);
  const [libraryLoading, setLibraryLoading] = useState<boolean>(false);
  const [localSearch, setLocalSearch] = useState<string>(""); // Buscador de catálogo
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(
    null,
  );
  // Guarda un mapa de tipo { [id_pelicula]: "Nombre Pelicula" }
  const [movieTitlesMap, setMovieTitlesMap] = useState<Record<number, string>>(
    {},
  );

  // Estados de interfaz comunes (Notificación y Ventana de Detalles)
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  // ID de usuario estático para desarrollo local
  const currentUserId = "usuario_local_1";
  // Manejador del formulario de búsqueda externa hacia tu NestJS
  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearchLoading(true);
    try {
      await fetchMyLibrary(1, "");
      const response = await axios.get<any>(
        `${apiUrl}/watched-movies/search`,
        {
          params: { query, includeAdult: includeAdult.toString() },
        },
      );
      const data = response.data.results || response.data;
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error en la búsqueda externa:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Función para enviar una película seleccionada hacia tu base de datos MariaDB
  const handleAddToLibrary = async (
    movie: TmdbMovie,
    isWatchedNow: boolean,
  ) => {
    try {
      await axios.post(`${apiUrl}/watched-movies`, {
        userId: currentUserId,
        tmdbId: movie.tmdbId || (movie as any).id,
        movieTitle: movie.titleSpanish || movie.title || "Película sin título",
        originalTitle: movie.original_title,
        releaseYear: movie.releaseDate || movie.release_date,
        isWatched: isWatchedNow,
        chosenPlatform: "Local App",
        personalRating: isWatchedNow ? 8 : null,
      });

      await fetchMyLibrary(currentPage, localSearch);
      showNotification(`🍿 Película guardada correctamente.`);
    } catch (error) {
      console.error("Error al guardar la película:", error);

      // Verificamos si es un error de Axios con respuesta del servidor
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 409) {
          showNotification("⚠️ Esta película ya está guardada en tu catálogo.");
        } else {
          // Muestra el mensaje que envíe NestJS o un error genérico
          const backendMsg =
            error.response.data?.message || "No se pudo guardar la película.";
          showNotification(`❌ Error: ${backendMsg}`);
        }
      } else {
        showNotification("❌ Error de conexión con el servidor.");
      }
    }
  };

  // Función adaptada para pedir las páginas de a 20 registros a tu NestJS
  const fetchMyLibrary = async (page: number = 1, searchStr: string = "") => {
    setLibraryLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl}/watched-movies/user/${currentUserId}`,
        {
          params: { page, search: searchStr },
        },
      );

      if (response.data && response.data.records) {
        setMyLibrary(response.data.records);
        setPaginationMeta(response.data.meta);
      } else {
        setMyLibrary(Array.isArray(response.data) ? response.data : []);
        setPaginationMeta(null);
      }
      setCurrentPage(page);
    } catch (error) {
      console.error("Error al leer el catálogo:", error);
    } finally {
      setLibraryLoading(false);
    }
  };

  const handleLocalSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchMyLibrary(1, localSearch);
  };

  const showNotification = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast({ message: "", visible: false });
    }, 3000);
  };

  // Efecto reactivo al alternar de pestañas
  useEffect(() => {
    fetchMyLibrary(1, localSearch);
  }, [currentView]);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      {/* CABECERA Y CONTROL DE VISTAS */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between h-auto sm:h-20 py-4 sm:py-0 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍿</span>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                MOLI
              </h1>
              <p className="text-xs text-slate-400">
                Registro de contenido visto
              </p>
            </div>
          </div>

          {/* Botones de Navegación de Páginas */}
          <div className="flex gap-2 bg-slate-950/60 p-1.5 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setCurrentView("search")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                currentView === "search"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🔍 Buscar Películas
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("catalog")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                currentView === "catalog"
                  ? "bg-cyan-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📚 Mi Catálogo ({paginationMeta?.totalItems ?? myLibrary.length})
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL ASOCIADO A LAS PESTAÑAS */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* PESTAÑA A: BUSCADOR GLOBAL */}
        {currentView === "search" && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-2xl font-bold text-indigo-400">
                  Análisis del Buscador Global
                </h2>
                <p className="text-xs text-slate-400">
                  Encuentra contenido directo en los servidores de TMDb
                </p>
              </div>

              <form
                onSubmit={handleSearch}
                className="flex gap-2 w-full sm:w-auto max-w-md"
              >
                <input
                  type="text"
                  onFocus={(e) => e.target.select()}
                  placeholder="Escribe un título..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full sm:w-64 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setIncludeAdult(!includeAdult)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                    includeAdult
                      ? "bg-red-950/40 border-red-500/50 text-red-400 shadow-md shadow-red-500/5"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${includeAdult ? "bg-red-500 animate-pulse" : "bg-slate-600"}`}
                  ></span>
                  {includeAdult ? "🔞 +18 Activo" : "🔞 Todo público"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm rounded-lg transition-colors shadow-lg cursor-pointer"
                >
                  Buscar
                </button>
              </form>
            </div>

            {searchLoading && (
              <p className="text-center text-slate-400 animate-pulse py-12">
                Consultando TMDb...
              </p>
            )}

            {!searchLoading && searchResults.length === 0 && (
              <div className="text-center py-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-slate-400 mb-1">
                  No hay películas en pantalla.
                </p>
                <p className="text-xs text-slate-500">
                  Utiliza la barra de búsqueda de la derecha para ver
                  resultados.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {searchResults.map((movie) => {
                const id = movie.tmdbId || (movie as any).id;
                const title =
                  movie.titleSpanish || movie.title || "Título Desconocido";
                const poster = movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : null;

                return (
                  <div
                    key={id}
                    className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between group"
                  >
                    <div className="relative aspect-[2/3] bg-slate-800 overflow-hidden">
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
                      {movie.vote_average !== undefined &&
                        movie.vote_average > 0 && (
                          <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md z-10">
                            <span className="text-[10px]">⭐</span>
                            <span className="text-[11px] font-black text-amber-400">
                              {Number(movie.vote_average).toFixed(1)}
                            </span>
                          </div>
                        )}
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                      <div className="space-y-2">
                        {/* Contenedor exclusivo para los títulos: Altura fija y relativo para alineación perfecta */}
                        <div className="relative h-[40px] flex flex-col justify-center overflow-hidden">
                          {/* 1. Título en Español */}
                          <h3
                            className={`font-bold text-sm text-white transition-all duration-300 leading-tight ${
                              movie.original_title &&
                              movie.original_title !== title
                                ? "group-hover:opacity-0 group-hover:-translate-y-3"
                                : ""
                            }`}
                          >
                            {title}
                          </h3>

                          {/* 2. Título Original: Centrado perfectamente de forma absoluta */}
                          {movie.original_title &&
                            movie.original_title !== title && (
                              <h3 className="font-bold text-sm text-indigo-400 absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-[-50%] transition-all duration-300 pointer-events-none leading-tight line-clamp-2">
                                🎬 {movie.original_title}
                              </h3>
                            )}
                        </div>

                        {/* 3. Año de Lanzamiento: Totalmente aislado abajo para que NADA lo empuje ni lo tape */}
                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/40">
                          <span>
                            📅{" "}
                            {movie.release_date
                              ? movie.release_date.split("-")[0]
                              : "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedMovieId(id)}
                          className="w-full py-1 px-2 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-800 hover:border-indigo-500/40 text-[11px] font-medium text-slate-300 hover:text-indigo-400 rounded flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Ver Detalles
                        </button>
                        {(() => {
                          // Buscamos si la película actual ya existe en tu biblioteca local
                          const localRecord = myLibrary.find(
                            (record) => record.tmdbId === id,
                          );

                          if (localRecord) {
                            // Escenario A: La película ya existe en tu base de datos
                            return (
                              <div className="w-full pt-1">
                                <span
                                  className={`w-full block py-1.5 px-2 text-center text-[10px] font-bold tracking-wide rounded-md border ${
                                    localRecord.isWatched
                                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                                      : "bg-amber-950/40 border-amber-500/30 text-amber-400"
                                  }`}
                                >
                                  {localRecord.isWatched
                                    ? "🎉 ¡Ya la viste!"
                                    : "⏳ En tus pendientes"}
                                </span>
                              </div>
                            );
                          }

                          // Escenario B: No está registrada, mostramos las dos opciones de guardado tradicionales
                          return (
                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => handleAddToLibrary(movie, false)}
                                className="py-1 px-1 bg-slate-850 hover:bg-slate-750 font-semibold text-[10px] rounded transition-colors text-center cursor-pointer text-slate-300 active:scale-95 select-none"
                              >
                                ⏳ Pendiente
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddToLibrary(movie, true)}
                                className="py-1 px-1 bg-indigo-600 hover:bg-indigo-500 font-semibold text-[10px] rounded transition-colors text-center cursor-pointer text-white active:scale-95 select-none"
                              >
                                ✅ La vi
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* PESTAÑA B: PÁGINA SEPARADA DEL CATÁLOGO PERSONAL */}
        {currentView === "catalog" && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-2xl font-bold text-cyan-400">
                  Mi Historial Personal
                </h2>
                <p className="text-xs text-slate-400">
                  Películas confirmadas en tu base de datos MariaDB
                </p>
              </div>

              {/* Buscador Integrado Local Conectado al Servidor */}
              <form
                onSubmit={handleLocalSearchSubmit}
                className="flex gap-2 w-full sm:w-auto"
              >
                <input
                  type="text"
                  placeholder="Buscar película por título en mi catálogo..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 w-full sm:w-64"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-xs rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Filtrar catálogo
                </button>
              </form>
            </div>

            {libraryLoading && (
              <p className="text-center text-slate-400 animate-pulse py-12">
                Leyendo MariaDB...
              </p>
            )}

            {!libraryLoading && myLibrary.length === 0 && (
              <div className="text-center py-12 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-slate-400 mb-1">
                  No hay películas registradas en esta sección.
                </p>
                <p className="text-xs text-slate-500">
                  Cambia a la pestaña de búsqueda para registrar contenido.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {myLibrary.map((record) => (
                <LibraryCard
                  key={record.id}
                  record={record}
                  onViewDetails={setSelectedMovieId}
                />
              ))}
            </div>

            {/* BLOQUE DE BOTONES PARA LA PAGINACIÓN */}
            {paginationMeta && paginationMeta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-8 border-t border-slate-900">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => fetchMyLibrary(currentPage - 1, localSearch)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  ◀ Anterior
                </button>
                <span className="text-xs text-slate-400">
                  Página{" "}
                  <strong className="text-slate-200">{currentPage}</strong> de{" "}
                  {paginationMeta.totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === paginationMeta.totalPages}
                  onClick={() => fetchMyLibrary(currentPage + 1, localSearch)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Siguiente ▶
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      {/* MODAL FLOTANTE DE REPRODUCCIÓN */}
      {selectedMovieId && (
        <DetailModal
          tmdbId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
        />
      )}

      {/* NOTIFICACIÓN TOAST FLOTANTE */}
      <div
        className={`fixed bottom-5 right-5 z-50 transform transition-all duration-300 ${
          toast.visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="bg-slate-900 border border-indigo-500/40 text-slate-100 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
          <span className="text-indigo-400 font-bold">✨</span>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      </div>
    </div>
  );
}
