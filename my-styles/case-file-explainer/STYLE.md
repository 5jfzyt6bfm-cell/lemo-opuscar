# Case File Explainer · 案件式讲解 — Style Prompt

Made from a blank page; techniques from 80s Cel Anime (cel-anime-80s) in Lemo-Opuscar.

> A YouTube explainer-documentary told like a true-crime case. One ordinary person stands in for the topic. Faceless white bean figures move through cinematic, dusk-lit flat-vector worlds, and the narration arrives word by word on screen.
> References (grammar only): modern narrated explainer channels in general (story-led cold opens, kinetic captions, evidence-board beats). Borrow the grammar, never a specific channel's characters, titles, shots or episode structure.

## 1. Essence, and what it is not

- **One person is the case.** Every film follows one ordinary character through a concrete moment. The topic (a statistic, a study, a habit) is revealed *through* them, and only then widened to everyone.
- **Bean figures in lit worlds.** Simple warm-white figures with no outlines and dot-and-line faces stand inside soft-gradient flat-vector sets lit like cinema: dusk skies, glowing windows, headlights, screens, bloom.
- **The words are on screen.** The narration lands as big captions a few words at a time, one keyword per line in an accent colour. Now and then a heavy **stamp title** with a full stop (`NOT ONCE.`, `FINE.`) slams in.
- **An investigation frame.** The film is built like a case file: a cold open on the incident, evidence pinned on a board, numbered cases, questioning, then the study.

If a frame could be from a whiteboard explainer, a chart-led motion-graphics video or anime, something is missing. This style is **not** a whiteboard: nothing is drawn by a hand. It is **not** a data-viz film: numbers live on props (receipts, clocks, Polaroids), not on axes. It is **not** anime or a cartoon: there are no outlines, no big eyes and no squash-and-stretch gags.

## 2. Materials & rendering

- **Two canvases, as in the 80s Cel Anime engine.** The picture, plus an **emitter canvas** holding only things that give light (lamps, windows, screens, signals, the key object). The emitter canvas is blurred at three radii (¼, ⅛, 1/16 size) and added on top: that is the bloom. Characters are stamped black into it, so glow never shines through them.
- **Flat shapes, soft gradients, no outlines.** Every surface is one or two gradient fills. Edges come from value contrast. There are no ink lines or textures, except cork, paper and the like, which carry a fine procedural speckle.
- **The bean figure.**
  - Round head (radius ≈ 14 % of height), slim pill torso, tube limbs with round ends, small pad feet. No hands, no hair, no clothes.
  - Skin is a warm white, `#f2ebe6` in neutral light. In a scene it is always a gradient from the scene's shadow colour to its key-light colour.
  - Face: two dot eyes with lids, line brows, a line mouth (or a small dark oval when it gapes). Emotion lives in lids, brows and posture only.
  - The face turns by sliding the features across the head. No profile drawing.
  - Props identify people and situations: a "NEW DRIVER" sign, a lanyard, a survey sheet.
- **Light is drawn as light.** Each scene gets a soft radial wash from its key source (added with `lighter`), a light cone on the floor and a soft contact shadow under every figure.
- **Finish.** A vignette toward night-ink corners, and fine film grain added at mux (grain 3). No CRT, no scanlines, no chromatic aberration.

## 3. Colour logic

- **Base world: dusk.** Indigo `#14112b`, plum `#2c2150`, violet `#4a2f6e`, falling to dusk pink `#c7586a` and ember `#f08a5d` at the horizon. Warm windows are gold `#ffcf7a`.
- **One cool light is reserved** for the story's key object or moment of release: teal `#8ff3e6`, hot core `#e9fffb` (a green signal, a fridge, a phone, a screen). It appears nowhere else in the film.
- **Each act has its own colour world**, never a filter over the frame:
  - the night street or room: indigo and violet;
  - the evidence board: warm cork `#a8673a`, lit by a desk lamp;
  - questioning: cold navy under a top-light cone;
  - the study: neutral navy and paper.
- **Accents for type only:** red `#ff4b3e`, orange `#ff8a3a`, yellow `#ffd23f`. Red marks danger, a contradiction or a key number. Orange marks a name or object. Yellow marks a feeling or a time.

## 4. Type & captions

- **Captions.** Poppins ExtraBold, about 58 px at 1080p, white, centred about 90 px above the bottom, with a soft dark shadow and a faint dark stroke. Exactly **one keyword per line** takes an accent colour, and pops 8 % bigger as it lands.
  - **With a voice:** chunks of 1–3 words replace each other in sync with the speech (word timestamps from the speech check).
  - **Without a voice** (sound-off cuts, demos): words pop in one by one and build the whole sentence, which holds for its reading time.
- **Stamp titles.** Archivo Black, 170–230 px, uppercase, always ending in a full stop. The fill is a vertical gradient (orange → red for danger, white → pale grey for neutral) with a deep soft shadow and a faint glow. They land with a 0.16 s scale-down slam (1.45 → 1) and a small camera shake. At most one per 8–10 seconds; they carry the verdicts.
- **Counters.** A huge Archivo Black digit with a small Poppins unit below (`1` / `second.`, `3` / `min.`). It ticks with a pop and a sound.
- **Props carry data:** handwritten-feeling red times on Polaroids, labels on paper tags, a clock display. Each one is readable for at least its reading time.
- **Watermark:** the user's channel handle, small, top right, at 35 % opacity, when they want one.

## 5. Motion quality

- Characters move smoothly on ones, with eased poses and anticipation, settle and follow-through. Their acting is small: a shuffle, a reach, a squint, a blink, a slump.
- **The cut does the work.** Shots average about 2 s (1.5–3 s), with longer holds (3–5 s) on a punchline or a reveal. Each sequence alternates fast and slow.
- **Stillness before a verdict.** The picture holds and the sound drops out for 0.3–0.6 s before a stamp title lands.
- Evidence arrives one item at a time: cards drop in about 0.2 s and get pinned, windows switch on one by one, and the count goes up.
- No bounce gags and no squash and stretch.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | What it expresses | Can serve |
|---|---|---|
| Wide establishing shot with a slow push-in | where and when the incident happens | a street at dusk, a bedroom at 2 a.m., an empty office |
| Close-up of the face under the key light | what the person feels | a squint, a sleepy blink, a blank stare |
| Point of view through a frame (a window, a windscreen, a fridge, a screen) | **you** are a witness | a kid on the bus watching a car; the phone watching its owner |
| Insert on one object | the clue | a traffic light, a clock, a receipt |
| Low angle behind the subject, with flaring headlights | threat, consequence | a horn, a deadline, a crowd |
| Lateral truck along the evidence board while cards land | the case builds | a week, five cases, a timeline |
| Top-light cone in a dark room | questioning, confession | interviews, admissions |
| Overhead grid of identical units | it's everyone | desks, windows, beds, phones |
| Pull-back from one unit to the grid | the one becomes the many | the end of a sequence |

Frame the subject large (at least a third of the frame height at key moments) and keep the lower 140 px calm for captions. Transitions are hard cuts, often on a light change (red → green, dark → fridge light). No dissolves or wipes.

## 7. Sound palette

- **Score:** a soft ambient synth bed (warm pads in minor and suspended chords, a low pulse) that stays under the voice. Pulses and ticks sit on counters. One beat of real silence comes before each stamp title, and the bed swells slightly at the widening reveal.
- **Foley,** synthesised and close: room tone, footsteps, appliance hum, a door seal, a light flicking on, clock ticks, pin taps, paper, a horn, an engine idle, city air.
- **Sound as a transition:** the next scene's ambience or hum starts 0.2–0.5 s before the cut (J-cut).
- **Voice:** one warm, close narrator who speaks in short sentences, talks to the viewer as "you" and leaves the punchline words room to land. Every line is checked by speech-to-text.
- **Mix:** voice about 10 dB over a ducked bed, foley at the level of the voice for hits (stamp, horn), loudness −14 LUFS.

## 8. Native moves

A menu: use the ones your story needs.

- **Cold open on the incident.** One person at one risky or telling moment, before any thesis. *Fits content like:* a student dozing at a red light; a nurse on a 3 a.m. shift; a shopper at the self-checkout.
- **You are the witness.** "Right outside your window…", and the camera takes that position. *Fits content like:* a neighbour; a passenger; the device itself.
- **Seconds stretched by a counter.** *Fits content like:* a microsleep; how long a page loads; the wait on hold.
- **The picture contradicts the narration.** The words say "never" or "fine" while the evidence on screen says otherwise, and a stamp title lands the irony. *Fits content like:* "he never stays up late" over 2 a.m. timestamps; "it's free" over the data it collects.
- **One case becomes many.** #1 to #5 on the board, then +10, then a grid of everyone. *Fits content like:* patients in a study; drivers on one road; users of an app.
- **The investigation frame.** An evidence board with a red string, case numbers and questioning under a top light. *Fits content like:* any "why does this happen" topic.
- **Chapters named by time.** Monday… Friday, 2:14 a.m., Week 3. *Fits content like:* habits, routines, timelines.
- **The light change cut.** A signal or a lamp switches and the scene's meaning flips with it. *Fits content like:* a decision; a deadline; a recovery.

## 9. Pitfalls of the medium

- White figures bloom → bloom only from the emitter canvas, and stamp figures black into it.
- An open light source washes out the frame and the captions under it → put its gradient into shadow at the bottom, and keep its emitter fill bright at the top and fading toward the caption band.
- An accent keyword over a bright background disappears → a dark stroke plus a heavy shadow on every caption. Reframe before you make the shadow bigger.
- Captions that flash 1–3 words with no voice can't be read → build the full line when there is no voice, and check reading time.
- Too many stamp titles stop landing → one per 8–10 seconds at most.
- Bean figures with crossed knees → both knees bend toward the facing direction; keep the stride amplitude moderate.
- Arms that stretch to reach a far target → cap the hand at the arm's length; the figure reaches *toward* things.
- More than one cool light → the reserved teal stops meaning anything.
- Canvas silently falls back to a serif → `document.fonts.load` every weight before drawing.

## 10. Engine

In `demo/`:
- `kit.js`: the two canvases, camera, bloom composite with vignette, the bean figure (`bean`, with its mask mode for the emitter canvas), kinetic captions (`caption`), stamp titles (`stamp`), a night-town plate and a cork texture.
- `story.js`: one timeline for shots, captions and hits.
- `main.js`: the eight shots: wide room, screen insert, the laptop's point of view, phone insert, hyperfocus with a counter, case board, spotlight and building pull-back.
- `mix.py`: numpy pad score and foley from `events.json`.
- `tools/master.sh`: an ffmpeg 6 fallback for `core/render/mux.sh`.

Then the technique base: `$LIB/styles/cel-anime-80s/demo/` (`bg.js` painted plates with an emissive pair, `post.js` WebGL bloom).

A minimal new use: one dusk street plate with glowing windows, one bean figure lit by a streetlamp, one built caption.

## 11. Variation space

You decide the story, the person, the world, the opening, the ending, the camera path, the pacing and the act colour worlds. Far from our demo:

- Structures:
  - **countdown to an incident** (Day 1 … Day 7, then what happened);
  - **two people, one choice** (split stories that meet on the board);
  - **the reverse case** (start from the result, a crash or a failed exam, and work back through the evidence).
- Openings:
  - a clock display in extreme close-up;
  - a phone notification lighting a dark room;
  - the end of the story shown first, then "three days earlier".
- Endings:
  - the board complete, with the camera pulling back to the whole wall;
  - the person doing the right thing in the same shot as the opening;
  - one last stamp title on black.

---

How our demo was made (story, shots, score, build): [DEMO.md](DEMO.md). Read it after your treatment exists.
