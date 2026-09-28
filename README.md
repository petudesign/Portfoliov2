# Petteri Helttula — desktop portfolio

A standalone static portfolio with a macOS-inspired desktop, a working portfolio browser, a sound mixer, and a secondary Three.js room.

## Start

Start the local server with clean case-route rewrites:

    node dev-server.js --port 8092

Open http://127.0.0.1:8092/. Direct case URLs load the same portfolio shell as the homepage. Vercel uses the matching rewrites in `vercel.json`. There is no build step or runtime package installation.

## Project contents

- `index.html`: desktop shell and preserved case content (Brio, Peluutin, S-Hävikki, Tahti, About).
- `desktop.css`, `desktop.js`: desktop/browser interactions, navigation, Dock and audio channels.
- `room.css`, `workspace-view.js`: existing 3D room, loaded only when opened.
- `case-page.css`, `case-page.js`, and the case folders: case-page styles, interactions and source content. Public case routes render through the portfolio shell using the route map in `desktop.js`.
- `assets/`: images, icons, one video, and the existing vendored Three.js runtime needed by the current portfolio and room.
- `Satoshi_Complete/`: the used webfont and its license.
- `desk-experiment.html`: compatibility redirect to the homepage.
- `tests/desktop.cjs`: runnable browser regression check; screenshots go to the system temporary directory.

Add shortcuts in `desktopShortcuts`, and applications in `desktopApps`, at the top of `desktop.js`.

## Public case routes

- `/peluutin/`
- `/helsinki-sports-map/`
- `/korisiq/`
- `/brio/`
- `/s-havikki/`
- `/tahti/`
- `/spire-coach-mod/`

The homepage keeps its desktop experience, while project cards link to these standalone pages so each case has its own crawlable HTML, metadata, canonical URL, and structured data.

## Sound and links

Sound starts disabled. The mixer controls this page's synthesized clicks, keyboard feedback, and a user-selected local audio file. The file stays in the browser; there is no upload endpoint. Spotify opens one persistent Embed window inside the desktop. Its iframe is retained across portfolio navigation, minimization and room transitions. Spotify controls full-track versus preview availability. The other external apps open their websites in another tab. Chrome restores the portfolio browser. The label LM Lab currently uses the existing LM Studio icon/link.

Local music uses a Web Audio dry/wet crossfade: direct stereo on desktop, low-pass filtering and an HRTF PannerNode at the room headphone mesh in the room. Listener position, forward and up vectors follow the camera; sources behind the listener are filtered more strongly. Spotify audio is isolated in its cross-origin player and cannot use this graph. The mixer master mute pauses Spotify, and starting local music pauses Spotify to avoid two simultaneous tracks.

Spotify API: https://developer.spotify.com/documentation/embeds/references/iframe-api

## Verification

With Playwright and Chrome available, run:

    node tests/desktop.cjs

Set `PLAYWRIGHT_MODULE` to an installed Playwright module if the bundled Codex runtime path is unavailable. Optional variables: `DESKTOP_URL` (default http://127.0.0.1:8091/) and `QA_OUTPUT` (screenshot directory). Tests cover root/legacy routes, all preserved cases, browser navigation, window controls, dragging, sound/music, room transitions, reduced motion and desktop/mobile layout.

## Repository boundary

This directory is the project for https://github.com/petudesign/Portfoliov2. The parent directory's older Portfolio repository is a separate repository; do not run Git publication commands from that parent directory. The old homepage, folder UI, unrelated case pages, duplicate export assets, browser profiles, logs and Vercel project configuration are not part of this project's working tree. Git history is preserved; deleting files from the current tree does not remove them from earlier commits. Nothing was pushed as part of the cleanup.

## Wallpaper

`assets/desktop-wallpaper.png` was created with the built-in image generation tool. Prompt: clean full-bleed desktop wallpaper, no UI/text/logos; broad flowing blue, pale cyan, coral, orange, raspberry and purple ribbons inspired by the supplied macOS reference. The same wallpaper is used in the desktop and room monitors.
