# Demo: "Attention That Won't Steer" (30 s)

One example among many. Don't reuse its story, arc, shots, props or timings.

**Story.** Maya has one essay due at 8. She can't start it. Her phone lights up, and she loses four hours to octopus facts. The case board asks "ADHD means no focus, right?", and the stamp title answers **WRONG.** A spotlight of attention won't stay on the essay ("It's not a lack of attention. It's attention that won't steer."). The camera pulls back to a building where 1 window in 20 glows teal: "About 1 in 20 kids has ADHD." Facts and sources: `FACTS.md`.

**Shots** (`story.js` holds every time):

| Time | Shot | Camera | Native move |
|---|---|---|---|
| 0.0–2.9 | Wide bedroom, 9:00 PM on the desk clock | slow push-in | cold open on the incident |
| 2.9–5.5 | Insert: the essay, 0 words, blinking cursor | push-in on the screen | the clue |
| 5.5–8.0 | The laptop's point of view: her eyes drift away and back | frame within frame (the bezel) | you are the witness |
| 8.0–10.7 | Insert: the phone lights up teal; a hand lifts it away | low angle on the desk | light-change cut; the reserved teal arrives |
| 10.7–13.6 | Hyperfocus: phone light on her face, the moon crosses the window | medium, slow push | counter 1→4 "hours." |
| 13.6–19.2 | Case board: three cards, red string, silence, **WRONG.** | lateral truck and pull-out | the picture contradicts the narration |
| 19.2–25.8 | A spotlight swings from the essay to the phone, the window and the poster; she grabs it back and it escapes again | locked wide, top-light cone | the investigation frame (questioning light) |
| 25.8–30.0 | Pull back from her window to the building: 1 teal window in 20 | 5.2× → 1× pull-back with parallax | one case becomes many |

**Palette.** Dusk indigo and violet; the laptop light is lavender `#dcd8f7`. The phone is the only teal (`#8ff3e6` / `#e9fffb`): in her hands, on the card, under the spotlight, in her window. Cork board in warm orange.

**Type.** Captions are built word by word (there is no voice), one accent keyword each. One stamp title. One counter.

**Score** (`mix.py`, numpy):
- 80 BPM pad: Am9 – Fmaj7 – Cmaj7 – G6sus2.
- A soft low pulse; a speeding arpeggio during the hyperfocus; slow eighths that change register during the spotlight.
- Real silence from 16.9 to 17.3 s, then the stamp thump; the music returns 0.25 s later.
- A bell on the reveal.

**Foley:** cursor clicks, the notification chime and buzz, a grab, clock ticks and time-lapse whooshes, pins, string, stamp, swinging whooshes for the spotlight, city air as a J-cut into the last shot.

**Files.**
- `kit.js`: canvases, camera, bloom, the bean figure (standing, walking, seated; reach is capped to the arm's length), captions, stamp, night-town plate, cork.
- `main.js`: the eight shots, `TEXTS` for the reading check, sound events.
- `story.js`: the timeline.
- `mix.py`: the sound.
- `tools/master.sh`: an ffmpeg 6 fallback for `core/render/mux.sh`.
- `build.sh`: rebuilds the film and the poster.

**Build notes.**
- Pass `readcheck.mjs` (every caption, card and label held long enough).
- Mix low end about −3 dB against the rest; master −14.4 LUFS, grain 3.
