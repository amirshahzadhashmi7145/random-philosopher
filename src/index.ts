import type { Era, Philosopher } from "./types.js";
import { ancientMedieval } from "./data/ancient-medieval.js";
import { renaissanceModern } from "./data/renaissance-modern.js";
import { contemporary } from "./data/contemporary.js";
import { seededRandom } from "./random.js";

export type { Era, Philosopher };
export { seededRandom };

/** Every philosopher in the dataset, ordered roughly by birth. Treat as read-only. */
export const philosophers: readonly Philosopher[] = Object.freeze([
  ...ancientMedieval,
  ...renaissanceModern,
  ...contemporary,
]);

/** All eras, in chronological order. */
export const eras: readonly Era[] = Object.freeze(["ancient", "medieval", "renaissance", "early-modern", "modern", "contemporary"]);

export interface PhilosopherFilter {
  /** One era or several. */
  era?: Era | Era[];
  /** One school/tradition or several, case-insensitive. */
  school?: string | string[];
  /** Substring of the region, case-insensitive. */
  region?: string;
  /** Born in or after this year (negative for BCE). */
  bornAfter?: number;
  /** Born in or before this year (negative for BCE). */
  bornBefore?: number;
  /** Only philosophers that have a quote. */
  hasQuote?: boolean;
}

export interface RandomOptions extends PhilosopherFilter {
  /** Seed for deterministic results. Same seed and filter always give the same philosopher. */
  seed?: number | string;
  /** Custom random source returning [0, 1). Overrides `seed`. */
  random?: () => number;
}

const norm = (s: string) => s.trim().toLowerCase();
const toArray = <T,>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

/** All distinct schools/traditions in the dataset, sorted. */
export function getSchools(): string[] {
  return [...new Set(philosophers.flatMap((p) => p.schools))].sort();
}

/** All distinct regions in the dataset, sorted. */
export function getRegions(): string[] {
  return [...new Set(philosophers.map((p) => p.region))].sort();
}

/** Return every philosopher matching the filter. No filter returns all of them. */
export function getPhilosophers(filter: PhilosopherFilter = {}): Philosopher[] {
  const eraSet = new Set(toArray(filter.era));
  const schoolSet = new Set(toArray(filter.school).map(norm));
  const region = filter.region === undefined ? undefined : norm(filter.region);

  return philosophers.filter((p) => {
    if (eraSet.size && !eraSet.has(p.era)) return false;
    if (schoolSet.size && !p.schools.some((s) => schoolSet.has(norm(s)))) return false;
    if (region !== undefined && !norm(p.region).includes(region)) return false;
    if (filter.bornAfter !== undefined && (p.born === null || p.born < filter.bornAfter)) return false;
    if (filter.bornBefore !== undefined && (p.born === null || p.born > filter.bornBefore)) return false;
    if (filter.hasQuote && !p.quote) return false;
    return true;
  });
}

function pickRandom(options: RandomOptions): () => number {
  if (options.random) return options.random;
  if (options.seed !== undefined) return seededRandom(options.seed);
  return Math.random;
}

/**
 * Pick one philosopher at random, optionally filtered.
 * Throws a RangeError when the filter matches nobody.
 */
export function getRandomPhilosopher(options: RandomOptions = {}): Philosopher {
  const pool = getPhilosophers(options);
  if (pool.length === 0) throw new RangeError("No philosopher matches the given filter");
  const rnd = pickRandom(options);
  return pool[Math.floor(rnd() * pool.length)];
}

/**
 * Pick `count` distinct philosophers at random, optionally filtered.
 * Returns fewer than `count` when the filter matches fewer philosophers.
 */
export function getRandomPhilosophers(count: number, options: RandomOptions = {}): Philosopher[] {
  if (!Number.isInteger(count) || count < 0) throw new RangeError("count must be a non-negative integer");
  const pool = getPhilosophers(options);
  const rnd = pickRandom(options);
  // Partial Fisher-Yates shuffle.
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const j = i + Math.floor(rnd() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

/** A random quote with its author. Throws when no matching philosopher has a quote. */
export function getRandomQuote(options: RandomOptions = {}): { quote: string; philosopher: Philosopher } {
  const p = getRandomPhilosopher({ ...options, hasQuote: true });
  return { quote: p.quote as string, philosopher: p };
}

/** Find a philosopher by id or name, case-insensitive. Exact matches win, then substring matches. */
export function getPhilosopherByName(nameOrId: string): Philosopher | undefined {
  const q = norm(nameOrId);
  if (!q) return undefined;
  return (
    philosophers.find((p) => p.id === q || norm(p.name) === q) ??
    philosophers.find((p) => norm(p.name).includes(q))
  );
}

/** Full-text search over name, intro, schools, works and quote. Case-insensitive substring match. */
export function searchPhilosophers(query: string): Philosopher[] {
  const q = norm(query);
  if (!q) return [];
  return philosophers.filter((p) =>
    [p.name, p.intro, p.region, ...p.schools, ...p.works, p.quote ?? ""].some((s) => norm(s).includes(q)),
  );
}

export default getRandomPhilosopher;
