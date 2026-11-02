import { test } from "node:test";
import assert from "node:assert/strict";
import { philosophers, eras, getSchools, getRegions } from "../dist/index.js";

test("dataset has at least 100 entries", () => {
  assert.ok(philosophers.length >= 100, `got ${philosophers.length}`);
});

test("ids are unique, kebab-case, and names are unique", () => {
  const ids = philosophers.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, id);
  const names = philosophers.map((p) => p.name);
  assert.equal(new Set(names).size, names.length);
});

test("every entry has the required shape", () => {
  for (const p of philosophers) {
    assert.equal(typeof p.name, "string");
    assert.ok(p.intro.length > 40, `${p.id} intro too short`);
    assert.ok(eras.includes(p.era), `${p.id} bad era ${p.era}`);
    assert.ok(Array.isArray(p.schools) && p.schools.length > 0, `${p.id} needs schools`);
    for (const s of p.schools) assert.equal(s, s.toLowerCase(), `${p.id} school not lowercase: ${s}`);
    assert.equal(typeof p.region, "string");
    assert.ok(Array.isArray(p.works));
    assert.ok(typeof p.lifespan === "string" && p.lifespan.length > 0);
    assert.ok(p.born === null || Number.isInteger(p.born), `${p.id} born`);
    assert.ok(p.died === null || Number.isInteger(p.died), `${p.id} died`);
    if (p.born !== null && p.died !== null) assert.ok(p.died > p.born, `${p.id} died before born`);
    if (p.quote !== undefined) assert.ok(p.quote.length > 5);
  }
});

test("era matches dates", () => {
  const bounds = {
    ancient: [-Infinity, 500], medieval: [450, 1500], renaissance: [1400, 1650],
    "early-modern": [1550, 1850], modern: [1750, 2000], contemporary: [1900, Infinity],
  };
  for (const p of philosophers) {
    if (p.born === null) continue;
    const [lo, hi] = bounds[p.era];
    assert.ok(p.born >= lo && p.born <= hi, `${p.id}: born ${p.born} outside ${p.era}`);
  }
});

test("living philosophers have died: null and 'present' in lifespan", () => {
  for (const p of philosophers) {
    if (p.died === null && p.born !== null && p.born > 1900) assert.match(p.lifespan, /present/, p.id);
    if (p.lifespan.includes("present")) assert.equal(p.died, null, p.id);
  }
});

test("original v1 philosophers are still present with name and intro", () => {
  for (const n of ["Socrates", "Plato", "Aristotle", "Immanuel Kant", "Friedrich Nietzsche", "René Descartes", "John Stuart Mill", "Confucius", "Jean-Paul Sartre", "Simone de Beauvoir"]) {
    const p = philosophers.find((x) => x.name === n);
    assert.ok(p, `missing ${n}`);
    assert.equal(typeof p.intro, "string");
  }
});

test("every era has entries; schools and regions are sorted and unique", () => {
  for (const e of eras) assert.ok(philosophers.some((p) => p.era === e), e);
  const s = getSchools();
  assert.deepEqual(s, [...new Set(s)].sort());
  assert.ok(s.includes("stoicism") && s.includes("existentialism"));
  const r = getRegions();
  assert.deepEqual(r, [...new Set(r)].sort());
});

test("dataset array is frozen", () => {
  assert.ok(Object.isFrozen(philosophers));
});
