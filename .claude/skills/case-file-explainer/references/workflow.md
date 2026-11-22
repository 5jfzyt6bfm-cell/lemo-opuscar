# Production workflow (what worked on four films)

Films made this way: a 15 s style test, "Attention That Won't Steer" (30 s), "The Second Phone" (12:16, the user's narration), "Seen by 11" (30 s), "What ADHD Feels Like" (60 s).

## Contents
1. Brief and treatment
2. Narration: aligning the user's recording to their script
3. The engine
4. Shot list
5. Captions
6. Sound
7. Render, master, deliver
8. Thumbnails
9. YouTube metadata
10. Checks

## 1. Brief and treatment
- Ask once (one message): the topic's facts and names, their own material (narration MP3, script, logo), language, length, frame (default 1920×1080, 24 fps). Fill every other gap yourself.
- Write `TREATMENT.md`: three candidate structures, your choice and why, the act colour worlds, recurring props, stamp list, counters, sound per act, the cast and their identifying props.
- Facts: every study named on screen goes in `FACTS.md` with the full reference. If you cannot open the source, say so to the user.

## 2. Narration (when the user gives an MP3 + script)
No speech model may be available. `scripts/align.py script.txt narration.mp3 OUT_DIR` aligns without one:
- voiced/silent runs from the waveform (10 ms RMS, adaptive threshold);
- sentence boundaries matched to pauses by dynamic programming on spoken length (digits and years expanded to spoken length; long pauses rewarded at paragraph ends);
- words spread over each sentence's voiced time by length.
Check the printout: voiced/predicted per sentence should have a median near 1.0 and a 5–95 % range of about 0.8–1.3; outliers are usually short dramatic lines read slowly. Tell the user: sentence starts are exact, words inside a sentence are estimated.
If Whisper (faster-whisper) is reachable, prefer real word timestamps.

## 3. The engine (`assets/engine/`)
Copy the folder into the film's project folder. Everything is a deterministic function of time.
- `index.html` loads `fonts/fonts.css` and the film's main module.
- `kit.js`: two canvases (picture + emitter), `composite()` (three-radius bloom + vignette), `bean()` (bean/stick figure: `thin`, `sit`, `step`, `face`, `look`, `eyes`, `brow`, `mouth`, `gape`, `happy`, `acc: 'hair'|'cap'|'glasses'|'scarf'|'clip'|'phones'`, `armL/armR` targets, mask colour for rim glow), `caption()` (built captions), `stamp()` (gradient stamp), `nightTown()`, `cork()`.
- `example-main.js`: a complete 60 s film with ten places. Reuse its patterns: `interior(temp, t, paths, {window})` line-art rooms with dust, `fig()` with rim glow, `emote()`, `bubble()`, `card()` floating chat cards, `headline()` with giant numbers, `readout()` clocks, `neon()`, the aerial house field, the crowd wall with a study counter, speech-as-light dots, dips to black (gaps in the shot list).
- The page contract: `window.render(t)`, `window.DUR`, `window.READY`, `window.EV` (sound events), `window.TEXTS(t)` (every visible text with its box, for the reading check).
- Long films: split sets into files (places, explanation sets), keep one shot list keyed to sentence indices and spoken words (`'@word'`, `'@N:word'`, `'+0.4'` offsets) resolved once at load.

## 4. Shot list
- One shot per sentence or per beat; average ≈ 2–4.5 s; a new place or framing every cut.
- Every pop-in (card, bubble, rule, node, stamp) lands on the word that names it.
- Stamps hold across the next cut (≥ 2.8 s) so they can be read.
- Scale moves at chapter ends: one window → building; one house → aerial field; one person → crowd + counter.

## 5. Captions
- With a voice: 1–3-word chunks (break at punctuation, ≤ 16 characters), each shown from its first word to the next chunk; one accent word per chunk from a keyword list (red = danger/contradiction, orange = names/objects, yellow = feelings/times).
- Without a voice: words build the whole line and hold for reading time (letters ÷ 15 + 1.5 s).
- Also export an `.srt` (sentence cues ≤ 84 characters, 2 lines of ≤ 42).

## 6. Sound
- `mix.py`: no narrator; pad chords per act, plucks, foley from `EV`.
- `mix_voice.py FILM_DIR`: narration levelled and gently compressed, score per act mood ducked ≈ 6 dB under the voice and ≈ 16 dB below it overall, foley on events, `hush` near-silence before a climax, `release` swell on the turning line.
- Keep the 20–120 Hz band ≈ −3 dB against the rest.

## 7. Render, master, deliver
- Render: `node scripts/render/video.mjs FILM_DIR --fps 24 --workers 5 --out FILM_DIR/out/video.mp4` (≈ 16 fps total on 5 workers; a 12-minute film ≈ 16 minutes).
- Stills / contact sheets: `scripts/render/still.mjs FILM_DIR t1 t2 …`, `scripts/render/sheet.py`.
- Reading check: `scripts/render/readcheck.mjs FILM_DIR` (use `--step 0.25` on long films).
- Master: `sh scripts/master.sh video.mp4 mix.wav out.mp4 [grain]` (two-pass loudnorm to −14 LUFS, limiter, grain, x264/AAC). Grain 3 makes files large: a 12-minute film was 240 MB, too big for a phone download. Always also deliver a small copy: `-tune animation -crf 27` from the grain-free render (1080p ≈ 54 MB / 12 min, 720p ≈ 36 MB).
- The cloud container is temporary: offer to commit sources (not the large MP4) to the user's branch.

## 8. Thumbnails (1280×720)
Render with the engine at 1920×1080, scale down. Rules that worked:
- 3–4 words max, Archivo Black, white plus one orange→red or gold word, dark 16 px outline; keep the bottom-right corner clear (duration badge).
- One readable face or one concept object, ≥ 40 % of the frame; text on the other side over a dark gradient.
- Make three for YouTube Test & Compare: **A** the face + mystery ("HER SECOND PHONE."), **B** the emotional climax ("ARE YOU OKAY?"), **C** the concept ("STRICT = SECRETS?" with a ticked phone and a glowing locked one).
- When the user asks for prompts for an image generator, give one per variant: scene, the style line (flat 2D vector, soft gradients, no outlines, cinematic glow, dark indigo/violet, faceless white bean characters with dot eyes, 16:9), "empty space on the right third for text", "no text, no letters", then the text to add in an editor.

## 9. YouTube metadata
Title options (curiosity + promise), description (hook paragraph, what you'll learn, chapters from act starts with 0:00 first and ≥ 10 s each, the comment question, full sources, "characters are illustrative", "education, not advice"), tags, category Education, not made for kids if the story has teen drinking etc., captions from the `.srt`, no "altered content" flag for animation.

## 10. Checks before delivery
Contact sheet of every shot; a 0.2 s strip of key actions; reading check; loudness ≈ −14 LUFS; no black frames except deliberate dips; facts listed; no third-party logos or real people.
