# Security maintenance

Report potential issues privately to sarveshhsingh01@gmail.com. Include the affected URL, browser version and safe reproduction steps. Do not send confidential PDFs, credentials or other people's data. No response-time or bounty commitment is made.

## Review on 20 October 2026

- Published support email and reviewed footer information for actual features, limits and privacy behavior.
- Upgraded locally hosted PDF.js to patched 6.2.108 for GHSA-hq66-cqwq-w95j. Verified npm package SHA-512 integrity. Matching compatibility module/worker and support assets are bundled.
- Retained evaluation-disabled, canvas-only previews and added explicit disabled scripting/XFA settings. The app does not integrate the PDF.js viewer scripting manager.
- Adapted PDF.js 6 document teardown to use the loading task and tested successful/error cleanup.
- Retained restrictive CSP with same-origin scripts and no inline script permission. Added explicit frame/script-attribute blocking, clickjacking defense, same-origin opener/resource policies and disabled DNS prefetch. Allowed locally generated fonts required by PDF rendering.
- Existing document checks cap file sizes, page counts and image dimensions; worker processing has a timeout. These limits do not prove that arbitrary malicious documents are harmless.
- AdSense publisher ID is a public seller identifier, not an authentication secret. ads.txt remains publicly accessible with noindex as a search-engine hint, not access control.
- Ads are disabled. Enabling ads requires revisiting the CSP and implementing verified consent behavior.

## Verification and limits

44 automated tests passed. A synthetic PDF was rendered, its text extracted and loading-task cleanup verified with the upgraded module/worker using Node canvas. All 168 local footer link targets resolved. This is a targeted source/dependency/header review, not a penetration test or a guarantee of complete security. Full desktop/mobile browser interaction verification remains necessary.

Owner account security: enable two-step verification for Google, GitHub and Netlify; keep recovery codes private and review connected-app access. These account settings are not modified by this repository.
