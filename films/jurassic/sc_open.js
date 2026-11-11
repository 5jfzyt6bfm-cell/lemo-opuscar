// Chapters 0–2: silence, the soldiers, the place.
import { C, TAU, clamp, lerp, seg, ss, eio, eo, ei, back, mix, rgba, gline, airbrush, toPath, sunburst, fan, glow, sparkle, vignette, arcPts, stepArchPts, hash } from './engine/deco.js';
import { W, H, tw, mech, bg, label, plaque, ruler, crossOut, world, A, threatBoard, goldText, titleBar, decoDigits, FONTS, buildSign, drawSign, litSequence, dino, soldier } from './common.js';
import { soldierFront, soldierTop } from './humans.js';
import { treeFern, ferns, horsetails, conifer, cycad } from './plants.js';

// a gold fern frond that draws itself on black
export function fernDraw(g, lt, D, t, o) {
  bg(g, '#0a0806', '#030302');
  const part = eo(seg(lt, .2, 3.8));
  const cx = 960, cy = 900, L = 640;
  const spine = []; for (let k = 0; k <= 40; k++) { const u = k / 40; spine.push([cx + Math.sin(u * 1.4) * 160 * u + Math.sin(t * .9) * 6 * u, cy - L * u + u * u * 120]); }
  gline(g, spine, { w: 2.6, part, glow: .5 });
  for (let k = 2; k < 40; k += 2) {
    const u = k / 40; if (u > part) break;
    const [px, py] = spine[k], len = 150 * Math.sin(u * Math.PI) * (1 - u * .4), sway = Math.sin(t * 1.2 + k * .3) * 4;
    const lp = ss(seg(part, u, u + .12));
    for (const sg of [-1, 1]) gline(g, [[px, py], [px + sg * len * .55 * lp, py - len * .25 * lp + sway], [px + sg * len * lp, py - len * .05 * lp + sway]], { w: 1.3, alpha: .9 });
  }
  glow(g, cx, cy - 300, 500, '#ffcf7a', .08 * part);
  vignette(g, W, H, .6);
}
// three things that are not there
export function absent(g, lt, D, t, o) {
  bg(g, '#0d0b09', '#050403');
  const xs = [560, 960, 1360], names = ['BIRDSONG', 'GRASS', 'FLOWERS'], T = o.marks;   // local times of "No birdsong / No grass / No flowers"
  for (let i = 0; i < 3; i++) {
    const cx = xs[i], cy = 470, r = 150, e = eo(seg(lt, i * .15, .6 + i * .15));
    g.save(); g.globalAlpha *= e;
    sunburst(g, cx, cy, { rays: 32, r0: r * 1.08, r1: r * 1.5, mode: 'lines', w: 1.2, alpha: .6 });
    g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fillStyle = '#0a0806'; g.fill(); gline(g, arcPts(cx, cy, r, 0, TAU, 80), { w: 2.4 });
    const off = ss(seg(lt, T[i], T[i] + .5)), al = 1 - off * .7;
    if (i === 0) { // bird
      const P = [[cx - 70, cy + 10], [cx - 20, cy - 10], [cx + 10, cy - 40], [cx + 40, cy - 42], [cx + 55, cy - 30], [cx + 80, cy - 26], [cx + 55, cy - 18], [cx + 40, cy + 10], [cx + 10, cy + 30], [cx - 30, cy + 30], [cx - 70, cy + 10]];
      gline(g, P, { w: 2.4, alpha: al }); gline(g, [[cx - 10, cy - 5], [cx + 20, cy - 70], [cx + 30, cy - 10]], { w: 1.8, alpha: al });
      for (let k = 0; k < 3; k++) gline(g, arcPts(cx + 95, cy - 40, 20 + k * 16, -.6, .6, 10), { w: 1.4, alpha: al * (1 - off) });
    } else if (i === 1) { for (let k = -3; k <= 3; k++) gline(g, [[cx + k * 18, cy + 70], [cx + k * 22 + Math.sin(t + k) * 6, cy - 50 - (3 - Math.abs(k)) * 18]], { w: 2, alpha: al }); }
    else { for (let k = 0; k < 5; k++) { const a = k / 5 * TAU - Math.PI / 2; gline(g, arcPts(cx + Math.cos(a) * 34, cy - 10 + Math.sin(a) * 34, 30, 0, TAU, 24), { w: 2, alpha: al }); } gline(g, [[cx, cy + 20], [cx, cy + 90]], { w: 2, alpha: al }); }
    crossOut(g, cx, cy, r * .7, seg(lt, T[i] + .1, T[i] + .5));
    label(g, 'NO ' + names[i], cx, cy + r + 70, { size: 30, alpha: ss(seg(lt, T[i], T[i] + .4)), track: 8 });
    g.restore();
  }
  vignette(g, W, H, .55);
}
// tracking through misty fern forest
export function fernForest(g, lt, D, t, o) {
  const cam = { x: lerp(-30, 10, lt / D), y: 1.7, z: 0, f: 1000, oy: 560 };
  world(g, t, cam, { mist: 1, dusk: .3, river: 0, plants: 1, sun: .6, sunX: 40 });
  g.save(); g.globalAlpha = .9;   // foreground fronds sliding past (parallax)
  for (let i = 0; i < 5; i++) { const x = ((i * 520 - lt * 260) % 2600 + 2600) % 2600 - 300; ferns(g, x, 1120, 420, { sway: t + i, n: 9 }); }
  g.restore();
  vignette(g, W, H, .5);
}
// far call: a sauropod on the horizon, gold rings travel outwards
export function distantCall(g, lt, D, t, o) {
  const cam = { x: 0, y: 2, z: lerp(0, 3, lt / D), f: 1100, oy: 640 };
  const C_ = world(g, t, cam, { dusk: .7, mist: .8, river: 60, riverW: 30, plants: .8, sunX: -300 });
  const X = 30, Z = 420, [px, py] = C_.P(X, 0, Z), s = C_.scaleAt(X, 0, Z);
  dino(g, 'brachiosaurus', { x: px, y: py, s, t, walk: .4, phase: lt * .15, tint: ['#20262a', .55], keyline: false });
  const call = seg(lt, .8, D);
  for (let k = 0; k < 6; k++) { const u = (call * 2.2 - k * .3); if (u <= 0 || u > 1) continue; gline(g, arcPts(px + 60, py - 12 * s, 40 + u * 900, -2.6, -.5, 60), { w: 2.2 * (1 - u), alpha: (1 - u) * .9 }); }
  vignette(g, W, H, .5);
}

// ---------- the soldiers ----------
// Busby Berkeley overhead: one hundred soldiers fill a 10×10 grid in a fern clearing
export function formation(g, lt, D, t, o) {
  bg(g, '#1c2a1a', '#0c140c');
  const rot = lt * .02, z = lerp(1.15, 1, eo(seg(lt, 0, D)));
  g.save(); g.translate(960, 520); g.rotate(rot); g.scale(z, z); g.translate(-960, -520);
  // clearing: a deco disc of bare ground ringed with ferns seen from above
  g.beginPath(); g.arc(960, 520, 470, 0, TAU); const gr = g.createRadialGradient(960, 520, 0, 960, 520, 470); gr.addColorStop(0, '#5a4a2e'); gr.addColorStop(1, '#2e2616'); g.fillStyle = gr; g.fill();
  sunburst(g, 960, 520, { rays: 48, r0: 0, r1: 470, mode: 'wedges', colorA: 'rgba(201,162,75,.07)' });
  gline(g, arcPts(960, 520, 470, 0, TAU, 120), { w: 3 }); gline(g, arcPts(960, 520, 450, 0, TAU, 120), { w: 1 });
  for (let i = 0; i < 40; i++) { const a = i / 40 * TAU, x = 960 + Math.cos(a) * 560, y = 520 + Math.sin(a) * 560; for (let k = 0; k < 7; k++) { const b = a + (k - 3) * .4; airbrush(g, [[x, y], [x + Math.cos(b) * 90 - Math.sin(b) * 14, y + Math.sin(b) * 90 + Math.cos(b) * 14], [x + Math.cos(b) * 100, y + Math.sin(b) * 100], [x + Math.cos(b) * 90 + Math.sin(b) * 14, y + Math.sin(b) * 90 - Math.cos(b) * 14]], { base: '#1d6b57', dark: '#0b2e26', light: '#4fa486' }); } }
  const T0 = .4, T1 = Math.min(D - 1, 3.6);
  for (let i = 0; i < 100; i++) {
    const r = Math.floor(i / 10), c = i % 10, x = 960 + (c - 4.5) * 64, y = 520 + (r - 4.5) * 64;
    const ti = lerp(T0, T1, Math.pow(i / 99, .8)), a = ss(seg(lt, ti, ti + .25));
    if (a <= 0) continue;
    if (lt < ti + .4) glow(g, x, y, 50, '#ffcf7a', .5 * (1 - seg(lt, ti, ti + .4)));
    soldierTop(g, x, y, 17, -Math.PI / 2, { alpha: a });
  }
  g.restore();
  const cnt = Math.min(100, Math.floor(clamp((lt - T0) / (T1 - T0)) ** (1 / .8) * 100) + (lt >= T0 ? 1 : 0));
  decoDigits(g, String(Math.min(100, cnt)), 1700, 190, 90, { alpha: ss(seg(lt, .3, .8)) });
  label(g, 'SOLDIERS', 1700, 240, { size: 22, alpha: ss(seg(lt, .3, .8)) });
  vignette(g, W, H, .5);
}
// kit plate: front view + unfolding plaques
export function kit(g, lt, D, t, o) {
  bg(g, '#16110b', '#060504');
  sunburst(g, 960, 1000, { rays: 40, r0: 0, r1: 1600, a0: Math.PI, a1: TAU, mode: 'wedges', colorA: 'rgba(201,162,75,.06)' });
  const P = stepArchPts(960, 1000, 640, 880, { steps: 3 }); g.fillStyle = 'rgba(8,6,4,.7)'; g.fill(toPath(P, true)); gline(g, P, { w: 2.4 });
  soldierFront(g, { x: 960, y: 960, s: 440, t });
  const items = [['RIFLE', 640, 640, 870, 590], ['BODY ARMOR', 1300, 470, 1010, 500], ['RADIO', 1300, 330, 1040, 400], ['TRAINING', 620, 340, 930, 270]];
  items.forEach(([n, x, y, tx, ty], i) => { const p = seg(lt, o.marks[i], o.marks[i] + .6); if (p <= 0) return; gline(g, [[x + (x < 960 ? 110 : -110), y], [tx, ty]], { w: 1.4, part: eo(p) }); plaque(g, n, x, y, { p, size: 28 }); });
  vignette(g, W, H, .5);
}
// one mission: seven bulbs
export function mission(g, lt, D, t, o) {
  bg(g, '#120d08', '#050403');
  sunburst(g, 960, 560, { rays: 64, r0: 0, r1: 1500, mode: 'wedges', colorA: 'rgba(201,162,75,.05)', rot: lt * .02 });
  titleBar(g, 'ONE MISSION', 960, 260, { p: seg(lt, 0, 1), size: 70 });
  const sg = buildSign('SURVIVE 7 DAYS', { size: 150, spacing: 16 }), sc = Math.min(1, 1500 / sg.w), x = 960 - sg.w * sc / 2;
  const t0 = o.marks[0]; drawSign(g, sg, x, 420, sc, { lit: litSequence(lt, sg.letters.map((_, i) => t0 + i * .07), { chaseFrom: t0 + 1.4 }) });
  for (let i = 0; i < 7; i++) { const bx = 960 + (i - 3) * 90, by = 790, l = lt > t0 + .9 + i * .1 ? 1 : 0; g.beginPath(); g.arc(bx, by, 22, 0, TAU); g.fillStyle = l ? C.bulb : '#1a140c'; g.fill(); if (l) glow(g, bx, by, 80, '#ffcf7a', .5); gline(g, arcPts(bx, by, 27, 0, TAU, 30), { w: 1.4 }); label(g, String(i + 1), bx, by + 64, { size: 22 }); }
  vignette(g, W, H, .55);
}
// the time machine: odometer back to 150,000,000 years
export function timeDial(g, lt, D, t, o) {
  bg(g, '#120d08', '#050403');
  const z = lerp(1, 1.1, ss(seg(lt, 0, D)));
  g.save(); g.translate(960, 500); g.scale(z, z); g.translate(-960, -500);
  sunburst(g, 960, 500, { rays: 64, r0: 0, r1: 1500, mode: 'wedges', rot: lt * .04, colorA: 'rgba(201,162,75,.06)' });
  g.beginPath(); g.arc(960, 500, 360, 0, TAU); const fg = g.createRadialGradient(900, 420, 0, 960, 500, 360); fg.addColorStop(0, '#2a1f12'); fg.addColorStop(1, '#060504'); g.fillStyle = fg; g.fill();
  gline(g, arcPts(960, 500, 370, 0, TAU, 120), { w: 3, glow: .4 }); gline(g, arcPts(960, 500, 346, 0, TAU, 120), { w: 1.2 });
  for (let i = 0; i < 60; i++) { const a = i / 60 * TAU - lt * .5 * (1 - seg(lt, 2.6, 3.2)); const big = i % 5 === 0; gline(g, [[960 + Math.cos(a) * (big ? 306 : 320), 500 + Math.sin(a) * (big ? 306 : 320)], [960 + Math.cos(a) * 334, 500 + Math.sin(a) * 334]], { w: big ? 2 : 1 }); }
  const u = seg(lt, .2, 2.8), e = 1 - Math.pow(1 - u, 3), n = u >= 1 ? 150000000 : Math.max(0, Math.round(Math.pow(10, e * 8.176))) - 1;
  const str = Math.max(0, n).toLocaleString('en-US');
  label(g, 'YEARS IN THE PAST', 960, 400, { size: 30, track: 9 });
  decoDigits(g, str, 960, 565, str.length > 9 ? 96 : 116, { sheen: lerp(-.2, 1.2, seg(lt, 2.8, 3.6)) });
  label(g, 'LATE JURASSIC', 960, 690, { size: 30, track: 12, alpha: ss(seg(lt, 2.9, 3.4)) });
  g.restore();
  vignette(g, W, H, .6);
}
// eyes in the dark that have never seen a human
export function eyes(g, lt, D, t, o) {
  const cam = { x: 0, y: 1.6, z: 0, f: 1000, oy: 600 };
  world(g, t, cam, { night: 1, mist: .4, river: 0, plants: 1, sun: 0, clearing: [0, 14, 8, 10] });
  soldier(g, { x: 960, y: 900, s: 190, pose: 'sentry', flip: 1, t, nvg: true });
  const pairs = [[260, 520, 1.4], [520, 600, .9], [1460, 560, 1.2], [1700, 500, .8], [760, 470, .7], [1180, 450, .6], [360, 700, 1], [1600, 690, 1.1]];
  pairs.forEach(([x, y, s], i) => {
    const op = ss(seg(lt, .6 + i * .35, .9 + i * .35)) * (.6 + .4 * (Math.sin(t * .7 + i) > -.95 ? 1 : 0)), blink = Math.abs(Math.sin(t * .4 + i * 1.3)) < .04 ? .1 : 1;
    if (op <= 0) return;
    for (const dx of [-14 * s, 14 * s]) { glow(g, x + dx, y, 26 * s, '#ffcf6a', .5 * op); g.save(); g.translate(x + dx, y); g.scale(1, blink); g.beginPath(); g.ellipse(0, 0, 7 * s, 4.5 * s, 0, 0, TAU); g.fillStyle = rgba('#ffd27a', op); g.fill(); g.fillStyle = rgba('#100800', op); g.fillRect(-1.2 * s, -4 * s, 2.4 * s, 8 * s); g.restore(); }
  });
  vignette(g, W, H, .65);
}

// ---------- the place ----------
let LAND = null;
export async function loadMap() { LAND = await (await fetch('na_land.json')).json(); }
const MORRISON = [[-113.8, 48.6], [-110, 48.9], [-106.5, 47.6], [-104.4, 45.6], [-103.6, 43.2], [-102.8, 40.6], [-103.2, 37.4], [-104.6, 35.2], [-107.6, 35.0], [-110.4, 36.4], [-112.3, 37.6], [-113.0, 39.8], [-112.4, 42.2], [-111.6, 44.6], [-113.4, 46.8]];
const STATES = [['MONTANA', -109.6, 47.0], ['WYOMING', -107.5, 43.0], ['UTAH', -111.6, 39.3], ['COLORADO', -105.5, 39.0]];
export function mapScene(g, lt, D, t, o) {
  bg(g, '#0d0b09', '#050403');
  const z = lerp(1, 1.5, eio(seg(lt, o.marks[1] - .5, o.marks[1] + 2.5)));
  const lon0 = -108, lat0 = 41, k = 34 * z;   // px per degree (equirectangular, cos-lat corrected)
  const Pj = (lon, lat) => [960 + (lon - lon0) * k * Math.cos(41 * Math.PI / 180), 540 - (lat - lat0) * k];
  // graticule
  g.save(); g.globalAlpha = .25;
  for (let lon = -130; lon <= -85; lon += 5) gline(g, [Pj(lon, 20), Pj(lon, 60)], { w: .7 });
  for (let lat = 20; lat <= 60; lat += 5) gline(g, [Pj(-140, lat), Pj(-80, lat)], { w: .7 });
  g.restore();
  // land (coastline only, no borders)
  const draw = eo(seg(lt, 0, 2.2));
  if (LAND) for (const ring of LAND) {
    const P = ring.map(([a, b]) => Pj(a, b));
    g.fillStyle = rgba('#3a2e1c', .55 * draw); g.fill(toPath(P, true));
    gline(g, P, { w: 1.6, part: draw, closed: false });
  }
  // the Morrison Formation outcrop glows
  const m = seg(lt, o.marks[1] - .3, o.marks[1] + 1.2);
  if (m > 0) { const P = MORRISON.map(([a, b]) => Pj(a, b)); g.save(); g.globalAlpha = eo(m); airbrush(g, P, { base: '#8a5a2a', dark: '#4a2a12', light: '#e8b060', dir: -2.3 }); gline(g, [...P, P[0]], { w: 2.4, glow: .6, part: eo(m) }); g.restore(); }
  STATES.forEach(([n, lo, la], i) => { const tt = o.marks[2] + i * .45, p = seg(lt, tt, tt + .5); if (p <= 0) return; const [x, y] = Pj(lo, la); g.beginPath(); g.arc(x, y, 6, 0, TAU); g.fillStyle = C.bulb; g.fill(); glow(g, x, y, 40, '#ffcf7a', .5 * p); label(g, n, x, y - 16, { size: 22 * Math.min(1.3, z * .9), alpha: ss(p) }); });
  plaque(g, 'WESTERN NORTH AMERICA', 960, 110, { p: seg(lt, .4, 1.2), size: 26 });
  if (m > .5) plaque(g, 'THE MORRISON FORMATION', 960, 880, { p: seg(lt, o.marks[1] + .2, o.marks[1] + 1), size: 30 });
  vignette(g, W, H, .55);
}
// a section through the rock: strata with bones glinting
export function strata(g, lt, D, t, o) {
  bg(g, '#0d0b09', '#050403');
  const bands = ['#5a3a24', '#7a5a34', '#4a3a2a', '#8a6a3a', '#5a4430', '#6a4a2a', '#3a2a1c'];
  const y0 = lerp(200, 120, ss(seg(lt, 0, D)));
  for (let i = 0; i < bands.length; i++) {
    const y = y0 + i * 130, pts = [[0, y + Math.sin(i) * 20]]; for (let x = 0; x <= W; x += 80) pts.push([x, y + Math.sin(x * .004 + i) * 22]);
    const poly = [...pts, [W, H], [0, H]]; airbrush(g, poly, { base: bands[i], dark: mix(bands[i], '#000', .6), light: mix(bands[i], '#fff', .15), dir: -2.3 });
    gline(g, pts, { w: 1.4, alpha: .8 });
  }
  // fossils: skeletons in the layers
  const sk = [['allosaurus', 520, y0 + 330, 34, 1], ['stegosaurus', 1340, y0 + 470, 30, -1], ['diplodocus', 980, y0 + 690, 18, 1], ['ceratosaurus', 360, y0 + 610, 30, -1]];
  sk.forEach(([sp, x, y, s, f], i) => { const p = seg(lt, .5 + i * .5, 2.5 + i * .5); if (p > 0) skel(g, sp, { x, y, s, flip: f, part: eo(p), w: 1.4 }); });
  for (let i = 0; i < 14; i++) { const x = hash(i * 3.1) * W, y = y0 + 160 + hash(i * 7.7) * 700; sparkle(g, x, y, 14 * Math.max(0, Math.sin(t * 1.5 + i * 2)), { alpha: .8 }); }
  vignette(g, W, H, .5);
}
import { skeleton as skel } from './dinos.js';
// "we know which predators / plants / injuries"
export function weKnow(g, lt, D, t, o) {
  bg(g, '#120d08', '#050403');
  sunburst(g, 960, 540, { rays: 60, r0: 0, r1: 1500, mode: 'wedges', colorA: 'rgba(201,162,75,.05)' });
  const xs = [520, 960, 1400], names = ['PREDATORS', 'PLANTS', 'INJURIES'];
  for (let i = 0; i < 3; i++) {
    const p = seg(lt, o.marks[i] - .2, o.marks[i] + .6); if (p <= 0) continue;
    const cx = xs[i], cy = 470, r = 170 * eo(p);
    g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fillStyle = '#0a0806'; g.fill(); gline(g, arcPts(cx, cy, r, 0, TAU, 80), { w: 2.6, glow: .3 }); gline(g, arcPts(cx, cy, r * .9, 0, TAU, 80), { w: 1 });
    g.save(); g.beginPath(); g.arc(cx, cy, r * .88, 0, TAU); g.clip();
    if (i === 0) dino(g, 'allosaurus', { x: cx - 10, y: cy + 90, s: 34, t, jaw: .4 });
    if (i === 1) { cycad(g, cx - 60, cy + 110, 150, { sway: t }); horsetails(g, cx + 70, cy + 110, 160, { n: 5 }); }
    if (i === 2) { skel(g, 'allosaurus', { x: cx - 10, y: cy + 90, s: 34, w: 1.2 }); for (let k = 0; k < 5; k++) { const x = cx - 100 + k * 45, y = cy + 20 - (k % 2) * 30; glow(g, x, y, 22, '#e8735a', .7); } }
    g.restore();
    label(g, names[i], cx, cy + 240, { size: 30, alpha: ss(p) });
  }
  vignette(g, W, H, .55);
}
// the board is built: which part of this world would kill them first?
export function boardIntro(g, lt, D, t, o) {
  bg(g, '#120d08', '#050403');
  threatBoard(g, t, { p: seg(lt, 0, 1.4), cur: -1, title: o.title || null, titleP: seg(lt, o.titleAt ?? 99, (o.titleAt ?? 99) + 1) });
}
