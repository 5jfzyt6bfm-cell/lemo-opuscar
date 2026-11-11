// Chapter 7: day two, the sauropods.
import { C, TAU, clamp, lerp, seg, ss, eio, eo, ei, back, mix, rgba, gline, airbrush, toPath, sunburst, fan, glow, sparkle, vignette, arcPts, stepArchPts, hash, speedLines } from './engine/deco.js';
import { W, H, tw, mech, bg, label, plaque, ruler, world, A, threatBoard, goldText, titleBar, decoDigits, dial, FONTS, dino, soldier, SPECIES } from './common.js';
import { stride } from './dinos.js';
export { board } from './sc_world.js';

const walkPh = (sp, metres) => metres / stride(sp);
// Cassandre low angle: sauropods cross above the soldiers
export function giantsLow(g, lt, D, t, o) {
  const cam = { x: 0, y: .9, z: 0, f: 900, oy: 760, pitch: .18 };
  const X1 = lerp(-26, 8, lt / D), X2 = lerp(40, 14, lt / D);
  world(g, t, cam, { river: 0, mist: .3, sun: 1, sunX: -200, actors: [
    A.dino('diplodocus', X1, 30, { t, walk: 1, phase: walkPh('diplodocus', X1), neck: 4 }),
    A.dino('brachiosaurus', X2, 60, { t, walk: 1, phase: walkPh('brachiosaurus', X2), flip: -1, dark: .25 }),
    A.soldier(-1.2, 5, { pose: 'stand', flip: 1, t }), A.soldier(.6, 5.6, { pose: 'sentry', flip: -1, t }), A.soldier(2.2, 6.4, { pose: 'stand', flip: 1, t })] });
  vignette(g, W, H, .45);
}
// three names on a stage
export function lineup(g, lt, D, t, o) {
  bg(g, '#120d08', '#050403');
  sunburst(g, 960, 900, { rays: 56, r0: 0, r1: 1700, a0: Math.PI, a1: TAU, mode: 'both', w: 1, alpha: .5, colorA: 'rgba(201,162,75,.05)' });
  gline(g, [[0, 900], [W, 900]], { w: 2 });
  const m = o.marks, list = [['diplodocus', 520, 'DIPLODOCUS'], ['apatosaurus', 1000, 'APATOSAURUS'], ['brachiosaurus', 1560, 'BRACHIOSAURUS']];
  list.forEach(([sp, x, n], i) => {
    const p = seg(lt, m[i] - .3, m[i] + .6);
    const s = i === 2 ? 52 : 30;
    dino(g, sp, { x, y: 900, s, t, walk: .25, phase: lt * .1 + i, alpha: lerp(.25, 1, ss(p)), tint: p < 1 ? ['#050403', .6 * (1 - p)] : null });
    if (p > 0) plaque(g, n, x + (i === 2 ? 80 : 60), 980, { p, size: 26 });
  });
  vignette(g, W, H, .5);
}
function bus(g, x, y, s) {   // a school bus, 12 m, in ivory with gold keylines
  const P = [[0, 0], [12, 0], [12, 2.6], [11.4, 3.1], [.6, 3.1], [0, 2.6]].map(([a, b]) => [x + a * s, y - (b + .4) * s]);
  airbrush(g, P, { base: C.ivoryD, dark: '#6a5a40', light: C.ivory, dir: -2.3 }); gline(g, [...P, P[0]], { w: 1.6 });
  for (let i = 0; i < 9; i++) { const R = [[1 + i * 1.15, 1.6], [1.9 + i * 1.15, 1.6], [1.9 + i * 1.15, 2.6], [1 + i * 1.15, 2.6]].map(([a, b]) => [x + a * s, y - (b + .4) * s]); airbrush(g, R, { base: '#1a2420', light: '#4a6a64' }); }
  for (const a of [2, 9.6]) { g.beginPath(); g.arc(x + a * s, y - .45 * s, .5 * s, 0, TAU); g.fillStyle = '#1a1410'; g.fill(); gline(g, arcPts(x + a * s, y - .45 * s, .5 * s, 0, TAU, 20), { w: 1 }); }
}
function elephant(g, x, y, s) {
  const P = [[-2.2, 1.2], [-2.0, 2.6], [-1.2, 3.1], [.6, 3.1], [1.6, 2.9], [2.1, 2.4], [2.3, 1.6], [2.5, .8], [2.3, .3], [2.0, .6], [2.0, 1.4], [1.7, 1.2], [1.7, 0], [1.1, 0], [1.1, 1.0], [-1.2, 1.0], [-1.2, 0], [-1.8, 0], [-1.8, 1.0]].map(([a, b]) => [x + a * s, y - b * s]);
  airbrush(g, P, { base: '#5a5a58', dark: '#1a1a18', light: '#9a9a96', dir: -2.3 }); gline(g, [...P, P[0]], { w: 1.2, alpha: .7 });
}
export function scale(g, lt, D, t, o) {
  bg(g, '#120d08', '#050403');
  sunburst(g, 960, 860, { rays: 56, r0: 0, r1: 1700, a0: Math.PI, a1: TAU, mode: 'wedges', colorA: 'rgba(201,162,75,.05)' });
  gline(g, [[0, 860], [W, 860]], { w: 2 });
  const m = o.marks, s = 60, x0 = 140 + 14 * s;
  dino(g, 'diplodocus', { x: x0, y: 860, s, t, walk: .2, phase: lt * .1 });
  const pb = seg(lt, m[0] + 1.2, m[0] + 2);
  if (pb > 0) { g.save(); g.globalAlpha = eo(pb); bus(g, 300, 860, s * .8); g.restore(); plaque(g, 'SCHOOL BUS · 12 M', 300 + 12 * s * .4, 640, { p: pb, size: 22 }); }
  const pe = seg(lt, m[1], m[1] + .8);
  if (pe > 0) { g.save(); g.globalAlpha = eo(pe); for (let i = 0; i < 4; i++) elephant(g, 1180 + i * 150, 860, s * .45); g.restore(); plaque(g, 'SEVERAL ELEPHANTS', 1400, 640, { p: pe, size: 22 }); }
  ruler(g, 140, 950, 140 + 25 * s, 25, { p: seg(lt, m[2], m[2] + 1.6), label: '25 METRES', step: 1 });
  vignette(g, W, H, .5);
}
export function peaceful(g, lt, D, t, o) {
  const cam = { x: lerp(-4, 4, lt / D), y: 1.7, z: 0, f: 1000, oy: 470 };
  const herd = [['diplodocus', -24, 30, 1], ['apatosaurus', 8, 40, 1], ['diplodocus', 34, 56, -1], ['brachiosaurus', -50, 80, 1]];
  const actors = herd.map(([sp, X, Z, f], i) => { const XX = X + f * lt * .9; return A.dino(sp, XX, Z, { flip: f, t, walk: .7, phase: walkPh(sp, XX), dark: Z > 60 ? .3 : .1 }); });
  actors.push(A.soldier(-2.5, 4.5, { pose: 'stand', flip: 1, t }), A.soldier(-1, 5.2, { pose: 'sentry', flip: 1, t }), A.soldier(1.8, 4.8, { pose: 'stand', flip: 1, t }));
  world(g, t, cam, { river: 14, riverW: 12, mist: .6, actors, plants: .35, dusk: .2 });
  vignette(g, W, H, .45);
}
// a sauropod foot lands next to a soldier
export function footfall(g, lt, D, t, o) {
  const m = o.marks;
  const hit = m[0] + .3, shake = lt > hit && lt < hit + .6 ? Math.sin(lt * 70) * 8 * (1 - seg(lt, hit, hit + .6)) : 0;
  g.save(); g.translate(0, shake);
  const cam = { x: 0, y: .8, z: 0, f: 900, oy: 620, pitch: .12 };
  const X = lerp(-8, 3.5, seg(lt, 0, hit + .2));
  world(g, t, cam, { river: 0, mist: .3, plants: .7, actors: [A.dino('apatosaurus', X, 9.5, { t, walk: lt < hit + .2 ? 1 : .1, phase: walkPh('apatosaurus', X) + .25 }), A.soldier(1.4, 5, { pose: lt > hit ? 'kneel' : 'stand', flip: -1, t })] });
  if (lt > hit) { const k = seg(lt, hit, hit + 1.2); for (let i = 0; i < 3; i++) gline(g, arcPts(1100, 980, (80 + i * 70) * (.4 + k), Math.PI * 1.05, Math.PI * 1.95, 30, (16 + i * 10) * (.4 + k)), { w: 2.4 * (1 - k), alpha: 1 - k }); }
  g.restore();
  vignette(g, W, H, .5);
}
// the tail: a whip, and the speed dial that changes its mind
export function tailWhip(g, lt, D, t, o) {
  bg(g, '#0d0b09', '#050403');
  const m = o.marks;
  sunburst(g, 640, 980, { rays: 40, r0: 0, r1: 1500, a0: Math.PI, a1: TAU, mode: 'wedges', colorA: 'rgba(201,162,75,.05)' });
  // a diplodocus seen from behind-left, tail toward us (profile, big scale), tail crack at the marks
  const crack = (tc) => seg(lt, tc - .25, tc + .15);
  const c1 = crack(m[0] + 1.6), c2 = crack(m[3] + .8);
  const amp = Math.sin(Math.max(c1, c2) * Math.PI) * 1.5;
  dino(g, 'diplodocus', { x: 1180, y: 940, s: 46, t: t + amp * 3, tail: 1 + amp * 3, flip: -1, walk: .2, phase: lt * .1 });
  const tip = [1180 + 14 * 46, 940 - 1.9 * 46];
  if (c1 > 0 && c1 < 1) speedLines(g, tip[0], tip[1], -Math.PI / 2, { n: 6, len: 300, spread: 120, w: 4, alpha: 1 - c1 });
  if (c2 > 0 && c2 < 1) speedLines(g, tip[0], tip[1], -Math.PI / 2, { n: 6, len: 300, spread: 120, w: 4, alpha: 1 - c2 });
  // speed dial (Mach)
  let v = .05;
  if (lt > m[0] + .8) v = lerp(.05, .9, mech(seg(lt, m[0] + .8, m[0] + 2.4)));
  if (lt > m[2] + .6) v = lerp(.9, .1, mech(seg(lt, m[2] + .6, m[2] + 2.4)));
  dial(g, 480, 520, 260, v, { labels: ['0', '', '', 'MACH ½', '', '', 'MACH 1'] });
  label(g, 'TAIL-TIP SPEED', 480, 610, { size: 22 });
  plaque(g, '1990s: SUPERSONIC?', 480, 700, { p: seg(lt, m[0] + .3, m[0] + 1) * (1 - seg(lt, m[2], m[2] + .4)), size: 24 });
  plaque(g, '2022 MODEL: FAST, NOT SUPERSONIC', 480, 700, { p: seg(lt, m[2] + .4, m[2] + 1.1), size: 22 });
  titleBar(g, 'THE TAIL', 960, 130, { p: seg(lt, 0, 1), size: 52 });
  vignette(g, W, H, .5);
}
