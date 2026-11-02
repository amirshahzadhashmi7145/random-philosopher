import { test } from "node:test";
import assert from "node:assert/strict";
import retryDefault, {
  getRandomPhilosopher, getRandomPhilosophers, getRandomQuote, getPhilosophers,
  getPhilosopherByName, searchPhilosophers, philosophers, seededRandom,
} from "../dist/index.js";

test("getRandomPhilosopher returns a dataset entry with name and intro (v1 contract)", () => {
  const p = getRandomPhilosopher();
  assert.ok(philosophers.includes(p));
  assert.equal(typeof p.name, "string");
  assert.equal(typeof p.intro, "string");
});

test("default export is getRandomPhilosopher", () => {
  assert.equal(retryDefault, getRandomPhilosopher);
});

test("seed makes results deterministic", () => {
  const a = getRandomPhilosopher({ seed: "hello" });
  const b = getRandomPhilosopher({ seed: "hello" });
  const c = getRandomPhilosopher({ seed: "world" });
  assert.equal(a, b);
  assert.notEqual(a.id, c.id); // different seeds very likely differ; fixed strings so stable
  assert.equal(getRandomPhilosopher({ seed: 42 }), getRandomPhilosopher({ seed: 42 }));
});

test("custom random source is honoured", () => {
  assert.equal(getRandomPhilosopher({ random: () => 0 }), philosophers[0]);
  assert.equal(getRandomPhilosopher({ random: () => 0.999999 }), philosophers[philosophers.length - 1]);
});

test("seededRandom yields values in [0, 1) and repeats per seed", () => {
  const r1 = seededRandom("x"), r2 = seededRandom("x");
  for (let i = 0; i < 100; i++) {
    const v = r1();
    assert.ok(v >= 0 && v < 1);
    assert.equal(v, r2());
  }
});

test("filters by era, school, region, years, quote", () => {
  for (const p of getPhilosophers({ era: "ancient" })) assert.equal(p.era, "ancient");
  const two = getPhilosophers({ era: ["ancient", "medieval"] });
  assert.ok(two.every((p) => p.era === "ancient" || p.era === "medieval"));
  assert.ok(two.length > getPhilosophers({ era: "ancient" }).length);

  const stoics = getPhilosophers({ school: "Stoicism" });
  assert.ok(stoics.length >= 4);
  assert.ok(stoics.every((p) => p.schools.includes("stoicism")));
  assert.ok(getPhilosophers({ school: ["stoicism", "epicureanism"] }).length > stoics.length);

  const china = getPhilosophers({ region: "china" });
  assert.ok(china.length >= 5 && china.every((p) => p.region.toLowerCase().includes("china")));

  const nineteenth = getPhilosophers({ bornAfter: 1800, bornBefore: 1899 });
  assert.ok(nineteenth.length > 5 && nineteenth.every((p) => p.born >= 1800 && p.born <= 1899));
  assert.ok(getPhilosophers({ bornBefore: -400 }).every((p) => p.born <= -400));

  assert.ok(getPhilosophers({ hasQuote: true }).every((p) => typeof p.quote === "string"));
});

test("getPhilosophers with no filter returns everything, as a fresh array", () => {
  const all = getPhilosophers();
  assert.equal(all.length, philosophers.length);
  all.push(null);
  assert.equal(getPhilosophers().length, philosophers.length);
});

test("random with filter respects it and throws on empty match", () => {
  for (let i = 0; i < 20; i++) assert.equal(getRandomPhilosopher({ school: "taoism" }).schools.includes("taoism"), true);
  assert.throws(() => getRandomPhilosopher({ school: "does-not-exist" }), RangeError);
});

test("getRandomPhilosophers returns distinct entries and clamps to pool size", () => {
  const five = getRandomPhilosophers(5, { seed: 1 });
  assert.equal(five.length, 5);
  assert.equal(new Set(five.map((p) => p.id)).size, 5);
  assert.deepEqual(getRandomPhilosophers(5, { seed: 1 }), five);
  const pool = getPhilosophers({ school: "cynicism" });
  assert.equal(getRandomPhilosophers(10, { school: "cynicism" }).length, pool.length);
  assert.deepEqual(getRandomPhilosophers(0), []);
  assert.throws(() => getRandomPhilosophers(-1), RangeError);
  assert.throws(() => getRandomPhilosophers(1.5), RangeError);
});

test("getRandomQuote returns quote and author; throws when no quotes match", () => {
  const { quote, philosopher } = getRandomQuote({ seed: "q" });
  assert.equal(quote, philosopher.quote);
  assert.throws(() => getRandomQuote({ school: "mohism" }), RangeError);
});

test("getPhilosopherByName: id, exact name, substring, case-insensitive", () => {
  assert.equal(getPhilosopherByName("socrates").name, "Socrates");
  assert.equal(getPhilosopherByName("  SOCRATES ").name, "Socrates");
  assert.equal(getPhilosopherByName("simone-de-beauvoir").name, "Simone de Beauvoir");
  assert.equal(getPhilosopherByName("beauvoir").name, "Simone de Beauvoir");
  assert.equal(getPhilosopherByName("Kant").name, "Immanuel Kant");
  assert.equal(getPhilosopherByName("nobody-here"), undefined);
  assert.equal(getPhilosopherByName(""), undefined);
});

test("searchPhilosophers searches across fields", () => {
  assert.ok(searchPhilosophers("Republic").some((p) => p.id === "plato"));
  assert.ok(searchPhilosophers("sisyphus").some((p) => p.id === "camus"));
  assert.ok(searchPhilosophers("Nobel").length >= 2);
  assert.deepEqual(searchPhilosophers(""), []);
  assert.deepEqual(searchPhilosophers("zzzzqqq"), []);
});
