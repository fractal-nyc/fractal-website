import type { Category } from "@/parlor/types";

/** `19:30` → `7:30 p.m.` Leaves any other string untouched so drafts still show. */
export function formatClock(value: string): string {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return value;
  const hours = Number(match[1]);
  const minutes = match[2];
  if (hours > 23) return value;
  const suffix = hours >= 12 ? "p.m." : "a.m.";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${suffix}`;
}

export function categoryPhrase(category: Category): string {
  return category === "lady" ? "a lady" : "a gentleman";
}
