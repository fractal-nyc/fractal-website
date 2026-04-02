import { SierpinskiCarpet } from "./SierpinskiCarpet";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden bg-[#faf8f5]">
      {/* Skyline background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}images/skyline4.png`}
          alt="NYC skyline"
          className="absolute"
          style={{
            bottom: "-10%",
            left: "20%",
            width: "60%",
            height: "90%",
            opacity: 0.2,
            objectFit: "cover",
            objectPosition: "center bottom",
            transform: "scale(1.75)",
            transformOrigin: "center bottom",
          }}
        />
      </div>

      {/* Sierpinski carpet — canvas-based animated ASCII art */}
      <SierpinskiCarpet
        photoUrl={`${import.meta.env.BASE_URL}images/hero-bg.png`}
        autoPlay
        padding={200}
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ transform: "translateY(-1px)" }}
      />
    </section>
  );
}
