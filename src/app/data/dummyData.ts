import { Movie, MovieCategory } from "../types/movie";

// Enhanced dummy data with at least 10 movies per category
const DUMMY_MOVIES: Movie[] = [
  {
    id: 1,
    title: "Quantum Paradox",
    overview:
      "When a brilliant physicist discovers a way to bend time, she must race against a shadowy organization to prevent a catastrophic temporal collapse that could erase humanity from existence.",
    posterPath:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop",
    backdropPath:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop",
    rating: 8.7,
    releaseDate: "2026-03-15",
    genres: ["Sci-Fi", "Thriller", "Action"],
    cast: [
      {
        name: "Emma Stone",
        profilePath:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
        wikiUrl: "https://en.wikipedia.org/wiki/Emma_Stone",
      },
      {
        name: "Oscar Isaac",
        profilePath:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
        wikiUrl: "https://en.wikipedia.org/wiki/Oscar_Isaac",
      },
    ],
    trailerUrl:
      "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&playlist=dQw4w9WgXcQ",
  },
  {
    id: 2,
    title: "Eclipse Protocol",
    overview:
      "A cybersecurity expert uncovers a global conspiracy hidden in the dark web.",
    posterPath:
      "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&h=750&fit=crop",
    backdropPath:
      "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1920&h=1080&fit=crop",
    rating: 7.9,
    releaseDate: "2026-04-20",
    genres: ["Thriller", "Crime"],
    cast: [
      {
        name: "Ryan Gosling",
        profilePath:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
        wikiUrl: "https://en.wikipedia.org/wiki/Ryan_Gosling",
      },
    ],
    trailerUrl:
      "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&playlist=dQw4w9WgXcQ",
  },
  {
    id: 3,
    title: "Midnight Express",
    overview:
      "A young man's journey through the criminal underworld leads to unexpected alliances and dangerous betrayals.",
    posterPath:
      "https://images.unsplash.com/photo-1489599735734-79b4d8c7b0aa?w=500&h=750&fit=crop",
    backdropPath:
      "https://images.unsplash.com/photo-1489599735734-79b4d8c7b0aa?w=1920&h=1080&fit=crop",
    rating: 8.2,
    releaseDate: "2026-05-10",
    genres: ["Crime", "Drama"],
    cast: [],
    trailerUrl:
      "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&playlist=dQw4w9WgXcQ",
  },
  {
    id: 4,
    title: "The Last Lighthouse",
    overview:
      "In a post-apocalyptic world, a lighthouse keeper guards humanity's last beacon of hope.",
    posterPath:
      "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500&h=750&fit=crop",
    backdropPath:
      "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1920&h=1080&fit=crop",
    rating: 8.4,
    releaseDate: "2026-02-14",
    genres: ["Drama", "Sci-Fi"],
    cast: [],
    trailerUrl:
      "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&playlist=dQw4w9WgXcQ",
  },
  {
    id: 5,
    title: "Echoes of Tomorrow",
    overview:
      "A musician discovers that her melodies can alter the course of human events across parallel universes.",
    posterPath:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&h=750&fit=crop",
    backdropPath:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1920&h=1080&fit=crop",
    rating: 7.8,
    releaseDate: "2026-06-01",
    genres: ["Fantasy", "Music"],
    cast: [],
    trailerUrl:
      "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&playlist=dQw4w9WgXcQ",
  },
  {
    id: 6,
    title: "Neon Nights",
    overview:
      "In a sprawling megacity, a detective hunts a killer who leaves digital signatures at crime scenes.",
    posterPath:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=750&fit=crop",
    backdropPath:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&h=1080&fit=crop",
    rating: 8.1,
    releaseDate: "2026-04-05",
    genres: ["Cyberpunk", "Thriller"],
    cast: [],
    trailerUrl:
      "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&playlist=dQw4w9WgXcQ",
  },
  {
    id: 7,
    title: "Starlight Legacy",
    overview:
      "An interstellar explorer searches for her missing sister across the far reaches of the galaxy.",
    posterPath:
      "https://images.unsplash.com/photo-1530307803c57-c0db58ccb628?w=500&h=750&fit=crop",
    backdropPath:
      "https://images.unsplash.com/photo-1530307803c57-c0db58ccb628?w=1920&h=1080&fit=crop",
    rating: 8.5,
    releaseDate: "2026-05-20",
    genres: ["Sci-Fi", "Adventure"],
    cast: [],
    trailerUrl:
      "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&playlist=dQw4w9WgXcQ",
  },
  {
    id: 8,
    title: "The Forgotten Code",
    overview:
      "A cryptographer stumbles upon an ancient cipher that holds the key to humanity's origins.",
    posterPath:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=750&fit=crop",
    backdropPath:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop",
    rating: 7.7,
    releaseDate: "2026-03-22",
    genres: ["Mystery", "Thriller"],
    cast: [],
    trailerUrl:
      "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&playlist=dQw4w9WgXcQ",
  },
  {
    id: 9,
    title: "Cascading Worlds",
    overview:
      "Multiple realities collide when a physicist's experiment creates a bridge between dimensions.",
    posterPath:
      "https://images.unsplash.com/photo-1578926078328-123456789012?w=500&h=750&fit=crop",
    backdropPath:
      "https://images.unsplash.com/photo-1578926078328-123456789012?w=1920&h=1080&fit=crop",
    rating: 8.3,
    releaseDate: "2026-07-10",
    genres: ["Sci-Fi", "Action"],
    cast: [],
    trailerUrl:
      "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&playlist=dQw4w9WgXcQ",
  },
  {
    id: 10,
    title: "Crimson Tide",
    overview:
      "A former oceanographer discovers a sentient lifeform in the deepest ocean trench.",
    posterPath:
      "https://images.unsplash.com/photo-1519451241446-a3d32c1b5f55?w=500&h=750&fit=crop",
    backdropPath:
      "https://images.unsplash.com/photo-1519451241446-a3d32c1b5f55?w=1920&h=1080&fit=crop",
    rating: 7.9,
    releaseDate: "2026-08-15",
    genres: ["Adventure", "Mystery"],
    cast: [],
    trailerUrl:
      "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&playlist=dQw4w9WgXcQ",
  },
  {
    id: 11,
    title: "Phoenix Rising",
    overview:
      "A survivor of a catastrophic event discovers she has the power to prevent disasters.",
    posterPath:
      "https://images.unsplash.com/photo-1533088249403-4f8f80a8ecbc?w=500&h=750&fit=crop",
    backdropPath:
      "https://images.unsplash.com/photo-1533088249403-4f8f80a8ecbc?w=1920&h=1080&fit=crop",
    rating: 8.0,
    releaseDate: "2026-06-30",
    genres: ["Action", "Thriller"],
    cast: [],
    trailerUrl:
      "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&playlist=dQw4w9WgXcQ",
  },
  {
    id: 12,
    title: "Silent Symphony",
    overview:
      "A deaf composer communicates with an alien intelligence through music and vibrations.",
    posterPath:
      "https://images.unsplash.com/photo-1477853692161-67db3a69d9e0?w=500&h=750&fit=crop",
    backdropPath:
      "https://images.unsplash.com/photo-1477853692161-67db3a69d9e0?w=1920&h=1080&fit=crop",
    rating: 8.6,
    releaseDate: "2026-07-25",
    genres: ["Sci-Fi", "Drama"],
    cast: [],
    trailerUrl:
      "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&playlist=dQw4w9WgXcQ",
  },
  {
    id: 13,
    title: "The Last Horizon",
    overview:
      "As civilization faces extinction, a small group seeks refuge on a generation ship bound for unknown stars.",
    posterPath:
      "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=500&h=750&fit=crop",
    backdropPath:
      "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=1920&h=1080&fit=crop",
    rating: 8.2,
    releaseDate: "2026-09-01",
    genres: ["Sci-Fi", "Drama"],
    cast: [],
    trailerUrl:
      "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&playlist=dQw4w9WgXcQ",
  },
];

export function getDummyFeaturedMovie(): Movie {
  return DUMMY_MOVIES[0];
}

export function getDummyMovies(): Movie[] {
  return DUMMY_MOVIES;
}

export function getDummyCategories(): MovieCategory[] {
  // Distribute movies into categories with at least 10 movies each
  const moviesPerCategory = Math.max(10, Math.floor(DUMMY_MOVIES.length / 4));

  return [
    {
      title: "Popular on Netflix",
      movies: DUMMY_MOVIES.slice(0, moviesPerCategory),
    },
    {
      title: "Top Rated",
      movies: DUMMY_MOVIES.slice(moviesPerCategory, moviesPerCategory * 2),
    },
    {
      title: "Now Playing",
      movies: DUMMY_MOVIES.slice(moviesPerCategory * 2, moviesPerCategory * 3),
    },
    {
      title: "Coming Soon",
      movies: DUMMY_MOVIES.slice(moviesPerCategory * 3),
    },
  ];
}
