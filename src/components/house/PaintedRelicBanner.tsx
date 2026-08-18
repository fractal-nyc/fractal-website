import type { CSSProperties } from "react";
import "./PaintedRelicBanner.css";

export const PAINTED_RELIC_PRESET = Object.freeze({
  texture: 0.14,
  bump: 0.2,
  roughness: 0.14,
  patina: 0.42,
  dye: 0.34,
  saturation: 1.51,
  contrast: 1.08,
});

export const PAINTED_RELIC_TEXTURES = Object.freeze({
  diffuse: "/images/textures/rough-linen/rough_linen_diff_1k.webp",
  displacement: "/images/textures/rough-linen/rough_linen_disp_1k.webp",
  roughness: "/images/textures/rough-linen/rough_linen_rough_1k.webp",
});

interface PaintedRelicBannerProps {
  src: string;
  foundationColor: string;
  house?: string;
  className?: string;
}

/**
 * Shared production material for the six baked house pennants. The source SVG
 * stays intact as an image so its embedded Jacquard subset remains independent
 * of page CSS; the material layers are clipped to that same SVG silhouette.
 */
export function PaintedRelicBanner({
  src,
  foundationColor,
  house,
  className = "",
}: PaintedRelicBannerProps) {
  const style = {
    "--painted-relic-mask": `url(${src})`,
    "--painted-relic-foundation": foundationColor,
    "--painted-relic-texture-opacity": PAINTED_RELIC_PRESET.texture,
    "--painted-relic-bump-opacity": PAINTED_RELIC_PRESET.bump,
    "--painted-relic-roughness-opacity": PAINTED_RELIC_PRESET.roughness,
    "--painted-relic-patina-opacity": PAINTED_RELIC_PRESET.patina,
    "--painted-relic-dye-opacity": PAINTED_RELIC_PRESET.dye,
    "--painted-relic-saturation": PAINTED_RELIC_PRESET.saturation,
    "--painted-relic-contrast": PAINTED_RELIC_PRESET.contrast,
  } as CSSProperties;

  return (
    <div
      className={`painted-relic-banner pointer-events-none select-none ${className}`}
      style={style}
      data-banner-material="painted-relic"
      data-banner-house={house}
      aria-hidden="true"
    >
      <img
        className="painted-relic-banner__art"
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      <span
        className="painted-relic-banner__layer painted-relic-banner__texture"
        data-texture-layer="diffuse"
        data-texture-map={PAINTED_RELIC_TEXTURES.diffuse}
      />
      <span
        className="painted-relic-banner__layer painted-relic-banner__bump"
        data-texture-layer="displacement"
        data-texture-map={PAINTED_RELIC_TEXTURES.displacement}
      />
      <span
        className="painted-relic-banner__layer painted-relic-banner__roughness"
        data-texture-layer="roughness"
        data-texture-map={PAINTED_RELIC_TEXTURES.roughness}
      />
      <span
        className="painted-relic-banner__layer painted-relic-banner__patina"
        data-texture-layer="patina-edge"
      />
      <span
        className="painted-relic-banner__layer painted-relic-banner__dye"
        data-texture-layer="dye"
      />
    </div>
  );
}
