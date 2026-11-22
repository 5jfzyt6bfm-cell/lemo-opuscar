"""Align a script to its narration without a speech model.
  python align.py script.txt narration.mp3 OUT_DIR   ->  OUT_DIR/words.json, OUT_DIR/sentences.json
Pauses come from the waveform; sentence boundaries are matched to pauses by dynamic programming on spoken length;
words inside a sentence are spread over its voiced time by spoken length.
  python align.py  ->  words.json, sentences.json (next to this file)"""
import json, os, re, subprocess, math, sys
import numpy as np

if len(sys.argv) != 4: sys.exit('usage: python align.py script.txt narration.mp3 OUT_DIR')
SCRIPT, MP3, HERE = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(HERE, exist_ok=True)
SR = 16000
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', MP3, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
HOP = 160                                                   # 10 ms frames
n = len(x) // HOP
rms = np.sqrt((x[:n * HOP].reshape(n, HOP) ** 2).mean(1) + 1e-10)
db = 20 * np.log10(rms)
db = np.convolve(db, np.ones(3) / 3, 'same')
floor = np.percentile(db, 8); peak = np.percentile(db, 95)
thr = floor + .32 * (peak - floor)
voiced = db > thr
# close gaps shorter than 90 ms (stop consonants), drop blips shorter than 60 ms
def runs(b):
    d = np.diff(np.concatenate([[0], b.astype(int), [0]])); return list(zip(np.where(d == 1)[0], np.where(d == -1)[0]))
for s, e in runs(~voiced):
    if e - s < 9: voiced[s:e] = True
for s, e in runs(voiced):
    if e - s < 6: voiced[s:e] = False
segs = [(s / 100, e / 100) for s, e in runs(voiced)]       # speech intervals in seconds
T0, T1 = segs[0][0], segs[-1][1]
pauses = [(segs[i][1], segs[i + 1][0]) for i in range(len(segs) - 1)]
print(f'speech {T0:.2f}-{T1:.2f}s, {len(segs)} voiced runs, {len(pauses)} pauses, thr {thr:.1f} dB (floor {floor:.1f}, peak {peak:.1f})')

# —— text ——
text = open(SCRIPT).read().strip()
paras = [p.strip() for p in text.split('\n\n') if p.strip()]
NUM = {'2': 'two', '1': 'one', '15': 'fifteen'}
def spoken_len(w):
    core = re.sub(r"[^\w']", '', w)
    if re.fullmatch(r'\d{4}s?', core): return 15 + (2 if core.endswith('s') else 0)       # years: "nineteen sixty-six"
    if re.fullmatch(r'\d+', core): return 5 * len(core)
    if w.lower().strip('.,') in ('a.m', 'a.m.'): return 4
    return len(re.sub(r"[^A-Za-zÀ-ÿ']", '', core)) + 1.2      # + a little per word for the gap between words
SENTS = []
for pi, p in enumerate(paras):
    p2 = p.replace('Ms.', 'Ms․')                         # protect the abbreviation
    out, cur = [], ''
    toks = p2.split(' ')
    for i, tk in enumerate(toks):
        cur += (' ' if cur else '') + tk
        nxt = toks[i + 1] if i + 1 < len(toks) else None
        end = re.search(r'[.?!]["”]?$', tk) and (nxt is None or re.match(r'["“]?[A-Z0-9]', nxt)) and not tk.endswith('a.m.') or (tk.endswith('a.m.') and nxt and nxt[0].isupper())
        if end or nxt is None: out.append(cur); cur = ''
    for s in out:
        s = s.replace('Ms․', 'Ms.')
        words = s.split(' ')
        SENTS.append({'para': pi, 'text': s, 'words': words, 'len': sum(spoken_len(w) for w in words)})
N = len(SENTS)
print(N, 'sentences in', len(paras), 'paragraphs')

# —— DP: sentence boundaries -> pauses ——
P = len(pauses)
pst = np.array([p[0] for p in pauses]); pen = np.array([p[1] for p in pauses]); pdur = pen - pst
# node k: 0 = speech start, 1..P = pause k-1, P+1 = speech end. A sentence spans from node a's end to node b's start.
node_end = np.concatenate([[T0], pen, [T1]]); node_start = np.concatenate([[T0], pst, [T1]])
cum_pause = np.concatenate([[0], np.cumsum(pdur), [np.sum(pdur)]])    # pauses fully before node k (exclusive of k)
def voiced_between(a, b):   # voiced time from end of node a to start of node b
    span = node_start[b] - node_end[a]
    inner = cum_pause[b - 1] - cum_pause[a] if b - 1 > a else 0.0     # pauses a+1 .. b-1 (node indices) fully inside
    return span - inner
total_voiced = sum(e - s for s, e in segs); rate = total_voiced / sum(s['len'] for s in SENTS)
INF = 1e18
cost = np.full((N + 1, P + 2), INF); back = np.zeros((N + 1, P + 2), int)
cost[0, 0] = 0
big = np.maximum(0, pdur - .55)                             # long pauses inside a sentence are suspicious
cum_big = np.concatenate([[0], np.cumsum(big), [np.sum(big)]])
for i in range(1, N + 1):
    S = SENTS[i - 1]; pred = rate * S['len']
    last = i == N
    para_end = last or SENTS[i]['para'] != S['para']
    for b in ([P + 1] if last else range(1, P + 1)):
        bonus = 0.0 if last else -(1.6 if para_end else .7) * min(pdur[b - 1], 1.2)
        best, arg = INF, -1
        for a in range(max(0, b - 60), b):
            if cost[i - 1, a] >= INF: continue
            v = voiced_between(a, b)
            if v <= .05: continue
            r = math.log(v / pred)
            if abs(r) > 1.1: continue
            inner_big = cum_big[b - 1] - cum_big[a] if b - 1 > a else 0
            c = cost[i - 1, a] + 4 * r * r * math.sqrt(S['len'] / 30) + 2.5 * inner_big + bonus
            if c < best: best, arg = c, a
        cost[i, b] = best; back[i, b] = arg
assert cost[N, P + 1] < INF, 'alignment failed'
path = [P + 1]
for i in range(N, 0, -1): path.append(back[i, path[-1]])
path = path[::-1]                                              # node index of each boundary, len N+1

# —— words: spread over the voiced time of each sentence ——
def voiced_runs(t0, t1): return [(max(s, t0), min(e, t1)) for s, e in segs if e > t0 and s < t1]
WORDS, ratios = [], []
for i, S in enumerate(SENTS):
    t0, t1 = node_end[path[i]], node_start[path[i + 1]]
    S['t0'], S['t1'] = round(float(t0), 3), round(float(t1), 3)
    R = voiced_runs(t0, t1); tot = sum(e - s for s, e in R)
    ratios.append(tot / (rate * S['len']))
    lens = [spoken_len(w) for w in S['words']]; c = np.concatenate([[0], np.cumsum(lens)]) / sum(lens) * tot
    def at(v):          # voiced-time offset -> clock time
        for s, e in R:
            if v <= e - s + 1e-9: return s + v
            v -= e - s
        return R[-1][1]
    for k, w in enumerate(S['words']):
        WORDS.append({'w': w, 't0': round(at(c[k] + 1e-4), 3), 't1': round(at(c[k + 1]), 3), 's': i, 'p': S['para']})
ratios = np.array(ratios)
print(f'voiced/predicted per sentence: median {np.median(ratios):.2f}, 5-95% {np.percentile(ratios, 5):.2f}-{np.percentile(ratios, 95):.2f}')
for i in np.argsort(np.abs(np.log(ratios)))[-6:]: print(f'  outlier {ratios[i]:.2f}  {SENTS[i]["t0"]:.1f}s  {SENTS[i]["text"][:60]}')
json.dump(WORDS, open(os.path.join(HERE, 'words.json'), 'w'), ensure_ascii=False)
json.dump([{k: S[k] for k in ('para', 'text', 't0', 't1')} for S in SENTS], open(os.path.join(HERE, 'sentences.json'), 'w'), ensure_ascii=False, indent=0)
print('paragraph starts:', ' '.join(f'{S["t0"]:.0f}' for j, S in enumerate(SENTS) if j == 0 or SENTS[j - 1]['para'] != S['para']))
