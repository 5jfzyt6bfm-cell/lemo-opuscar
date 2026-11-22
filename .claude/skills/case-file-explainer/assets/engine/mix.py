"""Score + foley from events.json (window.EV of the page) -> out/mix.wav. Numpy synthesis, no samples. For a film with no narrator."""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, brown, click, whoosh, thump, pop, ding, add, limit
from scipy.io import wavfile
from scipy.ndimage import uniform_filter1d
HERE = os.path.dirname(os.path.abspath(__file__)); E = json.load(open(os.path.join(HERE, 'events.json'))); DUR = E['dur']; EV = E['ev']
N = int((DUR + .6) * SR); mus = np.zeros((N, 2)); fx = np.zeros((N, 2)); rng = np.random.default_rng(2)
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
def pad(fs, d):
    tt = t_(d); x = sum(np.sin(2 * np.pi * f * (1 + dt) * tt + rng.random() * 6) for f in fs for dt in (-.003, .004))
    return lp(x, 1800) * np.minimum(1, tt / .8) * np.minimum(1, (d - tt) / .8) / len(fs)
def pl(f, d=.45, v=1.): tt = t_(d); return (np.sin(2 * np.pi * f * tt) + .3 * np.sin(4 * np.pi * f * tt)) * env_exp(d, .1) * v
MO = {'warm': [[53, 60, 64, 69], [52, 55, 60, 67], [50, 57, 62, 65], [46, 53, 57, 62]], 'focus': [[57, 64, 69, 71], [57, 64, 69, 74]], 'night': [[57, 64, 67, 71], [53, 60, 64, 69], [48, 55, 64, 67], [55, 59, 62, 67]], 'study': [[57, 64, 69, 72], [52, 59, 64, 67]], 'dawn': [[50, 57, 62, 66, 69], [55, 59, 62, 67, 71], [47, 54, 59, 62, 66], [57, 61, 64, 69]]}
for a in [e for e in EV if e['type'] == 'act']:
    t, k = a['t'], 0
    while t < a['t'] + a['d']:
        ch = MO[a['mood']][k % len(MO[a['mood']])]; L = min(2.0, a['t'] + a['d'] - t) + .8
        add(mus, pad([mtof(m) for m in ch], L) * .3, t, 1, -.15); add(mus, pad([mtof(m) for m in ch], L) * .27, t + .02, 1, .15)
        for i in range(4 if a['mood'] != 'study' else 8): add(mus, pl(mtof(ch[i % len(ch)] + 12), .4, .06), t + i * (.5 if a['mood'] != 'study' else .25), 1, (i % 2) - .5)
        t += 2.0; k += 1
for h in [e for e in EV if e['type'] == 'hush']:
    r = np.ones(N); r[int(h['t'] * SR):int((h['t'] + h['d']) * SR)] = 0; r[int((h['t'] + h['d']) * SR):int((h['t'] + h['d'] + 2.2) * SR)] = 0; mus *= uniform_filter1d(r, 2400)[:, None]
def tone(f, d, v, tau): return np.sin(2 * np.pi * f * t_(d)) * env_exp(d, tau) * v
for e in EV:
    k, t, v = e['type'], e['t'], e.get('v', 1.)
    if k == 'key': add(fx, click(2.2 + rng.random() * .4, .18 * v), t, 1, .3)
    elif k == 'send': add(fx, whoosh(.3, .25), t - .05, 1, .3); add(fx, tone(1568, .25, .12, .08), t + .1)
    elif k == 'pin': add(fx, pop(.18 * v), t, 1, rng.random() - .5); add(fx, tone(2093 + rng.random() * 400, .3, .05, .1), t)
    elif k == 'cut': add(fx, whoosh(.3, .1), t - .15)
    elif k == 'pop': add(fx, pop(.2), t)
    elif k == 'thud': add(fx, thump(.25, 120), t)
    elif k == 'tick': add(fx, click(.9, .4), t)
    elif k == 'neon': d = 1.6; tt = t_(d); add(fx, (np.sign(np.sin(2 * np.pi * 120 * tt)) * .02 + bp(noise(d), 2000, 6000) * .01) * np.minimum(1, (d - tt) / .4), t); add(fx, thump(.5, 60), t)
    elif k == 'swell': add(mus, pad([mtof(m) for m in [57, 64, 69, 76]], 3) * .3, t - .2)
    elif k == 'drop': add(fx, thump(.35, 50), t); add(fx, whoosh(.5, .12), t - .2)
    elif k == 'shimmer': d = e.get('d', .8); tt = t_(d); add(fx, sum(np.sin(2 * np.pi * f * tt) for f in (2637, 3136, 3951)) * np.sin(np.pi * tt / d) * .03, t)
    elif k == 'alarm':
        for i in range(4): add(fx, tone(1760, .12, .18, .05), t + i * .18)
    elif k == 'steps':
        for i in range(7): add(fx, click(.5, .25), t + i * .28, 1, -.2 + i * .06)
    elif k == 'fridge': d = .5; add(fx, bp(noise(d), 200, 900) * env_exp(d, .15) * .12, t); add(fx, lp(brown(1.5), 120) * .05, t + .2)
    elif k == 'bus': d = 2.6; tt = t_(d); add(fx, lp(brown(d), 300) * np.sin(np.pi * tt / d) * .14, t)
    elif k == 'scratch': add(fx, bp(noise(.3), 1500, 5000) * env_exp(.3, .1) * .1, t)
    elif k == 'pins':
        for i in range(10): add(fx, pop(.12), t + i * .16, 1, rng.random() - .5)
    elif k == 'pingsoft': add(fx, tone(1568, .3, .1, .1), t)
    elif k == 'stamp': add(fx, thump(.5, 50), t)
    elif k == 'ping': add(fx, tone(1760, .5, .2, .12) + np.pad(tone(2349, .5, .16, .15), (int(.08 * SR), 0))[:int(.5 * SR)], t)
mix = mus * .55 + fx; mix = np.stack([limit(mix[:, 0], .95), limit(mix[:, 1], .95)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); wavfile.write(os.path.join(HERE, 'out', 'mix.wav'), SR, (mix * 32767 * .9).astype(np.int16)); print('out/mix.wav')
