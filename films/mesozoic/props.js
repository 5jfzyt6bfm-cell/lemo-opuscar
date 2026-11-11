// Props and the traveller for "How Long Would You Last?" — all drawn in the deco manner with the copied engine.
import { C, TAU, clamp, lerp, seg, ss, eio, mix, rgba, gline, airbrush, toPath, sunburst, fan, glow, sparkle, hash, arcPts } from './engine/deco.js';

export const P = {
  coral: '#e8735a', coralD: '#7a2a1c', coralL: '#ffb39a',
  jade: '#1d6b57', jadeD: '#0b2e26', jadeL: '#3f9a7f',
  plum: '#2b2130', plumD: '#140f17', plumL: '#5a4562',
  khaki: '#8c7a5a', khakiD: '#3a3122',
};

// ---------- the traveller (seen from behind: the viewer's stand-in) ----------
// x,y = feet centre on screen, s = full height in px. pose: 'stand' | 'shade' | 'kneel'. k = 0..1 blend for shade/kneel.
export function traveller(g, x, y, s, { pose = 'stand', k = 1, sway = 0 } = {}) {
  const hd = s / 7;                                      // ~7 heads tall
  g.save(); g.translate(x, y);
  const kn = pose === 'kneel' ? ss(k) : 0;
  const sh = pose === 'shade' ? ss(k) : 0;
  const drop = kn * s * .34;                             // body lowers when kneeling
  const hipY = -s * .47 + drop, shY = -s * .80 + drop, neckY = -s * .84 + drop, headY = -s * .905 + drop;
  const shW = s * .135, hipW = s * .085, hemW = s * .13, hemY = lerp(-s * .2, -s * .05, kn);
  // shadow pool
  g.save(); g.scale(1, .18); glow(g, 0, 0, s * .32, '#000000', .55); g.restore();
  // legs (dark khaki, tapered), kneel = shins folded back (shorter)
  for (const sg of [-1, 1]) {
    const top = [sg * hipW * .45, hipY + s * .05], foot = [sg * s * (.06 + kn * .09), kn ? -s * .02 : 0];
    const leg = [[top[0] - s * .032, top[1]], [top[0] + s * .032, top[1]], [foot[0] + s * .02, foot[1] - s * .02], [foot[0] + s * .024, foot[1]], [foot[0] - s * .03, foot[1]], [foot[0] - s * .02, foot[1] - s * .02]];
    airbrush(g, leg, { base: P.khakiD, dark: '#0a0806', light: P.khaki, dir: -2.3, rim: 1.4 });
  }
  // coat: streamlined, faceted (two lacquer planes split down the back seam)
  const coatL = [[0, shY - s * .01], [-shW, shY + s * .02], [-hipW * 1.05, hipY], [-hemW, hemY], [0, hemY + s * .015]];
  const coatR = [[0, shY - s * .01], [shW, shY + s * .02], [hipW * 1.05, hipY], [hemW, hemY], [0, hemY + s * .015]];
  airbrush(g, coatL, { base: P.coral, dark: P.coralD, light: P.coralL, dir: -2.3, rim: 2 });
  airbrush(g, coatR, { base: mix(P.coral, '#000000', .25), dark: mix(P.coralD, '#000000', .3), light: P.coral, dir: -2.3 });
  gline(g, [[0, shY + s * .02], [0, hemY + s * .01]], { w: 1.2, color: P.coralD });
  // belt + canteen strap (gold)
  gline(g, [[-hipW * 1.05, hipY + s * .02], [hipW * 1.05, hipY + s * .02]], { w: 2.2 });
  gline(g, [[-shW * .8, shY + s * .03], [hipW * .9, hipY + s * .015]], { w: 2 });
  // arms: rest = down at sides; shade = right forearm raised to the brow; kneel = both forward to the fire
  for (const sg of [-1, 1]) {
    const sx = sg * shW * .92, sy = shY + s * .03;
    let ex = sg * shW * 1.05, ey = sy + s * .16, hx = sg * shW * .95, hy = sy + s * .31;
    if (sg > 0 && sh) { ex = lerp(ex, sg * shW * 1.5, sh); ey = lerp(ey, sy + s * .02, sh); hx = lerp(hx, sg * s * .02, sh); hy = lerp(hy, headY - s * .01, sh); }
    if (kn) { ex = lerp(ex, sg * shW * 1.0, kn); ey = lerp(ey, sy + s * .12, kn); hx = lerp(hx, sg * s * .05, kn); hy = lerp(hy, sy + s * .2, kn); }
    const w0 = s * .03, w1 = s * .022;
    const upper = [[sx - w0, sy], [sx + w0, sy], [ex + w1, ey], [ex - w1, ey]], lower = [[ex - w1, ey], [ex + w1, ey], [hx + w1 * .8, hy], [hx - w1 * .8, hy]];
    airbrush(g, upper, { base: P.coral, dark: P.coralD, light: P.coralL, dir: -2.3, rim: sg < 0 ? 1.5 : 0 });
    airbrush(g, lower, { base: mix(P.coral, '#000', .12), dark: P.coralD, light: P.coralL, dir: -2.3 });
    g.beginPath(); g.arc(hx, hy, s * .02, 0, TAU); g.fillStyle = C.ivoryD; g.fill();   // gloves
  }
  // neck + head (back of head) + pith helmet: the silhouette mark
  g.fillStyle = mix(C.skinD, '#000', .3); g.fillRect(-s * .018, neckY - s * .01, s * .036, s * .04);
  g.beginPath(); g.ellipse(0, headY, hd * .36, hd * .44, 0, 0, TAU); g.fillStyle = '#2a1a10'; g.fill();
  const hb = headY - hd * .12;
  g.beginPath(); g.ellipse(0, hb, hd * .72, hd * .14, 0, 0, TAU);
  airbrush(g, toPath(arcPts(0, hb, hd * .72, 0, TAU, 40, hd * .14), true), { base: C.ivory, dark: C.ivoryD, light: '#ffffff', dir: -2.3 });
  const dome = [...arcPts(0, hb, hd * .46, Math.PI, TAU, 24, hd * .5), [hd * .46, hb]];
  airbrush(g, dome, { base: C.ivory, dark: C.ivoryD, light: '#ffffff', dir: -2.3, rim: 1.4 });
  gline(g, arcPts(0, hb - hd * .05, hd * .46, Math.PI, TAU, 24, hd * .1), { w: 1.6 });   // gold hat band
  g.restore();
}

// ---------- sauropod (profile, airbrushed plum, gold rim) ----------
export function sauropod(g, x, y, s, { flip = 1, phase = 0, base = P.plumL, alpha = 1, keyline = true } = {}) {
  g.save(); g.globalAlpha *= alpha; g.translate(x, y); g.scale(flip * s / 100, s / 100);
  // legs (four columns, step on twos via phase)
  const legs = [[-22, 0], [-10, Math.PI], [22, Math.PI], [34, 0]];
  for (const [lx, ph] of legs) {
    const sw = Math.sin(phase + ph) * 5;
    airbrush(g, [[lx - 6, -38], [lx + 6, -38], [lx + 5 + sw, 0], [lx - 6 + sw, 0]], { base: mix(base, '#000', .3), dir: -2.3 });
  }
  const body = new Path2D();
  body.moveTo(-60, -40);                                             // tail root
  body.bezierCurveTo(-90, -42, -130, -30, -175, -14);                // tail
  body.bezierCurveTo(-130, -40, -95, -62, -55, -66);
  body.bezierCurveTo(-20, -82, 30, -78, 48, -62);                    // back
  body.bezierCurveTo(70, -80, 82, -130, 96, -168);                   // neck
  body.bezierCurveTo(100, -180, 116, -184, 122, -174);               // head
  body.bezierCurveTo(120, -168, 108, -166, 104, -160);
  body.bezierCurveTo(94, -120, 82, -66, 56, -36);                    // throat
  body.bezierCurveTo(30, -26, -30, -26, -60, -40);
  body.closePath();
  airbrush(g, body, { base, dark: mix(base, '#000', .65), light: mix(base, '#fff', .3), dir: -2.3, bbox: [-175, -184, 122, -26], rim: 2.4, rimColor: C.gold2 });
  if (keyline) gline(g, body, { w: 2 * 100 / s * .6 + .8 });
  g.restore();
}

// ---------- cycad: scaly trunk + fan fronds ----------
export function cycad(g, x, y, s, { sway = 0 } = {}) {
  g.save(); g.translate(x, y);
  const h = s * .55, w = s * .09;
  airbrush(g, [[-w, 0], [w, 0], [w * .8, -h], [-w * .8, -h]], { base: P.plum, dark: P.plumD, light: P.plumL, dir: -2.3, rim: 1.4 });
  for (let i = 1; i < 7; i++) gline(g, [[-w * .85, -h * i / 7 + 6], [0, -h * i / 7], [w * .85, -h * i / 7 + 6]], { w: 1 });
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * .33 + sway * .04;
    const L = s * (.45 + (i % 2) * .08), ex = Math.cos(a) * L, ey = -h + Math.sin(a) * L * .8 + Math.abs(i - 4) * s * .06;
    const pts = []; for (let j = 0; j <= 12; j++) { const u = j / 12; pts.push([lerp(0, ex, u), -h + lerp(0, ey + h, u) - Math.sin(u * Math.PI) * s * .08]); }
    airbrush(g, [...pts, ...pts.slice().reverse().map(([px, py], j) => [px, py + s * .035 * Math.sin((1 - j / 12) * Math.PI)])], { base: P.jade, dark: P.jadeD, light: P.jadeL, dir: -2.3 });
    gline(g, pts, { w: 1.4 });
  }
  g.restore();
}

// ---------- stepped mesa (ziggurat silhouette) ----------
export function mesa(g, cx, base, w, h, { steps = 4, color = P.plum, rim = 2 } = {}) {
  const pts = []; const half = w / 2;
  let x = cx - half, y = base; pts.push([x, y]);
  for (let i = 0; i < steps; i++) { y -= h / steps; pts.push([x, y]); x += w * .1; pts.push([x, y]); }
  const R = pts.slice().reverse().map(([px, py]) => [2 * cx - px, py]);
  const all = [...pts, ...R];
  airbrush(g, all, { base: color, dark: mix(color, '#000', .7), light: mix(color, '#fff', .18), dir: -2.3, rim, rimColor: C.gold1 });
  gline(g, all, { w: 1.6, alpha: .9 });
}

// ---------- flame (the one colour) ----------
export function flame(g, x, y, s, t) {
  const tq = Math.floor(t * 12) / 12;                       // flicker on twos
  glow(g, x, y - s * .4, s * 3.2, P.coral, .5);
  glow(g, x, y - s * .3, s * 1.4, '#ffd08a', .45);
  for (let i = 0; i < 3; i++) {
    const k = 1 - i * .3, wob = Math.sin(tq * 9 + i * 2) * s * .08;
    const pts = [[x - s * .32 * k, y], [x - s * .22 * k + wob, y - s * .55 * k], [x + wob * 1.6, y - s * (1.15 + .1 * Math.sin(tq * 13 + i)) * k], [x + s * .22 * k + wob, y - s * .5 * k], [x + s * .32 * k, y]];
    airbrush(g, pts, { base: i === 2 ? '#ffd9a0' : i ? '#f59a6c' : P.coral, dark: P.coralD, dir: -Math.PI / 2 });
    if (i === 0) gline(g, pts, { w: 1.8, color: P.coralL, glow: .6 });
  }
}

// ---------- heat shimmer: wavy gold hairlines ----------
export function shimmer(g, y0, y1, t, a = .35) {
  g.save(); g.globalAlpha *= a;
  for (let y = y0; y < y1; y += 26) {
    const pts = []; for (let x = 0; x <= 1920; x += 40) pts.push([x, y + Math.sin(x * .012 + t * 5 + y * .1) * 5]);
    gline(g, pts, { w: .9 });
  }
  g.restore();
}

// ---------- door leaves (lacquer, gold stepped panels) hinged at the frame edges ----------
// open: 0 = closed on the seam, 1 = fully open (leaves out of frame).
export function doors(g, open, { W = 1920, H = 1080, sheen = .4 } = {}) {
  if (open >= 1) return;
  const half = W / 2, off = half * open;
  for (const sg of [-1, 1]) {
    g.save();
    const x0 = sg < 0 ? -off : half + off, x1 = x0 + half;
    const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, '#120e09'); gr.addColorStop(.5, '#1d160d'); gr.addColorStop(1, '#0a0806');
    g.fillStyle = gr; g.fillRect(x0, 0, half, H);
    const cx = sg < 0 ? x1 - 60 : x0 + 60;                   // ornament anchored at the seam
    g.beginPath(); g.rect(x0, 0, half, H); g.clip();
    sunburst(g, sg < 0 ? x1 : x0, H / 2, { rays: 40, r0: 70, r1: 720, mode: 'both', w: 1.4, alpha: .55, colorA: 'rgba(201,162,75,.07)', sheen });
    for (let i = 0; i < 4; i++) { const ins = 40 + i * 26; gline(g, [[x0 + ins, ins], [x1 - ins, ins], [x1 - ins, H - ins], [x0 + ins, H - ins], [x0 + ins, ins]], { w: i ? 1.1 : 2.4, sheen: sheen + i * .05 }); }
    fan(g, sg < 0 ? x1 : x0, H / 2, 90, { a0: sg < 0 ? Math.PI / 2 : -Math.PI / 2, a1: sg < 0 ? Math.PI * 1.5 : Math.PI / 2, ribs: 7, fill: C.gold1 });
    g.restore();
    gline(g, [[sg < 0 ? x1 : x0, 0], [sg < 0 ? x1 : x0, H]], { w: 2.4 });
  }
}

// ---------- star field (deterministic four-point glints) ----------
export function stars(g, t, { n = 60, y1 = 600, a = 1 } = {}) {
  for (let i = 0; i < n; i++) {
    const x = hash(i * 1.7) * 1920, y = hash(i * 3.3 + 1) * y1, tw = .5 + .5 * Math.sin(t * 2 + i);
    sparkle(g, x, y, 3 + hash(i * 9.1) * 8, { alpha: a * (.3 + .7 * tw), glow: 0 });
  }
}
