# Fallback voice check (Whisper's model host is unreachable here): CMU PocketSphinx, bundled US-English model.
# Reports the transcript next to the script and a word-overlap score per line. Coarse: a sanity check, not a strict pass.
import json, sys, re, os, numpy as np, soundfile as sf
from scipy.signal import resample_poly
from pocketsphinx import Decoder
D = os.path.dirname(os.path.abspath(__file__))
lines = json.load(open(os.path.join(D, 'lines.json')))
dec = Decoder(samprate=16000)
norm = lambda s: re.findall(r"[a-z']+", s.lower())
tot = []
for L in lines:
    x, sr = sf.read(os.path.join(D, 'voices', L['id'] + '.wav'))
    if x.ndim > 1: x = x.mean(1)
    x = resample_poly(x, 16000, sr); pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()
    dec.start_utt(); dec.process_raw(pcm, full_utt=True); dec.end_utt()
    hyp = dec.hyp().hypstr if dec.hyp() else ''
    ref, h = norm(L['text']), set(norm(hyp))
    sc = sum(w in h for w in ref) / len(ref); tot.append(sc)
    print(f"{L['id']} {sc:.2f} | {L['text']}\n      heard: {hyp}")
print('mean', round(sum(tot) / len(tot), 2))
