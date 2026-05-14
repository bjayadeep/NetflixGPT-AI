import { BACKEND_URL } from "./backendUrl";
const FALLBACK_MOVIES = ["3 Idiots", "Chhichhore", "ZNMD"];
const RETRY_DELAYS_MS = [1500, 3000];
const REQUEST_TIMEOUT_MS = 45000;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestRecommendations(query: string) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/gpt-search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(
      `GPT search proxy error: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  console.log("[GeminiMovieSearch] Backend response:", data);
  const movies = Array.isArray(data?.movies) ? data.movies : [];

  const cleanedMovies = movies
    .map((movie: string) => movie.trim())
    .filter(Boolean);

  if (cleanedMovies.length === 0) {
    console.warn("[GeminiMovieSearch] Backend returned an empty movie list.");
    return FALLBACK_MOVIES;
  }

  return cleanedMovies;
}

async function generateWithRetries(query: string) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await requestRecommendations(query);
    } catch (error) {
      console.error(`GPT search error on attempt ${attempt}:`, error);

      if (attempt === 3) {
        throw error;
      }

      const retryDelay = RETRY_DELAYS_MS[attempt - 1];
      console.log(
        `Retrying GPT search request in ${retryDelay / 1000}s...`,
      );
      await delay(retryDelay);
    }
  }

  return [];
}

export async function getMovieRecommendations(query: string) {
  try {
    return await generateWithRetries(query);
  } catch (error) {
    console.error("GPT search failed after retries:", error);
    console.log("Using static fallback movie list.");
    return FALLBACK_MOVIES;
  }
}
