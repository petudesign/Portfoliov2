"""Generates the pixel-art stickers and badges for the About page (assets/about-home/).

Every sprite is drawn procedurally on a small grid, then wrapped in a 1px white sticker
outline and written as an SVG of crisp squares, so it scales up without blurring.
Run: python3 tools/pixel-sprites.py
"""
import math, os

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'about-home')

def grid(n, fn):
    return [[fn(x, y) for x in range(n)] for y in range(n)]

def outline(g, colour='#ffffff', dark='#0b1b2c'):
    """Pads the sprite by 2 and adds a dark 1px edge plus a white sticker rim around it."""
    n = len(g); m = n + 4
    out = [[None] * m for _ in range(m)]
    for y in range(n):
        for x in range(n):
            out[y + 2][x + 2] = g[y][x]
    def ring(src, col):
        res = [row[:] for row in src]
        for y in range(m):
            for x in range(m):
                if src[y][x] is None and any(0 <= y + dy < m and 0 <= x + dx < m and src[y + dy][x + dx] is not None
                                             for dy in (-1, 0, 1) for dx in (-1, 0, 1)):
                    res[y][x] = col
        return res
    return ring(out, colour)

def svg(g):
    n = len(g)
    rects = ''.join(f'<rect x="{x}" y="{y}" width="1" height="1" fill="{c}"/>'
                    for y, row in enumerate(g) for x, c in enumerate(row) if c)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}" width="{n * 4}" height="{n * 4}" '
            f'shape-rendering="crispEdges">{rects}</svg>\n')

def save(name, g):
    with open(os.path.join(OUT, name + '.svg'), 'w') as f:
        f.write(svg(outline(g)))

C = 7.5  # centre of a 16 grid

def basketball(x, y):
    dx, dy = x - C, y - C; r = math.hypot(dx, dy)
    if r > 7.6: return None
    if r > 6.6: return '#5a2a0e'
    if abs(dx) < .5 or abs(dy) < .5: return '#7a3a12'
    if abs(math.hypot(dx + 10, dy) - 7.6) < .5 or abs(math.hypot(dx - 10, dy) - 7.6) < .5: return '#7a3a12'
    return '#f08a2c' if dx + dy > -3 else '#ffa54d'

def dartboard(x, y):
    r = math.hypot(x - C, y - C)
    if r > 7.6: return None
    if r < 1.2: return '#e0343a'
    if r < 2.4: return '#2f9a4a'
    for edge, col in ((4.2, '#f3e3c3'), (5.4, '#e0343a'), (6.6, '#1d1d1d')):
        if r < edge:
            seg = int((math.atan2(y - C, x - C) + math.pi) / (math.pi / 5)) % 2
            return ('#1d1d1d' if seg else '#f3e3c3') if col == '#f3e3c3' else col
    return '#3a2414'

def note(x, y):
    if 9 <= y <= 13 and ((x - 4.5) ** 2 / 9 + (y - 11) ** 2 / 4) <= 1: return '#1c2440'
    if 11.5 <= ((x - 11.5) ** 2 / 9 + (y - 10) ** 2 / 4) * 0 + 99 and 9 <= y <= 12 and ((x - 11.5) ** 2 / 9 + (y - 10.5) ** 2 / 4) <= 1: return '#1c2440'
    if x in (7,) and 2 <= y <= 10: return '#1c2440'
    if x == 14 and 1 <= y <= 9: return '#1c2440'
    if 1 <= y <= 3 and 7 <= x <= 14 and y <= 1 + (x - 7) * 0 + 2: return '#1c2440'
    return None

def sunglasses(x, y):
    if y == 6 and 1 <= x <= 14: return '#111111'
    if 6 <= y <= 9 and (2 <= x <= 6 or 9 <= x <= 13):
        if y == 9 and x in (2, 6, 9, 13): return None
        return '#2c3440' if not (y == 7 and x in (3, 10)) else '#8fa6c2'
    if y == 7 and x in (7, 8): return '#111111'
    if y in (6, 7) and x in (0, 15): return '#111111'
    return None

def heart(x, y):
    u, v = (x - C) / 6.5, (C - y) / 6.5 + .25
    if (u * u + v * v - 1) ** 3 - u * u * v ** 3 > 0: return None
    return '#ff5b8a' if not (x in (4, 5) and y in (4, 5)) else '#ffd1df'

def star(x, y):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5; r = 7.6 if i % 2 == 0 else 3.3
        pts.append((C + r * math.cos(a), C + .6 + r * math.sin(a)))
    inside = False; j = len(pts) - 1
    for i in range(len(pts)):
        (xi, yi), (xj, yj) = pts[i], pts[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi: inside = not inside
        j = i
    return '#ffd23f' if inside else None

def magnifier(x, y):
    r = math.hypot(x - 6, y - 6)
    if 3.6 <= r <= 5.4: return '#3b3f4a'
    if r < 3.6: return '#bfe4ff' if x + y < 11 else '#8cc8f5'
    if x >= 9 and y >= 9 and abs(x - y) <= 1 and x <= 15: return '#7a4a22'
    return None

def computer(x, y):
    if 1 <= y <= 10 and 1 <= x <= 14:
        if y in (1, 10) or x in (1, 14): return '#d9d4c7'
        return '#2a7ad6' if y > 3 or x > 6 else '#7fd0ff'
    if y == 11 and 6 <= x <= 9: return '#bdb7a8'
    if y in (12, 13) and 3 <= x <= 12: return '#d9d4c7' if y == 12 else '#a8a293'
    return None

for name, fn in [('basketball', basketball), ('dartboard', dartboard), ('note', note), ('sunglasses', sunglasses),
                 ('heart', heart), ('star', star), ('magnifier', magnifier), ('computer', computer)]:
    save('sticker-' + name, grid(16, fn))

# Badges: a coloured tile with a small glyph, 16 grid.
def badge(bg, glyph):
    def fn(x, y):
        if x in (0, 15) and y in (0, 15): return None
        if x in (0, 15) or y in (0, 15): return '#0b1b2c'
        g = glyph(x, y)
        if g: return g
        return bg if y > 2 else '#ffffff55' if False else bg
    return grid(16, fn)

W = '#ffffff'
glyphs = {
    'product-design': ('#7d5cff', lambda x, y: W if 4 <= x <= 11 and 3 <= y <= 12 and x - 4 <= (y - 3) * .9 and not (x > 7 and y > 10) else None),
    'design-engineering': ('#1f9e8f', lambda x, y: W if 4 <= y <= 11 and (x == 3 + int(abs(y - 7.5)) or x == 12 - int(abs(y - 7.5))) else None),
    'data': ('#e2722b', lambda x, y: W if (x in (3, 4) and y >= 9 or x in (7, 8) and y >= 5 or x in (11, 12) and y >= 7) and y <= 12 else None),
    'ai': ('#2d6fd8', lambda x, y: W if abs(x - 7.5) + abs(y - 7.5) <= 2.5 or (abs(x - 7.5) < 1 and 2 <= y <= 13) or (abs(y - 7.5) < 1 and 2 <= x <= 13) else None),
    'ict': ('#3f4a5c', lambda x, y: ('#ffd23f' if 5 <= x <= 10 and 5 <= y <= 10 and not (6 <= x <= 9 and 6 <= y <= 9) else '#cfd6e0' if 6 <= x <= 9 and 6 <= y <= 9 else W if (x in (6, 9) and y in (3, 4, 11, 12)) or (y in (6, 9) and x in (3, 4, 11, 12)) else None)),
    'colorblind': ('#f2efe6', lambda x, y: ('#e0343a' if x < 7.5 else '#2f9a4a') if math.hypot(x - 7.5, y - 7.5) <= 4.8 else None),
}
for name, (bg, glyph) in glyphs.items():
    with open(os.path.join(OUT, 'badge-' + name + '.svg'), 'w') as f:
        f.write(svg(badge(bg, glyph)))
print('ok')

# Strips that repeat: a leafy hedge along the top of the page and an iron chain.
import random

def strip_svg(rows, scale=1):
    """Like svg(), for any width and height, merging same-colour runs into one rect."""
    h, w = len(rows), len(rows[0])
    rects = []
    for y, row in enumerate(rows):
        x = 0
        while x < w:
            c = row[x]
            if not c: x += 1; continue
            end = x
            while end + 1 < w and row[end + 1] == c: end += 1
            rects.append(f'<rect x="{x}" y="{y}" width="{end - x + 1}" height="1" fill="{c}"/>')
            x = end + 1
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w * scale}" height="{h * scale}" '
            f'shape-rendering="crispEdges">{"".join(rects)}</svg>\n')

def hedge(w=128, h=34, seed=4):
    """Seamless leafy hedge: overlapping leaf blobs that hang down unevenly, with a dark rim."""
    rnd = random.Random(seed)
    greens = ['#2f6b1f', '#3f8a26', '#56a82e', '#7cc63c']
    cells = [[None] * w for _ in range(h)]
    depth = [10 + int(6 * (1 + math.sin(x / w * math.pi * 4 + 1)) + rnd.random() * 3) for x in range(w)]
    leaves = []
    for _ in range(260):
        x = rnd.randrange(w); top = rnd.random()
        y = int(top * (depth[x] + 6))
        leaves.append((y, x, rnd.choice([2, 2, 3]), rnd.choice([1, 2])))
    for x in range(0, w, 9):  # a few longer tendrils
        for k in range(rnd.randrange(4, 10)):
            leaves.append((depth[x] + k + 2, (x + (k % 2)) % w, 1, 1))
    for x in range(w):  # dark, dense interior behind the leaves
        for y in range(max(0, depth[x] - 1)):
            cells[y][x] = '#1f4a16' if y > 4 else '#24531a'
    for y0, x0, rx, ry in sorted(leaves):
        shade = greens[min(3, int(rnd.random() * 2 + (1 - y0 / h) * 2.2))]
        for dy in range(-ry, ry + 1):
            for dx in range(-rx, rx + 1):
                if (dx / (rx + .5)) ** 2 + (dy / (ry + .5)) ** 2 <= 1 and 0 <= y0 + dy < h:
                    cells[y0 + dy][(x0 + dx) % w] = shade
        if 0 <= y0 - ry < h and rnd.random() < .5:  # a light highlight on top of some leaves
            cells[y0 - ry][x0 % w] = '#a6e05a'
    for y in range(3):  # the hedge always starts solid at the very top
        for x in range(w):
            cells[y][x] = cells[y][x] or '#2f6b1f'
    out = [row[:] for row in cells]
    for y in range(h):
        for x in range(w):
            if cells[y][x] is None and any(0 <= y + dy < h and cells[y + dy][(x + dx) % w]
                                           for dy, dx in ((-1, 0), (0, -1), (0, 1))):
                out[y][x] = '#173a10'
    return out

def chain(period=16, width=12):
    """Vertical iron chain tile: a front-facing oval link, then a side-on link, repeating."""
    dark, mid, light, shine = '#23272d', '#7d8692', '#b9c1cb', '#eef2f6'
    rows = [[None] * width for _ in range(period)]
    cx = (width - 1) / 2
    for y in range(period):
        for x in range(width):
            # Side-on link centred on row 12 (wraps into the next tile), drawn first so the
            # front link sits over it.
            yy = (y - 12 + period / 2) % period - period / 2
            if abs(yy) <= 6 and abs(x - cx) <= 1.6:
                rows[y][x] = dark if abs(x - cx) > .9 or abs(yy) > 5 else (shine if x < cx else mid)
            # Front link centred on row 4: an oval ring two pixels thick.
            e = ((x - cx) / 5.4) ** 2 + ((y - 4) / 6.2) ** 2
            if .34 <= e <= 1.0:
                rows[y][x] = dark if e > .8 or e < .42 else (shine if x < cx - 1 and y < 4 else light if x < cx else mid)
    return rows

with open(os.path.join(OUT, 'hedge.svg'), 'w') as f:
    f.write(strip_svg(hedge()))
with open(os.path.join(OUT, 'chain.svg'), 'w') as f:
    f.write(strip_svg(chain()))
