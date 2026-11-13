// People with faces: "You" (the viewer's stand-in, coral parka = the film's one accent) and Ice Age humans.
// face(): a deco face rig with blendable expressions; person(): front view; walker(): profile.
import { C, TAU, clamp, lerp, mix, rgba, gline, airbrush, glow } from './engine/deco.js';

export const YOU = { coat: '#e8735a', coatD: '#8a2e1c', coatL: '#ffb8a0', trou: '#2e3440', trouD: '#12161c', skin: '#e2b08a', skinD: '#a8704e', hair: '#2a1a12', boot: '#3a2418' };
export const ICE = { coat: '#8a6a44', coatD: '#3a2814', coatL: '#d0aa78', trou: '#6a5034', trouD: '#2a1e10', skin: '#b8835e', skinD: '#7a4e32', hair: '#1e140c', boot: '#4a3420', fur: '#e8dcc4' };
// expression parameters: brow height, brow tilt (+ = inner up / worried), eye open, mouth curve (+ smile), mouth open
const EX = {
  neutral: [0, 0, 1, 0, 0], curious: [.25, -.05, 1.05, .25, 0], worried: [.25, .55, 1.05, -.3, .05], scared: [.6, .6, 1.3, -.2, .6],
  determined: [-.3, -.55, .9, -.1, 0], awe: [.55, .15, 1.25, .1, .45], sad: [.1, .7, .8, -.5, 0], smile: [.15, 0, .95, .8, .1], shout: [-.2, -.5, 1, 0, .8],
};
export function expr(a, b = null, k = 0) { const A = EX[a] || EX.neutral; if (!b) return A; const B = EX[b] || EX.neutral; return A.map((v, i) => lerp(v, B[i], clamp(k))); }

// Front face. ex = expression array (expr()); look = [-1..1, -1..1]; blink 0..1
export function face(g, cx, cy, r, { ex = EX.neutral, look = [0, 0], blink = 0, pal = YOU, hairStyle = 'short', beard = false, paint = false, light = 1 } = {}) {
  const [bh, bt, eo_, mc, mo] = ex;
  g.save();
  // hair behind
  if (hairStyle === 'long') { const P = [[cx - r * .95, cy - r * .2], [cx - r * 1.05, cy + r * 1.1], [cx + r * 1.05, cy + r * 1.1], [cx + r * .95, cy - r * .2], [cx, cy - r * 1.15]]; airbrush(g, P, { base: pal.hair, dark: '#000', light: mix(pal.hair, '#fff', .2) }); }
  // ears + head
  for (const sg of [-1, 1]) { g.beginPath(); g.ellipse(cx + sg * r * .82, cy + r * .05, r * .14, r * .22, 0, 0, TAU); g.fillStyle = pal.skinD; g.fill(); }
  const head = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; const k = Math.sin(a) > 0 ? 1 - Math.sin(a) * .18 : 1; head.push([cx + Math.cos(a) * r * .8 * k, cy + Math.sin(a) * r]); }
  airbrush(g, head, { base: pal.skin, dark: pal.skinD, light: mix(pal.skin, '#fff', .35), dir: -2.2, rim: 1.6, rimColor: C.gold2 });
  // cheeks
  for (const sg of [-1, 1]) glow(g, cx + sg * r * .45, cy + r * .3, r * .28, '#e88070', .25 + mc * .1);
  if (paint) for (const sg of [-1, 1]) for (let i = 0; i < 2; i++) gline(g, [[cx + sg * r * .3, cy + r * (.32 + i * .12)], [cx + sg * r * .6, cy + r * (.28 + i * .12)]], { w: Math.max(1.5, r * .05), color: '#b8462a' });
  // eyes
  for (const sg of [-1, 1]) {
    const ex0 = cx + sg * r * .33, ey = cy - r * .02, ew = r * .2, eh = r * .12 * eo_ * (1 - blink);
    g.save(); g.beginPath(); g.ellipse(ex0, ey, ew, Math.max(.6, eh), 0, 0, TAU); g.fillStyle = '#fbf6ee'; g.fill(); g.clip();
    const ix = ex0 + look[0] * ew * .45, iy = ey + look[1] * eh * .4;
    g.beginPath(); g.arc(ix, iy, r * .1, 0, TAU); g.fillStyle = '#5a3a1e'; g.fill(); g.beginPath(); g.arc(ix, iy, r * .055, 0, TAU); g.fillStyle = '#0a0604'; g.fill();
    g.beginPath(); g.arc(ix - r * .03, iy - r * .035, r * .025, 0, TAU); g.fillStyle = '#fff'; g.fill();
    g.restore();
    gline(g, [[ex0 - ew * 1.05, ey], [ex0, ey - Math.max(eh, r * .02) * 1.1], [ex0 + ew * 1.05, ey]], { w: Math.max(1.2, r * .035), color: '#2a1a12' });
    // brow: height + tilt (inner end up when worried, down when determined)
    const by = ey - r * (.26 + bh * .12), inner = cx + sg * r * .14, outer = cx + sg * r * .52;
    gline(g, [[inner, by - bt * r * .12], [(inner + outer) / 2, by - r * .04 - bt * r * .03], [outer, by + bt * r * .06]], { w: Math.max(2, r * .07), color: pal.hair });
  }
  // nose
  gline(g, [[cx + r * .02, cy + r * .05], [cx + r * .07, cy + r * .3], [cx - r * .04, cy + r * .33]], { w: Math.max(1, r * .03), color: pal.skinD });
  // mouth
  const my = cy + r * .55, mw = r * .26 * (1 - mo * .3);
  if (mo > .08) { g.beginPath(); g.ellipse(cx, my + r * .02, mw * .9, r * .14 * mo + r * .02, 0, 0, TAU); g.fillStyle = '#5a1e18'; g.fill(); g.beginPath(); g.ellipse(cx, my + r * .02 + r * .1 * mo, mw * .5, r * .05 * mo, 0, 0, TAU); g.fillStyle = '#c0504a'; g.fill(); }
  else { const P = []; for (let i = 0; i <= 12; i++) { const u = i / 12 * 2 - 1; P.push([cx + u * mw, my - mc * r * .12 * (1 - u * u) + Math.abs(u) * mc * r * .03]); } gline(g, P, { w: Math.max(1.5, r * .045), color: '#8a3a2a' }); }
  if (beard) { const P = [[cx - r * .7, cy + r * .2], [cx - r * .55, cy + r * 1.1], [cx, cy + r * 1.3], [cx + r * .55, cy + r * 1.1], [cx + r * .7, cy + r * .2], [cx + r * .4, cy + r * .75], [cx, cy + r * .82], [cx - r * .4, cy + r * .75]]; airbrush(g, P, { base: pal.hair, dark: '#000', light: mix(pal.hair, '#fff', .2) }); }
  // hair on top
  const top = hairStyle === 'hood' ? null : [];
  if (top) { for (let i = 0; i <= 20; i++) { const a = Math.PI + Math.PI * i / 20; top.push([cx + Math.cos(a) * r * .86, cy - r * .2 + Math.sin(a) * r * .95]); } top.push([cx + r * .8, cy - r * .1], [cx + r * .3, cy - r * .55], [cx - r * .2, cy - r * .45], [cx - r * .8, cy - r * .1]); airbrush(g, top, { base: pal.hair, dark: '#000', light: mix(pal.hair, '#fff', .25), dir: -2.2, rim: 1.2, rimColor: C.gold2 }); }
  else { const P = []; for (let i = 0; i <= 24; i++) { const a = Math.PI * .85 + Math.PI * 1.3 * i / 24; P.push([cx + Math.cos(a) * r * 1.12, cy + r * .05 + Math.sin(a) * r * 1.18]); } P.push([cx + r * .9, cy + r * .6], [cx + r * .78, cy - r * .05], [cx, cy - r * .7], [cx - r * .78, cy - r * .05], [cx - r * .9, cy + r * .6]); airbrush(g, P, { base: pal.coat, dark: pal.coatD, light: pal.coatL, dir: -2.2, rim: 1.4, rimColor: C.gold2 }); { const F = []; for (let i = 0; i <= 26; i++) { const a = Math.PI * .88 + Math.PI * 1.24 * i / 26, rr = 1 + .05 * Math.sin(i * 2.7); F.push([cx + Math.cos(a) * r * .95 * rr, cy + r * .05 + Math.sin(a) * r * 1.0 * rr]); } gline(g, F, { w: Math.max(3, r * .12), color: '#f4ecdc', alpha: .95 }); } }
  g.restore();
}

// Front-view person. pose: down | guard (arm across the throat) | fists | cold (arms hugging) | spear | torch | paint (arm raised to the wall) | shrug
export function person(g, x, y, h, { pal = YOU, pose = 'down', ex = EX.neutral, look = [0, 0], blink = 0, hairStyle = 'hood', beard = false, t = 0, sway = 0, paint = false } = {}) {
  const s = h / 1.75, W = (a, b) => [x + a * s, y - b * s];
  g.save();
  const br = Math.sin(t * 2) * .006;
  // legs
  for (const sg of [-1, 1]) { const P = [[sg * .02, .9], [sg * .13, .9], [sg * .12, .08], [sg * .03, .08]].map(([a, b]) => W(a, b)); airbrush(g, P, { base: pal.trou, dark: pal.trouD, light: mix(pal.trou, '#fff', .25), dir: sg < 0 ? -2.4 : -.8 }); airbrush(g, [[sg * .01, .1], [sg * .15, .1], [sg * .16, 0], [sg * .0, 0]].map(([a, b]) => W(a, b)), { base: pal.boot, dark: '#000', light: mix(pal.boot, '#fff', .2) }); }
  // coat
  const coat = [[-.2, .8], [.2, .8], [.21, 1.25 + br], [.17, 1.42 + br], [-.17, 1.42 + br], [-.21, 1.25 + br]].map(([a, b]) => W(a, b));
  airbrush(g, coat, { base: pal.coat, dark: pal.coatD, light: pal.coatL, dir: -2.2, rim: 1.6, rimColor: C.gold2 });
  gline(g, [W(0, 1.4), W(0, .8)], { w: Math.max(1, s * .008), color: pal.coatD });
  if (pal.fur) for (let i = 0; i < 12; i++) gline(g, [W(-.2 + i * .036, .82), W(-.2 + i * .036 + .01, .76)], { w: Math.max(1, s * .01), color: pal.fur });
  // arms
  const sh = [[-.19, 1.37 + br], [.19, 1.37 + br]];
  const hands = { down: [[-.3, .88], [.3, .88]], guard: [[.12, 1.42], [.32, .92]], fists: [[-.16, 1.25], [.16, 1.25]], cold: [[.16, 1.12], [-.16, 1.12]], spear: [[-.3, .95], [.26, 1.1]], torch: [[-.3, .9], [.28, 1.4]], paint: [[-.3, .9], [.42, 1.62]], shrug: [[-.42, 1.05], [.42, 1.05]] }[pose] || [[-.3, .88], [.3, .88]];
  for (let i = 0; i < 2; i++) {
    const [sx, sy] = sh[i], [hx, hy] = hands[i]; const ex = lerp(sx, hx, .5) + (i ? .08 : -.08), ey = lerp(sy, hy, .5) - .05;
    const P = [[sx - .06, sy], [sx + .06, sy], [ex + .06, ey], [hx + .045, hy], [hx - .045, hy], [ex - .06, ey]].map(([a, b]) => W(a, b));
    airbrush(g, P, { base: pal.coat, dark: pal.coatD, light: pal.coatL, dir: -2.2 });
    const [gx, gy] = W(hx, hy); g.beginPath(); g.arc(gx, gy, s * .045, 0, TAU); g.fillStyle = pal.skin; g.fill();
  }
  if (pose === 'spear') { gline(g, [W(.26, -.05), W(.3, 2.15)], { w: Math.max(2, s * .02), color: '#6a4a2a' }); const P = [W(.27, 2.1), W(.3, 2.38), W(.33, 2.1)]; airbrush(g, P, { base: '#c8c0b0', dark: '#4a4440', light: '#fff' }); }
  if (pose === 'torch') { gline(g, [W(.28, 1.2), W(.3, 1.75)], { w: Math.max(2, s * .025), color: '#5a3a1e' }); const [fx, fy] = W(.3, 1.82); glow(g, fx, fy, s * .6, '#ffb050', .7); for (let k = 0; k < 3; k++) { const wv = Math.sin(t * 9 + k) * s * .02; const P = [[fx - s * .06, fy + s * .04], [fx + wv, fy - s * (.16 + .05 * k)], [fx + s * .06, fy + s * .04]]; airbrush(g, P, { base: k ? '#ffd890' : '#ff8a3a', dark: '#c84a1a', light: '#fff4d0' }); } }
  // neck + face
  const [nx, ny] = W(0, 1.46); g.fillStyle = pal.skinD; g.fillRect(nx - s * .05, ny - s * .04, s * .1, s * .08);
  const [fx, fy] = W(0, 1.6);
  face(g, fx, fy, s * .14, { ex, look, blink, pal, hairStyle, beard, paint });
  g.restore();
  return { head: [fx, fy], hand: W(hands[1][0], hands[1][1]) };
}

// Profile walker (You or an Ice Age hunter). flip 1 faces right.
function ik2(hx, hy, ax, ay, l1, l2, bend) { let dx = ax - hx, dy = ay - hy; let d = Math.hypot(dx, dy); const dm = l1 + l2 - 1e-4; if (d > dm) { dx *= dm / d; dy *= dm / d; d = dm; } const a = Math.atan2(dy, dx), c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), k = a + bend * Math.acos(c); return [hx + Math.cos(k) * l1, hy + Math.sin(k) * l1, hx + dx, hy + dy]; }
function limb(a, b, c, w0, w1, w2) { const n = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; }; const n1 = n(a, b), n2 = n(b, c), nb = [(n1[0] + n2[0]) / 2, (n1[1] + n2[1]) / 2]; return [[a[0] + n1[0] * w0, a[1] + n1[1] * w0], [b[0] + nb[0] * w1, b[1] + nb[1] * w1], [c[0] + n2[0] * w2, c[1] + n2[1] * w2], [c[0] - n2[0] * w2, c[1] - n2[1] * w2], [b[0] - nb[0] * w1, b[1] - nb[1] * w1], [a[0] - n1[0] * w0, a[1] - n1[1] * w0]]; }
function gait(u, L, lift) { u = ((u % 1) + 1) % 1; if (u < .6) return [L / 2 - L * (u / .6), 0]; const v = (u - .6) / .4, e = v * v * (3 - 2 * v); return [-L / 2 + L * e, lift * Math.sin(Math.PI * v)]; }
export function walker(g, { x = 960, y = 900, s = 200, flip = 1, pal = YOU, phase = 0, walk = 1, t = 0, carry = null, crouch = 0, hood = true, look = 0 } = {}) {
  const W = (a, b) => [x + flip * a * s, y - b * s];
  const bob = walk * Math.abs(Math.sin(phase * TAU)) * .03, hipY = .95 - bob - crouch * .3;
  g.save();
  const leg = (o2, far) => { const [fx, fl] = gait(phase + o2, .7 * walk, .12 * walk); const [kx, ky, ax, ay] = ik2(0, hipY, fx, fl + .06, .47, .46, 1); const P = limb([0, hipY], [kx, ky], [ax, ay], .1, .075, .06).map(([a, b]) => W(a, b)); airbrush(g, P, { base: far ? mix(pal.trou, '#000', .3) : pal.trou, dark: pal.trouD, light: mix(pal.trou, '#fff', .25), dir: -2.2 }); airbrush(g, [[ax - .06, ay + .05], [ax + .2, ay + .02], [ax + .2, ay - .06], [ax - .07, ay - .06]].map(([a, b]) => W(a, b)), { base: pal.boot, dark: '#000', light: mix(pal.boot, '#fff', .2) }); };
  const arm = (o2, far) => { const sw = Math.sin((phase + o2) * TAU) * .35 * walk; const sx = .02, sy = 1.42 - bob - crouch * .3; let hx = sx + Math.sin(sw) * .55, hy = sy - Math.cos(sw) * .55; if (carry && !far) { hx = .32; hy = sy - .22; } const [ex, ey, ax, ay] = ik2(sx, sy, hx, hy, .3, .28, -1); const P = limb([sx, sy], [ex, ey], [ax, ay], .065, .055, .045).map(([a, b]) => W(a, b)); airbrush(g, P, { base: far ? mix(pal.coat, '#000', .3) : pal.coat, dark: pal.coatD, light: pal.coatL, dir: -2.2 }); const [gx, gy] = W(ax, ay); g.beginPath(); g.arc(gx, gy, .04 * s, 0, TAU); g.fillStyle = pal.skin; g.fill(); return [ax, ay]; };
  arm(.5, true); leg(.5, true);
  const sy = 1.45 - bob - crouch * .3, tor = [[-.15, hipY - .1], [.15, hipY - .1], [.17, sy - .05], [.1, sy + .06], [-.12, sy + .05], [-.17, sy - .08]].map(([a, b]) => W(a, b));
  airbrush(g, tor, { base: pal.coat, dark: pal.coatD, light: pal.coatL, dir: -2.2, rim: 1.4, rimColor: C.gold2 });
  if (pal.fur) gline(g, [W(-.15, hipY - .08), W(.15, hipY - .08)], { w: Math.max(2, s * .02), color: pal.fur });
  leg(0, false);
  const hd = arm(0, false);
  if (carry === 'spear') { gline(g, [W(hd[0] - .9, hd[1] - .25), W(hd[0] + .9, hd[1] + .25)], { w: Math.max(2, s * .016), color: '#6a4a2a' }); const P = [W(hd[0] + .88, hd[1] + .29), W(hd[0] + 1.1, hd[1] + .33), W(hd[0] + .9, hd[1] + .2)]; airbrush(g, P, { base: '#c8c0b0', dark: '#4a4440', light: '#fff' }); }
  if (carry === 'torch') { gline(g, [W(hd[0], hd[1]), W(hd[0] + .1, hd[1] + .45)], { w: Math.max(2, s * .02), color: '#5a3a1e' }); const [fx, fy] = W(hd[0] + .12, hd[1] + .52); glow(g, fx, fy, s * .5, '#ffb050', .7); airbrush(g, [[fx - s * .05, fy + s * .03], [fx + Math.sin(t * 9) * s * .02, fy - s * .16], [fx + s * .05, fy + s * .03]], { base: '#ff9a40', dark: '#c84a1a', light: '#fff4d0' }); }
  // head in profile
  const [hx, hy] = W(.07, sy + .17), r = .11 * s;
  g.beginPath(); g.ellipse(hx, hy, r * .9, r, 0, 0, TAU); g.fillStyle = pal.skin; g.fill();
  g.beginPath(); g.moveTo(hx + flip * r * .8, hy - r * .1); g.lineTo(hx + flip * r * 1.08, hy + r * .2); g.lineTo(hx + flip * r * .8, hy + r * .3); g.fillStyle = pal.skin; g.fill();
  g.beginPath(); g.arc(hx + flip * r * .45, hy - r * .1, r * .1, 0, TAU); g.fillStyle = '#1a100a'; g.fill();
  gline(g, [[hx + flip * r * .25, hy - r * .3], [hx + flip * r * .65, hy - r * .33]], { w: Math.max(1.2, r * .12), color: pal.hair });
  if (hood && pal === YOU) { const P = []; for (let i = 0; i <= 20; i++) { const a = Math.PI * .6 + Math.PI * 1.2 * i / 20; P.push([hx - flip * r * .1 + Math.cos(a) * r * 1.2 * flip, hy + Math.sin(a) * r * 1.2]); } P.push([hx + flip * r * .6, hy + r * .5], [hx + flip * r * .5, hy - r * .6]); airbrush(g, P, { base: pal.coat, dark: pal.coatD, light: pal.coatL, rim: 1, rimColor: C.gold2 }); }
  else { const P = []; for (let i = 0; i <= 16; i++) { const a = Math.PI + Math.PI * i / 16; P.push([hx - flip * r * .1 + Math.cos(a) * r, hy - r * .1 + Math.sin(a) * r]); } P.push([hx - flip * r * .9, hy + r * .9]); airbrush(g, P, { base: pal.hair, dark: '#000', light: mix(pal.hair, '#fff', .2) }); }
  g.restore();
  return { head: [hx, hy] };
}
