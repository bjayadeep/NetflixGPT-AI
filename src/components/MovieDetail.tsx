import { useEffect } from "react";
import { Calendar, Play, Star, X } from "lucide-react";
import { motion } from "motion/react";
import { Movie } from "../types/movie";

interface MovieDetailProps {
  movie: Movie;
  onClose: () => void;
  onPlayTrailer: () => void;
}

export function MovieDetail({
  movie,
  onClose,
  onPlayTrailer,
}: MovieDetailProps) {
  const cast = movie.cast || [];

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] overflow-y-auto bg-black/72 backdrop-blur-xl"
      onClick={onClose}
    >
      <div className="flex min-h-screen items-end px-0 py-0 md:items-center md:px-8 md:py-12">
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.34, ease: "easeOut" }}
          className="mx-auto max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-t-2xl border border-white/10 bg-zinc-950 shadow-[0_34px_120px_rgba(0,0,0,0.72)] md:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/55 text-white shadow-xl backdrop-blur-md transition-all hover:bg-black/75"
              aria-label="Close movie details"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative h-[420px]">
              <img
                src={movie.backdropPath}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/25 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/10" />

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h1 className="mb-4 max-w-3xl text-4xl font-black leading-tight text-white drop-shadow-xl md:text-6xl">
                  {movie.title}
                </h1>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <button
                    type="button"
                    onClick={onPlayTrailer}
                    className="flex min-h-12 items-center gap-2 rounded-lg bg-white px-6 py-3 text-lg font-black text-black shadow-[0_18px_45px_rgba(255,255,255,0.16)] transition-all hover:scale-105 hover:bg-white/90"
                  >
                    <Play className="w-5 h-5 fill-black" />
                    Play Trailer
                  </button>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="max-h-[calc(94vh-420px)] overflow-y-auto p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1.5">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-black text-white">
                      {movie.rating.toFixed(1)}/10
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 font-bold text-white/70">
                    <Calendar className="h-4 w-4" />
                    {movie.releaseDate}
                  </span>
                </div>

                <p className="mb-8 text-lg font-medium leading-relaxed text-white/88">
                  {movie.overview}
                </p>

                <div className="mb-6">
                  <h3 className="mb-4 text-xl font-black text-white">
                    Cast
                  </h3>
                  {cast.length > 0 ? (
                    <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
                      {cast.map((actor) => (
                        <a
                          key={actor.name}
                          href={actor.wikiUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="min-w-28 text-center transition hover:-translate-y-1"
                        >
                          <img
                            src={actor.profilePath}
                            alt={actor.name}
                            className="mx-auto mb-3 h-20 w-20 rounded-full border border-white/10 object-cover"
                          />
                          <p className="text-sm font-bold leading-tight text-white">
                            {actor.name}
                          </p>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/60">
                      Cast information not available
                    </p>
                  )}
                </div>
              </div>

              <aside>
                <div className="mb-6">
                  <h3 className="mb-2 text-sm font-black uppercase tracking-[0.16em] text-white/45">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-white"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="mb-2 text-sm font-black uppercase tracking-[0.16em] text-white/45">Release Date</h3>
                  <p className="text-white">{movie.releaseDate}</p>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-black uppercase tracking-[0.16em] text-white/45">Rating</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(movie.rating / 2)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-white/20"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-white font-semibold">
                      {movie.rating.toFixed(1)}/10
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
