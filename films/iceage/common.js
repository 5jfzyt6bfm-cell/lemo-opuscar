// Shared pieces for the Ice Age film: the steppe world, the predator ladder, the versus card, plaques, subtitles.
import { C, TAU, clamp, lerp, seg, ss, eio, eo, ei, back, mix, rgba, gline, airbrush, toPath, sunburst, fan, glow, sparkle, vignette, arcPts, stepArchPts, hash, mulberry } from './engine/deco.js';
import { goldText, titleBar, decoDigits, dial, subtitleCard, measure, FONTS } from './engine/type.js';
import { makeCam } from './engine/cam.js';
import { mammal, SP } from './mammals.js';
import { person, walker, face, expr, YOU, ICE } from './people.js';

export const W = 1920, H = 1080;
globalThis.__VIG = .45;
export const tw = t => Math.floor(t * 12) / 12;
export const mech = u => { u = clamp(u); const e = eio(Math.min(1, u * 1.12)); return e + (u > .89 ? Math.sin((u - .89) / .11 * Math.PI) * .025 : 0); };
export function bg(g, top = '#1f5560', bot = '#0c2a30') { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
export function stage(g, t, { top = '#1f5560', bot = '#0c2a30', cy = 900, floor = true, rays = true } = {}) {
  bg(g, top, bot);
  if (rays) sunburst(g, 960, cy, { rays: 56, r0: 0, r1: 1800, a0: Math.PI, a1: TAU, mode: 'both', w: 1, alpha: .5, colorA: 'rgba(243,217,139,.07)', rot: t * .003 });
  if (floor) { const gr = g.createLinearGradient(0, cy, 0, H); gr.addColorStop(0, rgba('#0a1c20', .5)); gr.addColorStop(1, rgba('#04100f', .8)); g.fillStyle = gr; g.fillRect(0, cy, W, H - cy); gline(g, [[0, cy], [W, cy]], { w: 2 }); }
}
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

// ---------- the Ice Age steppe (pinhole camera) ----------
const R0 = mulberry(41);
const FLORA = Array.from({ length: 360 }, (_, i) => { const z = 8 + Math.pow(R0(), 1.5) * 300, x = (R0() - .5) * 700, k = R0(); return { x, z, k: k < .3 ? 'spruce' : k < .42 ? 'larch' : k < .6 ? 'snow' : k < .9 ? 'grass' : 'rock', h: k < .3 ? 14 + R0() * 10 : k < .42 ? 10 + R0() * 6 : k < .6 ? 3 + R0() * 4 : k < .9 ? .6 + R0() * .4 : .8 + R0() * 1.2, seed: i }; });
function spruce(g, x, y, h, haze) {
  const base = mix('#1e6a54', '#9ec4cc', haze), dark = mix('#0b3a2c', '#7aa4ac', haze), light = mix('#5ab08a', '#d8ecef', haze);
  g.fillStyle = mix('#4a3020', '#9ec4cc', haze); g.fillRect(x - h * .02, y - h * .2, h * .04, h * .2);
  for (let i = 0; i < 5; i++) { const y0 = y - h * (.12 + i * .17), w = h * (.26 - i * .045), th = h * .3; airbrush(g, [[x, y0 - th], [x + w, y0], [x - w, y0]], { base, dark, light, dir: -2.3 }); g.fillStyle = rgba('#ffffff', .55 * (1 - haze * .5)); g.beginPath(); g.moveTo(x, y0 - th); g.lineTo(x + w * .3, y0 - th * .7); g.lineTo(x - w * .3, y0 - th * .7); g.fill(); }
}
function larch(g, x, y, h, haze) { g.fillStyle = mix('#5a3a24', '#9ec4cc', haze); g.fillRect(x - h * .015, y - h, h * .03, h); for (let i = 0; i < 7; i++) { const yy = y - h * (.3 + i * .1), w = h * (.18 - i * .02); gline(g, [[x - w, yy + h * .03], [x, yy], [x + w, yy + h * .03]], { w: Math.max(1, h * .02), color: mix('#c8a040', '#c8dce0', haze) }); } }
function grass(g, x, y, h, haze, t, seed) { for (let k = 0; k < 5; k++) { const lx = x + (k - 2) * h * .18, tip = lx + Math.sin(t * 1.5 + seed + k) * h * .15; gline(g, [[lx, y], [tip, y - h * (.7 + .3 * hash(seed + k))]], { w: Math.max(1, h * .05), color: mix(k % 2 ? '#c8b060' : '#9aa850', '#d0e0e4', haze) }); } }
export function steppe(g, t, cam, o = {}) {
  const { snow = .3, dusk = 0, night = 0, river = 0, riverW = 10, actors = [], flora = 1, sunX = -200, mist = .4, clearing = null, aurora = 0, blizzard = 0 } = o;
  const C_ = makeCam({ W, H, ...cam });
  const hz = C_.P(cam.x, 0, 5000)[1];
  const sk = g.createLinearGradient(0, 0, 0, hz);
  sk.addColorStop(0, mix(mix('#3a7cb8', '#3a2a5a', dusk), '#050a14', night)); sk.addColorStop(.6, mix(mix('#9cd0e4', '#e08a5a', dusk), '#0c1a2a', night)); sk.addColorStop(1, mix(mix('#fff0d4', '#ffc070', dusk), '#1a2a3a', night));
  g.fillStyle = sk; g.fillRect(0, 0, W, Math.max(0, hz) + 2);
  if (night > .3) for (let i = 0; i < 90; i++) sparkle(g, hash(i * 1.7) * W, hash(i * 3.3 + 1) * hz * .9, 2 + hash(i * 9.1) * 6, { alpha: (night - .3) * (.5 + .5 * Math.sin(t * 2 + i)), glow: 0 });
  if (aurora > 0) { g.save(); g.globalAlpha = aurora * .55; for (let k = 0; k < 3; k++) { const pts = []; for (let x = 0; x <= W; x += 40) pts.push([x, hz * (.25 + k * .08) + Math.sin(x * .004 + t * .3 + k) * 40]); for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i]; const gr = g.createLinearGradient(0, y, 0, y + 160); gr.addColorStop(0, rgba(k === 1 ? '#7affc8' : '#5ad8a8', .5)); gr.addColorStop(1, rgba('#5ad8a8', 0)); g.fillStyle = gr; g.fillRect(x, y, 41, 160); } } g.restore(); }
  { const [sx, sy] = C_.P(cam.x + sunX, 140 - dusk * 110, 3000); if (night < 1) { g.save(); g.globalAlpha = 1 - night; sunburst(g, sx, sy, { rays: 60, r0: 90, r1: 1500, mode: 'both', w: 1.2, alpha: .45, colorA: rgba('#fff4d2', .05), rot: t * .004 }); glow(g, sx, sy, 300, '#fff0c0', .5); g.beginPath(); g.arc(sx, sy, 70, 0, TAU); const sg = g.createRadialGradient(sx - 20, sy - 20, 0, sx, sy, 70); sg.addColorStop(0, '#fffaf0'); sg.addColorStop(1, mix('#ffd88a', '#ff9a5a', dusk)); g.fillStyle = sg; g.fill(); g.restore(); } }
  // snowy stepped mountains
  for (let i = -8; i <= 8; i++) {
    const X = i * 300 + (hash(i + 7) - .5) * 160, Z = 1600 + hash(i * 3) * 700, [px, py] = C_.P(X, 0, Z), sc = C_.scaleAt(X, 0, Z), w = (260 + hash(i * 5) * 200) * sc, h = (90 + hash(i * 9) * 120) * sc;
    if (px + w < 0 || px - w > W) continue;
    const P = [[px - w / 2, py], [px - w * .12, py - h], [px + w * .05, py - h * .92], [px + w / 2, py]];
    airbrush(g, P, { base: mix('#6a8aa8', '#1a2a3a', night), dark: mix('#3a5a78', '#0a121a', night), light: mix('#b8d0e4', '#2a3a4a', night), dir: -2.3 });
    const cap = [[px - w * .12, py - h], [px + w * .05, py - h * .92], [px + w * .16, py - h * .62], [px + w * .02, py - h * .7], [px - w * .1, py - h * .58], [px - w * .24, py - h * .66]];
    airbrush(g, cap, { base: mix('#f4f8fc', '#4a5a6a', night), dark: mix('#c8d8e8', '#2a3a4a', night), light: '#ffffff', dir: -2.3 }); gline(g, P.slice(0, 3), { w: 1.2, alpha: .6 });
  }
  const gg = g.createLinearGradient(0, hz, 0, H);
  gg.addColorStop(0, mix(mix('#d8d0a0', '#eef4f8', snow), '#16222a', night)); gg.addColorStop(1, mix(mix('#a89a58', '#c8d8e4', snow), '#0a1218', night));
  g.fillStyle = gg; g.fillRect(0, hz, W, H - hz);
  if (river) { const a = C_.P(0, 0, river), b = C_.P(0, 0, river + riverW); if (b[1] < H) { const rg = g.createLinearGradient(0, b[1], 0, a[1]); rg.addColorStop(0, mix('#8ad0e0', '#14283a', night)); rg.addColorStop(1, mix('#4aa0c0', '#0a1a2a', night)); g.fillStyle = rg; g.fillRect(0, b[1], W, Math.max(0, a[1] - b[1])); g.save(); g.globalAlpha = .5; for (let k = 0; k < 7; k++) { const yy = C_.P(0, 0, lerp(river, river + riverW, (k + .5) / 7))[1]; const pts = []; for (let xx = 0; xx <= W; xx += 60) pts.push([xx + (t * 25 * (1 + k * .2)) % 60, yy + Math.sin(xx * .02 + t + k) * 2]); gline(g, pts, { w: .9 }); } g.restore(); } }
  const items = [];
  if (flora) for (const p of FLORA) {
    if (clearing && Math.abs(p.x - clearing[0]) < clearing[2] && Math.abs(p.z - clearing[1]) < clearing[3]) continue;
    if (river && p.z > river - 1 && p.z < river + riverW + 1) continue;
    if (p.z < cam.z + 2 || (p.seed % 100) / 100 > flora) continue;
    const sc = C_.scaleAt(p.x, 0, p.z), [px, py] = C_.P(p.x, 0, p.z), hp = p.h * sc;
    if (px < -hp || px > W + hp || hp < 1.5) continue;
    const haze = clamp((p.z - 40) / 260) * .8 + night * .2;
    items.push({ z: p.z, draw: () => { if (p.k === 'spruce') spruce(g, px, py, hp, haze); else if (p.k === 'larch') larch(g, px, py, hp, haze); else if (p.k === 'grass') grass(g, px, py, hp, haze, t, p.seed); else if (p.k === 'snow') { g.beginPath(); g.ellipse(px, py, hp * 1.4, hp * .18, 0, Math.PI, TAU); g.fillStyle = mix('#ffffff', '#1a2a3a', night * .8); g.fill(); } else airbrush(g, [[px - hp, py], [px - hp * .6, py - hp * .6], [px + hp * .3, py - hp * .7], [px + hp, py]], { base: mix('#8a8a8a', '#c8d8e0', haze), dark: '#4a4a4a', light: '#d8d8d8' }); } });
  }
  for (const a of actors) items.push({ z: a.z, draw: () => a.draw(g, C_) });
  items.sort((a, b) => b.z - a.z);
  for (const it of items) it.draw();
  if (mist > 0) { const mg = g.createLinearGradient(0, hz - 200, 0, hz + 100); mg.addColorStop(0, rgba('#ffffff', 0)); mg.addColorStop(.6, rgba(mix('#f4f8fc', '#1a2a3a', night), .3 * mist)); mg.addColorStop(1, rgba('#ffffff', 0)); g.fillStyle = mg; g.fillRect(0, hz - 200, W, 300); }
  if (blizzard > 0 || snow > .5) { g.save(); const n = 120 * Math.max(blizzard, (snow - .5) * .6); for (let i = 0; i < n; i++) { const sx = ((hash(i * 2.3) * W + t * (40 + blizzard * 300) * (1 + hash(i))) % W), sy = ((hash(i * 5.1) * H + t * (60 + hash(i * 7) * 60)) % H); g.beginPath(); g.arc(sx, sy, 1.5 + hash(i * 9) * 2.5, 0, TAU); g.fillStyle = 'rgba(255,255,255,.8)'; g.fill(); } g.restore(); }
  return C_;
}
export const A = {
  m: (sp, X, Z, o = {}) => ({ z: Z, draw: (g, C_) => { const [px, py] = C_.P(X, 0, Z); mammal(g, sp, { x: px, y: py, s: C_.scaleAt(X, 0, Z), ...o }); } }),
  you: (X, Z, o = {}) => ({ z: Z, draw: (g, C_) => { const [px, py] = C_.P(X, 0, Z); const s = C_.scaleAt(X, 0, Z); o.front ? person(g, px, py, 1.75 * s, { pal: YOU, ...o }) : walker(g, { x: px, y: py, s, pal: YOU, ...o }); } }),
  ice: (X, Z, o = {}) => ({ z: Z, draw: (g, C_) => { const [px, py] = C_.P(X, 0, Z); const s = C_.scaleAt(X, 0, Z); o.front ? person(g, px, py, 1.75 * s, { pal: ICE, hairStyle: 'long', ...o }) : walker(g, { x: px, y: py, s, pal: ICE, hood: false, ...o }); } }),
  fn: (Z, f) => ({ z: Z, draw: f }),
};

// ---------- the predator ladder: a gold ziggurat, most beatable at the bottom ----------
export const LADDER = [['direwolf', 'DIRE WOLF'], ['hyena', 'CAVE HYENA'], ['smilodon', 'SMILODON'], ['homotherium', 'HOMOTHERIUM'], ['cavelion', 'CAVE LION'], ['bear', 'SHORT-FACED BEAR']];
export function ladder(g, t, { cur = -1, p = 1, hl = 1, done = -1, out = [] } = {}) {
  stage(g, t, { cy: 980 });
  const n = 6, k = eo(clamp(p));
  for (let i = 0; i < n; i++) {
    const w = 1500 - i * 200, h = 120, y = 960 - i * h, x0 = 960 - w / 2;
    const e = ss(seg(k, i * .1, .4 + i * .1)); if (e <= 0) continue;
    const isCur = i === cur, gone = out.includes(i);
    g.save(); g.globalAlpha *= e;
    const P = [[x0, y], [x0 + w, y], [x0 + w, y - h], [x0, y - h]];
    airbrush(g, P, { base: isCur ? mix('#2a4a50', '#8a6a2a', hl) : '#163a40', dark: '#0a1c20', light: isCur ? mix('#3a6a70', '#e8c070', hl) : '#2a5a60', dir: -Math.PI / 2 });
    gline(g, [...P, P[0]], { w: isCur ? 2.6 : 1.6, glow: isCur ? .6 * hl : 0 });
    const S = SP[LADDER[i][0]], sc = Math.min(105 / (S.spine.reduce((m, q) => Math.max(m, q[1] + q[2]), 0) + .3), 260 / S.len);
    const ax = x0 + 60 + (-S.spine[0][0]) * sc;
    mammal(g, LADDER[i][0], { x: ax, y: y - 8, s: sc, t, alpha: gone ? .25 : 1, tint: gone ? ['#0a1c20', .6] : (i > cur && cur >= 0 ? ['#0a1c20', .35] : null), snarl: isCur ? hl * .8 : 0 });
    goldText(g, LADDER[i][1], x0 + w - 60, y - h / 2 + 12, { size: 30, font: FONTS.sans, weight: 700, track: 6, shadow: false, align: 'right', alpha: gone ? .4 : 1 });
    if (gone) gline(g, [[x0 + 30, y - h / 2], [x0 + w - 30, y - h / 2]], { w: 2, color: '#e8735a', alpha: .8 });
    if (i < done) { g.beginPath(); g.arc(x0 + w - 30, y - h / 2, 10, 0, TAU); g.fillStyle = '#e8735a'; g.fill(); }
    g.restore();
  }
  goldText(g, 'NOT EVEN CLOSE', 960, 150, { size: 26, font: FONTS.sans, weight: 700, track: 8, shadow: false, alpha: ss(seg(k, .7, 1)) });
  goldText(g, 'MOST BEATABLE', 960, 1050, { size: 22, font: FONTS.sans, weight: 700, track: 8, shadow: false, alpha: ss(seg(k, .3, .6)) });
}

// ---------- the versus card: You vs a predator, two weight dials, a verdict ----------
export function versus(g, t, lt, { sp, kg, youKg = 75, verdict = 'NO', verdictAt = 3, exFrom = 'curious', exTo = 'scared', exAt = 1.5, sub = null } = {}) {
  stage(g, t, { top: '#2a5a66', bot: '#0e2c34', cy: 860 });
  const P = stepArchPts(480, 860, 620, 760, { steps: 3 }), Q = stepArchPts(1440, 860, 760, 760, { steps: 3 });
  for (const A_ of [P, Q]) { g.fillStyle = 'rgba(8,24,28,.55)'; g.fill(toPath(A_, true)); gline(g, A_, { w: 2.4 }); }
  const k = ss(seg(lt, exAt, exAt + .8));
  person(g, 480, 850, 520, { pal: YOU, pose: k > .5 ? 'guard' : 'fists', ex: expr(exFrom, exTo, k), look: [.6, 0], blink: Math.abs(Math.sin(t * .7)) < .05 ? 1 : 0, t });
  const S = SP[sp], h = S.spine.reduce((m, q) => Math.max(m, q[1] + q[2]), 0) + .35, tailX = -S.spine[0][0], headX = S.spine[S.spine.length - 1][0] + S.headLen, sc = Math.min(520 / h, 660 / (tailX + headX));
  mammal(g, sp, { x: 1440 - (tailX - headX) / 2 * sc, y: 850, s: sc, flip: -1, t, snarl: .5 + .5 * Math.sin(t * 1.3) ** 2, jaw: ss(seg(lt, verdictAt - .3, verdictAt)) * .6 * (1 - seg(lt, verdictAt + 1.5, verdictAt + 2.5)), look: -.5 });
  goldText(g, 'VS', 960, 560, { size: 110, font: FONTS.title, sheen: lerp(-.2, 1.2, (lt * .4) % 1) });
  // weights
  const wy = 160;
  for (const [x, kgv, lab] of [[480, youKg, 'YOU'], [1440, kg, S.name.toUpperCase()]]) { decoDigits(g, `${kgv} KG`, x, wy + 30, 54, { rules: false }); goldText(g, lab, x, wy + 70, { size: 20, font: FONTS.sans, weight: 700, track: 6, shadow: false }); }
  if (sub) goldText(g, sub, 1440, 290, { size: 22, font: FONTS.sans, weight: 700, track: 4, shadow: false });
  const vp = seg(lt, verdictAt, verdictAt + .5);
  if (vp > 0) { g.save(); g.translate(960, 300); g.rotate(-.08); g.scale(lerp(1.6, 1, eo(vp)), lerp(1.6, 1, eo(vp))); g.globalAlpha = eo(vp); g.font = `76px ${FONTS.title}`; const w_ = g.measureText(verdict).width + 80, h_ = 100; g.fillStyle = 'rgba(232,115,90,.92)'; g.fillRect(-w_ / 2, -h_ / 2, w_, h_); gline(g, [[-w_ / 2, -h_ / 2], [w_ / 2, -h_ / 2], [w_ / 2, h_ / 2], [-w_ / 2, h_ / 2], [-w_ / 2, -h_ / 2]], { w: 3 }); goldText(g, verdict, 0, 26, { size: 76, font: FONTS.title, fill: '#fff8ec', shadow: false }); g.restore(); }
}
export { goldText, titleBar, decoDigits, dial, FONTS, mammal, SP, person, walker, face, expr, YOU, ICE, makeCam };
