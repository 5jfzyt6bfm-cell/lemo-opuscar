// "Attention That Won't Steer": one timeline for picture, captions and sound (events.json is exported from window.EV)
export const DUR = 30.0;
export const SHOTS = [
  [0.00, 2.90, 'room'],      // wide: Maya at her desk, 9:00 PM
  [2.90, 5.50, 'screen'],    // insert: the essay, 0 words, cursor blinking
  [5.50, 8.00, 'laptop'],    // the laptop's point of view: her eyes keep drifting
  [8.00, 10.70, 'phone'],    // insert: the phone lights up (the reserved teal)
  [10.70, 13.60, 'focus'],   // hyperfocus: four hours (counter)
  [13.60, 19.20, 'board'],   // case board: three cards; "WRONG."
  [19.20, 25.80, 'spot'],    // the spotlight that won't stay on the essay
  [25.80, 30.00, 'block'],   // pull back: 1 window in 20
];
export const T = {
  notify: 8.05, grab: [9.65, 10.35],
  ticks: [10.85, 11.45, 12.05, 12.65],
  pins: [13.85, 14.35, 14.85], string: [15.10, 15.55],
  hush: 16.90, stamp: 17.30,
  pull: [22.20, 22.85],
  pullback: [25.80, 27.80],
};
// the attention spotlight: [time, x, y, target] keyframes; it eases between them
export const SPOT = [
  [19.20, 640, 702, 'essay'], [20.30, 640, 702, 'essay'], [20.85, 1290, 702, 'phone'], [21.55, 1290, 702, 'phone'],
  [22.05, 310, 360, 'window'], [22.25, 310, 360, 'window'], [22.85, 640, 702, 'essay'], [23.70, 640, 702, 'essay'],
  [24.15, 1575, 300, 'poster'], [24.45, 1575, 300, 'poster'], [24.85, 1290, 702, 'phone'], [25.80, 1290, 702, 'phone'],
];
const S = (id, t0, t1, words) => ({ id, t0, t1, words: words.map(([w, t, key]) => ({ w, t, key })) });
export const CAPS = [
  S('c1', 0.10, 2.90, [['Maya', .10, 'orange'], ['has', .40], ['one', .60], ['job.', .82]]),
  S('c2', 2.92, 5.50, [['One', 2.92], ['essay,', 3.10], ['due', 3.40], ['at', 3.56], ['8.', 3.72, 'red']]),
  S('c3', 5.52, 8.00, [['She', 5.52], ["can't", 5.74], ['start.', 6.02, 'yellow']]),
  S('c4', 8.02, 10.70, [['Her', 8.02], ['phone', 8.22, 'orange'], ['lights', 8.50], ['up.', 8.72]]),
  S('c5', 10.72, 13.60, [['She', 10.72], ["doesn't", 10.92], ['look', 11.22], ['up.', 11.40, 'yellow']]),
  S('c6', 13.70, 16.90, [['ADHD', 13.70], ['means', 13.98], ['no', 14.22, 'red'], ['focus,', 14.38], ['right?', 14.70]]),
  S('c7', 19.22, 22.40, [["It's", 19.22], ['not', 19.44], ['a', 19.62], ['lack', 19.74], ['of', 19.94], ['attention.', 20.10, 'yellow']]),
  S('c8', 22.40, 25.80, [["It's", 22.40], ['attention', 22.62], ['that', 22.95], ["won't", 23.14], ['steer.', 23.40, 'orange']]),
  S('c9', 26.00, 30.00, [['About', 26.00], ['1 in 20', 26.30, 'red'], ['kids', 26.80], ['has', 27.00], ['ADHD.', 27.18]]),
];
export const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
