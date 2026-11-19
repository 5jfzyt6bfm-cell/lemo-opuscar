"""Score + foley for "Attention That Won't Steer", from events.json (exported from the page's window.EV). Writes out/mix.wav.
Score: an ambient synth bed at 80 BPM (Am9 - Fmaj7 - Cmaj7 - G6sus2), a soft low pulse, a fast arpeggio during the hyperfocus,
true silence before the stamp, a swell at the pull-back. Everything is synthesised with numpy (core/audio/sfx.py)."""
import json, os, sys
import numpy as np
LIB = os.environ['LIB']; sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, brown, norm, click, whoosh, thump, ding, pop, add, compress, limit
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, 'events.json'))); DUR = E['dur']; EV = E['ev']
N = int((DUR + .6) * SR); mus = np.zeros((N, 2)); fx = np.zeros((N, 2))
rng = np.random.default_rng(3)
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
BEAT = 60 / 80; BAR = BEAT * 4
CHORDS = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 69], [48, 55, 60, 64, 71], [55, 57, 62, 64, 67]]   # Am9, Fmaj7, Cmaj7, G6sus2 (voiced from MIDI 48 up)
ev_t = lambda k: [e for e in EV if e['type'] == k]
HUSH = ev_t('hush')[0]; H0, H1 = HUSH['t'], HUSH['t'] + HUSH['d']
STAMP = ev_t('stamp')[0]['t']

def pad(freqs, d):
    tt = t_(d); x = np.zeros_like(tt)
    for f in freqs:
        for det in (-.004, .004):
            ph = rng.random() * 6
            x += np.sin(2 * np.pi * f * (1 + det) * tt + ph) + .25 * np.sin(2 * np.pi * 2 * f * (1 + det) * tt + ph)
    a = np.minimum(1, tt / .9) * np.minimum(1, (d - tt) / .9)
    return lp(x, 1800) * a / len(freqs)
def pluck(f, d=.5, v=1.0):
    tt = t_(d); return (np.sin(2 * np.pi * f * tt) + .3 * np.sin(4 * np.pi * f * tt)) * env_exp(d, .12) * v
def kick(v=1.0):
    d = .4; tt = t_(d); return np.sin(2 * np.pi * 52 * tt * (1 - .35 * tt) + 3 * env_exp(d, .02)) * env_exp(d, .11) * v

# —— score ——
FOCUS = (10.7, 13.6); SPOTS = (19.2, 25.8); END = 25.8
bar = 0
while bar * BAR < DUR + .4:
    t0 = bar * BAR; ch = CHORDS[bar % 4]
    g = .32 + .12 * (t0 >= END) + .05 * (FOCUS[0] <= t0 < FOCUS[1])
    p = pad([mtof(m) for m in ch], BAR + 1.2) * g
    add(mus, p, t0, 1.0, -.1); add(mus, pad([mtof(x) for x in ch], BAR + 1.2) * g * .9, t0 + .01, 1.0, .1)
    add(mus, hp(pad([mtof(ch[0] - 12)], BAR + 1.0), 60) * .17, t0)                              # bass note, an octave down
    bar += 1
# low pulse on beats 1 and 3, dropping out on the board and returning softer
for k in range(int(DUR / BEAT) + 1):
    t = k * BEAT
    if k % 2 == 0 and not (13.6 <= t < STAMP + .4) and t < DUR - .5: add(mus, hp(kick(.4 if t < 19.2 else .3), 45), t)
# hyperfocus: a fast arpeggio that speeds up
t = FOCUS[0]; i = 0
while t < FOCUS[1]:
    ch = CHORDS[int(t / BAR) % 4]; f = mtof(ch[i % len(ch)] + 12)
    add(mus, pluck(f, .4, .22), t, 1.0, ((i % 4) - 1.5) / 3); i += 1
    t += .19 - .07 * (t - FOCUS[0]) / (FOCUS[1] - FOCUS[0])
# the spotlight: slow 8ths that keep changing register
t = SPOTS[0]; i = 0
while t < SPOTS[1]:
    ch = CHORDS[int(t / BAR) % 4]; add(mus, pluck(mtof(ch[(i * 3) % len(ch)] + (12 if i % 4 < 2 else 0)), .6, .14), t, 1.0, np.sin(i) * .5); i += 1; t += BEAT / 2
# the ending: a high bell on the reveal
add(mus, ding(.18), 26.3, 1.0, .2)
# true silence before the stamp: the music cuts and comes back after it
env = np.ones(N); a, b = int(H0 * SR), int(H1 * SR); env[a - 1200:a] = np.linspace(1, 0, 1200); env[a:b] = 0
r = int((STAMP + .25) * SR); env[b:r] = 0; env[r:r + 24000] = np.linspace(0, 1, 24000)
mus *= env[:, None]

# —— foley ——
def tone(f, d, v=1.0, tau=.2): tt = t_(d); return np.sin(2 * np.pi * f * tt) * env_exp(d, tau) * v
for e in EV:
    k, t, v = e['type'], e['t'], e.get('v', 1.0)
    if k == 'room':   add(fx, lp(brown(e['d']), 300) * .05 * np.minimum(1, t_(e['d']) / .4), t)
    elif k == 'blink': add(fx, click(1.6, .12 * v), t, 1.0, -.2)
    elif k == 'notify':
        add(fx, tone(1568, .5, .22, .15) + np.pad(tone(2093, .5, .22, .2), (int(.09 * SR), 0))[:int(.5 * SR)], t)
    elif k == 'buzz':
        d = .32; tt = t_(d); add(fx, np.sign(np.sin(2 * np.pi * 165 * tt)) * lp(np.ones_like(tt), 50) * np.sin(np.pi * tt / d) * .07 * v, t)
    elif k == 'grab':  add(fx, hp(noise(.12), 1500) * env_exp(.12, .03) * .18, t, 1.0, .4)
    elif k == 'tick':  add(fx, click(.9, .5), t)
    elif k == 'lapse': add(fx, whoosh(.3, .5 * v), t - .1, 1.0, .2)
    elif k == 'cut':   add(fx, whoosh(.25, .25), t - .12)
    elif k == 'pin':   add(fx, click(1.1, .6 * v), t); add(fx, thump(.2, 140), t)
    elif k == 'string': d = e['d']; add(fx, bp(noise(d), 2500, 6000) * np.sin(np.pi * t_(d) / d) * .05, t)
    elif k == 'stamp': add(fx, thump(1.0, 48), t); add(fx, hp(noise(.08), 800) * env_exp(.08, .015) * .6, t)
    elif k == 'swing': d = e['d']; add(fx, whoosh(max(.25, d), .22), t, 1.0, e.get('pan', 0))
    elif k == 'tug':   add(fx, thump(.35, 90), t, 1.0, -.3)
    elif k == 'city':
        d = e['d']; tt = t_(d); add(fx, (lp(brown(d), 500) * .06 + bp(noise(d), 300, 1200) * .015) * np.minimum(1, tt / .6), t)
    elif k == 'glow':  add(fx, pop(.12), t, 1.0, .3)

# the fridge-quiet room under the board shot, and a breath of air on the spotlight scene
add(fx, lp(brown(6.6), 220) * .04, 19.2)
mix = mus * .9 + fx
mix = np.stack([limit(mix[:, 0], .95), limit(mix[:, 1], .95)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
wavfile.write(os.path.join(HERE, 'out', 'mix.wav'), SR, (mix * 32767 * .9).astype(np.int16))
print('out/mix.wav', round(DUR, 2), 's')
