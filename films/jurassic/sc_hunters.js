// Chapters 8–12: night three, Allosaurus, the quarry, weapons, Big Al, the other predators, Stegosaurus.
import { C, TAU, clamp, lerp, seg, ss, eio, eo, ei, back, mix, rgba, gline, airbrush, toPath, sunburst, fan, glow, sparkle, vignette, arcPts, stepArchPts, hash, speedLines } from './engine/deco.js';
import { W, H, tw, mech, bg, label, plaque, ruler, world, A, threatBoard, goldText, titleBar, decoDigits, dial, clockFace, FONTS, dino, soldier, SPECIES, buildSign, drawSign, litSequence } from './common.js';
import { skeleton, stride } from './dinos.js';
import { ferns, horsetails } from './plants.js';

const walkPh = (sp, metres) => metres / stride(sp);
function tent(g, C_, X, Z, w = 2.4) {
  const [px, py] = C_.P(X, 0, Z), s = C_.scaleAt(X, 0, Z);
  const P = [[px - w * s, py], [px, py - 1.3 * s], [px + w * s, py]];
  airbrush(g, P, { base: '#5a3a26', dark: '#1a0e08', light: '#8a6040', dir: -2.3 }); gline(g, [...P], { w: 1.2, alpha: .6 });
}
export function nightCamp(g, lt, D, t, o) {
  const m = o.marks, cam = { x: lerp(-2, 2, lt / D), y: 1.7, z: 0, f: 1000, oy: 500 };
  const actors = [A.fn(14, (g, C_) => tent(g, C_, -6, 14)), A.fn(16, (g, C_) => tent(g, C_, 4, 16)), A.fn(19, (g, C_) => tent(g, C_, -1, 19, 2)),
    A.soldier(-3, 8, { pose: 'sentry', flip: 1, t, nvg: true }), A.soldier(5, 9, { pose: lt > m[0] ? 'kneel' : 'stand', flip: -1, t, nvg: true }), A.soldier(1, 11, { pose: 'sit', flip: 1, t }),
    A.fn(12, (g, C_) => { if (lt > m[0] - .3) { const [px, py] = C_.P(-8, 0, 12), s = C_.scaleAt(0, 0, 12); airbrush(g, [[px - 1.5 * s, py], [px + 1.5 * s, py], [px + 1.2 * s, py - .4 * s * eo(seg(lt, m[0], m[0] + 1))], [px - 1.2 * s, py - .4 * s * eo(seg(lt, m[0], m[0] + 1))]], { base: '#4a3a24', light: '#7a6040' }); } })];
  world(g, t, cam, { night: 1, river: 26, riverW: 12, mist: .5, actors, plants: .9, clearing: [0, 14, 12, 8] });
  // night vision: a scope circle sweeps the tree line
  const nv = seg(lt, m[2] - .2, m[2] + .4);
  if (nv > 0) {
    const cx = lerp(700, 1220, ss(seg(lt, m[2], D))), cy = 420, r = 300 * eo(nv);
    g.save(); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.clip();
    world(g, t, { x: lerp(-2, 2, lt / D), y: 1.7, z: 0, f: 2600, oy: 500 + (500 - cy) * 0 }, { night: .2, river: 26, riverW: 12, plants: 1, nv: 1, sun: 0, actors: [A.dino('allosaurus', 6, 40, { flip: -1, t, walk: seg(lt, m[3], D) > 0 ? .6 : 0, phase: lt * .5, dark: .3 })] });
    for (let y = cy - r; y < cy + r; y += 4) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(cx - r, y, 2 * r, 1.5); }
    g.restore();
    gline(g, arcPts(cx, cy, r, 0, TAU, 100), { w: 3, color: '#7dff9a', glow: .5 }); gline(g, [[cx - r, cy], [cx + r, cy]], { w: 1, color: '#7dff9a', alpha: .5 }); gline(g, [[cx, cy - r], [cx, cy + r]], { w: 1, color: '#7dff9a', alpha: .5 });
  }
  vignette(g, W, H, .6);
}
export function alloReveal(g, lt, D, t, o) {
  const cam = { x: 0, y: 2.4, z: 0, f: 1000, oy: 560 };
  const X = lerp(10, 4, eo(seg(lt, 0, 1.2)));
  world(g, t, cam, { night: .85, river: 0, plants: .9, mist: .3, actors: [A.dino('allosaurus', X, 9, { flip: -1, t, walk: 1, phase: walkPh('allosaurus', X), jaw: ss(seg(lt, .4, .9)) * .7, neck: 4 })] });
  ferns(g, 1700, 1120, 520, { sway: t * 3, n: 9, dark: .5 });
  vignette(g, W, H, .6);
}
export function alloSpec(g, lt, D, t, o) {
  bg(g, '#0d0b09', '#050403');
  const m = o.marks, s = 150, x0 = 960 - .4 * s;
  sunburst(g, 960, 900, { rays: 56, r0: 0, r1: 1700, a0: Math.PI, a1: TAU, mode: 'wedges', colorA: 'rgba(201,162,75,.05)' });
  gline(g, [[0, 900], [W, 900]], { w: 2 });
  const info = dino(g, 'allosaurus', { x: x0, y: 900, s, t, walk: .3, phase: lt * .15, jaw: ss(seg(lt, m[1] + 2.2, m[1] + 2.8)) * .8 });
  ruler(g, x0 - 4.7 * s, 960, x0 + 3.9 * s, 8.6, { p: seg(lt, m[0], m[0] + 1.5), label: '8 – 9 METRES' });
  const marks = [['LONG LEGS', 760, 640, m[1] + .2], ['BIG SKULL', 1500, 150, m[1] + 1.0], ['SERRATED TEETH', 1500, 470, m[1] + 2.0]];
  for (const [n, x, y, a] of marks) plaque(g, n, x, y, { p: seg(lt, a, a + .6), size: 24 });
  plaque(g, 'MOST COMMON LARGE PREDATOR', 960, 90, { p: seg(lt, m[2], m[2] + .7), size: 26 });
  vignette(g, W, H, .5);
}
// the Cleveland-Lloyd quarry: a bone bed from above
const BONES = (() => { const out = []; let s = 5; const R = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 260; i++) out.push({ x: 120 + R() * 1680, y: 160 + R() * 760, a: R() * TAU, l: 20 + R() * 70, skull: R() < .12 }); return out; })();
export function quarry(g, lt, D, t, o) {
  const m = o.marks;
  bg(g, '#5a4430', '#3a2a1c');
  for (let i = 0; i < 9; i++) { g.fillStyle = rgba(i % 2 ? '#6a5038' : '#4a3626', .5); g.fillRect(0, i * 120, W, 60); }
  const shown = Math.floor(BONES.length * eo(seg(lt, m[1] - .2, m[2] + .8)));
  const pred = seg(lt, m[4], m[4] + .8);
  for (let i = 0; i < shown; i++) {
    const b = BONES[i];
    if (b.skull) { const c = pred > 0 ? mix(C.gold1, '#e8735a', pred) : null; g.save(); g.translate(b.x, b.y); g.rotate(b.a); const P = [[-30, -10], [0, -16], [30, -6], [34, 4], [0, 10], [-28, 8]]; airbrush(g, P, { base: '#e8dcc0', dark: '#8a7a5a', light: '#fff' }); gline(g, [...P, P[0]], { w: 1.4, color: c }); if (pred > 0) glow(g, 0, 0, 60, '#e8735a', .4 * pred); g.restore(); }
    else { const dx = Math.cos(b.a) * b.l / 2, dy = Math.sin(b.a) * b.l / 2; g.save(); g.lineCap = 'round'; g.strokeStyle = '#e0d2b2'; g.lineWidth = 7; g.beginPath(); g.moveTo(b.x - dx, b.y - dy); g.lineTo(b.x + dx, b.y + dy); g.stroke(); for (const sg of [-1, 1]) { g.beginPath(); g.arc(b.x + sg * dx, b.y + sg * dy, 6, 0, TAU); g.fillStyle = '#e8dcc0'; g.fill(); } g.restore(); }
  }
  for (let x = 0; x <= W; x += 160) gline(g, [[x, 0], [x, H]], { w: .8, alpha: .35 });
  for (let y = 0; y <= H; y += 160) gline(g, [[0, y], [W, y]], { w: .8, alpha: .35 });
  plaque(g, 'CLEVELAND-LLOYD DINOSAUR QUARRY · UTAH', 960, 90, { p: seg(lt, m[0] - .2, m[0] + .6), size: 28 });
  if (lt > m[2]) plaque(g, 'THOUSANDS OF BONES', 960, 180, { p: seg(lt, m[2], m[2] + .5) * (1 - seg(lt, m[3], m[3] + .3)), size: 24 });
  if (lt > m[4]) plaque(g, 'MOSTLY PREDATORS', 960, 180, { p: pred, size: 26, color: '#e8735a' });
  vignette(g, W, H, .5);
}
// counted light: forty-six individuals
export function count46(g, lt, D, t, o) {
  bg(g, '#0d0b09', '#050403');
  const m = o.marks, T0 = m[1], T1 = m[1] + 3.2;
  for (let i = 0; i < 46; i++) {
    const r = Math.floor(i / 12), c = i % 12, x = 960 + (c - 5.5) * 130 + (r === 3 ? 130 * 1 : 0), y = 330 + r * 140;
    const ti = lerp(T0, T1, i / 45), l = lt > ti ? 1 : 0, fl = l ? 1 + .6 * (1 - seg(lt, ti, ti + .18)) : 0;
    const sz = 1 - (i % 5) * .08;   // different ages
    g.save(); g.translate(x, y); g.scale(sz, sz);
    const P = [[-45, -8], [-20, -22], [10, -20], [44, -8], [48, 4], [10, 10], [-40, 12]];
    airbrush(g, P, { base: l ? '#e8dcc0' : '#2a241a', dark: l ? '#8a7a5a' : '#100c08', light: l ? '#fff' : '#3a3024' });
    gline(g, [...P, P[0]], { w: 1.4, alpha: l ? 1 : .4 });
    g.beginPath(); g.ellipse(4, -6, 12, 6, 0, 0, TAU); g.fillStyle = l ? '#5a4a30' : '#0a0806'; g.fill();
    if (l) glow(g, 0, 0, 70, '#ffcf7a', .3 * fl);
    g.restore();
  }
  const n = Math.min(46, Math.max(0, Math.floor((lt - T0) / (T1 - T0) * 45) + (lt >= T0 ? 1 : 0)));
  decoDigits(g, String(n), 960, 200, 110);
  label(g, 'ALLOSAURUS INDIVIDUALS · AT LEAST', 960, 260, { size: 22, alpha: ss(seg(lt, T0, T0 + .5)) });
  vignette(g, W, H, .55);
}
export function balance(g, lt, D, t, o) {
  bg(g, '#120d08', '#050403');
  const m = o.marks;
  sunburst(g, 960, 300, { rays: 60, r0: 0, r1: 1500, mode: 'wedges', colorA: 'rgba(201,162,75,.05)' });
  let ang = 0; if (lt > m[0] + 1) ang = -.22 * mech(seg(lt, m[0] + 1, m[0] + 2.2)); if (lt > m[1] + .2) ang = lerp(-.22, .26, mech(seg(lt, m[1] + .2, m[1] + 1.4)));
  const cx = 960, cy = 340, L = 520;
  gline(g, [[cx, cy], [cx, 860]], { w: 4 }); gline(g, [[cx - 140, 860], [cx + 140, 860]], { w: 4 });
  const ex = Math.cos(ang) * L, ey = Math.sin(ang) * L;
  gline(g, [[cx - ex, cy - ey], [cx + ex, cy + ey]], { w: 5, glow: .3 });
  for (const [sg, name, sp] of [[-1, 'PLANT-EATERS', 'stegosaurus'], [1, 'MEAT-EATERS', 'allosaurus']]) {
    const px = cx + sg * ex, py = cy + sg * ey;
    gline(g, [[px, py], [px - 120, py + 180]], { w: 1.4 }); gline(g, [[px, py], [px + 120, py + 180]], { w: 1.4 });
    gline(g, arcPts(px, py + 180, 140, 0, Math.PI, 30, 40), { w: 3 });
    dino(g, sp, { x: px - 10, y: py + 175, s: 22, t, flip: sg < 0 ? 1 : -1 });
    label(g, name, px, py + 270, { size: 24 });
  }
  plaque(g, 'USUALLY', 960, 120, { p: seg(lt, m[0], m[0] + .6) * (1 - seg(lt, m[1], m[1] + .3)), size: 26 });
  plaque(g, 'HERE: FLIPPED', 960, 120, { p: seg(lt, m[1] + .2, m[1] + .8), size: 26, color: '#e8735a' });
  vignette(g, W, H, .55);
}
export function hypotheses(g, lt, D, t, o) {
  bg(g, '#0d0b09', '#050403');
  const m = o.marks, xs = [480, 960, 1440], names = ['TRAPPED IN MUD', 'DROUGHT', 'FLOODS'];
  titleBar(g, 'WHAT HAPPENED?', 960, 130, { p: seg(lt, 0, 1), size: 52 });
  for (let i = 0; i < 3; i++) {
    const p = seg(lt, m[i] - .2, m[i] + .6); if (p <= 0) continue;
    const cx = xs[i], P = stepArchPts(cx, 820, 380, 520, { steps: 3 });
    g.save(); g.globalAlpha *= eo(p); g.fillStyle = 'rgba(14,10,6,.95)'; g.fill(toPath(P, true)); gline(g, P, { w: 2.2 });
    g.save(); g.clip(toPath(P, true));
    if (i === 0) { g.fillStyle = '#4a3a24'; g.fillRect(cx - 200, 700, 400, 140); dino(g, 'allosaurus', { x: cx - 10, y: 760, s: 30, t, flip: 1, walk: 0, neck: 10 }); g.fillStyle = 'rgba(74,58,36,.9)'; g.fillRect(cx - 200, 735, 400, 120); }
    if (i === 1) { sunburst(g, cx, 420, { rays: 24, r0: 40, r1: 260, mode: 'lines', w: 1.4, alpha: .7 }); g.beginPath(); g.arc(cx, 420, 40, 0, TAU); g.fillStyle = C.gold2; g.fill(); g.fillStyle = '#2f6b5a'; g.beginPath(); g.ellipse(cx, 760, 60 * (1 - .5 * seg(lt, m[1], m[1] + 3)), 14, 0, 0, TAU); g.fill(); for (let k = 0; k < 5; k++) gline(g, [[cx - 150 + k * 70, 800], [cx - 120 + k * 70, 780], [cx - 140 + k * 70, 760]], { w: 1.2 }); }
    if (i === 2) { for (let k = 0; k < 5; k++) { const pts = []; for (let x = cx - 200; x <= cx + 200; x += 20) pts.push([x, 520 + k * 50 + Math.sin(x * .03 + t * 2 + k) * 10]); gline(g, pts, { w: 2.2, color: '#3f9a7f' }); } for (let k = 0; k < 8; k++) gline(g, [[cx - 140 + k * 36, 760], [cx - 120 + k * 36, 748]], { w: 3 }); }
    g.restore();
    label(g, names[i], cx, 870, { size: 24 }); g.restore();
  }
  if (lt > m[3]) { const k = seg(lt, m[3], m[3] + .6); goldText(g, '?', 960, 600, { size: 260 * eo(k), font: FONTS.title, alpha: k }); }
  vignette(g, W, H, .55);
}
export function lesson(g, lt, D, t, o) {
  const cam = { x: 0, y: 1.6, z: 0, f: 1000, oy: 480 };
  const X = lerp(-14, -4, ss(seg(lt, 0, D * .7)));
  world(g, t, cam, { river: 14, riverW: 12, mist: .4, dusk: .6, plants: .8, actors: [A.dino('allosaurus', X, 13, { t, walk: lt < D * .7 ? 1 : 0, phase: walkPh('allosaurus', X), neck: lt > D * .7 ? -14 * ss(seg(lt, D * .7, D * .8)) : 0 }), A.dino('allosaurus', 18, 30, { flip: -1, t, dark: .4 }), A.soldier(6, 6, { pose: 'crouch', flip: -1, t }), A.soldier(8, 7, { pose: 'sentry', flip: -1, t })] });
  vignette(g, W, H, .5);
}
// weapons: bullet chart
function cartridge(g, x, y, s, len, w) {
  const P = [[-len / 2, -w], [len * .2, -w], [len * .3, -w * .8], [len * .35, -w * .7], [len / 2, -w * .15], [len / 2, w * .15], [len * .35, w * .7], [len * .3, w * .8], [len * .2, w], [-len / 2, w]].map(([a, b]) => [x + a * s, y + b * s]);
  airbrush(g, P, { base: C.gold1, dark: C.gold0, light: C.goldHi, dir: -Math.PI / 2 }); gline(g, [...P, P[0]], { w: 1.2 });
  const T = [[len * .2, -w], [len * .35, -w * .7], [len / 2, -w * .15], [len / 2, w * .15], [len * .35, w * .7], [len * .2, w]].map(([a, b]) => [x + a * s, y + b * s]); airbrush(g, T, { base: '#b0603a', dark: '#5a2a14', light: '#f0a070' });
}
export function calibers(g, lt, D, t, o) {
  bg(g, '#0d0b09', '#050403');
  const m = o.marks;
  titleBar(g, 'MODERN WEAPONS', 960, 120, { p: seg(lt, 0, 1), size: 50 });
  const rows = [['INFANTRY RIFLE', 57, 5.7, m[0]], ['HUNTERS · ELK', 84, 6, m[2]], ['HUNTERS · BEAR', 91, 7.5, m[2] + .7]];
  rows.forEach(([n, len, w, a], i) => { const p = seg(lt, a, a + .6); if (p <= 0) return; g.save(); g.globalAlpha *= eo(p); cartridge(g, 560, 330 + i * 150, 5, len, w); label(g, n, 560, 400 + i * 150, { size: 22 }); g.restore(); });
  const pa = seg(lt, m[1], m[1] + .7);
  if (pa > 0) { dino(g, 'allosaurus', { x: 1380, y: 820, s: 62, t, alpha: eo(pa), flip: -1 }); plaque(g, 'MULTI-TON', 1380, 880, { p: pa, size: 26 }); }
  if (lt > m[3] + .4) { const k = seg(lt, m[3] + .4, m[3] + .8); gline(g, [[800, 600], [lerp(800, 1300, k), lerp(600, 640, k)]], { w: 2, glow: .8 }); if (k >= 1) { glow(g, 1300, 640, 60, '#ffcf7a', .6 * (1 - seg(lt, m[3] + .8, m[3] + 1.5))); plaque(g, 'ONE SHOT · NOT ENOUGH', 1380, 960, { p: seg(lt, m[3] + .9, m[3] + 1.5), size: 22 }); } }
  vignette(g, W, H, .55);
}
// one hundred don't fire single shots: a symmetric firing line
export function firingLine(g, lt, D, t, o) {
  const m = o.marks;
  const fireOn = lt > m[0] + .5 && lt < m[1] + .5;
  const X = lerp(0, 0, 0), Zd = lerp(60, 34, ss(seg(lt, 0, m[0] + 3)));
  const down = seg(lt, m[0] + 5.5, m[0] + 7.5);
  const actors = [];
  for (let i = 0; i < 12; i++) actors.push(A.soldier((i - 5.5) * 1.6, 6, { pose: 'kneel', flip: 1, t }));
  for (let i = 0; i < 11; i++) actors.push(A.soldier((i - 5) * 1.6, 7.6, { pose: 'aim', flip: 1, t }));
  actors.push(A.fn(Zd, (g, C_) => { const [px, py] = C_.P(0, 0, Zd), s = C_.scaleAt(0, 0, Zd); g.save(); g.translate(px, py); g.rotate(-down * .25); dino(g, 'allosaurus', { x: 0, y: -down * 0, s, flip: -1, t, walk: down > 0 ? 0 : 1, phase: lt * 1.2, jaw: .6 * (1 - down), neck: -down * 20 }); g.restore(); }));
  // camera behind the line, looking along the rifles toward the predator: soldiers face right (+x) in profile → rotate world: use a side view instead
  const cam = { x: 6, y: 1.5, z: -6, f: 1000, oy: 520 };
  bg(g, '#0d0b09', '#050403');
  g.save();
  const C_ = world(g, t, { x: 0, y: 1.6, z: -2, f: 900, oy: 520 }, { river: 0, mist: .3, dusk: .4, plants: .5, actors: [], clearing: [0, 20, 20, 20] });
  // draw the line in side view, big: left half soldiers facing right, predator charging from the right
  for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { const x = 90 + i * 135 + r * 60, y = 860 + r * 90, s = 150 + r * 40; const res = soldier(g, { x, y, s, pose: r ? 'kneel' : 'aim', flip: 1, t }); if (fireOn && Math.sin(t * 22 + i * 1.7 + r) > .55 && res.muzzle) { sunburst(g, res.muzzle[0] + 10, res.muzzle[1], { rays: 12, r0: 4, r1: 46, mode: 'lines', w: 2, alpha: .9 }); glow(g, res.muzzle[0] + 10, res.muzzle[1], 50, '#ffcf7a', .6); } }
  const dx = lerp(2400, 1500, ss(seg(lt, 0, m[0] + 3))) + down * 60;
  g.save(); g.translate(dx, 900); g.rotate(down * .12);
  dino(g, 'allosaurus', { x: 0, y: down * 60, s: 100, flip: -1, t, walk: down > 0 ? 0 : 1, phase: lt * 1.3, jaw: .7 * (1 - down), neck: -down * 25 });
  g.restore();
  g.restore();
  plaque(g, 'CONCENTRATED FIRE', 960, 120, { p: seg(lt, m[0], m[0] + .6) * (1 - seg(lt, m[1], m[1] + .3)), size: 28 });
  plaque(g, 'STAY TOGETHER · KEEP WATCH · REACT FAST', 960, 120, { p: seg(lt, m[1] + .2, m[1] + .8), size: 24 });
  vignette(g, W, H, .5);
}
// ambush at the tree line: hatchet jaw, a few seconds
export function ambush(g, lt, D, t, o) {
  const m = o.marks;
  const strike = seg(lt, m[1] + 1.5, m[1] + 2.1);
  const cam = { x: 0, y: 1.7, z: 0, f: 1000, oy: 520 };
  world(g, t, cam, { dusk: .8, night: .3, river: 0, plants: 1, mist: .5, actors: [A.soldier(-1.5, 5, { pose: 'sentry', flip: 1, t, nvg: true }), A.dino('allosaurus', lerp(6.5, 4.2, strike), 9, { flip: -1, t, jaw: strike > 0 ? Math.sin(strike * Math.PI) * .9 : .1, neck: -6 - 10 * Math.sin(strike * Math.PI), dark: lerp(.6, 0, seg(lt, m[1], m[1] + 1)) })] });
  ferns(g, 1500, 1120, 600, { sway: t * 2, n: 9, dark: .3 }); horsetails(g, 1800, 1120, 700, { n: 8, dark: .3 });
  if (lt > m[1] + .6) { const k = seg(lt, m[1] + .6, m[1] + 1.4); gline(g, arcPts(1220, 470, 180, -2.6, -2.6 + 1.8 * k, 30), { w: 3, glow: .6, color: '#e8735a' }); plaque(g, 'UPPER JAW LIKE A HATCHET', 1240, 160, { p: k, size: 22 }); }
  const pc = seg(lt, m[2], m[2] + .5);
  if (pc > 0) { const secs = Math.max(0, 3 - Math.floor((lt - m[2]) * .9)); clockFace(g, 240, 260, 120 * eo(pc), { h: 0, m: 0, s: 60 - secs, roman: false }); label(g, secs + ' SECONDS', 240, 440, { size: 26, alpha: pc }); }
  vignette(g, W, H, .55);
}
// Big Al: a gold skeleton with nineteen injuries
const INJ = [[.25, .45], [.3, .55], [.35, .5], [.4, .6], [.45, .52], [.5, .58], [.55, .5], [.6, .48], [.65, .55], [.7, .5], [.2, .3], [.15, .4], [.75, .42], [.48, .35], [.52, .7], [.58, .82], [.62, .9], [.66, .95], [.38, .78]];
export function bigAl(g, lt, D, t, o) {
  bg(g, '#0d0b09', '#050403');
  const m = o.marks, s = 150, x0 = 1010, y0 = 880;
  sunburst(g, 960, 880, { rays: 56, r0: 0, r1: 1700, a0: Math.PI, a1: TAU, mode: 'wedges', colorA: 'rgba(201,162,75,.05)' });
  const sk = skeleton(g, 'allosaurus', { x: x0, y: y0, s, part: eo(seg(lt, .3, m[1] + 1)), w: 2 });
  plaque(g, 'BIG AL · WYOMING · 1991', 960, 110, { p: seg(lt, m[0] + .4, m[0] + 1.2), size: 28 });
  plaque(g, 'A BEAUTIFUL SPECIMEN', 960, 190, { p: seg(lt, m[1] + .5, m[1] + 1) * (1 - seg(lt, m[2] - .2, m[2] + .2)), size: 22 });
  // injuries: ribs, vertebrae, foot, then all nineteen counted
  const regions = [[m[4], [.42, .56]], [m[5], [.3, .42]], [m[6], [.62, .95]]];
  const T0 = m[7], T1 = m[7] + 3.2;
  const pos = (i) => { const [u, v] = INJ[i]; return [x0 - 4.7 * s + u * 8.6 * s, y0 - 2.9 * s + v * 2.9 * s]; };
  let n = 0;
  INJ.forEach((_, i) => {
    const ti = i < 3 ? regions[i][0] + .2 : lerp(T0, T1, (i - 3) / 15); if (lt < ti) return; n++;
    const [x, y] = pos(i), healed = lt > m[8] + .3 && i % 3 === 0;
    const c = healed ? C.gold2 : '#e8735a', fl = 1 + .8 * (1 - seg(lt, ti, ti + .2));
    glow(g, x, y, 40 * fl, c, .55); g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fillStyle = c; g.fill();
  });
  if (lt > m[3]) { decoDigits(g, String(n), 1660, 300, 96); label(g, 'INJURIES', 1660, 360, { size: 22 }); }
  for (const [n_, x, y, k] of [['BROKEN RIBS', 900, 270, 4], ['DAMAGED VERTEBRAE', 560, 270, 5], ['INFECTED FOOT', 1300, 270, 6]]) plaque(g, n_, x, y, { p: seg(lt, m[k], m[k] + .5) * (1 - seg(lt, m[7] + 3.4, m[7] + 3.8)), size: 20, color: '#e8735a' });
  if (lt > m[8]) plaque(g, 'SOME HAD HEALED', 960, 190, { p: seg(lt, m[8], m[8] + .6) * (1 - seg(lt, m[10] - .5, m[10])), size: 22 });
  if (lt > m[10]) plaque(g, 'A WOUNDED ALLOSAURUS MIGHT NOT RUN', 960, 190, { p: seg(lt, m[10], m[10] + .6), size: 22, color: '#e8735a' });
  vignette(g, W, H, .55);
}
// the other predators, to scale with a dog and a soldier
export function predators(g, lt, D, t, o) {
  bg(g, '#120d08', '#050403');
  sunburst(g, 960, 860, { rays: 56, r0: 0, r1: 1700, a0: Math.PI, a1: TAU, mode: 'wedges', colorA: 'rgba(201,162,75,.05)' });
  gline(g, [[0, 860], [W, 860]], { w: 2 });
  const m = o.marks, s = 52;
  dino(g, 'allosaurus', { x: 1240, y: 860, s, t, alpha: .45, tint: ['#050403', .5] });
  const list = [['ceratosaurus', 330, 'CERATOSAURUS', 'NOSE HORN · BLADE TEETH', m[0] + 1], ['torvosaurus', 920, 'TORVOSAURUS', 'MAYBE BIGGER · MASSIVE SKULL', m[1]], ['ornitholestes', 1700, 'ORNITHOLESTES', 'SIZE OF A LARGE DOG', m[2]]];
  list.forEach(([sp, x, n, sub, a]) => { const p = seg(lt, a - .3, a + .5); if (p <= 0) return; dino(g, sp, { x, y: 860, s, t, walk: .3, phase: lt * .3, alpha: ss(p) }); plaque(g, n, x, 420, { p, size: 24, sub }); });
  if (lt > m[2]) { soldier(g, { x: 1830, y: 860, s, pose: 'stand', flip: -1, t }); const dg = [[-.5, .3], [-.3, .55], [.3, .55], [.45, .7], [.6, .65], [.5, .45], [.4, .3], [.35, 0], [.25, 0], [.25, .3], [-.25, .3], [-.3, 0], [-.4, 0]].map(([a, b]) => [1560 + a * s * 1.1, 860 - b * s * 1.1]); airbrush(g, dg, { base: '#6a5a4a', light: '#a08a70' }); }
  label(g, 'ALLOSAURUS', 1240, 960, { size: 18, alpha: .5 });
  vignette(g, W, H, .5);
}
// Stegosaurus grazes, then turns
export function stego(g, lt, D, t, o) {
  const m = o.marks;
  const turn = seg(lt, m[3] - .1, m[3] + .9), fl = Math.cos(turn * Math.PI), swing = seg(lt, m[4], m[4] + 1.2);
  const cam = { x: lerp(-1, 1, lt / D), y: 1.6, z: 0, f: 1000, oy: 470 };
  world(g, t, cam, { river: 26, riverW: 12, mist: .4, plants: .7, actors: [
    A.fn(11, (g, C_) => { const [px, py] = C_.P(0, 0, 11), s = C_.scaleAt(0, 0, 11); g.save(); g.translate(px, py); g.scale(Math.abs(fl) < .05 ? .05 : fl, 1); dino(g, 'stegosaurus', { x: 0, y: 0, s, t: t + swing * 6, tail: 1 + Math.sin(swing * Math.PI) * 4, neck: lt < m[3] ? -10 + Math.sin(t) * 3 : 4, walk: turn > 0 && turn < 1 ? .6 : 0, phase: lt * .6 }); g.restore(); }),
    A.soldier(-6, 6, { pose: 'stand', flip: 1, t }), A.soldier(-7.5, 6.6, { pose: 'sentry', flip: 1, t })] });
  plaque(g, 'BIG PLATES', 960, 120, { p: seg(lt, m[1], m[1] + .5) * (1 - seg(lt, m[2] + .8, m[2] + 1.1)), size: 24 });
  plaque(g, 'SMALL HEAD, LOW', 960, 120, { p: seg(lt, m[2] + .9, m[2] + 1.3) * (1 - seg(lt, m[3] - .2, m[3])), size: 24 });
  plaque(g, 'FOUR LONG SPIKES', 960, 120, { p: seg(lt, m[4] + .3, m[4] + .9), size: 26, color: '#e8735a' });
  vignette(g, W, H, .5);
}
// shape match: the spike and the hole in the Allosaurus tail bone
export function spikeMatch(g, lt, D, t, o) {
  bg(g, '#0d0b09', '#050403');
  const m = o.marks;
  sunburst(g, 960, 540, { rays: 60, r0: 0, r1: 1500, mode: 'wedges', colorA: 'rgba(201,162,75,.05)' });
  // caudal vertebra, large, with a hole
  const cx = 1180, cy = 560;
  const V = [[-170, -40], [170, -40], [170, 60], [-170, 60]].map(([a, b]) => [cx + a, cy + b]);
  const spine = [[-60, -40], [-30, -250], [30, -250], [60, -40]].map(([a, b]) => [cx + a, cy + b]);
  const chev = [[-50, 60], [-20, 260], [20, 260], [50, 60]].map(([a, b]) => [cx + a, cy + b]);
  for (const P of [spine, chev, V]) { airbrush(g, P, { base: '#e0d2b2', dark: '#7a6a4a', light: '#fff' }); gline(g, [...P, P[0]], { w: 1.8 }); }
  const hole = seg(lt, m[1], m[1] + .6);
  if (hole > 0) { g.beginPath(); g.ellipse(cx, cy - 150, 18 * eo(hole), 30 * eo(hole), 0, 0, TAU); g.fillStyle = '#0a0806'; g.fill(); gline(g, arcPts(cx, cy - 150, 22, 0, TAU, 30, 34), { w: 2, color: '#e8735a', alpha: hole }); }
  plaque(g, 'ALLOSAURUS TAIL BONE', cx, 900, { p: seg(lt, m[0], m[0] + .6), size: 24 });
  // the spike slides in and matches
  const ps = seg(lt, m[2] - .3, m[2] + .4), slide = mech(seg(lt, m[2] + .4, m[2] + 1.6));
  if (ps > 0) {
    const tipX = lerp(520, cx, slide), tipY = cy - 150;
    const S = [[tipX, tipY], [tipX - 420, tipY - 26], [tipX - 460, tipY], [tipX - 420, tipY + 26]];
    g.save(); g.globalAlpha = eo(ps); airbrush(g, S, { base: '#d8c8a0', dark: '#6a5a40', light: '#fff4dc', dir: -Math.PI / 2 }); gline(g, [...S, S[0]], { w: 1.8 }); g.restore();
    plaque(g, 'STEGOSAURUS SPIKE', 420, 900, { p: ps, size: 24 });
    if (slide >= 1) { glow(g, cx, cy - 150, 120, '#ffcf7a', .6 * (1 - seg(lt, m[2] + 1.6, m[2] + 2.6))); plaque(g, 'THE SHAPE MATCHED', 960, 110, { p: seg(lt, m[2] + 1.6, m[2] + 2.2) * (1 - seg(lt, m[3], m[3] + .3)), size: 28 }); }
  }
  if (lt > m[3]) plaque(g, 'INFECTED · THE ALLOSAURUS LIVED ON', 960, 110, { p: seg(lt, m[3] + .2, m[3] + .8) * (1 - seg(lt, m[4], m[4] + .3)), size: 24 });
  if (lt > m[4]) plaque(g, 'STEGOSAURUS FOUGHT BACK', 960, 110, { p: seg(lt, m[4], m[4] + .6), size: 28, color: '#e8735a' });
  vignette(g, W, H, .55);
}
export function closeRange(g, lt, D, t, o) {
  const swing = seg(lt, 1.5, 2.6);
  const cam = { x: 0, y: 1.3, z: 0, f: 1000, oy: 520 };
  world(g, t, cam, { river: 0, plants: .7, mist: .3, actors: [A.dino('stegosaurus', 2.5, 7, { flip: 1, t: t + swing * 6, tail: 1 + Math.sin(swing * Math.PI) * 5, neck: -5 }), A.soldier(-4.2, 5.2, { pose: lt > 2.2 ? 'kneel' : 'aim', flip: 1, t })] });
  vignette(g, W, H, .5);
}
