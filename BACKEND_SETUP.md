# Netflix Figma - Backend Proxy Setup

## Overview

This project now includes a Node.js/Express backend proxy that handles all TMDb API calls. This solves the CORS and connection timeout issues that were occurring when the frontend tried to call TMDb directly.

## Architecture

```
Frontend (React/Vite)
    ↓
Backend Proxy (Express, Port 3001)
    ↓
TMDb API
```

## Files Structure

- **`server/`** - Backend Express server
  - `index.js` - Main server file with all TMDb API endpoints
  - `.env` - Environment variables (TMDB_TOKEN or TMDB_API_KEY, PORT, etc.)
  - `package.json` - Backend dependencies (express, cors, dotenv)

- **`src/app/services/backend.ts`** - Frontend service that calls the backend proxy (replaces direct TMDb calls)

- **`src/app/data/dummyData.ts`** - Enhanced dummy data with 13+ movies per category (fallback when API fails)

- **`src/app/data/mockMovies.ts`** - Updated to use the backend service instead of TMDb directly

## Running the Project

### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**

```bash
cd server
npm install
npm start
```

Backend will run on `http://localhost:3001`

**Terminal 2 - Frontend:**

```bash
npm install
npm run dev
```

Frontend will run on `http://localhost:5173` (or next available port)

### Option 2: Run Both Together

```bash
npm install
npm run dev:all
```

This uses `concurrently` to run both backend and frontend in parallel.

### Option 3: Run Just Backend (for testing)

```bash
npm run server:dev
```

## Configuration

### Backend Environment Variables (`.env`)

```env
TMDB_TOKEN=your_tmdb_api_key
TMDB_API_BASE_URL=https://api.themoviedb.org/3
PORT=3001
NODE_ENV=development
```

`TMDB_API_KEY` is also supported if you already use that name.

### Frontend Environment Variables (`.env.local`)

```env
VITE_BACKEND_URL=http://localhost:3001
VITE_TMDB_TOKEN=df9bede88cfe1740425f8a236363b66e
```

## API Endpoints

### Backend Proxy Endpoints (available at `http://localhost:3001`)

- `GET /health` - Health check
- `GET /api/genres` - Get all movie genres
- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/top-rated` - Get top-rated movies
- `GET /api/movies/now-playing` - Get now playing movies
- `GET /api/movies/upcoming` - Get upcoming movies
- `GET /api/movies/:id` - Get movie details

## Error Handling & Fallback

1. **Backend calls fail** → Logs error, returns empty array to frontend
2. **Frontend receives empty data** → Falls back to enhanced dummy data (13 movies per category)
3. **Dummy data ensures** → UI always shows content, no "stuck" states

## Features

✅ Backend proxy eliminates CORS and connection timeout issues
✅ All API calls made securely from server-side only
✅ Enhanced error handling and logging
✅ Fallback dummy data with 13+ movies per category
✅ Parallel loading for better performance
✅ Improved UI loading states
✅ Existing components remain unchanged

## Troubleshooting

### Backend won't start

- Ensure port 3001 is not in use: `netstat -ano | findstr :3001`
- Check `.env` file has `TMDB_TOKEN` or `TMDB_API_KEY`

### Frontend can't connect to backend

- Verify backend is running on port 3001
- Check `VITE_BACKEND_URL` in `.env.local`
- Check browser console for CORS errors

### Still getting dummy data

- Check browser console for API errors
- Verify backend is running: visit `http://localhost:3001/health`
- Check server logs for TMDb API errors

### TMDb API errors

- Verify API key is correct in `server/.env`
- Check TMDb account and API access
- Ensure you have sufficient API quota
