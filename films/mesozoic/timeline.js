// One timeline: shots, voice, hits and sound events. Read by the picture (film.js) and exported to events.json for the mix.
export const T = {
  s1: 0, s2: 4.0, s3: 7.6, s4: 12.2, s5: 16.6, s6: 21.0, s7: 26.0,
  bulb1: 18.95, bulb2: 19.5,            // "3" lights, then D-A-Y-S
  up1: 22.9, up2: 23.7, up3: 24.5,      // 3 WEEKS · 3 MONTHS · YEARS?
};
export const DUR = 32.0;
const D = { v1: 3.441, v2: 2.621, v3: 3.802, v4: 3.38, v5: 2.513, v6: 4.126, v7: 3.94 };
const AT = { v1: .4, v2: 4.6, v3: 7.9, v4: 12.6, v5: 17.6, v6: 21.3, v7: 26.4 };
const TXT = {
  v1: 'Two hundred million years ago. How long would you last?',
  v2: 'Step through. Good news: you can breathe.',
  v3: "The air is thin, like a mountain town. It won't kill you.",
  v4: 'The heat might. 40 degrees, and no clean water.',
  v5: 'Without water: about 3 days.',
  v6: 'Boil it, find shade, dodge the teeth, and you might last years.',
  v7: 'The dinosaurs lasted 165 million.',
};
export const VO = Object.keys(AT).map(id => ({ id, t0: AT[id], t1: AT[id] + D[id], text: TXT[id] }));
export function events() {
  const e = [];
  const E = (t, type, o = {}) => e.push({ t, type, ...o });
  VO.forEach(v => E(v.t0, 'vo', { id: v.id }));
  // S1 chronometer
  E(0.0, 'room'); E(0.6, 'ratchet', { dur: 2.5 }); E(3.1, 'bell'); E(3.45, 'doorclose'); E(3.95, 'latch');
  // S2 door + world
  E(3.5, 'wind', { until: 16.6 }); E(4.05, 'dooropen'); E(4.3, 'springtwang'); E(4.6, 'sauropod'); E(5.7, 'sauropod'); E(6.8, 'sauropod');
  // S3 gauge
  E(7.6, 'cut'); E(7.6, 'titlebar'); E(8.1, 'needle', { dur: 2.1 }); E(10.1, 'settle'); E(9.0, 'titlebar');
  // S4 heat
  E(12.2, 'archwipe'); E(12.6, 'heat', { until: 16.6 });
  // S5 clock: near-silence, one tick, then the spin and three counted hits
  E(16.6, 'silence'); [16.6, 16.8125, 17.025, 17.2375].forEach(t => E(t, 'tick'));
  E(17.45, 'ratchet', { dur: 1.3 }); E(18.75, 'clunk'); E(T.bulb1, 'switch', { big: 1 }); [0, .12, .24, .36].forEach(d => E(T.bulb2 + d, 'switch')); E(T.bulb1, 'hum', { until: 21.0 });
  // S6 fire
  E(21.0, 'whoosh'); E(21.2, 'night', { until: 26.6 }); E(21.4, 'match'); E(21.6, 'fire', { until: 27.0 }); E(22.3, 'potclank'); E(22.4, 'boil', { until: 26.2 });
  [T.up1, T.up2, T.up3].forEach(t => E(t, 'switch', { big: 1 })); E(T.up3 + .7, 'chase', { until: 26.0 });
  // S7 epoch
  E(26.0, 'silence'); E(26.1, 'pullback'); E(26.3, 'rumble', { until: 30.6 }); E(27.0, 'titlebar'); E(28.4, 'bigbell');
  E(30.55, 'doorclose'); E(31.2, 'latch'); E(31.2, 'hum', { until: 32.0, last: 1 });
  return e.sort((a, b) => a.t - b.t);
}
