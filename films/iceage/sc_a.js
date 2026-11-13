// Scenes, first half: Sparta, the question, the ladder, La Brea and the dire wolf, Kirkdale and the cave hyena, Smilodon.
import { C, TAU, clamp, lerp, seg, ss, eio, eo, ei, back, mix, rgba, gline, airbrush, toPath, sunburst, fan, glow, sparkle, vignette, arcPts, stepArchPts, hash, mulberry, speedLines } from './engine/deco.js';
import { W, H, tw, mech, bg, stage, label, plaque, ruler, crossOut, steppe, A, ladder, versus, goldText, titleBar, decoDigits, dial, FONTS, mammal, SP, person, walker, face, expr, YOU, ICE } from './common.js';
import { cub, strideOf } from './mammals.js';

const ph = (sp, m) => m / strideOf(sp);
const blinkAt = (t, k = 0) => Math.abs(Math.sin(t * .6 + k)) < .045 ? 1 : 0;
// a cross-section of a frozen riverbank with a cub inside the ice; thaw 0..1 erodes the bank
export function permafrost(g, lt, D, t, o = {}) {
  const { homo = false, thaw = 0, title = null, titleAt = 99, river = true, zoom = [1, 1.12] } = o;
  const z = lerp(zoom[0], zoom[1], ss(lt / D)), th = typeof thaw === 'number' ? thaw : ss(seg(lt, thaw[0], thaw[1]));
  g.save(); g.translate(960, 600); g.scale(z, z); g.translate(-960, -600);
  const sk = g.createLinearGradient(0, 0, 0, 420); sk.addColorStop(0, '#8ac0dc'); sk.addColorStop(1, '#eaf4f8'); g.fillStyle = sk; g.fillRect(0, 0, W, 430);
  sunburst(g, 1500, 200, { rays: 40, r0: 60, r1: 1400, mode: 'both', w: 1, alpha: .35, colorA: 'rgba(255,250,235,.08)' });
  // tundra surface + larches
  for (let i = 0; i < 9; i++) { const x = 80 + i * 230 + hash(i) * 60; g.fillStyle = '#4a3a2a'; g.fillRect(x - 3, 330, 6, 100); for (let k = 0; k < 6; k++) gline(g, [[x - 26 + k * 3, 340 + k * 14], [x, 330 + k * 14], [x + 26 - k * 3, 340 + k * 14]], { w: 2, color: '#c8a040' }); }
  // layers of frozen silt
  const bands = ['#7a6248', '#8a7258', '#6a5440', '#9a8468', '#5a4836'];
  const edge = x => 1500 - th * 260 + Math.sin(x * .01) * 20;
  for (let i = 0; i < bands.length; i++) { const y0 = 430 + i * 110; const P = [[0, y0], [W, y0], [W, y0 + 112], [0, y0 + 112]]; airbrush(g, P, { base: bands[i], dark: mix(bands[i], '#000', .4), light: mix(bands[i], '#fff', .15), dir: -Math.PI / 2 }); gline(g, [[0, y0], [W, y0]], { w: 1, alpha: .5 }); }
  // ice lenses + crystals
  for (let i = 0; i < 30; i++) { const x = hash(i * 3.1) * W, y = 460 + hash(i * 5.7) * 520; g.beginPath(); g.ellipse(x, y, 30 + hash(i) * 50, 6 + hash(i * 2) * 6, 0, 0, TAU); g.fillStyle = 'rgba(220,240,255,.35)'; g.fill(); }
  // the river eats the bank from the right
  if (river) { const P = [[edge(430), 430]]; for (let y = 430; y <= H; y += 30) P.push([edge(y) + (y - 430) * .3, y]); P.push([W, H], [W, 430]); const rg = g.createLinearGradient(0, 430, 0, H); rg.addColorStop(0, '#7ac8dc'); rg.addColorStop(1, '#2a7a9a'); g.fillStyle = rg; g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); for (let k = 0; k < 6; k++) { const y = 470 + k * 90; gline(g, [[edge(y) + 40, y], [W, y + Math.sin(t + k) * 4]], { w: 1, alpha: .5 }); } }
  // ice pocket with the cub
  const cx = 1180 + th * 120, cy = 740;
  g.beginPath(); g.ellipse(cx, cy, 230, 130, 0, 0, TAU); const ig = g.createRadialGradient(cx - 60, cy - 50, 10, cx, cy, 240); ig.addColorStop(0, 'rgba(240,250,255,.95)'); ig.addColorStop(1, 'rgba(160,200,225,.75)'); g.fillStyle = ig; g.fill();
  gline(g, arcPts(cx, cy, 230, 0, TAU, 60, 130), { w: 2 });
  cub(g, cx, cy + 70, 300, { t, homo, color: homo ? '#3a2a1e' : '#a07a50', dark: homo ? '#140c06' : '#3a2410', frost: 1 - th * .5 });
  for (let i = 0; i < 6; i++) sparkle(g, cx - 200 + hash(i * 4) * 400, cy - 110 + hash(i * 8) * 220, 14 * Math.max(0, Math.sin(t * 1.4 + i * 2)), { alpha: .9 });
  g.restore();
  // falling snow
  for (let i = 0; i < 60; i++) { const x = (hash(i * 2.3) * W + t * 20 * (1 + hash(i))) % W, y = (hash(i * 5.1) * H + t * 50 * (.6 + hash(i * 7))) % H; g.beginPath(); g.arc(x, y, 1.5 + hash(i * 9) * 2, 0, TAU); g.fillStyle = 'rgba(255,255,255,.85)'; g.fill(); }
  if (title) titleBar(g, title, 960, 150, { p: seg(lt, titleAt, titleAt + 1.2), size: 64 });
  if (o.plq) for (const [txt, a, b] of o.plq) plaque(g, txt, 960, 250, { p: seg(lt, a, a + .6) * (1 - seg(lt, b, b + .4)), size: 26 });
  vignette(g, W, H, .4);
}
// the cub grows into a cave lion (same silhouette, scaled up), on the steppe
export function lionGrow(g, lt, D, t, o) {
  const k = ss(seg(lt, .4, 3.2));
  const cam = { x: 0, y: 1.6, z: 0, f: 1000, oy: 560 };
  steppe(g, t, cam, { snow: .35, flora: .6, actors: [A.fn(7, (g, C_) => { const [px, py] = C_.P(-.5, 0, 7), s = C_.scaleAt(0, 0, 7) * lerp(.28, 1, k); mammal(g, 'cavelion', { x: px, y: py, s, t, walk: .6, phase: lt * .5, look: .3 }); })] });
  plaque(g, 'CAVE LION', 960, 140, { p: seg(lt, .2, .8), size: 32 });
  plaque(g, 'ONE OF THE LARGEST CATS EVER', 960, 220, { p: seg(lt, 2.4, 3), size: 22 });
  vignette(g, W, H, .4);
}
// humans on the mammoth steppe; predators along the skyline
export function humans(g, lt, D, t, o) {
  const m = o.marks || [];
  const cam = { x: lerp(-4, 4, lt / D), y: 1.7, z: 0, f: 1000, oy: 540 };
  const pX = m[0] != null ? m[0] : 99;
  const actors = [A.ice(-1.6 + lt * .5, 5, { carry: 'spear', phase: lt * .8, t }), A.ice(-3.0 + lt * .5, 5.6, { carry: 'torch', phase: lt * .8 + .3, t }), A.ice(-4.4 + lt * .5, 6.2, { phase: lt * .8 + .6, t }),
    A.m('mammoth', 30 - lt * .4, 70, { flip: -1, walk: .6, phase: ph('mammoth', lt * .4), t }), A.m('mammoth', 40 - lt * .4, 80, { flip: -1, walk: .6, phase: ph('mammoth', lt * .4) + .3, t, tint: ['#9ec4cc', .3] })];
  if (lt > pX) [['cavelion', -18, 30], ['smilodon', -10, 34], ['bear', 2, 38], ['direwolf', 10, 30], ['direwolf', 12, 31]].forEach(([sp, X, Z], i) => { const e = seg(lt, pX + i * .5, pX + i * .5 + .8); actors.push(A.m(sp, X + lt * .6, Z, { walk: .7, phase: ph(sp, lt * .6), t, alpha: e })); });
  steppe(g, t, cam, { snow: .3, flora: .7, actors, mist: .5 });
  vignette(g, W, H, .4);
}
// night camp: eyes in the dark around the fire
export function nightCamp(g, lt, D, t, o) {
  const cam = { x: 0, y: 1.6, z: 0, f: 1000, oy: 560 };
  const fire = A.fn(4.6, (g, C_) => { const [px, py] = C_.P(0, 0, 4.6), s = C_.scaleAt(0, 0, 4.6); glow(g, px, py - s * .3, s * 4, '#ff9a40', .45); for (let k = 0; k < 3; k++) { const wv = Math.sin(t * 9 + k) * s * .05; airbrush(g, [[px - s * .3 + k * s * .1, py], [px + wv, py - s * (.8 - k * .15)], [px + s * .3 - k * s * .1, py]], { base: k ? '#ffd890' : '#ff8a3a', dark: '#c84a1a', light: '#fff4d0' }); } });
  steppe(g, t, cam, { night: 1, snow: .5, flora: .8, aurora: .7, actors: [fire, A.ice(-1.2, 4.2, { front: true, pose: 'spear', ex: expr('worried'), look: [-.6, 0], t, blink: blinkAt(t) }), A.ice(1.1, 4.3, { front: true, pose: 'down', ex: expr('neutral'), look: [.6, 0], t, blink: blinkAt(t, 2) })] });
  [[240, 600, 1], [520, 640, .8], [1500, 610, 1.1], [1720, 580, .7], [880, 560, .6]].forEach(([x, y, s], i) => { const op = ss(seg(lt, .5 + i * .5, .9 + i * .5)); if (op <= 0) return; for (const dx of [-12 * s, 12 * s]) { glow(g, x + dx, y, 24 * s, '#ffd27a', .5 * op); g.beginPath(); g.ellipse(x + dx, y, 6 * s, 4 * s, 0, 0, TAU); g.fillStyle = rgba('#ffe090', op); g.fill(); } });
  vignette(g, W, H, .55);
}
// "you", dropped into the Ice Age with bare hands: the character introduction
export function youArrive(g, lt, D, t, o) {
  const m = o.marks || [0];
  const cam = { x: 0, y: 1.5, z: lerp(-2, 0, ss(seg(lt, 0, 2))), f: 1000, oy: 560 };
  const drop = 1 - eo(seg(lt, .2, 1.2));
  steppe(g, t, cam, { snow: .55, flora: .7, blizzard: .2, actors: [A.fn(3, (g, C_) => { const [px, py] = C_.P(0, 0, 3), s = C_.scaleAt(0, 0, 3); const k = seg(lt, 1.6, 2.6); person(g, px, py - drop * 900, 1.75 * s, { pal: YOU, pose: lt > m[0] + 2 ? 'fists' : 'cold', ex: expr('curious', 'worried', k), look: [Math.sin(t * .8) * .8, 0], blink: blinkAt(t), t }); if (lt > 1.2 && lt < 1.8) { const k2 = seg(lt, 1.2, 1.8); gline(g, arcPts(px, py, 80 + k2 * 160, Math.PI, TAU, 30, 16 + k2 * 20), { w: 3 * (1 - k2), alpha: 1 - k2 }); } })] });
  plaque(g, 'YOU', 960, 140, { p: seg(lt, 1.6, 2.2) * (1 - seg(lt, m[0] + 1, m[0] + 1.4)), size: 34, color: '#e8735a' });
  plaque(g, 'BARE HANDS ONLY', 960, 140, { p: seg(lt, m[0] + 1.4, m[0] + 2), size: 28 });
  vignette(g, W, H, .4);
}
// the ladder: climbing from most beatable to "not even close"
export function ladderShot(g, lt, D, t, o) { ladder(g, t, { p: o.build ? seg(lt, 0, D * .8) : 1, cur: o.cur ?? -1, hl: ss(seg(lt, .4, 1.2)), done: o.cur ?? -1, out: o.out ? o.out.filter((_, i) => lt > (o.marks?.[i] ?? 0)) : [] }); }
// modern Los Angeles: deco towers, palm trees, a fenced tar pit
export function laToday(g, lt, D, t, o) {
  const sk = g.createLinearGradient(0, 0, 0, 760); sk.addColorStop(0, '#f08a5a'); sk.addColorStop(.6, '#ffc890'); sk.addColorStop(1, '#ffe8c0'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
  sunburst(g, 960, 760, { rays: 48, r0: 120, r1: 1500, a0: Math.PI, a1: TAU, mode: 'both', w: 1.2, alpha: .5, colorA: 'rgba(255,240,210,.08)' });
  g.beginPath(); g.arc(960, 760, 120, Math.PI, TAU); g.fillStyle = '#fff4d8'; g.fill();
  const zx = lerp(0, -80, lt / D);
  for (let i = 0; i < 14; i++) { const x = 40 + i * 140 + zx, w = 90 + hash(i) * 40, h = 220 + hash(i * 3) * 380; const P = [[x, 760], [x, 760 - h], [x + w * .15, 760 - h], [x + w * .15, 760 - h - 30], [x + w * .85, 760 - h - 30], [x + w * .85, 760 - h], [x + w, 760 - h], [x + w, 760]]; airbrush(g, P, { base: '#c87a6a', dark: '#6a3a3a', light: '#f4c0a0', dir: -2.3 }); gline(g, P, { w: 1.2, alpha: .6 }); for (let k = 0; k < h / 30; k++) for (let j = 0; j < 3; j++) { g.fillStyle = 'rgba(255,240,200,.5)'; g.fillRect(x + 12 + j * w * .28, 760 - h + 20 + k * 30, 8, 14); } }
  g.fillStyle = '#7aa050'; g.fillRect(0, 760, W, H - 760);
  for (const x of [200, 520, 1400, 1720]) { gline(g, [[x, 780], [x + 20, 480]], { w: 8, color: '#5a3a24' }); for (let k = 0; k < 8; k++) { const a = -Math.PI / 2 + (k - 3.5) * .4; gline(g, [[x + 20, 480], [x + 20 + Math.cos(a) * 90, 480 + Math.sin(a) * 50 + 30]], { w: 6, color: '#2a7a4a' }); } }
  // the tar pit, bubbling
  g.beginPath(); g.ellipse(960, 900, 380, 70, 0, 0, TAU); g.fillStyle = '#12100e'; g.fill(); gline(g, arcPts(960, 900, 380, 0, TAU, 80, 70), { w: 2 });
  for (let i = 0; i < 7; i++) { const u = (t * .4 + i / 7) % 1; g.beginPath(); g.arc(760 + i * 60, 900 - u * 10, 6 + u * 12, 0, TAU); g.strokeStyle = rgba('#8a8070', 1 - u); g.lineWidth = 2; g.stroke(); }
  for (let x = 560; x <= 1360; x += 40) gline(g, [[x, 840], [x, 800]], { w: 2 }); gline(g, [[560, 806], [1360, 806]], { w: 2 });
  plaque(g, 'LOS ANGELES', 960, 120, { p: seg(lt, .2, .8) * (1 - seg(lt, (o.marks?.[0] ?? 3) - .3, (o.marks?.[0] ?? 3))), size: 30 });
  plaque(g, 'THE LA BREA TAR PITS', 960, 120, { p: seg(lt, o.marks?.[0] ?? 3, (o.marks?.[0] ?? 3) + .6), size: 32 });
  vignette(g, W, H, .35);
}
// the trap: a bison stuck in the asphalt, then a dire wolf
export function tarTrap(g, lt, D, t, o) {
  const m = o.marks;
  const cam = { x: 0, y: 1.8, z: 0, f: 1000, oy: 520 };
  const sink = (a) => ss(seg(lt, a, a + 3)) * .35;
  const pit = A.fn(9.5, (g, C_) => { const [px, py] = C_.P(0, 0, 10), s = C_.scaleAt(0, 0, 10); g.beginPath(); g.ellipse(px, py + .3 * s, 4 * s, .55 * s, 0, 0, TAU); const gr = g.createRadialGradient(px - s, py, 0, px, py, 4 * s); gr.addColorStop(0, '#3a3430'); gr.addColorStop(1, '#0c0a08'); g.fillStyle = gr; g.fill(); for (let i = 0; i < 6; i++) { const u = (t * .5 + i / 6) % 1; g.beginPath(); g.ellipse(px - 3 * s + i * 1.2 * s, py + s * .3, s * .15 * (1 + u), s * .05 * (1 + u), 0, 0, TAU); g.strokeStyle = rgba('#9a9080', 1 - u); g.lineWidth = 1.5; g.stroke(); } });
  const bX = lerp(-12, -1.5, ss(seg(lt, 0, m[0] + 1)));
  const wX = lerp(14, 2.5, ss(seg(lt, m[1] - .5, m[1] + 2)));
  const actors = [pit, A.fn(10, (g, C_) => { const [px, py] = C_.P(bX, 0, 10), s = C_.scaleAt(0, 0, 10); const sk = lt > m[0] + .5 ? sink(m[0] + .5) : 0; g.save(); g.beginPath(); g.rect(0, 0, W, py - s * (lt > m[0] + .5 ? .1 : -1)); g.clip(); mammal(g, 'bison', { x: px, y: py + sk * s * 2, s, t, walk: lt < m[0] + .5 ? 1 : .15, phase: ph('bison', bX), neck: lt > m[0] + .5 ? 10 * Math.sin(t * 3) : 0 }); g.restore(); }),
    A.fn(10.2, (g, C_) => { const [px, py] = C_.P(wX, 0, 10.2), s = C_.scaleAt(0, 0, 10.2); const sk = lt > m[1] + 2 ? sink(m[1] + 2) : 0; g.save(); g.beginPath(); g.rect(0, 0, W, py - s * (lt > m[1] + 2 ? .1 : -1)); g.clip(); mammal(g, 'direwolf', { x: px, y: py + sk * s * 1.6, s, flip: -1, t, walk: lt < m[1] + 2 ? 1 : .2, phase: ph('direwolf', wX), snarl: lt > m[1] + 2 ? .8 : .3 }); g.restore(); })];
  steppe(g, t, cam, { snow: .1, flora: .7, actors, clearing: [0, 10, 12, 6], sunX: 200 });
  plaque(g, 'NATURAL ASPHALT', 960, 120, { p: seg(lt, .3, .9) * (1 - seg(lt, m[0], m[0] + .3)), size: 26 });
  plaque(g, 'STUCK', 960, 120, { p: seg(lt, m[0] + .6, m[0] + 1.1) * (1 - seg(lt, m[1], m[1] + .3)), size: 30, color: '#e8735a' });
  plaque(g, 'THEN THE PREDATORS CAME', 960, 120, { p: seg(lt, m[1], m[1] + .6), size: 26 });
  vignette(g, W, H, .4);
}
// the dig: a wall of predator skulls
export function wallOfPredators(g, lt, D, t, o) {
  const m = o.marks;
  stage(g, t, { top: '#3a2a1e', bot: '#140c08', floor: false, rays: false });
  for (let i = 0; i < 8; i++) { const y = i * 140; g.fillStyle = i % 2 ? 'rgba(80,60,40,.5)' : 'rgba(40,30,20,.5)'; g.fillRect(0, y, W, 70); }
  const R = mulberry(3);
  const n = Math.floor(lerp(0, 120, ss(seg(lt, .2, m[0] + 2))));
  for (let i = 0; i < 120; i++) {
    const x = 80 + (i % 15) * 125 + (R() - .5) * 30, y = 140 + Math.floor(i / 15) * 112 + (R() - .5) * 20, s = .8 + R() * .4, rot = (R() - .5) * .5;
    if (i >= n) continue;
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
    const P = [[-46, -6], [-24, -24], [8, -24], [36, -12], [50, -2], [36, 8], [-40, 10]]; airbrush(g, P, { base: '#e8dcc0', dark: '#8a7a5a', light: '#fff' }); gline(g, [...P, P[0]], { w: 1.2 });
    g.beginPath(); g.ellipse(-4, -8, 9, 7, 0, 0, TAU); g.fillStyle = '#3a2a1a'; g.fill();
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(10 + k * 9, 8); g.lineTo(13 + k * 9, 16); g.lineTo(16 + k * 9, 8); g.fillStyle = '#fff8e8'; g.fill(); }
    g.restore();
  }
  plaque(g, 'A WALL OF PREDATORS', 960, 80, { p: seg(lt, m[0], m[0] + .7), size: 32 });
  vignette(g, W, H, .5);
}
// hero walk: one animal crosses the steppe; name plaque; optional count / caption
export function hero(g, lt, D, t, o) {
  const { sp, name, sub = null, subAt = 1.5, snow = .3, cap = null, capAt = 99, Z = 7, dusk = 0, many = 0 } = o;
  const cam = { x: 0, y: 1.3, z: 0, f: 1000, oy: 580 };
  const X = lerp(-6, 4, lt / D);
  const actors = [A.m(sp, X, Z, { walk: 1, phase: ph(sp, X), t, snarl: .2 + .2 * Math.sin(t), look: .2 })];
  for (let i = 0; i < many; i++) actors.push(A.m(sp, X - 3 - i * 2.2 + hash(i) * 1.5, Z + 2 + hash(i * 3) * 6, { walk: 1, phase: ph(sp, X) + i * .37, t }));
  steppe(g, t, cam, { snow, flora: .7, dusk, actors });
  plaque(g, name, 960, 130, { p: seg(lt, .3, 1), size: 34, sub });
  if (cap) plaque(g, cap, 960, 230, { p: seg(lt, capAt, capAt + .6), size: 26, color: '#e8735a' });
  vignette(g, W, H, .4);
}
// DNA: gray wolf vs dire wolf, a family tree that splits millions of years ago
export function dna(g, lt, D, t, o) {
  const m = o.marks;
  stage(g, t, { cy: 940 });
  const k = ss(seg(lt, m[1], m[1] + 2));
  mammal(g, 'direwolf', { x: 1380, y: 900, s: 300, t, walk: .2, phase: lt * .2, flip: -1, snarl: .3 });
  mammal(g, 'direwolf', { x: 560, y: 900, s: 270, t, walk: .2, phase: lt * .2 + .5, tint: ['#9aa4b0', .45] });
  label(g, 'GRAY WOLF', 560, 520, { size: 26 }); label(g, 'DIRE WOLF', 1380, 520, { size: 26 });
  // a double helix between them
  for (let i = 0; i < 40; i++) { const y = 140 + i * 9, a = i * .4 + t * 1.5, x1 = 960 + Math.sin(a) * 60, x2 = 960 - Math.sin(a) * 60; g.beginPath(); g.arc(x1, y, 4, 0, TAU); g.fillStyle = C.gold2; g.fill(); g.beginPath(); g.arc(x2, y, 4, 0, TAU); g.fillStyle = '#e8735a'; g.fill(); if (i % 3 === 0) gline(g, [[x1, y], [x2, y]], { w: 1, alpha: .5 }); }
  plaque(g, 'ANCIENT DNA · 2021', 960, 90, { p: seg(lt, .2, .8), size: 26 });
  // the tree: a split that opens
  if (lt > m[1]) { const bx = 960, by = 560; gline(g, [[bx, by + 60], [bx, by]], { w: 3 }); gline(g, [[bx, by], [lerp(bx, 600, k), lerp(by, 470, k)]], { w: 3, glow: .4 }); gline(g, [[bx, by], [lerp(bx, 1320, k), lerp(by, 470, k)]], { w: 3, glow: .4, color: '#e8735a' }); plaque(g, 'SPLIT MILLIONS OF YEARS AGO', 960, 640, { p: seg(lt, m[1] + 1, m[1] + 1.6), size: 24 }); }
  if (lt > m[0]) plaque(g, 'NOT CLOSE RELATIVES', 1380, 330, { p: seg(lt, m[0], m[0] + .6), size: 22, color: '#e8735a' });
  plaque(g, 'EVOLVED IN THE AMERICAS', 1380, 410, { p: seg(lt, m[2], m[2] + .6), size: 20 });
  vignette(g, W, H, .4);
}
// a spec plate: animal large, weight dial, captions on the marks
export function spec(g, lt, D, t, o) {
  const { sp, kg, kgMax = 100, notes = [], unit = 'KG', jawAt = 99, zoom = 1, flip = 1 } = o;
  const m = o.marks || [];
  stage(g, t, { cy: 900 });
  const S = SP[sp], sc = Math.min(1100 / S.len, 520 / (S.spine.reduce((a, q) => Math.max(a, q[1] + q[2]), 0) + .4)) * zoom;
  mammal(g, sp, { x: 860, y: 900, s: sc, t, walk: .25, phase: lt * .2, flip, jaw: ss(seg(lt, jawAt, jawAt + .4)) * (1 - seg(lt, jawAt + 2, jawAt + 2.5)) * .8, snarl: .3 });
  if (kg) { const v = ss(seg(lt, m[0] ?? 0, (m[0] ?? 0) + 1.6)); dial(g, 1640, 330, 190, v * Math.min(1, kg / kgMax), { labels: ['0', '', '', String(kgMax / 2), '', '', String(kgMax)] }); decoDigits(g, `${Math.round(kg * v)} ${unit}`, 1640, 450, 56, { rules: false }); }
  notes.forEach(([txt, i, x = 960, y = 120, col = null]) => plaque(g, txt, x, y, { p: seg(lt, m[i], m[i] + .6) * (notes.some(n => n[1] > i && n[2] == null && x === 960 && lt > m[n[1]]) ? 0 : 1), size: 24, color: col }));
  vignette(g, W, H, .4);
}
export function versusShot(g, lt, D, t, o) { versus(g, t, lt, { ...o, verdictAt: o.marks?.[0] ?? o.verdictAt ?? 3, exAt: o.exAt ?? 1 }); }
// protect your throat: close-up of You, arm up, determined; a wolf lunges in profile behind
export function protect(g, lt, D, t, o) {
  const m = o.marks || [99];
  const cam = { x: 0, y: 1.5, z: 0, f: 1000, oy: 560 };
  const lunge = seg(lt, 1.2, 2.4);
  steppe(g, t, cam, { snow: .6, blizzard: .3, flora: .6, actors: [A.m('direwolf', lerp(9, 4.5, ss(lunge)), 7.5, { flip: -1, walk: 1, phase: lt * 2, t, snarl: 1, jaw: .4 + .4 * Math.sin(t * 3) ** 2 })] });
  person(g, 640, 1500, 1500, { pal: YOU, pose: 'guard', ex: expr('scared', 'determined', seg(lt, .8, 2)), look: [.7, 0], blink: blinkAt(t), t });
  plaque(g, 'PROTECT THE THROAT', 1280, 160, { p: seg(lt, .3, .9) * (1 - seg(lt, m[0], m[0] + .3)), size: 26 });
  plaque(g, 'SOME PEOPLE HAVE SURVIVED', 1280, 160, { p: seg(lt, m[0], m[0] + .6), size: 24 });
  vignette(g, W, H, .4);
}
// the pack closes in around You
export function pack(g, lt, D, t, o) {
  const m = o.marks || [99, 99];
  const cam = { x: 0, y: 2.6, z: 0, f: 900, oy: 420, pitch: .22 };
  const k = ss(seg(lt, .4, m[1] ?? 4));
  const actors = [A.you(0, 9, { front: true, pose: 'guard', ex: expr('worried', 'scared', k), look: [Math.sin(t * 1.2), 0], t, blink: blinkAt(t) })];
  for (let i = 0; i < 7; i++) { const a = -Math.PI * .1 + i / 6 * Math.PI * 1.2, r = lerp(14, 4.5, k); const X = Math.cos(a) * r, Z = 9 + Math.sin(a) * r * .7; actors.push(A.m('direwolf', X, Z, { flip: X > 0 ? -1 : 1, walk: .8, phase: lt * 1.5 + i * .3, t, snarl: .7, alpha: ss(seg(lt, .2 + i * .25, .6 + i * .25)) })); }
  steppe(g, t, cam, { snow: .7, dusk: .3, flora: .5, blizzard: .3, actors });
  plaque(g, 'PACKS', 960, 110, { p: seg(lt, .2, .8) * (1 - seg(lt, m[0], m[0] + .3)), size: 30 });
  plaque(g, 'NOT ONE WOLF · ALL OF THEM', 960, 110, { p: seg(lt, m[0], m[0] + .6), size: 26, color: '#e8735a' });
  vignette(g, W, H, .45);
}
// Kirkdale, 1821: quarrymen break into a cave full of bones
export function kirkdale(g, lt, D, t, o) {
  const m = o.marks;
  const open = ss(seg(lt, .8, 2.2));
  stage(g, t, { top: '#5a7a4a', bot: '#2a3a20', floor: false, rays: false });
  const sk = g.createLinearGradient(0, 0, 0, 380); sk.addColorStop(0, '#8ab4d0'); sk.addColorStop(1, '#e4ecd8'); g.fillStyle = sk; g.fillRect(0, 0, W, 380);
  g.fillStyle = '#8a8070'; g.fillRect(0, 380, W, 700); for (let i = 0; i < 6; i++) gline(g, [[0, 420 + i * 110], [W, 410 + i * 110 + Math.sin(i) * 20]], { w: 1.2, alpha: .5 });
  // cave interior revealed in an arch
  const P = stepArchPts(960, 1000, lerp(80, 1300, open), lerp(80, 560, open), { steps: 3 });
  g.save(); g.fill(toPath(P, true)); g.clip(toPath(P, true));
  const cg = g.createRadialGradient(960, 900, 40, 960, 900, 700); cg.addColorStop(0, '#5a4430'); cg.addColorStop(1, '#140c06'); g.fillStyle = cg; g.fillRect(0, 300, W, 800);
  const R = mulberry(9); const nb = Math.floor(lerp(0, 80, seg(lt, m[0] - .5, m[0] + 2)));
  for (let i = 0; i < 80; i++) { const x = 400 + R() * 1120, y = 840 + R() * 140, a = R() * TAU, l = 20 + R() * 60; if (i >= nb) continue; g.save(); g.lineCap = 'round'; g.strokeStyle = '#e0d2b2'; g.lineWidth = 7; g.beginPath(); g.moveTo(x - Math.cos(a) * l / 2, y - Math.sin(a) * l / 2); g.lineTo(x + Math.cos(a) * l / 2, y + Math.sin(a) * l / 2); g.stroke(); g.restore(); }
  g.restore(); gline(g, P, { w: 3, glow: .5 });
  // two quarrymen with picks, period clothes, faces
  const qm = { ...ICE, coat: '#5a5a6a', coatD: '#2a2a34', coatL: '#9a9aaa', trou: '#4a4038', fur: null };
  person(g, 400, 1000, 440, { pal: qm, pose: 'down', ex: expr('awe'), look: [.8, .3], hairStyle: 'short', t, blink: blinkAt(t) });
  person(g, 1540, 1000, 420, { pal: qm, pose: 'shrug', ex: expr('curious', 'awe', seg(lt, m[0], m[0] + 1)), look: [-.8, .3], hairStyle: 'short', beard: true, t, blink: blinkAt(t, 3) });
  plaque(g, 'KIRKDALE CAVE · YORKSHIRE · 1821', 960, 100, { p: seg(lt, .3, 1), size: 26 });
  const L = [['ELEPHANTS', 1], ['RHINOS', 2], ['HIPPOS', 3]];
  L.forEach(([n, i], j) => plaque(g, n, 640 + j * 320, 200, { p: seg(lt, m[1] + j * .5, m[1] + j * .5 + .5) * (1 - seg(lt, m[2] + 2, m[2] + 2.4)), size: 24 }));
  if (lt > m[2]) plaque(g, 'IN ENGLAND?', 960, 280, { p: seg(lt, m[2], m[2] + .6), size: 26, color: '#e8735a' });
  vignette(g, W, H, .45);
}
// gnawed bones; William Buckland with a lantern
export function buckland(g, lt, D, t, o) {
  const m = o.marks;
  stage(g, t, { top: '#2a1e14', bot: '#0c0806', floor: false, rays: false });
  glow(g, 1280, 520, 700, '#ffc070', .35);
  const wb = { ...ICE, coat: '#2a2a30', coatD: '#0a0a10', coatL: '#5a5a66', trou: '#2a2a2a', fur: null, skin: '#e4b896', skinD: '#a87a5a', hair: '#6a6a6a' };
  person(g, 1380, 1060, 900, { pal: wb, pose: 'torch', ex: expr('curious', 'awe', seg(lt, m[1], m[1] + 1)), look: [-.8, .4], hairStyle: 'short', t, blink: blinkAt(t) });
  // a gnawed long bone, large, with tooth marks and a split
  const bx = 600, by = 620;
  g.save(); g.translate(bx, by); g.rotate(-.25);
  const B = [[-360, -26], [-300, -48], [-250, -30], [250, -30], [300, -48], [360, -26], [360, 26], [300, 48], [250, 30], [-250, 30], [-300, 48], [-360, 26]];
  airbrush(g, B, { base: '#e8dcc0', dark: '#9a8a6a', light: '#fff' }); gline(g, [...B, B[0]], { w: 2 });
  for (let i = 0; i < 9; i++) { const x = -200 + i * 45 + Math.sin(i) * 10; const a = seg(lt, m[0] + i * .1, m[0] + i * .1 + .3); g.beginPath(); g.ellipse(x, -20 + (i % 2) * 40, 7, 4, 0, 0, TAU); g.fillStyle = rgba('#5a3a1a', a); g.fill(); }
  const sp = seg(lt, m[0] + 1.2, m[0] + 2); if (sp > 0) gline(g, [[120, -30], [160, 0], [140, 30]], { w: 3, color: '#3a2a1a', part: sp });
  g.restore();
  plaque(g, 'GNAWED · SPLIT OPEN', 600, 820, { p: seg(lt, m[0], m[0] + .6), size: 24 });
  plaque(g, 'WILLIAM BUCKLAND', 1380, 110, { p: seg(lt, m[1] - .2, m[1] + .5), size: 28 });
  plaque(g, 'BITE MARKS · TEETH', 1380, 190, { p: seg(lt, m[2], m[2] + .6), size: 22 });
  vignette(g, W, H, .5);
}
// the den: hyenas drag prey into the cave
export function den(g, lt, D, t, o) {
  const cam = { x: 0, y: 1.4, z: 0, f: 1000, oy: 560 };
  const mouth = A.fn(16, (g, C_) => { const [px, py] = C_.P(4, 0, 16), s = C_.scaleAt(0, 0, 16); const P = [[px - 8 * s, py], [px - 6 * s, py - 5 * s], [px + 2 * s, py - 7 * s], [px + 9 * s, py - 4 * s], [px + 10 * s, py]]; airbrush(g, P, { base: '#8a8478', dark: '#4a4440', light: '#c8c4b8' }); const M = stepArchPts(px + s, py, 5 * s, 3.6 * s, { steps: 2 }); g.fillStyle = '#0c0806'; g.fill(toPath(M, true)); gline(g, M, { w: 2 }); });
  const X = lerp(-7, 2.5, ss(seg(lt, 0, D)));
  steppe(g, t, cam, { snow: .2, flora: .5, dusk: .5, actors: [mouth, A.m('hyena', X, 9, { walk: 1, phase: ph('hyena', X), t, jaw: .3 }), A.m('hyena', X - 2.4, 9.6, { walk: 1, phase: ph('hyena', X) + .4, t }), A.fn(9.1, (g, C_) => { const [px, py] = C_.P(X + 1.6, 0, 9.1), s = C_.scaleAt(0, 0, 9.1); g.save(); g.lineCap = 'round'; g.strokeStyle = '#e0d2b2'; g.lineWidth = s * .12; g.beginPath(); g.moveTo(px, py - s * .6); g.lineTo(px + s * .9, py - s * .2); g.stroke(); g.restore(); })] });
  plaque(g, 'A HYENA DEN', 960, 120, { p: seg(lt, .2, .8), size: 32 });
  vignette(g, W, H, .4);
}
// cave hyena vs spotted hyena, bite force
export function hyenaSpec(g, lt, D, t, o) {
  const m = o.marks;
  stage(g, t, { cy: 900 });
  mammal(g, 'hyena', { x: 520, y: 900, s: 300, t, walk: .2, phase: lt * .2, tint: ['#e0c890', .3] });
  mammal(g, 'hyena', { x: 1320, y: 900, s: 380, t, walk: .2, phase: lt * .2 + .5, snarl: .5, jaw: ss(seg(lt, m[1] + 1, m[1] + 1.5)) * .7 });
  label(g, 'SPOTTED HYENA · TODAY', 520, 520, { size: 22 }); label(g, 'CAVE HYENA', 1320, 470, { size: 26 });
  plaque(g, 'LARGER · HEAVIER', 1320, 150, { p: seg(lt, .6, 1.2), size: 24 });
  if (lt > m[1]) { dial(g, 960, 330, 170, ss(seg(lt, m[1], m[1] + 1.4)) * .92, { labels: ['WEAK', '', '', '', '', '', 'BONE-CRACKING'] }); label(g, 'BITE', 960, 400, { size: 20 }); }
  vignette(g, W, H, .4);
}
// the clan: dozens of hyenas fill the plain; a lone sabre-tooth at the end
export function clan(g, lt, D, t, o) {
  const m = o.marks;
  const cam = { x: 0, y: 2.2, z: 0, f: 1000, oy: 500, pitch: .08 };
  const n = Math.floor(lerp(2, 30, ss(seg(lt, .2, m[0] + 1))));
  const actors = []; for (let i = 0; i < n; i++) { const X = (hash(i * 3.3) - .5) * 40 + lt * .8, Z = 10 + hash(i * 7.7) * 40; actors.push(A.m('hyena', X, Z, { walk: 1, phase: ph('hyena', X) + i * .21, t, alpha: lt > m[2] ? 1 - seg(lt, m[2], m[2] + 1) : 1 })); }
  if (lt > m[2]) actors.push(A.m('smilodon', lerp(-8, 0, ss(seg(lt, m[2], D))), 8, { walk: 1, phase: lt * 1.1, t, snarl: .4, alpha: seg(lt, m[2], m[2] + .8) }));
  steppe(g, t, cam, { snow: .3, flora: .5, dusk: .2, actors });
  plaque(g, 'CLANS OF DOZENS', 960, 110, { p: seg(lt, m[0], m[0] + .6) * (1 - seg(lt, m[2], m[2] + .3)), size: 28 });
  vignette(g, W, H, .4);
}
// Smilodon's canine vs a human hand
export function canine(g, lt, D, t, o) {
  const m = o.marks;
  stage(g, t, { cy: 940 });
  // skull, large
  const sc = 1100, x0 = 300, y0 = 620;
  g.save(); g.translate(x0, y0);
  const P = [[0, -60], [120, -170], [330, -200], [520, -150], [640, -60], [660, 20], [520, 40], [320, 50], [80, 40]]; airbrush(g, P, { base: '#ece0c4', dark: '#9a8a6a', light: '#fff' }); gline(g, [...P, P[0]], { w: 2 });
  g.beginPath(); g.ellipse(330, -80, 60, 45, 0, 0, TAU); g.fillStyle = '#3a2a1a'; g.fill(); g.beginPath(); g.ellipse(160, -40, 70, 60, 0, 0, TAU); g.fillStyle = '#3a2a1a'; g.fill();
  const grow = ss(seg(lt, .3, 1.5)), L = 280 * grow;
  const T = [[520, 30], [490, 30 + L * .55], [430, 30 + L], [450, 30 + L * .45], [440, 30]]; airbrush(g, T, { base: '#fff6e0', dark: '#b0a080', light: '#fff' }); gline(g, [...T, T[0]], { w: 1.8 });
  g.restore();
  // a hand beside it
  const hp = seg(lt, m[0], m[0] + .8);
  if (hp > 0) { g.save(); g.globalAlpha = eo(hp); g.translate(1300, 380); const pal = YOU; const palm = [[-70, 0], [70, 0], [80, 120], [60, 170], [-60, 170], [-80, 120]]; airbrush(g, palm, { base: pal.skin, dark: pal.skinD, light: '#ffe0c8' }); for (let i = 0; i < 4; i++) { const x = -54 + i * 36; airbrush(g, [[x - 14, 0], [x + 14, 0], [x + 12, -110 + Math.abs(i - 1.5) * 18], [x - 12, -110 + Math.abs(i - 1.5) * 18]], { base: pal.skin, dark: pal.skinD, light: '#ffe0c8' }); } g.restore(); ruler(g, 1180, 650, 1420, 18, { p: 1, label: '≈ 18 CM HAND', step: 2 }); }
  ruler(g, x0 + 440, 650 + 30, x0 + 440 + 280, 28, { p: seg(lt, 1, 2), label: '≈ 28 CM', step: 2 });
  plaque(g, 'LONGER THAN A HUMAN HAND', 960, 120, { p: seg(lt, m[0], m[0] + .6), size: 28 });
  vignette(g, W, H, .4);
}
// two species, two weights
export function smiloWeights(g, lt, D, t, o) {
  const m = o.marks;
  stage(g, t, { cy: 880 });
  mammal(g, 'smilodon', { x: 600, y: 880, s: 300, t, walk: .3, phase: lt * .3, snarl: .4 });
  const p2 = seg(lt, m[1] - .2, m[1] + .6);
  if (p2 > 0) mammal(g, 'smilodon', { x: 1400, y: 880, s: 300 * 1.25, t, walk: .3, phase: lt * .3 + .5, alpha: ss(p2), flip: -1, tint: ['#c08a50', .2] });
  dial(g, 600, 300, 150, ss(seg(lt, m[0], m[0] + 1.5)) * .5, { labels: ['0', '', '', '200', '', '', '400'] }); decoDigits(g, '200+ KG', 600, 400, 44, { rules: false }); label(g, 'SMILODON FATALIS · CALIFORNIA', 600, 470, { size: 20 });
  if (p2 > 0) { dial(g, 1400, 300, 150, ss(seg(lt, m[1], m[1] + 1.5)), { labels: ['0', '', '', '200', '', '', '400'] }); decoDigits(g, '≈ 400 KG', 1400, 400, 44, { rules: false }); label(g, 'SMILODON POPULATOR · SOUTH AMERICA', 1400, 470, { size: 20 }); }
  vignette(g, W, H, .4);
}
