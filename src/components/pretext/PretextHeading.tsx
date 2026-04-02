import { usePretext } from '@/hooks/use-pretext';
import { fontString, FONTS } from '@/lib/pretext';

interface PretextHeadingProps {
  children: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: number;
  lineHeight?: number;
  font?: string;
  className?: string;
}

export function PretextHeading({
  children,
  level = 2,
  size = 48,
  lineHeight,
  font = FONTS.serif,
  className = '',
}: PretextHeadingProps) {
  const lh = lineHeight ?? Math.round(size * 1.15);
  const { lines, height, containerRef, ready } = usePretext(
    children,
    fontString(size, font),
    lh,
  );
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  if (!ready || !lines) {
    return (
      <Tag
        ref={containerRef as React.RefObject<HTMLHeadingElement>}
        className={className}
        style={{
          fontSize: size,
          lineHeight: `${lh}px`,
          fontFamily: font,
        }}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      ref={containerRef as React.RefObject<HTMLHeadingElement>}
      className={className}
      style={{
        height,
        fontSize: size,
        lineHeight: `${lh}px`,
        fontFamily: font,
      }}
      aria-label={children}
    >
      {lines.map((line, i) => (
        <span key={i} style={{ display: 'block' }}>
          {line.text}
        </span>
      ))}
    </Tag>
  );
}
