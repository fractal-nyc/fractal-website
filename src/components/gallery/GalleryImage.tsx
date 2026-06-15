import { motion } from "framer-motion";

interface GalleryImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

/**
 * A single gallery image with hover animation effects.
 * - Container lifts on hover (scale 1.03, y -4, shadow)
 * - Image scales slightly inside (1.05) with overflow-hidden clipping
 * - Uses lazy loading by default; first image can set priority=true
 */
export function GalleryImage({
  src,
  alt,
  className = "",
  priority = false,
}: GalleryImageProps) {
  return (
    <motion.div
      className={`overflow-hidden rounded-sm bg-foreground/5 ${className}`}
      whileHover={{
        scale: 1.03,
        y: -4,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
      }}
      transition={{
        duration: 0.4,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="w-full h-full object-cover"
        whileHover={{
          scale: 1.05,
        }}
        transition={{
          duration: 0.6,
          ease: [0.21, 0.47, 0.32, 0.98],
        }}
      />
    </motion.div>
  );
}
