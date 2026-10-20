# Vendored browser libraries

| Library | Version | License | Role | Load boundary |
|---|---|---|---|---|
| pdf-lib | 1.17.1 | MIT | Create/copy/modify PDFs | PDF tool routes and processing worker |
| pdfjs-dist | 6.2.108 | Apache-2.0 | Preview/render PDF pages | Dynamically imported after file selection |

Source: pdf-lib was supplied in the execution runtime. PDF.js 6.2.108 was downloaded from the official npm registry and its tarball SHA-512 integrity was verified against the registry metadata. Official project documentation and release pages were reviewed on 20 October 2026. License copies are in `dist/vendor/`. These checks do not amount to a vulnerability audit. PDF-lib's old latest-release cadence is a maintenance concern; replaceable adapter boundaries are in `pdf-core.js` and `pdf-worker.js`.

PDF-lib ESM: 523,417 bytes. PDF.js compatibility module: 512,483 bytes. Matching compatibility worker: 1,312,452 bytes. Bundled fonts, CMaps and WASM are served locally and loaded when required. No third-party CDN calls are used.

To upgrade: obtain pinned releases from official packages, retain licenses, review breaking APIs, run Node tests plus the device matrix in LAUNCH.md, and compare real PDF outputs. Do not automatically replace vendored modules with “latest”.

Security maintenance (20 October 2026): upgraded PDF.js to the patched 6.2.108 release for GHSA-hq66-cqwq-w95j. The page uses canvas rendering rather than the full PDF.js viewer, disables evaluation/XFA/scripting options and retains a restrictive CSP. This is not a guarantee against all malicious documents.
