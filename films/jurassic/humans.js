// Modern soldiers in the deco manner (the film's one accent colour: desert tan-terracotta). Profile rig in metres + front and overhead views.
import { C, TAU, clamp, lerp, mix, rgba, gline, airbrush, glow } from './engine/deco.js';

export const SC = { uni: '#c8774f', uniD: '#6a3420', uniL: '#f0a77e', gear: '#7a4630', gearD: '#2e1810', helm: '#9c5c3a', skin: '#b98a6a', skinD: '#6a4630', boot: '#241a14', gun: '#2a2826' };
const D2R = Math.PI / 180;
function ik2(hx, hy, ax, ay, l1, l2, bend) {
  let dx = ax - hx, dy = ay - hy; let d = Math.hypot(dx, dy); const dm = l1 + l2 - 1e-4;
  if (d > dm) { dx *= dm / d; dy *= dm / d; d = dm; }
  const a = Math.atan2(dy, dx), c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), k = a + bend * Math.acos(c);
  return [hx + Math.cos(k) * l1, hy + Math.sin(k) * l1, hx + dx, hy + dy];
}
function limb(a, b, c, w0, w1, w2) {   // continuous tapered limb a→b→c
  const n = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };
  const n1 = n(a, b), n2 = n(b, c), nb = [(n1[0] + n2[0]) / 2, (n1[1] + n2[1]) / 2];
  return [[a[0] + n1[0] * w0, a[1] + n1[1] * w0], [b[0] + nb[0] * w1, b[1] + nb[1] * w1], [c[0] + n2[0] * w2, c[1] + n2[1] * w2],
    [c[0] - n2[0] * w2, c[1] - n2[1] * w2], [b[0] - nb[0] * w1, b[1] - nb[1] * w1], [a[0] - n1[0] * w0, a[1] - n1[1] * w0]];
}
function gaitFoot(u, L, lift) { u = ((u % 1) + 1) % 1; if (u < .6) return [L / 2 - L * (u / .6), 0]; const v = (u - .6) / .4, e = v * v * (3 - 2 * v); return [-L / 2 + L * e, lift * Math.sin(Math.PI * v)]; }

// Rifle in its own frame (butt at 0, muzzle at +L along x, y up), metres.
function rifle(g, W, bx, by, ang, s, L = .9) {
  const ca = Math.cos(ang), sa = Math.sin(ang), R = (u, v) => W(bx + u * ca - v * sa, by + u * sa + v * ca);
  const body = [[0, -.06], [0, .05], [.18, .04], [.24, .06], [.55, .06], [.58, .03], [L, .03], [L, .005], [.58, .0], [.5, -.03], [.42, -.03], [.4, -.16], [.33, -.17], [.34, -.03], [.27, -.03], [.25, -.1], [.21, -.1], [.2, -.03], [.16, -.03]];
  const P = body.map(([u, v]) => R(u, v));
  airbrush(g, P, { base: SC.gun, dark: '#0a0a0a', light: '#5a5852', dir: -2.2 });
  gline(g, P, { w: Math.max(.6, s * .008), closed: true, alpha: .55 });
}

// pose: stand | walk | aim | kneel | sit | crouch | sentry (standing, rifle slung low, looking) ; flip 1 = facing right
export function soldier(g, o = {}) {
  const { x = 960, y = 900, s = 200, flip = 1, pose = 'stand', phase = 0, t = 0, look = 0, nvg = false, alpha = 1, tint = null, rim = true } = o;
  const col = { ...SC }; if (tint) for (const k of Object.keys(col)) col[k] = mix(col[k], tint[0], tint[1]);
  const W = (mx, my) => [x + flip * mx * s, y - my * s];
  g.save(); g.globalAlpha *= alpha;
  const breathe = Math.sin(t * 1.6) * .006;
  let hip = [0, .95], sh = [.02, 1.45 + breathe], neck = [.04, 1.52], headC = [.06, 1.62];
  let legs, hands, rif;
  if (pose === 'walk' || pose === 'stand' || pose === 'sentry' || pose === 'aim') {
    const wk = pose === 'walk' ? 1 : 0, bob = wk * Math.abs(Math.sin(phase * TAU)) * .03;
    hip = [0, .95 - bob]; sh = [.03 + wk * .03, 1.45 - bob + breathe]; neck = [sh[0] + .02, sh[1] + .07]; headC = [sh[0] + .05, sh[1] + .17];
    legs = [0, .5].map(o2 => { const [fx, fl] = gaitFoot(phase + o2, .7 * wk, .12 * wk); const fx0 = wk ? fx : (o2 ? -.07 : .07); return [fx0, fl]; });
    if (pose === 'aim') { rif = [-.05, sh[1] + .02, -2 * D2R]; hands = [[.12, sh[1] - .02], [.4, sh[1] + .01]]; headC = [sh[0] + .1, sh[1] + .15]; }
    else if (pose === 'sentry') { rif = [-.08, sh[1] - .2, -32 * D2R]; hands = [[.08, sh[1] - .28], [.3, sh[1] - .4]]; }
    else { rif = [-.08, sh[1] - .15, -26 * D2R]; hands = [[.08, sh[1] - .22], [.3, sh[1] - .3]]; }
  } else if (pose === 'kneel') {
    hip = [-.05, .55]; sh = [.05, 1.05 + breathe]; neck = [.08, 1.12]; headC = [.13, 1.22];
    legs = [[.38, 0, 'knee-up'], [-.42, 0, 'knee-down']];
    rif = [-.02, sh[1] + .02, -3 * D2R]; hands = [[.14, sh[1] - .02], [.42, sh[1] + .0]];
  } else if (pose === 'sit') {
    hip = [0, .16]; sh = [.12, .7 + breathe]; neck = [.17, .76]; headC = [.25, .8];
    legs = [[.55, 0, 'sit'], [.48, 0, 'sit']];
    rif = [.0, .3, 12 * D2R]; hands = [[.35, .42], [.48, .45]];
  } else if (pose === 'crouch') {
    hip = [-.1, .42]; sh = [.2, .82 + breathe]; neck = [.26, .88]; headC = [.33, .96];
    legs = [[.18, 0, 'crouch'], [.05, 0, 'crouch']];
    rif = null; hands = [[.62, .22], [.58, .28]];
  }
  // legs (far first)
  const legPoly = (L, far) => {
    let foot = [L[0], L[1]];
    let knee;
    if (L[2] === 'knee-down') { knee = [-.05, .02]; foot = [-.42, .05]; }
    else if (L[2] === 'sit') { const [kx, ky, ax, ay] = ik2(hip[0], hip[1], L[0], .06, .46, .45, 1); knee = [kx, ky]; foot = [ax, ay]; }
    else { const [kx, ky, ax, ay] = ik2(hip[0], hip[1], foot[0], foot[1] + .03, .47, .46, 1); knee = [kx, ky]; foot = [ax, ay]; }
    const P = limb(hip, knee, foot, .1, .075, .06).map(([a, b]) => W(a, b));
    airbrush(g, P, { base: far ? mix(col.uni, col.uniD, .45) : col.uni, dark: col.uniD, light: far ? col.uni : col.uniL, dir: -2.2 });
    const bt = [[foot[0] - .06, foot[1] + .06], [foot[0] + .07, foot[1] + .05], [foot[0] + .2, foot[1] - .02], [foot[0] + .2, foot[1] - .08], [foot[0] - .08, foot[1] - .08]].map(([a, b]) => W(a, b));
    airbrush(g, bt, { base: col.boot, dark: '#000', light: '#4a3a2c', dir: -2.2 });
  };
  legPoly(legs[1], true);
  // backpack + torso + plate carrier
  const bk = [[sh[0] - .15, sh[1] - .02], [sh[0] - .3, sh[1] - .06], [hip[0] - .3, hip[1] + .12], [hip[0] - .12, hip[1] + .06]].map(([a, b]) => W(a, b));
  airbrush(g, bk, { base: col.gear, dark: col.gearD, light: mix(col.gear, '#fff', .2), dir: -2.2, rim: rim ? 1 : 0, rimColor: C.gold2 });
  const tor = [[hip[0] - .13, hip[1] - .02], [hip[0] + .12, hip[1] - .02], [sh[0] + .14, sh[1] - .1], [sh[0] + .08, sh[1] + .04], [sh[0] - .12, sh[1] + .03], [sh[0] - .15, sh[1] - .08]].map(([a, b]) => W(a, b));
  airbrush(g, tor, { base: col.uni, dark: col.uniD, light: col.uniL, dir: -2.2, rim: rim ? 1.4 : 0, rimColor: C.gold2 });
  const pc = [[lerp(hip[0], sh[0], .3) - .15, lerp(hip[1], sh[1], .3)], [lerp(hip[0], sh[0], .3) + .16, lerp(hip[1], sh[1], .3)], [sh[0] + .17, sh[1] - .12], [sh[0] + .1, sh[1] - .02], [sh[0] - .14, sh[1] - .02], [sh[0] - .17, sh[1] - .12]].map(([a, b]) => W(a, b));
  airbrush(g, pc, { base: col.gear, dark: col.gearD, light: mix(col.gear, '#fff', .25), dir: -2.2 });
  for (let i = 0; i < 3; i++) { const yy = lerp(hip[1], sh[1], .38 + i * .14); gline(g, [W(sh[0] - .1, yy), W(sh[0] + .14, yy)], { w: Math.max(.5, s * .004), color: col.gearD, alpha: .8 }); }
  legPoly(legs[0], false);
  // head + helmet
  const [hx, hy] = W(headC[0], headC[1]), r = .1 * s;
  g.beginPath(); g.ellipse(hx + flip * r * .15, hy + r * .1, r * .85, r, 0, 0, TAU); g.fillStyle = col.skin; g.fill();
  g.beginPath(); g.ellipse(hx + flip * r * .55, hy + r * .25, r * .28, r * .35, 0, 0, TAU); g.fillStyle = mix(col.skin, '#fff', .15); g.fill();
  const helm = []; for (let i = 0; i <= 18; i++) { const a = Math.PI + Math.PI * i / 18; helm.push([hx + Math.cos(a) * r * 1.25 - flip * r * .05, hy - r * .1 + Math.sin(a) * r * 1.2]); }
  helm.push([hx + flip * r * 1.2, hy + r * .05], [hx - flip * r * 1.25, hy + r * .25]);
  airbrush(g, helm, { base: col.helm, dark: col.gearD, light: mix(col.helm, '#fff', .3), dir: -2.2, rim: rim ? 1.2 : 0, rimColor: C.gold2 });
  if (nvg) { const n = [[hx + flip * r * .6, hy - r * 1.0], [hx + flip * r * 1.5, hy - r * .7], [hx + flip * r * 1.5, hy - r * .2], [hx + flip * r * .8, hy - r * .2]]; airbrush(g, n, { base: '#1a1a1a', dark: '#000', light: '#4a4a4a', dir: -2.2 }); g.beginPath(); g.arc(hx + flip * r * 1.5, hy - r * .45, r * .18, 0, TAU); g.fillStyle = '#7dff9a'; g.fill(); }
  // rifle + arms
  if (rif) rifle(g, W, rif[0], rif[1], rif[2], s);
  for (const [i, hd] of hands.entries()) {
    const sx = sh[0] + (i ? .03 : -.02), sy = sh[1] - .03;
    const [ex, ey, hx2, hy2] = ik2(sx, sy, hd[0], hd[1], .3, .28, -1);
    const P = limb([sx, sy], [ex, ey], [hx2, hy2], .065, .05, .04).map(([a, b]) => W(a, b));
    airbrush(g, P, { base: i ? col.uni : mix(col.uni, col.uniD, .3), dark: col.uniD, light: col.uniL, dir: -2.2 });
    const [gx, gy] = W(hx2, hy2); g.beginPath(); g.arc(gx, gy, .04 * s, 0, TAU); g.fillStyle = '#3a2a20'; g.fill();
  }
  g.restore();
  return { head: [hx, hy], muzzle: rif ? W(rif[0] + Math.cos(rif[2]) * .9, rif[1] + Math.sin(rif[2]) * .9) : null };
}

// Front view (for the kit plate and sentries facing camera). Symmetric.
export function soldierFront(g, o = {}) {
  const { x = 960, y = 900, s = 300, t = 0, alpha = 1 } = o;
  const W = (mx, my) => [x + mx * s, y - my * s];
  g.save(); g.globalAlpha *= alpha;
  for (const sg of [-1, 1]) {
    const P = limb([sg * .1, .95], [sg * .12, .5], [sg * .13, .08], .085, .07, .06).map(([a, b]) => W(a, b));
    airbrush(g, P, { base: SC.uni, dark: SC.uniD, light: SC.uniL, dir: sg < 0 ? -2.4 : -.9 });
    airbrush(g, [[sg * .05, .1], [sg * .21, .1], [sg * .21, 0], [sg * .05, 0]].map(([a, b]) => W(a, b)), { base: SC.boot, dark: '#000', light: '#4a3a2c' });
  }
  const tor = [[-.18, .93], [.18, .93], [.24, 1.45], [.12, 1.52], [-.12, 1.52], [-.24, 1.45]].map(([a, b]) => W(a, b));
  airbrush(g, tor, { base: SC.uni, dark: SC.uniD, light: SC.uniL, dir: -2.2, rim: 1.4, rimColor: C.gold2 });
  const pc = [[-.19, 1.02], [.19, 1.02], [.2, 1.4], [.12, 1.46], [-.12, 1.46], [-.2, 1.4]].map(([a, b]) => W(a, b));
  airbrush(g, pc, { base: SC.gear, dark: SC.gearD, light: mix(SC.gear, '#fff', .25), dir: -2.2 });
  for (let i = 0; i < 3; i++) airbrush(g, [[-.15 + i * .1, 1.04], [-.07 + i * .1, 1.04], [-.07 + i * .1, 1.17], [-.15 + i * .1, 1.17]].map(([a, b]) => W(a, b)), { base: SC.gearD, light: SC.gear });
  // radio on the shoulder strap, antenna
  airbrush(g, [[.13, 1.3], [.2, 1.3], [.2, 1.42], [.13, 1.42]].map(([a, b]) => W(a, b)), { base: '#2a2826', light: '#5a5852' });
  gline(g, [W(.18, 1.42), W(.24, 1.78)], { w: Math.max(1, s * .005) });
  for (const sg of [-1, 1]) {
    const P = limb([sg * .23, 1.43], [sg * .27, 1.17], [sg * .12, 1.05], .06, .05, .045).map(([a, b]) => W(a, b));
    airbrush(g, P, { base: SC.uni, dark: SC.uniD, light: SC.uniL, dir: -2.2 });
  }
  // rifle across the chest
  const R = [[-.3, 1.22], [.32, .98], [.33, 1.01], [-.29, 1.26]].map(([a, b]) => W(a, b)); airbrush(g, R, { base: SC.gun, dark: '#000', light: '#5a5852' }); gline(g, R, { w: 1, closed: true, alpha: .5 });
  const [hx, hy] = W(0, 1.64), r = .1 * s;
  g.beginPath(); g.ellipse(hx, hy + r * .1, r * .8, r * .98, 0, 0, TAU); g.fillStyle = SC.skin; g.fill();
  g.fillStyle = '#2a1a12'; g.fillRect(hx - r * .38, hy, r * .2, r * .1); g.fillRect(hx + r * .18, hy, r * .2, r * .1);
  const helm = []; for (let i = 0; i <= 20; i++) { const a = Math.PI + Math.PI * i / 20; helm.push([hx + Math.cos(a) * r * 1.2, hy - r * .12 + Math.sin(a) * r * 1.15]); }
  airbrush(g, helm, { base: SC.helm, dark: SC.gearD, light: mix(SC.helm, '#fff', .3), dir: -2.2, rim: 1.2, rimColor: C.gold2 });
  g.restore();
}

// Top-down (Busby Berkeley overhead): helmet, shoulders, pack, rifle. a = heading (rad).
export function soldierTop(g, x, y, r, a = -Math.PI / 2, { alpha = 1, lit = 1 } = {}) {
  g.save(); g.globalAlpha *= alpha; g.translate(x, y); g.rotate(a + Math.PI / 2);
  g.beginPath(); g.ellipse(0, r * .1, r * 1.05, r * .55, 0, 0, TAU); g.fillStyle = mix(SC.uniD, SC.uni, lit); g.fill();
  g.fillStyle = mix(SC.gearD, SC.gear, lit); g.fillRect(-r * .5, r * .2, r, r * .55);
  g.save(); g.strokeStyle = SC.gun; g.lineWidth = r * .18; g.beginPath(); g.moveTo(r * .5, r * .1); g.lineTo(r * .3, -r * 1.3); g.stroke(); g.restore();
  g.beginPath(); g.arc(0, 0, r * .5, 0, TAU); const gr = g.createRadialGradient(-r * .2, -r * .2, 0, 0, 0, r * .5); gr.addColorStop(0, mix(SC.helm, '#fff', .35 * lit)); gr.addColorStop(1, mix(SC.gearD, SC.helm, lit)); g.fillStyle = gr; g.fill();
  g.restore();
}
