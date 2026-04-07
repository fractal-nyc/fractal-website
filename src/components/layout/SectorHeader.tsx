import { FadeIn } from "@/components/ui/FadeIn";

interface SectorHeaderProps {
  letter: string;
  name: string;
  color: string;
}

export function SectorHeader({ letter, name, color }: SectorHeaderProps) {
  return (
    <FadeIn>
      <div className="text-center mb-8 md:mb-12">
        <span
          className="block text-[10rem] md:text-[14rem] leading-none"
          style={{ fontFamily: "'Jacquard 24', serif", color }}
        >
          {letter}
        </span>
        <span className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
          {name}
        </span>
      </div>
    </FadeIn>
  );
}
