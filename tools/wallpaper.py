"""Generate an original night-sky + layered sandstone wallpaper as SVG."""
import math, random, sys

W, H = 1920, 1080
rnd = random.Random(16)
out = []
o = out.append

def f(v):
    return f"{v:.1f}"

def ridge(x, base, amps):
    y = base
    for amp, freq, phase in amps:
        y += amp * math.sin(x / W * math.pi * 2 * freq + phase)
    return y

o(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">')
o('<defs>')
o('<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03060d"/><stop offset=".55" stop-color="#08101f"/><stop offset="1" stop-color="#101a2c"/></linearGradient>')
o('<radialGradient id="glow" cx=".5" cy=".62" r=".55"><stop offset="0" stop-color="#1c2a42" stop-opacity=".55"/><stop offset="1" stop-color="#1c2a42" stop-opacity="0"/></radialGradient>')
o('<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".6" stop-color="#000" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>')
o('<radialGradient id="vignette" cx=".5" cy=".45" r=".8"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>')
o('<radialGradient id="leaf" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#c9ec5a"/><stop offset=".6" stop-color="#7fae2c"/><stop offset="1" stop-color="#3f6418"/></radialGradient>')
o('</defs>')

# Sky
o(f'<rect width="{W}" height="{H}" fill="url(#sky)"/>')
o(f'<rect width="{W}" height="{H}" fill="url(#glow)"/>')
stars = []
for _ in range(260):
    x, y = rnd.uniform(0, W), rnd.uniform(0, H * .62)
    r = rnd.choice([.6, .7, .8, .9, 1.1, 1.4]) if rnd.random() > .04 else 1.9
    a = rnd.uniform(.35, .95)
    stars.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="{r}" fill="#fff" fill-opacity="{a:.2f}"/>')
o('<g>' + ''.join(stars) + '</g>')

# Rock bands from back (high, dim) to front (low, bright)
bands = [
    (548, [(52, 1.2, .4), (26, 2.9, 1.9), (10, 7.0, .2)], '#77766f', '#2e2d2a'),
    (600, [(44, 1.0, 2.4), (28, 2.4, .7), (9, 6.3, 1.1)], '#9a988f', '#383733'),
    (650, [(40, .9, 4.0), (22, 2.1, 2.8), (8, 5.5, .9)], '#b3b0a6', '#3f3e3a'),
    (705, [(38, .8, 1.2), (20, 1.9, 4.1), (7, 4.8, 2.2)], '#c3c0b6', '#454440'),
    (765, [(36, .75, 3.3), (18, 1.7, .5), (6, 4.1, 3.0)], '#ccc9bf', '#4b4a45'),
    (830, [(34, .7, 5.1), (16, 1.5, 2.0), (6, 3.6, 1.4)], '#d3d0c6', '#504f4a'),
    (900, [(32, .65, .8), (16, 1.3, 3.6), (6, 3.2, 2.6)], '#d8d5cb', '#55544e'),
    (975, [(30, .6, 2.9), (14, 1.2, 1.1), (5, 2.9, .3)], '#dcd9cf', '#5a5953'),
]
step = 12
tree_x = 940
for i, (base, amps, top, bottom) in enumerate(bands):
    pts = [(x, ridge(x, base, amps)) for x in range(-20, W + 21, step)]
    if i == 1:
        # remember the ridge height where the tree stands
        tree_y = ridge(tree_x, base, amps)
    gid = f'b{i}'
    o(f'<linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{top}"/><stop offset=".08" stop-color="{top}"/><stop offset=".22" stop-color="{bottom}"/><stop offset="1" stop-color="#2b2a27"/></linearGradient>')
    d = 'M' + ' L'.join(f'{f(x)},{f(y)}' for x, y in pts) + f' L{W + 20},{H} L-20,{H} Z'
    o(f'<path d="{d}" fill="url(#{gid})"/>')
    # thin strata lines inside each band follow the ridge, fading as they go down
    lines = []
    for k in range(1, 7):
        off = k * (6 + i * 1.2)
        damp = max(.25, 1 - k * .09)
        wob = rnd.uniform(0, 6)
        seg = [(x, y + off + 3 * math.sin(x / 140 + wob) * damp) for x, y in pts]
        d = 'M' + ' L'.join(f'{f(x)},{f(y)}' for x, y in seg)
        lines.append(f'<path d="{d}" fill="none" stroke="#1d1d1a" stroke-opacity="{.22 * damp:.2f}" stroke-width="{1.4 if k % 3 == 0 else .8}"/>')
    # short cross-bedding cracks
    for _ in range(26 + i * 6):
        x0 = rnd.uniform(0, W)
        y0 = ridge(x0, base, amps) + rnd.uniform(8, 70)
        ln = rnd.uniform(14, 40)
        ang = rnd.uniform(1.2, 1.9)
        x1, y1 = x0 + math.cos(ang) * ln * .4, y0 + math.sin(ang) * ln * .5
        lines.append(f'<path d="M{f(x0)},{f(y0)} L{f(x1)},{f(y1)}" stroke="#1d1d1a" stroke-opacity=".14" stroke-width=".8"/>')
    # rim light on the ridge
    d = 'M' + ' L'.join(f'{f(x)},{f(y + 1)}' for x, y in pts)
    lines.append(f'<path d="{d}" fill="none" stroke="#f1efe6" stroke-opacity="{.18 + i * .04:.2f}" stroke-width="1.6"/>')
    o('<g>' + ''.join(lines) + '</g>')
    if i == 1:
        # The lone tree sits between the second and third ridge so the front rocks overlap its base
        trunk_h = 56
        tx, ty = tree_x, tree_y + 6
        o(f'<path d="M{tx - 4},{ty} L{tx - 2},{ty - trunk_h} L{tx + 3},{ty - trunk_h} L{tx + 5},{ty} Z" fill="#3a2a1c"/>')
        def crown(n, rmin, rmax, width, shift=0):
            res = []
            for _ in range(n):
                t = rnd.random() ** .9
                cy = ty - trunk_h * .45 - t * 200
                spread = width * (1 - t) ** 1.05 + 5
                tier = math.sin(t * 22) * .25 + 1
                cx = tx + shift + rnd.gauss(0, spread * .42 * tier)
                res.append(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(rnd.uniform(rmin, rmax) * (1 - t * .4))}"/>')
            return ''.join(res)
        o('<g fill="#2f4c14">' + crown(220, 4, 9, 66, 3) + '</g>')
        o('<g fill="url(#leaf)">' + crown(300, 3, 7, 60) + '</g>')
        hi = []
        for _ in range(110):
            t = rnd.random()
            cy = ty - trunk_h * .45 - t * 195
            spread = 48 * (1 - t) ** 1.05 + 4
            cx = tx - 10 + rnd.gauss(0, spread * .38)
            hi.append(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(rnd.uniform(1.5, 3.5))}"/>')
        o('<g fill="#e6f7a0" fill-opacity=".6">' + ''.join(hi) + '</g>')

o(f'<rect width="{W}" height="{H}" fill="url(#shade)"/>')
o(f'<rect width="{W}" height="{H}" fill="url(#vignette)"/>')
o('</svg>')
open(sys.argv[1], 'w').write('\n'.join(out))
