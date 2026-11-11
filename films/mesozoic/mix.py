"""Score, foley and voice for "How Long Would You Last?" → out/mix.wav (with score) and out/mix_nomusic.wav.
Everything is placed from events.json (exported from timeline.js), so sound sits on the frame."""
import os, sys, json
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add, limit, compress, noise, t_, env_exp, lp, hp, bp, brown, norm, whoosh, thump, ding, rumble

S.seed(11)
EV = json.load(open(os.path.join(HERE, 'events.json')))
DUR = EV['dur']; ev = EV['ev']
N = int((DUR + .5) * SR)
def buf(): return np.zeros((N, 2), np.float32)
def at(type_): return [e for e in ev if e['type'] == type_]
rng = np.random.default_rng(3)

# ============ VOICE ============
VO = buf()
for e in at('vo'):
    x, sr = sf.read(os.path.join(HERE, 'voices', e['id'] + '.wav'))
    if x.ndim > 1: x = x.mean(1)
    import soxr; x = soxr.resample(x, sr, SR)
    x = hp(x, 90); x = compress(norm(x, .9), thr=.2, ratio=3.5)
    add(VO, x.astype(np.float32), e['t'], 1.0, 0)
vo_env = np.abs(VO[:, 0]); from scipy.ndimage import maximum_filter1d, uniform_filter1d
vo_env = uniform_filter1d(maximum_filter1d(vo_env, int(.12 * SR)), int(.15 * SR))
duck = 1 - .65 * np.clip(vo_env / (vo_env.max() * .25), 0, 1)        # ≈ −9 dB under voice

# ============ FOLEY / AMBIENCE ============
FX = buf()
def bed(sig, t0, t1, gain, fade=.6, pan=0):
    d = t1 - t0; x = sig(d); n = len(x); f = int(fade * SR)
    e = np.ones(n); e[:f] = np.linspace(0, 1, f); e[-f:] = np.linspace(1, 0, f)
    add(FX, (x * e).astype(np.float32), t0, gain, pan)
def ratchet(d, rate=22):
    out = np.zeros(int(d * SR)); k = 0; tt = 0
    while tt < d:
        c = hp(noise(.02), 2500) * env_exp(.02, .002); s = int(tt * SR); out[s:s + len(c)] += c[:len(out) - s] * (.6 + .4 * rng.random())
        tt += 1 / (rate * (1 + 1.5 * min(1, tt / d))); k += 1
    return norm(out)
def tick(): d = .05; return norm(hp(noise(d), 3000) * env_exp(d, .003) + np.sin(2 * np.pi * 3400 * t_(d)) * env_exp(d, .01) * .4)
def chunk(big=0):   # knife-switch + relay
    d = .3; x = lp(noise(d), 1800) * env_exp(d, .03) + np.sin(2 * np.pi * (90 if big else 140) * t_(d)) * env_exp(d, .06)
    x[:int(.012 * SR)] += hp(noise(.012), 3000) * 1.5
    return norm(x)
def hum(d): tt = t_(d); return norm(np.sin(2 * np.pi * 120 * tt) * .6 + np.sin(2 * np.pi * 240 * tt) * .3 + bp(noise(d), 100, 400) * .1)
def door(close=1):   # heavy lacquered wooden leaves: low thud + creak swell
    d = .7; tt = t_(d); body = lp(brown(d), 300) * np.sin(np.pi * np.minimum(1, tt / .5)) ** 2
    x = body * .6
    if close: x[int(.45 * SR):] += thump(1, 60)[: len(x) - int(.45 * SR)] * 1.0
    return norm(x)
def twang(): d = .6; tt = t_(d); return norm(np.sin(2 * np.pi * (220 + 30 * np.sin(2 * np.pi * 7 * tt)) * tt) * env_exp(d, .15) * .7 + bp(noise(d), 1500, 3000) * env_exp(d, .05) * .3)
def footfall(): d = .8; return norm(lp(np.sin(2 * np.pi * 38 * t_(d) * (1 - .2 * t_(d))) * env_exp(d, .2) + lp(noise(d), 120) * env_exp(d, .1), 200))
def wind(d): return norm(bp(brown(d) + noise(d) * .05, 200, 1600)) * (.7 + .3 * np.sin(2 * np.pi * .2 * t_(d)))
def insects(d): tt = t_(d); return norm(bp(noise(d), 4200, 6200) * (.5 + .5 * np.sin(2 * np.pi * 13 * tt)) ** 2)
def heat(d): return norm(hp(noise(d), 5000) * .4 + bp(noise(d), 2000, 3000) * (.5 + .5 * np.sin(2 * np.pi * 31 * t_(d))) ** 4)
def fire(d):
    base = lp(brown(d), 500) * .5; cr = np.zeros(len(base))
    for _ in range(int(d * 14)):
        s = rng.integers(0, len(cr) - 2000); c = hp(noise(.008), 2000) * env_exp(.008, .001) * rng.random(); cr[s:s + len(c)] += c
    return norm(base + cr * 2)
def boil(d):
    out = np.zeros(int(d * SR))
    for _ in range(int(d * 25)):
        s = rng.integers(0, len(out) - 3000); f = 300 + rng.random() * 500; dd = .03; c = np.sin(2 * np.pi * np.cumsum(np.linspace(f, f * 1.8, int(dd * SR))) / SR) * env_exp(dd, .008); out[s:s + len(c)] += c * rng.random()
    return norm(lp(out, 2500))
def match(): d = .5; x = bp(noise(d), 1500, 6000) * env_exp(d, .05); x += lp(noise(d), 800) * np.minimum(1, t_(d) / .1) * env_exp(d, .25) * .6; return norm(x)
def clank(): d = .8; tt = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * tt) * env_exp(d, tau) for f, a, tau in [(523, 1, .25), (1187, .6, .15), (2210, .4, .08)]) + hp(noise(d), 3000) * env_exp(d, .005))
def chase(d):
    out = np.zeros(len(t_(d))); tt = 0
    while tt < d - .05: c = hp(noise(.01), 4000) * env_exp(.01, .002); s = int(tt * SR); out[s:s + len(c)] += c * .5; tt += 1 / 14
    return norm(out)

for e in ev:
    T, ty = e['t'], e['type']
    if ty == 'room': bed(lambda d: norm(lp(brown(d), 300)), T, 4.0, .05)
    elif ty == 'ratchet': add(FX, ratchet(e['dur']).astype(np.float32), T, .22, .1)
    elif ty == 'bell': pass                                   # tuned: in the score (and below for no-music)
    elif ty == 'doorclose': add(FX, door(1), T, .55)
    elif ty == 'dooropen': add(FX, door(0), T, .45)
    elif ty == 'latch': add(FX, chunk(1), T, .55)
    elif ty == 'springtwang': add(FX, twang(), T, .18, .3)
    elif ty == 'wind': bed(wind, T, e['until'], .07); bed(insects, T + .5, e['until'], .025, pan=.3)
    elif ty == 'sauropod': add(FX, footfall(), T, .35, .3)
    elif ty == 'cut': add(FX, chunk(0), T, .2)
    elif ty == 'titlebar': add(FX, whoosh(.5, 1), T, .08)
    elif ty == 'needle': add(FX, ratchet(e['dur'], 10), T, .1, .1)
    elif ty == 'settle': add(FX, tick(), T, .3)
    elif ty == 'archwipe': add(FX, whoosh(.7, 1), T, .18)
    elif ty == 'heat': bed(heat, T, e['until'], .05)
    elif ty == 'tick': add(FX, tick(), T, .5)
    elif ty == 'clunk': add(FX, chunk(1), T, .5)
    elif ty == 'switch': add(FX, chunk(e.get('big', 0)), T, .55 if e.get('big') else .38, (rng.random() - .5) * .4)
    elif ty == 'hum': bed(hum, T, e['until'], .03 if not e.get('last') else .05, fade=.3)
    elif ty == 'whoosh': add(FX, whoosh(.8, 1), T, .2)
    elif ty == 'night': bed(insects, T, e['until'], .05, pan=-.2); bed(wind, T, e['until'], .04)
    elif ty == 'match': add(FX, match(), T, .4, -.2)
    elif ty == 'fire': bed(fire, T, e['until'], .16, fade=.4)
    elif ty == 'potclank': add(FX, clank(), T, .2)
    elif ty == 'boil': bed(boil, T, e['until'], .1, fade=.8)
    elif ty == 'chase': add(FX, chase(e['until'] - T), T, .12)
    elif ty == 'pullback': add(FX, whoosh(1.6, 1), T, .18)
    elif ty == 'rumble': bed(lambda d: rumble(d), T, e['until'], .25, fade=1.0); [add(FX, footfall(), T + .6 + k * 1.1, .25) for k in range(4)]

# ============ SCORE: foxtrot, 112 bpm, F major, symphonic-jazz palette ============
B = 60 / 112
def beat(t0, k): return t0 + k * B
M = []
def n(t, inst, p, d, v, pan=0, g=1): M.append((t, inst, p, d, v, pan, g))
# intro: harp climbs with the date counter, bell on the lock
for i, p in enumerate(['F3', 'A3', 'C4', 'F4', 'A4', 'C5', 'F5', 'A5', 'C6', 'F6']): n(.7 + i * .24, 'harp', p, 1.2, .35 + i * .03, -.3)
n(3.1, 'tubular_bells', 'F4', 3, .6, 0, .8); n(3.1, 'glockenspiel', 'C7', 1.5, .4, .3, .5)
# chord grid (2 beats each): F6 D7 Gm7 C7
CH = [('F2', ['A3', 'C4', 'D4', 'F4']), ('D2', ['F#3', 'A3', 'C4', 'D4']), ('G2', ['Bb3', 'D4', 'F4', 'G4']), ('C2', ['Bb3', 'C4', 'E4', 'G4'])]
WALK = {'F2': ['F2', 'A2'], 'D2': ['D2', 'F#2'], 'G2': ['G2', 'Bb2'], 'C2': ['C2', 'E2']}
def comp(t0, t1, vel=.45, stride=True, bass=True, brush=True):
    k = 0
    while beat(t0, k) < t1 - .05:
        root, ch = CH[(k // 2) % 4]; t = beat(t0, k)
        if bass: n(t, 'contrabass_pizz', WALK[root][k % 2], B * .9, vel + .15, -.15)
        if stride:
            if k % 2 == 0: n(t, 'piano', root.replace('2', '3') if False else root, B * .8, vel * .8, -.2)
            else: [n(t, 'piano', p, B * .7, vel * .7, .1) for p in ch]
        if brush:
            n(t, 'snare2', 'taps', None, .18 + (.1 if k % 2 else 0), .2, .6)
            n(t + B / 2, 'hihat', 'closed', None, .15, .3, .35)
        k += 1
comp(3.5, 7.6, .4, stride=False)
comp(7.6, 12.2, .42)
THEME = [(0, 'A4', 1), (1, 'C5', .5), (1.5, 'D5', .5), (2, 'C5', 1), (3, 'A4', 1), (4, 'G4', 1.5), (5.5, 'F4', 2.5)]
for b, p, d in THEME[:4]: n(beat(7.6, b + 2), 'piano', p, d * B, .5, .1)                   # fragment 1
for b, p, d in [(0, 'D5', .5), (.5, 'C5', .5), (1, 'A4', 2)]: n(beat(7.6, b + 6), 'trumpet_mute', p, d * B, .35, .25)   # muted answer
# B: heat — low strings pedal + rising tremolo
n(12.2, 'contrabass', 'C2', 4.4, .45, 0, .8); n(12.2, 'cellos', 'C3', 4.3, .35, -.2, .7)
for i, p in enumerate(['G3', 'Ab3', 'A3', 'Bb3', 'B3', 'C4', 'Db4', 'D4']): n(12.4 + i * .5, 'violins', p, .55, .25 + i * .03, .2, .55)
# 16.6–17.45 silence (ticks only). Spin: xylophone run. Bulbs: counted hits.
for i in range(10): n(17.45 + i * .13, 'xylophone', ['F5', 'G5', 'A5', 'C6', 'D6', 'F6', 'G6', 'A6', 'C7', 'F7'][i], .2, .35, .2, .6)
n(18.95, 'piano', 'F2', 1.8, .7, 0); n(18.95, 'piano', 'C3', 1.8, .6, 0); n(18.95, 'tubular_bells', 'C5', 2.5, .5, 0, .7)
for i, d in enumerate([0, .12, .24, .36]): n(19.5 + d, 'glockenspiel', ['F6', 'A6', 'C7', 'F7'][i], .5, .45, .2, .5)
n(19.5, 'clarinet', 'C4', 1.5, .3, -.2, .5)
# C: the turn — full theme over the comp
comp(21.0, 26.0, .45)
for b, p, d in THEME: n(beat(21.0 + 2 * B, b), 'trumpet_mute', p, d * B, .42, .2)
for t, top in [(22.9, 'C6'), (23.7, 'F6'), (24.5, 'A6')]:
    for i, p in enumerate(['F5', 'A5', top]): n(t + i * .06, 'xylophone', p, .3, .4, .1, .6)
n(24.5, 'harp', 'F5', 1.5, .4, -.3)
# coda: near-silence, then the bell and a low chord for the epoch; clarinet carries it home
n(28.4, 'tubular_bells', 'F4', 4, .55, 0, .8); [n(28.4, 'piano', p, 3.5, .45, 0) for p in ['F1', 'F2', 'C3', 'A3', 'D4']]
n(28.6, 'clarinet', 'A4', 1.2, .3, -.2, .55); n(29.8, 'clarinet', 'F4', 1.6, .28, -.2, .55)
n(30.55, 'harp', 'F2', 1.5, .3, -.3)
MUS = S.render([m if m[2] is not None or True else m for m in M], dur=DUR + .5)
MUS = S.room(MUS, size=.4, mix=.18)[:N]
if len(MUS) < N: MUS = np.pad(MUS, ((0, N - len(MUS)), (0, 0)))

# no-music version keeps the tuned bells and the counted hits as plain sfx
BELLS = buf()
for t, v in [(3.1, .25), (28.4, .3)]: add(BELLS, ding(1), t, v)

def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-9)
def master(parts):
    y = sum(parts)
    for c in range(2): y[:, c] = limit(y[:, c], .95)
    return y[:int(DUR * SR)]
vo_r = rms(VO[VO[:, 0] != 0]) if np.any(VO) else 1
mus = MUS * (vo_r / rms(MUS[np.abs(MUS[:, 0]) > 1e-4]) * 10 ** (-10 / 20)) * duck[:, None]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), master([VO, FX, mus.astype(np.float32)]), SR)
sf.write(os.path.join(HERE, 'out', 'mix_nomusic.wav'), master([VO, FX, BELLS]), SR)
print('mix written', DUR)
print(S.credits(sorted({m[1] for m in M})))
