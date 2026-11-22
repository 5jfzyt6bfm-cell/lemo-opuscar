---
name: case-file-explainer
description: Make narrated YouTube explainer films in the "Case File Explainer" style, animated entirely in code. The style tells a psychology, parenting, health or science topic like a true-crime case. One ordinary person stands in for the topic, drawn as a faceless white bean or stick figure in dusk-lit flat-vector worlds with glow and bloom. The narration appears as kinetic keyword captions. The style also uses stamp titles, evidence boards with red string, floating chat cards with typed messages, study counters with citations, aerial fields of houses, crowd walls, and split screens of two homes. Use this skill whenever the user wants a video, short, explainer, demo or test clip "in my style", "like the reference", "case file", "bean characters", "same visual style", or sends their own narration MP3 and script to animate. Also use it when they ask for this style's thumbnails, thumbnail prompts or YouTube metadata, or want to analyse a new reference video and add it to the style.
---

# Case File Explainer

A narrated explainer told like a case file: an incident, then evidence, then the study, then the verdict. Everything is drawn in code, rendered frame by frame and mixed with synthesised sound. No image or video generators are needed.

## What to read
- `references/style.md`: the style's rules (look, colour, type, motion, camera, sound, native moves, pitfalls). Read it before planning any film.
- `references/reference-analysis.md`: shot-by-shot breakdowns of the user's three reference videos. Read it to understand the grammar; never copy their stories.
- `references/workflow.md`: the production pipeline that worked: alignment, engine, captions, sound, render, master, thumbnails, metadata and checks.
- `assets/engine/`: a working engine and a complete 60 s example film (`example-main.js`, ten places). Copy it into the film's folder and adapt it.

## The flow
1. **Brief, once.** Ask, in one message, only what you can't decide yourself:
   - topic facts and names;
   - their own material (narration MP3 and script, logo, voice);
   - length and language.

   Default to 1920×1080 at 24 fps and an English, sound-off-friendly film. Fill everything else yourself.
2. **Treatment.** Write `TREATMENT.md` before any code: three candidate structures and your choice, one colour world per act, the reserved cool light (teal for "the secret", or electric blue for surveillance), the stamp list (at least 8 s apart), counters, recurring props and the cast's identifying props. Any study named on screen goes into `FACTS.md`.
3. **Story grammar.** Use these, and spread them through the film so they don't bunch together:
   - cold open on one person at one telling moment;
   - "you" as the witness (a POV through a frame);
   - a counter stretching seconds or hours;
   - the picture contradicting the narration, landed by a stamp;
   - one case becoming many (board #1–#5, a crowd, an aerial field, a building of windows);
   - an investigation frame (cork board, red string, questioning light);
   - two homes in two temperatures (cool = control, warm = trust);
   - speech as light, the typed lie by omission, irony icons (halo, heart, "?").
4. **Narration.** If the user gives an MP3 and a script, align them with `scripts/align.py` (no speech model needed) and key every shot and pop-in to spoken words. Without a narrator, captions build the full line and hold for reading time.
5. **Build.** Copy `assets/engine/`. Write the sets as line-art rooms with dust, glowing light sources and rim-lit figures, then the shot list, captions, `TEXTS` and `EV`. Render a contact sheet of one frame per shot early, fix what's off once, then render the whole film.
6. **Sound.** Use `mix.py` (score and foley) or `mix_voice.py` (the user's narration, a score ducked under it, foley).
7. **Deliver.**
   - Master with `scripts/master.sh` to −14 LUFS.
   - Also make a small copy (grain-free, CRF 27, 1080p and 720p), because the full master can be too big to save on a phone.
   - Include the `.srt`, a poster, `CREDITS` (OFL fonts, MIT engine) and `FACTS.md`.
   - Tell the user what was checked and what wasn't, for example facts you couldn't open.
8. **On request:** thumbnails (three Test & Compare variants), image-generator prompts for them, and YouTube metadata (title options, description with chapters and sources, tags, settings). Recipes are in `references/workflow.md` §8–9.

## Adding a new reference
When the user sends another reference video:
- Make contact sheets: one frame per second plus a cropped 2 fps sheet of the player area. Detect cuts with ffmpeg's scene filter.
- List each shot: time, picture, caption and device.
- Add new devices to `references/reference-analysis.md` and the matching sections of `references/style.md`: characters, type, camera, native moves and pitfalls.
- Then offer a short test film that uses only the new devices, and fold any code they needed back into `assets/engine/`.

## Requirements
- Node 20+ with `playwright-core`. If it doesn't resolve, run `npm install playwright-core` in the skill's `scripts/` folder. If the render tool then reports a browser version mismatch, set `PLAYWRIGHT_CHROME` to an installed Chrome; in cloud sessions that is `/opt/pw-browsers/chromium-*/chrome-linux64/chrome`.
- ffmpeg, and Python 3 with numpy and scipy.
- The render tools in `scripts/render/` serve the film folder and drive headless Chromium. Each film page must expose `window.render`, `window.DUR`, `window.READY`, `window.EV` and `window.TEXTS`.

## Hard-won lessons
- White figures bloom into blobs. Bloom comes only from the emitter canvas, and figures are stamped black (or with a faint rim colour) into it.
- A bright light source behind a caption makes it unreadable. Darken the bottom of the gradient, and give every caption a dark stroke.
- Stamps cut off by the next shot read as glitches. Let them hold across the cut.
- Characters need identifying props, because the bean faces are all alike: a cap, a long-hair outline, glasses, a scarf.
- Cap arms at their own length; the figure reaches *toward* things.
- Draw crowds by stamping many copies of a few drawn figures, so the frame rate holds.
- Type chat messages at 8–12 characters per second, and hold them for their reading time.
