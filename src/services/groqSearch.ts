import { BACKEND_URL } from "./backendUrl";

const RETRY_DELAYS_MS = [1500, 3000];
const REQUEST_TIMEOUT_MS = 45000;

export interface TMDbMovieRecommendation {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string;
  genre_ids?: number[];
  adult?: boolean;
  video?: boolean;
  popularity?: number;
}

export type MovieRecommendation = string | TMDbMovieRecommendation;

interface GroqSearchResponse {
  raw?: string;
  parsedTitles?: unknown[];
  movies?: unknown[];
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRecommendationTitle(item: unknown) {
  if (typeof item === "string") {
    return item.trim();
  }

  if (item && typeof item === "object") {
    const movie = item as TMDbMovieRecommendation;
    const title = movie.title || movie.name;

    if (typeof title === "string") {
      return title.trim();
    }
  }

  return "";
}

function normalizeRecommendation(item: unknown): MovieRecommendation | null {
  const title = getRecommendationTitle(item);

  if (!title) {
    return null;
  }

  if (typeof item === "string") {
    return title;
  }

  if (item && typeof item === "object") {
    return item as TMDbMovieRecommendation;
  }

  return null;
}

function normalizeRecommendations(data: GroqSearchResponse) {
  const sourceItems =
    Array.isArray(data.movies) && data.movies.length > 0
      ? data.movies
      : Array.isArray(data.parsedTitles)
        ? data.parsedTitles
        : [];

  return sourceItems
    .map(normalizeRecommendation)
    .filter((item): item is MovieRecommendation => item !== null);
}

async function requestRecommendations(query: string) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

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

  const data = (await response.json()) as GroqSearchResponse;
  console.log("[GroqSearch] Backend response:", data);

  if (!response.ok) {
    throw new Error(
      `GPT search proxy error: ${response.status} ${response.statusText}`,
    );
  }

  return normalizeRecommendations(data);
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
      console.log(`Retrying GPT search request in ${retryDelay / 1000}s...`);
      await delay(retryDelay);
    }
  }

  return [];
}

export async function getMovieRecommendations(
  query: string,
): Promise<MovieRecommendation[]> {
  try {
    return await generateWithRetries(query);
  } catch (error) {
    console.error("GPT search failed after retries:", error);
    return [];
  }
}
