# Word timings for the user's voiceover: PocketSphinx recognition (offline) with word times, then a sequence match
# against the known script; unmatched script words are interpolated between matched neighbours. → words.json
import json, os, sys, re, difflib, numpy as np, soundfile as sf
from pocketsphinx import Decoder
from norm import words
HERE = os.path.dirname(os.path.abspath(__file__))
OOV = {
 'allosaurus': 'AE L AH S AO R AH S', 'apatosaurus': 'AH P AE T AH S AO R AH S', 'brachiosaurus': 'B R AE K IY AH S AO R AH S',
 'breathable': 'B R IY DH AH B AH L', 'calibers': 'K AE L AH B ER Z', 'ceratosaurus': 'S EH R AE T AH S AO R AH S',
 'diplodocus': 'D IH P L AA D AH K AH S', 'floodplains': 'F L AH D P L EY N Z', 'ginkgo': 'G IH NG K OW',
 'ornitholestes': 'AO R N IH TH AH L EH S T IY Z', 'sauropod': 'S AO R AH P AA D', 'sauropods': 'S AO R AH P AA D Z',
 'torvosaurus': 'T AO R V AH S AO R AH S'}
txt = open(os.path.join(HERE, 'script.txt')).read()
parts = dict(zip('abc', re.split(r'@@[BC]\n', txt)))
d = Decoder(samprate=16000)
for w, ph in OOV.items(): d.add_word(w, ph, True)
out = []
for p in 'abc':
    x, sr = sf.read(os.path.join(HERE, 'vo', p + '.wav'))
    # cut at pauses into ≤ 25 s chunks
    fr = int(.02 * sr); e = np.array([np.sqrt(np.mean(x[i:i + fr] ** 2)) for i in range(0, len(x) - fr, fr)])
    quiet = e < max(1e-4, np.percentile(e, 20) * 2)
    cuts = [0]; i = 0
    while i < len(e):
        if i * .02 - cuts[-1] > 12 and quiet[i]:
            j = i
            while j < len(e) and quiet[j]: j += 1
            if (j - i) * .02 > .15 or i * .02 - cuts[-1] > 25: cuts.append((i + j) / 2 * .02); i = j; continue
        i += 1
    cuts.append(len(x) / sr)
    hyp = []
    for a, b in zip(cuts, cuts[1:]):
        s = x[int(a * sr):int(b * sr)]
        d.start_utt(); d.process_raw((np.clip(s, -1, 1) * 32767).astype(np.int16).tobytes(), full_utt=True); d.end_utt()
        for sg in d.seg():
            w = re.sub(r'\(\d+\)', '', sg.word)
            if w.startswith('<') or w.startswith('[') or w == '<sil>': continue
            hyp.append((w, a + sg.start_frame / 100, a + (sg.end_frame + 1) / 100))
    W = words(parts[p])
    sm = difflib.SequenceMatcher(None, W, [h[0] for h in hyp], autojunk=False)
    T = [None] * len(W)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size): T[blk.a + k] = hyp[blk.b + k][1:]
    known = [i for i, v in enumerate(T) if v]
    print(p, 'script', len(W), 'heard', len(hyp), 'matched', len(known), f'{len(known) / len(W):.0%}', file=sys.stderr)
    end = len(x) / sr
    for i in range(len(W)):
        if T[i] is None:
            lo = max([k for k in known if k < i], default=None); hi = min([k for k in known if k > i], default=None)
            ta = T[lo][1] if lo is not None else 0; tb = T[hi][0] if hi is not None else end
            na = lo if lo is not None else -1; nb = hi if hi is not None else len(W)
            u0 = (i - na - 1) / (nb - na - 1); u1 = (i - na) / (nb - na - 1)
            T[i] = (ta + (tb - ta) * u0, ta + (tb - ta) * u1)
        out.append({'w': W[i], 't0': round(T[i][0], 3), 't1': round(T[i][1], 3), 'part': p})
json.dump(out, open(os.path.join(HERE, 'words.json'), 'w'))
