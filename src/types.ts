export type Era = "ancient" | "medieval" | "renaissance" | "early-modern" | "modern" | "contemporary";

export interface Philosopher {
  /** Stable kebab-case identifier, e.g. "simone-de-beauvoir". */
  id: string;
  name: string;
  /** One or two sentence introduction. */
  intro: string;
  /** Birth year. Negative for BCE. null when unknown. */
  born: number | null;
  /** Death year. Negative for BCE. null when unknown or still living. */
  died: number | null;
  /** Human-readable dates, e.g. "c. 470–399 BCE" or "1929–present". */
  lifespan: string;
  era: Era;
  /** Schools or traditions, lowercase, e.g. ["stoicism"]. */
  schools: string[];
  /** Country or region most associated with the philosopher. */
  region: string;
  /** Major works, titles in English. Empty when none survive. */
  works: string[];
  /** A well-attested quotation, when one exists. */
  quote?: string;
}
