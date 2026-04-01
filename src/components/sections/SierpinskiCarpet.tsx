interface SierpinskiCarpetProps {
  depth?: number;
  className?: string;
  imageUrl?: string;
}

function Cell({ level }: { level: number }) {
  if (level <= 0) {
    return <div className="w-full h-full bg-foreground/90" />;
  }

  return (
    <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
      {Array.from({ length: 9 }, (_, i) =>
        i === 4 ? (
          <div key={i} className="w-full h-full" /> // center hole - transparent
        ) : (
          <Cell key={i} level={level - 1} />
        )
      )}
    </div>
  );
}

export function SierpinskiCarpet({
  depth = 3,
  className = "",
  imageUrl,
}: SierpinskiCarpetProps) {
  return (
    <div className={`relative ${className}`}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0">
        <Cell level={depth} />
      </div>
    </div>
  );
}
