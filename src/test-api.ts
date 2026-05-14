import { tmdbService } from "./app/services/tmdb";

async function testTMDbAPI() {
  try {
    console.log("Testing TMDb API...");

    // Test genres
    console.log("Fetching genres...");
    const genres = await tmdbService.getGenres();
    console.log("Genres:", genres.length);

    // Test popular movies
    console.log("Fetching popular movies...");
    const popular = await tmdbService.getPopularMovies();
    console.log("Popular movies:", popular.length);

    if (popular.length > 0) {
      console.log("First movie:", popular[0].title);
    }
  } catch (error) {
    console.error("API test failed:", error);
  }
}

testTMDbAPI();
