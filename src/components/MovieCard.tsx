import { useEffect, useRef, useState } from "react";
import { Play, Info, Star, Heart } from "lucide-react";
import { motion } from "motion/react";
import { Movie } from "../types/movie";

interface MovieCardProps {
  movie: Movie;
  onPlayTrailer: (movie: Movie) => void;
  onMoreInfo: (movie: Movie) => void;
  toggleMyList?: (movie: Movie) => void;
  isInMyList?: boolean;
}

export function MovieCard({
  movie,
  onPlayTrailer,
  onMoreInfo,
  toggleMyList,
  isInMyList = false,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverDelayTimerRef = useRef<number | null>(null);
  const previewImageUrl = movie.backdropPath || movie.posterPath;

  useEffect(() => {
    return () => {
      if (hoverDelayTimerRef.current) {
        window.clearTimeout(hoverDelayTimerRef.current);
      }
    };
  }, []);

  return (
    <motion.article
      className="group relative shrink-0 cursor-pointer overflow-visible drop-shadow-lg"
      onMouseEnter={() => {
        if (hoverDelayTimerRef.current) {
          window.clearTimeout(hoverDelayTimerRef.current);
        }
        hoverDelayTimerRef.current = window.setTimeout(() => {
          setIsHovered(true);
        }, 200);
      }}
      onMouseLeave={() => {
        if (hoverDelayTimerRef.current) {
          window.clearTimeout(hoverDelayTimerRef.current);
          hoverDelayTimerRef.current = null;
        }
        setIsHovered(false);
      }}
      whileHover={{ y: -8, zIndex: 30 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div
        className="relative aspect-[2/3] w-40 snap-start overflow-visible rounded-2xl bg-zinc-800 shadow-xl transition-all duration-200 group-hover:shadow-2xl md:w-48 lg:w-56"
        onClick={() => onMoreInfo(movie)}
      >
        <div className="absolute inset-0 overflow-hidden rounded-2xl bg-zinc-800 transform-gpu transition-transform duration-300 ease-out">
          <img
            src={movie.posterPath}
            alt={movie.title}
            className={`pointer-events-none absolute inset-0 w-full h-full object-cover transform-gpu transition-all duration-500 ease-in-out ${isHovered ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
            loading="lazy"
          />
          <img
            src={previewImageUrl}
            alt={movie.title}
            className={`pointer-events-none absolute inset-0 w-full h-full object-cover transform-gpu transition-all duration-500 ease-in-out ${isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"}`}
            loading="lazy"
          />

          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
          />

          <div className="absolute left-3 top-3 z-20 rounded-full border border-yellow-300/30 bg-black/65 px-2.5 py-1 text-xs font-bold text-yellow-200 shadow-lg backdrop-blur-md">
            {movie.rating.toFixed(1)}
          </div>
        </div>

        {toggleMyList && (
          <motion.div
            whileTap={{ scale: 0.86 }}
            animate={isInMyList ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            className="pointer-events-auto absolute right-3 top-3 z-[80] overflow-visible"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMyList(movie);
              }}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black/60 p-0 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-black/90 hover:shadow-2xl"
              aria-label={isInMyList ? "Remove from My List" : "Add to My List"}
            >
              <Heart
                className={`w-5 h-5 transition-all duration-200 ${
                  isInMyList
                    ? "fill-red-600 text-red-600"
                    : "text-white hover:text-red-600"
                }`}
              />
            </button>
          </motion.div>
        )}

        <div
          className={`pointer-events-none absolute inset-0 z-30 grid place-items-center transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlayTrailer(movie);
            }}
            className="pointer-events-auto grid h-14 w-14 place-items-center rounded-full bg-white text-black shadow-[0_18px_40px_rgba(255,255,255,0.25)] transition-all duration-200 hover:scale-110 hover:shadow-[0_24px_56px_rgba(255,255,255,0.32)]"
            aria-label={`Play ${movie.title}`}
          >
            <Play className="h-6 w-6 fill-black" />
          </button>
        </div>

        <div
          className={`pointer-events-none absolute inset-0 z-30 flex flex-col justify-end p-4 transform-gpu transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-white font-bold text-sm">
              {movie.rating.toFixed(1)}
            </span>
          </div>

          <h3 className="text-white font-bold text-sm mb-3 line-clamp-2 leading-tight">
            {movie.title}
          </h3>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPlayTrailer(movie);
              }}
              className="pointer-events-auto flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-black shadow-md transition-all duration-200 hover:scale-105 hover:bg-white/85 hover:shadow-xl"
            >
              <Play className="w-3 h-3 fill-black" />
              Play
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoreInfo(movie);
              }}
              className="pointer-events-auto flex min-h-10 min-w-10 items-center justify-center rounded-full bg-white/25 p-2 text-white shadow-md backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/40 hover:shadow-xl"
              aria-label="More info"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
