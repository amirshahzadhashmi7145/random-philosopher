import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const CLI = resolve("dist/cli.js");
const run = (...args) => {
  const r = spawnSync(process.execPath, [CLI, ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout, err: r.stderr };
};

test("default prints one profile", () => {
  const r = run("--seed", "abc");
  assert.equal(r.code, 0);
  assert.match(r.out, /^.+ \(.+\)\n  .+\n  Era: /);
  assert.equal(run("--seed", "abc").out, r.out);
});

test("--count prints several, --json gives array", () => {
  const r = run("-n", "3", "--json", "--seed", "1");
  assert.equal(r.code, 0);
  const j = JSON.parse(r.out);
  assert.equal(j.length, 3);
  assert.equal(new Set(j.map((p) => p.id)).size, 3);
  const one = JSON.parse(run("--json", "--seed", "1").out);
  assert.equal(typeof one.id, "string");
});

test("filters: era, school, region, years", () => {
  const j = JSON.parse(run("--json", "-n", "50", "-e", "ancient,medieval", "--list").out);
  assert.ok(j.every((p) => p.era === "ancient" || p.era === "medieval"));
  const s = JSON.parse(run("--json", "--list", "-s", "stoicism").out);
  assert.ok(s.length >= 4 && s.every((p) => p.schools.includes("stoicism")));
  const c = JSON.parse(run("--json", "--list", "-r", "China", "--born-before", "-300").out);
  assert.ok(c.length >= 3 && c.every((p) => p.born <= -300));
});

test("--quote, --name, --search", () => {
  const q = run("-q", "--seed", "z");
  assert.equal(q.code, 0);
  assert.match(q.out, /^".+"\n  — .+\n$/);
  const n = run("--name", "kant");
  assert.equal(n.code, 0);
  assert.match(n.out, /^Immanuel Kant \(1724–1804\)/);
  const s = run("--search", "trolley");
  assert.equal(s.code, 0);
  assert.match(s.out, /Philippa Foot/);
});

test("--eras, --schools, --regions", () => {
  assert.match(run("--eras").out, /^ancient\nmedieval\n/);
  assert.match(run("--schools").out, /\nstoicism\n/);
  assert.match(run("--regions").out, /Greece/);
  assert.equal(JSON.parse(run("--eras", "--json").out).length, 6);
});

test("errors exit 2 with a message", () => {
  assert.equal(run("--era", "space-age").code, 2);
  assert.match(run("--era", "space-age").err, /Unknown era/);
  assert.equal(run("--name", "nobody-xyz").code, 2);
  assert.equal(run("-s", "nothing-here").code, 2);
  assert.equal(run("-q", "-s", "mohism").code, 2);
  assert.equal(run("--count", "0").code, 2);
  assert.equal(run("--bogus").code, 2);
});

test("--help and --version", () => {
  assert.equal(run("--help").code, 0);
  assert.match(run("-v").out, /^2\.\d+\.\d+\n$/);
});
