const FALLBACK_TRAILER_KEY = "dQw4w9WgXcQ";

export function getYouTubeVideoKey(trailerUrl?: string): string {
  if (!trailerUrl) {
    return FALLBACK_TRAILER_KEY;
  }

  const embedMatch = trailerUrl.match(/youtube\.com\/embed\/([^?&/]+)/);
  if (embedMatch?.[1]) {
    return embedMatch[1];
  }

  const watchMatch = trailerUrl.match(/[?&]v=([^?&/]+)/);
  if (watchMatch?.[1]) {
    return watchMatch[1];
  }

  const shortMatch = trailerUrl.match(/youtu\.be\/([^?&/]+)/);
  if (shortMatch?.[1]) {
    return shortMatch[1];
  }

  return FALLBACK_TRAILER_KEY;
}

export function buildYouTubeEmbedUrl(
  videoKey: string,
  options: { muted?: boolean; background?: boolean } = {},
): string {
  const muted = options.muted ?? false;
  const background = options.background ?? false;
  const params = new URLSearchParams({
    autoplay: "1",
    mute: muted ? "1" : "0",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
  });

  if (background) {
    params.set("controls", "0");
    params.set("loop", "1");
    params.set("playlist", videoKey);
    params.set("disablekb", "1");
    params.set("fs", "0");
  } else {
    params.set("controls", "1");
  }

  return `https://www.youtube.com/embed/${videoKey}?${params.toString()}`;
}

export function getTrailerEmbedUrl(
  trailerUrl?: string,
  options?: { muted?: boolean; background?: boolean },
): string {
  return buildYouTubeEmbedUrl(getYouTubeVideoKey(trailerUrl), options);
}
