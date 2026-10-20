# yourPDF — browser-local document tools

The original photo-only prototype has been rebuilt around a searchable PDF-tool homepage and a select → adjust → download workflow. This is a working early release with a provisional name, not a verified replacement for every iLovePDF feature.

## Run locally on Windows

No package installation or API keys are needed; pinned browser libraries are included.

```powershell
npm test
python -m http.server 5173 --directory dist
```

Open http://localhost:5173. Do not use file://: JavaScript module workers need an HTTP origin. Stop with Ctrl+C.

To regenerate the PDF homepage/tool/help pages after editing their content:

```powershell
node generate-yourpdf.mjs
```

Do not run the older `generate.py`: it is retained only as historical source for the original image prototype and would replace the PDF homepage. Image tools now live at `/photo/`, `/signature/`, and `/checker/`.

## Working tools

- Merge PDFs with file ordering.
- Split selected pages into a ZIP of PDFs or one combined selection.
- Extract, remove and reorder pages.
- Rotate chosen pages.
- Add page numbers or a basic Latin text watermark.
- Structural PDF optimization, with original returned if output is not smaller.
- Images to A4 PDF, with portrait/landscape and optional margins.
- PDF pages to JPG in a ZIP.
- Existing image resize/crop/rotation and image requirement checking.

The PDF interface has page thumbnails, keyboard-operable reorder buttons, a generated sample, cancellation, explicit limits, clear error states and in-memory chaining to another PDF tool. Output remains in the tab; no document uploads or accounts are implemented.

## Source map

- `generate-yourpdf.mjs`: crawlable HTML pages, metadata, sitemap, site content.
- `dist/catalog.js`: tool catalogue and original SVG icons.
- `dist/yourpdf.css`: responsive interface, reduced motion and focus treatment.
- `dist/home.js`: search and category filters.
- `dist/pdf-app.js`: selection, workspace, thumbnails, JPG rendering, result chaining.
- `dist/pdf-worker.js`: inspection, modifications, image-to-PDF and ZIP packaging.
- `dist/pdf-core.js`: bounded loading, range parsing, PDF operations, ZIP writer.
- `dist/vendor/`: pinned, self-hosted libraries and licenses.
- `dist/core.js`, `processor.js`, `app.js`, `image-style.css`: original image tools.
- `tests/`: Node tests, including a synthetic encrypted-PDF fixture.

Static HTML avoids a framework runtime for crawlable content. Heavy libraries only load on tool pages, not the homepage. PDF modifications run in a dedicated worker; PDF.js performs parsing in its own worker while rendering canvases on the main thread. PDF-to-JPG renders pages sequentially and yields between them. This is not a claim that all rendering work is off-thread.

## Libraries and limitations

- pdf-lib 1.17.1, MIT: bundled ESM ~523 KB uncompressed. Official release page still lists 1.17.1 as latest when reviewed. The old release cadence is a maintenance risk; the adapter is isolated, sizes/page counts are bounded, and production dependency/security review remains necessary.
- PDF.js/pdfjs-dist 5.6.205, Apache-2.0: runtime ~430 KB + worker ~1.24 MB uncompressed. Fonts, CMaps and WASM assets are self-hosted. Modern browser features are required; actual cross-browser coverage is not established here.
- No external CDN/font/analytics requests are added. Vendored assets total about 5.5 MB, loaded by need rather than all on the homepage.

PDF tasks: 20 files, 30 MiB combined, 150 pages total. JPG export: 40 selected pages, maximum 2,000 px long edge and 100 MiB combined image output. Image-to-PDF: 24 MP per source; resized to at most 2,400 px, flattened on white and encoded at a 92% JPG setting. Images are not embedded losslessly.

Password-protected and malformed PDFs are rejected. Page-copy operations may drop form, bookmark and other document-level features. Editing may invalidate signatures. The app is not a PDF sanitizer or accessibility checker. Number/watermark placements need review on rotated or unusual pages. Preview images are not a guarantee of output fidelity.

Optimize is structural rewriting, not full image compression. No Office conversion, OCR, encryption, password removal, e-signing, redaction or text editor is implemented. Those tools are deliberately absent from the homepage.

## Verification

Executed: 33 automated tests (16 image-core and 17 real PDF/core tests), JS syntax checks, local-link/duplicate-ID checks. PDF integration tests construct real PDFs, merge/split/reorder/rotate them and reopen outputs. An independent Python ZIP/PyMuPDF check validated ZIP integrity, individual PDFs, and inserted number/watermark text. Encrypted, malformed and excessive-page inputs are covered.

Not executed: browser UI rendering, actual DOM/canvas interactions, images-to-PDF worker browser encoding, PDF.js-to-JPG browser export, download handling, mobile touch/keyboard/screen-reader checks, large-file memory pressure or network tracing. The prescribed browser-control capability was unavailable. Node/Python tests do not establish browser readiness. Use the built-in samples and `LAUNCH.md` before public promotion.

## Hosting and source control

The managed Site identity is preserved in `.openai/hosting.json`; publication versions provide rollback. Source is committed/pushed through the managed Git workflow. No GitHub repo has been created in the owner's account. Static `dist/` can be deployed elsewhere after hosting terms/costs are checked.

The current URL retains the earlier prototype slug. Set the actual origin in `generate-yourpdf.mjs` before switching domains. Update image-page canonical URLs as well, and `dist/robots.txt`. `_headers` is a request for headers on compatible static hosts, not proof they are enforced; check real responses.

To add an owner-created empty GitHub repo as another remote:

```powershell
git remote add github https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u github HEAD:main
```

Use secure Git authentication. Never paste secrets in chat. No environment variables or secrets are needed for this app.

Rollback: redeploy a prior successful saved Site version, or `git revert COMMIT_SHA`, run tests and publish the revert. Keep `.openai/hosting.json` unchanged.

## Research, not promises

Reviewed 20 October 2026:

- https://www.ilovepdf.com/pricing — limited free document processing; paid features include ad-free use and workflows.
- https://www.ilovepdf.com/help/security — documented file deletion within two hours and manual deletion.
- https://yourpdf.page/ — direct naming conflict; do not launch commercially with this label without choosing/clearing a distinct brand.
- https://github.com/Hopding/pdf-lib/releases and https://pdf-lib.js.org/
- https://github.com/mozilla/pdf.js/releases and https://mozilla.github.io/pdf.js/

Local processing, no app accounts/ads, clear up-front limits, sample files and in-memory chaining are the current product choices. They do not establish that this app beats iLovePDF in fidelity, performance, accessibility or adoption. No keyword volumes, rankings or income have been established.

## Download repair and launch preparation (20 October 2026)

`dist/downloads.js` provides shared download delivery for PDF and image tools: a standard link opening outside the current page, optional native Save As, Open file, supported mobile sharing, clear delivery messages and a standalone-tab notice. Download URLs are no longer revoked on pagehide. The browser controls whether a normal download succeeds; no false “saved” confirmation is shown for that path.

Run `node generate-yourpdf.mjs` followed by `node release-content.mjs` to rebuild the public content. The second script adds original per-tool guidance, license/download help, social metadata and the sitemap. `COMMERCIAL-LAUNCH.md` records domain, Search Console and AdSense steps, current blockers and rights limitations. No ad scripts are active.

New tests exercise the shared saver and the actual processing worker in Node. This adds delivery/serialization coverage, but it is not real browser UI testing.
