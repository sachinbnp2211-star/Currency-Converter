export const DEFAULT_CURRENCY_FROM = "USD";
export const DEFAULT_CURRENCY_TO = "INR";
export const DEFAULT_AMOUNT = "1";

export function normalizeCurrencyCode(currencyCode) {
  if (typeof currencyCode !== "string") {
    return "";
  }

  const normalized = currencyCode.trim().toUpperCase();
  return normalized.length === 3 ? normalized : "";
}

export function sanitizeAmount(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return null;
  }

  return numericValue;
}

export function calculateConvertedAmount(amountValue, rate) {
  const normalizedAmount = sanitizeAmount(amountValue);

  if (normalizedAmount === null || !Number.isFinite(rate) || rate <= 0) {
    return null;
  }

  const result = normalizedAmount * rate;

  if (!Number.isFinite(result)) {
    return null;
  }

  return Number(result.toFixed(10));
}

export function formatCurrencyNumber(value) {
  const safeValue = Number(value);

  if (!Number.isFinite(safeValue)) {
    return "0";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(safeValue);
}

export function formatConversionResult(amountValue, rate, fromCurrency, toCurrency) {
  const sanitizedAmount = sanitizeAmount(amountValue);

  if (sanitizedAmount === null || !Number.isFinite(rate) || rate <= 0) {
    return "Conversion unavailable";
  }

  const convertedAmount = calculateConvertedAmount(sanitizedAmount, rate);

  if (convertedAmount === null) {
    return "Conversion unavailable";
  }

  return `${formatCurrencyNumber(sanitizedAmount)} ${fromCurrency} = ${formatCurrencyNumber(convertedAmount)} ${toCurrency}`;
}

export function buildCurrencyOptions(currencyMap) {
  return Object.keys(currencyMap || {}).sort();
}

export function swapCurrencies(fromCurrency, toCurrency) {
  return {
    from: toCurrency,
    to: fromCurrency,
  };
}
