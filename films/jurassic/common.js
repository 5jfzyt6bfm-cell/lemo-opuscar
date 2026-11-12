// Shared pieces: the Jurassic world camera, day medallion, threat board, plaques, counters, rulers, subtitles.
import { C, TAU, clamp, lerp, seg, ss, eio, eo, ei, back, mix, rgba, gline, airbrush, toPath, sunburst, fan, glow, sparkle, vignette, fishScale, chevrons, arcPts, stepArchPts, hash, mulberry } from './engine/deco.js';
import { goldText, titleBar, decoDigits, dial, clockFace, subtitleCard, floorMedallion, measure, FONTS } from './engine/type.js';
import { buildSign, drawSign, litSequence } from './engine/bulbs.js';
import { makeCam } from './engine/cam.js';
import { dino, SPECIES } from './dinos.js';
import { soldier } from './humans.js';
import { conifer, treeFern, cycad, ginkgo, horsetails, ferns, PC } from './plants.js';

export const W = 1920, H = 1080;
export const BRIGHT = typeof location !== 'undefined' && new URLSearchParams(location.search).get('look') === 'bright';
if (BRIGHT) globalThis.__VIG = .45;
export const tw = t => Math.floor(t * 12) / 12;   // characters on twos
export const mech = u => { u = clamp(u); const e = eio(Math.min(1, u * 1.12)); return e + (u > .89 ? Math.sin((u - .89) / .11 * Math.PI) * .025 : 0); };
export function bg(g, top = '#120d08', bot = C.ink) { if (BRIGHT) { top = '#1f5560'; bot = '#0c2a30'; } const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
export function label(g, text, x, y, { size = 26, alpha = 1, color = null, track = 6, weight = 700, align = 'center' } = {}) {
  return goldText(g, text, x, y, { size, font: FONTS.sans, weight, track, shadow: false, alpha, fill: color, align });
}
// Gold plaque with stepped ends + text (labels for animals, plants, facts).
export function plaque(g, text, cx, cy, { p = 1, size = 26, sub = null, color = null } = {}) {
  const k = eio(clamp(p)); if (k <= 0) return;
  const tw_ = measure(g, text, size, FONTS.sans, size * .25, 700), w = (tw_ + size * 1.6) * ss(seg(k, 0, .6)), h = size * (sub ? 2.5 : 1.7) * ss(seg(k, .2, .7));
  const s = h * .16, hw = w / 2, hh = h / 2;
  const P = [[cx - hw, cy - hh], [cx + hw, cy - hh], [cx + hw, cy - hh + s], [cx + hw + s, cy - hh + s], [cx + hw + s, cy + hh - s], [cx + hw, cy + hh - s], [cx + hw, cy + hh], [cx - hw, cy + hh], [cx - hw, cy + hh - s], [cx - hw - s, cy + hh - s], [cx - hw - s, cy - hh + s], [cx - hw, cy - hh + s]];
  g.fillStyle = 'rgba(8,6,4,.86)'; g.fill(toPath(P, true));
  gline(g, P, { w: 1.8, closed: true, color });
  const a = ss(seg(k, .55, 1));
  label(g, text, cx, cy + size * (sub ? -.05 : .36), { size, alpha: a, track: size * .25 });
  if (sub) label(g, sub, cx, cy + size * .95, { size: size * .62, alpha: a * .85, track: size * .18, weight: 600 });
}
// a measuring rule with ticks every metre, labelled at the ends
export function ruler(g, x0, y, x1, metres, { p = 1, label: lab = null, alpha = 1, step = 1 } = {}) {
  const k = eo(clamp(p)); if (k <= 0) return; const xe = lerp(x0, x1, k);
  g.save(); g.globalAlpha *= alpha;
  gline(g, [[x0, y], [xe, y]], { w: 2 }); gline(g, [[x0, y - 14], [x0, y + 14]], { w: 2 });
  for (let m = step; m <= metres * k + 1e-6; m += step) { const xx = lerp(x0, x1, m / metres); gline(g, [[xx, y - (m % 5 ? 6 : 12)], [xx, y + (m % 5 ? 6 : 12)]], { w: 1.2 }); }
  if (k >= 1) gline(g, [[x1, y - 14], [x1, y + 14]], { w: 2 });
  if (lab && k > .9) label(g, lab, (x0 + x1) / 2, y - 24, { size: 28, alpha: ss(seg(p, .9, 1.2)) });
  g.restore();
}
export function crossOut(g, cx, cy, r, p) { const k = eo(clamp(p)); if (k <= 0) return; gline(g, [[cx - r, cy - r], [cx - r + 2 * r * k, cy - r + 2 * r * k]], { w: 4, color: '#e8735a', glow: .5 }); }

// ---------- the Jurassic world (pinhole camera over a floodplain) ----------
// cam: { x, y (height m), z, f, oy (horizon px), pitch } ; o: night 0..1, dusk 0..1, heat 0..1, mist, river (z of river band), actors [{z, draw(g, P, sc)}], plants density, sun
const PLANTS = (() => {
  const R = mulberry(77), out = [];
  for (let i = 0; i < 420; i++) {
    const z = 6 + Math.pow(R(), 1.6) * 260, x = (R() - .5) * 600;
    const kind = R(); const k = kind < .22 ? 'conifer' : kind < .42 ? 'treeFern' : kind < .55 ? 'cycad' : kind < .62 ? 'ginkgo' : kind < .78 ? 'horsetails' : 'ferns';
    const hM = { conifer: 26 + R() * 14, treeFern: 6 + R() * 4, cycad: 2 + R() * 1.5, ginkgo: 14 + R() * 6, horsetails: 2.5 + R() * 1.5, ferns: 1.2 + R() * .6 }[k];
    out.push({ x, z, k, h: hM, seed: i });
  }
  return out;
})();
const PF = { conifer, treeFern, cycad, ginkgo, horsetails, ferns };
export function world(g, t, cam, o = {}) {
  const { night = 0, dusk = 0, heat = 0, mist = 0, river = 34, riverW = 10, actors = [], plants = 1, clearing = null, sunX = 0, sun = 1, nv = 0, near = 0 } = o;
  const C_ = makeCam({ W, H, ...cam });
  const hz = C_.P(cam.x, 0, 4000)[1];
  // sky
  const top = mix(mix('#1a120a', '#2a160c', heat), '#04060a', night), midc = mix(mix('#2e4a3a', '#7a3a18', Math.max(dusk, heat * .8)), '#0a1814', night), hor = mix(mix('#a8b48a', '#f0a050', Math.max(dusk, heat)), '#18302a', night);
  const Bt = BRIGHT ? mix(mix('#2a6ea0', '#3a2a5a', dusk), '#04060a', night) : top, Bm = BRIGHT ? mix(mix('#7cc4d8', '#e07a4a', Math.max(dusk, heat * .8)), '#0a1814', night) : midc, Bh = BRIGHT ? mix(mix('#ffe2a8', '#ffb060', Math.max(dusk, heat)), '#18302a', night) : hor;
  const sk = g.createLinearGradient(0, 0, 0, hz); sk.addColorStop(0, Bt); sk.addColorStop(.65, Bm); sk.addColorStop(1, Bh); g.fillStyle = sk; g.fillRect(0, 0, W, Math.max(0, hz) + 2);
  if (night > .3) for (let i = 0; i < 80; i++) { const sx = hash(i * 1.7) * W, sy = hash(i * 3.3 + 1) * hz * .9; sparkle(g, sx, sy, 2 + hash(i * 9.1) * 6, { alpha: (night - .3) * (.4 + .6 * Math.sin(t * 2 + i) * .5 + .3), glow: 0 }); }
  if (sun > 0) {
    const [sx, sy] = C_.P(cam.x + sunX, 160 - dusk * 120 - night * 200, 3000), sr = 70 + heat * 60;
    g.save(); g.globalAlpha = sun * (1 - night);
    sunburst(g, sx, sy, { rays: 64, r0: sr * 1.2, r1: 1500, mode: 'both', w: 1.4, alpha: .55, colorA: rgba('#f3d98b', .05 + heat * .05), rot: t * .005 });
    glow(g, sx, sy, sr * 3.5, '#ffd88a', .4 + heat * .2);
    g.beginPath(); g.arc(sx, sy, sr, 0, TAU); const sg = g.createRadialGradient(sx - sr * .3, sy - sr * .3, 0, sx, sy, sr); sg.addColorStop(0, C.goldHi); sg.addColorStop(1, mix(C.gold1, '#e08030', heat)); g.fillStyle = sg; g.fill();
    g.restore();
  }
  // far stepped hills (mesas) on the horizon
  for (let i = -6; i <= 6; i++) {
    const X = i * 260 + (hash(i + 40) - .5) * 120, Z = 1400 + hash(i) * 600, [px, py] = C_.P(X, 0, Z), sc = C_.scaleAt(X, 0, Z), w = (180 + hash(i * 5) * 160) * sc, h = (40 + hash(i * 7) * 50) * sc;
    if (px + w < 0 || px - w > W) continue;
    const pts = []; let xx = px - w / 2, yy = py; pts.push([xx, yy]); for (let s = 0; s < 3; s++) { yy -= h / 3; pts.push([xx, yy]); xx += w * .1; pts.push([xx, yy]); }
    const R_ = pts.slice().reverse().map(([a, b]) => [2 * px - a, b]);
    airbrush(g, [...pts, ...R_], BRIGHT ? { base: mix('#c87a50', '#0c1210', night), dark: mix('#8a4a30', '#05080a', night), light: mix('#f4b888', '#1a2a24', night), dir: -2.3 } : { base: mix(mix('#4a4a46', '#6a4a30', heat), '#0c1210', night), dark: mix('#2a2824', '#05080a', night), light: mix('#8a8a7a', '#1a2a24', night), dir: -2.3 });
  }
  // ground
  const gg = g.createLinearGradient(0, hz, 0, H); gg.addColorStop(0, mix(BRIGHT ? mix('#a8bc5a', '#c8a050', heat) : mix('#5a5a3a', '#7a5a30', heat), '#0e1612', night)); gg.addColorStop(1, mix(BRIGHT ? mix('#5a7a2c', '#8a5a2a', heat) : mix('#2a2616', '#3a2410', heat), '#050806', night)); g.fillStyle = gg; g.fillRect(0, hz, W, H - hz);
  // river band
  if (river) {
    const z0 = river, z1 = river + riverW;
    const a = C_.P(-2000, 0, z0), b = C_.P(-2000, 0, z1);
    const yA = a[1], yB = b[1];
    if (yB < H) {
      const rg = g.createLinearGradient(0, yB, 0, yA); rg.addColorStop(0, mix(BRIGHT ? '#7ad8d0' : '#3a7a6a', '#0a2a24', night)); rg.addColorStop(1, mix(BRIGHT ? '#2aa0a8' : '#1d5a4a', '#061a16', night));
      g.fillStyle = rg; g.fillRect(0, yB, W, Math.max(0, yA - yB));
      g.save(); g.globalAlpha = .5 * (1 - night * .5);
      for (let k = 0; k < 9; k++) { const zz = lerp(z0, z1, (k + .5) / 9), yy = C_.P(0, 0, zz)[1]; const pts = []; for (let xx = 0; xx <= W; xx += 60) pts.push([xx + ((t * 30 * (1 + k * .2)) % 60), yy + Math.sin(xx * .02 + t + k) * 2]); gline(g, pts, { w: .9, alpha: .6 }); }
      g.restore();
    }
  }
  // drawables sorted far → near
  const items = [];
  if (plants) for (const p of PLANTS) {
    if (clearing && Math.abs(p.x - clearing[0]) < clearing[2] && Math.abs(p.z - clearing[1]) < clearing[3]) continue;
    if (river && p.z > river - 1 && p.z < river + riverW + 1) continue;
    if (p.z < cam.z + 2) continue;
    const sc = C_.scaleAt(p.x, 0, p.z); const [px, py] = C_.P(p.x, 0, p.z);
    if (px < -p.h * sc || px > W + p.h * sc || py > H + 400 * 0 + p.h * sc * 2) continue;
    if (p.h * sc < 2) continue;
    if ((p.seed % 1000) / 1000 > plants) continue;
    items.push({ z: p.z, draw: () => PF[p.k](g, px, py, p.h * sc, { dark: BRIGHT ? night * .7 : Math.min(1, Math.max(0, (p.z - 60) / 200) * .8 + night * .7), sway: t * .8 + p.seed, seed: p.seed }) });
  }
  for (const a of actors) items.push({ z: a.z, draw: () => a.draw(g, C_) });
  items.sort((a, b) => b.z - a.z);
  let hazed = !BRIGHT || night > .5;
  for (const it of items) {
    if (!hazed && it.z < 70) { hazed = true; const hg = g.createLinearGradient(0, 0, 0, hz + 40); hg.addColorStop(0, rgba(Bm, .0)); hg.addColorStop(.5, rgba(Bm, .25)); hg.addColorStop(1, rgba(Bh, .5)); g.fillStyle = hg; g.fillRect(0, 0, W, hz + 40); }
    it.draw();
    if (mist > 0 && it.z > 25) { /* atmospheric depth handled by a band below */ }
  }
  if (mist > 0) { const mg = g.createLinearGradient(0, hz - 260, 0, hz + 120); mg.addColorStop(0, rgba('#c8d4b8', 0)); mg.addColorStop(.6, rgba(mix(BRIGHT ? '#f0f8ff' : '#c8d4b8', '#203028', night), (BRIGHT ? .25 : .35) * mist)); mg.addColorStop(1, rgba('#c8d4b8', 0)); g.fillStyle = mg; g.fillRect(0, hz - 260, W, 380); }
  if (heat > 0) { g.save(); g.globalAlpha = heat * .25; for (let yy = hz - 80; yy < hz + 60; yy += 18) { const pts = []; for (let xx = 0; xx <= W; xx += 40) pts.push([xx, yy + Math.sin(xx * .013 + t * 5 + yy) * 4]); gline(g, pts, { w: .8 }); } g.restore(); }
  if (nv > 0) { g.save(); g.globalCompositeOperation = 'color'; g.globalAlpha = nv; g.fillStyle = '#3aff7a'; g.fillRect(0, 0, W, H); g.restore(); g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = nv * .12; g.fillStyle = '#3aff7a'; g.fillRect(0, 0, W, H); g.restore(); }
  return C_;
}
// actor helpers for world(): a dinosaur or a soldier standing at world (X, Z)
export const A = {
  dino: (sp, X, Z, o = {}) => ({ z: Z, draw: (g, C_) => { const [px, py] = C_.P(X, 0, Z); dino(g, sp, { x: px, y: py, s: C_.scaleAt(X, 0, Z), ...o, ...(o.dark != null ? { tint: ['#0a0e0c', o.dark] } : {}) }); } }),
  soldier: (X, Z, o = {}) => ({ z: Z, draw: (g, C_) => { const [px, py] = C_.P(X, 0, Z); soldier(g, { x: px, y: py, s: C_.scaleAt(X, 0, Z), ...o }); } }),
  fn: (Z, f) => ({ z: Z, draw: f }),
};

// ---------- DAY medallion (chapter turn) ----------
export function dayMedallion(g, day, p, { prev = null, cx = 960, cy = 470, r = 230, out = 0 } = {}) {
  const k = clamp(p) * (1 - eio(clamp(out))); if (k <= 0) return;
  g.save(); g.globalAlpha *= ss(seg(k, 0, .25));
  g.fillStyle = rgba('#050403', .72 * ss(seg(k, 0, .3))); g.fillRect(0, 0, W, H);
  sunburst(g, cx, cy, { rays: 56, r0: r * 1.1, r1: r * (1.1 + 1.6 * eo(seg(k, 0, .5))), mode: 'lines', w: 1.6, alpha: .7, rot: k * .2 });
  g.beginPath(); g.arc(cx, cy, r, 0, TAU); const fg = g.createRadialGradient(cx - r * .3, cy - r * .3, 0, cx, cy, r); fg.addColorStop(0, '#2a1f12'); fg.addColorStop(1, '#060504'); g.fillStyle = fg; g.fill();
  gline(g, arcPts(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU * eo(seg(k, 0, .45)), 100), { w: 3, glow: .4 });
  gline(g, arcPts(cx, cy, r * .9, 0, TAU, 100), { w: 1, alpha: ss(seg(k, .2, .5)) });
  for (let i = 0; i < 7; i++) {   // seven bulbs around the rim: lit up to `day`
    const a = -Math.PI / 2 + (i - 3) * .3, bx = cx + Math.cos(a) * r * .74, by = cy + Math.sin(a) * r * .74 + r * .02;
    const lit = i < day ? (prev != null && i >= prev ? ss(seg(k, .55 + (i - prev) * .06, .62 + (i - prev) * .06)) : 1) : 0;
    g.beginPath(); g.arc(bx, by, r * .045, 0, TAU); g.fillStyle = lit ? mix('#3a2a18', C.bulb, lit) : '#1a140c'; g.fill();
    if (lit) glow(g, bx, by, r * .16, '#ffcf7a', .5 * lit);
  }
  const a = ss(seg(k, .3, .6));
  label(g, 'DAY', cx, cy - r * .18, { size: r * .16, alpha: a, track: r * .06 });
  const flip = prev != null ? ss(seg(k, .35, .6)) : 1;
  const num = String(flip < .5 && prev != null ? prev : day), sy = Math.abs(Math.cos(flip * Math.PI));
  g.save(); g.translate(cx, cy + r * .42); g.scale(1, prev != null ? Math.max(.02, sy) : 1);
  goldText(g, num, 0, 0, { size: r * .62, font: FONTS.deco, sy: 1.2, alpha: a, sheen: lerp(-.2, 1.2, seg(k, .55, 1)) });
  g.restore();
  g.restore();
}
// small persistent corner medallion
export function dayCorner(g, day, alpha = 1, night = 0) {
  if (alpha <= 0) return;
  const cx = 96, cy = 96, r = 52;
  g.save(); g.globalAlpha *= alpha;
  g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fillStyle = 'rgba(6,5,4,.82)'; g.fill();
  gline(g, arcPts(cx, cy, r, 0, TAU, 60), { w: 2 }); gline(g, arcPts(cx, cy, r * .86, 0, TAU, 60), { w: .8 });
  label(g, night ? 'NIGHT' : 'DAY', cx, cy - 14, { size: 13, track: 4 });
  goldText(g, String(day), cx, cy + 32, { size: 46, font: FONTS.deco, sy: 1.15, shadow: false });
  g.restore();
}

// ---------- the threat board ----------
export const THREATS = ['AIR', 'WATER', 'FOOD', 'GIANTS', 'PREDATORS', 'EXHAUSTION', 'INFECTION'];
// lit: index of the plaque being lit now (-1 none), done: how many before it are already ticked; p: entrance; hl: 0..1 highlight progress
export function threatBoard(g, t, { p = 1, out = 0, cur = -1, hl = 1, cy = 540, title = null, titleP = 1 } = {}) {
  const k = clamp(p) * (1 - eio(clamp(out))); if (k <= 0) return;
  g.save(); g.globalAlpha *= ss(seg(k, 0, .3));
  g.fillStyle = rgba('#050403', .8); g.fillRect(0, 0, W, H);
  sunburst(g, 960, cy + 260, { rays: 40, r0: 0, r1: 1500, a0: Math.PI, a1: TAU, mode: 'wedges', colorA: 'rgba(201,162,75,.05)' });
  const n = THREATS.length, pw = 230, gap = 24, x0 = 960 - (n * pw + (n - 1) * gap) / 2 + pw / 2;
  for (let i = 0; i < n; i++) {
    const cx = x0 + i * (pw + gap), e = eo(seg(k, .1 + i * .05, .45 + i * .05)), y = cy + (1 - e) * 60;
    if (e <= 0) continue;
    const isCur = i === cur, done = cur >= 0 && i < cur, lit = isCur ? hl : 0;
    const P = stepArchPts(cx, y + 150, pw, 300, { steps: 3, crown: 'round' });
    g.save(); g.globalAlpha *= e;
    g.fillStyle = isCur ? rgba(mix('#2a1a0c', '#6a3a14', lit), .95) : 'rgba(14,10,6,.95)'; g.fill(toPath(P, true));
    gline(g, P, { w: isCur ? 2.6 : 1.6, glow: lit * .6, alpha: done ? .55 : 1 });
    const by = y - 30; g.beginPath(); g.arc(cx, by, 22, 0, TAU); g.fillStyle = lit ? mix('#3a2a18', C.bulb, lit) : done ? '#4a3a24' : '#1a140c'; g.fill();
    if (lit) { glow(g, cx, by, 120, '#ffcf7a', .55 * lit); sparkle(g, cx, by, 30 * lit, { alpha: lit }); }
    gline(g, arcPts(cx, by, 26, 0, TAU, 30), { w: 1.4 });
    label(g, THREATS[i], cx, y + 70, { size: 22, track: 3, alpha: done ? .5 : 1 });
    if (done) gline(g, [[cx - 60, y + 62], [cx + 60, y + 62]], { w: 1.4, alpha: .6 });
    g.restore();
  }
  if (title) titleBar(g, title, 960, 170, { p: titleP, size: 52 });
  g.restore();
}

// ---------- subtitles from word timings ----------
export function buildCues(words, sents, off, { maxChars = 54 } = {}) {
  const cues = []; let wi = 0;
  for (const s of sents) {
    const toks = s.text.split(/\s+/); const n = s.n;
    const ws = words.slice(s.i0, s.i0 + n);
    // map display tokens onto spoken words proportionally
    const L = toks.map(x => x.length + 1), tot = L.reduce((a, b) => a + b, 0), k = Math.min(toks.length, Math.ceil(tot / maxChars));
    const chunks = []; let start = 0, cum = 0; const cums = []; L.forEach(l => { cum += l; cums.push(cum); });
    for (let j = 1; j < k; j++) {
      const target = tot * j / k; let best = -1, bs = 1e9;
      for (let q = start; q < toks.length - 1; q++) { const d = Math.abs(cums[q] - target) - (/[,;:.—]$/.test(toks[q]) ? 12 : 0); if (d < bs) { bs = d; best = q; } }
      if (best < start) break; chunks.push(Array.from({ length: best - start + 1 }, (_, z) => start + z)); start = best + 1;
    }
    if (start < toks.length) chunks.push(Array.from({ length: toks.length - start }, (_, z) => start + z));
    for (const ch of chunks) {
      const a = Math.floor(ch[0] / toks.length * n), b = Math.max(a, Math.ceil((ch[ch.length - 1] + 1) / toks.length * n) - 1);
      const w0 = ws[a], w1 = ws[Math.min(n - 1, b)];
      cues.push({ text: ch.map(j => toks[j]).join(' '), t0: off[w0.part] + w0.t0 - .08, t1: off[w1.part] + w1.t1 + .35 });
    }
  }
  // min hold 1.8 s, never overlap: extend into the gap, else merge with the next cue
  for (let i = 0; i < cues.length; i++) {
    const c = cues[i], nx = cues[i + 1];
    const speech = c.t1 - c.t0;
    let want = Math.max(1.8, speech + .25);
    if (nx && c.t0 + want > nx.t0 - .05) {
      if (c.t0 + 1.8 <= nx.t0 - .05) want = nx.t0 - .05 - c.t0;
      else if (c.text.length + nx.text.length + 1 <= maxChars + 30) { nx.text = c.text + ' ' + nx.text; nx.t0 = c.t0; cues.splice(i, 1); i--; continue; }
      else want = Math.max(nx.t0 - .05 - c.t0, .8);
    }
    c.t1 = c.t0 + want;
  }
  return cues;
}
export function drawSubs(g, t, cues) {
  for (const c of cues) {
    if (t < c.t0 - .05 || t > c.t1 + .3) continue;
    subtitleCard(g, c.text, { p: seg(t, c.t0 - .05, c.t0 + .25), out: seg(t, c.t1, c.t1 + .25), size: 38, cy: 1000 });
  }
}
export { goldText, titleBar, decoDigits, dial, clockFace, floorMedallion, FONTS, buildSign, drawSign, litSequence, makeCam, dino, SPECIES, soldier };
