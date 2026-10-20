# Google Search launch

The website has tool-specific titles/descriptions, static tool instructions, related-tool links, self-referencing canonical URLs, crawlable pages, robots.txt and a sitemap. These help discovery and understanding; they cannot guarantee indexing or first-place rankings.

1. Open https://search.google.com/search-console and add a URL-prefix property for `https://yourspdf.netlify.app/`.
2. Choose HTML tag verification if it is not verified automatically. Copy only the `content` token into `searchConsoleVerification` in monetization.config.json, build and deploy, then verify in Google. AdSense verification is separate.
3. Submit `https://yourspdf.netlify.app/sitemap.xml` in Sitemaps.
4. Inspect the homepage and key tool pages; request indexing once where appropriate. Repeated requests do not speed crawling.
5. Watch indexing status, actual queries, impressions, clicks and average position in Search Console. Average position is not a universal ranking for every searcher.
6. Improve pages based on real questions and tool failures. Start with precise tasks supported by the app, such as local PDF merging without document uploads or extracting selected pages. Do not advertise unsupported Word conversion, OCR or advanced compression.
7. Seek genuine mentions and links by making a useful tool people want to reference. Do not buy ranking links, invent reviews/ratings, hide keyword text, or generate near-identical doorway pages.
8. A distinct brand/custom domain can help recognition and ownership. Buying a domain does not itself confer a ranking advantage. If moving, update siteUrl and plan redirects/canonical migration.

Google may take days or weeks to crawl changes. Indexing and ranking are separate; neither is guaranteed. Check the site's actual Search Console data before claiming progress.

Official references:
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- https://support.google.com/webmasters/answer/9012289
