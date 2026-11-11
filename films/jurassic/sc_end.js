// Chapters 13–15: day five, infection, the verdict, day seven, the bones, farewell.
import { C, TAU, clamp, lerp, seg, ss, eio, eo, ei, back, mix, rgba, gline, airbrush, toPath, sunburst, fan, glow, sparkle, vignette, arcPts, stepArchPts, hash, mulberry } from './engine/deco.js';
import { W, H, tw, mech, bg, label, plaque, world, A, threatBoard, goldText, titleBar, decoDigits, FONTS, dino, soldier } from './common.js';
import { soldierTop, soldierFront } from './humans.js';
import { skeleton, stride } from './dinos.js';
import { doorsLeaves } from './sc_util.js';

const walkPh = (sp, metres) => metres / stride(sp);
export function day5(g, lt, D, t, o) {
  const m = o.marks;
  if (lt < m[0] - .4) {   // the board: EXHAUSTION
    bg(g, '#120d08', '#050403'); threatBoard(g, t, { p: 1, cur: 5, hl: ss(seg(lt, 3.6, 4.4)) }); return;
  }
  const cam = { x: lerp(-2, 2, lt / D), y: 1.6, z: 0, f: 1000, oy: 500 };
  const tired = seg(lt, m[3], m[3] + 1);
  world(g, t, cam, { dusk: .7, river: 24, riverW: 10, mist: .5, plants: .8, actors: [A.soldier(-3, 6, { pose: 'sit', flip: 1, t }), A.soldier(-1, 6.6, { pose: tired > .5 ? 'sit' : 'sentry', flip: 1, t }), A.soldier(2.4, 6.2, { pose: 'sit', flip: -1, t }), A.soldier(4, 7.4, { pose: 'sentry', flip: -1, t }),
    A.soldier(lerp(-2, 3, seg(lt, m[4], D)), 18, { pose: 'walk', flip: 1, phase: lt * 1.2, t }), A.soldier(lerp(-3.2, 1.8, seg(lt, m[4], D)), 18.6, { pose: 'walk', flip: 1, phase: lt * 1.2 + .3, t })] });
  // ammunition counter drains
  const p = seg(lt, m[0] - .4, m[0] + .3);
  if (p > 0) {
    const rounds = Math.round(lerp(210, 37, ss(seg(lt, m[1] + 1, D - 1))));
    g.save(); g.globalAlpha = eo(p); g.fillStyle = 'rgba(6,5,4,.85)'; g.fillRect(1440, 110, 400, 220); gline(g, [[1440, 110], [1840, 110], [1840, 330], [1440, 330], [1440, 110]], { w: 2 });
    decoDigits(g, String(rounds), 1640, 250, 90); label(g, 'ROUNDS PER SOLDIER', 1640, 305, { size: 18 }); g.restore();
  }
  vignette(g, W, H, .5);
}
// microscope
const BAC = (() => { const R = mulberry(9), o = []; for (let i = 0; i < 160; i++) o.push({ x: R(), y: R(), a: R() * TAU, k: R() < .5 ? 'rod' : R() < .7 ? 'coccus' : 'spiral', s: .6 + R() * .8 }); return o; })();
function microbe(g, b, x, y, sc, t, alpha = 1, color = '#c9a24b') {
  g.save(); g.translate(x, y); g.rotate(b.a + Math.sin(t + b.x * 9) * .3); g.globalAlpha *= alpha; const s = sc * b.s;
  if (b.k === 'rod') { g.beginPath(); g.ellipse(0, 0, 14 * s, 5 * s, 0, 0, TAU); g.fillStyle = rgba(color, .35); g.fill(); g.lineWidth = 1.4; g.strokeStyle = color; g.stroke(); }
  else if (b.k === 'coccus') { for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(i * 9 * s - 9 * s, 0, 4.5 * s, 0, TAU); g.fillStyle = rgba(color, .35); g.fill(); g.strokeStyle = color; g.lineWidth = 1.2; g.stroke(); } }
  else { g.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20; const px = (u - .5) * 30 * s, py = Math.sin(u * TAU * 1.5 + t * 3) * 4 * s; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.strokeStyle = color; g.lineWidth = 2; g.stroke(); }
  g.restore();
}
export function infection(g, lt, D, t, o) {
  const m = o.marks;
  if (lt < 1.4) { bg(g, '#120d08', '#050403'); threatBoard(g, t, { p: 1, cur: 6, hl: ss(seg(lt, .2, .9)) }); return; }
  bg(g, '#0d0b09', '#050403');
  const cx = 960, cy = 500, r = 360 * eo(seg(lt, 1.4, 2.2));
  sunburst(g, cx, cy, { rays: 60, r0: r * 1.05, r1: r * 1.6, mode: 'lines', w: 1.2, alpha: .6 });
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.clip();
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, '#2a3a30'); gr.addColorStop(1, '#0a120e'); g.fillStyle = gr; g.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  for (const b of BAC) microbe(g, b, cx - r + b.x * 2 * r + Math.sin(t * .3 + b.y * 9) * 10, cy - r + b.y * 2 * r, 1.6, t, .9, '#c9a24b');
  // a cut: coral wound line with microbes gathering
  if (lt > m[1]) { const k = seg(lt, m[1], m[1] + 1.5); gline(g, [[cx - 200, cy + 120], [cx + 200 * eo(k) - 200 + 200, cy + 60]], { w: 6, color: '#e8735a', glow: .6 }); }
  g.restore();
  gline(g, arcPts(cx, cy, r, 0, TAU, 120), { w: 4, glow: .3 }); gline(g, arcPts(cx, cy, r + 14, 0, TAU, 120), { w: 1.2 });
  plaque(g, 'BILLIONS OF YEARS OLD', 960, 940 - 40, { p: seg(lt, m[0], m[0] + .6) * (1 - seg(lt, m[1], m[1] + .3)), size: 24 });
  plaque(g, 'NO HOSPITAL', 960, 900, { p: seg(lt, m[2], m[2] + .6) * (1 - seg(lt, m[3], m[3] + .3)), size: 26, color: '#e8735a' });
  plaque(g, 'UNKNOWN JURASSIC MICROBES', 960, 900, { p: seg(lt, m[3], m[3] + .6), size: 24 });
  vignette(g, W, H, .55);
}
// the flip: a human full of microbes, spilling into the Jurassic
export function flip(g, lt, D, t, o) {
  const m = o.marks;
  const spill = seg(lt, m[6], m[10]), invis = seg(lt, m[12], m[12] + 1.5);
  const cam = { x: 0, y: 1.7, z: 0, f: 1000, oy: 520 };
  world(g, t, cam, { river: 30, riverW: 12, mist: .5, plants: .8, actors: [A.dino('stegosaurus', -14, 22, { t, walk: .3, phase: lt * .2, dark: .2 }), A.dino('diplodocus', 30, 60, { flip: -1, t, walk: .4, phase: lt * .1, dark: .35 })] });
  g.fillStyle = rgba('#050403', .5 * (1 - spill * .6)); g.fillRect(0, 0, W, H);
  const p = seg(lt, 0, 1);
  soldierFront(g, { x: 960, y: 1000, s: 500, t, alpha: lerp(1, .25, seg(lt, m[1], m[1] + 1)) * (1 - invis * .6) });
  // trillions of bacteria: gold specks fill the silhouette then drift out over the landscape
  const R = mulberry(31), n = Math.floor(lerp(0, 600, seg(lt, m[1], m[2] + 1)));
  for (let i = 0; i < 600; i++) {
    const bx = 960 + (R() - .5) * 220, by = 1000 - (.1 + R() * .82) * 500, ex = R() * W, ey = 380 + R() * 650, d = R();
    if (i >= n) continue;
    const u = clamp((spill - d * .5) * 2);
    const x = lerp(bx, ex, ss(u)), y = lerp(by, ey, ss(u)) + Math.sin(t * 2 + i) * 3 * u;
    const a = (.5 + .5 * Math.sin(t * 3 + i)) * (1 - invis * .85);
    g.beginPath(); g.arc(x, y, 2.4, 0, TAU); g.fillStyle = rgba('#f3d98b', a); g.fill();
  }
  plaque(g, 'TRILLIONS OF BACTERIA', 960, 120, { p: seg(lt, m[2], m[2] + .6) * (1 - seg(lt, m[5], m[5] + .3)), size: 26 });
  plaque(g, 'SKIN · GUT', 960, 200, { p: seg(lt, m[3], m[3] + .6) * (1 - seg(lt, m[5], m[5] + .3)), size: 22 });
  plaque(g, 'INTO A JURASSIC ECOSYSTEM?', 960, 120, { p: seg(lt, m[6], m[6] + .6) * (1 - seg(lt, m[10], m[10] + .3)), size: 24 });
  if (lt > m[12]) plaque(g, 'INVISIBLE', 960, 120, { p: seg(lt, m[12], m[12] + .6), size: 30, color: '#e8735a' });
  vignette(g, W, H, .5);
}
// the verdict: the hundred again; a few lights go out
export function verdict(g, lt, D, t, o) {
  const m = o.marks;
  bg(g, '#1c2a1a', '#0c140c');
  g.save(); g.translate(560, 540);
  g.beginPath(); g.arc(0, 0, 400, 0, TAU); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 400); gr.addColorStop(0, '#5a4a2e'); gr.addColorStop(1, '#2e2616'); g.fillStyle = gr; g.fill(); gline(g, arcPts(0, 0, 400, 0, TAU, 100), { w: 3 });
  const R = mulberry(5), lost = new Set(); while (lost.size < 9) lost.add(Math.floor(R() * 100));
  for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), c = i % 10, x = (c - 4.5) * 58, y = (r - 4.5) * 58; const gone = lost.has(i) ? seg(lt, m[7] + [...lost].indexOf(i) * .12, m[7] + .4 + [...lost].indexOf(i) * .12) : 0; soldierTop(g, x, y, 16, -Math.PI / 2, { alpha: 1 - gone * .8, lit: 1 - gone }); }
  g.restore();
  const items = ['STAY TOGETHER', 'AWAY FROM THE RIVER AT NIGHT', 'AVOID THE SAUROPODS', 'EAT THE RIGHT THINGS', 'WATCH THE TREE LINE'];
  items.forEach((n, i) => { const a = m[2 + i]; const p = seg(lt, a - .2, a + .4); if (p <= 0) return; const y = 260 + i * 110; g.save(); g.globalAlpha = eo(p); g.beginPath(); g.arc(1110, y, 18, 0, TAU); g.fillStyle = C.bulb; g.fill(); glow(g, 1110, y, 60, '#ffcf7a', .4); g.restore(); label(g, n, 1150, y + 10, { size: 26, alpha: eo(p), align: 'left' }); });
  titleBar(g, 'MOST OF THEM PROBABLY COULD', 960, 110, { p: seg(lt, m[0], m[0] + 1) * (1 - seg(lt, m[1] - .4, m[1])), size: 40 });
  if (lt > m[7]) plaque(g, 'NOT WITHOUT LOSSES', 1400, 880, { p: seg(lt, m[7], m[7] + .6), size: 28, color: '#e8735a' });
  vignette(g, W, H, .5);
}
// day seven: the floodplain panorama
export function day7(g, lt, D, t, o) {
  const m = o.marks;
  const cam = { x: lerp(-10, 14, lt / D), y: 2.6, z: lerp(-6, 0, lt / D), f: 1000, oy: 520 };
  const actors = [
    A.dino('diplodocus', -40 + lt * .6, 70, { t, walk: .6, phase: walkPh('diplodocus', lt * .6), dark: .25 }), A.dino('apatosaurus', -10 + lt * .5, 90, { t, walk: .6, phase: walkPh('apatosaurus', lt * .5), dark: .35 }), A.dino('brachiosaurus', 30 + lt * .3, 120, { t, walk: .5, phase: walkPh('brachiosaurus', lt * .3), dark: .4 }),
    A.dino('stegosaurus', 6, 32, { t, flip: -1, neck: -10 + Math.sin(t) * 3, dark: .1 }),
    A.dino('allosaurus', 30, 44, { t, flip: -1, dark: .6 }),
    A.soldier(-2, 6, { pose: 'stand', flip: 1, t }), A.soldier(-.5, 6.5, { pose: 'stand', flip: 1, t }), A.soldier(1.2, 6.2, { pose: 'sentry', flip: 1, t })];
  world(g, t, cam, { river: 26, riverW: 14, mist: .7, dusk: .5, plants: .8, actors });
  vignette(g, W, H, .45);
}
// their bones in the rock: the camera sinks below the floodplain
export function bones(g, lt, D, t, o) {
  const m = o.marks, k = eio(seg(lt, 0, 4));
  g.save(); g.translate(0, -k * 900);
  const cam = { x: 0, y: 2.6, z: 0, f: 1000, oy: 520 };
  g.save(); g.beginPath(); g.rect(0, 0, W, 760); g.clip();
  world(g, t, cam, { river: 26, riverW: 14, mist: .7, dusk: .5, plants: .8, actors: [A.dino('stegosaurus', 6, 32, { t, flip: -1, dark: .1 })] });
  g.restore();
  const bands = ['#5a3a24', '#7a5a34', '#4a3a2a', '#8a6a3a', '#5a4430', '#6a4a2a'];
  for (let i = 0; i < bands.length; i++) { const y = 760 + i * 180; const pts = []; for (let x = 0; x <= W; x += 80) pts.push([x, y + Math.sin(x * .004 + i) * 18]); airbrush(g, [...pts, [W, y + 400], [0, y + 400]], { base: bands[i], dark: mix(bands[i], '#000', .6), light: mix(bands[i], '#fff', .15), dir: -2.3 }); gline(g, pts, { w: 1.4 }); }
  const sk = [['allosaurus', 520, 1360, 46, 1], ['stegosaurus', 1360, 1520, 44, -1], ['diplodocus', 980, 1840, 30, 1]];
  sk.forEach(([sp, x, y, s, f], i) => skeleton(g, sp, { x, y, s, flip: f, part: eo(seg(lt, 2 + i * .6, 5 + i * .6)), w: 1.8 }));
  g.restore();
  plaque(g, 'UTAH · WYOMING', 960, 130, { p: seg(lt, m[0] + 2, m[0] + 2.6), size: 28 });
  vignette(g, W, H, .5);
}
// visitors from the future: the doors close on them; the world continues
export function farewell(g, lt, D, t, o) {
  const m = o.marks;
  const cam = { x: lerp(0, 6, lt / D), y: 2.2, z: lerp(0, -8, ss(seg(lt, m[1], D))), f: 1000, oy: 520 };
  const go = seg(lt, 1, m[1]);
  const actors = [A.dino('diplodocus', -30 + lt * .5, 60, { t, walk: .6, phase: walkPh('diplodocus', lt * .5), dark: .2 }), A.dino('stegosaurus', 10, 30, { t, flip: -1, neck: -8, dark: .1 })];
  for (let i = 0; i < 8; i++) if (go < (i + 1) / 9) actors.push(A.soldier(-4 + i * 1.1, 8 + (i % 2), { pose: 'stand', flip: -1, t }));
  world(g, t, cam, { river: 24, riverW: 12, mist: .7, dusk: lerp(.5, .9, lt / D), plants: .8, actors });
  // a deco doorway on the left where the soldiers vanish
  const dp = seg(lt, .3, 1.2) * (1 - seg(lt, m[1] - .5, m[1] + .5));
  if (dp > 0) { const P = stepArchPts(420, 900, 260, 520, { steps: 3 }); g.save(); g.globalAlpha = eo(dp); g.fillStyle = rgba('#ffe6a3', .25); g.fill(toPath(P, true)); glow(g, 420, 700, 300, '#ffcf7a', .4); gline(g, P, { w: 3, glow: .8 }); g.restore(); }
  titleBar(g, 'ONE WEEK IN THE JURASSIC', 960, 470, { p: seg(lt, D - 5.2, D - 4) , out: seg(lt, D - 1.6, D - .8), size: 66 });
  vignette(g, W, H, .5);
}
