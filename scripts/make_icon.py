from PIL import Image, ImageDraw

SIZE = 1024
img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

c1 = (91, 140, 255)
c2 = (139, 91, 255)

# rounded square background with vertical gradient
pad = 40
bg = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
bd = ImageDraw.Draw(bg)
for y in range(pad, SIZE - pad):
    t = (y - pad) / (SIZE - 2 * pad)
    color = lerp(c1, c2, t)
    bd.line([(pad, y), (SIZE - pad, y)], fill=color + (255,))
mask = Image.new("L", (SIZE, SIZE), 0)
md = ImageDraw.Draw(mask)
md.rounded_rectangle([pad, pad, SIZE - pad, SIZE - pad], radius=210, fill=255)
img = Image.composite(bg, img, mask)
d = ImageDraw.Draw(img)

# keyboard body
kb_x0, kb_y0, kb_x1, kb_y1 = 150, 430, SIZE - 150, 760
d.rounded_rectangle([kb_x0, kb_y0, kb_x1, kb_y1], radius=54, fill=(18, 21, 30, 255), outline=(255, 255, 255, 60), width=6)

# key grid
rows, cols = 3, 8
gap = 18
key_w = (kb_x1 - kb_x0 - 60 - gap * (cols - 1)) / cols
key_h = 64
top = kb_y0 + 46
for r in range(rows):
    y0 = top + r * (key_h + gap)
    this_cols = cols if r != 2 else 3
    row_w = this_cols * key_w + gap * (this_cols - 1) if r != 2 else (key_w * 4 + gap * 3)
    x0 = kb_x0 + (kb_x1 - kb_x0 - row_w) / 2
    if r == 2:
        # spacebar
        bar_w = key_w * 4 + gap * 3
        d.rounded_rectangle([x0, y0, x0 + bar_w, y0 + key_h], radius=14, fill=(233, 238, 250, 255))
        continue
    for c in range(cols):
        x = x0 + c * (key_w + gap)
        fill = (255, 255, 255, 235) if (r + c) % 5 != 0 else (255, 214, 130, 255)
        d.rounded_rectangle([x, y0, x + key_w, y0 + key_h], radius=14, fill=fill)

img.save("build/icon.png")

# multi-size ICO
sizes = [16, 24, 32, 48, 64, 128, 256]
imgs = [img.resize((s, s), Image.LANCZOS) for s in sizes]
imgs[-1].save("build/icon.ico", format="ICO", sizes=[(s, s) for s in sizes])

print("icon written")
