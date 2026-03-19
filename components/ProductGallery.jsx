"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Expand, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".ogg"];

function isVideo(item) {
  if (typeof item !== "string" && item.type === "youtube") return false;
  const url = typeof item === "string" ? item : item.url;
  if (typeof item !== "string" && item.type === "video") return true;
  return VIDEO_EXTENSIONS.some(ext => url.toLowerCase().endsWith(ext));
}

function isYoutube(item) {
  if (typeof item !== "string" && item.type === "youtube") return true;
  const url = typeof item === "string" ? item : item.url;
  return url.includes("youtube.com/embed/");
}

function getUrl(item) {
  return typeof item === "string" ? item : item.url;
}

function getPoster(item) {
  return typeof item !== "string" ? item.poster : undefined;
}

function VideoPlayer({ src, poster, className, autoPlay = false, controls = true, muted = true, loop = true }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(false);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div 
      className={cn("relative", className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Custom controls overlay */}
      {controls && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity",
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        )}>
          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            className="rounded-full bg-background/80 backdrop-blur p-4 hover:bg-background transition-colors"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
          </button>
          
          {/* Mute button */}
          <button
            onClick={toggleMute}
            className="absolute bottom-3 right-3 rounded-full bg-background/80 backdrop-blur p-2 hover:bg-background transition-colors"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      )}
      
      {/* Video badge */}
      <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded">
        VIDEO
      </div>
    </div>
  );
}

export function ProductGallery({ images, productName = "Product", variant = "default" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const allMedia = images.length > 0 ? images : ["/placeholder.svg"];

  const goTo = useCallback((index) => {
    setActiveIndex((index + allMedia.length) % allMedia.length);
  }, [allMedia.length]);

  const goToLightbox = useCallback((index) => {
    setLightboxIndex((index + allMedia.length) % allMedia.length);
  }, [allMedia.length]);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goToLightbox(lightboxIndex - 1);
      if (e.key === "ArrowRight") goToLightbox(lightboxIndex + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, lightboxIndex, goToLightbox]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  const isCompact = variant === "compact";
  const currentItem = allMedia[activeIndex];
  const currentIsVideo = isVideo(currentItem);
  const currentIsYoutube = isYoutube(currentItem);
  const lightboxItem = allMedia[lightboxIndex];
  const lightboxIsVideo = isVideo(lightboxItem);
  const lightboxIsYoutube = isYoutube(lightboxItem);

  return (
    <>
      <div className={cn("space-y-3", isCompact && "space-y-2")}>
        {/* Main Media */}
        <div
         className={cn(
            "relative group rounded-xl overflow-hidden bg-secondary",
            !currentIsVideo && !currentIsYoutube && "cursor-pointer",
            isCompact ? "aspect-video" : "aspect-square md:aspect-[4/3]"
          )}
          onClick={() => !currentIsVideo && !currentIsYoutube && openLightbox(activeIndex)}
        >
          <AnimatePresence mode="wait">
            {currentIsYoutube ? (
              <motion.div
                key={`youtube-${activeIndex}`}
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <iframe
                  src={getUrl(currentItem)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${productName} YouTube video`}
                />
              </motion.div>
            ) : currentIsVideo ? (
              <motion.div
                key={`video-${activeIndex}`}
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <VideoPlayer
                  src={getUrl(currentItem)}
                  poster={getPoster(currentItem)}
                  className="w-full h-full"
                  autoPlay={false}
                  muted={true}
                />
              </motion.div>
            ) : (
              <motion.img
                key={`image-${activeIndex}`}
                src={getUrl(currentItem)}
                alt={`${productName} - ${activeIndex + 1}`}
                className="w-full h-full object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>

          {/* Zoom indicator (images only) */}
          {!currentIsVideo && !currentIsYoutube && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur rounded-lg px-3 py-2 text-sm">
                <Expand size={16} /> Click to expand
              </div>
            </div>
          )}

          {/* Navigation arrows */}
          {allMedia.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(activeIndex - 1); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background z-10"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(activeIndex + 1); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background z-10"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Media counter */}
          {allMedia.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur text-xs px-2 py-1 rounded-md z-10">
              {activeIndex + 1} / {allMedia.length}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {allMedia.length > 1 && (
          <div className={cn("flex gap-2 overflow-x-auto pb-1", isCompact && "gap-1.5")}>
            {allMedia.map((item, i) => {
              const itemIsVideo = isVideo(item);
              const itemIsYoutube = isYoutube(item);
              const url = getUrl(item);
              const poster = getPoster(item);
              
              return (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "shrink-0 rounded-lg overflow-hidden border-2 transition-all relative",
                    isCompact ? "h-12 w-12" : "h-16 w-16",
                    i === activeIndex
                      ? "border-primary ring-1 ring-primary/30"
                      : "border-border/50 hover:border-primary/50 opacity-70 hover:opacity-100"
                  )}
                >
                  {itemIsYoutube ? (
                    <>
                      <img src={poster || "/placeholder.svg"} alt={`YouTube ${i + 1}`} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                        <Play size={isCompact ? 12 : 16} className="text-destructive drop-shadow" />
                      </div>
                    </>
                  ) : itemIsVideo ? (
                    <>
                      {poster ? (
                        <img src={poster} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
                      ) : (
                        <video src={url} className="h-full w-full object-cover" muted playsInline />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                        <Play size={isCompact ? 12 : 16} className="text-foreground drop-shadow" />
                      </div>
                    </>
                  ) : (
                    <img src={url} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 rounded-full bg-secondary/80 p-2 hover:bg-secondary transition-colors"
              onClick={() => setLightboxOpen(false)}
            >
              <X size={20} />
            </button>

            {/* Navigation arrows */}
            {allMedia.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToLightbox(lightboxIndex - 1); }}
                  className="absolute left-4 z-10 rounded-full bg-secondary/80 p-3 hover:bg-secondary transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToLightbox(lightboxIndex + 1); }}
                  className="absolute right-4 z-10 rounded-full bg-secondary/80 p-3 hover:bg-secondary transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Main lightbox content */}
            <motion.div
              className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <AnimatePresence mode="wait">
                {lightboxIsYoutube ? (
                  <motion.div
                    key={`lightbox-youtube-${lightboxIndex}`}
                    className="w-full max-w-4xl"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <iframe
                      src={`${getUrl(lightboxItem)}?autoplay=1`}
                      className="w-full aspect-video rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`${productName} YouTube video`}
                    />
                  </motion.div>
                ) : lightboxIsVideo ? (
                  <motion.div
                    key={`lightbox-video-${lightboxIndex}`}
                    className="w-full max-w-4xl"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <VideoPlayer
                      src={getUrl(lightboxItem)}
                      poster={getPoster(lightboxItem)}
                      className="w-full aspect-video rounded-lg overflow-hidden"
                      autoPlay={true}
                      muted={false}
                    />
                  </motion.div>
                ) : (
                  <motion.img
                    key={`lightbox-image-${lightboxIndex}`}
                    src={getUrl(lightboxItem)}
                    alt={`${productName} - ${lightboxIndex + 1}`}
                    className="max-w-full max-h-[85vh] object-contain rounded-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Lightbox thumbnails */}
            {allMedia.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-secondary/80 backdrop-blur rounded-lg p-2 max-w-[90vw] overflow-x-auto">
                {allMedia.map((item, i) => {
                  const itemIsVideo = isVideo(item);
                  const itemIsYoutube = isYoutube(item);
                  const url = getUrl(item);
                  const poster = getPoster(item);
                  
                  return (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                      className={cn(
                        "shrink-0 h-14 w-14 rounded-md overflow-hidden border-2 transition-all relative",
                        i === lightboxIndex
                          ? "border-primary ring-1 ring-primary/30"
                          : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      {itemIsYoutube ? (
                        <>
                          <img src={poster || "/placeholder.svg"} alt={`YouTube ${i + 1}`} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                            <Play size={14} className="text-destructive drop-shadow" />
                          </div>
                        </>
                      ) : itemIsVideo ? (
                        <>
                          {poster ? (
                            <img src={poster} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
                          ) : (
                            <video src={url} className="h-full w-full object-cover" muted playsInline />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                            <Play size={14} className="text-foreground drop-shadow" />
                          </div>
                        </>
                      ) : (
                        <img src={url} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Counter */}
            {allMedia.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-secondary/80 backdrop-blur text-sm px-3 py-1.5 rounded-md">
                {lightboxIndex + 1} / {allMedia.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ProductGallery;
