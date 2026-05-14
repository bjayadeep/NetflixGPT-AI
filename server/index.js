import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-2.5-flash";

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

app.post(
  "/api/gpt-search",
  async (req, res) => {
    try {
      if (!GEMINI_API_KEY) {
        return res.status(500).json({
          error:
            "Gemini API key missing",
        });
      }

      const query =
        req.body?.query;

      if (!query) {
        return res.status(400).json({
          error: "Query required",
        });
      }

      const endpoint =
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(
        endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text:
                      `Give me 5 movie recommendations for: ${query}. Return only movie names separated by commas.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data =
        await response.json();

      const text =
        data?.candidates?.[0]
          ?.content?.parts?.[0]
          ?.text || "";

      const movies = text
        .split(",")
        .map((movie) =>
          movie.trim()
        )
        .filter(Boolean)
        .slice(0, 5);

      res.json({
        movies,
      });
    } catch (error) {
      console.error(error);

      res.json({
        movies: [],
      });
    }
  }
);

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

