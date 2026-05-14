import { useEffect, useState } from "react";
import { Movie, MovieCategory } from "../types/movie";
import { tmdbService } from "../services/tmdb";
import {
  transformTMDbMovie,
  transformTMDbTVShow,
} from "../utils/tmdbTransformers";
import { MovieRow } from "../components/MovieRow";

interface CategoryBrowsePageProps {
  pageType: "movies" | "tv";
  onPlayTrailer: (movie: Movie) => void;
  onMoreInfo: (movie: Movie) => void;
  toggleMyList: (movie: Movie) => void;
  isInMyList: (movieId: number) => boolean;
}

const MOVIE_GENRES = {
  action: 28,
  comedy: 35,
  horror: 27,
  romance: 10749,
  animation: 16,
};

const TV_GENRES = {
  drama: 18,
  comedy: 35,
  crime: 80,
  animation: 16,
};

export function CategoryBrowsePage({
  pageType,
  onPlayTrailer,
  onMoreInfo,
  toggleMyList,
  isInMyList,
}: CategoryBrowsePageProps) {
  const [categories, setCategories] = useState<MovieCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);

      try {
        if (pageType === "movies") {
          const [
            genres,
            trending,
            topRated,
            comedy,
            horror,
            action,
            romance,
            animation,
          ] = await Promise.all([
            tmdbService.getGenres(),
            tmdbService.getTrendingMovies(),
            tmdbService.getTopRatedMovies(),
            tmdbService.getMoviesByGenre(MOVIE_GENRES.comedy),
            tmdbService.getMoviesByGenre(MOVIE_GENRES.horror),
            tmdbService.getMoviesByGenre(MOVIE_GENRES.action),
            tmdbService.getMoviesByGenre(MOVIE_GENRES.romance),
            tmdbService.getMoviesByGenre(MOVIE_GENRES.animation),
          ]);

          setCategories([
            {
              title: "Trending Movies",
              movies: trending.map((movie) => transformTMDbMovie(movie, genres)),
            },
            {
              title: "Top Rated Movies",
              movies: topRated.map((movie) => transformTMDbMovie(movie, genres)),
            },
            {
              title: "Comedy Movies",
              movies: comedy.map((movie) => transformTMDbMovie(movie, genres)),
            },
            {
              title: "Horror Movies",
              movies: horror.map((movie) => transformTMDbMovie(movie, genres)),
            },
            {
              title: "Action Movies",
              movies: action.map((movie) => transformTMDbMovie(movie, genres)),
            },
            {
              title: "Romance Movies",
              movies: romance.map((movie) => transformTMDbMovie(movie, genres)),
            },
            {
              title: "Animation (Anime)",
              movies: animation.map((movie) => transformTMDbMovie(movie, genres)),
            },
          ]);
          return;
        }

        const [
          genres,
          trending,
          topRated,
          popular,
          drama,
          comedy,
          crime,
          animation,
        ] = await Promise.all([
          tmdbService.getTVGenres(),
          tmdbService.getTrendingTV(),
          tmdbService.getTopRatedTV(),
          tmdbService.getPopularTV(),
          tmdbService.getTVByGenre(TV_GENRES.drama),
          tmdbService.getTVByGenre(TV_GENRES.comedy),
          tmdbService.getTVByGenre(TV_GENRES.crime),
          tmdbService.getTVByGenre(TV_GENRES.animation),
        ]);

        setCategories([
          {
            title: "Trending TV Shows",
            movies: trending.map((show) => transformTMDbTVShow(show, genres)),
          },
          {
            title: "Top Rated TV Shows",
            movies: topRated.map((show) => transformTMDbTVShow(show, genres)),
          },
          {
            title: "Popular TV Shows",
            movies: popular.map((show) => transformTMDbTVShow(show, genres)),
          },
          {
            title: "Drama TV Shows",
            movies: drama.map((show) => transformTMDbTVShow(show, genres)),
          },
          {
            title: "Comedy TV Shows",
            movies: comedy.map((show) => transformTMDbTVShow(show, genres)),
          },
          {
            title: "Crime TV Shows",
            movies: crime.map((show) => transformTMDbTVShow(show, genres)),
          },
          {
            title: "Animation (Anime Series)",
            movies: animation.map((show) => transformTMDbTVShow(show, genres)),
          },
        ]);
      } catch (error) {
        console.error(`Failed to load ${pageType} categories:`, error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [pageType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black px-6 pt-24 md:px-12">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 pt-24 md:px-12">
      <div className="space-y-10">
        {categories.map((category) => (
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
