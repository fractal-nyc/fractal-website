import type { ReactNode } from "react";

export function EditorialQuote({ children, citation }: { children: ReactNode; citation?: ReactNode }) {
  return (
    <blockquote className="relative border-l-2 border-current/35 pl-8 md:pl-12">
      <span aria-hidden className="absolute -top-7 left-4 select-none font-serif text-[96px] leading-none opacity-25 md:left-8">“</span>
      <div className="text-subtitle space-y-6 leading-relaxed normal-case italic">{children}</div>
      {citation && <footer className="text-label mt-6 opacity-80">{citation}</footer>}
    </blockquote>
  );
}
