import { FadeIn } from "@/components/ui/FadeIn";

interface SectorHeaderProps {
  letter: string;
  name: string;
  color: string;
}

export function SectorHeader({ letter, name, color }: SectorHeaderProps) {
  return (
    <FadeIn>
      <div className="text-center mb-4 md:mb-12">
        <span
          className="block text-[7rem] md:text-[14rem] leading-none"
          style={{ fontFamily: "'Jacquard 24', serif", color }}
        >
          {letter}
        </span>
        <span className="text-label" style={{ color }}>
          {name}
        </span>
      </div>
    </FadeIn>
  );
}
