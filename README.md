# Petteri Helttula — Portfolio

Static portfolio site for [petu.design](https://www.petu.design/). Built with plain HTML, CSS, and vanilla JavaScript — no build step or runtime dependencies.

## Local preview

```sh
node dev-server.js --port 8092
```

Open `http://127.0.0.1:8092/`.

## Structure

- `index.html`, `404.html`: Home page and interactive 404 page.
- `korislab/`, `maamitta/`, `peluutin/`, `helsinki-sports-map/`, `kelikamera/`, `havain/`, `s-havikki/`, `tahti/`: Case study pages.
- `styles/`, `js/`: Shared stylesheets and client-side interaction modules.
- `pixel-curtain.js`: Dithered canvas page-transition curtain and subtle CRT overlay.
- `fonts/`, `h/`, `hv/`, `k/`, `kk/`, `m/`, `og/`, `p/`, `s/`, `t/`, `v2/`: Webfonts and page media.
- `llms.txt`, `llms-full.txt`, `robots.txt`, `sitemap.xml`: Machine-readable portfolio summaries and crawl metadata.
- `vercel.json`: Clean URLs, redirects, and HTTP security headers.
- `tools/og/`, `tools/readme/`: Local asset-generation utilities (excluded from Vercel deploys via `.vercelignore`).
