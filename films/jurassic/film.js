// "One Week in the Jurassic" — the user's voiceover drives everything: shots start on sentences (sents.json, from the alignment).
import { C, clamp, lerp, seg, ss, eio, eo, mix, rgba, gline, toPath, stepArchPts, arcPts, glow, sparkle } from './engine/deco.js';
import { W, H, dayCorner, dayMedallion, buildCues, drawSubs, mech } from './common.js';
import { doorsLeaves } from './sc_util.js';
import * as O from './sc_open.js';
import * as M from './sc_world.js';
import * as G from './sc_giants.js';
import * as P from './sc_hunters.js';
import * as E from './sc_end.js';

const MODS = { O, M, G, P, E };
let SENTS, WORDS, OFF, CUES, SH;
export let DUR = 662;
const lead = .35;

// [sentence, scene, opts, transition-in]
const SHOTS = [
  [0, 'O.fernDraw', {}, 'cut'],
  [2, 'O.absent', { marks: [2, 3, 4] }, 'iris'],
  [5, 'O.fernForest', {}, 'arch'],
  [6, 'O.distantCall', {}, 'cut'],
  [7, 'O.formation', {}, 'doors'],
  [8, 'O.kit', { marks: ['8.2', '8.3', '8.5', '8.7'] }, 'arch'],
  [9, 'O.mission', { marks: [10] }, 'iris'],
  [11, 'O.timeDial', {}, 'iris'],
  [12, 'O.eyes', {}, 'doors'],
  [13, 'O.mapScene', { marks: [13, 14, 15] }, 'arch'],
  [16, 'O.strata', {}, 'cut'],
  [17, 'O.weKnow', { marks: [18, 19, 20] }, 'iris'],
  [21, 'O.boardIntro', { title: 'WHAT KILLS THEM FIRST?', titleAt: 22 }, 'doors'],
  [23, 'M.calmPlain', { day: 1 }, 'doors'],
  [25, 'M.plantTrack', { marks: ['25.4', '25.6', '25.9', '26.3', '26.5', '26.8', '26.10', '26.14'] }, 'cut'],
  [27, 'M.missing', { marks: [28, 30] }, 'iris'],
  [32, 'M.board', { cur: 0 }, 'doors'],
  [33, 'M.gauges', { marks: [33, 34, 35, 36] }, 'arch'],
  [37, 'M.heat', { marks: [38, 39] }, 'arch'],
  [40, 'M.board', { cur: 1 }, 'doors'],
  [42, 'M.litres', { marks: [42, 43, 44] }, 'iris'],
  [45, 'M.river', { marks: [46, 47, 48] }, 'arch'],
  [49, 'M.board', { cur: 2 }, 'doors'],
  [50, 'M.rations', { marks: [50, 51] }, 'iris'],
  [53, 'M.toxic', { marks: [54, 55, 56] }, 'arch'],
  [57, 'M.specimens', { marks: [59, '59.4', 60, '60.4', '60.8'] }, 'iris'],
  [62, 'M.bigFoot', { marks: [63, '63.6'] }, 'arch'],
  [64, 'G.giantsLow', { day: 2 }, 'doors'],
  [66, 'G.lineup', { marks: [66, '66.1', '66.2'] }, 'arch'],
  [67, 'G.scale', { marks: [67, '67.9', 68] }, 'cut'],
  [69, 'G.peaceful', {}, 'arch'],
  [71, 'G.footfall', { marks: [72] }, 'cut'],
  [73, 'G.tailWhip', { marks: [74, 75, 76, 77] }, 'iris'],
  [78, 'G.board', { cur: 4 }, 'doors'],
  [80, 'P.nightCamp', { day: 3, marks: [81, 82, 83, 84] }, 'doors'],
  [85, 'P.alloReveal', {}, 'cut'],
  [86, 'P.alloSpec', { marks: [86, 87, 88] }, 'arch'],
  [89, 'P.quarry', { marks: [90, 91, 92, 94, 95] }, 'doors'],
  [96, 'P.count46', { marks: [96, 97] }, 'iris'],
  [98, 'P.balance', { marks: [98, 99] }, 'arch'],
  [100, 'P.hypotheses', { marks: [102, 103, 104, 105] }, 'arch'],
  [106, 'P.lesson', {}, 'arch'],
  [109, 'P.calibers', { marks: [111, 112, 113, 114] }, 'doors'],
  [115, 'P.firingLine', { marks: [116, 117] }, 'arch'],
  [118, 'P.ambush', { marks: [119, 120, 121] }, 'arch'],
  [122, 'P.bigAl', { marks: [123, 124, 126, 127, 128, 129, 130, 131, 132, 133, 135] }, 'doors'],
  [136, 'P.predators', { marks: [137, 138, 139] }, 'arch'],
  [140, 'P.stego', { marks: [141, 142, 143, 144, 145] }, 'doors'],
  [146, 'P.spikeMatch', { marks: [147, 148, 149, 150, 152, 153] }, 'iris'],
  [154, 'P.closeRange', {}, 'cut'],
  [155, 'E.day5', { day: 5, marks: [157, 158, 159, 160, 161, 162] }, 'doors'],
  [163, 'E.infection', { marks: [164, 165, 166, 167] }, 'doors'],
  [168, 'E.flip', { marks: [169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181] }, 'iris'],
  [182, 'E.verdict', { marks: [183, 184, '184.4', '184.9', '184.12', '184.17', '184.24', 185, 186] }, 'doors'],
  [187, 'E.day7', { day: 7, marks: [188, 189, 190] }, 'doors'],
  [191, 'E.bones', { marks: [192] }, 'cut'],
  [193, 'E.farewell', { marks: [194, 195] }, 'arch'],
];
// chapter turns: the big DAY medallion over the shot (sentence, day, previous day, hold s)
const DAYS = [[23, 1, 0, 3.2], [64, 2, 1, 3.0], [80, 3, 2, 3.0], [155, 5, 3, 3.0], [187, 7, 5, 3.2]];

export async function init() {
  const [s, w] = await Promise.all([fetch('sents.json').then(r => r.json()), fetch('words.json').then(r => r.json())]);
  SENTS = s.sents; WORDS = w; OFF = s.off;
  DUR = Math.ceil((OFF.c + s.dur.c + 4.5) * 24) / 24;
  CUES = buildCues(WORDS, SENTS, OFF);
  SH = SHOTS.map(([i, fn, o, tr], k) => ({ i, fn, o, tr, t0: k === 0 ? 0 : SENTS[i].t0 - lead }));
  SH.forEach((s, k) => { s.t1 = k + 1 < SH.length ? SH[k + 1].t0 : DUR; });
  for (const s of SH) if (s.o.marks) s.o.marks = s.o.marks.map(m => markTime(m) - s.t0);
  await O.loadMap();
  window.__CUES = CUES; window.__SH = SH.map(s => [s.fn, +s.t0.toFixed(2), +s.t1.toFixed(2)]);
}
function markTime(m) {
  if (typeof m === 'number') return SENTS[m].t0;
  const [si, wi] = m.split('.').map(Number); const s = SENTS[si]; const w = WORDS[s.i0 + Math.min(wi, s.n - 1)];
  return OFF[w.part] + w.t0;
}
export const sentT = i => SENTS[i].t0;

function drawShot(g, s, t) {
  const [m, f] = s.fn.split('.');
  const fn = MODS[m][f];
  if (!fn) { g.fillStyle = '#222'; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.font = '40px sans-serif'; g.fillText(s.fn, 100, 100); return; }
  fn(g, t - s.t0, s.t1 - s.t0, t, s.o);
}
export function renderFilm(g, t) {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  let k = SH.findIndex(s => t >= s.t0 && t < s.t1); if (k < 0) k = SH.length - 1;
  const s = SH[k], nx = SH[k + 1];
  // transition in
  const lt = t - s.t0;
  if (s.tr === 'arch' && lt < .75 && k > 0) {
    drawShot(g, SH[k - 1], t);
    const u = eio(lt / .75), w = lerp(10, 3600, u), h = lerp(10, 2800, u), pts = stepArchPts(960, H + 40, w, h, { steps: 3 });
    g.save(); g.clip(toPath(pts, true)); drawShot(g, s, t); g.restore();
    gline(g, pts, { w: 3, glow: .6 }); gline(g, stepArchPts(960, H + 40, w + 30, h + 15, { steps: 3 }), { w: 1.2 });
  } else if (s.tr === 'iris' && lt < .6 && k > 0) {
    drawShot(g, SH[k - 1], t);
    const r = lerp(4, 1200, eio(lt / .6));
    g.save(); g.beginPath(); g.arc(960, 540, r, 0, Math.PI * 2); g.clip(); drawShot(g, s, t); g.restore();
    gline(g, arcPts(960, 540, r, 0, Math.PI * 2, 120), { w: 3, glow: .6 }); gline(g, arcPts(960, 540, r + 16, 0, Math.PI * 2, 120), { w: 1.2 });
  } else drawShot(g, s, t);
  // door leaves: close over the end of the previous shot, open over the start of the next
  if (s.tr === 'doors' && k > 0 && lt < .6) doorsLeaves(g, mech(lt / .6));
  if (nx && nx.tr === 'doors' && s.t1 - t < .45) doorsLeaves(g, 1 - mech(1 - (s.t1 - t) / .45));
  // overlays
  for (const [si, day, prev, hold] of DAYS) { const t0 = SENTS[si].t0 - lead + .3; if (t > t0 && t < t0 + hold + .6) dayMedallion(g, day, (t - t0) / 1.6, { prev, out: (t - t0 - hold) / .5 }); }
  const cd = currentDay(t); if (cd) dayCorner(g, cd[0], cd[1], cd[2]);
  drawSubs(g, t, CUES);
  // end: lights out
  if (t > DUR - 1.2) { g.fillStyle = rgba('#000000', seg(t, DUR - 1.2, DUR - .2)); g.fillRect(0, 0, W, H); }
}
// corner medallion visible in world shots after a day is announced
const WORLD = new Set(['M.calmPlain', 'M.plantTrack', 'M.heat', 'M.river', 'M.bigFoot', 'G.giantsLow', 'G.peaceful', 'G.footfall', 'P.nightCamp', 'P.alloReveal', 'P.firingLine', 'P.ambush', 'P.stego', 'P.closeRange', 'E.day5', 'E.day7']);
function currentDay(t) {
  let day = 0, night = 0;
  for (const [si, d] of DAYS) if (t >= SENTS[si].t0 + 3.4) day = d;
  if (!day) return null;
  const s = SH.find(s => t >= s.t0 && t < s.t1); if (!s || !WORLD.has(s.fn)) return null;
  night = (s.fn === 'P.nightCamp' || s.fn === 'P.alloReveal') ? 1 : 0;
  return [day, ss(seg(t, s.t0 + .6, s.t0 + 1.2)), night];
}
export function events() {
  const ev = [];
  for (const s of SH) ev.push({ t: s.t0, type: 'shot', fn: s.fn, tr: s.tr, dur: s.t1 - s.t0 });
  for (const [si, day] of DAYS) ev.push({ t: SENTS[si].t0 - lead + .3, type: 'day', day });
  for (const s of SH) if (s.o.marks) s.o.marks.forEach((m, i) => ev.push({ t: s.t0 + m, type: 'mark', fn: s.fn, i }));
  return ev.sort((a, b) => a.t - b.t);
}
export function texts(t) { return []; }
