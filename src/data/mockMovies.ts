import { Movie, MovieCategory } from "../types/movie";
import {
  backendService,
  BackendMovie,
  BackendGenre,
} from "../services/backend";
import { tmdbService, type TMDbMovie } from "../services/tmdb";
import {
  transformTMDbMovie,
  transformTMDbMovieDetails,
  transformTMDbTVDetails,
} from "../utils/tmdbTransformers";
import { buildYouTubeEmbedUrl } from "../utils/video";
import { getDummyFeaturedMovie, getDummyCategories } from "./dummyData";

export type StoredMovie = Omit<Movie, "id" | "sourceId"> & {
  id: number;
  sourceId: number;
};

export function toStoredMovie(movie: Movie): StoredMovie {
  const storedMovie: StoredMovie = {
    ...movie,
    id: movie.id,
    sourceId: movie.sourceId ?? movie.id,
    mediaType: movie.mediaType ?? "movie",
    title: movie.title ?? "",
    overview: movie.overview ?? "",
    posterPath: movie.posterPath ?? "",
    backdropPath: movie.backdropPath ?? "",
    rating: movie.rating ?? 0,
    releaseDate: movie.releaseDate ?? "",
    genres: movie.genres ?? [],
    cast: movie.cast ?? [],
    trailerUrl: movie.trailerUrl ?? "",
  };

  return Object.fromEntries(
    Object.entries(storedMovie).filter(([, value]) => value !== undefined),
  ) as StoredMovie;
}

export function fromStoredMovie(storedMovie: StoredMovie): Movie {
  const id = Number(storedMovie.id);

  return {
    ...storedMovie,
    id,
    sourceId: storedMovie.sourceId ?? id,
    mediaType: storedMovie.mediaType ?? "movie",
  };
}

// Movie transformation from backend format
function transformBackendMovie(
  movie: BackendMovie,
  genres: BackendGenre[],
): Movie {
  const movieGenres = movie.genre_ids
    ? (movie.genre_ids
        .map((id) => genres.find((g) => g.id === id)?.name)
        .filter(Boolean) as string[])
    : [];

  return {
    id: movie.id,
    sourceId: movie.id,
    mediaType: "movie",
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop",
    backdropPath: movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w1920_and_h1080_bestv2${movie.backdrop_path}`
      : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop",
    rating: movie.vote_average || 0,
    releaseDate: movie.release_date || "",
    genres: movieGenres,
    cast: [],
    trailerUrl: buildYouTubeEmbedUrl("dQw4w9WgXcQ", {
      muted: true,
      background: true,
    }),
  };
}

const detailedMovieCache = new Map<number, Movie>();

export async function getMovieWithDetails(movie: Movie): Promise<Movie> {
  const cachedMovie = detailedMovieCache.get(movie.id);
  if (cachedMovie) {
    return cachedMovie;
  }

  if (movie.mediaType === "tv") {
    try {
      const details = await tmdbService.getTVDetails(movie.sourceId || movie.id);
      if (!details?.id) {
        detailedMovieCache.set(movie.id, movie);
        return movie;
      }

      const detailedShow = {
        ...movie,
        ...transformTMDbTVDetails(details),
        id: movie.id,
        posterPath: movie.posterPath,
        backdropPath: movie.backdropPath,
      };

      detailedMovieCache.set(movie.id, detailedShow);
      return detailedShow;
    } catch (error) {
      console.error("Failed to load TV details:", error);
      detailedMovieCache.set(movie.id, movie);
      return movie;
    }
  }

  const details = await backendService.getMovieDetails(movie.sourceId || movie.id);
  if (!details?.id) {
    detailedMovieCache.set(movie.id, movie);
    return movie;
  }

  const detailedMovie = {
    ...movie,
    ...transformTMDbMovieDetails(details),
    posterPath: movie.posterPath,
    backdropPath: movie.backdropPath,
  };

  detailedMovieCache.set(movie.id, detailedMovie);
  return detailedMovie;
}

// Cache for loaded data
let cachedFeaturedMovie: Movie | null = null;
let cachedMovieCategories: MovieCategory[] = [];
let loadingPromise: Promise<void> | null = null;

export async function loadRealMovies(): Promise<void> {
  // If already loading, wait for the existing promise
  if (loadingPromise) {
    await loadingPromise;
    return;
  }

  // If already loaded, return immediately
  if (cachedFeaturedMovie && cachedMovieCategories.length > 0) {
    return;
  }

  // Create a new loading promise and store it
  loadingPromise = (async () => {
    try {
      console.log("🔄 Loading real movies from backend...");

      // Load genres first
      console.log("📂 Fetching genres...");
      let genres: BackendGenre[] = [];
      try {
        genres = await backendService.getGenres();
        console.log(`✅ Got ${genres.length} genres`);
      } catch (error) {
        console.error("❌ Failed to fetch genres:", error);
        genres = [];
      }

      // Load different movie categories in parallel
      console.log("🎬 Fetching movie categories...");

      let popularMovies: BackendMovie[] = [];
      let topRatedMovies: BackendMovie[] = [];
      let nowPlayingMovies: BackendMovie[] = [];
      let upcomingMovies: BackendMovie[] = [];
      let trendingMovies: TMDbMovie[] = [];
      let teluguMovies: BackendMovie[] = [];
      let hindiMovies: BackendMovie[] = [];
      let romanticMovies: BackendMovie[] = [];
      let thrillerMovies: BackendMovie[] = [];
      let horrorMovies: BackendMovie[] = [];
      let comedyMovies: BackendMovie[] = [];

      try {
        // Fetch all categories in parallel for better performance
        const [
          popular,
          topRated,
          nowPlaying,
          upcoming,
          trending,
          telugu,
          hindi,
          romantic,
          thriller,
          horror,
          comedy,
        ] = await Promise.all([
          backendService.getPopularMovies().catch((error) => {
            console.error("❌ Failed to fetch popular movies:", error);
            return [];
          }),
          backendService.getTopRatedMovies().catch((error) => {
            console.error("❌ Failed to fetch top rated movies:", error);
            return [];
          }),
          backendService.getNowPlayingMovies().catch((error) => {
            console.error("❌ Failed to fetch now playing movies:", error);
            return [];
          }),
          backendService.getUpcomingMovies().catch((error) => {
            console.error("❌ Failed to fetch upcoming movies:", error);
            return [];
          }),
          tmdbService.getTrendingMovies().catch((error) => {
            console.error("Failed to fetch trending movies:", error);
            return [];
          }),
          backendService.getTeluguMovies().catch((error) => {
            console.error("❌ Failed to fetch Telugu movies:", error);
            return [];
          }),
          backendService.getHindiMovies().catch((error) => {
            console.error("❌ Failed to fetch Hindi movies:", error);
            return [];
          }),
          backendService.getRomanticMovies().catch((error) => {
            console.error("❌ Failed to fetch romantic movies:", error);
            return [];
          }),
          backendService.getThrillerMovies().catch((error) => {
            console.error("❌ Failed to fetch thriller movies:", error);
            return [];
          }),
          backendService.getHorrorMovies().catch((error) => {
            console.error("❌ Failed to fetch horror movies:", error);
            return [];
          }),
          backendService.getComedyMovies().catch((error) => {
            console.error("❌ Failed to fetch comedy movies:", error);
            return [];
          }),
        ]);

        popularMovies = popular;
        topRatedMovies = topRated;
        nowPlayingMovies = nowPlaying;
        upcomingMovies = upcoming;
        trendingMovies = trending;
        teluguMovies = telugu;
        hindiMovies = hindi;
        romanticMovies = romantic;
        thrillerMovies = thriller;
        horrorMovies = horror;
        comedyMovies = comedy;

        console.log(
          `📊 Popular: ${popularMovies.length}, Top Rated: ${topRatedMovies.length}, Now Playing: ${nowPlayingMovies.length}, Upcoming: ${upcomingMovies.length}, Telugu: ${teluguMovies.length}, Hindi: ${hindiMovies.length}, Romantic: ${romanticMovies.length}, Thriller: ${thrillerMovies.length}, Horror: ${horrorMovies.length}, Comedy: ${comedyMovies.length}`,
        );
      } catch (error) {
        console.error("❌ Error fetching movie categories:", error);
      }

      // Transform movies
      console.log("🔄 Transforming movies...");
      const popularBase = popularMovies.map((m) =>
        transformBackendMovie(m, genres),
      );
      const topRatedBase = topRatedMovies.map((m) =>
        transformBackendMovie(m, genres),
      );
      const nowPlayingBase = nowPlayingMovies.map((m) =>
        transformBackendMovie(m, genres),
      );
      const upcomingBase = upcomingMovies.map((m) =>
        transformBackendMovie(m, genres),
      );
      const trendingBase = trendingMovies.map((m) =>
        transformTMDbMovie(m, genres),
      );
      const teluguBase = teluguMovies.map((m) =>
        transformBackendMovie(m, genres),
      );
      const hindiBase = hindiMovies.map((m) =>
        transformBackendMovie(m, genres),
      );
      const romanticBase = romanticMovies.map((m) =>
        transformBackendMovie(m, genres),
      );
      const thrillerBase = thrillerMovies.map((m) =>
        transformBackendMovie(m, genres),
      );
      const horrorBase = horrorMovies.map((m) =>
        transformBackendMovie(m, genres),
      );
      const comedyBase = comedyMovies.map((m) =>
        transformBackendMovie(m, genres),
      );

      const popular = popularBase;
      const topRated = topRatedBase;
      const nowPlaying = nowPlayingBase;
      const upcoming = upcomingBase;
      const trending = trendingBase;
      const telugu = teluguBase;
      const hindi = hindiBase;
      const romantic = romanticBase;
      const thriller = thrillerBase;
      const horror = horrorBase;
      const comedy = comedyBase;

      console.log(
        `📊 Transformed counts - Popular: ${popular.length}, Top Rated: ${topRated.length}, Now Playing: ${nowPlaying.length}, Upcoming: ${upcoming.length}, Telugu: ${telugu.length}, Hindi: ${hindi.length}, Romantic: ${romantic.length}, Thriller: ${thriller.length}, Horror: ${horror.length}, Comedy: ${comedy.length}`,
      );

      // Set featured movie from a random pick among the top 5 trending movies.
      if (trending.length > 0) {
        console.log("Setting featured movie from trending movies...");
        const topFiveTrending = trending.slice(0, 5);
        const randomIndex = Math.floor(Math.random() * 5);
        const featured = topFiveTrending[randomIndex] || topFiveTrending[0];
        cachedFeaturedMovie = await getMovieWithDetails(featured);
        console.log("Featured movie set:", cachedFeaturedMovie?.title);
      } else if (popularMovies.length > 0) {
        console.log("Setting featured movie from popular fallback...");
        cachedFeaturedMovie = await getMovieWithDetails(popular[0]);
        console.log("Featured movie set:", cachedFeaturedMovie?.title);
      }

      // Create movie categories
      cachedMovieCategories = [
        {
          title: "Popular on Netflix",
          movies: popular,
        },
        {
          title: "Top Rated",
          movies: topRated,
        },
        {
          title: "Now Playing",
          movies: nowPlaying,
        },
        {
          title: "Coming Soon",
          movies: upcoming,
        },
        {
          title: "Popular Telugu",
          movies: telugu,
        },
        {
          title: "Popular Hindi",
          movies: hindi,
        },
        {
          title: "Romantic",
          movies: romantic,
        },
        {
          title: "Thriller",
          movies: thriller,
        },
        {
          title: "Horror",
          movies: horror,
        },
        {
          title: "Comedy",
          movies: comedy,
        },
      ];

      if (
        cachedMovieCategories.every((category) => category.movies.length === 0)
      ) {
        cachedFeaturedMovie = getDummyFeaturedMovie();
        cachedMovieCategories = getDummyCategories();
      }

      console.log(
        "✅ Categories ready for UI:",
        cachedMovieCategories.map((category) => ({
          title: category.title,
          movies: category.movies.length,
        })),
      );
      console.log("✅ Real movies loaded successfully!");
    } catch (error) {
      console.error("❌ Failed to load movies from backend:", error);
      console.log("🔄 Falling back to dummy data...");
      // Fallback to dummy data if API fails
      cachedFeaturedMovie = getDummyFeaturedMovie();
      cachedMovieCategories = getDummyCategories();
    } finally {
      loadingPromise = null;
    }
  })();

  // Wait for the loading promise
  await loadingPromise;
}

// Getters for the cached data
export async function getFeaturedMovie(): Promise<Movie> {
  await loadRealMovies();
  console.log("📺 Returning featured movie:", cachedFeaturedMovie?.title);
  return cachedFeaturedMovie || getDummyFeaturedMovie();
}

export async function getMovieCategories(): Promise<MovieCategory[]> {
  await loadRealMovies();
  console.log(
    "📂 Returning movie categories count:",
    cachedMovieCategories.length,
  );
  console.log(
    "📂 Category details:",
    cachedMovieCategories.map((cat) => ({
      title: cat.title,
      movies: cat.movies.length,
    })),
  );
  return cachedMovieCategories.length > 0
    ? cachedMovieCategories
    : getDummyCategories();
}

export async function getAllMovies(): Promise<Movie[]> {
  const categories = await getMovieCategories();
  const moviesById = new Map<number, Movie>();

  categories.forEach((category) => {
    category.movies.forEach((movie) => {
      moviesById.set(movie.id, movie);
    });
  });

  return Array.from(moviesById.values());
}

// Legacy exports for backward compatibility (will load real data)
export const FEATURED_MOVIE = getDummyFeaturedMovie(); // This will be replaced when getFeaturedMovie() is called
export const MOVIE_CATEGORIES = getDummyCategories(); // This will be replaced when getMovieCategories() is called
