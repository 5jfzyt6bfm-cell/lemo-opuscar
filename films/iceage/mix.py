"""Voice (the user's recording), score and foley for the Ice Age film → out/mix.wav. Times from events.json + sents.json."""
import os, sys, json, subprocess
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add, limit, noise, t_, env_exp, lp, hp, bp, brown, norm, whoosh, thump, ding, rumble
from scipy.ndimage import maximum_filter1d, uniform_filter1d

S.seed(8)
EV = json.load(open(os.path.join(HERE, 'events.json'))); DUR = EV['dur']; ev = EV['ev']
SN = json.load(open(os.path.join(HERE, 'sents.json'))); OFF = SN['off']; SENT = SN['sents']
N = int((DUR + .5) * SR)
def buf(): return np.zeros((N, 2), np.float32)
rng = np.random.default_rng(4)
shots = [e for e in ev if e['type'] == 'shot']
T = {}
for e in shots: T.setdefault(e['fn'], e['t'])
END = {e['fn']: e['t'] + e['dur'] for e in shots}
marks = {}
for e in ev:
    if e['type'] == 'mark': marks.setdefault(e['fn'], []).append(e['t'])
st = lambda i: SENT[i]['t0']
VOEND = next(e['t'] for e in ev if e['type'] == 'voend')

# ============ VOICE ============
FF = os.path.join(HERE, '..', 'mesozoic', 'bin', 'ffmpeg')
if not os.path.exists(FF): FF = 'ffmpeg'
raw = subprocess.run([FF, '-v', 'error', '-i', os.path.join(HERE, 'vo_src', 'voice.mp3'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
VO = buf(); x = hp(np.frombuffer(raw, np.float32).astype(np.float64), 70); add(VO, x.astype(np.float32), OFF['a'], 1.0, 0)
v = np.abs(VO[:, 0]); VO *= .5 / max(1e-6, np.percentile(v[v > .01], 99))
env = uniform_filter1d(maximum_filter1d(np.abs(VO[:, 0]), int(.1 * SR)), int(.2 * SR))
duck = 1 - .7 * np.clip(env / (env.max() * .2), 0, 1)

# ============ SCORE ============
B = 60 / 76
M = []
def n(t, inst, p, d, v, pan=0, g=1, **k):
    if 0 <= t < DUR: M.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, gain=g, **k))
CH_A = [['A1', 'E2', 'C3', 'E3', 'A3'], ['F1', 'C2', 'A2', 'C3', 'F3'], ['C2', 'G2', 'E3', 'G3', 'C4'], ['G1', 'D2', 'B2', 'D3', 'G3']]   # A minor, bright
CH_C = [['C2', 'G2', 'E3', 'G3', 'C4'], ['A1', 'E2', 'C3', 'E3', 'A3'], ['F1', 'C2', 'A2', 'C3', 'F3'], ['G1', 'D2', 'B2', 'D3', 'G3']]   # C major, warm
THEME = [('E5', 1), ('D5', .5), ('C5', .5), ('A4', 2), ('G4', 1), ('A4', 1), ('C5', 1), ('D5', 1), ('E5', 3), ('D5', 1)]
def bars(t0, t1, beats=4):
    k = 0
    while t0 + k * beats * B < t1 - .5: yield k, t0 + k * beats * B; k += 1
def pad(t0, t1, ch, insts=(('violas', .14), ('cellos', .16)), att=1.4):
    for k, t in bars(t0, t1, 8):
        c = ch[k % len(ch)]; d = min(8 * B, t1 - t) + .5
        for inst, v in insts:
            for p in (c[1:4] if inst != 'contrabass' else c[:1]): n(t, inst, p, d, v, (hash(p) % 7 - 3) / 8, attack=att)
def harp(t0, t1, ch, vel=.2, every=2):
    for k, t in bars(t0, t1, 4):
        if k % every: continue
        c = ch[(k // 2) % len(ch)]
        for i, p in enumerate(c[1:] + [S.name(S.midi(c[2]) + 12)]): n(t + i * B / 3, 'harp', p, 2, vel, -.3)
def celesta(t0, t1, notes=('E6', 'C6', 'A5', 'G5'), vel=.14):
    for k, t in bars(t0, t1, 4): n(t + B * 2, 'glockenspiel', notes[k % len(notes)], 2, vel, .3, .6)
def theme(t0, inst, vel=.32, oct=0, pan=.2):
    tt = t0
    for p, b in THEME: n(tt, inst, S.name(S.midi(p) + 12 * oct), b * B * .95, vel, pan); tt += b * B
def low(t0, t1, vel=.26, timp=True, note='A1'):
    for k, t in bars(t0, t1, 2):
        n(t, 'cellos_spic', [note, note, 'C2', note][k % 4], B * .5, vel, -.2); n(t + B, 'cellos_spic', note, B * .5, vel * .8, -.2)
        if timp and k % 4 == 0: n(t, 'timpani', 'A1', 1.6, vel + .1, 0, .8)
    n(t0, 'contrabass', note.replace('2', '1') if note.endswith('2') else note, t1 - t0, .18, 0, .7, attack=1.5)
    n(t0, 'violins_trem', 'E5', t1 - t0, .08, .3, .5, attack=2)
def silence(t0, t1):
    global M; M = [m for m in M if not (t0 - .2 <= m['t'] < t1)]
def sec(a, b): return T[a], (T[b] if b in T else END[a])

# opening: frozen, glassy
n(1.0, 'vibraphone_bowed', 'A4', 7, .2, -.2, attack=2); n(4, 'vibraphone_bowed', 'E5', 8, .18, .2, attack=2); celesta(.5, T['lionGrow'])
pad(T['spartaFind'], T['nightCamp'], CH_A); harp(T['lionGrow'], T['nightCamp'], CH_A, .2); theme(T['humans'] + 1, 'clarinet', .3, 0, -.2)
low(T['nightCamp'], T['youArrive'], .18, timp=False)
pad(T['youArrive'], T['laToday'], CH_C, (('violins', .12), ('violas', .14), ('cellos', .16))); harp(T['youArrive'], T['laToday'], CH_C, .22)
# La Brea and the dire wolf: a walking pizzicato, curious
for k, t in bars(T['laToday'], T['protect'], 1):
    c = CH_C[(k // 4) % 4]; n(t, 'contrabass_pizz', [c[0], c[1]][k % 2], B * .9, .32, -.15)
    if k % 2: n(t, 'violins_pizz', c[3], B * .5, .2, .3)
theme(T['dna'] + 1, 'bassoon', .26, -1, -.2)
low(T['protect'], T['hyenaHero'], .24)
pad(T['hyenaHero'], T['clan'], CH_A, (('violas', .12), ('cellos', .14))); celesta(T['kirkdale'], T['den'], ('A5', 'E6', 'C6', 'B5'))
low(T['clan'], T['smiloHero'], .26)
# Smilodon: horns, weight
for k, t in bars(T['smiloHero'], T['healed'], 8):
    c = CH_A[k % 4]; n(t, 'horn', c[2], 8 * B, .24, -.2, attack=.8); n(t, 'horn', c[3], 8 * B, .22, .2, attack=.8); n(t, 'trombone', c[1], 8 * B, .2, 0, attack=.8); n(t, 'timpani', 'A1', 1.8, .26, 0, .8)
pad(T['healed'], T['yakutia'], CH_A, (('violas', .12), ('cellos', .14))); harp(T['healed'], T['yakutia'], CH_A, .16, 4)
# Homotherium cub: frozen glass again
n(T['yakutia'], 'vibraphone_bowed', 'E4', 10, .2, 0, attack=2); celesta(T['yakutia'], T['homoHunt'], ('E6', 'B5', 'G5', 'A5'))
pad(T['homoCompare'], T['homoHunt'], CH_A)
low(T['homoHunt'], T['spartaBack'], .28); silence(st(116) - 1.4, st(116)); n(st(116) + .05, 'timpani', 'A1', 3, .6); n(st(116) + .05, 'contrabass', 'A1', 3, .4)
pad(T['spartaBack'], T['chauvet'], CH_C); harp(T['spartaBack'], T['chauvet'], CH_C, .2)
# Chauvet: warm, human
pad(T['chauvet'], T['vLion'], CH_C, (('violins', .12), ('violas', .14), ('cellos', .16))); theme(T['chauvet'] + 2, 'clarinet', .3, 0, -.2); harp(T['chauvet'], T['vLion'], CH_C, .18)
low(T['vLion'], T['bearRise'], .26); silence(st(135) - 1.2, st(135)); n(st(135) + .05, 'timpani', 'A1', 3, .55)
# the bear: brass and timpani, then the debate (lighter)
for k, t in bars(T['bearRise'], T['bearNew'], 8):
    c = CH_A[k % 4]; n(t, 'tuba', c[0], 8 * B, .24, attack=.6); n(t, 'trombone', c[1], 8 * B, .22, attack=.6); n(t, 'horn', c[2], 8 * B, .22, attack=.6); n(t, 'timpani', 'A1', 2, .3)
pad(T['bearNew'], T['vBear'], CH_A, (('violas', .12), ('cellos', .14)))
low(T['vBear'], T['none'], .3)
pad(T['none'], T['stayed'], CH_A, (('cellos', .14),))
# the turn: we stayed (after a silence), the theme in full
silence(st(162) - 1.6, st(162)); n(st(162) + .05, 'tubular_bells', 'C5', 4, .4, 0, .8)
pad(st(162), T['vanish'], CH_C, (('violins', .16), ('violas', .18), ('cellos', .2), ('contrabass', .16))); theme(st(163), 'horn', .32, -1, -.1); harp(st(162), T['vanish'], CH_C, .24)
pad(T['vanish'], T['why'], CH_A, (('violas', .12), ('cellos', .14)))
pad(T['why'], T['spartaEnd'], CH_C, (('violins', .14), ('violas', .16), ('cellos', .18))); theme(T['standing'], 'clarinet', .3, 0, .2)
n(T['spartaEnd'], 'vibraphone_bowed', 'A4', 8, .2, -.2, attack=2); celesta(T['spartaEnd'], T['coda'], ('E6', 'C6', 'A5', 'E5'))
# coda: the full theme for the last lines, ending on a bell
pad(T['coda'], DUR - 1, CH_C, (('violins', .2), ('violas', .2), ('cellos', .22), ('contrabass', .2))); theme(T['coda'] + .5, 'violins', .3, 0, .1); harp(T['coda'], DUR - 2, CH_C, .24, 2)
n(DUR - 4, 'tubular_bells', 'C5', 4, .45, 0, .8)
print('score events', len(M), flush=True)
MUS = S.render(M, dur=DUR + .5); MUS = S.room(MUS, size=.55, mix=.22)[:N]
if len(MUS) < N: MUS = np.pad(MUS, ((0, N - len(MUS)), (0, 0)))

# ============ FOLEY ============
FX = buf()
def bed(sig, t0, t1, gain, fade=.8, pan=0):
    d = t1 - t0
    if d <= .3: return
    x = sig(d); n_ = len(x); f = min(int(fade * SR), n_ // 3); e = np.ones(n_); e[:f] = np.linspace(0, 1, f); e[-f:] = np.linspace(1, 0, f)
    add(FX, (x * e).astype(np.float32), t0, gain, pan)
def wind(d): return norm(bp(brown(d) + noise(d) * .05, 150, 1600)) * (.7 + .3 * np.sin(2 * np.pi * .11 * t_(d)))
def gust(d): return norm(hp(noise(d), 2500) * (.5 + .5 * np.sin(2 * np.pi * .3 * t_(d))) ** 2)
def water(d): return norm(bp(noise(d), 300, 2600) * (.6 + .4 * np.abs(np.sin(2 * np.pi * 1.5 * t_(d)))) + lp(brown(d), 300) * .4)
def fire(d):
    base = lp(brown(d), 500) * .5; cr = np.zeros(len(base))
    for _ in range(int(d * 14)): s = rng.integers(0, len(cr) - 2000); c = hp(noise(.008), 2000) * env_exp(.008, .001) * rng.random(); cr[s:s + len(c)] += c
    return norm(base + cr * 2)
def bubbles(d):
    out = np.zeros(len(t_(d)))
    for _ in range(int(d * 3)): s = rng.integers(0, len(out) - 9000); f = 80 + rng.random() * 90; dd = .15; c = np.sin(2 * np.pi * np.cumsum(np.linspace(f, f * 1.6, int(dd * SR))) / SR) * env_exp(dd, .05); out[s:s + len(c)] += c
    return norm(lp(out, 600) + lp(brown(d), 120) * .3)
def crickets(d): tt = t_(d); return norm(np.sin(2 * np.pi * 4300 * tt) * ((np.sin(2 * np.pi * 18 * tt) > .2) * (np.sin(2 * np.pi * .9 * tt) > -.3)) * .6 + bp(noise(d), 3000, 6000) * .1)
def howl(d=2.6, f0=420):
    tt = t_(d); f = f0 * (1 + .25 * np.sin(np.pi * tt / d)) * (1 + .01 * np.sin(2 * np.pi * 5 * tt)); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + .3 * np.sin(2 * ph) + bp(noise(d), f0, f0 * 3) * .05; return norm(x * np.sin(np.pi * tt / d) ** 1.2)
def whoop(d=.8):
    tt = t_(d); f = 300 + 500 * tt / d; ph = 2 * np.pi * np.cumsum(f) / SR; return norm((np.sin(ph) + .2 * np.sin(2 * ph)) * np.sin(np.pi * tt / d))
def growl(d=1.4, f0=60):
    tt = t_(d); f = f0 + 15 * np.sin(2 * np.pi * 3 * tt); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sign(np.sin(ph)) * .4 + bp(noise(d), 150, 900) * (.6 + .4 * np.sin(2 * np.pi * 21 * tt)); return norm(bp(x, 60, 1400) * np.sin(np.pi * np.minimum(1, tt / d)) ** .7 * np.minimum(1, (d - tt) / .3))
def roar(d=2.2): return norm(growl(d, 90) * .7 + lp(brown(d), 300) * np.sin(np.pi * t_(d) / d) * .5)
def step_snow(): d = .18; return norm(hp(noise(d), 1500) * env_exp(d, .03) + lp(noise(d), 600) * env_exp(d, .05) * .5)
def pick(): d = .4; tt = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * tt) * env_exp(d, tau) for f, a, tau in [(1800, 1, .05), (3200, .6, .03), (700, .4, .08)]) + hp(noise(d), 2000) * env_exp(d, .01))
def scratch(d=1.2): return norm(bp(noise(d), 1500, 5000) * (.4 + .6 * np.abs(np.sin(2 * np.pi * 3 * t_(d)))))
def shimmer(d=1.1):   # soft harp-like sweep for the smooth transitions
    out = np.zeros(len(t_(d)))
    for i, f in enumerate([523, 659, 784, 1047, 1319]): s = int(i * .09 * SR); x = np.sin(2 * np.pi * f * t_(.9)) * env_exp(.9, .3); out[s:s + len(x)] += x[:len(out) - s]
    return norm(out) * .6
def stamp(): d = .35; return norm(lp(noise(d), 600) * env_exp(d, .04) + np.sin(2 * np.pi * 70 * t_(d)) * env_exp(d, .08))

OUT = {'sparta0', 'spartaFind', 'lionGrow', 'humans', 'nightCamp', 'youArrive', 'tarTrap', 'wolfHero', 'protect', 'pack', 'hyenaHero', 'den', 'clan', 'smiloHero', 'pin', 'yakutia', 'homoHunt', 'spartaBack', 'bearMyth', 'stayed', 'why', 'standing', 'spartaEnd', 'bearNew'}
for e in shots:
    t0, t1, fn = e['t'], e['t'] + e['dur'], e['fn']
    if fn in OUT: bed(wind, t0 - .5, t1 + .5, .06); bed(gust, t0, t1, .015, pan=.3)
    if fn in ('sparta0', 'spartaFind', 'yakutia', 'spartaBack'): bed(water, t0 - .3, t1 + .3, .05, pan=.4)
    if fn in ('nightCamp', 'stayed', 'chauvet', 'buckland', 'coda'): bed(fire, t0 - .3, t1 + .3, .07 if fn != 'chauvet' else .05, pan=-.2)
    if fn == 'nightCamp': bed(crickets, t0, t1, .02)
    if fn in ('laToday', 'tarTrap'): bed(bubbles, t0 - .3, t1 + .3, .12)
    if e['tr'] != 'none' and e['t'] > 1: add(FX, shimmer(), t0 - .5, .06, (rng.random() - .5) * .6)
# moments
add(FX, howl(3.0, 400), T['wolfHero'] + 1.0, .12, -.4); add(FX, howl(2.6, 470), T['wolfHero'] + 2.4, .08, .4)
for k in range(5): add(FX, growl(1.0, 70), T['pack'] + 1 + k * 1.1, .12, (k % 3 - 1) * .5)
add(FX, howl(2.8, 380), T['pack'] + 5, .1, .2)
for k in range(3): add(FX, pick(), T['kirkdale'] + .4 + k * .45, .2, -.3)
for k in range(6): add(FX, whoop(.7 + .2 * (k % 2)), T['den'] + .8 + k * .9, .1, (k % 3 - 1) * .5)
for k in range(10): add(FX, whoop(.6), T['clan'] + .5 + k * .5, .06 + .02 * (k % 2), (rng.random() - .5) * 1.4)
add(FX, roar(2), T['smiloHero'] + .4, .25, .3); add(FX, roar(1.6), marks['pin'][0], .25)
add(FX, roar(2.2), T['lionGrow'] + 2.6, .2); add(FX, roar(2.4), T['bearRise'] + 1.4, .35); add(FX, roar(2), marks['bearNew'][1] + 1.5, .25, .3)
for fn in ('vWolf', 'vHyena', 'vSmilo', 'vHomo', 'vLion', 'vBear'): add(FX, stamp(), marks[fn][0], .4); add(FX, growl(1.2, 80), marks[fn][0] - .3, .15, .4)
for k in range(4): add(FX, scratch(1.0), T['chauvet'] + .3 + k * 1.2, .05, .3)
for e in shots:
    if e['fn'] in ('youArrive', 'protect', 'standing'):
        for k in range(4): add(FX, step_snow(), e['t'] + .4 + k * .45, .08, (k % 2 - .5) * .3)
add(FX, thump(1, 60), T['youArrive'] + 1.2, .3)

def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-9)
vo_r = rms(VO[np.abs(VO[:, 0]) > 1e-3])
mus = MUS * (vo_r / rms(MUS[np.abs(MUS[:, 0]) > 1e-4]) * 10 ** (-12 / 20))
mduck = duck.copy(); mduck[int(VOEND * SR):] = 1.0; mus = mus * mduck[:, None]
mus[int(VOEND * SR):] *= 10 ** (5 / 20)    # the coda has no voice: the score carries it
y = (VO + FX * duck[:, None] ** .4 + mus).astype(np.float32)
for c in range(2): y[:, c] = limit(y[:, c], .95)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), y[:int(DUR * SR)], SR)
print('mix written', DUR)
print(S.credits(sorted({m['inst'] for m in M})))
