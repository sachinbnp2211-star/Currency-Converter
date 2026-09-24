import test from "node:test";
import assert from "node:assert/strict";

import { clearCurrencyRateCache, fetchCurrencyRate } from "../currencyService.js";

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  clearCurrencyRateCache();
  globalThis.fetch = originalFetch;
});

test("fetchCurrencyRate resolves a valid API response", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ usd: { inr: 83.2 } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  const result = await fetchCurrencyRate("USD", "INR");
  assert.equal(result.rate, 83.2);
});

test("fetchCurrencyRate rejects HTTP errors", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: "bad request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });

  await assert.rejects(fetchCurrencyRate("USD", "INR"), /Currency API request failed/);
});

test("fetchCurrencyRate rejects malformed or invalid payloads", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ usd: { inr: "nope" } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  await assert.rejects(fetchCurrencyRate("USD", "INR"), /invalid rate/i);
});
