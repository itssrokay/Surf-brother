import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  getSelection,
  validateEnquiry,
  composeEnquiry,
  addDays,
} from "./packages.js";
const c = JSON.parse(readFileSync(new URL("./content.json", import.meta.url)));
const base = {
  mode: "staySurf",
  days: 3,
  stay: "nonAc",
  guests: 2,
  date: "2099-02-02",
  meals: "veg",
  private: false,
  notes: "",
};
test("Owner-provided matrix is preserved for all 12 stay choices", () => {
  const expected = {
    3: [8000, 9000, 10000],
    5: [11500, 13500, 15000],
    7: [14500, 16500, 19500],
    10: [18000, 21000, 25000],
  };
  for (const [days, rates] of Object.entries(expected))
    for (const [i, stay] of ["camping", "nonAc", "ac"].entries()) {
      const sel = getSelection(c, { ...base, days: Number(days), stay });
      assert.equal(sel.rate, rates[i]);
      assert.equal(sel.nights, Number(days) - 1);
      assert.equal(sel.basis, null);
    }
});
test("Surf Only keeps exact per-person tuition and session counts", () => {
  for (const [days, rate] of [
    [1, 2000],
    [3, 6000],
    [5, 10000],
    [7, 13000],
    [10, 17000],
  ]) {
    const s = getSelection(c, { ...base, mode: "surfOnly", days });
    assert.equal(s.rate, rate);
    assert.equal(s.sessions, days);
    assert.equal(s.nights, 0);
    assert.equal(s.basis, "per person");
  }
});
test("Stay enquiry never turns unknown rate, meals or weekday discount into a total", () => {
  const msg = composeEnquiry(c, base);
  assert.match(msg, /Listed rate: ₹9,000 \(please confirm price basis\)/);
  assert.match(msg, /Veg, ₹300\/day/);
  assert.match(msg, /confirm meal-day count/);
  assert.match(msg, /discount basis/);
  assert.doesNotMatch(msg, /₹18,000|₹8,000|subtotal|Total:/);
  assert.match(msg, /₹2,000 advance per person/);
});
test("Surf-only enquiry calculates tuition only and never adds stay meals or weekday offer", () => {
  const msg = composeEnquiry(c, { ...base, mode: "surfOnly", days: 5 });
  assert.match(msg, /Tuition for 2 guests: ₹20,000/);
  assert.match(msg, /5 days \/ 5 sessions/);
  assert.doesNotMatch(msg, /Veg|Surf Into Savings/);
  assert.match(msg, /No refund after booking/);
});
test("Private training remains ₹3,000 per person per session", () => {
  const s = getSelection(c, { ...base, mode: "surfOnly", private: true });
  assert.equal(s.rate, 3000);
  assert.equal(s.sessions, 1);
  assert.equal(s.days, 1);
  assert.equal(s.basis, "per person per session");
});
test("Enquiry rejects missing/past/invalid dates and invalid guest counts", () => {
  for (const date of ["", "2000-01-01", "2099-02-31"])
    assert.ok(validateEnquiry({ ...base, date }, "2026-10-08").date);
  for (const guests of [0, -1, 1.5, 100, ""])
    assert.ok(validateEnquiry({ ...base, guests }).guests);
  assert.deepEqual(validateEnquiry(base), {});
  assert.throws(() => composeEnquiry(c, { ...base, date: "" }));
});
test("Exact night calculation crosses months safely", () => {
  assert.equal(addDays("2026-10-30", 4), "2026-11-03");
  assert.equal(addDays("2028-02-28", 2), "2028-03-01");
});
test("Unsupported combinations cannot be silently priced", () => {
  assert.throws(() => getSelection(c, { ...base, days: 1 }));
  assert.throws(() => getSelection(c, { ...base, stay: "privateRoom" }));
});
