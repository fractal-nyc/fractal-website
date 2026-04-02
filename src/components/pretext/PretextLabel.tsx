import { usePretext } from '@/hooks/use-pretext';
import { fontString, FONTS } from '@/lib/pretext';

interface PretextLabelProps {
  children: string;
  size?: number;
  lineHeight?: number;
  className?: string;
}

export function PretextLabel({
  children,
  size = 11,
  lineHeight,
  className = '',
}: PretextLabelProps) {
  const lh = lineHeight ?? Math.round(size * 1.5);
  const { lines, height, containerRef, ready } = usePretext(
    children,
    fontString(size, FONTS.mono),
    lh,
  );

  const baseStyle = {
    fontSize: size,
    lineHeight: `${lh}px`,
    fontFamily: FONTS.mono,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  };

  if (!ready || !lines) {
    return (
      <span
        ref={containerRef as React.RefObject<HTMLSpanElement>}
        className={className}
        style={baseStyle}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      ref={containerRef as React.RefObject<HTMLSpanElement>}
      className={className}
      style={{
        ...baseStyle,
        height,
        display: 'block',
      }}
    >
      {lines.map((line, i) => (
        <span key={i} style={{ display: 'block' }}>
          {line.text}
        </span>
      ))}
    </span>
  );
}
