import { countryList } from "./codes.js";
import {
 DEFAULT_AMOUNT,
 DEFAULT_CURRENCY_FROM,
 DEFAULT_CURRENCY_TO,
 buildCurrencyOptions,
 calculateConvertedAmount,
 formatConversionResult,
 sanitizeAmount,
 swapCurrencies,
} from "./converter.js";
import { fetchCurrencyRate } from "./currencyService.js";

const amountInput = document.querySelector("#amount");
const fromSelect = document.querySelector("#fromCurrency");
const toSelect = document.querySelector("#toCurrency");
const resultValue = document.querySelector(".result-value");
const statusMessage = document.querySelector("#statusMessage");
const resultBox = document.querySelector(".result-box");
const convertButton = document.querySelector(".convert-btn");
const swapButton = document.querySelector(".swap-btn");
const form = document.querySelector("#converterForm");
const flagFrom = document.querySelector(".flag1");
const flagTo = document.querySelector(".flag2");

const setUiState = (type, message) => {
 resultBox.classList.remove("is-error", "is-success");
 statusMessage.classList.remove("is-error", "is-success");

 if (type === "error") {
   resultBox.classList.add("is-error");
   statusMessage.classList.add("is-error");
 }

 if (type === "success") {
   resultBox.classList.add("is-success");
   statusMessage.classList.add("is-success");
 }

 statusMessage.textContent = message;
};

const setResultText = (text) => {
 resultValue.textContent = text;
};

const setAmountValue = () => {
 const sanitizedAmount = sanitizeAmount(amountInput.value);

 if (sanitizedAmount === null) {
   amountInput.value = DEFAULT_AMOUNT;
   return Number(DEFAULT_AMOUNT);
 }

 return sanitizedAmount;
};

const updateFlags = () => {
 const fromCode = countryList[fromSelect.value] || "US";
 const toCode = countryList[toSelect.value] || "IN";

 flagFrom.src = `https://flagsapi.com/${fromCode}/flat/64.png`;
 flagFrom.alt = `${fromSelect.value} flag`;
 flagTo.src = `https://flagsapi.com/${toCode}/flat/64.png`;
 flagTo.alt = `${toSelect.value} flag`;
};

const populateOptions = () => {
 const currencyCodes = buildCurrencyOptions(countryList);

 currencyCodes.forEach((code) => {
   const fromOption = document.createElement("option");
   const toOption = document.createElement("option");

   fromOption.value = code;
   fromOption.textContent = code;
   toOption.value = code;
   toOption.textContent = code;

   fromSelect.appendChild(fromOption);
   toSelect.appendChild(toOption);
 });

 fromSelect.value = DEFAULT_CURRENCY_FROM;
 toSelect.value = DEFAULT_CURRENCY_TO;
};

const setLoadingState = (isLoading) => {
 convertButton.disabled = isLoading;
 if (isLoading) {
   convertButton.textContent = "Loading...";
   return;
 }

 convertButton.textContent = "Convert";
};

const updateConversion = async () => {
 const enteredAmount = setAmountValue();
 const fromCurrency = fromSelect.value;
 const toCurrency = toSelect.value;

 if (!fromCurrency || !toCurrency) {
   setUiState("error", "Please select valid currencies.");
   setResultText("Conversion unavailable");
   return;
 }

 if (fromCurrency === toCurrency) {
   const sameCurrencyValue = formatConversionResult(enteredAmount, 1, fromCurrency, toCurrency);
   setResultText(sameCurrencyValue);
   setUiState("success", "Rates are identical for the same currency.");
   return;
 }

 try {
   setLoadingState(true);
   const { rate } = await fetchCurrencyRate(fromCurrency, toCurrency);
   const convertedAmount = calculateConvertedAmount(enteredAmount, rate);

   if (convertedAmount === null) {
     throw new Error("Unable to calculate converted amount.");
   }

   const nextResult = formatConversionResult(enteredAmount, rate, fromCurrency, toCurrency);
   setResultText(nextResult);
   setUiState("success", `${fromCurrency} to ${toCurrency} rate updated successfully.`);
 } catch (error) {
   setResultText("Conversion unavailable");
   setUiState(
     "error",
     error instanceof Error ? error.message : "Exchange rate unavailable right now. Please try again.",
   );
 } finally {
   setLoadingState(false);
 }
};

let updateTimer = null;

const queueUpdate = () => {
 if (updateTimer) {
   clearTimeout(updateTimer);
 }

 updateTimer = setTimeout(() => {
   updateConversion();
 }, 200);
};

fromSelect.addEventListener("change", () => {
 updateFlags();
 queueUpdate();
});

toSelect.addEventListener("change", () => {
 updateFlags();
 queueUpdate();
});

amountInput.addEventListener("input", () => {
 const sanitizedAmount = sanitizeAmount(amountInput.value);

 if (sanitizedAmount === null && amountInput.value !== "") {
   setUiState("error", "Please enter a valid amount greater than or equal to zero.");
   setResultText("Conversion unavailable");
   return;
 }

 queueUpdate();
});

form.addEventListener("submit", (event) => {
 event.preventDefault();
 updateConversion();
});

swapButton.addEventListener("click", () => {
 const swappedValues = swapCurrencies(fromSelect.value, toSelect.value);
 fromSelect.value = swappedValues.from;
 toSelect.value = swappedValues.to;
 updateFlags();
 updateConversion();
});

populateOptions();
updateFlags();
setResultText(formatConversionResult(DEFAULT_AMOUNT, 95.76, DEFAULT_CURRENCY_FROM, DEFAULT_CURRENCY_TO));
setUiState("success", "Ready to convert.");
updateConversion();

