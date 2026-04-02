import { usePretext } from '@/hooks/use-pretext';
import { fontString, FONTS } from '@/lib/pretext';

interface PretextParagraphProps {
  children: string;
  size?: number;
  lineHeight?: number;
  font?: string;
  className?: string;
}

export function PretextParagraph({
  children,
  size = 16,
  lineHeight,
  font = FONTS.body,
  className = '',
}: PretextParagraphProps) {
  const lh = lineHeight ?? Math.round(size * 1.6);
  const { lines, height, containerRef, ready } = usePretext(
    children,
    fontString(size, font),
    lh,
  );

  if (!ready || !lines) {
    return (
      <p
        ref={containerRef as React.RefObject<HTMLParagraphElement>}
        className={className}
        style={{
          fontSize: size,
          lineHeight: `${lh}px`,
          fontFamily: font,
        }}
      >
        {children}
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height,
        fontSize: size,
        lineHeight: `${lh}px`,
        fontFamily: font,
      }}
      role="paragraph"
      aria-label={children}
    >
      {lines.map((line, i) => (
        <span key={i} style={{ display: 'block' }}>
          {line.text}
        </span>
      ))}
    </div>
  );
}
