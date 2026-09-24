# Currency Converter

A lightweight currency converter built with HTML, CSS, and vanilla JavaScript. It lets users convert one currency amount into another using live exchange rates from a public currency API.

## Features

- Convert between supported currencies
- Swap source and destination currencies
- Live exchange-rate lookup with validation
- Loading and error states for API reliability
- Responsive layout for mobile, tablet, and desktop
- Keyboard-friendly controls and accessible labels
- No frameworks or build tooling required

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js test runner for logic validation

## API Used

The app currently uses the public `@fawazahmed0/currency-api` dataset through jsDelivr for exchange-rate data.

This is a practical choice for a static frontend because it requires no API key and works without a backend. However, it is a third-party dependency and may be rate-limited or intermittently unavailable. The app includes timeout handling, request deduplication, response validation, and error messaging to reduce the impact of outages.

## Setup Instructions

1. Open the project folder in a browser, or serve it locally.
2. Run the local server:

   ```bash
   npm start
   ```

3. Visit `http://localhost:8000`.

## Testing

Run the project test suite with:

```bash
npm test
```

## API Failure Handling

The application handles API failures by:

- timing out slow requests
- rejecting invalid HTTP responses
- validating payloads before use
- preventing invalid rates from being rendered
- showing a user-friendly error message instead of a misleading conversion
- using an in-memory cache and deduplicating concurrent requests

## Screenshots

Placeholder for screenshots of the desktop and mobile layouts.

## Future Improvements

- Replace the third-party API with a more stable provider if product requirements expand
- Add a server-side proxy for rate fetching and caching
- Add more currency metadata and localized formatting
- Support conversion history and favorites
- Add offline fallback messaging and last-known rate display
