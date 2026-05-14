// Backend API service - calls our Node/Express proxy instead of TMDb directly

import type { TMDbMovieDetails } from "./tmdb";
import { BACKEND_URL } from "./backendUrl";

export interface BackendMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  adult?: boolean;
}

export interface BackendGenre {
  id: number;
  name: string;
}

class BackendService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_URL;
    console.log(`[BackendService] Initialized with URL: ${this.baseUrl}`);
  }

  private async fetchFromBackend<T>(endpoint: string, fallback: T): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        return fallback;
      }

      return await response.json();
    } catch (error) {
      console.warn(`[BackendService] Using fallback for ${endpoint}`, error);
      return fallback;
    }
  }

  // 🔥 COMMON FILTER
  private filterMovies(data: BackendMovie[]): BackendMovie[] {
    return (data || [])
      .filter((m) => !m.adult) // remove 18+
      .filter((m) => m.poster_path); // remove broken images
  }

  async getPopularMovies() {
    const data = await this.fetchFromBackend<BackendMovie[]>("/api/movies/popular", []);
    return this.filterMovies(data);
  }

  async getTopRatedMovies() {
    const data = await this.fetchFromBackend<BackendMovie[]>("/api/movies/top-rated", []);
    return this.filterMovies(data);
  }

  async getNowPlayingMovies() {
    const data = await this.fetchFromBackend<BackendMovie[]>("/api/movies/now-playing", []);
    return this.filterMovies(data);
  }

  async getUpcomingMovies() {
    const data = await this.fetchFromBackend<BackendMovie[]>("/api/movies/upcoming", []);
    return this.filterMovies(data);
  }

  async getTeluguMovies() {
    const data = await this.fetchFromBackend<BackendMovie[]>("/api/movies/telugu", []);
    return this.filterMovies(data);
  }

  async getHindiMovies() {
    const data = await this.fetchFromBackend<BackendMovie[]>("/api/movies/hindi", []);
    return this.filterMovies(data);
  }

  async getRomanticMovies() {
    const data = await this.fetchFromBackend<BackendMovie[]>("/api/movies/romance", []);
    return this.filterMovies(data);
  }

  async getRomanceMovies() {
    return this.getRomanticMovies();
  }

  async getThrillerMovies() {
    const data = await this.fetchFromBackend<BackendMovie[]>("/api/movies/thriller", []);
    return this.filterMovies(data);
  }

  async getHorrorMovies() {
    const data = await this.fetchFromBackend<BackendMovie[]>("/api/movies/horror", []);
    return this.filterMovies(data);
  }

  async getComedyMovies() {
    const data = await this.fetchFromBackend<BackendMovie[]>("/api/movies/comedy", []);
    return this.filterMovies(data);
  }

  async getAnimeMovies() {
    const data = await this.fetchFromBackend<BackendMovie[]>("/api/movies/anime", []);
    return this.filterMovies(data);
  }

  async discoverMovies(params: {
    with_original_language?: string;
    with_genres?: number;
  }) {
    try {
      const searchParams = new URLSearchParams();

      if (params.with_original_language) {
        searchParams.set(
          "with_original_language",
          params.with_original_language
        );
      }

      if (params.with_genres) {
        searchParams.set("with_genres", String(params.with_genres));
      }

      const data = await this.fetchFromBackend<BackendMovie[]>(
        `/api/movies/discover?${searchParams.toString()}`,
        [],
      );

      return this.filterMovies(data);
    } catch {
      return [];
    }
  }

  async getGenres() {
    const data = await this.fetchFromBackend<BackendGenre[] | { genres: BackendGenre[] }>(
      "/api/genres",
      [],
    );

    return Array.isArray(data) ? data : data.genres || [];
  }

  async getMovieDetails(movieId: number): Promise<TMDbMovieDetails | null> {
    return await this.fetchFromBackend<TMDbMovieDetails | null>(
      `/api/movies/${movieId}`,
      null,
    );
  }
}

export const backendService = new BackendService();
