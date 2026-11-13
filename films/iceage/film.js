// "Could You Beat an Ice Age Predator?" — shots start on the user's sentences; every change of shot is a smooth eased transition.
import { C, clamp, lerp, seg, ss, eio, eo, mix, rgba, gline, toPath, stepArchPts, arcPts, glow } from './engine/deco.js';
import { W, H, buildCues, drawSubs } from './common.js';
import * as A from './sc_a.js';
import * as B from './sc_b.js';

let SENTS, WORDS, OFF, CUES, SH, VOEND;
export let DUR = 610;
const lead = .3, TR = 1.1;
const S = { ...A, ...B };
// custom wrappers: scene + marks → options
const X = {
  sparta0: (g, lt, D, t, o) => S.permafrost(g, lt, D, t, { thaw: 0, plq: [['SIBERIA · 28,000 YEARS AGO', .4, o.marks[0] - .2], ['A MONTH OLD', o.marks[0], 99]] }),
  spartaFind: (g, lt, D, t, o) => S.permafrost(g, lt, D, t, { thaw: [.5, 7], zoom: [1.05, 1.25], title: 'SPARTA', titleAt: o.marks[2], plq: [['THE RIVERBANK · 2018', o.marks[0], o.marks[1]], ['PAWS · TEETH · WHISKERS', o.marks[1], o.marks[2] - .3]] }),
  yakutia: (g, lt, D, t, o) => S.permafrost(g, lt, D, t, { homo: true, thaw: [.5, 6], title: 'HOMOTHERIUM CUB', titleAt: o.marks[3], plq: [['YAKUTIA · SIBERIA · 2020', o.marks[0], o.marks[1]], ['SMALL · DARK FUR', o.marks[1], o.marks[2]], ['A LION CUB?', o.marks[2], o.marks[3] - .3]] }),
  spartaBack: (g, lt, D, t, o) => S.permafrost(g, lt, D, t, { thaw: .6, zoom: [1.2, 1.05], plq: [['BACK TO SPARTA', o.marks[0], 99]] }),
  spartaEnd: (g, lt, D, t, o) => S.permafrost(g, lt, D, t, { thaw: 0, river: false, zoom: [1, 1.3], plq: [['SPARTA', .5, 99]] }),
  wolfHero: (g, lt, D, t, o) => S.hero(g, lt, D, t, { sp: 'direwolf', name: 'DIRE WOLF', sub: 'MOST COMMON LARGE MAMMAL AT LA BREA', cap: 'THOUSANDS RECOVERED', capAt: o.marks[0], many: 2 }),
  hyenaHero: (g, lt, D, t, o) => S.hero(g, lt, D, t, { sp: 'hyena', name: 'ICE AGE EUROPE · ASIA', sub: 'ANOTHER BONE-CRACKER', many: 1, snow: .5 }),
  smiloHero: (g, lt, D, t, o) => S.hero(g, lt, D, t, { sp: 'smilodon', name: 'SMILODON', sub: 'THE SABER-TOOTHED CAT', cap: 'SECOND MOST COMMON AT LA BREA', capAt: .4, snow: .1 }),
  wolfSpec: (g, lt, D, t, o) => S.spec(g, lt, D, t, { sp: 'direwolf', kg: 60, kgMax: 100, marks: o.marks, jawAt: o.marks[2] + .5, notes: [['SIZE OF A LARGE GRAY WOLF · HEAVIER', 0], ['BROAD SKULL · BONE-CRUSHING TEETH', 2]] }),
  vWolf: (g, lt, D, t, o) => S.versusShot(g, lt, D, t, { sp: 'direwolf', kg: 60, verdict: 'BAD MATCHUP', exFrom: 'curious', exTo: 'worried', marks: o.marks }),
  vHyena: (g, lt, D, t, o) => S.versusShot(g, lt, D, t, { sp: 'hyena', kg: 100, verdict: 'PROBABLY NOT', exFrom: 'worried', exTo: 'scared', marks: o.marks }),
  vSmilo: (g, lt, D, t, o) => S.versusShot(g, lt, D, t, { sp: 'smilodon', kg: 200, verdict: 'PINNED', exFrom: 'determined', exTo: 'scared', marks: o.marks, exAt: 2 }),
  vHomo: (g, lt, D, t, o) => S.versusShot(g, lt, D, t, { sp: 'homotherium', kg: 190, verdict: 'NO', exFrom: 'worried', exTo: 'scared', marks: o.marks }),
  vLion: (g, lt, D, t, o) => S.versusShot(g, lt, D, t, { sp: 'cavelion', kg: 250, verdict: 'NO', exFrom: 'scared', exTo: 'sad', marks: o.marks }),
  vBear: (g, lt, D, t, o) => S.versusShot(g, lt, D, t, { sp: 'bear', kg: 900, verdict: 'NO', exFrom: 'scared', exTo: 'awe', marks: o.marks, sub: 'CLOSE TO A TONNE' }),
};
// [sentence, scene, opts, transition-in]: arch | sheen | iris | push
const SHOTS = [
  [0, 'sparta0', { marks: [1] }, 'none'],
  [2, 'spartaFind', { marks: [3, 4, 5] }, 'push'],
  [6, 'lionGrow', {}, 'iris'],
  [8, 'humans', { marks: ['10.4'] }, 'sheen'],
  [11, 'nightCamp', {}, 'push'],
  [13, 'youArrive', { marks: ['14.12'] }, 'arch'],
  [15, 'ladderShot', { build: true }, 'sheen'],
  [17, 'laToday', { marks: [18] }, 'iris'],
  [19, 'tarTrap', { marks: [20, 21] }, 'push'],
  [22, 'wallOfPredators', { marks: [23] }, 'arch'],
  [24, 'wolfHero', { marks: [26] }, 'sheen'],
  [27, 'dna', { marks: [31, 32, '32.10'] }, 'iris'],
  [33, 'wolfSpec', { marks: [34, 34, 35] }, 'push'],
  [36, 'vWolf', { marks: [37] }, 'arch'],
  [38, 'protect', { marks: [40] }, 'push'],
  [42, 'pack', { marks: [44, 45] }, 'sheen'],
  [47, 'hyenaHero', {}, 'arch'],
  [48, 'kirkdale', { marks: [49, 50, 51] }, 'iris'],
  [52, 'buckland', { marks: [52, 54, 55] }, 'push'],
  [56, 'den', {}, 'arch'],
  [58, 'hyenaSpec', { marks: [59, 60] }, 'sheen'],
  [61, 'vHyena', { marks: [62] }, 'arch'],
  [64, 'clan', { marks: [65, 66, 67] }, 'push'],
  [68, 'smiloHero', {}, 'sheen'],
  [71, 'canine', { marks: ['71.5'] }, 'iris'],
  [73, 'smiloWeights', { marks: [73, 74] }, 'push'],
  [75, 'weakBite', { marks: [77] }, 'arch'],
  [78, 'pin', { marks: [79, 80] }, 'push'],
  [82, 'vSmilo', { marks: [86] }, 'arch'],
  [87, 'healed', { marks: [89, 90, 91] }, 'sheen'],
  [92, 'debate', { marks: [92, 93, 94, 95] }, 'push'],
  [96, 'yakutia', { marks: [97, 98, 101, 103] }, 'arch'],
  [104, 'homoCompare', { marks: [104, 106, 107] }, 'sheen'],
  [108, 'cubDetail', { marks: ['109.5', '109.7', '109.14', 110, 111] }, 'iris'],
  [113, 'homoHunt', { marks: [114] }, 'push'],
  [115, 'vHomo', { marks: [116] }, 'arch'],
  [119, 'spartaBack', { marks: [120] }, 'iris'],
  [121, 'lionCompare', { marks: [122, 123] }, 'push'],
  [124, 'chauvet', { marks: [126, 129, 125, 131] }, 'arch'],
  [134, 'vLion', { marks: [135] }, 'sheen'],
  [138, 'bearRise', { marks: [140] }, 'arch'],
  [141, 'bearMyth', { marks: [144] }, 'push'],
  [146, 'bearNew', { marks: [148, 149, 150] }, 'sheen'],
  [151, 'vBear', { marks: ['152.12'] }, 'arch'],
  [154, 'none', { marks: [154, 155, 156, 157, 158, 159] }, 'iris'],
  [160, 'stayed', { marks: [162, 164, 165, 166] }, 'sheen'],
  [167, 'vanish', { marks: [168, 169, 170] }, 'arch'],
  [171, 'why', { marks: [171, 173, 174] }, 'push'],
  [175, 'standing', {}, 'sheen'],
  [176, 'spartaEnd', {}, 'iris'],
  [-1, 'coda', {}, 'arch'],
];

export async function init() {
  const [s, w] = await Promise.all([fetch('sents.json').then(r => r.json()), fetch('words.json').then(r => r.json())]);
  SENTS = s.sents; WORDS = w; OFF = s.off; VOEND = OFF.a + s.dur.a;
  // the recording ends after "…what its world became."; the last two script lines are title cards (sc_b.coda), not subtitles
  CUES = buildCues(WORDS, SENTS.slice(0, 178), OFF);
  DUR = Math.ceil((VOEND + 13.5) * 24) / 24;
  SH = SHOTS.map(([i, fn, o, tr], k) => ({ i, fn, o: { ...o }, tr, t0: k === 0 ? 0 : i < 0 ? VOEND + .4 : SENTS[i].t0 - lead }));
  SH.forEach((x, k) => { x.t1 = k + 1 < SH.length ? SH[k + 1].t0 : DUR; });
  for (const x of SH) if (x.o.marks) x.o.marks = x.o.marks.map(m => markTime(m) - x.t0);
  window.__CUES = CUES; window.__SH = SH.map(x => [x.fn, +x.t0.toFixed(2), +x.t1.toFixed(2)]);
}
function markTime(m) { if (typeof m === 'number') return SENTS[m].t0; const [si, wi] = m.split('.').map(Number); const s = SENTS[si], w = WORDS[s.i0 + Math.min(wi, s.n - 1)]; return OFF[w.part] + w.t0; }
const fnOf = name => X[name] || S[name];
function drawShot(g, x, t, zoom = 1) {
  g.save(); if (zoom !== 1) { g.translate(960, 540); g.scale(zoom, zoom); g.translate(-960, -540); }
  fnOf(x.fn)(g, t - x.t0, x.t1 - x.t0, t, x.o);
  g.restore();
}
let OFFC = null;
function off() { if (!OFFC) { OFFC = document.createElement('canvas'); OFFC.width = W; OFFC.height = H; } const c = OFFC.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, H); return c; }
// smooth transition between shot a (outgoing) and b (incoming), u = 0..1 across TR seconds
function transition(g, a, b, t, u, kind) {
  const e = eio(u);
  drawShot(g, a, t, 1 + .06 * e);   // outgoing keeps drifting in
  const c = off(); drawShot(c, b, t, 1.08 - .08 * e);   // incoming settles
  c.globalCompositeOperation = 'destination-in';
  const F = 140;   // feather in px
  if (kind === 'iris') { const r = lerp(0, 1250, e); const gr = c.createRadialGradient(960, 540, Math.max(0, r - F), 960, 540, r + 1); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, H); }
  else if (kind === 'arch') { const r = lerp(0, 1500, e); const gr = c.createRadialGradient(960, 1180, Math.max(0, r - F), 960, 1180, r + 1); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, H); }
  else if (kind === 'sheen') { const x = lerp(-600, W + 600, e); const gr = c.createLinearGradient(x - 300, 0, x + 300, H * .3); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, H); }
  else { const x = lerp(W + F, -F, e); const gr = c.createLinearGradient(x - F, 0, x + F, 0); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, H); }
  c.globalCompositeOperation = 'source-over';
  g.drawImage(OFFC, 0, 0);
  // a soft gold light rides the edge
  const k = Math.sin(u * Math.PI);
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .35 * k;
  if (kind === 'iris') { const r = lerp(0, 1250, e) - F / 2; gline(g, arcPts(960, 540, Math.max(1, r), 0, Math.PI * 2, 120), { w: 6, glow: 1 }); }
  else if (kind === 'arch') { const r = lerp(0, 1500, e) - F / 2; gline(g, arcPts(960, 1180, Math.max(1, r), Math.PI, Math.PI * 2, 120), { w: 6, glow: 1 }); }
  else if (kind === 'sheen') { const x = lerp(-600, W + 600, e); const gr = g.createLinearGradient(x - 200, 0, x + 200, H * .3); gr.addColorStop(0, 'rgba(255,220,140,0)'); gr.addColorStop(.5, 'rgba(255,220,140,.8)'); gr.addColorStop(1, 'rgba(255,220,140,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  else { const x = lerp(W + F, -F, e); gline(g, [[x, 0], [x, H]], { w: 5, glow: 1 }); }
  g.restore();
}
export function renderFilm(g, t) {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  let k = SH.findIndex(x => t >= x.t0 && t < x.t1); if (k < 0) k = SH.length - 1;
  const cur = SH[k], nx = SH[k + 1];
  if (k > 0 && cur.tr !== 'none' && t < cur.t0 + TR / 2) transition(g, SH[k - 1], cur, t, (t - (cur.t0 - TR / 2)) / TR, cur.tr);
  else if (nx && nx.tr !== 'none' && t > nx.t0 - TR / 2) transition(g, cur, nx, t, (t - (nx.t0 - TR / 2)) / TR, nx.tr);
  else drawShot(g, cur, t);
  drawSubs(g, t, CUES);
  if (t < .8) { g.fillStyle = rgba('#000000', 1 - seg(t, 0, .8)); g.fillRect(0, 0, W, H); }
  if (t > DUR - 1.3) { g.fillStyle = rgba('#000000', seg(t, DUR - 1.3, DUR - .2)); g.fillRect(0, 0, W, H); }
}
export function events() {
  const ev = [];
  for (const x of SH) ev.push({ t: x.t0, type: 'shot', fn: x.fn, tr: x.tr, dur: x.t1 - x.t0 });
  for (const x of SH) if (x.o.marks) x.o.marks.forEach((m, i) => ev.push({ t: x.t0 + m, type: 'mark', fn: x.fn, i }));
  ev.push({ t: VOEND, type: 'voend' });
  return ev.sort((a, b) => a.t - b.t);
}
export function texts() { return []; }
