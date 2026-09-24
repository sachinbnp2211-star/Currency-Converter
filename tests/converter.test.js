import test from "node:test";
import assert from "node:assert/strict";

import {
  sanitizeAmount,
  calculateConvertedAmount,
  formatConversionResult,
  swapCurrencies,
  buildCurrencyOptions,
} from "../converter.js";

test("sanitizeAmount accepts valid positive numbers and rejects invalid values", () => {
  assert.equal(sanitizeAmount("12.5"), 12.5);
  assert.equal(sanitizeAmount("0"), 0);
  assert.equal(sanitizeAmount("-1"), null);
  assert.equal(sanitizeAmount("abc"), null);
  assert.equal(sanitizeAmount(""), null);
});

test("calculateConvertedAmount returns the correct conversion and rejects invalid inputs", () => {
  assert.equal(calculateConvertedAmount(10, 75.5), 755);
  assert.equal(calculateConvertedAmount("2.5", 12), 30);
  assert.equal(calculateConvertedAmount(-5, 10), null);
  assert.equal(calculateConvertedAmount(5, 0), null);
  assert.equal(calculateConvertedAmount("bad", 10), null);
});

test("formatConversionResult prints a readable conversion string", () => {
  assert.equal(formatConversionResult(1, 95.76, "USD", "INR"), "1 USD = 95.76 INR");
  assert.equal(formatConversionResult("5", 2.25, "USD", "EUR"), "5 USD = 11.25 EUR");
  assert.equal(formatConversionResult("-10", 10, "USD", "INR"), "Conversion unavailable");
});

test("swapCurrencies swaps the source and destination selections", () => {
  assert.deepEqual(swapCurrencies("USD", "INR"), { from: "INR", to: "USD" });
  assert.deepEqual(swapCurrencies("EUR", "GBP"), { from: "GBP", to: "EUR" });
});

test("buildCurrencyOptions returns sorted currency codes", () => {
  const options = buildCurrencyOptions({ USD: "US", INR: "IN", EUR: "FR", AUD: "AU" });
  assert.deepEqual(options, ["AUD", "EUR", "INR", "USD"]);
});
