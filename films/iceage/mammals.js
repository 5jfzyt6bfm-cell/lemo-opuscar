// Ice Age mammals, side profile, built from real proportions in metres (ground y = 0, shoulder region at +x, tail at −x).
// Body = tube along a spine with dorsal/ventral thickness; jointed legs with a walk cycle; a head with a hinged jaw and a face:
// eye (look, blink, squint), ear (pricked/back), nose, lip snarl, teeth, sabres. Deco rendering: airbrush + gold rim + fine keyline.
import { C, TAU, clamp, lerp, mix, rgba, gline, airbrush, toPath, glow, hash } from './engine/deco.js';

const D2R = Math.PI / 180;
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
function tube(S) {
  const top = [], bot = [];
  for (let i = 0; i < S.length; i++) {
    const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
    top.push([S[i][0] - dy * S[i][2], S[i][1] + dx * S[i][2]]); bot.push([S[i][0] + dy * S[i][3], S[i][1] - dx * S[i][3]]);
  }
  return { top, bot, poly: [...top, ...bot.slice().reverse()] };
}
export function smooth(P, it = 2) { let Q = P; for (let k = 0; k < it; k++) { const R = []; for (let i = 0; i < Q.length; i++) { const a = Q[i], b = Q[(i + 1) % Q.length]; R.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]); } Q = R; } return Q; }
function ik2(hx, hy, ax, ay, l1, l2, bend) {
  let dx = ax - hx, dy = ay - hy; let d = Math.hypot(dx, dy); const dm = l1 + l2 - 1e-4;
  if (d > dm) { dx *= dm / d; dy *= dm / d; d = dm; }
  const a = Math.atan2(dy, dx), c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), k = a + bend * Math.acos(c);
  return [hx + Math.cos(k) * l1, hy + Math.sin(k) * l1, hx + dx, hy + dy];
}
function gaitFoot(u, L, lift) { u = ((u % 1) + 1) % 1; if (u < .62) return [L / 2 - L * (u / .62), 0]; const v = (u - .62) / .38, e = v * v * (3 - 2 * v); return [-L / 2 + L * e, lift * Math.sin(Math.PI * v)]; }

// head profiles (local: occiput at 0, +x forward, unit = head length). top/up = skull outline, jaw = lower jaw, eye, ear [base, tip, back], nose, sab = sabre
const HEADS = {
  wolf:  { top: [[-.05, .12], [.1, .3], [.3, .34], [.48, .26], [.62, .18], [.9, .14], [1.0, .1], [1.02, .02]], up: [[.98, -.04], [.7, -.06], [.4, -.1], [.15, -.2], [0, -.15]],
           jaw: [[.25, -.1], [.95, -.06], [.9, -.12], [.55, -.18], [.3, -.22]], hinge: [.28, -.12], eye: [.45, .17], ear: [[.12, .3], [.18, .62], [.3, .32]], nose: [1.0, .07], lip: [.6, .97] },
  hyena: { top: [[-.05, .14], [.08, .34], [.28, .4], [.46, .3], [.62, .2], [.88, .15], [.98, .1], [1.0, .02]], up: [[.97, -.05], [.7, -.08], [.4, -.12], [.15, -.24], [0, -.18]],
           jaw: [[.25, -.12], [.94, -.07], [.9, -.15], [.55, -.22], [.3, -.28]], hinge: [.28, -.14], eye: [.44, .2], ear: [[.12, .34], [.16, .6], [.32, .34]], round: true, nose: [.98, .08], lip: [.6, .96] },
  cat:   { top: [[-.05, .16], [.1, .36], [.3, .42], [.5, .36], [.66, .26], [.86, .2], [.96, .12], [.98, .02]], up: [[.96, -.06], [.75, -.1], [.5, -.12], [.2, -.22], [0, -.18]],
           jaw: [[.28, -.12], [.9, -.1], [.86, -.17], [.55, -.24], [.32, -.28]], hinge: [.3, -.14], eye: [.55, .24], ear: [[.14, .36], [.2, .54], [.32, .38]], round: true, nose: [.95, .1], lip: [.62, .94], whiskers: true },
  bear:  { top: [[-.05, .2], [.1, .42], [.3, .48], [.5, .44], [.66, .34], [.82, .24], [.92, .16], [.95, .04]], up: [[.93, -.06], [.75, -.1], [.5, -.14], [.2, -.26], [0, -.2]],
           jaw: [[.28, -.14], [.88, -.1], [.84, -.18], [.55, -.26], [.32, -.3]], hinge: [.3, -.16], eye: [.56, .26], ear: [[.14, .42], [.18, .58], [.3, .44]], round: true, nose: [.93, .1], lip: [.62, .92] },
  mammoth: { top: [[-.1, .3], [.1, .7], [.35, .8], [.55, .55], [.7, .25], [.8, .0]], up: [[.75, -.3], [.6, -.4], [.3, -.35], [0, -.3]], jaw: [[.3, -.3], [.6, -.35], [.55, -.42], [.35, -.42]], hinge: [.3, -.32], eye: [.48, .22], trunk: true },
  bison: { top: [[-.05, .3], [.1, .45], [.4, .42], [.7, .25], [.95, .1], [1.0, -.02]], up: [[.98, -.1], [.7, -.16], [.4, -.24], [0, -.24]], jaw: [[.3, -.2], [.95, -.12], [.9, -.2], [.4, -.3]], hinge: [.3, -.2], eye: [.42, .2], horn: true, nose: [.98, .0] },
  horse: { top: [[-.05, .2], [.15, .34], [.35, .32], [.7, .18], [.95, .08], [1.0, -.04]], up: [[.98, -.12], [.7, -.16], [.4, -.2], [0, -.2]], jaw: [[.3, -.16], [.95, -.14], [.92, -.22], [.4, -.26]], hinge: [.3, -.16], eye: [.3, .2], ear: [[.05, .3], [.1, .52], [.16, .32]], nose: [.97, .0] },
  deer:  { top: [[-.05, .2], [.15, .32], [.35, .3], [.7, .16], [.95, .06], [1.0, -.04]], up: [[.98, -.12], [.7, -.14], [.4, -.18], [0, -.2]], jaw: [[.3, -.14], [.95, -.12], [.92, -.2], [.4, -.24]], hinge: [.3, -.14], eye: [.35, .18], ear: [[.05, .3], [.0, .5], [.14, .3]], antler: true, nose: [.97, .0] },
};

// species in metres
export const SP = {
  direwolf: { name: 'Dire wolf', len: 2.0, head: 'wolf', headLen: 0.42, headAng: -12, colors: { base: '#8a7a68', dark: '#2a2420', light: '#d8c8b0', belly: '#e8dcc8' }, saddle: '#4a3e34',
    spine: [[-.95, .62, .06, .06], [-.75, .7, .08, .08], [-.55, .74, .1, .12], [-.38, .78, .14, .2], [-.2, .8, .17, .24], [.1, .8, .18, .26], [.4, .8, .19, .3], [.62, .82, .2, .28], [.8, .9, .17, .2], [.92, 1.0, .13, .14]],
    neckFrom: 8, hind: { at: [-.25, .72], l: [.29, .28, .18], toe: .1, w: [.12, .06, .035], stride: .8, lift: .12, bend: 1, mt: 72 }, fore: { at: [.55, .68], l: [.32, .28, .09], toe: .08, w: [.09, .05, .035], stride: .8, lift: .12, bend: -1, mt: 85 }, ruff: true },
  hyena: { name: 'Cave hyena', len: 1.9, head: 'hyena', headLen: 0.44, headAng: -16, colors: { base: '#a08a60', dark: '#3a2c1c', light: '#e0caa0', belly: '#e8d8b8' }, spots: '#4a3a24',
    spine: [[-.75, .55, .04, .05], [-.62, .58, .07, .08], [-.48, .64, .12, .2], [-.3, .7, .16, .24], [-.05, .78, .18, .3], [.25, .86, .2, .34], [.5, .92, .22, .34], [.68, .98, .2, .26], [.84, 1.02, .16, .17], [.94, 1.04, .13, .13]],
    neckFrom: 8, hind: { at: [-.32, .6], l: [.26, .26, .17], toe: .1, w: [.12, .06, .035], stride: .8, lift: .12, bend: 1, mt: 72 }, fore: { at: [.5, .78], l: [.38, .33, .1], toe: .09, w: [.1, .06, .04], stride: .8, lift: .12, bend: -1, mt: 85 }, mane: true },
  smilodon: { name: 'Smilodon', len: 2.1, head: 'cat', headLen: 0.48, headAng: -6, colors: { base: '#b08a5a', dark: '#3a2814', light: '#ecd0a0', belly: '#f0e0c0' }, spotsFaint: '#7a5a34',
    spine: [[-.95, .72, .05, .05], [-.82, .78, .08, .08], [-.65, .82, .17, .24], [-.35, .88, .2, .3], [0, .9, .22, .34], [.35, .92, .25, .38], [.62, .96, .25, .36], [.82, 1.02, .22, .26], [.98, 1.08, .18, .19], [1.08, 1.1, .15, .15]],
    neckFrom: 8, hind: { at: [-.55, .78], l: [.33, .31, .19], toe: .12, w: [.16, .08, .05], stride: .9, lift: .12, bend: 1, mt: 70 }, fore: { at: [.55, .76], l: [.36, .31, .11], toe: .13, w: [.15, .1, .07], stride: .9, lift: .14, bend: -1, mt: 82 }, sabre: 1.0, bobtail: true },
  homotherium: { name: 'Homotherium', len: 2.4, head: 'cat', headLen: 0.46, headAng: -14, colors: { base: '#9a7a56', dark: '#2e2016', light: '#dcc09a', belly: '#ecdcc0' },
    spine: [[-1.25, .55, .03, .03], [-1.1, .6, .05, .05], [-.95, .66, .08, .08], [-.75, .7, .16, .22], [-.4, .82, .2, .28], [0, .96, .22, .32], [.35, 1.06, .24, .36], [.6, 1.12, .24, .34], [.8, 1.18, .2, .24], [.95, 1.22, .16, .17], [1.05, 1.24, .14, .14]],
    neckFrom: 9, hind: { at: [-.65, .68], l: [.28, .27, .17], toe: .11, w: [.14, .07, .045], stride: .9, lift: .12, bend: 1, mt: 72 }, fore: { at: [.55, .9], l: [.42, .38, .12], toe: .12, w: [.13, .08, .05], stride: .9, lift: .14, bend: -1, mt: 84 }, sabre: .55, scimitar: true },
  cavelion: { name: 'Cave lion', len: 3.3, head: 'cat', headLen: 0.55, headAng: -8, colors: { base: '#c0a070', dark: '#4a3420', light: '#f0dab0', belly: '#f4e6cc' }, stripes: '#9a7a4e', tuft: true,
    spine: [[-1.7, .32, .035, .035], [-1.62, .42, .035, .035], [-1.48, .58, .04, .04], [-1.28, .76, .05, .05], [-1.05, .92, .07, .07], [-.85, .98, .18, .24], [-.45, 1.04, .22, .32], [0, 1.06, .24, .36], [.45, 1.08, .26, .4], [.75, 1.12, .26, .36], [.98, 1.2, .22, .26], [1.15, 1.26, .18, .18], [1.25, 1.28, .16, .16]],
    neckFrom: 9, hind: { at: [-.7, .9], l: [.38, .36, .22], toe: .14, w: [.17, .09, .05], stride: 1.1, lift: .14, bend: 1, mt: 70 }, fore: { at: [.7, .86], l: [.4, .36, .12], toe: .15, w: [.15, .1, .065], stride: 1.1, lift: .15, bend: -1, mt: 84 } },
  bear: { name: 'Short-faced bear', len: 3.0, head: 'bear', headLen: 0.62, headAng: -6, colors: { base: '#5a3e2a', dark: '#1a100a', light: '#a8805a', belly: '#8a6a4a' },
    spine: [[-1.15, 1.2, .1, .14], [-1.0, 1.32, .26, .36], [-.6, 1.42, .34, .5], [-.1, 1.48, .38, .56], [.4, 1.56, .4, .56], [.75, 1.6, .38, .5], [1.0, 1.62, .3, .34], [1.18, 1.62, .24, .24], [1.3, 1.62, .2, .2]],
    neckFrom: 7, hind: { at: [-.65, 1.05], l: [.56, .48, .06], toe: .26, w: [.26, .17, .13], stride: 1.2, lift: .18, bend: 1, mt: 10, planti: true }, fore: { at: [.65, 1.1], l: [.6, .5, .06], toe: .22, w: [.22, .16, .13], stride: 1.2, lift: .2, bend: -1, mt: 80 }, shaggy: true },
  mammoth: { name: 'Woolly mammoth', len: 5.6, head: 'mammoth', headLen: 1.7, headAng: -62, colors: { base: '#6a4a30', dark: '#20140a', light: '#b08a60', belly: '#8a6a4a' },
    spine: [[-2.1, 2.0, .04, .04], [-1.9, 2.1, .1, .1], [-1.7, 2.3, .5, .6], [-1.0, 2.7, .7, 1.0], [-.2, 3.0, .8, 1.15], [.6, 3.2, .9, 1.2], [1.2, 3.1, .8, 1.0], [1.5, 3.0, .6, .7]],
    neckFrom: 7, hind: { at: [-1.2, 2.2], l: [1.0, .9, .1], toe: .3, w: [.4, .32, .3], stride: 1.4, lift: .2, bend: -1, mt: 88, column: true }, fore: { at: [.9, 2.3], l: [1.1, 1.0, .1], toe: .3, w: [.42, .32, .3], stride: 1.4, lift: .2, bend: 1, mt: 88, column: true }, shaggy: true, tusks: true },
  bison: { name: 'Steppe bison', len: 3.2, head: 'bison', headLen: 0.75, headAng: -50, colors: { base: '#5a3a22', dark: '#1a0e06', light: '#9a6a40', belly: '#7a5a3a' },
    spine: [[-1.4, 1.2, .04, .04], [-1.25, 1.3, .2, .3], [-.8, 1.4, .3, .45], [-.2, 1.6, .4, .55], [.4, 1.85, .5, .7], [.8, 1.8, .45, .7], [1.1, 1.5, .35, .5], [1.25, 1.3, .3, .35]],
    neckFrom: 6, hind: { at: [-.85, 1.1], l: [.5, .45, .2], toe: .1, w: [.2, .1, .06], stride: 1, lift: .14, bend: 1, mt: 78 }, fore: { at: [.75, 1.15], l: [.55, .45, .2], toe: .1, w: [.18, .1, .06], stride: 1, lift: .14, bend: -1, mt: 85 }, shaggy: true },
  horse: { name: 'Wild horse', len: 2.6, head: 'horse', headLen: 0.68, headAng: -45, colors: { base: '#9a6a3a', dark: '#2a1a0a', light: '#d8a870', belly: '#e0c8a0' },
    spine: [[-1.15, .9, .05, .05], [-1.0, 1.1, .1, .14], [-.85, 1.25, .26, .34], [-.3, 1.3, .3, .4], [.3, 1.3, .3, .42], [.65, 1.4, .26, .3], [.9, 1.65, .18, .2], [1.05, 1.85, .14, .14]],
    neckFrom: 6, hind: { at: [-.7, 1.05], l: [.45, .45, .3], toe: .08, w: [.16, .07, .04], stride: 1.1, lift: .14, bend: 1, mt: 80 }, fore: { at: [.5, 1.0], l: [.4, .4, .25], toe: .08, w: [.13, .06, .04], stride: 1.1, lift: .14, bend: -1, mt: 88 }, mane: true },
  reindeer: { name: 'Reindeer', len: 2.0, head: 'deer', headLen: 0.52, headAng: -40, colors: { base: '#8a7a64', dark: '#2a2218', light: '#d8ccb4', belly: '#ece4d4' },
    spine: [[-.85, .95, .05, .06], [-.75, 1.0, .18, .24], [-.3, 1.05, .2, .3], [.25, 1.05, .2, .32], [.55, 1.12, .18, .24], [.72, 1.3, .12, .14], [.8, 1.42, .1, .1]],
    neckFrom: 5, hind: { at: [-.5, .85], l: [.34, .36, .22], toe: .07, w: [.11, .05, .03], stride: .9, lift: .12, bend: 1, mt: 80 }, fore: { at: [.38, .82], l: [.32, .34, .18], toe: .07, w: [.09, .045, .03], stride: .9, lift: .12, bend: -1, mt: 88 } },
};

// face state helpers
// o: x,y = ground under body centre (screen), s = px per metre, flip, phase, walk (0..1), t, jaw 0..1, snarl 0..1, look (-1..1 eye shift), blink 0..1, ears (0 pricked .. 1 flattened), neck (deg), tail (amp), alpha, tint [col, k], stand 0..1 (bear rearing)
export function mammal(g, sp, o = {}) {
  const S = typeof sp === 'string' ? SP[sp] : sp;
  const { x = 960, y = 900, s = 200, flip = 1, phase = 0, walk = 0, t = 0, jaw = 0, snarl = 0, blink = 0, ears = 0, neck = 0, tail = 1, alpha = 1, tint = null, keyline = true, rim = true, stand = 0, eyeGlow = 0 } = o;
  const col = { ...S.colors };
  if (tint) for (const k of Object.keys(col)) col[k] = mix(col[k], tint[0], tint[1]);
  const W = (mx, my) => { // rearing: rotate the whole body about the hind feet
    if (stand > 0 && !W.noRot) { const a = stand * 64 * D2R, px = S.hind.at[0], py = S.hind.at[1], c = Math.cos(a), si = Math.sin(a); const dx = mx - px, dy = my - py; mx = px + dx * c - dy * si; my = py + dx * si + dy * c; }
    return [x + flip * mx * s, y - my * s];
  };
  const bob = walk * Math.abs(Math.sin(phase * TAU * 2)) * .012 * S.len;
  const sp0 = S.spine.map(p => p.slice());
  const nf = S.neckFrom, base = sp0[nf - 1];
  for (let i = nf; i < sp0.length; i++) { const k = (i - nf + 1) / (sp0.length - nf), a = neck * D2R * k, dx = sp0[i][0] - base[0], dy = sp0[i][1] - base[1]; sp0[i][0] = base[0] + dx * Math.cos(a) - dy * Math.sin(a); sp0[i][1] = base[1] + dx * Math.sin(a) + dy * Math.cos(a); }
  const tailN = S.spine.findIndex(p => p[2] > .14) || 2;
  for (let i = 0; i < tailN; i++) { const k = 1 - i / tailN; sp0[i][1] += Math.sin(t * 2 + i * .8) * .05 * k * tail * (S.len / 2.5); }
  for (const p of sp0) p[1] -= bob;
  const breath = 1 + Math.sin(t * 2.2) * .015;
  for (const p of sp0) { p[2] *= breath; p[3] *= breath; }
  const Sm = resample(sp0, 6), tb = tube(Sm);
  g.save(); g.globalAlpha *= alpha;
  const legPose = (L, ph) => {
    const [fx, fl] = gaitFoot(ph, L.stride * walk, L.lift * walk);
    const hx = L.at[0], hy = L.at[1] - bob, mt = L.mt * D2R;
    const ax = hx + fx - Math.cos(mt) * L.l[2], ay = fl + Math.sin(mt) * L.l[2] + (L.planti ? .05 : 0);
    const [kx, ky, ax2, ay2] = ik2(hx, hy, ax, ay, L.l[0], L.l[1], L.bend);
    const fx2 = ax2 + Math.cos(mt) * L.l[2], fy2 = ay2 - Math.sin(mt) * L.l[2];
    const w = L.w, n = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; let nx = -dy / l, ny = dx / l; if (nx < 0) { nx = -nx; ny = -ny; } return [nx, ny]; };
    const n1 = n([hx, hy], [kx, ky]), n2 = n([kx, ky], [ax2, ay2]), n3 = n([ax2, ay2], [fx2, fy2]);
    const P = (p, nn, k) => [p[0] + nn[0] * k, p[1] + nn[1] * k];
    const H0 = [hx, hy], K = [kx, ky], A = [ax2, ay2];
    const out = [P(H0, n1, w[0] * 1.1), P(K, n1, w[1] * 1.15), P(A, n2, w[2] * 1.1), P([fx2, fy2], n3, w[2]),
      [fx2 + L.toe, fy2 + w[2] * .8], [fx2 + L.toe + w[2] * .3, fy2 + .005], [fx2 - w[2] * .6, fy2], P(A, n2, -w[2] * 1.1), P(K, n2, -w[1] * 1.15), P(H0, n1, -w[0] * 1.2)];
    return { poly: smooth(out, 2), paw: [fx2 + L.toe * .6, fy2] };
  };
  function hang(L, sw) {   // a raised forelimb (rearing): shoulder → elbow → paw reaching forward
    const hx = L.at[0], hy = L.at[1], kx = hx + .25 + sw, ky = hy - .35, ax = kx + .35, ay = ky + .1, w = L.w;
    return { poly: smooth([[hx - w[0], hy], [hx + w[0], hy + .05], [kx + w[1], ky + .05], [ax + .12, ay + .08], [ax + .15, ay - .05], [kx - w[1], ky - .08]], 2) };
  }
  const fill = (poly, far) => { const P = poly.map(([a, b]) => W(a, b)); airbrush(g, P, { base: far ? mix(col.base, col.dark, .45) : col.base, dark: col.dark, light: far ? col.base : col.light, dir: -2.2 }); if (!far && keyline) gline(g, P, { w: Math.max(.6, Math.min(1.5, s * .006)), closed: true, alpha: .35 }); };
  const hF = legPose(S.hind, phase + .5), hN = legPose(S.hind, phase);
  const fF = stand > .3 ? hang(S.fore, -.1) : legPose(S.fore, phase + .75), fN = stand > .3 ? hang(S.fore, .12) : legPose(S.fore, phase + .25);
  W.noRot = true; fill(hF.poly, true); W.noRot = false; fill(fF.poly, true);
  // body
  const bodyPoly = tb.poly.map(([a, b]) => W(a, b));
  const xs = bodyPoly.map(p => p[0]), ys = bodyPoly.map(p => p[1]), bb = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  const bpath = toPath(bodyPoly, true);
  airbrush(g, bpath, { base: col.base, dark: col.dark, light: col.light, dir: -2.0, bbox: bb, rim: rim ? 2 : 0, rimColor: C.gold2 });
  g.save(); g.clip(bpath);
  const bel = g.createLinearGradient(0, bb[1], 0, bb[3]); bel.addColorStop(0, rgba(col.belly, 0)); bel.addColorStop(.6, rgba(col.belly, 0)); bel.addColorStop(1, rgba(col.belly, .5)); g.fillStyle = bel; g.fillRect(bb[0], bb[1], bb[2] - bb[0], bb[3] - bb[1]);
  if (S.saddle) { g.globalAlpha *= .5; const P = tb.top.slice(10, tb.top.length - 10).map(([a, b]) => W(a, b - .05)); const Q = tb.top.slice(10, tb.top.length - 10).reverse().map(([a, b]) => W(a, b - .16)); g.beginPath(); [...P, ...Q].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.fillStyle = S.saddle; g.fill(); g.globalAlpha /= .5; }
  if (S.spots || S.spotsFaint) { const c = S.spots || S.spotsFaint; for (let i = 0; i < 46; i++) { const u = .2 + hash(i * 1.3) * .75, v = hash(i * 7.1); const idx = Math.floor(u * (tb.top.length - 1)); const a = tb.top[idx], b = tb.bot[idx]; const [px, py] = W(lerp(a[0], b[0], .15 + v * .6), lerp(a[1], b[1], .15 + v * .6)); g.beginPath(); g.ellipse(px, py, s * .03, s * .022, 0, 0, TAU); g.fillStyle = rgba(c, S.spots ? .7 : .3); g.fill(); } }
  if (S.stripes) { g.globalAlpha *= .25; for (let i = 14; i < tb.top.length - 16; i += 5) { const p = tb.top[i]; const a = W(p[0], p[1]), b = W(p[0] - .06, p[1] - .3); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineWidth = s * .04; g.strokeStyle = S.stripes; g.stroke(); } g.globalAlpha /= .25; }
  g.restore();
  // fur tufts along back and belly (cold-adapted coats)
  const furN = S.shaggy ? 3 : S.ruff || S.mane ? 2 : 1;
  for (let i = 4; i < tb.bot.length - 3; i += 3) { const [a, b] = tb.bot[i]; const [px, py] = W(a, b); for (let k = 0; k < furN; k++) { g.beginPath(); g.moveTo(px + k * 2, py - 1); g.lineTo(px + flip * (k - 1) * s * .015, py + s * .03 * (S.shaggy ? 2 : 1)); g.lineWidth = Math.max(1, s * .006); g.strokeStyle = col.base; g.stroke(); } }
  if (S.mane || S.ruff) for (let i = tb.top.length - 18; i < tb.top.length - 2; i += 1) { const [a, b] = tb.top[i]; const [px, py] = W(a, b); g.beginPath(); g.moveTo(px, py + 2); g.lineTo(px - flip * s * .02, py - s * .04); g.lineWidth = Math.max(1, s * .008); g.strokeStyle = S.mane ? col.dark : col.light; g.stroke(); }
  if (keyline) gline(g, bodyPoly, { w: Math.max(.8, Math.min(2, s * .008)), closed: true, alpha: .55 });
  if (S.tuft) { const tp = tb.top[0]; const [px, py] = W(tp[0], tp[1]); g.beginPath(); g.ellipse(px, py, s * .05, s * .08, 0, 0, TAU); g.fillStyle = col.dark; g.fill(); }
  W.noRot = true; fill(hN.poly, false); W.noRot = false; fill(fN.poly, false);
  // head
  const ne = Sm[Sm.length - 1], hd = HEADS[S.head], L = S.headLen;
  const ang = (S.headAng + neck * .5 - stand * 50) * D2R, ca = Math.cos(ang), sa = Math.sin(ang);
  const H = (u, v) => W(ne[0] - .12 * L + (u * ca - v * sa) * L, ne[1] + (u * sa + v * ca) * L);
  const ja = -jaw * 32 * D2R, [jx, jy] = hd.hinge;
  const J = (u, v) => { const du = u - jx, dv = v - jy; return H(jx + du * Math.cos(ja) - dv * Math.sin(ja), jy + du * Math.sin(ja) + dv * Math.cos(ja)); };
  if (hd.ear) { const e = hd.ear.map(([u, v], i) => i === 1 ? [u - ears * .2, v - ears * .22] : [u, v]); const P = e.map(([u, v]) => H(u, v)); airbrush(g, P, { base: mix(col.base, col.dark, .3), dark: col.dark, light: col.light }); }
  if (jaw > .02) {   // mouth interior
    const M = [...hd.up.slice(0, 3).map(([u, v]) => H(u, v)), J(hd.jaw[0][0], hd.jaw[0][1]), J(hd.jaw[1][0], hd.jaw[1][1])];
    g.beginPath(); M.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = '#5a1a18'; g.fill();
  }
  const jawP = hd.jaw.map(([u, v]) => J(u, v));
  airbrush(g, jawP, { base: mix(col.base, col.belly, .4), dark: col.dark, light: col.light, dir: -2.2 });
  // teeth (snarl lifts the lip to show them)
  const teeth = Math.max(snarl, jaw);
  if (teeth > .05 && !hd.trunk && !hd.horn && !hd.antler && S.head !== 'horse') {
    for (let i = 0; i < 4; i++) { const u = hd.lip[1] - i * .1; const a = H(u, -.05), b = H(u - .02, -.05 - .06 * teeth), c = H(u - .05, -.05); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.fillStyle = C.ivory; g.fill(); }
    const a = H(hd.lip[1] - .05, -.05), b = H(hd.lip[1] - .07, -.05 - .14 * teeth), c = H(hd.lip[1] - .12, -.05); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.fillStyle = '#fff8e8'; g.fill();
  }
  const skull = [...hd.top, ...hd.up].map(([u, v]) => H(u, v));
  airbrush(g, skull, { base: col.base, dark: col.dark, light: col.light, dir: -2.0, rim: rim ? 1.5 : 0, rimColor: C.gold2 });
  if (S.sabre) {   // upper canines below the jaw line
    const len = S.sabre * (S.scimitar ? .55 : .75), u0 = .62;
    const P = S.scimitar ? [H(u0, -.06), H(u0 - .02, -.06 - len * .9), H(u0 - .1, -.06)] : [H(u0 + .02, -.06), H(u0 - .04, -.06 - len * .55), H(u0 - .12, -.06 - len), H(u0 - .1, -.06 - len * .5), H(u0 - .1, -.06)];
    airbrush(g, P, { base: '#f4ead4', dark: '#a89a7a', light: '#ffffff', dir: -2.2 }); gline(g, [...P, P[0]], { w: Math.max(.6, s * .004), alpha: .6 });
  }
  if (hd.trunk) { const P = []; for (let i = 0; i <= 12; i++) { const u = i / 12, sw = Math.sin(t * 1.2 + u * 2) * .1 * u; P.push([.75 + u * .2 + sw, -.25 - u * 1.2]); } const Q = P.map(([u, v], i) => [u - .2 + i / 12 * .12, v]).reverse(); airbrush(g, [...P, ...Q].map(([u, v]) => H(u, v)), { base: col.base, dark: col.dark, light: col.light }); }
  if (S.tusks) { const P = []; for (let i = 0; i <= 14; i++) { const u = i / 14, a = -1.2 + u * 3.2; P.push([.65 + Math.cos(a) * .55 + .2, -.45 + Math.sin(a) * .5]); } gline(g, P.map(([u, v]) => H(u, v)), { w: s * .06 * L, color: '#f4ead4' }); gline(g, P.map(([u, v]) => H(u, v)), { w: Math.max(1, s * .01), alpha: .5 }); }
  if (hd.horn) { const P = [[.3, .4], [.15, .65], [.1, .9], [.2, .85], [.3, .6], [.45, .42]].map(([u, v]) => H(u, v)); airbrush(g, P, { base: '#d8ccb0', dark: '#4a3e2a', light: '#fff' }); }
  if (hd.antler) { const B = H(.12, .3); for (const [u, v, w] of [[-.2, 1.3, 2], [.3, 1.1, 1.6], [-.5, .8, 1.4]]) gline(g, [B, H(u * .6, v * .6), H(u, v)], { w: Math.max(1.5, s * .012), color: '#d8ccb0' }); }
  // face: nose, eye (look, blink), brow
  if (hd.nose) { const [a, b] = H(hd.nose[0], hd.nose[1]); g.beginPath(); g.ellipse(a, b, s * L * .06, s * L * .045, 0, 0, TAU); g.fillStyle = '#1a1210'; g.fill(); g.beginPath(); g.arc(a - flip * s * L * .015, b - s * L * .015, s * L * .015, 0, TAU); g.fillStyle = 'rgba(255,255,255,.5)'; g.fill(); }
  if (hd.whiskers) for (let i = 0; i < 4; i++) { const [a, b] = H(.86, .0 - i * .03); gline(g, [[a, b], [a + flip * s * L * .35, b - s * L * (.06 - i * .05)]], { w: Math.max(.6, s * .003), color: '#fff8e8', alpha: .7 }); }
  {
    const [a, b] = H(hd.eye[0], hd.eye[1]), r = Math.max(1.5, s * L * (hd.round ? .07 : .055));
    const open = clamp(1 - blink) * (1 - snarl * .35);
    g.beginPath(); g.ellipse(a, b, r * 1.5, r * 1.3, 0, 0, TAU); g.fillStyle = rgba(col.dark, .6); g.fill();
    g.save(); g.beginPath(); g.ellipse(a, b, r * 1.2, r * Math.max(.08, open), -flip * .15, 0, TAU); g.clip();
    g.fillStyle = S.head === 'cat' ? '#e0b030' : S.head === 'bear' || S.head === 'mammoth' || S.head === 'bison' || S.head === 'horse' || S.head === 'deer' ? '#3a2410' : '#d8a040'; g.fillRect(a - r * 2, b - r * 2, r * 4, r * 4);
    const look = o.look || 0, px = a + flip * r * (.25 + look * .3);
    g.beginPath(); g.ellipse(px, b, S.head === 'cat' ? r * .3 : r * .55, r * .7, 0, 0, TAU); g.fillStyle = '#0a0604'; g.fill();
    g.beginPath(); g.arc(px - flip * r * .25, b - r * .35, r * .25, 0, TAU); g.fillStyle = '#fff'; g.fill();
    g.restore();
    if (eyeGlow) glow(g, a, b, r * 6, '#ffd27a', .5 * eyeGlow);
    // brow: lowers and angles with a snarl
    gline(g, [[a - flip * r * 1.6, b - r * (1.4 - snarl * .6)], [a + flip * r * 1.4, b - r * (1.3 + snarl * .3)]], { w: Math.max(1, r * .35), color: col.dark, alpha: .8 });
  }
  if (keyline) { gline(g, skull, { w: Math.max(.7, Math.min(1.6, s * .006)), closed: true, alpha: .55 }); gline(g, jawP, { w: Math.max(.6, Math.min(1.4, s * .005)), closed: true, alpha: .45 }); }
  g.restore();
  return { head: H(.6, .1), eye: H(hd.eye[0], hd.eye[1]), mouth: H(hd.lip ? hd.lip[1] : .9, -.05), bbox: bb };
}
export const strideOf = sp => (typeof sp === 'string' ? SP[sp] : sp).hind.stride * 2;

// a frozen cub curled asleep (Sparta, the Homotherium cub): top-down-ish side view, eyes closed
export function cub(g, x, y, s, { color = '#8a6a48', dark = '#2a1a0e', frost = .5, t = 0, homo = false } = {}) {
  g.save(); g.translate(x, y);
  const body = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; body.push([Math.cos(a) * s * .5, Math.sin(a) * s * .28 - s * .2]); }
  airbrush(g, body, { base: color, dark, light: mix(color, '#fff', .35), dir: -2.2, rim: 2, rimColor: C.gold2 });
  for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI + Math.PI; const px = Math.cos(a) * s * .5, py = Math.sin(a) * s * .28 - s * .2; gline(g, [[px, py], [px * 1.06, py * 1.08 - s * .02]], { w: 1.2, color: mix(color, '#fff', .2), alpha: .8 }); }
  const hx = s * .38, hy = -s * .32, hr = s * (homo ? .2 : .22);
  const head = []; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; head.push([hx + Math.cos(a) * hr, hy + Math.sin(a) * hr * .82]); }
  airbrush(g, head, { base: color, dark, light: mix(color, '#fff', .4), dir: -2.2 });
  for (const sg of [-1, 1]) { const ex = hx + sg * hr * .35, ey = hy - hr * .05; g.beginPath(); g.arc(ex, ey, hr * .22, .15 * Math.PI, .85 * Math.PI); g.strokeStyle = dark; g.lineWidth = Math.max(1.5, s * .012); g.stroke(); }
  g.beginPath(); g.ellipse(hx, hy + hr * .32, hr * .16, hr * .1, 0, 0, TAU); g.fillStyle = '#2a1410'; g.fill();
  for (const sg of [-1, 1]) { const P = [[hx + sg * hr * .5, hy - hr * .6], [hx + sg * hr * .7, hy - hr * (homo ? .95 : 1.05)], [hx + sg * hr * .9, hy - hr * .45]]; airbrush(g, P, { base: color, dark, light: mix(color, '#fff', .3) }); }
  for (let i = 0; i < 4; i++) gline(g, [[hx + hr * .25, hy + hr * .25 + i * 3], [hx + hr * 1.0, hy + hr * .1 + i * 6]], { w: .8, color: '#fff8e8', alpha: .6 });
  const paw = [[-s * .1, -s * .02], [s * .25, -s * .02], [s * .25, s * .05], [-s * .1, s * .05]]; airbrush(g, paw, { base: mix(color, dark, .2), dark, light: color });
  if (frost > 0) { g.save(); g.globalAlpha = frost; for (let i = 0; i < 30; i++) { const a = hash(i) * TAU, r = s * (.3 + hash(i * 3) * .3); g.beginPath(); g.arc(Math.cos(a) * r * .9, Math.sin(a) * r * .5 - s * .2, 1 + hash(i * 7) * 2.5, 0, TAU); g.fillStyle = '#eaf6ff'; g.fill(); } g.restore(); }
  g.restore();
}
