# Link preview card and og:video

`card.html` is the 1200×630 card. `window.render(t)` draws any moment of the 4 s loop, and frame 0 is the still.

1. Serve this folder with `fonts/` linked in: `ln -s ../../fonts fonts && python3 -m http.server 8098`
2. Render 240 frames at 2×: `node render.js http://localhost:8098/card.html frames`
3. Encode and check: `swiftc -O encode.swift -o encode && ./encode frames home-vN.mp4 home-vN.jpg`
4. Copy both to `/og/` with a new version number and update the meta tags. Never overwrite a published file.
