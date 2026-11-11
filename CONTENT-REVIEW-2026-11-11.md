# Content and workflow improvements — 11 November 2026

Status: implemented locally, not deployed. AdSense review has not been resubmitted. Approval is not guaranteed.

## Reference review

Reviewed public product pages, not competitors' AdSense accounts. Their advertising approval status was not established.

- https://tools.pdf24.org/en/merge-pdf — task-specific instructions and questions; adopted clearer tool selection and output explanations.
- https://www.sejda.com/split-pdf — distinguishes splitting and extracting and discloses processing limits; adapted to yourPDF's actual limits and output formats.
- https://smallpdf.com/merge-pdf — explains preview, organization, and continuing into other tools; preserved yourPDF's existing chaining and added an end-to-end document workflow.
- https://www.ilovepdf.com/merge_pdf — reviewed its merge entry point as another task-focused reference.
- https://support.google.com/adsense/answer/10015918 — unique useful content, non-repetitive explanations, and functional navigation remain the criteria. No approval or traffic threshold is inferred.

All new text and examples are original. No competitor assets, reviews, usage statistics, unsupported features, or approval claims were imported.

## Implemented

- Consolidated each PDF tool's practice instructions and expected result into one worked-example section.
- Replaced the former practice block with tool-specific decision guidance and relevant alternatives across all 11 PDF tools.
- Shortened repeated download instructions into help links, retaining visible file limits and preservation warnings.
- Corrected the image practice instructions: the current validator requires a positive maximum size, so the sample now specifies 0–100 decimal KB instead of empty limits.
- Added one application-document workflow, linked from the homepage, guide index and relevant PDF tools. Includes actual merge/extract reference PDFs, image-fit geometry, and final submission checks.
- Kept existing processing code, hosting, verification settings and disabled ad state unchanged.

## Validation and limits

Build succeeded and all 46 automated tests passed, including generated links, canonical tags, unique IDs, sample page counts and existing processing behavior. Sample PDFs are generated with the actual PDF core. Independent pdftotext extraction confirmed the merged reference contains cover, attachment 2, attachment 3 and the selected reference contains cover, attachment 3.

Browser QA remains unverified: the managed preview launcher appended Node-style host/port arguments to the existing Python HTTP server command, causing startup to fail. No production code or network permissions were changed to work around this infrastructure mismatch. Before publishing, verify the revised tool pages and guide visually on mobile and desktop.

The site has very limited search data (32 impressions, 0 clicks in the supplied 28-day report). This does not establish the cause of rejection. No traffic or approval outcome is claimed. The broader SEO backlog remains deferred.

Deployment requires the owner's authorization. Avoid pushing to the production branch before that authorization because Netlify may auto-deploy.
