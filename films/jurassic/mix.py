"""Voice (the user's recording, three parts), score and foley for "One Week in the Jurassic" → out/mix.wav.
Times come from events.json (exported by the page) and sents.json (the alignment)."""
import os, sys, json, subprocess
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add, limit, noise, t_, env_exp, lp, hp, bp, brown, norm, whoosh, thump, ding, rumble
from scipy.ndimage import maximum_filter1d, uniform_filter1d
from scipy.signal import fftconvolve

S.seed(5)
EV = json.load(open(os.path.join(HERE, 'events.json'))); DUR = EV['dur']; ev = EV['ev']
SN = json.load(open(os.path.join(HERE, 'sents.json'))); OFF = SN['off']; SENT = SN['sents']
N = int((DUR + .5) * SR)
def buf(): return np.zeros((N, 2), np.float32)
rng = np.random.default_rng(11)
shots = [e for e in ev if e['type'] == 'shot']
def shot_t(fn): return [e['t'] for e in shots if e['fn'] == fn]
marks = {}
for e in ev:
    if e['type'] == 'mark': marks.setdefault(e['fn'], []).append(e['t'])
st = lambda i: SENT[i]['t0']

# ============ VOICE: the user's three files, as recorded ============
FF = os.path.join(HERE, '..', 'mesozoic', 'bin', 'ffmpeg') if os.path.exists(os.path.join(HERE, '..', 'mesozoic', 'bin', 'ffmpeg')) else 'ffmpeg'
VO = buf()
for p, f in zip('abc', sorted(os.listdir(os.path.join(HERE, 'vo_src')))):
    raw = subprocess.run([FF, '-v', 'error', '-i', os.path.join(HERE, 'vo_src', f), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).astype(np.float64)
    x = hp(x, 70)
    add(VO, x.astype(np.float32), OFF[p], 1.0, 0)
v = np.abs(VO[:, 0]); env = uniform_filter1d(maximum_filter1d(v, int(.1 * SR)), int(.2 * SR))
VO *= .5 / max(1e-6, np.percentile(v[v > .01], 99))
duck = 1 - .72 * np.clip(env / (env.max() * .2), 0, 1)          # music ≈ −11 dB under the voice

# ============ SCORE ============
B = 60 / 84
M = []
def n(t, inst, p, d, v, pan=0, g=1, **k):
    if t < DUR: M.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, gain=g, **k))
CH_F = [['F2', 'C3', 'A3', 'C4', 'F4'], ['D2', 'A2', 'F3', 'A3', 'D4'], ['Bb1', 'F2', 'D3', 'F3', 'Bb3'], ['C2', 'G2', 'E3', 'G3', 'C4']]
CH_D = [['D2', 'A2', 'F3', 'A3', 'D4'], ['Bb1', 'F2', 'D3', 'F3', 'Bb3'], ['G1', 'D2', 'Bb2', 'D3', 'G3'], ['A1', 'E2', 'C#3', 'E3', 'A3']]
THEME = [('C5', 1), ('A4', 1), ('Bb4', 1), ('C5', 1), ('D5', 2), ('C5', 1), ('A4', 1), ('G4', 1), ('A4', 1), ('Bb4', 1), ('D5', 1), ('C5', 4)]
def bars(t0, t1, beats=4):
    k = 0
    while t0 + k * beats * B < t1 - .5: yield k, t0 + k * beats * B; k += 1
def pad(t0, t1, ch, insts=(('violas', .18), ('cellos', .2)), att=1.2):
    for k, t in bars(t0, t1, 8):
        c = ch[k % len(ch)]; d = min(8 * B, t1 - t) + .4
        for inst, v in insts:
            for p in (c[1:4] if inst != 'contrabass' else c[:1]): n(t, inst, p, d, v, (hash(p) % 7 - 3) / 8, attack=att)
def harp_arps(t0, t1, ch, vel=.25, every=2):
    for k, t in bars(t0, t1, 4):
        if k % every: continue
        c = ch[(k // 2) % len(ch)]
        for i, p in enumerate(c[1:] + [S.name(S.midi(c[2]) + 12)]): n(t + i * B / 3, 'harp', p, 2, vel, -.3)
def walk(t0, t1, ch, vel=.4, snare=True):
    k = 0
    while t0 + k * B < t1 - .2:
        c = ch[(k // 4) % len(ch)]; t = t0 + k * B
        n(t, 'contrabass_pizz', [c[0], c[1], S.name(S.midi(c[0]) + 12), c[1]][k % 4], B * .9, vel, -.15)
        if snare: n(t, 'snare2', 'taps', None, .14 + (.08 if k % 2 else 0), .2, .5)
        k += 1
def theme(t0, inst, vel=.35, oct=0, pan=.2):
    tt = t0
    for p, b in THEME: n(tt, inst, S.name(S.midi(p) + 12 * oct), b * B * .95, vel, pan); tt += b * B
def tension(t0, t1, vel=.3, timp=True):
    k = 0
    while t0 + k * B / 2 < t1 - .2:
        t = t0 + k * B / 2
        n(t, 'cellos_spic', ['D2', 'D2', 'F2', 'D2', 'E2', 'D2', 'A2', 'D2'][k % 8], B * .4, vel, -.2)
        if timp and k % 8 == 0: n(t, 'timpani', 'D2', 1.5, vel + .1, 0, .8)
        k += 1
    n(t0, 'violins_trem', 'A5', t1 - t0, .12, .3, .6, attack=2)
    n(t0, 'contrabass', 'D1', t1 - t0, .2, 0, .7, attack=1.5)
def eerie(t0, t1):
    for k, t in bars(t0, t1, 4):
        n(t, 'vibraphone_bowed', ['D4', 'F4', 'E4', 'A4'][k % 4], 4 * B, .22, .3, attack=.6)
        if k % 2 == 0: n(t + B * 2, 'glockenspiel', ['A6', 'F6', 'D7', 'E6'][(k // 2) % 4], 2, .12, -.3, .6)
    n(t0, 'violins_trem', 'D6', t1 - t0, .07, -.3, .5, attack=3)
def silence(t0, t1): global M; M = [m for m in M if not (t0 - .2 <= m['t'] < t1)]

T = lambda fn, k=0: shot_t(fn)[k]
# opening: almost nothing; a bowed vibraphone and harp after the silence
n(10.0, 'vibraphone_bowed', 'A3', 8, .18, -.2, attack=2); n(14, 'vibraphone_bowed', 'D4', 9, .16, .2, attack=2); n(18.6, 'contrabass', 'D1', 5, .25, 0, attack=1)
harp_arps(18.6, 23.6, CH_D, .2)
walk(23.6, 43.9, CH_F, .38); n(T('O.mission') + 1.2, 'trumpet_mute', 'C5', 1.2, .3, .2); n(T('O.mission') + 2.6, 'trumpet_mute', 'F5', 2, .3, .2)
n(T('O.timeDial') + 2.9, 'tubular_bells', 'F4', 4, .5, 0, .8)
pad(43.9, 76.4, CH_F); harp_arps(43.9, 76.4, CH_F, .22); theme(T('O.mapScene') + 3, 'piano', .32)
pad(76.4, 106.2, CH_F, (('violins', .14), ('violas', .16), ('cellos', .18))); harp_arps(76.4, 106.2, CH_F, .2); theme(80, 'clarinet', .3, 0, -.2)
pad(106.2, 134.4, CH_D);
for k, t in bars(108.9, 134.4, 2): n(t, 'piano', ['D5', 'F5', 'A5', 'E5'][k % 4], B, .18, .3)
walk(134.4, 162.6, CH_D, .32, snare=False); theme(150, 'bassoon', .28, -1, -.2)
pad(162.6, 212.1, CH_D, (('violas', .14), ('cellos', .16))); harp_arps(162.6, 212.1, CH_D, .16, 4)
# giants: horns and trombones, timpani on footfalls
for k, t in bars(212.1, 271.5, 8):
    c = CH_F[k % 4]
    n(t, 'horn', c[2], 8 * B, .26, -.2, attack=.8); n(t, 'horn', c[3], 8 * B, .24, .2, attack=.8); n(t, 'trombone', c[1], 8 * B, .22, 0, attack=.8); n(t, 'tuba', c[0], 8 * B, .22, 0, attack=.8)
    n(t, 'timpani', c[0].replace('1', '2'), 2, .3, 0, .8)
theme(222, 'horn', .3, -1, .1)
# hunters
tension(271.5, 351.5); silence(279.9, 281.6); n(281.65, 'timpani', 'D2', 3, .7); n(281.65, 'contrabass', 'D1', 3, .5, attack=.01); n(281.65, 'trombone', 'D2', 2.5, .45)
for k, t in bars(294, 344, 4): n(t, 'piano', ['D3', 'A3', 'F3', 'E3'][k % 4], 4 * B, .2, -.2)
tension(352, 405.7, .28)
for k in range(int((T('P.firingLine') + 6 - 352) / B)): pass
pad(405.7, 446.6, CH_D, (('violas', .12), ('cellos', .14))); harp_arps(405.7, 446.6, CH_D, .14, 4)
tension(446.6, 520.6, .3); silence(479.6, 481.0); n(481.1, 'timpani', 'A1', 2.5, .6); n(481.1, 'cellos', 'D2', 2, .4); n(481.1, 'horn', 'D3', 2, .35)
walk(520.6, 542.0, CH_D, .26, snare=False)
eerie(542.0, 599.6); silence(596.4, 597.8); n(597.85, 'tubular_bells', 'D5', 4, .4, 0, .7); n(597.85, 'glockenspiel', 'A6', 3, .25)
pad(599.6, 622.3, CH_F, (('violins', .14), ('violas', .16), ('cellos', .18))); harp_arps(599.6, 622.3, CH_F, .2)
pad(622.3, DUR - 2, CH_F, (('violins', .2), ('violas', .2), ('cellos', .22), ('contrabass', .2))); harp_arps(622.3, DUR - 2, CH_F, .24, 2)
theme(624, 'horn', .34, 0, -.1); theme(624 + 16 * B, 'clarinet', .3, 0, .2); theme(624 + 32 * B, 'violins', .26, 0, .2)
n(DUR - 6, 'tubular_bells', 'F4', 6, .45, 0, .8); [n(DUR - 6, 'piano', p, 5.5, .35) for p in ['F1', 'F2', 'C3', 'A3', 'F4']]
print('score events', len(M), flush=True)
MUS = S.render(M, dur=DUR + .5)
MUS = S.room(MUS, size=.5, mix=.2)[:N]
if len(MUS) < N: MUS = np.pad(MUS, ((0, N - len(MUS)), (0, 0)))

# ============ FOLEY ============
FX = buf()
def bed(sig, t0, t1, gain, fade=.8, pan=0):
    d = t1 - t0
    if d <= .2: return
    x = sig(d); n_ = len(x); f = min(int(fade * SR), n_ // 3)
    e = np.ones(n_); e[:f] = np.linspace(0, 1, f); e[-f:] = np.linspace(1, 0, f)
    add(FX, (x * e).astype(np.float32), t0, gain, pan)
def wind(d): return norm(bp(brown(d) + noise(d) * .04, 180, 1400)) * (.75 + .25 * np.sin(2 * np.pi * .13 * t_(d)))
def insects(d): tt = t_(d); return norm(bp(noise(d), 4200, 6400) * (.5 + .5 * np.sin(2 * np.pi * 11 * tt)) ** 2)
def crickets(d):
    tt = t_(d); x = np.sin(2 * np.pi * 4300 * tt) * ((np.sin(2 * np.pi * 18 * tt) > .2) * (np.sin(2 * np.pi * .9 * tt) > -.3)); return norm(x * .6 + bp(noise(d), 3000, 6000) * .1)
def water(d): return norm(bp(noise(d), 300, 2500) * (.6 + .4 * np.abs(np.sin(2 * np.pi * 1.7 * t_(d) + np.sin(2 * np.pi * .3 * t_(d))))) + lp(brown(d), 300) * .4)
def tick(): d = .05; return norm(hp(noise(d), 3000) * env_exp(d, .003) + np.sin(2 * np.pi * 3400 * t_(d)) * env_exp(d, .01) * .4)
def chunk(big=0):
    d = .3; x = lp(noise(d), 1800) * env_exp(d, .03) + np.sin(2 * np.pi * (90 if big else 140) * t_(d)) * env_exp(d, .06); x[:int(.012 * SR)] += hp(noise(.012), 3000) * 1.5; return norm(x)
def door(close=1):
    d = .7; tt = t_(d); x = lp(brown(d), 300) * np.sin(np.pi * np.minimum(1, tt / .5)) ** 2 * .6
    if close: s = int(.42 * SR); x[s:] += thump(1, 60)[:len(x) - s]
    return norm(x)
def footfall(f=36): d = 1.0; tt = t_(d); return norm(np.sin(2 * np.pi * f * tt * (1 - .2 * tt)) * env_exp(d, .25) + lp(noise(d), 140) * env_exp(d, .12))
def call(d=3.0):   # low rumbling sauropod call (no living person has heard it): infrasonic-ish moan
    tt = t_(d); f = 48 + 10 * np.sin(np.pi * tt / d); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + .5 * np.sin(2 * ph) + .25 * np.sin(3 * ph + 1); x *= np.sin(np.pi * tt / d) ** 1.5
    return norm(lp(x + lp(brown(d), 200) * .3, 400))
def growl(d=1.6):
    tt = t_(d); f = 70 + 20 * np.sin(2 * np.pi * 3 * tt); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sign(np.sin(ph)) * .4 + bp(noise(d), 200, 900) * (.6 + .4 * np.sin(2 * np.pi * 23 * tt)); x = bp(x, 80, 1200)
    return norm(x * np.sin(np.pi * np.minimum(1, tt / d)) ** .7 * np.minimum(1, (d - tt) / .3))
def shot(): d = .5; x = hp(noise(d), 600) * env_exp(d, .025) + lp(noise(d), 300) * env_exp(d, .12) * .8; return norm(lp(x, 4000))
def squelch(): d = .35; return norm(bp(noise(d), 800, 3000) * env_exp(d, .15)) * .6
def bell(): return ding(1)
def heat(d): return norm(hp(noise(d), 5000) * .4 + bp(noise(d), 2000, 3000) * (.5 + .5 * np.sin(2 * np.pi * 31 * t_(d))) ** 4)

WORLD = {'O.fernForest', 'O.distantCall', 'O.eyes', 'M.calmPlain', 'M.plantTrack', 'M.missing', 'M.heat', 'M.river', 'M.bigFoot', 'G.giantsLow', 'G.peaceful', 'G.footfall',
         'P.nightCamp', 'P.alloReveal', 'P.lesson', 'P.firingLine', 'P.ambush', 'P.stego', 'P.closeRange', 'E.day5', 'E.flip', 'E.day7', 'E.bones', 'E.farewell'}
NIGHT = {'O.eyes', 'P.nightCamp', 'P.alloReveal'}
RIVER = {'M.river', 'M.calmPlain', 'G.peaceful', 'P.lesson', 'P.stego', 'E.day7', 'E.farewell', 'P.nightCamp'}
for e in shots:
    t0, t1, fn = e['t'], e['t'] + e['dur'], e['fn']
    if fn == 'O.fernDraw': bed(wind, .3, t1 + .5, .08)
    if fn in WORLD:
        bed(wind, t0 - .4, t1 + .4, .06)
        bed(crickets if fn in NIGHT else insects, t0 - .3, t1 + .3, .03 if fn in NIGHT else .02, pan=.3)
        if fn in RIVER: bed(water, t0 - .3, t1 + .3, .05, pan=-.2)
        if fn == 'M.heat': bed(heat, t0, t1, .03)
    if e['tr'] == 'doors': add(FX, door(1), t0 - .45, .35); add(FX, door(0), t0, .3)
    elif e['tr'] in ('arch', 'iris'): add(FX, whoosh(.6, 1), t0, .1)
# specific sounds on the picture's own moments
add(FX, call(3.2), st(6) + .4, .5); add(FX, call(2.6), st(6) + 3.6, .25, .3)
for i in range(100):   # the hundred, counted
    ti = T('O.formation') + .4 + (min(e['dur'] for e in shots if e['fn'] == 'O.formation') - 1 - .4) * (i / 99) ** .8
    add(FX, tick(), ti, .08, (i % 10 - 4.5) / 6)
add(FX, squelch(), marks['O.kit'][2], .25, .3)
for k in range(14): add(FX, chunk(0), marks['O.mission'][0] + k * .07, .1)
for k in range(7): add(FX, chunk(1), marks['O.mission'][0] + .9 + k * .1, .2)
for e in ev:
    if e['type'] == 'day': add(FX, chunk(1), e['t'] + .9, .3); add(FX, bell(), e['t'] + 1.0, .12)
for fn in ('M.board', 'G.board'):
    for t0 in shot_t(fn): add(FX, chunk(1), t0 + .35, .35)
add(FX, chunk(1), T('E.day5') + 3.6, .35); add(FX, chunk(1), T('E.infection') + .25, .35)
for t0 in shot_t('G.giantsLow') + shot_t('G.peaceful') + shot_t('E.day7'):
    for k in range(8): add(FX, footfall(32), t0 + 1 + k * 1.6, .18, (k % 2 - .5) * .4)
add(FX, footfall(30), marks['M.bigFoot'][1] + .2, .9); add(FX, footfall(30), marks['G.footfall'][0] + .3, 1.0)
add(FX, growl(1.4), T('P.alloReveal') + .4, .6); add(FX, growl(1.8), marks['P.ambush'][1] + 1.4, .7, .3); add(FX, growl(1.0), marks['P.firingLine'][0] + 6, .4, .4)
for k in range(46): add(FX, tick(), marks['P.count46'][1] + 3.2 * k / 45, .15, (k % 12 - 5.5) / 8)
fl = T('P.firingLine'); a, b = marks['P.firingLine'][0] + .5, marks['P.firingLine'][1] + .5
tt = a
while tt < b: add(FX, shot(), tt, .1 + .08 * rng.random(), (rng.random() - .5) * 1.2); tt += .07 + rng.random() * .12
for k in range(19): add(FX, tick(), marks['P.bigAl'][7] + 3.2 * k / 18, .12)
add(FX, whoosh(.5, 1), marks['G.tailWhip'][0] + 1.45, .3); add(FX, whoosh(.5, 1), marks['G.tailWhip'][3] + .65, .3)
add(FX, whoosh(.7, 1), marks['P.stego'][4] + .1, .35); add(FX, chunk(1), marks['P.spikeMatch'][2] + 1.6, .4)
add(FX, door(1), DUR - 3.2, .3)

def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-9)
vo_r = rms(VO[np.abs(VO[:, 0]) > 1e-3])
mus = MUS * (vo_r / rms(MUS[np.abs(MUS[:, 0]) > 1e-4]) * 10 ** (-12 / 20)) * duck[:, None]
fx = FX * duck[:, None] ** .4
y = (VO + fx + mus).astype(np.float32)
for c in range(2): y[:, c] = limit(y[:, c], .95)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), y[:int(DUR * SR)], SR)
print('mix written', DUR)
print(S.credits(sorted({m['inst'] for m in M})))
