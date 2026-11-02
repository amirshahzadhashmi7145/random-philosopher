import { readFileSync } from "node:fs";
import {
  eras, getSchools, getRegions, getPhilosophers, getRandomPhilosophers, getRandomQuote,
  getPhilosopherByName, searchPhilosophers, type Era, type Philosopher, type RandomOptions,
} from "./index.js";

const HELP = `random-philosopher: print a random philosopher, or look one up.

Usage:
  random-philosopher [options]

Options:
  -n, --count <n>        Print n distinct philosophers (default: 1)
  -e, --era <era>        Filter by era (repeatable, or comma-separated)
  -s, --school <name>    Filter by school/tradition (repeatable, or comma-separated)
  -r, --region <text>    Filter by region substring
      --born-after <y>   Born in or after year (negative for BCE)
      --born-before <y>  Born in or before year
      --seed <value>     Deterministic output for the same seed and filters
  -q, --quote            Print a random quote instead of a profile
      --name <text>      Look up one philosopher by name or id
      --search <text>    Search names, intros, schools, works and quotes
      --list             List matching philosophers as one line each
      --eras             List eras
      --schools          List schools/traditions
      --regions          List regions
      --json             Output JSON
  -h, --help             Show this help
  -v, --version          Show version
`;

function fail(message: string): never {
  process.stderr.write(`random-philosopher: ${message}\n`);
  process.exit(2);
}

function readVersion(): string {
  try {
    return JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version as string;
  } catch {
    return "unknown";
  }
}

function formatProfile(p: Philosopher): string {
  const lines = [
    `${p.name} (${p.lifespan})`,
    `  ${p.intro}`,
    `  Era: ${p.era}   Schools: ${p.schools.join(", ")}   Region: ${p.region}`,
  ];
  if (p.works.length) lines.push(`  Works: ${p.works.join("; ")}`);
  if (p.quote) lines.push(`  "${p.quote}"`);
  return lines.join("\n");
}

function formatLine(p: Philosopher): string {
  return `${p.name.padEnd(36)} ${p.lifespan.padEnd(28)} ${p.era}`;
}

function main(): void {
  const argv = process.argv.slice(2);
  const opts: RandomOptions = {};
  let count = 1;
  let json = false;
  let mode: "random" | "quote" | "name" | "search" | "list" | "eras" | "schools" | "regions" = "random";
  let query = "";
  const eraList: string[] = [];
  const schoolList: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) fail(`Missing value for ${a}`);
      return v;
    };
    const num = (v: string) => {
      const n = Number(v);
      if (!Number.isFinite(n)) fail(`Expected a number for ${a}, got "${v}"`);
      return n;
    };
    switch (a) {
      case "-h": case "--help": process.stdout.write(HELP); process.exit(0);
      case "-v": case "--version": process.stdout.write(`${readVersion()}\n`); process.exit(0);
      case "-n": case "--count": count = num(next()); break;
      case "-e": case "--era": eraList.push(...next().split(",")); break;
      case "-s": case "--school": schoolList.push(...next().split(",")); break;
      case "-r": case "--region": opts.region = next(); break;
      case "--born-after": opts.bornAfter = num(next()); break;
      case "--born-before": opts.bornBefore = num(next()); break;
      case "--seed": opts.seed = next(); break;
      case "-q": case "--quote": mode = "quote"; break;
      case "--name": mode = "name"; query = next(); break;
      case "--search": mode = "search"; query = next(); break;
      case "--list": mode = "list"; break;
      case "--eras": mode = "eras"; break;
      case "--schools": mode = "schools"; break;
      case "--regions": mode = "regions"; break;
      case "--json": json = true; break;
      default: fail(`Unknown option: ${a}\n\n${HELP}`);
    }
  }

  const cleanedEras = eraList.map((e) => e.trim().toLowerCase()).filter(Boolean);
  for (const e of cleanedEras) if (!(eras as readonly string[]).includes(e)) fail(`Unknown era "${e}". Valid: ${eras.join(", ")}`);
  if (cleanedEras.length) opts.era = cleanedEras as Era[];
  const cleanedSchools = schoolList.map((s) => s.trim()).filter(Boolean);
  if (cleanedSchools.length) opts.school = cleanedSchools;
  if (!Number.isInteger(count) || count < 1) fail("--count must be a positive integer");

  const out = (v: unknown): void => { process.stdout.write(`${json ? JSON.stringify(v, null, 2) : String(v)}\n`); };

  switch (mode) {
    case "eras": return out(json ? eras : eras.join("\n"));
    case "schools": return out(json ? getSchools() : getSchools().join("\n"));
    case "regions": return out(json ? getRegions() : getRegions().join("\n"));
    case "name": {
      const p = getPhilosopherByName(query);
      if (!p) fail(`No philosopher found for "${query}"`);
      return out(json ? p : formatProfile(p));
    }
    case "search": {
      const r = searchPhilosophers(query);
      if (r.length === 0) fail(`Nothing matched "${query}"`);
      return out(json ? r : r.map(formatLine).join("\n"));
    }
    case "list": {
      const r = getPhilosophers(opts);
      if (r.length === 0) fail("No philosopher matches those filters");
      return out(json ? r : r.map(formatLine).join("\n"));
    }
    case "quote": {
      try {
        const { quote, philosopher } = getRandomQuote(opts);
        return out(json ? { quote, philosopher } : `"${quote}"\n  — ${philosopher.name}`);
      } catch {
        fail("No philosopher with a quote matches those filters");
      }
    }
    // falls through
    default: {
      const r = getRandomPhilosophers(count, opts);
      if (r.length === 0) fail("No philosopher matches those filters");
      return out(json ? (count === 1 ? r[0] : r) : r.map(formatProfile).join("\n\n"));
    }
  }
}

main();
