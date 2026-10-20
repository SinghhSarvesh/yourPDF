# AdSense setup for the site owner

Status: verification tooling is prepared; ads are NOT enabled or approved.

## Owner details

1. Create/sign in to your own Google AdSense account and add `https://yourspdf.netlify.app/` in Sites. Complete the account and payment details privately in Google. If Google rejects the hosting subdomain, connect an eligible custom domain first and update `siteUrl`.
2. Copy your publisher ID (`ca-pub-` followed by 16 digits) from AdSense. Set `publisherId` in `monetization.config.json`. Never commit account passwords, recovery codes or payment information.
3. Set `publicSupportEmail` to an inbox you control and intend to display publicly. Do not use a private email from Git history without the owner's choice.
4. Run `npm run build`. This creates the verification meta tag on all public pages, generates `/ads.txt` using your actual publisher ID, publishes the support email, and builds canonical URLs and sitemap from `siteUrl`.
5. Push the source and generated output to GitHub; Netlify runs the same build. Verify the homepage meta tag, `/ads.txt`, `/contact/` and `/privacy/` after deployment. In AdSense, choose meta-tag verification, verify, then request review.

## Before serving ads

Verification is separate from ad serving. `enabled: true` deliberately fails the build: the current code does not implement ad serving or consent management. A publisher ID alone is not approval and not a working consent configuration.

- Configure and publish Google's certified CMP in AdSense Privacy & messaging for applicable visitors, including appropriate choices and a way to revisit them. Check current requirements for EEA, UK, Switzerland and other relevant regions.
- Integrate the actual approved ad code and CMP together, update the privacy policy to describe actual vendors and storage, and adjust CSP for the exact integration. Do not broadly allow all third-party scripts or add `unsafe-eval` as a workaround.
- Prefer one clearly labelled manual ad after useful tool instructions. Keep upload, processing, download, error and consent controls clear. Review/disable automatic placements that obstruct these controls. Never encourage ad clicks or click your own ads.
- Test consent accepted, rejected and withdrawn; test ad blockers and unavailable ads. Tools and downloads must keep working in each state.
- Verify normal desktop and mobile file processing/downloads. Automated PDF logic tests do not establish that browser downloads work on all devices.
- Confirm the final brand and any required rights. The current name remains provisional; this repository is not legal clearance or a guarantee of Google approval or revenue.

## Current behavior

With null publisher ID, no meta tag, fake publisher ID, ads.txt seller entry, ad request or advertising cookie is generated. Advertising remains disabled. Existing CSP remains restrictive. Future advertising requires a reviewed integration, not merely changing a boolean.

## Official references

- https://support.google.com/adsense/answer/12169212
- https://support.google.com/adsense/answer/1348695
- https://support.google.com/adsense/answer/13554116

Google account approval, billing/tax verification and consent publishing must be completed in the owner's account. This code cannot perform those account actions.
