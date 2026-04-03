import { useState } from "react";
import { PEOPLE } from "@/data/houses";
import { MandelbrotIcon } from "@/components/house/MandelbrotIcon";
import type { Person, PersonSocials } from "@/data/houses";
import { HOUSES } from "@/data/houses";
import { Newspaper, Globe } from "lucide-react";

function getInitials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}
function getPersonColor(person: Person): string {
  if (person.houses.length === 0) return "#6B7280";
  const house = HOUSES.find((h) => h.id === person.houses[0]);
  return house?.color ?? "#6B7280";
}
function XIcon({ className }: { className?: string }) {
  return (<svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>);
}
function SocialLinks({ socials }: { socials: PersonSocials }) {
  const links: { href: string; label: string; icon: React.ReactNode }[] = [];
  if (socials.twitter) links.push({ href: "#", label: `@${socials.twitter}`, icon: <XIcon className="h-3 w-3" /> });
  if (socials.substack) links.push({ href: "#", label: "Substack", icon: <Newspaper className="h-3 w-3" /> });
  if (socials.website) links.push({ href: "#", label: "Website", icon: <Globe className="h-3 w-3" /> });
  if (links.length === 0) return null;
  return (
    <span style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
      {links.map((l, i) => (<span key={i} style={{ display: "inline-flex", width: 24, height: 24, alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)" }}>{l.icon}</span>))}
    </span>
  );
}

function Slider({ label, value, onChange, min, max, step = 1, unit = "px" }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
      <span style={{ width: 160, flexShrink: 0, color: "rgba(255,255,255,0.7)" }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, height: 20, cursor: "pointer", accentColor: "#a855f7", appearance: "auto" }} />
      <span style={{ width: 60, textAlign: "right", fontFamily: "monospace", color: "rgba(255,255,255,0.9)" }}>
        {value}{unit}
      </span>
    </div>
  );
}

export function BadgePlayground() {
  const person = PEOPLE.find((p) => p.avatar) ?? PEOPLE[0];
  const color = getPersonColor(person);

  // Card frame
  const [cardW, setCardW] = useState(183);
  const [cardH, setCardH] = useState(309);

  // Image offsets from card frame edges (negative = overflow beyond card)
  const [imgTop, setImgTop] = useState(-44);
  const [imgLeft, setImgLeft] = useState(-13);
  const [imgRight, setImgRight] = useState(-15);
  const [imgBottom, setImgBottom] = useState(-35);

  // Lining (inset from card frame)
  const [liningInset, setLiningInset] = useState(7);

  // Mandelbrot
  const [mSize, setMSize] = useState(16);
  const [mOffset, setMOffset] = useState(-3);

  // Debug
  const [outlines, setOutlines] = useState(true);

  // Mandelbrot positions: offset from lining corner
  const mPos = liningInset + mOffset;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", color: "white", padding: 32 }}>
      <h1 style={{ fontFamily: "serif", fontSize: 24, marginBottom: 32 }}>Badge Playground</h1>

      <div style={{ display: "flex", gap: 48 }}>
        {/* Controls */}
        <div style={{ width: 380, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8,
          backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 20 }}>

          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 4 }}>Card frame</div>
          <Slider label="Width" value={cardW} onChange={setCardW} min={100} max={400} />
          <Slider label="Height" value={cardH} onChange={setCardH} min={150} max={600} />

          <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.1)", margin: "6px 0" }} />
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 4 }}>Image overflow</div>
          <Slider label="Top" value={imgTop} onChange={setImgTop} min={-80} max={20} />
          <Slider label="Bottom" value={imgBottom} onChange={setImgBottom} min={-80} max={20} />
          <Slider label="Left" value={imgLeft} onChange={setImgLeft} min={-40} max={20} />
          <Slider label="Right" value={imgRight} onChange={setImgRight} min={-40} max={20} />

          <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.1)", margin: "6px 0" }} />
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 4 }}>Lining + Mandelbrot</div>
          <Slider label="Lining inset" value={liningInset} onChange={setLiningInset} min={0} max={30} />
          <Slider label="Mandelbrot size" value={mSize} onChange={setMSize} min={6} max={50} />
          <Slider label="Mandelbrot offset" value={mOffset} onChange={setMOffset} min={-20} max={20} />

          <div style={{ marginTop: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", color: "rgba(255,255,255,0.7)" }}
              onClick={() => setOutlines(!outlines)}>
              <input type="checkbox" checked={outlines} onChange={() => setOutlines(!outlines)} style={{ accentColor: "#a855f7" }} />
              Show outlines
            </label>
          </div>

          <div style={{ marginTop: 12, padding: 12, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 4,
            fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
            <div style={{ color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Values:</div>
            <div>card: {cardW}×{cardH}</div>
            <div>img overflow: T{imgTop} B{imgBottom} L{imgLeft} R{imgRight}</div>
            <div>image size: {cardW - imgLeft - imgRight}×{cardH - imgTop - imgBottom}</div>
            <div>lining inset: {liningInset}px</div>
            <div>mandelbrot: {mSize}px, offset {mOffset}</div>
          </div>
        </div>

        {/* Single badge preview */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", paddingTop: 80 }}>
          {/* Outer wrapper — sized to card frame */}
          <div style={{ position: "relative", width: cardW, height: cardH }}>

            {/* Image — overflows card frame */}
            {person.avatar ? (
              <img
                src={person.avatar}
                alt={person.name}
                style={{
                  position: "absolute",
                  top: imgTop, left: imgLeft, right: imgRight, bottom: imgBottom,
                  width: cardW - imgLeft - imgRight,
                  height: cardH - imgTop - imgBottom,
                  objectFit: "cover",
                  objectPosition: "top",
                  outline: outlines ? "2px dashed rgba(100,200,255,0.5)" : undefined,
                }}
              />
            ) : (
              <div style={{
                position: "absolute",
                top: imgTop, left: imgLeft, right: imgRight, bottom: imgBottom,
                backgroundColor: color, display: "flex", alignItems: "center", justifyContent: "center",
                outline: outlines ? "2px dashed rgba(100,200,255,0.5)" : undefined,
              }}>
                <span style={{ fontFamily: "serif", fontSize: 40, color: "rgba(255,255,255,0.9)" }}>
                  {getInitials(person.name)}
                </span>
              </div>
            )}

            {/* Card frame outline (debug) */}
            {outlines && (
              <div style={{
                position: "absolute", inset: 0,
                border: "2px dashed rgba(255,100,100,0.5)",
                pointerEvents: "none", zIndex: 30,
              }} />
            )}

            {/* Inner lining */}
            <div style={{
              position: "absolute", inset: liningInset,
              border: "1px solid white", borderRadius: 2,
              pointerEvents: "none", zIndex: 20,
            }} />

            {/* Mandelbrot corners */}
            {([
              { top: mPos, left: mPos, rotate: "135deg" },
              { top: mPos, right: mPos, rotate: "-135deg" },
              { bottom: mPos, left: mPos, rotate: "45deg" },
              { bottom: mPos, right: mPos, rotate: "-45deg" },
            ]).map((pos, i) => (
              <div key={i} style={{
                position: "absolute", zIndex: 20, pointerEvents: "none",
                top: "top" in pos ? pos.top : undefined,
                bottom: "bottom" in pos ? pos.bottom : undefined,
                left: "left" in pos ? pos.left : undefined,
                right: "right" in pos ? pos.right : undefined,
                transform: `rotate(${pos.rotate})`,
              }}>
                <MandelbrotIcon size={mSize} color="white" opacity={1} />
              </div>
            ))}

            {/* Gradient + text */}
            <div style={{
              position: "absolute", left: imgLeft, right: imgRight, bottom: imgBottom,
              zIndex: 10, padding: "64px 12px 12px",
              background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.4) 50%, transparent)",
            }}>
              <h3 style={{ fontFamily: "serif", fontSize: 16, fontWeight: 500, color: "white", lineHeight: 1.2 }}>
                {person.name}
              </h3>
              <p style={{ marginTop: 2, fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{person.role}</p>
              {person.socials && <SocialLinks socials={person.socials} />}
            </div>
          </div>

          {/* Legend */}
          {outlines && (
            <div style={{ position: "fixed", bottom: 20, right: 20, fontSize: 11, fontFamily: "monospace", backgroundColor: "rgba(0,0,0,0.8)", padding: 12, borderRadius: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ display: "inline-block", width: 20, borderBottom: "2px dashed rgba(255,100,100,0.5)" }} />
                <span style={{ color: "rgba(255,255,255,0.6)" }}>card frame ({cardW}×{cardH})</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ display: "inline-block", width: 20, borderBottom: "2px dashed rgba(100,200,255,0.5)" }} />
                <span style={{ color: "rgba(255,255,255,0.6)" }}>image ({cardW - imgLeft - imgRight}×{cardH - imgTop - imgBottom})</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
