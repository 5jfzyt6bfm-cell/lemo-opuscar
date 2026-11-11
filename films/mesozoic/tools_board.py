# Storyboard sheet: 8 key shots with number, framing, duration and line.
import sys, os
from PIL import Image, ImageDraw, ImageFont
D = os.path.dirname(os.path.abspath(__file__))
F = ImageFont.truetype(os.path.join(D, 'fonts', 'JosefinSans[wght].ttf'), 22)
FB = ImageFont.truetype(os.path.join(D, 'fonts', 'Limelight-Regular.ttf'), 24)
rows = [
 ('2.2', '1', 'Insert · push-in on the time machine', '0.0–4.0 s', '"Two hundred million years ago. How long would you last?"'),
 ('6.4', '2', 'Wide · doors split, dolly through', '4.0–7.6 s', '"Step through. Good news: you can breathe."'),
 ('10.5', '3', 'Close · oxygen gauge, slow push', '7.6–12.2 s', '"The air is thin, like a mountain town. It won\'t kill you."'),
 ('15.2', '4', 'Extreme low angle · tilt up to the sun', '12.2–16.6 s', '"The heat might. 40 degrees, and no clean water."'),
 ('20.4', '5', 'Medium close · survival clock, counted bulbs', '16.6–21.0 s', '"Without water: about 3 days."'),
 ('25.6', '6', 'Crane down · the fire, the sign counts up', '21.0–26.0 s', '"Boil it, find shade, dodge the teeth… you might last years."'),
 ('27.3', '7a', 'Pull back · from your fire…', '26.0–28.4 s', '"The dinosaurs lasted…"'),
 ('29.6', '7b', '…to the epoch medallion; doors close', '28.4–32.0 s', '"…165 million."'),
]
w, h, cols, pad, cap = 640, 360, 4, 16, 118
S = Image.new('RGB', (cols * (w + pad) + pad, 2 * (h + cap + pad) + pad + 70), (12, 10, 8))
d = ImageDraw.Draw(S)
d.text((pad, 20), 'HOW LONG WOULD YOU LAST?  ·  Art Deco  ·  32 s storyboard', font=FB, fill=(243, 217, 139))
for i, (t, n, fr, dur, line) in enumerate(rows):
    x, y = pad + (i % cols) * (w + pad), 70 + (i // cols) * (h + cap + pad)
    im = Image.open(os.path.join(D, 'storyboard', f't_{t}.jpg')).resize((w, h), Image.LANCZOS)
    S.paste(im, (x, y))
    d.text((x, y + h + 8), f'{n}  ·  {fr}', font=FB, fill=(243, 217, 139))
    d.text((x, y + h + 44), dur, font=F, fill=(203, 189, 159))
    d.text((x, y + h + 74), line, font=F, fill=(242, 232, 213))
S.save(os.path.join(D, 'storyboard.jpg'), quality=90)
print('ok')
