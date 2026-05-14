import { ArrowDownUp, Film, Heart } from "lucide-react";
import { motion } from "motion/react";
import { Movie } from "../types/movie";
import { MovieCard } from "./MovieCard";

interface MyListPageProps {
  onPlayTrailer: (movie: Movie) => void;
  onMoreInfo: (movie: Movie) => void;
  toggleMyList: (movie: Movie) => void;
  myListMovies: Movie[];
  onBrowse?: () => void;
}

export function MyListPage({
  onPlayTrailer,
  onMoreInfo,
  toggleMyList,
  myListMovies,
  onBrowse,
}: MyListPageProps) {
  return (
    <div className="min-h-screen bg-black px-5 pt-28 text-white sm:px-6 md:px-12">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(229,9,20,0.18),transparent_30%),radial-gradient(circle_at_85%_12%,rgba(236,72,153,0.14),transparent_28%)]" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            <Heart className="h-10 w-10 fill-red-600 text-red-600 drop-shadow-[0_0_22px_rgba(229,9,20,0.45)]" />
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">My List</h1>
              <p className="mt-1 font-medium text-white/55">
                {myListMovies.length} saved {myListMovies.length === 1 ? "title" : "titles"}
              </p>
            </div>
          </div>
          {myListMovies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="glass-panel flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
              >
                <Film className="h-4 w-4" />
                All titles
              </button>
              <button
                type="button"
                className="glass-panel flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
              >
                <ArrowDownUp className="h-4 w-4" />
                Recently added
              </button>
            </div>
          )}
        </div>

        {myListMovies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mx-auto max-w-xl py-16 text-center"
          >
            <div className="relative mx-auto mb-7 grid h-28 w-28 place-items-center">
              <motion.span
                animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.08, 0.35] }}
                transition={{ repeat: Infinity, duration: 2.4 }}
                className="absolute inset-0 rounded-full bg-red-600/30"
              />
              <Heart className="relative h-20 w-20 fill-red-600 text-red-600" />
              <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-pink-300" />
              <span className="absolute bottom-6 left-4 h-1.5 w-1.5 rounded-full bg-red-300" />
            </div>
            <h2 className="mb-3 text-3xl font-black text-white">Start building your watchlist</h2>
            <p className="mb-7 text-lg font-medium text-white/55">
              Save the films and shows you want ready for your next session.
            </p>
            <button
              type="button"
              onClick={onBrowse}
              className="brand-gradient min-h-12 rounded-lg px-6 py-3 font-black text-white shadow-[0_18px_42px_rgba(229,9,20,0.28)] transition-all hover:scale-105"
            >
              Browse movies
            </button>
          </motion.div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {myListMovies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MovieCard
                    movie={movie}
                    onPlayTrailer={onPlayTrailer}
                    onMoreInfo={onMoreInfo}
                    toggleMyList={toggleMyList}
                    isInMyList={true}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <div className="h-20" />
    </div>
  );
}
