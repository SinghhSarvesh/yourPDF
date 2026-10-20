# Public launch, search and advertising

## State on 20 October 2026

The website is a real static application with browser-local PDF/image processing. The active implementation covers the listed tools, not every feature of iLovePDF. Word/Excel conversion, OCR, advanced compression, encryption, digital signing and full PDF editing remain separate engineering projects. No payment or ad accounts have been created and no paid services activated.

Download hardening adds real user-activated download links, optional native Save As, Open file and supported mobile sharing. It avoids revoking download URLs during page navigation. Automated tests cover exact Save As byte delivery, cancellation, failed writes and actual PDF-worker Blob outputs. Real browser/mobile download verification is still outstanding; these tests do not prove that an embedded preview permits downloads.

## To publish and become eligible for indexing

1. Deploy the latest saved source and make the site publicly accessible. Private sites cannot be indexed or reviewed normally for ads.
2. Choose a distinct final brand and domain. The working name yourPDF has a known direct naming conflict. Do not claim it is cleared for commercial use.
3. Register the chosen domain yourself only after evaluating name availability and relevant trademark concerns. Domain availability is not trademark clearance.
4. Configure the host's exact DNS records and HTTPS. No paid domain is purchased by this project.
5. Replace the origin in generate-yourpdf.mjs and release-content.mjs, update the image-tool canonicals, regenerate pages, and redeploy. All canonical and sitemap URLs must use the final HTTPS origin.
6. In Google Search Console, add a Domain property and copy the TXT verification record to your DNS. Never send credentials in chat.
7. Submit /sitemap.xml, inspect the homepage and a few tool URLs, and review indexing errors. Submission is not a guarantee of inclusion.

## What SEO is implemented

Distinct crawlable tool pages; descriptive titles/descriptions; canonical links; sitemap; robots rules; internal navigation; mobile CSS; tool-specific original guidance; download troubleshooting; transparent limitations; no keyword-page multiplication or copied competitor text. No fake review scores or invented popularity claims.

## How to improve search performance

Start with narrow tasks that the product actually handles well, such as combining PDFs without uploads or extracting selected pages. Use Search Console impressions and queries to decide which guidance needs improvement. Fix output errors and mobile completion problems before scaling pages. Publish concrete examples and troubleshooting from actual user questions. Seek genuine references from relevant communities/resources without spam or purchased links. Measure performance on real devices; do not invent Lighthouse/Core Web Vitals scores.

Broad queries such as “PDF converter” have established competitors. No ranking position, timeline, traffic level or income is guaranteed. Search rankings depend on many signals and vary by query/location. Google Ads purchases advertising; it does not buy organic ranking.

## AdSense setup still requires owner input

- Final domain/brand and a public support email chosen by the owner.
- A Google AdSense account owned by the publisher. Complete identity, payment and tax details privately with Google.
- Add the site in AdSense and use the exact verification method/code provided there. Supply only the public publisher ID/verification snippet to configure the project; never passwords or private account tokens.
- Review current policies and consent requirements for your audience. Google-certified CMP requirements may apply for traffic from the EEA, UK and Switzerland. Do not activate ad code before the appropriate consent implementation is ready.
- After approval/configuration, add the exact ads.txt line supplied for the account. Never invent a pub-ID.
- Reserve labeled ad space below substantive content, separated from file actions. Never encourage visitors to click ads, click your own ads or buy invalid traffic.

monetization.config.json is disabled. Hidden ad regions make no requests. Existing privacy statements accurately describe no active advertising; update them when that changes. A verified support channel and meaningful publisher information remain needed. Do not submit the current incomplete publisher setup as “guaranteed AdSense ready”.

## Copyright and licensing review

Interface code, SVG icons, sample text and guide copy were created for this project; iLovePDF branding, source and website copy were not imported. pdf-lib and PDF.js are third-party code, not claimed as original. MIT/Apache and bundled font/component notices are retained, with links on /licenses/.

This source/license review is not legal clearance. Copyright, trademarks and brand confusion are distinct concerns. The known YourPDF naming conflict is unresolved. No workflow can guarantee that a claim will never occur. Obtain appropriate name clearance/legal advice for a commercial launch where needed. User documents remain the user's responsibility; the tool does not grant rights to their contents.

## Official references reviewed

- https://developers.google.com/search/docs/fundamentals/do-i-need-seo
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/essentials
- https://support.google.com/adsense/answer/9724
- https://support.google.com/adsense/answer/81904
- https://support.google.com/adsense/answer/48182
- https://support.google.com/adsense/answer/10502938

## Hosting and rollback

The existing managed Site is used for this release. Independent hosting, custom domain eligibility, ad-script support and current commercial terms need verification before selecting a permanent paid setup. No guarantee of host support for AdSense/custom domains is made. The static dist directory remains portable.

Rollback: redeploy the previous saved Site version, or revert the offending commit and publish the revert after tests. Avoid source-only edits on the host that diverge from Git.
