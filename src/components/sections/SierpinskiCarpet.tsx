import { useRef, useEffect, useCallback } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const QUOTES = [
  "THE GOLDEN AGE IS ALREADY IN THE COMPUTER",
  "ALL WE HAVE TO DO IS ARRANGE THE MARKDOWN FILES",
  "A SMALL GROUP OF PEOPLE WHO SHARE CONTEXT DEEPLY LIVE NEAR EACH OTHER AND BUILD TOOLS FOR EACH OTHER CAN MOVE DRAMATICALLY FASTER THAN INDIVIDUALS WORKING ALONE",
  "IT IS NOT A COMPANY IT IS NOT AN APP IT IS AN OPEN SOURCE GOLDEN AGE PROTOCOL",
  "A REPLICABLE ARRANGEMENT OF KNOWLEDGE RELATIONSHIPS AND INFRASTRUCTURE",
  "DON'T BUILD POLISHED APPS LAY OUT ALL THE RAW MATERIAL",
  "EVERYONE ALREADY HAS THEIR OWN AI AGENT WHAT THEY LACK IS PARTS",
  "YOUR CLAUDE TALKS TO THE JUNKYARD MY CLAUDE TALKS TO THE JUNKYARD THE JUNKYARD IS THE THIRD BRAIN",
  "IF IT FEELS LIKE A CHORE YOU'RE DOING IT WRONG IF IT FEELS LIKE A NEW MINECRAFT WORLD YOU'RE DOING IT RIGHT",
  "SOCIAL TECHNOLOGY IS NOW FORKABLE ANYONE CAN FORK IT AND HOST THEIR OWN VERSION ANYWHERE IN THE WORLD",
  "THE CONFIG IS THE LESSON",
  "GAIN OF FUNCTION RESEARCH ON THE GOLDEN AGE VIRUS",
  "MODERNITY ACTS LIKE A CENTRIFUGE SEPARATING PEOPLE BY AGE INCOME INTEREST GEOGRAPHY",
  "THE ANTIDOTE IS INTENTIONAL INSTITUTIONS THAT RE-MINGLE WHAT THE CENTRIFUGE HAS SEPARATED",
  "SPEEDRUNNING PEOPLE TOWARDS LIFE FULFILLMENT",
  "A GROUP OF FRIENDS CAN WRITE A SINGLE MARKDOWN FILE AND INFLUENCE MILLIONS OF LIVES OVERNIGHT",
  "IT SHOULD FEEL LIKE LOGGING INTO A WORLD NOT OPENING A DASHBOARD",
  "THINK XEROX PARC THINK THE MANHATTAN PROJECT",
  "YOU'RE A WIZARD NOW HARRY",
  "TAKING THE FRACTAL PILL SHOULD JUST BE PUTTING A MARKDOWN FILE AT YOUR TOP",
  "A ZIP FILE YOU CAN OPEN ANYWHERE AND TALK TO",
  "PLAY FRACTAL",
  "THE MMO",
  "ONCE SOMEONE HAS SOLVED THEIR OWN PROBLEMS THEIR LOCUS OF CONCERN NATURALLY EXPANDS OUTWARD",
  "100000 PEOPLE WHO HAVE FOUND DEEP LIFE SATISFACTION AND ARE READY FOR THE NEXT THING WHAT DO THEY DO TOGETHER",
  "FRACTAL IS FIVE INTERCONNECTED INSTITUTIONS SHARING A PHYSICAL SPACE IN WILLIAMSBURG BROOKLYN",
  "METRICS AS COWARDICE",
  "THE COOPERATION MACHINE",
  "TYRANNY OF THE MARGINAL USER",
  "LIBERATING ARTS ENVIRONMENTS THAT LIBERATE THE SPIRIT AND ENCOURAGE EXPERIMENTATION",
  "HOW DO WE BUILD A GOLDEN AGE STARTING WITH OUR FRIENDS",
  "THE DEEPER GAME THE NETWORK IS SPEEDRUNNING PEOPLE TOWARDS LIFE FULFILLMENT",
  "COMPOUND ENGINEERING EVERY UNIT OF WORK MAKES THE NEXT EASIER",
  "FRACTAL TORONTO APPEARED SPONTANEOUSLY",
  "A SKILLS AS PAMPHLETS THESIS",
  "THE PEDAGOGY IS MONTESSORI DERIVED THE LIBERATING ARTS",
];

const SEP = " · ";
const fullText = QUOTES.join(SEP);
const textLen = fullText.length;

const MAX_LEVEL = 4;
const SIZE = 3 ** MAX_LEVEL; // 81

// Pre-compute hole levels for each cell
const holeLevels = new Uint8Array(SIZE * SIZE);
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    for (let r = 1; r <= MAX_LEVEL; r++) {
      const i = MAX_LEVEL - r + 1;
      const p = 3 ** i;
      const third = p / 3;
      if (
        Math.floor((x % p) / third) === 1 &&
        Math.floor((y % p) / third) === 1
      ) {
        holeLevels[y * SIZE + x] = r;
        break;
      }
    }
  }
}

const filledAtLevel: number[] = [];
for (let lvl = 0; lvl <= MAX_LEVEL; lvl++) {
  let c = 0;
  for (let k = 0; k < SIZE * SIZE; k++) {
    if (holeLevels[k] === 0 || holeLevels[k] > lvl) c++;
  }
  filledAtLevel[lvl] = c;
}

function cellFilled(idx: number, progress: number): boolean {
  const hl = holeLevels[idx];
  if (hl === 0) return true;
  const fullLvl = Math.floor(progress);
  if (hl <= fullLvl) return false;
  const frac = progress - fullLvl;
  if (hl === fullLvl + 1 && frac > 0) {
    const x = idx % SIZE;
    const y = (idx / SIZE) | 0;
    const h = ((x * 7919 + y * 104729 + hl * 31) & 0x7fffffff) % 1000;
    return h >= ((frac * 1000) | 0);
  }
  return true;
}

interface SierpinskiCarpetProps {
  className?: string;
  style?: React.CSSProperties;
  photoUrl?: string;
  autoPlay?: boolean;
  padding?: number;
}

export function SierpinskiCarpet({
  className = "",
  style,
  photoUrl,
  autoPlay = true,
  padding = 60,
}: SierpinskiCarpetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const stateRef = useRef({
    // FRAC-28: when reduced motion is active, start the carpet fully grown
    // and stationary so the user sees the finished fractal without the
    // grow-in animation or scrolling text.
    progress: prefersReducedMotion ? MAX_LEVEL : 0,
    textOffset: 0,
    playing: autoPlay,
    phase: (prefersReducedMotion ? "stream" : "grow") as "grow" | "stream",
    lastTime: 0,
    streamAcc: 0,
    photo: null as HTMLImageElement | null,
    cellPx: 0,
    totalPx: 0,
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = stateRef.current;
    const { totalPx, cellPx, progress, photo } = s;
    if (!totalPx) return;

    const hasPhoto = photo?.complete && photo.naturalWidth;
    const fontSize = Math.max(4, cellPx * 0.82);
    const halfCell = cellPx / 2;

    // Clear canvas (transparent)
    ctx.clearRect(0, 0, totalPx, totalPx);

    // Photo into hole cells — drawn 1:1 into the square
    if (progress > 0 && hasPhoto && photo) {
      ctx.save();
      ctx.beginPath();
      for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
          if (!cellFilled(y * SIZE + x, progress)) {
            ctx.rect(x * cellPx, y * cellPx, cellPx, cellPx);
          }
        }
      }
      ctx.clip();
      // Center-crop: scale to cover the square, then center
      const scale = Math.max(totalPx / photo.naturalWidth, totalPx / photo.naturalHeight);
      const dw = photo.naturalWidth * scale;
      const dh = photo.naturalHeight * scale;
      ctx.drawImage(photo, (totalPx - dw) / 2, (totalPx - dh) / 2, dw, dh);
      ctx.restore();
    }

    // Text on filled cells
    ctx.fillStyle = "rgba(23, 23, 23, 0.88)";
    ctx.font = `${fontSize}px 'JetBrains Mono','Courier New',monospace`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    let ci = ((s.textOffset % textLen) + textLen) % textLen;

    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        if (cellFilled(y * SIZE + x, progress)) {
          ctx.fillText(
            fullText[ci],
            x * cellPx + halfCell,
            y * cellPx + halfCell
          );
          ci = (ci + 1) % textLen;
        }
      }
    }
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const s = stateRef.current;
    const max = Math.min(
      container.clientWidth - padding,
      container.clientHeight - padding
    );
    s.cellPx = Math.max(4, Math.floor(max / SIZE));
    s.totalPx = s.cellPx * SIZE;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = s.totalPx * dpr;
    canvas.height = s.totalPx * dpr;
    canvas.style.width = s.totalPx + "px";
    canvas.style.height = s.totalPx + "px";
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [padding]);

  useEffect(() => {
    // Load photo
    if (photoUrl) {
      const img = new Image();
      img.onload = () => {
        stateRef.current.photo = img;
        draw();
      };
      img.src = photoUrl;
    }

    // Resize handling
    let lastW = 0;
    let lastH = 0;
    let resizeRaf: number;

    function checkResize() {
      const container = containerRef.current;
      if (container) {
        const pw = container.clientWidth;
        const ph = container.clientHeight;
        if (pw !== lastW || ph !== lastH) {
          lastW = pw;
          lastH = ph;
          resizeCanvas();
          draw();
        }
      }
      resizeRaf = requestAnimationFrame(checkResize);
    }

    resizeCanvas();
    draw();
    resizeRaf = requestAnimationFrame(checkResize);

    // FRAC-28: When the user prefers reduced motion, render the fully-grown
    // carpet once (state was initialised to MAX_LEVEL above) and skip the
    // requestAnimationFrame tick that would otherwise grow the fractal and
    // scroll the text. The resize-check loop above is kept because it is
    // responsive layout polling, not decorative motion.
    let animRaf: number | undefined;
    if (!prefersReducedMotion) {
      // Animation loop
      function tick(now: number) {
        animRaf = requestAnimationFrame(tick);
        const s = stateRef.current;
        if (!s.playing) {
          s.lastTime = now;
          return;
        }

        const dt = Math.min(now - s.lastTime, 50);
        s.lastTime = now;

        if (s.phase === "grow") {
          s.progress += dt * 0.0004;
          if (s.progress >= MAX_LEVEL) {
            s.progress = MAX_LEVEL;
            s.phase = "stream";
            s.streamAcc = 0;
          }
          draw();
        } else if (s.phase === "stream") {
          s.streamAcc += dt;
          if (s.streamAcc > 120) {
            s.textOffset++;
            s.streamAcc -= 120;
            draw();
          }
        }
      }

      animRaf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(resizeRaf);
      if (animRaf !== undefined) cancelAnimationFrame(animRaf);
    };
  }, [photoUrl, draw, resizeCanvas, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center ${className}`}
      style={style}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block" }}
      />
    </div>
  );
}
