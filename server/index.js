import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
});

const app = express();
const PORT = process.env.PORT || 3001;
const isVercel = process.env.VERCEL === "1";

const allowedOrigins = [
  "https://netflixgpt-ai.vercel.app",
  "https://netflixgpt-3niusvrfh-bjayadeeps-projects.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

const TMDB_TOKEN =
  process.env.TMDB_TOKEN ||
  process.env.TMDB_API_KEY;

const GROQ_API_KEY =
  process.env.GROQ_API_KEY;

const GROQ_MODEL =
  process.env.GROQ_MODEL ||
  "llama-3.3-70b-versatile";

const groq = GROQ_API_KEY
  ? new Groq({
      apiKey: GROQ_API_KEY,
    })
  : null;

const TMDB_BASE_URL =
  process.env.TMDB_API_BASE_URL ||
  "https://api.themoviedb.org/3";

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.get("/cors-test", (req, res) => {
  res.json({
    success: true,
    origin: req.headers.origin || null,
  });
});

async function fetchFromTMDb(endpoint) {
  if (!TMDB_TOKEN) {
    throw new Error(
      "TMDB_TOKEN missing"
    );
  }

  const separator = endpoint.includes("?")
    ? "&"
    : "?";

  const url =
    `${TMDB_BASE_URL}${endpoint}${separator}api_key=${TMDB_TOKEN}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `TMDB Error: ${response.status} ${errorText}`
    );
  }

  return response.json();
}

async function sendMovieList(
  res,
  endpoint
) {
  try {
    const data =
      await fetchFromTMDb(endpoint);

    res.json(data.results || []);
  } catch (error) {
    console.error(error);

    res.json([]);
  }
}

function cleanGroqText(text) {
  return String(text || "")
    .replace(/```(?:json)?/gi, "")
    .trim();
}

function normalizeMovieTitle(title) {
  return String(title || "")
    .replace(/[*_~`#]/g, "")
    .replace(/^\s*[-*]\s*/, "")
    .replace(/^\s*[•–—]\s*/, "")
    .replace(/^\s*\d+[.)]\s*/, "")
    .replace(/^\s*movie\s*:\s*/i, "")
    .replace(/\s*\(\d{4}\)\s*$/g, "")
    .replace(/^\s*[\["'`]+|[\]"'`.,;]+$/g, "")
    .replace(/^["'`]+|["'`]+$/g, "")
    .trim();
}

function parseJsonMovieTitles(clean) {
  const parsed = JSON.parse(clean);

  if (typeof parsed === "string") {
    return parseTextMovieTitles(parsed);
  }

  const rawTitles = Array.isArray(parsed)
    ? parsed
    : parsed?.movies || parsed?.titles || [];

  return Array.isArray(rawTitles)
    ? rawTitles
        .map(normalizeMovieTitle)
        .filter(Boolean)
    : [];
}

function parseTextMovieTitles(clean) {
  const newlineTitles = clean
    .split(/\r?\n/)
    .map(normalizeMovieTitle)
    .filter(Boolean);

  if (newlineTitles.length > 1) {
    return newlineTitles;
  }

  return clean
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map(normalizeMovieTitle)
    .filter(Boolean);
}

function parseMovieTitles(text) {
  const clean = cleanGroqText(text);

  if (!clean) {
    return [];
  }

  try {
    const titles = parseJsonMovieTitles(clean);

    if (titles.length > 0) {
      return titles;
    }
  } catch (error) {
    console.warn(
      "[GPT Search] Groq response was not valid JSON; falling back to text parsing.",
      error
    );
  }

  const jsonArrayMatch = clean.match(/\[[\s\S]*\]/);

  if (jsonArrayMatch) {
    try {
      return parseJsonMovieTitles(jsonArrayMatch[0]);
    } catch (error) {
      console.warn(
        "[GPT Search] Embedded JSON array parse failed; falling back to text parsing.",
        error
      );
    }
  }

  return parseTextMovieTitles(clean);
}

function uniqueTitles(titles) {
  const seen = new Set();

  return titles.filter((title) => {
    const key = title.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function pickBestTMDbMatch(title, results) {
  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }

  const normalizedTitle = title.toLowerCase();

  return (
    results.find((movie) =>
      String(movie.title || "").toLowerCase() === normalizedTitle
    ) ||
    results.find((movie) =>
      String(movie.original_title || "").toLowerCase() === normalizedTitle
    ) ||
    results.find((movie) => movie.poster_path) ||
    results[0]
  );
}

async function findTMDbMovie(title) {
  console.log("TMDB QUERY:", title);

  const data = await fetchFromTMDb(
    `/search/movie?query=${encodeURIComponent(
      title
    )}&language=en-US&page=1&include_adult=false`
  );

  const results = data.results || [];

  console.log("TMDB RESULTS:", results.length);

  console.log(
    `[GPT Search] TMDB search results for "${title}":`,
    results.slice(0, 3).map((movie) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
    }))
  );

  return pickBestTMDbMatch(title, results);
}

async function handleGptSearch(req, res) {
  const query =
    req.body?.query ||
    req.query?.query ||
    req.query?.q;

  console.log("[GPT Search] Incoming query:", query);

  if (!groq) {
    console.error("[GPT Search] GROQ_API_KEY is missing.");

    return res.status(500).json({
      error: "Groq API key missing",
      movies: [],
    });
  }

  if (!query) {
    console.warn("[GPT Search] Request missing query.");

    return res.status(400).json({
      error: "Query required",
      movies: [],
    });
  }

  let completion;

  try {
    completion =
      await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content:
              'You are a movie recommendation expert. When given a search query, return ONLY a JSON array of 12 popular, well-known movie titles that best match. Prioritize movies that are famous and widely available. Use exact official movie titles. No explanation, no markdown, just the JSON array. Example: ["The Dark Knight", "Inception"]',
          },
          {
            role: "user",
            content: String(query),
          },
        ],
      });
  } catch (error) {
    console.error("[GPT Search] Groq request failed:", error);

    return res.status(502).json({
      error: "Groq request failed",
      movies: [],
    });
  }

  const text =
    completion.choices[0]?.message
      ?.content || "";

  console.log("[GPT Search] Raw Groq response:", completion);
  console.log("RAW GROQ:", text);

  const movieTitles = uniqueTitles(
    parseMovieTitles(text)
  ).slice(0, 12);

  console.log("PARSED TITLES:", movieTitles);
  console.log(
    "[GPT Search] Parsed movie titles:",
    movieTitles
  );

  if (movieTitles.length === 0) {
    console.error(
      "[GPT Search] Could not parse any movie titles from Groq response."
    );

      return res.status(502).json({
        error:
          "Could not parse movie titles from Groq response",
        raw: text,
        parsedTitles: movieTitles,
        movies: [],
      });
  }

  try {
    const movies = (
      await Promise.all(
        movieTitles.map(async (title) => {
          try {
            return await findTMDbMovie(title);
          } catch (error) {
            console.error(
              `[GPT Search] TMDB lookup failed for "${title}":`,
              error
            );
            return null;
          }
        })
      )
    ).filter(Boolean);

    console.log(
      "[GPT Search] Matched TMDB movies:",
      movies.map((movie) => ({
        id: movie.id,
        title: movie.title,
      }))
    );

    if (movies.length === 0) {
      console.error(
        "[GPT Search] No TMDB matches found for parsed movie titles."
      );
    }

    return res.json({
      raw: text,
      parsedTitles: movieTitles,
      movies,
    });
  } catch (error) {
    console.error("[GPT Search] Search route failed:", error);

    return res.status(500).json({
      error: "Movie search failed",
      movies: [],
    });
  }
}

app.get("/api/genres", async (req, res) => {
  try {
    const data =
      await fetchFromTMDb(
        "/genre/movie/list"
      );

    res.json({
      genres: data.genres || [],
    });
  } catch (error) {
    console.error(error);

    res.json({
      genres: [],
    });
  }
});

app.get("/api/tmdb/*", async (req, res) => {
  try {
    const tmdbPath =
      req.params[0] || "";

    const queryString =
      new URLSearchParams(
        req.query
      ).toString();

    const endpoint =
      `/${tmdbPath}${
        queryString
          ? `?${queryString}`
          : ""
      }`;

    const data =
      await fetchFromTMDb(endpoint);

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error:
        "Failed to fetch TMDB data",
    });
  }
});

app.get(
  "/api/movies/popular",
  async (req, res) => {
    await sendMovieList(
      res,
      "/movie/popular?language=en-US&page=1"
    );
  }
);

app.get(
  "/api/movies/top-rated",
  async (req, res) => {
    await sendMovieList(
      res,
      "/movie/top_rated?language=en-US&page=1"
    );
  }
);

app.get(
  "/api/movies/now-playing",
  async (req, res) => {
    await sendMovieList(
      res,
      "/movie/now_playing?language=en-US&page=1"
    );
  }
);

app.get(
  "/api/movies/upcoming",
  async (req, res) => {
    await sendMovieList(
      res,
      "/movie/upcoming?language=en-US&page=1"
    );
  }
);

app.get(
  "/api/movies/telugu",
  async (req, res) => {
    await sendMovieList(
      res,
      "/discover/movie?with_original_language=te"
    );
  }
);

app.get(
  "/api/movies/hindi",
  async (req, res) => {
    await sendMovieList(
      res,
      "/discover/movie?with_original_language=hi"
    );
  }
);

app.get(
  "/api/movies/romance",
  async (req, res) => {
    await sendMovieList(
      res,
      "/discover/movie?with_genres=10749"
    );
  }
);

app.get(
  "/api/movies/thriller",
  async (req, res) => {
    await sendMovieList(
      res,
      "/discover/movie?with_genres=53"
    );
  }
);

app.get(
  "/api/movies/horror",
  async (req, res) => {
    await sendMovieList(
      res,
      "/discover/movie?with_genres=27"
    );
  }
);

app.get(
  "/api/movies/comedy",
  async (req, res) => {
    await sendMovieList(
      res,
      "/discover/movie?with_genres=35"
    );
  }
);

app.get(
  "/api/movies/discover",
  async (req, res) => {
    const queryString =
      new URLSearchParams(
        req.query
      ).toString();

    await sendMovieList(
      res,
      `/discover/movie${
        queryString
          ? `?${queryString}`
          : ""
      }`
    );
  }
);

app.get(
  "/api/movies/:movieId",
  async (req, res) => {
    try {
      const data =
        await fetchFromTMDb(
          `/movie/${req.params.movieId}?append_to_response=credits,videos`
        );

      res.json(data);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to fetch movie details",
      });
    }
  }
);

app
  .route("/api/gpt-search")
  .get(handleGptSearch)
  .post(handleGptSearch);

app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
  });
});

if (!isVercel) {
  app.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT}`
    );
  });
}

export default app;
