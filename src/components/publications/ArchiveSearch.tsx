import { useRef } from "react";
import { SearchBar } from "@/components/content/SearchBar";

interface ArchiveSearchProps {
  value: string;
  onChange: (value: string) => void;
}

/** Collection-filter behavior wrapper around the shared Search Bar chrome. */
export function ArchiveSearch({ value, onChange }: ArchiveSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return <SearchBar
    ref={inputRef}
    value={value}
    label="Search the archive"
    role="searchbox"
    placeholder="Search titles, authors, topics…"
    onChange={(event) => onChange(event.target.value)}
    onClear={() => onChange("")}
    data-archive-search
  />;
}
