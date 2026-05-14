import { useEffect, useRef, useState } from "react";
import { Mic, Search, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Movie } from "../types/movie";
import { getMovieRecommendations } from "../services/geminiMovieSearch";
import { tmdbService } from "../services/tmdb";
import { transformTMDbMovieDetails } from "../utils/tmdbTransformers";
import { MovieRow } from "./MovieRow";

interface GPTSearchPageProps {
  onPlayTrailer: (movie: Movie) => void;
  onMoreInfo: (movie: Movie) => void;
  toggleMyList: (movie: Movie) => void;
  isInMyList: (movieId: number) => boolean;
  initialQuery?: string;
}

export function GPTSearchPage({
  onPlayTrailer,
  onMoreInfo,
  toggleMyList,
  isInMyList,
  initialQuery = "",
}: GPTSearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");
  const lastInitialQueryRef = useRef("");

  const findMovieDetails = async (movieName: string): Promise<Movie | null> => {
    try {
      console.log(`[GPTSearch] Searching for: ${movieName}`);
      const searchResults = await tmdbService.searchMovies(movieName);
      console.log(
        `[GPTSearch] Found ${searchResults.length} results for "${movieName}"`,
        searchResults,
      );

      if (!searchResults || searchResults.length === 0) {
        console.warn(`[GPTSearch] No results for "${movieName}"`);
        return null;
      }

      const bestMatch = searchResults[0];
      console.log(`[GPTSearch] Best match:`, bestMatch);

      const details = await tmdbService.getMovieDetails(bestMatch.id);
      if (!details?.id) {
        console.warn(`[GPTSearch] No details found for "${movieName}"`);
        return null;
      }

      const movie = transformTMDbMovieDetails(details);

      console.log(`[GPTSearch] Transformed movie:`, movie);

      // Basic validation - just ensure we have title and posterPath
      if (movie && movie.title && movie.posterPath) {
        console.log(`[GPTSearch] ✓ Valid movie: ${movie.title}`);
        return movie;
      }

      console.warn(`[GPTSearch] Invalid movie - missing title or posterPath`);
      return null;
    } catch (err) {
      console.error(`[GPTSearch] Error finding movie "${movieName}":`, err);
      return null;
    }
  };

  const handleSearch = async (query = searchQuery) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isSearching) return;

    setIsSearching(true);
    setHasSearched(true);
    setSearchResults([]);
    setError("");

    try {
      console.log(`[GPTSearch] Starting search for: "${trimmedQuery}"`);

      const movieNames = await getMovieRecommendations(trimmedQuery);
      console.log(`[GPTSearch] Gemini recommended movies:`, movieNames);

      if (!movieNames || movieNames.length === 0) {
        console.warn(`[GPTSearch] Gemini returned no movie names`);
        setError("Could not get recommendations. Try another search.");
        setIsSearching(false);
        return;
      }

      const moviePromises = movieNames.map((movieName: string) =>
        findMovieDetails(movieName).catch((err) => {
          console.error(
            `[GPTSearch] Failed to fetch details for "${movieName}":`,
            err,
          );
          return null;
        }),
      );

      const movies = (await Promise.all(moviePromises)).filter(
        (movie): movie is Movie => Boolean(movie),
      );

      console.log(
        `[GPTSearch] Final results: ${movies.length} movies found`,
        movies,
      );

      setSearchResults(movies);
      if (movies.length === 0) {
        setError("No movies found. Try a different search.");
      }
    } catch (error) {
      console.error("Gemini movie search failed:", error);
      setError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    const trimmedInitialQuery = initialQuery.trim();
    if (
      trimmedInitialQuery &&
      trimmedInitialQuery !== lastInitialQueryRef.current
    ) {
      lastInitialQueryRef.current = trimmedInitialQuery;
      setSearchQuery(trimmedInitialQuery);
      handleSearch(trimmedInitialQuery);
    }
  }, [initialQuery]);

  const suggestions = [
    "3 friends comedy movies",
    "mind bending thrillers",
    "emotional sci-fi dramas",
    "action movies with strong female leads",
    "mystery films with plot twists",
  ];

  return (
    <div className="min-h-screen bg-black px-5 pt-28 text-white sm:px-6 md:px-12">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.22),transparent_32%),radial-gradient(circle_at_80%_25%,rgba(229,9,20,0.16),transparent_28%)]" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-5xl"
      >
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-pink-400 drop-shadow-[0_0_20px_rgba(244,114,182,0.45)]" />
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              GPT Search
            </h1>
          </div>
          <p className="mx-auto max-w-2xl text-lg font-medium text-white/68">
            Ask me anything. I'll find the perfect movie for you.
          </p>
          <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-white/70 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-pink-300" />
            Powered by Gemini AI
          </div>
        </div>

        <div className="mb-8 rounded-[1.6rem] border border-white/12 bg-white/10 p-2 shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          <div className="relative flex items-center gap-2">
            <Search className="pointer-events-none absolute left-5 h-5 w-5 text-white/45" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="What do you want to watch today?"
              className="min-h-14 w-full rounded-2xl border border-transparent bg-black/35 py-4 pl-13 pr-28 text-lg font-semibold text-white outline-none transition-all placeholder:text-white/42 focus:border-pink-400/50 focus:ring-4 focus:ring-pink-500/15"
            />
            <button
              type="button"
              className="absolute right-16 grid h-11 w-11 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Voice search"
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={isSearching || !searchQuery.trim()}
              className="brand-gradient absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white shadow-[0_12px_32px_rgba(236,72,153,0.32)] transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Search movies"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-white/45">Try asking</p>
            <div className="flex flex-wrap gap-3">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileTap={{ scale: 0.96 }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery(suggestion);
                      handleSearch(suggestion);
                    }}
                    className="relative overflow-hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/78 transition-all hover:-translate-y-0.5 hover:border-pink-400/50 hover:bg-white/10 hover:text-white"
                  >
                    {suggestion}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.08] px-5 py-3 text-pink-200 backdrop-blur-md">
              <Sparkles className="w-6 h-6 animate-pulse" />
              <p className="text-lg font-bold">AI is thinking... this may take a few seconds</p>
            </div>
          </motion.div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="-mx-5 md:-mx-12"
          >
            <MovieRow
              title="Search Results"
              movies={searchResults}
              onPlayTrailer={onPlayTrailer}
              onMoreInfo={onMoreInfo}
              toggleMyList={toggleMyList}
              isInMyList={isInMyList}
            />
          </motion.div>
        )}

        {!isSearching && hasSearched && error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-white/70 text-lg">{error}</p>
          </motion.div>
        )}
      </motion.div>

      <div className="h-20" />
    </div>
  );
}
