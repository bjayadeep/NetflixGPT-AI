import { Movie, MovieCastMember } from "../types/movie";
import {
  TMDbMovie,
  TMDbMovieDetails,
  TMDbTVShow,
  TMDbTVDetails,
  TMDbGenre,
  TMDbCastMember,
  tmdbService,
} from "../services/tmdb";
import { buildYouTubeEmbedUrl } from "./video";

function buildActorWikiUrl(name: string): string {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(name.replace(/\s+/g, "_"))}`;
}

function transformTMDbCastMember(actor: TMDbCastMember): MovieCastMember {
  return {
    name: actor.name,
    profilePath: tmdbService.getImageUrl(actor.profile_path, "w500"),
    wikiUrl: buildActorWikiUrl(actor.name),
  };
}

export function transformTMDbMovie(
  tmdbMovie: TMDbMovie,
  genres: TMDbGenre[] = [],
): Movie {
  const genreNames = tmdbMovie.genre_ids
    ? tmdbMovie.genre_ids
        .map((id) => genres.find((genre) => genre.id === id)?.name)
        .filter(Boolean)
    : (tmdbMovie as any).genres?.map((g: any) => g.name) || [];

  return {
    id: tmdbMovie.id,
    sourceId: tmdbMovie.id,
    mediaType: "movie",
    title: tmdbMovie.title,
    overview: tmdbMovie.overview,
    posterPath: tmdbService.getPosterUrl(tmdbMovie.poster_path),
    backdropPath: tmdbService.getBackdropUrl(tmdbMovie.backdrop_path),
    rating: Math.round(tmdbMovie.vote_average * 10) / 10,
    releaseDate: tmdbMovie.release_date,
    genres: genreNames.length > 0 ? genreNames : ["Unknown"],
    cast: [],
    trailerUrl: buildYouTubeEmbedUrl("dQw4w9WgXcQ", {
      muted: true,
      background: true,
    }),
  };
}

export function transformTMDbTVShow(
  tmdbTVShow: TMDbTVShow,
  genres: TMDbGenre[] = [],
): Movie {
  const genreNames = tmdbTVShow.genre_ids
    ? tmdbTVShow.genre_ids
        .map((id) => genres.find((genre) => genre.id === id)?.name)
        .filter(Boolean)
    : (tmdbTVShow as any).genres?.map((g: any) => g.name) || [];

  return {
    id: Number(`2${tmdbTVShow.id}`),
    sourceId: tmdbTVShow.id,
    mediaType: "tv",
    title: tmdbTVShow.name,
    overview: tmdbTVShow.overview,
    posterPath: tmdbService.getPosterUrl(tmdbTVShow.poster_path),
    backdropPath: tmdbService.getBackdropUrl(tmdbTVShow.backdrop_path),
    rating: Math.round(tmdbTVShow.vote_average * 10) / 10,
    releaseDate: tmdbTVShow.first_air_date,
    genres: genreNames.length > 0 ? genreNames : ["Unknown"],
    cast: [],
    trailerUrl: buildYouTubeEmbedUrl("dQw4w9WgXcQ", {
      muted: true,
      background: true,
    }),
  };
}

export function transformTMDbMovieDetails(
  tmdbMovieDetails: TMDbMovieDetails,
): Movie {
  const movie = transformTMDbMovie(tmdbMovieDetails, tmdbMovieDetails.genres);
  const trailer = (tmdbMovieDetails.videos?.results || []).find(
    (video) => video.type === "Trailer" && video.site === "YouTube",
  );

  return {
    ...movie,
    genres: (tmdbMovieDetails.genres || []).map((genre) => genre.name),
    cast: (tmdbMovieDetails.credits?.cast || [])
      .slice(0, 6)
      .map(transformTMDbCastMember),
    trailerUrl: trailer
      ? buildYouTubeEmbedUrl(trailer.key, { muted: true, background: true })
      : buildYouTubeEmbedUrl("dQw4w9WgXcQ", {
          muted: true,
          background: true,
    }),
  };
}

export function transformTMDbTVDetails(tmdbTVDetails: TMDbTVDetails): Movie {
  const show = transformTMDbTVShow(tmdbTVDetails, tmdbTVDetails.genres);
  const trailer = (tmdbTVDetails.videos?.results || []).find(
    (video) => video.type === "Trailer" && video.site === "YouTube",
  );

  return {
    ...show,
    genres: (tmdbTVDetails.genres || []).map((genre) => genre.name),
    cast: (tmdbTVDetails.credits?.cast || [])
      .slice(0, 6)
      .map(transformTMDbCastMember),
    trailerUrl: trailer
      ? buildYouTubeEmbedUrl(trailer.key, { muted: true, background: true })
      : buildYouTubeEmbedUrl("dQw4w9WgXcQ", {
          muted: true,
          background: true,
        }),
  };
}
