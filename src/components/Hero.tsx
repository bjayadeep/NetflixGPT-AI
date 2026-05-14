import { Calendar, Clock3, Heart, Info, Play, Star } from "lucide-react";
import { motion } from "motion/react";
import { Movie } from "../types/movie";
import { getTrailerEmbedUrl } from "../utils/video";

interface HeroProps {
  movie: Movie;
  onPlayTrailer: () => void;
  onMoreInfo: () => void;
  onToggleMyList: () => void;
  isInMyList: boolean;
}

export function Hero({
  movie,
  onPlayTrailer,
  onMoreInfo,
  onToggleMyList,
  isInMyList,
}: HeroProps) {
  const hasTrailer = Boolean(movie.trailerUrl);
  const heroVideoUrl = getTrailerEmbedUrl(movie.trailerUrl, {
    muted: true,
    background: true,
  });
  const releaseYear = movie.releaseDate?.split("-")[0] || "New";
  const maturityRating = movie.rating >= 7.5 ? "18+" : "PG";

  return (
    <section className="relative h-[88vh] min-h-[620px] w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        {hasTrailer ? (
          <iframe
            src={heroVideoUrl}
            title={`${movie.title} Trailer`}
            className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.777778vh] min-w-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ border: "none" }}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen={true}
          />
        ) : (
          <img
            src={movie.backdropPath}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,transparent_0,rgba(0,0,0,0.45)_48%,rgba(0,0,0,0.88)_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/38 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/42 to-transparent pointer-events-none" />
      </div>

      <div className="relative z-20 flex h-full items-center px-5 pb-36 pt-24 sm:px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-600/10 px-3 py-1 text-sm font-bold uppercase tracking-[0.14em] text-red-100 backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_14px_rgba(239,68,68,0.9)]" />
            Featured now
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-5 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.78)] sm:text-4xl md:text-4xl"
          >
            {movie.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-6 flex flex-wrap items-center gap-3"
          >
            <div className="flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-500/18 px-3 py-1.5 shadow-[0_8px_26px_rgba(16,185,129,0.12)] backdrop-blur-md">
              <Star className="h-4 w-4 fill-emerald-300 text-emerald-300" />
              <span className="text-sm font-bold text-emerald-200">
                {(movie.rating * 10).toFixed(0)}% Match
              </span>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/85 backdrop-blur-md">
              <Calendar className="h-4 w-4" />
              {releaseYear}
            </span>
            <span className="rounded-md border border-white/35 bg-black/20 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
              {maturityRating}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/85 backdrop-blur-md">
              <Clock3 className="h-4 w-4" />
              {Math.round(92 + movie.rating * 8)} min
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-7 max-w-2xl"
          >
            <p
              className="overflow-hidden text-base font-medium leading-relaxed text-white/90 drop-shadow-[0_3px_12px_rgba(0,0,0,0.85)] md:text-lg"
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3,
              }}
            >
              {movie.overview}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-wrap gap-3"
          >
            <motion.div whileTap={{ scale: 0.97 }}>
              <button
                type="button"
                onClick={onPlayTrailer}
                className="relative z-30 flex min-h-12 items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-bold text-black shadow-[0_14px_36px_rgba(255,255,255,0.2)] transition-all duration-200 hover:scale-105 hover:bg-white hover:shadow-[0_20px_52px_rgba(255,255,255,0.32)] md:px-8 md:text-lg"
              >
                <Play className="w-5 h-5 md:w-6 md:h-6 fill-black" />
                Play
              </button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.97 }}>
              <button
                type="button"
                onClick={onMoreInfo}
                className="glass-panel relative z-30 flex min-h-12 items-center gap-2 rounded-lg px-6 py-3 text-base font-bold text-white backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/15 hover:shadow-[0_18px_42px_rgba(255,255,255,0.12)] md:px-8 md:text-lg"
              >
                <Info className="w-5 h-5 md:w-6 md:h-6" />
                More Info
              </button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.97 }}>
              <button
                type="button"
                onClick={onToggleMyList}
                className="glass-panel relative z-30 flex min-h-12 items-center gap-2 rounded-lg px-6 py-3 text-base font-bold text-white backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/15 hover:shadow-[0_18px_42px_rgba(255,255,255,0.12)] md:px-8 md:text-lg"
              >
                <Heart
                  className={`w-5 h-5 transition-transform ${isInMyList ? "fill-red-600 text-red-600 animate-pulse" : ""}`}
                />
                {isInMyList ? "In My List" : "My List"}
              </button>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
