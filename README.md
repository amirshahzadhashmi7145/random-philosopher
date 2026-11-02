# random-philosopher

[![npm version](https://img.shields.io/npm/v/random-philosopher.svg)](https://www.npmjs.com/package/random-philosopher)
[![CI](https://github.com/amirshahzadhashmi7145/random-philosopher/actions/workflows/ci.yml/badge.svg)](https://github.com/amirshahzadhashmi7145/random-philosopher/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/random-philosopher.svg)](./LICENSE)

Random philosophers with a short introduction, dates, era, schools of thought, major works and a quote where one is well attested. Over 100 thinkers from Thales to Judith Butler, across Greek, Roman, Chinese, Indian, Islamic, Jewish and European traditions.

Filter by era or tradition, seed the randomness for reproducible output, look people up by name, or use it from the command line. Zero dependencies, TypeScript types included.

```js
import { getRandomPhilosopher } from "random-philosopher";

const p = getRandomPhilosopher();
console.log(p.name);   // "Epictetus"
console.log(p.intro);  // "Born into slavery and later freed, Epictetus taught Stoicism in Greece. ..."
console.log(p.quote);  // "Some things are within our power, while others are not."
```

Handy for placeholder data, quote-of-the-day widgets, flashcards, Discord bots, or anything that needs a believable name and bio.

## Install

```sh
npm install random-philosopher
```

Node 18 or newer. Works with `import` and `require`.

## Data shape

```ts
interface Philosopher {
  id: string;            // "marcus-aurelius"
  name: string;          // "Marcus Aurelius"
  intro: string;         // one or two sentences
  born: number | null;   // 121   (negative for BCE, null if unknown)
  died: number | null;   // 180   (null if unknown or living)
  lifespan: string;      // "121–180 CE"
  era: "ancient" | "medieval" | "renaissance" | "early-modern" | "modern" | "contemporary";
  schools: string[];     // ["stoicism"]
  region: string;        // "Rome"
  works: string[];       // ["Meditations"]
  quote?: string;        // present for about 30 philosophers
}
```

## API

### `getRandomPhilosopher(options?)`

Returns one philosopher. Throws a `RangeError` if the filter matches nobody.

```js
getRandomPhilosopher({ era: "ancient" });
getRandomPhilosopher({ school: ["stoicism", "epicureanism"] });
getRandomPhilosopher({ region: "China", bornBefore: -300 });
getRandomPhilosopher({ hasQuote: true });
getRandomPhilosopher({ seed: "daily-2026-11-02" }); // same seed, same result
```

Options, all optional:

| Option       | Type                 | Meaning |
|--------------|----------------------|---------|
| `era`        | `Era \| Era[]`       | One or more eras. |
| `school`     | `string \| string[]` | Case-insensitive match against `schools`. |
| `region`     | `string`             | Case-insensitive substring of `region`. |
| `bornAfter`  | `number`             | Born in or after this year. Negative for BCE. |
| `bornBefore` | `number`             | Born in or before this year. |
| `hasQuote`   | `boolean`            | Only philosophers with a quote. |
| `seed`       | `number \| string`   | Deterministic results for the same seed and filter. |
| `random`     | `() => number`       | Your own random source in `[0, 1)`. Overrides `seed`. |

### `getRandomPhilosophers(count, options?)`

Several distinct philosophers. Returns fewer than `count` when the filter matches fewer.

```js
getRandomPhilosophers(3, { era: "contemporary" });
```

### `getRandomQuote(options?)`

```js
const { quote, philosopher } = getRandomQuote({ school: "stoicism" });
```

### `getPhilosophers(filter?)`

Every match, in dataset order. No filter returns all of them.

### `getPhilosopherByName(nameOrId)`

Case-insensitive. Exact id or name first, then substring. `getPhilosopherByName("beauvoir")` finds Simone de Beauvoir.

### `searchPhilosophers(query)`

Substring search across name, intro, region, schools, works and quote.

### `philosophers`, `eras`, `getSchools()`, `getRegions()`

The full frozen dataset, the six eras in order, and the sorted distinct schools and regions.

### `seededRandom(seed)`

The small deterministic generator used for `seed`, exported in case you want it elsewhere.

## CLI

```sh
npx random-philosopher                     # one random profile
npx random-philosopher -n 3 -e ancient     # three ancient philosophers
npx random-philosopher -q -s stoicism      # a Stoic quote
npx random-philosopher --name nietzsche    # look someone up
npx random-philosopher --search "trolley"  # search everything
npx random-philosopher --list -r China     # list matches, one per line
npx random-philosopher --schools           # what traditions are available
npx random-philosopher --json --seed 7     # machine-readable, reproducible
```

Run `npx random-philosopher --help` for every flag. Exit code is `0` on success and `2` on a bad option or an empty result.

## Upgrading from 1.x

`getRandomPhilosopher()` still returns an object with `name` and `intro`, so existing code keeps working. Everything else is new: more fields, more philosophers, filters, seeding, lookup, and the CLI. The package now ships ESM and CommonJS builds with types. Deep requires of internal files such as `random-philosopher/philosophers` are no longer supported; use the `philosophers` export instead.

## Contributing

Additions and corrections are welcome. Each entry lives in `src/data/`. Keep intros to one or two factual sentences, use lowercase school names, and only add a `quote` that is well attested in the philosopher's own writing or reliable records of their teaching.

## License

MIT
