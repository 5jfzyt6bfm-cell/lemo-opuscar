// Case File Explainer: drawing kit
// Two canvases per frame, as in the 80s Cel Anime engine: g = the picture, e = light emitters only (lamps, screens, fridge light).
// The emitter canvas is blurred at three radii and added on top (bloom). Characters are stamped black into e so glow never shines through them.
import { clamp, lerp, mulberry } from './lib.js';
export const W = 1920, H = 1080;

export function canvas(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }

// —— colour ——
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
export const mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(t))).toString(16).padStart(2, '0')).join(''); };
export const rgba = (h, a) => { const [r, g, b] = hex(h); return `rgba(${r},${g},${b},${a})`; };

export const PAL = {
  ink: '#0b0918', night: '#14112b', wall: '#211a42', plum: '#2c2150', violet: '#4a2f6e',
  dusk: '#c7586a', ember: '#f08a5d', gold: '#ffcf7a',
  skin: '#f2ebe6',                       // the bean figures: warm white, never outlined
  teal: '#8ff3e6', tealHot: '#e9fffb',   // the one cool light: reserved for the story's key object
  red: '#ff4b3e', orange: '#ff8a3a', yellow: '#ffd23f',
  cork: '#a8673a', corkDark: '#5a321c', paper: '#efe7da',
};

// —— camera: one world→screen transform for both canvases ——
export function cam(ctxs, cx, cy, z) { for (const c of ctxs) c.setTransform(z, 0, 0, z, W / 2 - cx * z, H / 2 - cy * z); }
export const toScreen = (x, y, C) => [W / 2 + (x - C[0]) * C[2], H / 2 + (y - C[1]) * C[2]];

export function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
export function vgrad(c, y0, y1, stops) { const gr = c.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, col]) => gr.addColorStop(o, col)); return gr; }

// —— the bean figure ——
// pose: x, y (feet), s (height in px), face (-1..1: where the face turns), eyes (0 closed..1 open), brow (-1 worried..1 cross),
// mouth (-1 frown..1 smile), gape (0..1 open mouth), lean (rad), step (walk phase, NaN = standing), armL/armR: {x,y} hand target
// relative to the shoulder in units of s, or null for hanging. light: {lit, shade, dir (+1 lit from the right)}
function ik(ax, ay, bx, by, l1, l2, bend) {
  const dx = bx - ax, dy = by - ay; let d = Math.hypot(dx, dy); d = Math.min(d, l1 + l2 - .01);
  const a = Math.atan2(dy, dx), c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const k = a + bend * Math.acos(c); return [ax + Math.cos(k) * l1, ay + Math.sin(k) * l1];
}
export function bean(g, P, mask = false) {
  const u = P.s / 100, x0 = P.x, y0 = P.y, L = P.light || { lit: '#cfc6e4', shade: '#7d72a8', dir: 1 };
  const face = P.face ?? 0, lean = P.lean ?? 0;
  g.save(); g.translate(x0, y0);
  const T = P.thin ? .62 : 1, mcol = typeof mask === 'string' ? mask : '#000';
  const fillFor = (xa, xb) => { if (mask) return mcol; const gr = g.createLinearGradient(L.dir > 0 ? xa : xb, 0, L.dir > 0 ? xb : xa, 0); gr.addColorStop(0, L.shade); gr.addColorStop(.62, L.lit); gr.addColorStop(1, L.lit); return gr; };
  const hip = [0, -42 * u], sh = [Math.sin(lean) * 36 * u, -42 * u - Math.cos(lean) * 36 * u];
  // legs
  const ph = P.step;
  const legs = [-1, 1].map(sd => {
    if (P.sit) {                                   // seated: thigh forward, shin down to the floor
      const dir = (face || 1) > 0 ? 1 : -1, hx = hip[0] + sd * 4.5 * u, hy = hip[1];
      const kx = hx + dir * 19 * u + sd * 1.5 * u, ky = hy + 1 * u;
      return [[hx, hy], [kx, ky], [kx + dir * 3 * u, hy + (P.shin ?? 23) * u - 3 * u]];
    }
    const p = isNaN(ph ?? NaN) ? 0 : ph + (sd > 0 ? Math.PI : 0);
    const fx = (isNaN(ph ?? NaN) ? sd * 5 : Math.sin(p) * 13) * u + sd * 2 * u, fy = -(isNaN(ph ?? NaN) ? 0 : Math.max(0, Math.cos(p)) * 5) * u;
    const hx = hip[0] + sd * 4.5 * u, hy = hip[1];
    return [[hx, hy], ik(hx, hy, fx, fy - 3 * u, 21 * u, 21 * u, -1), [fx, fy - 3 * u]];
  });
  const limb = (pts, w) => { g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.stroke(); };
  g.strokeStyle = fillFor(-14 * u, 14 * u);
  for (const l of legs) limb(l, 9.5 * u * T);
  // feet: soft rounded pads
  g.fillStyle = fillFor(-14 * u, 14 * u);
  for (const l of legs) { rr(g, l[2][0] - 5 * u * T + face * 2 * u, l[2][1] - 2 * u * T, 11 * u * T, 5.5 * u * T, 2.7 * u * T); g.fill(); }
  // arms behind/in front: far arm first
  const arm = (sd, tgt) => {
    const sx = sh[0] + sd * 9 * u, sy = sh[1] + 4 * u;
    let hx = tgt ? sx + tgt.x * P.s : sx + sd * 4 * u + Math.sin(lean) * 6 * u, hy = tgt ? sy + tgt.y * P.s : sy + 34 * u;
    const reach = 34.5 * u, dd = Math.hypot(hx - sx, hy - sy); if (dd > reach) { hx = sx + (hx - sx) * reach / dd; hy = sy + (hy - sy) * reach / dd; }   // an arm never stretches
    return [[sx, sy], ik(sx, sy, hx, hy, 18 * u, 17 * u, sd > 0 ? 1 : -1), [hx, hy]];
  };
  const aL = arm(-1, P.armL), aR = arm(1, P.armR);
  g.strokeStyle = fillFor(-24 * u, 24 * u);
  limb(face >= 0 ? aL : aR, 8 * u * T);
  // torso: a soft pill, a little narrower at the waist
  g.fillStyle = fillFor(-14 * u, 14 * u);
  g.beginPath();
  const tw = 11 * u * (P.thin ? .72 : 1), bw = 9.5 * u * (P.thin ? .72 : 1), nx = -Math.cos(lean), ny = Math.sin(lean);
  g.moveTo(hip[0] - bw, hip[1] + 2 * u);
  g.bezierCurveTo(hip[0] - bw - 1 * u, hip[1] - 14 * u, sh[0] - tw - 1 * u, sh[1] + 8 * u, sh[0] - tw + 1 * u, sh[1] + 1 * u);
  g.quadraticCurveTo(sh[0], sh[1] - 6 * u, sh[0] + tw - 1 * u, sh[1] + 1 * u);
  g.bezierCurveTo(sh[0] + tw + 1 * u, sh[1] + 8 * u, hip[0] + bw + 1 * u, hip[1] - 14 * u, hip[0] + bw, hip[1] + 2 * u);
  g.quadraticCurveTo(hip[0], hip[1] + 7 * u, hip[0] - bw, hip[1] + 2 * u); g.fill();
  g.strokeStyle = fillFor(-24 * u, 24 * u);
  limb(face >= 0 ? aR : aL, 8 * u * T);
  // head
  const hr = 14 * u * (P.headR ?? 1) * (P.thin ? .82 : 1), hx = sh[0] + Math.sin(lean) * 14 * u + (P.headX ?? 0) * u, hy = sh[1] - 13 * u + (P.headY ?? 0) * u;
  if (P.acc === 'hair') hairBack(g, hx, hy, hr, P, L, mask);
  g.fillStyle = mask ? '#000' : (() => { const gr = g.createRadialGradient(hx + L.dir * hr * .45, hy - hr * .35, hr * .1, hx, hy, hr * 1.15); gr.addColorStop(0, L.lit); gr.addColorStop(.55, L.lit); gr.addColorStop(1, L.shade); return gr; })();
  g.beginPath(); g.ellipse(hx, hy, hr, hr * 1.04, 0, 0, Math.PI * 2); g.fill();
  if (!mask) faceDraw(g, hx, hy, hr, { ...P, lidCol: P.lidCol || L.lit });
  if (!mask && P.acc) accessory(g, P.acc, hx, hy, hr, sh, u, P);
  g.restore();
  return { head: [x0 + hx, y0 + hy, hr], hand: [x0 + aR[2][0], y0 + aR[2][1]] };
}
function faceDraw(g, hx, hy, hr, P) {
  const f = P.face ?? 0, ex = hr * .36, eo = clamp(P.eyes ?? 1), br = P.brow ?? 0, ink = P.ink || '#2a2233';
  const cx = hx + f * hr * .38, cy = hy + hr * .05;
  g.fillStyle = ink; g.strokeStyle = ink; g.lineCap = 'round';
  for (const sd of [-1, 1]) {
    const k = 1 - Math.abs(f) * .25 * (sd * f > 0 ? 0 : 1);           // far eye a little narrower
    const x = cx + sd * ex * (1 - Math.abs(f) * .25) + (P.look ?? 0) * hr * .1, y = cy - hr * .08 + (P.lookY ?? 0) * hr * .07, r = hr * .1 * k;
    if (P.happy) { g.lineWidth = hr * .07; g.beginPath(); g.arc(x, y + r * .6, r * 1.15, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
      g.save(); g.fillStyle = 'rgba(255,130,150,.45)'; g.beginPath(); g.ellipse(x + sd * r * .4, y + hr * .3, r * 1.5, r * .8, 0, 0, Math.PI * 2); g.fill(); g.restore(); continue; }
    if (eo > .22) { g.beginPath(); g.ellipse(x, y + (1 - eo) * r * .5, r, r * (.35 + .65 * eo), 0, 0, Math.PI * 2); g.fill();
      if (eo < .8) { g.fillStyle = P.lidCol || '#d9d0e6'; g.beginPath(); g.rect(x - r * 1.3, y - r * 1.4, r * 2.6, r * 1.4 * (1 - eo) * 1.3); g.fill(); g.fillStyle = ink; } }
    else { g.lineWidth = hr * .06; g.beginPath(); g.moveTo(x - r * 1.1, y + r * .3); g.quadraticCurveTo(x, y + r * (eo < .1 ? .9 : .5), x + r * 1.1, y + r * .3); g.stroke(); }
    // brow: br>0 inner end down (cross), br<0 inner end up (worried)
    g.lineWidth = hr * .065; g.beginPath();
    const by = y - hr * .3, inner = x - sd * r * 1.3, outer = x + sd * r * 1.3;
    g.moveTo(inner, by + br * hr * .09); g.lineTo(outer, by - br * hr * .05); g.stroke();
  }
  const m = P.mouth ?? 0, gp = P.gape ?? 0, my = cy + hr * .42, mw = hr * .2;
  if (gp > .05) { g.beginPath(); g.ellipse(cx, my, mw * .7, hr * .12 * gp + 1, 0, 0, Math.PI * 2); g.fill(); }
  else { g.lineWidth = hr * .06; g.beginPath(); g.moveTo(cx - mw, my - m * hr * .05); g.quadraticCurveTo(cx, my + m * hr * .12, cx + mw, my - m * hr * .05); g.stroke(); }
}

// —— bloom: the emitter canvas blurred at three radii and added on top ——
const [b1, x1] = canvas(W / 4, H / 4), [b2, x2] = canvas(W / 8, H / 8), [b3, x3] = canvas(W / 16, H / 16);
export function composite(out, scene, glow, o = {}) {
  out.setTransform(1, 0, 0, 1, 0, 0); out.globalCompositeOperation = 'source-over'; out.globalAlpha = 1; out.filter = 'none';
  out.drawImage(scene, 0, 0);
  const passes = [[b1, x1, 3, o.b1 ?? .9], [b2, x2, 4, o.b2 ?? .8], [b3, x3, 5, o.b3 ?? .7]];
  for (const [c, x, r, a] of passes) { x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height); x.filter = `blur(${r}px)`; x.drawImage(glow, 0, 0, c.width, c.height); x.filter = 'none';
    out.globalCompositeOperation = 'lighter'; out.globalAlpha = a * (o.bloom ?? 1); out.drawImage(c, 0, 0, W, H); }
  out.globalAlpha = 1; out.globalCompositeOperation = 'source-over';
  // vignette: corners fall to night ink
  const v = out.createRadialGradient(W / 2, H / 2, H * .32, W / 2, H / 2, H * 1.02);
  v.addColorStop(0, 'rgba(8,6,20,0)'); v.addColorStop(1, `rgba(8,6,20,${o.vig ?? .72})`);
  out.fillStyle = v; out.fillRect(0, 0, W, H);
}

// —— kinetic captions ——
// A sentence = words with their own times; one keyword carries the accent. Words pop in and build the line, centred on the whole sentence
// (with a voice, chunks replace each other in sync with it instead: see STYLE.md §4).
export const CAP = { size: 58, y: 990, font: s => `800 ${s}px Poppins` };
export function caption(c, t, S) {
  if (t < S.t0 || t >= S.t1) return null;
  c.setTransform(1, 0, 0, 1, 0, 0); c.font = CAP.font(CAP.size); c.textBaseline = 'alphabetic';
  const sp = c.measureText(' ').width, ws = S.words.map(w => c.measureText(w.w).width);
  const tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  let x = W / 2 - tot / 2; const out = 1 - clamp((t - (S.t1 - .12)) / .12);
  S.words.forEach((w, i) => {
    const k = clamp((t - w.t) / .14);
    if (k > 0) {
      const sc = .82 + .18 * (1 - Math.pow(1 - k, 3)) + (w.key ? .08 * Math.sin(Math.PI * k) : 0);
      c.save(); c.translate(x + ws[i] / 2, CAP.y); c.scale(sc, sc); c.globalAlpha = k * out;
      c.shadowColor = 'rgba(6,4,14,.9)'; c.shadowBlur = 22; c.shadowOffsetY = 4;
      c.lineWidth = 7; c.lineJoin = 'round'; c.strokeStyle = 'rgba(10,6,20,.55)'; c.textAlign = 'center'; c.strokeText(w.w, 0, 0);
      c.fillStyle = w.key ? PAL[w.key] : '#ffffff'; c.textAlign = 'center'; c.fillText(w.w, 0, 0); c.restore();
    }
    x += ws[i] + sp;
  });
  return { id: S.id, text: S.words.map(w => w.w).join(' '), x0: W / 2 - tot / 2 - 6, y0: CAP.y - CAP.size, x1: W / 2 + tot / 2 + 6, y1: CAP.y + CAP.size * .3 };
}

// —— stamp title: heavy type, gradient fill, full stop, lands with a slam ——
export function stamp(c, e, t, S) {
  if (t < S.t0 || t >= S.t1) return null;
  const k = clamp((t - S.t0) / .16), sc = lerp(1.45, 1, 1 - Math.pow(1 - k, 3)), size = S.size || 190;
  for (const [x, glow] of [[c, false], [e, true]]) {
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.translate(S.x ?? W / 2, S.y ?? 520); x.scale(sc, sc); x.rotate(S.rot ?? -.02);
    x.font = `400 ${size}px "Archivo Black"`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.globalAlpha = k;
    if (glow) { x.fillStyle = rgba(S.c1 || PAL.orange, .35); x.fillText(S.text, 0, 0); }
    else {
      x.shadowColor = 'rgba(10,4,12,.7)'; x.shadowBlur = 26; x.shadowOffsetY = 10;
      const gr = x.createLinearGradient(0, -size * .45, 0, size * .45); gr.addColorStop(0, S.c1 || PAL.orange); gr.addColorStop(1, S.c2 || PAL.red);
      x.fillStyle = gr; x.fillText(S.text, 0, 0);
    }
    x.restore();
  }
  c.font = `400 ${size}px "Archivo Black"`; const w = c.measureText(S.text).width;
  return { id: S.id, text: S.text, x0: (S.x ?? W / 2) - w / 2, y0: (S.y ?? 520) - size * .5, x1: (S.x ?? W / 2) + w / 2, y1: (S.y ?? 520) + size * .5 };
}

// —— small world pieces ——
export function nightTown(g, e, x, y, w, h, seed, warm = 1) {
  const R = mulberry(seed);
  g.fillStyle = vgrad(g, y, y + h, [[0, '#1c1a4a'], [.45, PAL.violet], [.82, PAL.dusk], [1, PAL.ember]]); g.fillRect(x, y, w, h);
  for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(255,240,230,${.25 + R() * .4})`; g.fillRect(x + R() * w, y + R() * h * .45, 2, 2); }
  let bx = x - 20;
  while (bx < x + w) {
    const bw = 60 + R() * 110, bh = h * (.18 + R() * .32), by = y + h - bh;
    g.fillStyle = mix('#140f2a', '#241a40', R()); g.beginPath();
    if (R() < .45) { g.moveTo(bx, by + 20); g.lineTo(bx + bw / 2, by - 24); g.lineTo(bx + bw, by + 20); g.lineTo(bx + bw, y + h); g.lineTo(bx, y + h); } else g.rect(bx, by, bw, bh);
    g.fill();
    for (let k = 0; k < 3; k++) if (R() < .5 * warm) { const wx = bx + 12 + R() * (bw - 30), wy = by + 28 + R() * (bh - 50);
      g.fillStyle = PAL.gold; g.fillRect(wx, wy, 12, 14); e.fillStyle = rgba(PAL.gold, .8); e.fillRect(wx, wy, 12, 14); }
    bx += bw + 6;
  }
}
export function cork(w, h, seed) {
  const [c, x] = canvas(w, h), R = mulberry(seed);
  x.fillStyle = vgrad(x, 0, h, [[0, '#b8743f'], [1, '#8d5430']]); x.fillRect(0, 0, w, h);
  for (let i = 0; i < w * h / 90; i++) { const v = R(); x.fillStyle = v < .5 ? `rgba(70,35,15,${.12 + R() * .2})` : `rgba(240,190,130,${.06 + R() * .14})`; x.fillRect(R() * w, R() * h, 1 + R() * 3, 1 + R() * 2.5); }
  return c;
}

// —— props that tell the figures apart (drawn on top of the head / at the neck) ——
function accessory(g, acc, hx, hy, hr, sh, u, P) {
  const f = P.face ?? 0, ink = '#2a2233';
  if (acc === 'glasses') {
    const cx = hx + f * hr * .38, cy = hy - hr * .03; g.strokeStyle = ink; g.lineWidth = hr * .055;
    for (const sd of [-1, 1]) { const x = cx + sd * hr * .36 * (1 - Math.abs(f) * .25); g.beginPath(); g.roundRect(x - hr * .2, cy - hr * .15, hr * .4, hr * .28, hr * .08); g.stroke(); }
    g.beginPath(); g.moveTo(cx - hr * .16, cy - hr * .04); g.lineTo(cx + hr * .16, cy - hr * .04); g.stroke();
  } else if (acc === 'clip') {
    g.save(); g.translate(hx - hr * .55 * (f >= 0 ? 1 : -1) * .9, hy - hr * .78); g.rotate(f >= 0 ? -.5 : .5);
    g.fillStyle = '#e46f9d'; g.beginPath(); g.roundRect(-hr * .26, -hr * .08, hr * .52, hr * .17, hr * .08); g.fill(); g.restore();
  } else if (acc === 'scarf') {
    g.fillStyle = '#e39a3b'; g.beginPath(); g.ellipse(sh[0], sh[1] + 1 * u, 12.5 * u, 4.2 * u, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.roundRect(sh[0] + (f >= 0 ? 3 : -8) * u, sh[1] + 2 * u, 5 * u, 15 * u, 2 * u); g.fill();
  } else if (acc === 'cap') {
    const f = P.face ?? 0; g.fillStyle = '#e8e6f2'; g.strokeStyle = 'rgba(40,36,60,.85)'; g.lineWidth = hr * .06;
    g.beginPath(); g.arc(hx, hy - hr * .15, hr * 1.02, Math.PI * 1.05, Math.PI * 1.95); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.roundRect(hx - f * hr * .2 - hr * (f >= 0 ? 1.45 : -.45), hy - hr * .32, hr * 1.0, hr * .18, hr * .08); g.fill(); g.stroke();
  } else if (acc === 'phones') {
    g.strokeStyle = '#3a3168'; g.lineWidth = hr * .12; g.beginPath(); g.arc(hx, hy, hr * 1.06, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
    g.fillStyle = '#ff8a3a'; for (const sd of [-1, 1]) { g.beginPath(); g.roundRect(hx + sd * hr * 1.02 - hr * .14, hy - hr * .22, hr * .28, hr * .44, hr * .1); g.fill(); }
  }
}

// long hair: one thin outline shape around the head and down to the shoulders (no strands)
function hairBack(g, hx, hy, hr, P, L, mask) {
  const f = P.face ?? 0; g.save(); g.strokeStyle = 'rgba(40,36,60,.85)'; g.lineWidth = hr * .07; g.lineJoin = 'round';
  g.fillStyle = mask ? (typeof mask === 'string' ? mask : '#000') : L.shade; g.beginPath(); g.moveTo(hx - hr * 1.12, hy + hr * 1.6); g.quadraticCurveTo(hx - hr * 1.4, hy - hr * .2, hx, hy - hr * 1.22); g.quadraticCurveTo(hx + hr * 1.4, hy - hr * .2, hx + hr * 1.12, hy + hr * 1.6); g.closePath(); g.fill(); if (mask) { g.restore(); return; } g.stroke();
  g.beginPath(); g.moveTo(hx - hr * 1.02, hy + hr * 1.5); g.quadraticCurveTo(hx - hr * 1.25, hy - hr * .1, hx - hr * .6, hy - hr * .9);
  g.quadraticCurveTo(hx + f * hr * .3, hy - hr * 1.25, hx + hr * .7, hy - hr * .85); g.quadraticCurveTo(hx + hr * 1.25, hy - hr * .1, hx + hr * 1.02, hy + hr * 1.5); g.stroke();
  g.beginPath(); g.moveTo(hx - hr * .7, hy - hr * .75); g.quadraticCurveTo(hx + f * hr * .2, hy - hr * .35, hx + hr * .75, hy - hr * .7); g.stroke(); g.restore();
}
