import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Event, Photo } from "@shared/schema";

type PhotoWithoutData = Omit<Photo, "fileData">;

interface PhotoWithSrc extends PhotoWithoutData {
  src?: string;
}

function isVideoMime(mimeType?: string | null): boolean {
  return !!mimeType?.startsWith("video/");
}

export default function SlideshowPage() {
  const params = useParams<{ id: string }>();
  const eventId = parseInt(params.id || "0");
  const [, navigate] = useLocation();

  const [photos, setPhotos] = useState<PhotoWithSrc[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [loadedSrcs, setLoadedSrcs] = useState<Map<number, string>>(new Map());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch event
  const { data: event } = useQuery<Event>({
    queryKey: ["/api/events", eventId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/events/${eventId}`);
      return res.json();
    },
    enabled: !!eventId,
  });

  // Fetch photos list
  const { data: rawPhotos = [], refetch } = useQuery<PhotoWithoutData[]>({
    queryKey: ["/api/events", eventId, "photos"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/events/${eventId}/photos`);
      return res.json();
    },
    enabled: !!eventId,
  });

  // Load image data for a photo — uses fileUrl (R2) when available
  const loadPhotoData = async (photo: PhotoWithoutData) => {
    if (loadedSrcs.has(photo.id)) return loadedSrcs.get(photo.id)!;

    // If photo has a cloud URL, use it directly
    const fileUrl = (photo as any).fileUrl;
    if (fileUrl) {
      setLoadedSrcs(prev => new Map(prev).set(photo.id, fileUrl));
      return fileUrl;
    }

    // Legacy: fetch base64 data
    try {
      const res = await apiRequest("GET", `/api/photos/${photo.id}/data`);
      const data = await res.json();
      const src = `data:${data.mimeType};base64,${data.fileData}`;
      setLoadedSrcs(prev => new Map(prev).set(photo.id, src));
      return src;
    } catch {
      return null;
    }
  };

  // When raw photos change, update our photos state and prefetch
  useEffect(() => {
    if (rawPhotos.length === 0) return;
    setPhotos(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const newPhotos = rawPhotos.filter(p => !existingIds.has(p.id));
      const updated = [...prev, ...newPhotos.map(p => ({ ...p, src: undefined }))];
      return updated;
    });
    // Prefetch first few
    rawPhotos.slice(0, 3).forEach(p => loadPhotoData(p));
  }, [rawPhotos]);

  const advanceSlide = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setCurrentIndex(i => (i + 1) % photos.length);
      setFading(false);
    }, 600);
  }, [photos.length]);

  // Auto-advance slideshow — skip timer for videos (they advance on end)
  useEffect(() => {
    if (photos.length === 0) return;
    const curr = photos[currentIndex];
    if (isVideoMime(curr?.mimeType)) {
      // Video: don't auto-advance, wait for onEnded
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(advanceSlide, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [photos.length, currentIndex, advanceSlide]);

  // Poll for new photos every 10 seconds
  useEffect(() => {
    pollTimerRef.current = setInterval(() => { refetch(); }, 10000);
    return () => { if (pollTimerRef.current) clearInterval(pollTimerRef.current); };
  }, [refetch]);

  // Prefetch next photo's data
  useEffect(() => {
    if (photos.length === 0) return;
    const curr = photos[currentIndex];
    const next = photos[(currentIndex + 1) % photos.length];
    if (curr) loadPhotoData(curr);
    if (next) loadPhotoData(next);
  }, [currentIndex, photos]);

  // ESC to exit
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate(`/event/${eventId}`);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [eventId, navigate]);

  const currentPhoto = photos[currentIndex];
  const currentSrc = currentPhoto ? loadedSrcs.get(currentPhoto.id) : undefined;

  if (photos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          {event && (
            <h1 className="font-display font-bold text-xl text-white mb-3">{event.name}</h1>
          )}
          <p className="text-white/50 text-sm">Waiting for photos to be uploaded...</p>
          <div className="mt-6 flex gap-2 justify-center">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-white/40"
                style={{ animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite` }}
              />
            ))}
          </div>
        </div>
        <p className="absolute bottom-4 right-4 text-white/30 text-xs">Press ESC to exit</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Main photo/video */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: fading ? 0 : 1 }}
      >
        {currentSrc ? (
          isVideoMime(currentPhoto?.mimeType) ? (
            <video
              key={currentPhoto?.id}
              src={currentSrc}
              autoPlay
              muted
              playsInline
              controls
              onEnded={advanceSlide}
              className="w-full h-full object-contain"
              data-testid="video-slideshow-current"
            />
          ) : (
            <img
              src={currentSrc}
              alt={currentPhoto?.caption || "Event photo"}
              className="w-full h-full object-contain"
              data-testid="img-slideshow-current"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white/80 rounded-full animate-spin" />
          </div>
        )}

        {/* Dark gradient at bottom for overlay text */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      {/* Photo info overlay */}
      {currentPhoto && (
        <div
          className="absolute bottom-8 left-8 right-16 transition-opacity duration-700"
          style={{ opacity: fading ? 0 : 1 }}
        >
          <div className="flex flex-col gap-1">
            {currentPhoto.guestName && (
              <p className="text-white/90 font-display font-semibold text-base" data-testid="text-slide-guest">
                {currentPhoto.guestName}
              </p>
            )}
            {currentPhoto.caption && (
              <p className="text-white/70 text-sm" data-testid="text-slide-caption">
                {currentPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Event name + progress dots */}
      <div className="absolute top-6 left-0 right-0 flex flex-col items-center gap-3">
        {event && (
          <p className="text-white/60 font-display font-semibold text-sm tracking-wide">
            {event.name}
          </p>
        )}
        {photos.length > 1 && (
          <div className="flex gap-1.5">
            {photos.slice(0, Math.min(photos.length, 20)).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === currentIndex % 20
                    ? "w-6 bg-white"
                    : "w-1 bg-white/30"
                }`}
              />
            ))}
            {photos.length > 20 && (
              <span className="text-white/40 text-xs ml-1">+{photos.length - 20}</span>
            )}
          </div>
        )}
      </div>

      {/* Photo counter */}
      <div className="absolute top-6 right-6 text-white/40 text-xs font-mono">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* ESC hint */}
      <p className="absolute bottom-3 right-4 text-white/30 text-xs">Press ESC to exit</p>

      {/* Live badge */}
      <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-white/40 text-xs">Live</span>
      </div>
    </div>
  );
}
