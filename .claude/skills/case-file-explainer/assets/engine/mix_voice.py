"""Narration + score + foley. python mix_voice.py FILM_DIR  (reads FILM_DIR/events.json and FILM_DIR/audio/narration.mp3, writes FILM_DIR/out/mix.wav).
The narration is the user's recording, only levelled. The score is synthesised per act (mood events from the page),
ducked under the voice; foley comes from the picture's own events (pins, pops, stamps, knocks...)."""
import json, os, sys, subprocess
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, brown, norm, click, whoosh, thump, ding, pop, step, add, limit
from scipy.io import wavfile
from scipy.ndimage import uniform_filter1d, maximum_filter1d

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = sys.argv[1] if len(sys.argv) > 1 else HERE   # the film folder: events.json, audio/narration.mp3, out/
E = json.load(open(os.path.join(ROOT, 'events.json'))); DUR = E['dur']; EV = E['ev']
N = int((DUR + .5) * SR)
rng = np.random.default_rng(5)
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)

# —— narration ——
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(ROOT, 'audio', 'narration.mp3'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
v = np.frombuffer(raw, np.float32).astype(np.float64)
v = hp(v, 70)
# gentle compression: even out the level so the bed can sit under it
env = maximum_filter1d(np.abs(v), int(.01 * SR)); env = uniform_filter1d(env, int(.05 * SR)) + 1e-6
thr = np.percentile(env[env > 1e-3], 70); gain = np.where(env > thr, (thr + (env - thr) / 2.5) / env, 1.0)
v = v * uniform_filter1d(gain, int(.03 * SR)); v = v / np.percentile(np.abs(v), 99.9) * .7
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
venv = uniform_filter1d(np.abs(voice), int(.15 * SR)); venv = venv / (np.percentile(venv, 95) + 1e-9)
duck = 1 - .55 * np.clip(uniform_filter1d(venv, int(.4 * SR)), 0, 1)

# —— score ——
MOODS = {
  'night':  dict(ch=[[57, 60, 64, 67, 71], [53, 57, 60, 64, 69], [48, 55, 60, 64, 71], [55, 57, 62, 64, 67]], bar=3.0, g=.26, arp=None),
  'memory': dict(ch=[[50, 57, 62, 66, 69], [47, 54, 59, 62, 66], [55, 59, 62, 66, 71], [57, 61, 64, 69, 71]], bar=4.0, g=.24, arp='bell'),
  'past':   dict(ch=[[48, 55, 60, 64, 74], [53, 57, 60, 65, 72], [57, 60, 64, 69, 72], [55, 59, 62, 67, 74]], bar=3.0, g=.24, arp='bell'),
  'street': dict(ch=[[52, 59, 62, 66, 67], [48, 55, 59, 64, 67], [57, 60, 64, 67, 71], [59, 63, 66, 69, 71]], bar=3.0, g=.26, arp='pluck'),
  'brain':  dict(ch=[[50, 57, 60, 64, 65], [46, 53, 57, 62, 64], [48, 55, 60, 64, 67], [45, 52, 57, 60, 64]], bar=3.0, g=.24, arp='pulse'),
  'study':  dict(ch=[[57, 64, 67, 71], [53, 60, 64, 69], [57, 64, 67, 71], [52, 59, 64, 67]], bar=4.0, g=.2, arp='pulse'),
  'warm':   dict(ch=[[53, 57, 60, 64, 69], [52, 55, 60, 64, 67], [50, 57, 60, 65, 69], [46, 53, 57, 62, 65]], bar=3.0, g=.26, arp='bell'),
  'party':  dict(ch=[[52, 59, 64, 67], [48, 55, 64, 67], [50, 57, 62, 66], [47, 54, 62, 66]], bar=2.0, g=.2, arp='bass'),
  'porch':  dict(ch=[[45, 64, 69]], bar=12.0, g=.16, arp=None),
  'dawn':   dict(ch=[[50, 57, 62, 66, 69, 76], [55, 59, 62, 66, 71], [47, 54, 59, 62, 66], [57, 61, 64, 69, 73]], bar=3.5, g=.26, arp='bell'),
}
def pad(freqs, d):
    tt = t_(d); x = np.zeros_like(tt)
    for f in freqs:
        for det in (-.003, .004):
            ph = rng.random() * 6; x += np.sin(2 * np.pi * f * (1 + det) * tt + ph) + .22 * np.sin(4 * np.pi * f * (1 + det) * tt + ph)
    a = np.minimum(1, tt / 1.0) * np.minimum(1, (d - tt) / 1.0)
    return lp(x, 2000) * a / len(freqs)
def bell(f, d=1.6): tt = t_(d); return (np.sin(2 * np.pi * f * tt) + .4 * np.sin(2 * np.pi * 2.76 * f * tt) * env_exp(d, .2)) * env_exp(d, .5)
def pluck(f, d=.5): tt = t_(d); return (np.sin(2 * np.pi * f * tt) + .3 * np.sin(4 * np.pi * f * tt)) * env_exp(d, .12)
def kick(v=1.0): d = .35; tt = t_(d); return np.sin(2 * np.pi * 52 * tt * (1 - .35 * tt) + 3 * env_exp(d, .02)) * env_exp(d, .1) * v
mus = np.zeros((N, 2))
for a in [e for e in EV if e['type'] == 'act']:
    M = MOODS[a['mood']]; t0, d = a['t'], a['d']; k = 0; t = t0
    while t < t0 + d:
        ch = M['ch'][k % len(M['ch'])]; L = min(M['bar'], t0 + d - t) + 1.0
        add(mus, pad([mtof(m) for m in ch], L) * M['g'], t, 1.0, -.15); add(mus, pad([mtof(m) for m in ch], L) * M['g'] * .9, t + .02, 1.0, .15)
        if ch[0] >= 48: add(mus, hp(pad([mtof(ch[0] - 12)], L), 55) * M['g'] * .5, t)
        if M['arp'] == 'bell': add(mus, bell(mtof(ch[-1] + 12)) * .05, t + .2, 1.0, .3); add(mus, bell(mtof(ch[2] + 12)) * .04, t + M['bar'] / 2, 1.0, -.3)
        if M['arp'] == 'pluck':
            for i in range(int(M['bar'] / .375)): add(mus, pluck(mtof(ch[(i * 2) % len(ch)] + 12)) * .05, t + i * .375, 1.0, ((i % 4) - 1.5) / 3)
        if M['arp'] == 'pulse':
            for i in range(int(M['bar'] / .75)): add(mus, pluck(mtof(ch[1]), .3) * .06, t + i * .75)
        if M['arp'] == 'bass':   # the party through a wall: a muffled four-on-the-floor
            for i in range(int(M['bar'] / .5)): add(mus, lp(kick(.5), 180), t + i * .5)
        t += M['bar']; k += 1
mus *= duck[:, None]
# hush: almost nothing under the porch silence; release: a warm swell on "Are you okay?"
for h in [e for e in EV if e['type'] == 'hush']:
    a0, a1 = int(h['t'] * SR), int((h['t'] + h['d']) * SR); r = np.ones(N); r[a0:a1] = .25; mus *= uniform_filter1d(r, int(.3 * SR))[:, None]
for r in [e for e in EV if e['type'] == 'release']:
    sw = pad([mtof(m) for m in [50, 57, 62, 66, 69, 74]], 5.0) * .3; add(mus, sw, r['t'] - .3, 1.0, -.1); add(mus, sw * .9, r['t'] - .28, 1.0, .1); add(mus, bell(mtof(78), 3) * .06, r['t'] + .4)

# —— foley ——
fx = np.zeros((N, 2))
def tone(f, d, v=1.0, tau=.2): tt = t_(d); return np.sin(2 * np.pi * f * tt) * env_exp(d, tau) * v
for e in EV:
    k, t, vv = e['type'], e['t'], e.get('v', 1.0)
    if k == 'cut': add(fx, whoosh(.3, .07 * vv), t - .15)
    elif k == 'pin': add(fx, click(1.1, .25 * vv), t); add(fx, thump(.08, 140), t)
    elif k == 'pop': add(fx, pop(.06 * vv), t, 1.0, .2)
    elif k == 'scribble': d = e.get('d', .45); add(fx, bp(noise(d), 2500, 7000) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 9 * t_(d)))) * np.sin(np.pi * t_(d) / d) * .05, t)
    elif k == 'pen': d = .5; add(fx, bp(noise(d), 2500, 7000) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 8 * t_(d)))) * np.sin(np.pi * t_(d) / d) * .05, t)
    elif k == 'stamp': add(fx, thump(.5, 48), t); add(fx, hp(noise(.07), 800) * env_exp(.07, .015) * .15, t)
    elif k == 'stampsoft': add(fx, thump(.18, 70), t)
    elif k == 'smash':
        for i in range(10): add(fx, click(1.5 + rng.random(), .25), t + i * .02 + rng.random() * .05, 1.0, rng.random() - .5)
    elif k == 'ping': add(fx, tone(1760, .4, .12, .12) + np.pad(tone(2349, .4, .1, .15), (int(.07 * SR), 0))[:int(.4 * SR)], t)
    elif k == 'steps':
        for i in range(8): add(fx, step(.12), t + i * .42, 1.0, -.2 + i * .05)
    elif k == 'coin': add(fx, tone(2637, .8, .15, .25) + tone(3520, .8, .08, .2), t)
    elif k == 'brick': add(fx, thump(.2, 110), t); add(fx, click(.6, .12), t)
    elif k == 'whoosh': add(fx, whoosh(1.2, .2), t)
    elif k == 'ring':
        for i in range(2): add(fx, tone(440, .4, .07, .3) + tone(480, .4, .07, .3), t + i * .5)
    elif k == 'car':
        d = 2.5; tt = t_(d); add(fx, lp(brown(d), 400) * np.sin(np.pi * tt / d) * .12, t)
    elif k == 'knock': add(fx, thump(.5, 120), t); add(fx, lp(noise(.05), 900) * env_exp(.05, .01) * .3, t)
    elif k == 'door': d = .6; tt = t_(d); add(fx, bp(noise(d), 300, 1500) * env_exp(d, .2) * .08, t); add(fx, thump(.2, 90), t + .4)
    elif k == 'thud': add(fx, thump(.35, 45), t)
    elif k == 'night': d = 14; tt = t_(d); add(fx, (lp(brown(d), 300) * .03 + bp(noise(d), 3800, 4600) * (np.sin(2 * np.pi * 14 * tt) > .6) * .004) * np.minimum(1, tt / 1.5) * np.minimum(1, (d - tt) / 2), t)
    elif k == 'bass': pass

# —— balance and write ——
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-4] ** 2))
vr = rms(voice); mus *= (vr / max(rms(mus.mean(1)), 1e-9)) * 10 ** (-17 / 20); fx *= 1.0
mix = np.stack([voice, voice], 1) + mus + fx
mix = np.stack([limit(mix[:, 0], .95), limit(mix[:, 1], .95)], 1)
os.makedirs(os.path.join(ROOT, 'out'), exist_ok=True)
wavfile.write(os.path.join(ROOT, 'out', 'mix.wav'), SR, (mix * 32767 * .9).astype(np.int16))
print('out/mix.wav', round(DUR, 1), 's · music RMS vs voice: -17 dB')
