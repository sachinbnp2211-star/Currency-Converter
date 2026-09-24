const API_BASE_URL = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/";
const RATE_CACHE_TTL = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10000;

const rateCache = new Map();
const inFlightRequests = new Map();

export function clearCurrencyRateCache() {
  rateCache.clear();
  inFlightRequests.clear();
}

export function normalizeCurrencyPair(fromCurrency, toCurrency) {
  const from = String(fromCurrency || "").trim().toLowerCase();
  const to = String(toCurrency || "").trim().toLowerCase();

  if (!from || !to || from.length !== 3 || to.length !== 3) {
    throw new Error("Both currencies must be valid 3-letter ISO codes.");
  }

  return { from, to };
}

export function readRateFromCache(fromCurrency, toCurrency) {
  const { from, to } = normalizeCurrencyPair(fromCurrency, toCurrency);
  const cacheKey = `${from}-${to}`;
  const cached = rateCache.get(cacheKey);

  if (!cached) {
    return null;
  }

  const isExpired = Date.now() - cached.fetchedAt > RATE_CACHE_TTL;

  if (isExpired) {
    rateCache.delete(cacheKey);
    return null;
  }

  return cached.rate;
}

export async function fetchCurrencyRate(fromCurrency, toCurrency) {
  const { from, to } = normalizeCurrencyPair(fromCurrency, toCurrency);
  const cacheKey = `${from}-${to}`;

  const cachedRate = readRateFromCache(from, to);
  if (cachedRate !== null) {
    return { rate: cachedRate, source: "cache", fetchedAt: Date.now() };
  }

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const requestPromise = (async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}${from}.json`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Currency API request failed with status ${response.status}.`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json") && !contentType.includes("+json")) {
        throw new Error("Currency API returned a non-JSON response.");
      }

      const payload = await response.json();
      if (!payload || typeof payload !== "object") {
        throw new Error("Currency API returned an invalid payload.");
      }

      const baseData = payload[from];
      if (!baseData || typeof baseData !== "object") {
        throw new Error(`Currency API did not include data for ${from.toUpperCase()}.`);
      }

      const rawRate = Number(baseData[to]);
      if (!Number.isFinite(rawRate) || rawRate <= 0) {
        throw new Error(`Currency API returned an invalid rate for ${from.toUpperCase()} to ${to.toUpperCase()}.`);
      }

      const result = {
        rate: rawRate,
        source: "network",
        fetchedAt: Date.now(),
      };

      rateCache.set(cacheKey, result);
      return result;
    } catch (error) {
      if (error && error.name === "AbortError") {
        throw new Error("The currency API request timed out. Please try again.");
      }

      throw error instanceof Error ? error : new Error("Unable to fetch exchange rate.");
    } finally {
      clearTimeout(timeoutId);
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}
