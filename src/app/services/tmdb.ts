import { BACKEND_URL } from "./backendUrl";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export interface TMDbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  adult: boolean;
  video: boolean;
  popularity: number;
}

export interface TMDbTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date: string;
  genre_ids: number[];
  popularity: number;
}

export interface TMDbGenre {
  id: number;
  name: string;
}

export interface TMDbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface TMDbMovieDetails extends TMDbMovie {
  genres: TMDbGenre[];
  credits: {
    cast: TMDbCastMember[];
  };
  videos: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      type: string;
      site: string;
    }>;
  };
}

export interface TMDbTVDetails extends TMDbTVShow {
  genres: TMDbGenre[];
  credits: {
    cast: TMDbCastMember[];
  };
  videos: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      type: string;
      site: string;
    }>;
  };
}

class TMDbService {
  private emptyListResponse() {
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    };
  }

  private async fetchFromAPI(endpoint: string, fallback: any = this.emptyListResponse()): Promise<any> {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${BACKEND_URL}/api/tmdb${normalizedEndpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return fallback;
      }

      return response.json();
    } catch (error) {
      console.warn(`[TMDbService] Using fallback for ${endpoint}`, error);
      return fallback;
    }
  }

  async getPopularMovies(): Promise<TMDbMovie[]> {
    const data = await this.fetchFromAPI("/movie/popular");
    return data.results
      .filter((movie: TMDbMovie) => !movie.adult)
      .filter((movie: TMDbMovie) => movie.poster_path !== null);
  }

  async getTrendingMovies(): Promise<TMDbMovie[]> {
    const data = await this.fetchFromAPI("/trending/movie/week");
    return data.results
      .filter((movie: TMDbMovie) => !movie.adult)
      .filter((movie: TMDbMovie) => movie.poster_path !== null);
  }

  async getTopRatedMovies(): Promise<TMDbMovie[]> {
    const data = await this.fetchFromAPI("/movie/top_rated");
    return data.results
      .filter((movie: TMDbMovie) => !movie.adult)
      .filter((movie: TMDbMovie) => movie.poster_path !== null);
  }

  async getNowPlayingMovies(): Promise<TMDbMovie[]> {
    const data = await this.fetchFromAPI("/movie/now_playing");
    return data.results
      .filter((movie: TMDbMovie) => !movie.adult)
      .filter((movie: TMDbMovie) => movie.poster_path !== null);
  }

  async getUpcomingMovies(): Promise<TMDbMovie[]> {
    const data = await this.fetchFromAPI("/movie/upcoming");
    return data.results
      .filter((movie: TMDbMovie) => !movie.adult)
      .filter((movie: TMDbMovie) => movie.poster_path !== null);
  }

  async getMoviesByGenre(genreId: number): Promise<TMDbMovie[]> {
    const params = new URLSearchParams({
      with_genres: String(genreId),
      include_adult: "false",
      language: "en-US",
      page: "1",
      sort_by: "popularity.desc",
    });
    const data = await this.fetchFromAPI(`/discover/movie?${params.toString()}`);
    return (data.results || [])
      .filter((movie: TMDbMovie) => !movie.adult)
      .filter((movie: TMDbMovie) => movie.poster_path !== null);
  }

  async getMovieDetails(movieId: number): Promise<TMDbMovieDetails | null> {
    const data = await this.fetchFromAPI(
      `/movie/${movieId}?append_to_response=credits,videos`,
      null,
    );
    return data;
  }

  async getTrendingTV(): Promise<TMDbTVShow[]> {
    const data = await this.fetchFromAPI("/trending/tv/week");
    return (data.results || [])
      .filter((show: TMDbTVShow) => show.poster_path !== null);
  }

  async getTopRatedTV(): Promise<TMDbTVShow[]> {
    const data = await this.fetchFromAPI("/tv/top_rated");
    return (data.results || [])
      .filter((show: TMDbTVShow) => show.poster_path !== null);
  }

  async getPopularTV(): Promise<TMDbTVShow[]> {
    const data = await this.fetchFromAPI("/tv/popular");
    return (data.results || [])
      .filter((show: TMDbTVShow) => show.poster_path !== null);
  }

  async getTVByGenre(genreId: number): Promise<TMDbTVShow[]> {
    const params = new URLSearchParams({
      with_genres: String(genreId),
      include_adult: "false",
      language: "en-US",
      page: "1",
      sort_by: "popularity.desc",
    });
    const data = await this.fetchFromAPI(`/discover/tv?${params.toString()}`);
    return (data.results || [])
      .filter((show: TMDbTVShow) => show.poster_path !== null);
  }

  async getTVDetails(tvId: number): Promise<TMDbTVDetails | null> {
    const data = await this.fetchFromAPI(
      `/tv/${tvId}?append_to_response=credits,videos`,
      null,
    );
    return data;
  }

  async searchMovies(query: string): Promise<TMDbMovie[]> {
    const params = new URLSearchParams({
      query,
      include_adult: "false",
      language: "en-US",
      page: "1",
    });
    const data = await this.fetchFromAPI(`/search/movie?${params.toString()}`);
    return (data.results || [])
      .filter((movie: TMDbMovie) => !movie.adult)
      .filter((movie: TMDbMovie) => movie.title); // Only filter by title, allow placeholder posters
  }

  async getGenres(): Promise<TMDbGenre[]> {
    const data = await this.fetchFromAPI("/genre/movie/list", { genres: [] });
    return data.genres || [];
  }

  async getTVGenres(): Promise<TMDbGenre[]> {
    const data = await this.fetchFromAPI("/genre/tv/list", { genres: [] });
    return data.genres || [];
  }

  getImageUrl(
    path: string | null,
    size: "w500" | "w780" | "original" = "w500",
  ): string {
    if (!path) return "https://via.placeholder.com/500x750?text=No+Image";
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  getBackdropUrl(path: string | null): string {
    return this.getImageUrl(path, "original");
  }

  getPosterUrl(path: string | null): string {
    return this.getImageUrl(path, "w500");
  }
}

export const tmdbService = new TMDbService();
