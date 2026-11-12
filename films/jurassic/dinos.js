// Dinosaur rigs drawn from skeletal proportions (metres). Side profile; body = tube along a spine with dorsal/ventral
// thickness, jointed legs with a walk cycle, head with a hinged jaw. Deco rendering: airbrushed volume + gold rim + fine keyline.
import { C, TAU, clamp, lerp, mix, rgba, gline, airbrush, toPath, glow } from './engine/deco.js';

const D2R = Math.PI / 180;
// Catmull-Rom resample of [x,y,top,bot] control points
function resample(P, per = 6) {
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      const cr = j => .5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3);
      out.push([cr(0), cr(1), lerp(p1[2], p2[2], t), lerp(p1[3], p2[3], t)]);
    }
  }
  out.push(P[P.length - 1].slice());
  return out;
}
function tube(S) {   // spine samples → outline polygon (top forward, bottom back)
  const top = [], bot = [];
  for (let i = 0; i < S.length; i++) {
    const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
    const nx = -dy, ny = dx;    // normal pointing "up" for a spine running +x
    top.push([S[i][0] + nx * S[i][2], S[i][1] + ny * S[i][2]]);
    bot.push([S[i][0] - nx * S[i][3], S[i][1] - ny * S[i][3]]);
  }
  return { top, bot, poly: [...top, ...bot.reverse()] };
}
function ik2(hx, hy, ax, ay, l1, l2, bend = 1) {   // hip → ankle, knee bends forward (bend=1) or back (-1)
  let dx = ax - hx, dy = ay - hy; let d = Math.hypot(dx, dy); const dm = l1 + l2 - 1e-4;
  if (d > dm) { dx *= dm / d; dy *= dm / d; d = dm; }
  const a = Math.atan2(dy, dx), c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const k = a + bend * Math.acos(c);
  return [hx + Math.cos(k) * l1, hy + Math.sin(k) * l1, hx + dx, hy + dy];
}
function seg4(ax, ay, bx, by, w0, w1) {  // tapered limb segment polygon
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  return [[ax + nx * w0, ay + ny * w0], [bx + nx * w1, by + ny * w1], [bx - nx * w1, by - ny * w1], [ax - nx * w0, ay - ny * w0]];
}
function smooth(P, it = 3) {   // Chaikin, closed
  let Q = P;
  for (let k = 0; k < it; k++) { const R = []; for (let i = 0; i < Q.length; i++) { const a = Q[i], b = Q[(i + 1) % Q.length]; R.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]); } Q = R; }
  return Q;
}
function ell(cx, cy, rx, ry, n = 14) { const o = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; }

// ---------- species ----------
// spine: [x, y, top, bot] tail tip → neck end (metres, ground y=0, hip x=0). head: occiput at neck end.
export const SPECIES = {
  allosaurus: {
    name: 'Allosaurus', len: 8.6, colors: { base: '#5b4a3a', dark: '#1c140e', light: '#9a7b58', belly: '#b49470', stripe: '#2e2219' },
    spine: [[-4.7, 1.9, .03, .03], [-4.0, 2.0, .08, .1], [-3.2, 2.1, .15, .2], [-2.4, 2.2, .23, .33], [-1.6, 2.28, .31, .45], [-.8, 2.34, .37, .56],
      [0, 2.38, .42, .72], [.6, 2.36, .42, .95], [1.2, 2.3, .4, 1.05], [1.8, 2.22, .36, .9], [2.25, 2.26, .3, .55], [2.6, 2.46, .25, .36], [2.85, 2.7, .22, .26]],
    neckFrom: 9, headAng: -10,
    head: 'allo', headLen: .86,
    hind: { at: [0, 2.1], l: [.9, .8, .4], toe: .32, w: [.42, .18, .09], stride: 1.5, lift: .28, bend: 1, mt: 62 },
    arm: { at: [1.75, 1.9], l: [.38, .3], hand: .2, w: [.1, .06], claws: 3 },
    stripes: true,
  },
  ceratosaurus: {
    name: 'Ceratosaurus', len: 6.2, colors: { base: '#4a4a3a', dark: '#14140c', light: '#8a8a62', belly: '#a8a07a', stripe: '#24241a' },
    spine: [[-3.4, 1.45, .03, .05], [-2.8, 1.55, .12, .2], [-2.1, 1.63, .22, .36], [-1.3, 1.7, .3, .46], [-.6, 1.75, .32, .5],
      [0, 1.78, .33, .58], [.5, 1.76, .32, .74], [1.0, 1.7, .3, .76], [1.4, 1.64, .26, .6], [1.75, 1.7, .21, .36], [2.0, 1.86, .17, .24], [2.15, 2.02, .15, .18]],
    neckFrom: 8, headAng: -10,
    head: 'cerato', headLen: .62,
    hind: { at: [0, 1.6], l: [.68, .62, .32], toe: .26, w: [.32, .14, .07], stride: 1.2, lift: .22, bend: 1, mt: 62 },
    arm: { at: [1.35, 1.42], l: [.24, .18], hand: .12, w: [.07, .05], claws: 4 },
    osteoderms: true, stripes: true,
  },
  torvosaurus: {
    name: 'Torvosaurus', len: 10, colors: { base: '#5a3a30', dark: '#1a0e0a', light: '#9a6a50', belly: '#b48a6a', stripe: '#2a1812' },
    spine: [[-5.2, 2.1, .03, .04], [-4.4, 2.2, .1, .12], [-3.5, 2.32, .18, .25], [-2.6, 2.44, .28, .38], [-1.7, 2.55, .37, .52], [-.8, 2.62, .44, .64],
      [0, 2.66, .5, .82], [.8, 2.62, .5, 1.12], [1.6, 2.54, .46, 1.18], [2.3, 2.44, .4, .95], [2.75, 2.5, .33, .55], [3.1, 2.72, .27, .36], [3.35, 2.98, .24, .28]],
    neckFrom: 9, headAng: -8,
    head: 'torvo', headLen: 1.12,
    hind: { at: [0, 2.3], l: [1.0, .88, .42], toe: .36, w: [.5, .22, .11], stride: 1.6, lift: .3, bend: 1, mt: 62 },
    arm: { at: [1.95, 2.1], l: [.38, .26], hand: .2, w: [.13, .09], claws: 3 },
  },
  ornitholestes: {
    name: 'Ornitholestes', len: 2.1, colors: { base: '#6a5a3a', dark: '#201a10', light: '#b09a68', belly: '#c8b28a', stripe: '#3a2e1a' },
    spine: [[-1.25, .55, .01, .01], [-1.0, .58, .03, .03], [-.7, .62, .05, .06], [-.4, .66, .06, .08], [-.15, .69, .07, .1],
      [0, .7, .08, .12], [.2, .69, .08, .16], [.4, .66, .07, .15], [.55, .64, .06, .1], [.66, .7, .04, .06], [.73, .8, .035, .045], [.77, .88, .03, .035]],
    neckFrom: 8, headAng: -6,
    head: 'orni', headLen: .17,
    hind: { at: [0, .62], l: [.22, .24, .14], toe: .08, w: [.07, .03, .015], stride: .5, lift: .1, bend: 1, mt: 60 },
    arm: { at: [.45, .56], l: [.1, .09], hand: .08, w: [.022, .015], claws: 3 },
    feathers: true,
  },
  stegosaurus: {
    name: 'Stegosaurus', len: 9, colors: { base: '#4a5a3e', dark: '#141a10', light: '#8a9a68', belly: '#a8aa84', stripe: '#26301e', plate: '#8a5a36' },
    spine: [[-4.5, 1.3, .05, .07], [-3.7, 1.62, .12, .16], [-2.8, 2.0, .22, .32], [-1.6, 2.36, .36, .55], [-.6, 2.56, .46, .8],
      [0, 2.6, .5, .95], [1.0, 2.46, .5, 1.12], [1.9, 2.12, .44, 1.0], [2.6, 1.7, .32, .62], [3.15, 1.32, .2, .3], [3.55, 1.06, .14, .17], [3.8, .9, .11, .13]],
    neckFrom: 9, headAng: -38,
    head: 'stego', headLen: .46,
    hind: { at: [0, 2.15], l: [1.1, .82, .28], toe: .22, w: [.42, .24, .16], stride: 1.1, lift: .22, bend: -1, mt: 80, column: true },
    fore: { at: [2.05, 1.45], l: [.66, .55, .16], toe: .14, w: [.26, .18, .14], stride: 1.1, lift: .2, bend: 1, mt: 90, column: true },
    plates: true, spikes: true,
  },
  diplodocus: {
    name: 'Diplodocus', len: 25.5, colors: { base: '#4e4a52', dark: '#151318', light: '#8e8794', belly: '#a8a0a6', stripe: '#2a262e' },
    spine: [[-14, 1.9, .015, .015], [-12.5, 2.2, .045, .045], [-11, 2.5, .09, .1], [-9.5, 2.85, .16, .19], [-8, 3.2, .25, .3], [-6.3, 3.55, .36, .46],
      [-4.5, 3.88, .5, .7], [-2.4, 4.1, .66, 1.05], [0, 4.25, .82, 1.45], [1.6, 4.15, .86, 1.85], [3.0, 3.95, .76, 1.75], [4.1, 3.9, .6, 1.1],
      [5.4, 4.2, .42, .62], [6.9, 4.6, .32, .42], [8.4, 5.02, .24, .3], [9.8, 5.35, .18, .21], [10.9, 5.5, .14, .15]],
    neckFrom: 11, headAng: -30,
    head: 'diplo', headLen: .62,
    hind: { at: [0, 3.3], l: [1.75, 1.25, .35], toe: .4, w: [.62, .42, .34], stride: 1.8, lift: .3, bend: -1, mt: 82, column: true },
    fore: { at: [3.4, 3.1], l: [1.4, 1.1, .5], toe: .2, w: [.5, .36, .3], stride: 1.8, lift: .3, bend: 1, mt: 90, column: true },
  },
  apatosaurus: {
    name: 'Apatosaurus', len: 22, colors: { base: '#5a4e44', dark: '#18120e', light: '#9a8a76', belly: '#b0a08a', stripe: '#2e2620' },
    spine: [[-11.5, 1.9, .02, .02], [-10, 2.3, .07, .08], [-8.4, 2.75, .18, .22], [-6.8, 3.2, .32, .4], [-5.1, 3.6, .48, .64],
      [-3.0, 3.98, .7, 1.05], [0, 4.25, .9, 1.6], [1.6, 4.15, .92, 1.95], [3.0, 3.95, .82, 1.8], [4.0, 3.85, .68, 1.25],
      [5.2, 4.1, .6, .9], [6.5, 4.45, .5, .72], [7.8, 4.82, .4, .55], [9.0, 5.15, .3, .38], [9.9, 5.3, .21, .23]],
    neckFrom: 9, headAng: -30,
    head: 'diplo', headLen: .62,
    hind: { at: [0, 3.2], l: [1.7, 1.2, .35], toe: .42, w: [.72, .5, .4], stride: 1.6, lift: .28, bend: -1, mt: 82, column: true },
    fore: { at: [3.3, 2.9], l: [1.35, 1.05, .5], toe: .2, w: [.58, .42, .36], stride: 1.6, lift: .28, bend: 1, mt: 90, column: true },
  },
  brachiosaurus: {
    name: 'Brachiosaurus', len: 22, colors: { base: '#5a5446', dark: '#18160e', light: '#9a9276', belly: '#b2aa8a', stripe: '#2e2a20' },
    spine: [[-8.6, 3.3, .02, .03], [-7.2, 3.7, .08, .1], [-5.6, 4.2, .2, .26], [-3.9, 4.75, .36, .5], [-2.0, 5.3, .56, .9],
      [0, 5.8, .74, 1.35], [1.6, 6.3, .8, 1.8], [3.0, 6.75, .7, 1.7], [3.9, 7.2, .55, 1.0], [4.6, 8.1, .42, .6],
      [5.2, 9.0, .33, .42], [5.8, 9.9, .27, .32], [6.3, 10.8, .22, .25], [6.75, 11.6, .18, .19], [7.1, 12.2, .15, .15]],
    neckFrom: 8, headAng: -20,
    head: 'brachio', headLen: .8,
    hind: { at: [0, 4.7], l: [2.0, 1.45, .4], toe: .45, w: [.62, .44, .34], stride: 1.8, lift: .3, bend: -1, mt: 84, column: true },
    fore: { at: [3.0, 5.4], l: [2.3, 1.85, .9], toe: .2, w: [.55, .38, .3], stride: 1.8, lift: .3, bend: 1, mt: 90, column: true },
  },
};

// ---------- heads (local frame: occiput at origin, +x forward; metres for a skull of length L=1) ----------
const HEADS = {
  allo: { top: [[-.02, .1], [.12, .2], [.3, .27], [.36, .24], [.4, .2], [.62, .15], [.84, .07], [1.0, .02], [1.01, -.05]], up: [[.98, -.07], [.7, -.1], [.35, -.12], [.05, -.12]],
    jaw: [[.06, -.09], [.95, -.09], [.92, -.15], [.6, -.18], [.3, -.24], [.08, -.2]], eye: [.3, .12], fen: [.55, .02, .14, .055], hinge: [.07, -.1], horns: [[.28, .24, .36, .3, .42, .22]] },
  cerato: { top: [[-.02, .12], [.1, .2], [.28, .22], [.4, .2], [.62, .16], [.7, .16], [.84, .1], [.98, .02], [1.0, -.06]], up: [[.97, -.08], [.65, -.14], [.3, -.15], [.05, -.13]],
    jaw: [[.06, -.11], [.94, -.1], [.9, -.17], [.6, -.22], [.3, -.26], [.08, -.22]], eye: [.24, .1], fen: [.48, .0, .12, .05], hinge: [.07, -.12],
    horns: [[.64, .15, .72, .33, .8, .12], [.2, .2, .26, .3, .32, .2]] },
  torvo: { top: [[-.02, .08], [.12, .16], [.3, .18], [.55, .14], [.8, .08], [1.0, .0], [1.0, -.06]], up: [[.98, -.08], [.7, -.12], [.3, -.12], [.04, -.11]],
    jaw: [[.06, -.09], [.95, -.1], [.92, -.15], [.6, -.17], [.3, -.21], [.08, -.18]], eye: [.24, .09], fen: [.5, .0, .14, .045], hinge: [.07, -.1] },
  orni: { top: [[-.02, .14], [.15, .28], [.35, .3], [.6, .2], [.85, .08], [1.0, .0], [1.0, -.06]], up: [[.97, -.08], [.6, -.12], [.3, -.14], [.05, -.13]],
    jaw: [[.06, -.11], [.94, -.1], [.9, -.16], [.5, -.2], [.08, -.2]], eye: [.33, .14], fen: [.6, .02, .1, .05], hinge: [.07, -.12] },
  stego: { top: [[-.02, .14], [.15, .2], [.4, .18], [.7, .12], [.92, .05], [1.0, -.02]], up: [[.98, -.08], [.7, -.12], [.35, -.14], [.05, -.14]],
    jaw: [[.06, -.12], [.9, -.1], [.84, -.16], [.4, -.2], [.08, -.2]], eye: [.26, .08], hinge: [.07, -.12], beak: true },
  diplo: { top: [[-.02, .14], [.12, .22], [.26, .26], [.36, .2], [.6, .12], [.85, .08], [1.0, .02], [1.0, -.05]], up: [[.97, -.07], [.6, -.1], [.3, -.12], [.05, -.13]],
    jaw: [[.06, -.11], [.95, -.08], [.92, -.13], [.5, -.16], [.08, -.18]], eye: [.24, .1], hinge: [.07, -.12], nares: [.32, .22] },
  brachio: { top: [[-.02, .14], [.1, .26], [.2, .38], [.32, .44], [.46, .4], [.56, .22], [.78, .12], [1.0, .04], [1.0, -.05]], up: [[.97, -.07], [.6, -.1], [.3, -.12], [.05, -.13]],
    jaw: [[.06, -.11], [.95, -.08], [.92, -.14], [.5, -.17], [.08, -.18]], eye: [.24, .14], hinge: [.07, -.12], nares: [.36, .42] },
};

// gait: foot offset along x (relative) and lift at phase u (0..1): 60% stance, 40% swing
function foot(u, L, lift) {
  u = ((u % 1) + 1) % 1;
  if (u < .6) return [L / 2 - L * (u / .6), 0];
  const v = (u - .6) / .4, e = v * v * (3 - 2 * v);
  return [-L / 2 + L * e, lift * Math.sin(Math.PI * v)];
}

// Draw. o: x,y = screen point of ground under the hip; s = px per metre; flip = 1 faces right, -1 left;
// phase = gait cycle (advance with distance), walk = 0..1 blends stand→walk; jaw 0..1; neck = extra neck raise (deg); headTilt deg; tail = wave amp; t = time (breathing, tail sway)
export function dino(g, sp, o = {}) {
  const S = typeof sp === 'string' ? SPECIES[sp] : sp;
  const { x = 960, y = 900, s = 60, flip = 1, phase = 0, walk = 0, jaw = 0, neck = 0, headTilt = 0, tail = 1, t = 0, alpha = 1, light = 1, keyline = true, rim = true, colors = null, tint = null, silhouette = null } = o;
  const col = { ...S.colors, ...(colors || {}) };
  if (globalThis.__VIG) for (const k of Object.keys(col)) col[k] = mix(col[k], '#fff4e0', k === 'dark' ? .08 : .16);
  if (tint) for (const k of Object.keys(col)) col[k] = mix(col[k], tint[0], tint[1]);
  const W = (mx, my) => [x + flip * mx * s, y - my * s];
  // spine with animation: neck raise, tail sway, breathing, gait bob
  const bob = walk * Math.abs(Math.sin(phase * TAU)) * .03 * (S.hind.l[0] + S.hind.l[1]);
  const sp0 = S.spine.map(p => p.slice());
  const nf = S.neckFrom, base = sp0[nf - 1];
  for (let i = nf; i < sp0.length; i++) {
    const k = (i - nf + 1) / (sp0.length - nf), a = neck * D2R * k;
    const dx = sp0[i][0] - base[0], dy = sp0[i][1] - base[1];
    sp0[i][0] = base[0] + dx * Math.cos(a) - dy * Math.sin(a); sp0[i][1] = base[1] + dx * Math.sin(a) + dy * Math.cos(a);
  }
  const hipI = sp0.findIndex(p => p[0] === 0 && p !== sp0[0]) >= 0 ? sp0.findIndex(p => p[0] === 0) : 0;
  for (let i = 0; i < hipI; i++) { const k = 1 - i / hipI; sp0[i][1] += Math.sin(t * 1.3 + i * .6) * .06 * k * k * tail * (S.len / 9); }
  for (const p of sp0) { p[1] -= bob; }
  const Sm = resample(sp0, 6);
  const tb = tube(Sm);
  g.save(); g.globalAlpha *= alpha;
  const fillLimb = (poly, far) => { const P = poly.map(([a, b]) => W(a, b)); airbrush(g, P, { base: far ? mix(col.base, col.dark, .45) : col.base, dark: col.dark, light: far ? col.base : col.light, dir: -2.2 }); if (!far && keyline) gline(g, P, { w: Math.max(.6, Math.min(1.6, s * .014)), closed: true, alpha: .35 }); };
  const limbs = [];
  const legPose = (L, ph, at) => {   // returns polygons for one leg
    const [fx, fl] = foot(ph, L.stride * walk, L.lift * walk);
    const hx = at[0], hy = at[1] - bob;
    const mt = L.mt * D2R;   // metatarsus angle from ground
    const ax = hx + fx - Math.cos(mt) * L.l[2], ay = fl + Math.sin(mt) * L.l[2];
    const [kx, ky, ax2, ay2] = ik2(hx, hy, ax, ay, L.l[0], L.l[1], L.bend);
    const fx2 = ax2 + Math.cos(mt) * L.l[2], fy2 = ay2 - Math.sin(mt) * L.l[2];
    const w = L.w;
    const nrm = (ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1; let nx = -dy / l, ny = dx / l; if (nx < 0) { nx = -nx; ny = -ny; } return [nx, ny]; };
    const n1 = nrm(hx, hy, kx, ky), n2 = nrm(kx, ky, ax2, ay2), n3 = nrm(ax2, ay2, fx2, fy2), nk = [(n1[0] + n2[0]) / 2, (n1[1] + n2[1]) / 2], na = [(n2[0] + n3[0]) / 2, (n2[1] + n3[1]) / 2];
    const P = (p, n, k) => [p[0] + n[0] * k, p[1] + n[1] * k];
    const H0 = [hx, hy], K = [kx, ky], A = [ax2, ay2], M1 = [lerp(hx, kx, .45), lerp(hy, ky, .45)], M2 = [lerp(kx, ax2, .35), lerp(ky, ay2, .35)];
    let out;
    if (L.column) {
      out = [P(H0, n1, w[0]), P(M1, n1, w[0] * .92), P(K, nk, w[1] * 1.12), P(M2, n2, w[1] * .95), P(A, na, w[2] * 1.05),
        [fx2 + w[2] * 1.35 + L.toe * .25, fy2 + w[2] * .25], [fx2 + w[2] * 1.45 + L.toe * .3, fy2], [fx2 - w[2] * 1.3, fy2], [fx2 - w[2] * 1.2, fy2 + w[2] * .3],
        P(A, na, -w[2] * 1.05), P(M2, n2, -w[1] * 1.05), P(K, nk, -w[1] * 1.12), P(M1, n1, -w[0] * 1.0), P(H0, n1, -w[0])];
    } else {
      out = [P(H0, n1, w[0] * .9), P(M1, n1, w[0] * 1.0), P(K, nk, w[1] * 1.2), P(M2, n2, w[1] * .75), P(A, na, w[2] * 1.1),
        P([lerp(ax2, fx2, .7), lerp(ay2, fy2, .7)], n3, w[2] * .8), [fx2 + w[2] * .3, fy2 + w[2] * .9], [fx2 + L.toe, fy2 + .05], [fx2 + L.toe + .04, fy2 + .005],
        [fx2 - w[2] * 1.1, fy2], P([lerp(ax2, fx2, .5), lerp(ay2, fy2, .5)], n3, -w[2] * .9), P(A, na, -w[2] * 1.2), P(M2, n2, -w[1] * 1.25), P(K, nk, -w[1] * 1.3),
        P(M1, n1, -w[0] * 1.35), P(H0, n1, -w[0] * 1.2)];
    }
    const polys = [smooth(out, 2)];
    return { polys, claw: L.column ? null : [fx2 + L.toe, fy2 - .01] };
  };
  const hindFar = legPose(S.hind, phase + .5, S.hind.at), hindNear = legPose(S.hind, phase, S.hind.at);
  const foreFar = S.fore ? legPose(S.fore, phase + .5 + .25, S.fore.at) : null, foreNear = S.fore ? legPose(S.fore, phase + .25, S.fore.at) : null;
  // far side limbs
  for (const L of [hindFar, foreFar]) if (L) for (const p of L.polys) fillLimb(p, true);
  // arm (far)
  const armPose = (sg) => {
    const A = S.arm; if (!A) return null;
    const sw = Math.sin(t * 1.5 + sg * 2) * .06;
    const sx = A.at[0], sy = A.at[1] - bob, ex = sx + A.l[0] * .3, ey = sy - A.l[0] * .95, hx = ex + A.l[1] * .9, hy = ey + A.l[1] * .3 + sw;
    const u = [[sx - A.w[0] * 1.1, sy + A.w[0]], [sx + A.w[0] * 1.1, sy + A.w[0] * .6], [ex + A.w[1] * 1.2, ey + A.w[1] * .6], [hx, hy + A.w[1] * .6],
      [hx + A.hand * .9, hy - A.hand * .1], [hx + A.hand, hy - A.hand * .35], [hx + A.hand * .55, hy - A.w[1] * .7], [ex - A.w[1] * .6, ey - A.w[1] * 1.1], [sx - A.w[0] * 1.3, sy - A.w[0] * .5]];
    return [smooth(u, 2)];
  };
  const armF = armPose(1); if (armF) for (const p of armF) fillLimb(p, true);
  // plates (far row) behind the body
  const plateRow = (side) => {
    const out = []; const n = 17;
    for (let i = 0; i < n; i++) {
      const u = .28 + i / n * .62;  // along the resampled spine (tail → neck)
      const idx = Math.floor(u * (tb.top.length - 1)), p = tb.top[idx], q = tb.top[Math.min(tb.top.length - 1, idx + 1)];
      const hump = Math.sin(clamp((u - .25) / .65) * Math.PI);
      const h = (.18 + .72 * Math.pow(hump, 1.4)) * (side ? 1 : .92), w = .16 + .3 * hump;
      const off = side ? .1 : -.06;
      const px = p[0] + off, py = p[1] - .05;
      out.push([[px - w * .5, py], [px - w * .45, py + h * .65], [px, py + h], [px + w * .55, py + h * .55], [px + w * .55, py]]);
    }
    return out;
  };
  if (S.plates) for (const pl of plateRow(0)) airbrush(g, pl.map(([a, b]) => W(a, b)), { base: mix(col.plate, col.dark, .4), dark: col.dark, light: col.plate, dir: -2.2 });
  // body
  const bodyPoly = tb.poly.map(([a, b]) => W(a, b));
  let xs = bodyPoly.map(p => p[0]), ys = bodyPoly.map(p => p[1]);
  const bb = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  const bpath = toPath(bodyPoly, true);
  airbrush(g, bpath, { base: col.base, dark: col.dark, light: col.light, dir: -2.0, bbox: bb, rim: rim ? 2 : 0, rimColor: C.gold2 });
  // belly countershading + stripes, clipped
  g.save(); g.clip(bpath);
  const bel = g.createLinearGradient(0, bb[1], 0, bb[3]); bel.addColorStop(0, rgba(col.belly, 0)); bel.addColorStop(.62, rgba(col.belly, 0)); bel.addColorStop(1, rgba(col.belly, .55)); g.fillStyle = bel; g.fillRect(bb[0], bb[1], bb[2] - bb[0], bb[3] - bb[1]);
  if (S.stripes) {
    g.globalAlpha *= .35;
    for (let i = 4; i < tb.top.length - 18; i += 5) { const p = tb.top[i]; const a = W(p[0], p[1]), b = W(p[0] - .25, p[1] - .45 * (S.len / 9)); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineWidth = Math.max(1.5, .12 * s); g.strokeStyle = col.stripe; g.stroke(); }
  }
  g.restore();
  // dorsal details
  if (S.osteoderms) for (let i = 6; i < tb.top.length - 6; i += 2) { const p = tb.top[i]; const [a, b] = W(p[0], p[1]); g.beginPath(); g.arc(a, b, Math.max(1.2, .035 * s), 0, TAU); g.fillStyle = col.light; g.fill(); }
  if (S.feathers) { g.save(); g.globalAlpha *= .8; for (let i = 0; i < tb.top.length; i += 1) { const p = tb.top[i]; const [a, b] = W(p[0], p[1]); g.beginPath(); g.moveTo(a, b); g.lineTo(a - flip * .03 * s, b - .05 * s); g.lineWidth = Math.max(1, .012 * s); g.strokeStyle = col.light; g.stroke(); } g.restore(); }
  if (keyline) gline(g, bodyPoly, { w: Math.max(.8, Math.min(2.2, s * .02)), closed: true, alpha: .7 });
  if (S.plates) for (const pl of plateRow(1)) { const P = pl.map(([a, b]) => W(a, b)); airbrush(g, P, { base: col.plate, dark: mix(col.plate, col.dark, .6), light: mix(col.plate, '#ffffff', .3), dir: -2.2, rim: 1.2, rimColor: C.gold2 }); if (keyline) gline(g, P, { w: 1, closed: true, alpha: .6 }); }
  if (S.spikes) {  // thagomizer: two pairs visible, pointing up-back
    const tip = tb.top[6], tip2 = tb.top[10];
    for (const [p, a, L] of [[tip, 150, .85], [tip, 128, .75], [tip2, 140, .8], [tip2, 118, .7]]) {
      const ang = a * D2R, bx = p[0], by = p[1] - .02, ex = bx + Math.cos(ang) * L, ey = by + Math.sin(ang) * L;
      const nx = -Math.sin(ang) * .07, ny = Math.cos(ang) * .07;
      const P = [[bx + nx, by + ny], [ex, ey], [bx - nx, by - ny]].map(([u, v]) => W(u, v));
      airbrush(g, P, { base: '#d8c8a0', dark: '#6a5a40', light: '#fff4dc', dir: -2.2 }); if (keyline) gline(g, P, { w: 1, closed: true, alpha: .7 });
    }
  }
  // near limbs
  for (const L of [hindNear, foreNear]) if (L) { for (const p of L.polys) fillLimb(p, false); if (L.claw) { const [a, b] = W(L.claw[0], L.claw[1]); g.beginPath(); g.moveTo(a, b); g.lineTo(a + flip * .08 * s, b + .05 * s); g.lineWidth = Math.max(1, .03 * s); g.strokeStyle = C.ivoryD; g.stroke(); } }
  const armN = armPose(0); if (armN) for (const p of armN) fillLimb(p, false);
  // head
  const ne = Sm[Sm.length - 1], ne0 = Sm[Sm.length - 4];
  const hd = HEADS[S.head], L = S.headLen;
  const ang = (S.headAng + headTilt + neck * .6) * D2R;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const H = (u, v) => W(ne[0] + (u * ca - v * sa) * L, ne[1] + (u * sa + v * ca) * L);
  const ja = -jaw * 28 * D2R, [hx0, hy0] = hd.hinge;
  const J = (u, v) => { const du = u - hx0, dv = v - hy0; return H(hx0 + du * Math.cos(ja) - dv * Math.sin(ja), hy0 + du * Math.sin(ja) + dv * Math.cos(ja)); };
  const jawP = hd.jaw.map(([u, v]) => J(u, v));
  if (jaw > .02) {   // mouth interior + teeth
    const mouth = [...hd.up.map(([u, v]) => H(u, v)), ...hd.jaw.slice(0, 2).reverse().map(([u, v]) => J(u, v))];
    g.beginPath(); mouth.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = '#3a1210'; g.fill();
    if (!hd.beak) for (let i = 0; i < 9; i++) { const u = .12 + i * .095; const a = H(u, -.1), b = H(u + .03, -.1 - .07), c = H(u + .06, -.1); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.fillStyle = C.ivory; g.fill(); }
    if (!hd.beak) for (let i = 0; i < 8; i++) { const u = .16 + i * .095; const a = J(u, -.09), b = J(u + .03, -.09 + .06), c = J(u + .06, -.09); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.fillStyle = C.ivoryD; g.fill(); }
  }
  airbrush(g, jawP, { base: mix(col.base, col.belly, .3), dark: col.dark, light: col.light, dir: -2.2 });
  const skull = [...hd.top, ...hd.up].map(([u, v]) => H(u, v));
  airbrush(g, skull, { base: col.base, dark: col.dark, light: col.light, dir: -2.0, rim: rim ? 1.5 : 0, rimColor: C.gold2 });
  if (hd.horns) for (const hn of hd.horns) { const P = [H(hn[0], hn[1]), H(hn[2], hn[3]), H(hn[4], hn[5])]; airbrush(g, P, { base: mix(col.light, '#d8a060', .3), dark: col.base, light: '#f0d8a8', dir: -2.2 }); }
  if (hd.fen) { const [u, v, rx, ry] = hd.fen; const P = ell(u, v, rx, ry, 12).map(([a, b]) => H(a, b)); g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = rgba(col.dark, .55); g.fill(); }
  if (hd.nares) { const [a, b] = H(hd.nares[0], hd.nares[1]); g.beginPath(); g.ellipse(a, b, Math.max(1, .05 * L * s), Math.max(.8, .025 * L * s), -ang * flip, 0, TAU); g.fillStyle = col.dark; g.fill(); }
  { const [a, b] = H(hd.eye[0], hd.eye[1]); const r = Math.max(1.2, .032 * L * s * (S.head === 'orni' ? 2.2 : 1.6)); g.beginPath(); g.arc(a, b, r * 1.6, 0, TAU); g.fillStyle = rgba(col.dark, .7); g.fill(); g.beginPath(); g.arc(a, b, r, 0, TAU); g.fillStyle = '#d8a43a'; g.fill(); g.beginPath(); g.arc(a, b, r * .45, 0, TAU); g.fillStyle = '#0a0604'; g.fill(); g.beginPath(); g.arc(a - r * .3, b - r * .3, r * .25, 0, TAU); g.fillStyle = '#fff'; g.fill(); }
  // mouth line
  if (keyline) { gline(g, skull, { w: Math.max(.7, Math.min(1.6, s * .015)), closed: true, alpha: .6 }); gline(g, jawP, { w: Math.max(.6, Math.min(1.4, s * .012)), closed: true, alpha: .5 }); }
  g.restore();
  return { head: H(.9, 0), eye: H(hd.eye[0], hd.eye[1]), tailTip: W(sp0[0][0], sp0[0][1]), bbox: bb };
}

// stride length per cycle (metres) → phase advance per metre walked
export const stride = sp => (typeof sp === 'string' ? SPECIES[sp] : sp).hind.stride * 2;

// Gold-line skeleton (for Big Al and the bone beds): same spine, drawn as vertebrae + ribs + limb bones.
export function skeleton(g, sp, o = {}) {
  const S = typeof sp === 'string' ? SPECIES[sp] : sp;
  const { x = 960, y = 900, s = 60, flip = 1, part = 1, w = 1.6, alpha = 1, color = null } = o;
  const W = (mx, my) => [x + flip * mx * s, y - my * s];
  const Sm = resample(S.spine, 6);
  const n = Math.floor(Sm.length * part);
  g.save(); g.globalAlpha *= alpha;
  const bones = [];
  for (let i = 0; i < n; i += 2) {   // vertebrae: centrum + neural spine
    const p = Sm[i], h = p[2] * .8, d = p[3] * .25;
    bones.push([[p[0], p[1] - d * .3], [p[0], p[1] + h]]);
    bones.push([[p[0] - .05, p[1]], [p[0] + .05, p[1]]]);
  }
  const hipI = Sm.findIndex(p => p[0] >= 0);
  for (let i = hipI + 2; i < Math.min(n, hipI + 22); i += 2) { const p = Sm[i]; bones.push([[p[0], p[1]], [p[0] - .15, p[1] - p[3] * .85]]); }   // ribs
  bones.push([[Sm[0][0], Sm[0][1]], ...Sm.slice(0, n).map(p => [p[0], p[1]])]);
  const L = S.hind, hx = L.at[0], hy = L.at[1], mt = L.mt * D2R;
  const ax = hx - Math.cos(mt) * L.l[2], ay = Math.sin(mt) * L.l[2];
  const [kx, ky, ax2, ay2] = ik2(hx, hy, ax, ay, L.l[0], L.l[1], L.bend);
  bones.push([[hx, hy], [kx, ky]], [[kx, ky], [ax2, ay2]], [[ax2, ay2], [ax2 + Math.cos(mt) * L.l[2], ay2 - Math.sin(mt) * L.l[2]]], [[ax2 + Math.cos(mt) * L.l[2], 0], [ax2 + Math.cos(mt) * L.l[2] + L.toe, 0]]);
  bones.push([[hx - .4, hy + .2], [hx + .5, hy + .25]], [[hx + .1, hy], [hx + .45, hy - .6]]);   // ilium + pubis
  for (const b of bones) gline(g, b.map(([a, c]) => W(a, c)), { w, color, alpha: .95 });
  if (part >= 1) {  // skull outline
    const ne = Sm[Sm.length - 1], ne0 = Sm[Sm.length - 4], hd = HEADS[S.head], Lh = S.headLen;
    const ang = Math.atan2(ne[1] - ne0[1], ne[0] - ne0[0]) + S.headAng * D2R, ca = Math.cos(ang), sa = Math.sin(ang);
    const H = (u, v) => W(ne[0] + (u * ca - v * sa) * Lh, ne[1] + (u * sa + v * ca) * Lh);
    gline(g, [...hd.top, ...hd.up, hd.top[0]].map(([u, v]) => H(u, v)), { w: w * 1.2, color });
    gline(g, [...hd.jaw, hd.jaw[0]].map(([u, v]) => H(u, v)), { w, color });
    if (hd.fen) gline(g, ell(hd.fen[0], hd.fen[1], hd.fen[2], hd.fen[3], 14).concat([[hd.fen[0] + hd.fen[2], hd.fen[1]]]).map(([u, v]) => H(u, v)), { w: w * .8, color });
    const [ex, ey] = H(hd.eye[0], hd.eye[1]); gline(g, ell(ex, ey, Lh * .07 * s, Lh * .07 * s, 14).concat([[ex + Lh * .07 * s, ey]]), { w: w * .8, color });
  }
  g.restore();
  return { W, Sm, knee: W(kx, ky), ankle: W(ax2, ay2), foot: W(ax2 + Math.cos(mt) * L.l[2], 0) };
}
