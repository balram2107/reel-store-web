export const toPaise = (s: string): number | undefined => {
  const t = s.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : NaN;
};
export const fromPaise = (p?: number | null) =>
  p == null ? "" : String(p / 100);
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
export const UPI_RE = /^[\w.-]{2,256}@[A-Za-z]{2,64}$/;
