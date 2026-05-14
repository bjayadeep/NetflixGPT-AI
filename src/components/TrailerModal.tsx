import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { Movie } from "../types/movie";
import { getTrailerEmbedUrl } from "../utils/video";

interface TrailerModalProps {
  movie: Movie;
  onClose: () => void;
}

export function TrailerModal({ movie, onClose }: TrailerModalProps) {
  const [videoError, setVideoError] = useState(false);
  const modalVideoUrl = getTrailerEmbedUrl(movie.trailerUrl, {
    muted: false,
    background: false,
  });

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center px-4 py-8 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-6xl aspect-video my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 z-50 text-white hover:text-gray-300 p-2 transition-all"
          aria-label="Close trailer"
        >
          <X className="w-8 h-8" />
        </button>

        {videoError ? (
          <div className="w-full h-full rounded-xl bg-black relative overflow-hidden">
            <img
              src={movie.backdropPath || movie.posterPath}
              alt={movie.title}
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <p className="text-white text-sm md:text-base font-medium">
                Trailer unavailable for this title.
              </p>
            </div>
          </div>
        ) : (
          <iframe
            src={modalVideoUrl}
            title={`${movie.title} Trailer`}
            className="w-full h-full rounded-xl bg-black border-0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen={true}
            onError={() => setVideoError(true)}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
