export interface MovieCastMember {
  name: string;
  profilePath: string;
  wikiUrl: string;
}

export interface Movie {
  id: number;
  sourceId?: number;
  mediaType?: "movie" | "tv";
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  rating: number;
  releaseDate: string;
  genres: string[];
  cast: MovieCastMember[];
  trailerUrl: string;
}

export interface MovieCategory {
  title: string;
  movies: Movie[];
}

export type Page = "home" | "gpt-search" | "movies" | "tv-shows" | "my-list";
