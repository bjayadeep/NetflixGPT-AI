import fetch from "node-fetch";
import { readFileSync } from "fs";
import { config } from "dotenv";

// Load .env file
config();
const TMDB_TOKEN = process.env.VITE_TMDB_TOKEN;

async function testTMDbAPI() {
  try {
    console.log(
      "Testing TMDb API with token:",
      TMDB_TOKEN ? "Present" : "Missing",
    );

    // Test genres
    console.log("Fetching genres...");
    const genresResponse = await fetch(
      `https://api.themoviedb.org/3/genre/movie/list?language=en&api_key=${TMDB_TOKEN}`,
      {
        headers: {
          accept: "application/json",
        },
      },
    );

    if (!genresResponse.ok) {
      console.error(
        "Genres API failed:",
        genresResponse.status,
        genresResponse.statusText,
      );
      const errorText = await genresResponse.text();
      console.error("Error details:", errorText);
      return;
    }

    const genresData = await genresResponse.json();
    console.log("Genres fetched successfully:", genresData.genres.length);

    // Test popular movies
    console.log("Fetching popular movies...");
    const popularResponse = await fetch(
      `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1&api_key=${TMDB_TOKEN}`,
      {
        headers: {
          accept: "application/json",
        },
      },
    );

    if (!popularResponse.ok) {
      console.error(
        "Popular movies API failed:",
        popularResponse.status,
        popularResponse.statusText,
      );
      const errorText = await popularResponse.text();
      console.error("Error details:", errorText);
      return;
    }

    const popularData = await popularResponse.json();
    console.log(
      "Popular movies fetched successfully:",
      popularData.results.length,
    );

    if (popularData.results.length > 0) {
      console.log("First movie:", popularData.results[0].title);
    }
  } catch (error) {
    console.error("API test failed:", error);
  }
}

testTMDbAPI();
