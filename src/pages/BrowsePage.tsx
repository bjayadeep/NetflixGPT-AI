import { useState, useEffect } from "react";
import { Hero } from "../components/Hero";
import { MovieRow, MovieRowSkeleton } from "../components/MovieRow";
import { getFeaturedMovie, getMovieCategories } from "../data/mockMovies";
import { Movie, MovieCategory } from "../types/movie";

interface BrowsePageProps {
  onPlayTrailer: (movie: Movie) => void;
  onMoreInfo: (movie: Movie) => void;
  toggleMyList: (movie: Movie) => void;
  isInMyList: (movieId: number) => boolean;
}

export function BrowsePage({
  onPlayTrailer,
  onMoreInfo,
  toggleMyList,
  isInMyList,
}: BrowsePageProps) {
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [movieCategories, setMovieCategories] = useState<MovieCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        console.log("📥 BrowsePage: Loading movies...");
        const [featured, categories] = await Promise.all([
          getFeaturedMovie(),
          getMovieCategories(),
        ]);
        console.log("✅ BrowsePage: Loaded featured movie:", featured?.title);
        console.log(
          "✅ BrowsePage: Loaded categories:",
          categories.length,
          categories.map((c) => ({ title: c.title, movies: c.movies.length })),
        );
        setFeaturedMovie(featured);
        setMovieCategories(categories);
      } catch (error) {
        console.error("Failed to load movies:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="relative h-[88vh] min-h-[620px] overflow-hidden">
          <div className="shimmer absolute inset-0 bg-zinc-900" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute bottom-36 left-5 right-5 max-w-3xl sm:left-6 md:left-12">
            <div className="mb-5 h-16 w-4/5 rounded-xl bg-white/10 md:h-24" />
            <div className="mb-4 h-5 w-2/3 rounded-full bg-white/10" />
            <div className="mb-8 h-5 w-1/2 rounded-full bg-white/10" />
            <div className="flex gap-3">
              <div className="h-12 w-32 rounded-lg bg-white/15" />
              <div className="h-12 w-40 rounded-lg bg-white/10" />
            </div>
          </div>
        </div>
        <div className="relative z-40 -mt-20 space-y-4">
          <MovieRowSkeleton title="Trending" />
          <MovieRowSkeleton title="Popular" />
          <MovieRowSkeleton title="New Releases" />
        </div>
      </div>
    );
  }

  if (!featuredMovie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">
          Failed to load movies. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Hero
        movie={featuredMovie}
        onPlayTrailer={() => onPlayTrailer(featuredMovie)}
        onMoreInfo={() => onMoreInfo(featuredMovie)}
        onToggleMyList={() => toggleMyList(featuredMovie)}
        isInMyList={isInMyList(featuredMovie.id)}
      />

      <div className="relative z-40 -mt-16 space-y-2 px-0 pt-2 md:-mt-24">
        {movieCategories.map((category) => (
          <MovieRow
            key={category.title}
            title={category.title}
            movies={category.movies}
            onPlayTrailer={onPlayTrailer}
            onMoreInfo={onMoreInfo}
            toggleMyList={toggleMyList}
            isInMyList={isInMyList}
          />
        ))}
      </div>

      <div className="h-20" />
    </div>
  );
}
