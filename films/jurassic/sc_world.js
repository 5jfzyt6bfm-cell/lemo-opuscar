// Chapters 3–6: day one, the plants, the air, water, food.
import { C, TAU, clamp, lerp, seg, ss, eio, eo, ei, back, mix, rgba, gline, airbrush, toPath, sunburst, fan, glow, sparkle, vignette, arcPts, stepArchPts, hash } from './engine/deco.js';
import { W, H, tw, mech, bg, label, plaque, ruler, crossOut, world, A, threatBoard, goldText, titleBar, decoDigits, dial, FONTS, buildSign, drawSign, litSequence, dino, soldier } from './common.js';
import { conifer, treeFern, cycad, ginkgo, horsetails, ferns } from './plants.js';

// soldiers in a loose group at world X,Z
const squad = (n, X, Z, o = {}, seed = 1) => Array.from({ length: n }, (_, i) => A.soldier(X + (hash(i * 3.7 + seed) - .5) * (o.spread || 8), Z + (hash(i * 5.1 + seed) - .5) * (o.depth || 4), { pose: o.poses ? o.poses[i % o.poses.length] : 'stand', flip: hash(i + seed * 9) > .5 ? 1 : -1, phase: hash(i) + (o.t || 0), t: o.t || 0, nvg: o.nvg }));

export function calmPlain(g, lt, D, t, o) {
  const cam = { x: lerp(-6, 6, lt / D), y: 2.2, z: lerp(-4, 0, lt / D), f: 1100, oy: 560 };
  world(g, t, cam, { mist: .5, river: 40, riverW: 14, actors: [...squad(14, 0, 18, { t, poses: ['stand', 'sentry', 'stand', 'walk'] }, 2)], clearing: [0, 18, 14, 10] });
  vignette(g, W, H, .45);
}
// lateral track along the bank, each plant group gets a plaque as it passes
export function plantTrack(g, lt, D, t, o) {
  const cam = { x: lerp(-40, 40, lt / D), y: 1.8, z: 0, f: 1000, oy: 520 };
  const C_ = world(g, t, cam, { river: 22, riverW: 8, mist: .3, plants: .9 });
  const items = [['FLOODPLAINS', 0], ['SLOW RIVERS', 1], ['CONIFERS', 2], ['TREE FERNS', 3], ['CYCADS', 4], ['GINKGO', 5], ['HORSETAILS', 6]];
  const m = o.marks;
  items.forEach(([n, i]) => { const a = m[i], b = (m[i + 1] ?? D) + .2; const p = seg(lt, a, a + .5) * (1 - seg(lt, b, b + .4)); if (p > 0) plaque(g, n, 960, 160, { p, size: 30 }); });
  // near foreground specimen sliding past, matched to the plaque
  const kinds = [null, null, conifer, treeFern, cycad, ginkgo, horsetails];
  let cur = -1; for (let i = 0; i < 7; i++) if (lt >= m[i]) cur = i;
  if (cur >= 2) { const a = m[cur], u = seg(lt, a - .2, a + 4.5); const x = lerp(1700, 1250, eo(u)); kinds[cur](g, x, 1110, cur === 2 ? 1100 : cur === 5 ? 900 : cur === 3 ? 780 : 520, { sway: t }); }
  vignette(g, W, H, .45);
}
export function missing(g, lt, D, t, o) {
  const cam = { x: 0, y: .9, z: 0, f: 900, oy: 380 };
  world(g, t, cam, { river: 0, plants: 1, mist: .4 });
  ferns(g, 300, 1120, 380, { sway: t, n: 9 }); ferns(g, 1650, 1120, 420, { sway: t + 2, n: 9 }); horsetails(g, 1000, 1110, 520, { sway: t, n: 9 });
  const xs = [700, 1220], names = ['NO GRASS', 'NO FLOWERS'];
  for (let i = 0; i < 2; i++) {
    const a = o.marks[i], p = seg(lt, a - .2, a + .4); if (p <= 0) continue;
    const cx = xs[i], cy = 360, r = 120 * eo(p);
    g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fillStyle = 'rgba(8,6,4,.88)'; g.fill(); gline(g, arcPts(cx, cy, r, 0, TAU, 60), { w: 2.4 });
    if (i === 0) for (let k = -3; k <= 3; k++) gline(g, [[cx + k * 14, cy + 60], [cx + k * 18, cy - 40 - (3 - Math.abs(k)) * 12]], { w: 2 });
    else { for (let k = 0; k < 5; k++) { const ang = k / 5 * TAU - Math.PI / 2; gline(g, arcPts(cx + Math.cos(ang) * 28, cy - 10 + Math.sin(ang) * 28, 24, 0, TAU, 20), { w: 2 }); } }
    crossOut(g, cx, cy, r * .7, seg(lt, a + .2, a + .7));
    label(g, names[i], cx, cy + r + 46, { size: 28, alpha: ss(p) });
  }
  vignette(g, W, H, .5);
}
export function board(g, lt, D, t, o) {
  bg(g, '#120d08', '#050403');
  threatBoard(g, t, { p: 1, cur: o.cur, hl: ss(seg(lt, .3, 1.0)) });
}
// the air: two gauges
export function gauges(g, lt, D, t, o) {
  bg(g, '#0d0b09', '#050403');
  sunburst(g, 960, 700, { rays: 44, r0: 0, r1: 1500, a0: Math.PI, a1: TAU, mode: 'wedges', colorA: 'rgba(63,154,127,.07)' });
  const m = o.marks;
  // CO2: today 420 ppm vs Jurassic "several times higher"
  const co2 = .14 + (lt > m[0] + 1 ? mech(seg(lt, m[0] + 1, m[0] + 3)) * .46 : 0);   // 420 ppm today → ~1,800 ppm
  dial(g, 540, 640, 300, co2, { labels: ['0', '½', '1', '1½', '2', '2½', '3'] });
  label(g, 'CARBON DIOXIDE · THOUSAND PPM', 540, 740, { size: 24 });
  plaque(g, 'SEVERAL TIMES TODAY', 540, 820, { p: seg(lt, m[0] + 2.5, m[0] + 3.2), size: 24 });
  // O2: the needle cannot settle
  const unc = seg(lt, m[1], m[1] + .6), o2 = .5 + Math.sin(t * 2.3) * .14 * unc + Math.sin(t * 5.1) * .03 * unc;
  g.save(); g.globalAlpha = ss(seg(lt, m[1] - .4, m[1] + .3));
  dial(g, 1380, 640, 300, lt < m[1] ? .5 : o2, { labels: ['–', '', '', 'TODAY', '', '', '+'] });
  label(g, 'OXYGEN', 1380, 740, { size: 26 });
  plaque(g, 'BREATHABLE', 1380, 820, { p: seg(lt, m[3], m[3] + .6), size: 24 });
  g.restore();
  titleBar(g, 'THE AIR', 960, 150, { p: seg(lt, 0, 1), size: 56 });
  vignette(g, W, H, .55);
}
// heat: soldiers sit heavy; a season wheel turns dry/wet
export function heat(g, lt, D, t, o) {
  const cam = { x: 0, y: 1.6, z: lerp(0, 2, lt / D), f: 1000, oy: 600 };
  const sq = Array.from({ length: 9 }, (_, i) => A.soldier((i - 4) * 2.2 + (hash(i) - .5), 9 + hash(i * 3) * 4, { pose: i % 3 === 1 ? 'stand' : 'sit', flip: i % 2 ? 1 : -1, t }));
  world(g, t, cam, { heat: 1, river: 0, plants: .5, actors: sq, clearing: [0, 10, 16, 8], sunX: 0 });
  const p = seg(lt, o.marks[1] - .2, o.marks[1] + .6);
  if (p > 0) {   // season wheel
    const cx = 1660, cy = 240, r = 130 * eo(p), rot = lt * .5;
    g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fillStyle = 'rgba(8,6,4,.85)'; g.fill();
    for (let k = 0; k < 8; k++) { const a0 = rot + k / 8 * TAU, a1 = a0 + TAU / 8; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r * .9, a0, a1); g.closePath(); g.fillStyle = k % 4 < 3 ? rgba('#c9802b', .55) : rgba('#3f9a7f', .7); g.fill(); }
    gline(g, arcPts(cx, cy, r, 0, TAU, 60), { w: 2.4 });
    label(g, 'LONG DRY · SHORT WET', cx, cy + r + 40, { size: 20, alpha: ss(p) });
  }
  plaque(g, 'HOT · SEMI-ARID', 960, 120, { p: seg(lt, o.marks[0] - .2, o.marks[0] + .5), size: 28 });
  vignette(g, W, H, .45);
}
// litres: a drum counter rolls up to 600 L a day
export function litres(g, lt, D, t, o) {
  bg(g, '#0d0b09', '#050403');
  sunburst(g, 960, 540, { rays: 60, r0: 0, r1: 1500, mode: 'wedges', colorA: 'rgba(63,154,127,.06)' });
  const m = o.marks;
  // a jerrycan per soldier: a 10×10 grid of droplets fills
  const fill = seg(lt, m[1], m[2] + 1.5);
  for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), c = i % 10, x = 560 + c * 48, y = 280 + r * 52, l = fill * 100 > i ? 1 : 0;
    const P = [[x, y - 18], [x + 12, y + 2], [x + 10, y + 12], [x, y + 18], [x - 10, y + 12], [x - 12, y + 2]];
    airbrush(g, P, { base: l ? '#3f9a7f' : '#1a2420', dark: l ? '#0b2e26' : '#0a0e0c', light: l ? '#a8e0cc' : '#2a3430' }); }
  const L = Math.round(lerp(0, 600, eio(seg(lt, m[1] + .5, m[2] + 1.5))));
  decoDigits(g, `${L} L`, 1380, 520, 130);
  label(g, 'A DAY', 1380, 600, { size: 30 });
  plaque(g, '≈ 6 L PER PERSON IN THE HEAT', 1380, 720, { p: seg(lt, m[1] + .3, m[1] + 1), size: 22 });
  titleBar(g, 'WATER', 960, 130, { p: seg(lt, 0, 1), size: 56 });
  vignette(g, W, H, .55);
}
// at the river: filtering water; something across the water in the trees
export function river(g, lt, D, t, o) {
  const cam = { x: lerp(-3, 3, lt / D), y: 1.5, z: 0, f: 1000, oy: 470 };
  const m = o.marks, lurk = seg(lt, m[2] - .5, m[2] + 1.5);
  const actors = [A.soldier(-3, 7, { pose: 'crouch', flip: 1, t }), A.soldier(-1.2, 7.6, { pose: 'crouch', flip: 1, t }), A.soldier(1.5, 6.6, { pose: 'sentry', flip: 1, t }), A.soldier(3.6, 8.5, { pose: 'stand', flip: -1, t }),
    A.dino('allosaurus', 6, 30, { flip: -1, t, walk: 0, dark: lerp(.85, .45, lurk), neck: -6 }),
    A.dino('stegosaurus', -20, 34, { flip: 1, t, walk: .6, phase: lt * .25, dark: .4 }), A.dino('apatosaurus', -60, 70, { flip: 1, t, walk: .5, phase: lt * .12, dark: .55 })];
  world(g, t, cam, { river: 9, riverW: 14, mist: .4, actors, plants: 1 });
  if (lt > m[0] - .3) plaque(g, 'TABLETS · FILTERS', 480, 150, { p: seg(lt, m[0] - .3, m[0] + .4) * (1 - seg(lt, m[1], m[1] + .4)), size: 24 });
  vignette(g, W, H, .5);
}
// rations count down
export function rations(g, lt, D, t, o) {
  bg(g, '#120d08', '#050403');
  sunburst(g, 960, 560, { rays: 60, r0: 0, r1: 1500, mode: 'wedges', colorA: 'rgba(201,162,75,.05)' });
  const m = o.marks, left = 3 - Math.floor(clamp((lt - m[1]) / 1.0, 0, 3));
  for (let i = 0; i < 3; i++) { const x = 680 + i * 280, y = 520, on = i < left; const P = [[x - 110, y - 90], [x + 110, y - 90], [x + 110, y + 90], [x - 110, y + 90]];
    airbrush(g, P, { base: on ? '#6a5a3a' : '#1a1610', dark: '#1a140c', light: on ? '#a89060' : '#2a2418', dir: -2.3 }); gline(g, [...P, P[0]], { w: 2, alpha: on ? 1 : .4 });
    gline(g, [[x - 110, y - 40], [x + 110, y - 40]], { w: 1.2, alpha: on ? 1 : .4 }); label(g, 'DAY ' + (i + 1), x, y + 30, { size: 26, alpha: on ? 1 : .35 }); }
  titleBar(g, 'RATIONS', 960, 200, { p: seg(lt, 0, 1), size: 56 });
  if (left === 0) plaque(g, 'THEN WHAT?', 960, 800, { p: seg(lt, m[1] + 3, m[1] + 3.6), size: 30 });
  vignette(g, W, H, .55);
}
// toxic plants: specimen plates
export function toxic(g, lt, D, t, o) {
  bg(g, '#0d0b09', '#050403');
  const m = o.marks;
  const plates = [[560, 'CYCADS', 'LIVER · NERVOUS SYSTEM', (x, y) => cycad(g, x, y, 330, { sway: t })], [1360, 'FERNS · HORSETAILS', 'DESTROY VITAMIN B1', (x, y) => { horsetails(g, x + 60, y, 360, { n: 6 }); ferns(g, x - 90, y, 200, { sway: t }); }]];
  plates.forEach(([cx, n, sub, f], i) => {
    const p = seg(lt, i ? m[1] - .3 : 0, (i ? m[1] - .3 : 0) + .8); if (p <= 0) return;
    const P = stepArchPts(cx, 900, 560, 760, { steps: 3 });
    g.save(); g.globalAlpha *= eo(p); g.fillStyle = 'rgba(14,10,6,.95)'; g.fill(toPath(P, true)); gline(g, P, { w: 2.4 });
    g.save(); g.clip(toPath(P, true)); f(cx, 760); g.restore();
    label(g, n, cx, 820, { size: 26 }); g.restore();
    plaque(g, sub, cx, 120 + 0, { p: seg(lt, (i ? m[1] : m[0]) + .3, (i ? m[1] : m[0]) + 1), size: 24, color: '#e8735a' });
  });
  if (lt > m[2]) { const k = seg(lt, m[2], m[2] + 1); g.fillStyle = rgba('#3a0c08', .25 * k); g.fillRect(0, 0, W, H); }
  vignette(g, W, H, .55);
}
// small animals on specimen plates
function lungfish(g, x, y, s) { const P = [[-1, 0], [-.6, -.18], [0, -.2], [.6, -.14], [.95, -.04], [1, .04], [.6, .14], [0, .2], [-.6, .16]].map(([a, b]) => [x + a * s, y + b * s]); airbrush(g, P, { base: '#5a6a4a', dark: '#1a2010', light: '#a0b080' }); gline(g, P.concat([P[0]]), { w: 1.2 }); for (const [a, b] of [[.2, .2], [-.2, .2]]) gline(g, [[x + a * s, y + b * s * .8], [x + (a - .15) * s, y + (b + .25) * s]], { w: 1.2 }); g.beginPath(); g.arc(x + .75 * s, y - .05 * s, s * .03, 0, TAU); g.fillStyle = '#111'; g.fill(); }
function mammal(g, x, y, s) { const P = [[-.9, .1], [-.6, -.25], [0, -.32], [.5, -.25], [.85, -.08], [1, 0], [.8, .08], [.4, .18], [-.6, .2]].map(([a, b]) => [x + a * s, y + b * s]); airbrush(g, P, { base: '#6a4a30', dark: '#20140c', light: '#b08a60' }); gline(g, [[x - .9 * s, y + .1 * s], [x - 1.5 * s, y + .25 * s]], { w: 2 }); for (const a of [-.5, .5]) gline(g, [[x + a * s, y + .15 * s], [x + a * s, y + .38 * s]], { w: 2 }); g.beginPath(); g.arc(x + .7 * s, y - .1 * s, s * .04, 0, TAU); g.fillStyle = '#111'; g.fill(); }
function lizard(g, x, y, s) { const P = [[-1.5, .05], [-.6, -.08], [0, -.12], [.6, -.1], [.95, -.02], [.6, .08], [0, .1], [-.6, .07]].map(([a, b]) => [x + a * s, y + b * s]); airbrush(g, P, { base: '#4a6a3a', dark: '#14200c', light: '#8aaa6a' }); for (const a of [-.4, .4]) for (const d of [-1, 1]) gline(g, [[x + a * s, y], [x + (a + .15 * d) * s, y + .25 * s]], { w: 1.6 }); }
function croc(g, x, y, s) { const P = [[-1.6, .02], [-.8, -.12], [0, -.18], [.5, -.14], [.75, -.06], [1.3, -.04], [1.3, .02], [.75, .06], [0, .14], [-.8, .08]].map(([a, b]) => [x + a * s, y + b * s]); airbrush(g, P, { base: '#4a4a32', dark: '#14140c', light: '#8a8a60' }); gline(g, P.concat([P[0]]), { w: 1 }); for (let i = 0; i < 10; i++) { const a = -.8 + i * .14; g.beginPath(); g.arc(x + a * s, y - .17 * s, s * .02, 0, TAU); g.fillStyle = '#8a8a60'; g.fill(); } for (const a of [-.4, .35]) gline(g, [[x + a * s, y + .1 * s], [x + (a + .1) * s, y + .3 * s]], { w: 2 }); }
export function specimens(g, lt, D, t, o) {
  bg(g, '#0d0b09', '#050403');
  titleBar(g, 'THE SAFEST FOOD', 960, 120, { p: seg(lt, 0, 1), size: 50 });
  const m = o.marks, cells = [['FISH', lungfish], ['LUNGFISH', lungfish], ['SMALL MAMMALS', mammal], ['LIZARDS', lizard], ['EARLY CROCODILE KIN', croc]];
  cells.forEach(([n, f], i) => {
    const p = seg(lt, m[i] - .2, m[i] + .5); if (p <= 0) return;
    const cx = 260 + i * 350, cy = 560, w = 300, h = 380;
    const P = stepArchPts(cx, cy + h / 2, w, h, { steps: 3 });
    g.save(); g.globalAlpha *= eo(p); g.fillStyle = 'rgba(14,10,6,.95)'; g.fill(toPath(P, true)); gline(g, P, { w: 2 });
    sunburst(g, cx, cy + h / 2, { rays: 20, r0: 0, r1: h * .8, a0: Math.PI, a1: TAU, mode: 'lines', w: .8, alpha: .25 });
    f(g, cx, cy + 40, i === 4 ? 70 : i === 0 ? 60 : 85);
    label(g, n, cx, cy + h / 2 + 40, { size: 20 }); g.restore();
  });
  vignette(g, W, H, .55);
}
// something bigger: a giant foot plants beside the soldiers
export function bigFoot(g, lt, D, t, o) {
  const m = o.marks, step = mech(seg(lt, m[1] - .6, m[1] + .2));
  const shake = lt > m[1] + .2 && lt < m[1] + .7 ? Math.sin(lt * 80) * 6 * (1 - seg(lt, m[1] + .2, m[1] + .7)) : 0;
  g.save(); g.translate(0, shake);
  const cam = { x: 0, y: 1.6, z: 0, f: 1000, oy: 470 };
  const C_ = world(g, t, cam, { river: 26, riverW: 10, mist: .3, actors: [A.soldier(-1.6, 6, { pose: 'stand', flip: 1, t }), A.soldier(-.4, 6.8, { pose: 'sentry', flip: 1, t })], plants: .8 });
  // the leg comes down from out of frame (Brachiosaurus fore limb, real scale)
  const X = 3.5, Z = 7, [px, py] = C_.P(X, 0, Z), s = C_.scaleAt(X, 0, Z), lift = (1 - step) * 3.5;
  const top = py - (6 + lift) * s, bot = py - lift * s, w0 = .62 * s, w1 = .5 * s;
  airbrush(g, [[px - w0, top], [px + w0, top], [px + w1, bot - .3 * s], [px + w1 * 1.25, bot], [px - w1 * 1.2, bot], [px - w1, bot - .3 * s]], { base: '#5a5446', dark: '#18160e', light: '#9a9276', dir: -2.2, rim: 2, rimColor: C.gold2 });
  if (step > .95) { const k = seg(lt, m[1] + .2, m[1] + 1.2); for (let i = 0; i < 3; i++) gline(g, arcPts(px, py, (60 + i * 50) * (.5 + k), Math.PI * 1.05, Math.PI * 1.95, 30, (12 + i * 8) * (.5 + k)), { w: 2 * (1 - k), alpha: 1 - k }); }
  g.restore();
  vignette(g, W, H, .5);
}
