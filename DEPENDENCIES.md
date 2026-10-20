# Vendored browser libraries

| Library | Version | License | Role | Load boundary |
|---|---|---|---|---|
| pdf-lib | 1.17.1 | MIT | Create/copy/modify PDFs | PDF tool routes and processing worker |
| pdfjs-dist | 5.6.205 | Apache-2.0 | Preview/render PDF pages | Dynamically imported after file selection |

Source: packages already supplied in the execution runtime. Official project documentation and release pages were reviewed on 20 October 2026. License copies are in `dist/vendor/`. These checks do not amount to a vulnerability audit. PDF-lib's old latest-release cadence is a maintenance concern; replaceable adapter boundaries are in `pdf-core.js` and `pdf-worker.js`.

PDF-lib ESM: 523,417 bytes. PDF.js module: 430,304 bytes. PDF.js worker: 1,244,253 bytes. Bundled fonts, CMaps and WASM raise total vendor assets to approximately 5.5 MiB; individual assets are loaded when required. No CDN calls are used.

To upgrade: obtain pinned releases from official packages, retain licenses, review breaking APIs, run Node tests plus the device matrix in LAUNCH.md, and compare real PDF outputs. Do not automatically replace vendored modules with “latest”.
