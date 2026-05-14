import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { Movie } from "../types/movie";
import { MovieCard } from "./MovieCard";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onPlayTrailer: (movie: Movie) => void;
  onMoreInfo: (movie: Movie) => void;
  toggleMyList?: (movie: Movie) => void;
  isInMyList?: (movieId: number) => boolean;
}

export function MovieRow({
  title,
  movies,
  onPlayTrailer,
  onMoreInfo,
  toggleMyList,
  isInMyList,
}: MovieRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -800 : 800;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="group/row mb-9 md:mb-12"
    >
      <h2 className="mb-3 px-4 text-xl font-bold tracking-tight text-white md:px-6 md:text-2xl">
        {title}
      </h2>

      <div className="relative">
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute bottom-8 left-0 top-2 z-20 flex w-14 items-center justify-center bg-gradient-to-r from-black/95 via-black/55 to-transparent text-white opacity-0 transition-opacity duration-200 hover:from-black group-hover/row:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-8 h-8 drop-shadow-lg" />
        </button>

        <div
          ref={scrollContainerRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-10 pt-3 scroll-smooth md:gap-6 md:px-6"
        >
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.025, duration: 0.34 }}
              className="transition-opacity duration-300 hover:opacity-100 group-hover/row:opacity-55"
            >
              <MovieCard
                movie={movie}
                onPlayTrailer={onPlayTrailer}
                onMoreInfo={onMoreInfo}
                toggleMyList={toggleMyList}
                isInMyList={isInMyList ? isInMyList(movie.id) : false}
              />
            </motion.div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute bottom-8 right-0 top-2 z-20 flex w-14 items-center justify-center bg-gradient-to-l from-black/95 via-black/55 to-transparent text-white opacity-0 transition-opacity duration-200 hover:from-black group-hover/row:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-8 h-8 drop-shadow-lg" />
        </button>
      </div>
    </motion.section>
  );
}

export function MovieRowSkeleton({ title = "Loading" }: { title?: string }) {
  return (
    <section className="mb-9 md:mb-12" aria-label={`${title} loading`}>
      <div className="mx-4 mb-4 h-6 w-44 rounded-full bg-white/10 md:mx-6" />
      <div className="scrollbar-hide flex gap-5 overflow-hidden px-4 pb-10 pt-3 md:gap-6 md:px-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="shimmer h-[240px] w-40 shrink-0 rounded-xl bg-zinc-800/70 md:h-[288px] md:w-48 lg:h-[336px] lg:w-56"
          />
        ))}
      </div>
    </section>
  );
}
