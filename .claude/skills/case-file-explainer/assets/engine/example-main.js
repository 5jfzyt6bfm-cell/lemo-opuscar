// "What ADHD Feels Like (for everyone else)": 60 s, Case File Explainer, for neurotypical viewers.
// One day of Sam (ADHD) across ten places; Jo (neurotypical) learns what helps.
import { clamp, lerp, seg, ss, eo, mulberry } from './lib.js';
import { W, H, canvas, rr, vgrad, mix, rgba, PAL, bean, composite, caption, stamp } from './kit.js';

const qs = new URLSearchParams(location.search);
const out = document.getElementById('c').getContext('2d');
const [sc, g] = canvas(), [gc, e] = canvas();
for (const f of ['800 58px Poppins', '700 40px Poppins', '400 100px "Archivo Black"', '700 60px "Space Mono"']) await document.fonts.load(f);
const DUR = 60;
const SHOTS = [[0, 4.2, 'wake'], [4.2, 8.4, 'start'], [8.4, 12.4, 'keys'], [12.4, 16.4, 'bus'], [16.4, 20.4, 'office'], [20.6, 25.4, 'cafe'], [25.4, 28.75, 'neon'],
  [28.75, 33.6, 'hyper'], [33.6, 37.4, 'aerial'], [37.4, 41.6, 'crowd'], [41.8, 46.0, 'park'], [46.0, 50.2, 'library'], [50.2, 54.4, 'remind'], [54.4, 60, 'evening']];
const CAP = (id, t0, t1, words) => ({ id, t0, t1, words: words.map(([w, t, key]) => ({ w, t, key })) });
const CAPS = [
  CAP('c1', .6, 4.2, [['Sam', .6, 'orange'], ['has', .85], ['ADHD.', 1.05]]),
  CAP('c2', 4.3, 8.4, [['Starting', 4.3], ['is', 4.6], ['the', 4.75], ['hardest', 4.9, 'yellow'], ['part.', 5.2]]),
  CAP('c3', 8.5, 12.4, [['Out', 8.5], ['of', 8.65], ['sight,', 8.8], ['out', 9.2], ['of', 9.35], ['mind.', 9.5, 'yellow']]),
  CAP('c4', 12.5, 16.4, [['Time', 12.5], ['slips.', 12.75, 'red'], ['Fast.', 13.3]]),
  CAP('c5', 16.5, 20.4, [['Every', 16.5], ['ping', 16.75, 'orange'], ['pulls', 17.0], ['attention.', 17.25]]),
  CAP('c6', 20.7, 25.4, [['Friends', 20.7], ['say:', 21.0], ['just', 21.3], ['focus.', 21.55, 'red']]),
  CAP('c8', 28.7, 33.6, [['But', 28.7], ['on', 28.9], ['the', 29.05], ['right', 29.2], ['task,', 29.45], ['Sam', 29.8, 'orange'], ["can't", 30.0], ['stop.', 30.2]]),
  CAP('c10', 37.5, 41.6, [['Millions', 37.5, 'yellow'], ['of', 37.8], ['people.', 37.95]]),
  CAP('c11', 41.9, 46.0, [['So', 41.9], ['ask:', 42.1], ['what', 42.4], ['helps?', 42.6, 'yellow']]),
  CAP('c12', 46.1, 50.2, [['Sometimes,', 46.1], ['just', 46.5], ['sit', 46.7, 'orange'], ['with', 46.9], ['them.', 47.1]]),
  CAP('c13', 50.3, 54.4, [['Kind', 50.3, 'yellow'], ['reminders.', 50.55], ['No', 51.1], ['shame.', 51.3]]),
];
let TX = []; const say = (id, text, x0, y0, x1, y1, o = {}) => TX.push({ id, text, x0, y0, x1, y1, ...o });
const camS = (cx, cy, z) => { for (const c of [g, e]) c.setTransform(z, 0, 0, z, W / 2 - cx * z, H / 2 - cy * z); };
const screen = () => { for (const c of [g, e]) c.setTransform(1, 0, 0, 1, 0, 0); };

// —— people ——
const RIM = { cool: '#7fb8ff', warm: '#ffc48a' };
function fig(P, temp = 'cool') {
  const L = temp === 'cool' ? { lit: '#e8eefc', shade: '#6a78a8', dir: (P.face ?? 0) >= 0 ? 1 : -1 } : { lit: '#fff2e2', shade: '#a88470', dir: (P.face ?? 0) >= 0 ? 1 : -1 };
  const Q = { thin: true, ...P, light: P.light || L }; bean(e, Q, rgba(RIM[temp], .16)); bean(g, Q); return Q;
}
const SAM = o => ({ s: 600, acc: 'cap', face: .3, eyes: .85, ...o });
const JO = o => ({ s: 600, acc: 'hair', face: -.3, eyes: .85, ...o });
const sitY = (s, seat) => seat + 42 * s / 100;
function emote(x, y, k, kind) {
  if (k <= 0) return; const s = .6 + .4 * eo(k) + .1 * Math.sin(Math.PI * clamp(k * 1.3));
  g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = clamp(k * 3);
  if (kind === 'halo') { g.strokeStyle = '#ffe9a8'; g.lineWidth = 9; g.beginPath(); g.ellipse(0, 0, 70, 18, 0, 0, 7); g.stroke(); }
  else { g.fillStyle = '#f6f1ea'; rr(g, -46, -46, 92, 82, 26); g.fill(); g.beginPath(); g.moveTo(-10, 34); g.lineTo(0, 54); g.lineTo(12, 34); g.fill();
    if (kind === 'heart') { g.fillStyle = '#ff4b6a'; g.beginPath(); g.moveTo(0, 22); g.bezierCurveTo(-40, -6, -18, -36, 0, -14); g.bezierCurveTo(18, -36, 40, -6, 0, 22); g.fill(); }
    else { g.fillStyle = '#4a4268'; g.font = '800 60px Poppins'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(kind, 0, 2); } }
  g.restore();
}
function bubble(x, y, k, text, w) { if (k <= 0) return; g.save(); g.translate(x, y); const s = .7 + .3 * eo(k); g.scale(s, s); g.globalAlpha = clamp(k * 3);
  g.fillStyle = '#ffd36a'; rr(g, -w / 2, -48, w, 84, 42); g.fill(); g.fillStyle = '#2a1a10'; g.font = '800 40px Poppins'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 0, -5); g.restore(); }
function phoneInHand(x, y, lit = .8, warm) { g.fillStyle = '#0b0918'; rr(g, x - 16, y - 28, 32, 56, 6); g.fill(); const col = warm ? '#fff0d8' : PAL.tealHot;
  g.fillStyle = mix('#1a2040', col, lit); rr(g, x - 13, y - 25, 26, 50, 4); g.fill(); e.fillStyle = rgba(warm ? '#ffd9a0' : PAL.teal, .7 * lit); rr(e, x - 13, y - 25, 26, 50, 4); e.fill(); }
function pool(x, y, r, col, a) { for (const [c, k] of [[g, a], [e, a * .5]]) { c.save(); c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(x, y, 2, x, y, r); gr.addColorStop(0, rgba(col, k)); gr.addColorStop(1, rgba(col, 0)); c.fillStyle = gr; c.fillRect(x - r, y - r, 2 * r, 2 * r); c.restore(); } }

// —— places: dark gradient walls, thin glowing line-art furniture, slow dust ——
const PAL2 = {
  cool: { wall: ['#141a3a', '#232c58'], floor: '#0e1430', line: 'rgba(150,180,255,.55)', glow: '#7fa0ff' },
  warm: { wall: ['#2a1a14', '#43291c'], floor: '#1c110c', line: 'rgba(255,190,130,.6)', glow: '#ffb070' },
  dusk: { wall: ['#2a1a3a', '#4a2a48'], floor: '#1a1024', line: 'rgba(255,180,190,.55)', glow: '#ff9aa8' },
};
function lines(c, paths) { for (const p of paths) { c.beginPath(); if (p[0] === 'r') c.strokeRect(p[1], p[2], p[3], p[4]); else if (p[0] === 'c') { c.arc(p[1], p[2], p[3], 0, 7); } else { c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); } c.stroke(); } }
function interior(temp, t, paths, o = {}) {
  const P = PAL2[temp];
  g.fillStyle = vgrad(g, -200, 1200, [[0, P.wall[0]], [1, P.wall[1]]]); g.fillRect(-1000, -600, 3920, 2280);
  g.fillStyle = P.floor; g.fillRect(-1000, 960, 3920, 600);
  if (o.window) { const [x, y, w, h, sky] = o.window; g.fillStyle = vgrad(g, y, y + h, sky === 'dawn' ? [[0, '#3a3a7a'], [1, '#f0a88a']] : sky === 'dusk' ? [[0, '#3a2a6a'], [1, '#f4a06a']] : [[0, '#0c1236'], [1, '#2a3a7a']]); g.fillRect(x, y, w, h);
    const R = mulberry(x); for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(255,255,255,${.2 + R() * .5})`; g.fillRect(x + R() * w, y + R() * h * .5, 2, 2); }
    paths = [['r', x, y, w, h], [x + w / 2, y, x + w / 2, y + h], ...paths]; }
  for (const c of [g, e]) { c.strokeStyle = c === e ? rgba(P.glow, .25) : P.line; c.lineWidth = 4; c.lineJoin = 'round'; c.lineCap = 'round'; lines(c, paths); }
  const D = mulberry(9); for (let i = 0; i < 30; i++) { const x = D() * 1920, y = ((D() * 1080 - t * (8 + D() * 14)) % 1080 + 1080) % 1080; g.fillStyle = `rgba(255,248,230,${.08 + D() * .22})`; g.beginPath(); g.arc(x, y, 1 + D() * 2, 0, 7); g.fill(); }
}
const BOOKS = (x0, y, n, seed) => { const R = mulberry(seed), p = []; let x = x0; for (let i = 0; i < n; i++) { const h = 40 + R() * 40, w = 16 + R() * 12; p.push([x, y, x, y - h, x + w, y - h, x + w, y]); x += w + 6; } return p; };

// —— type in screen space ——
function headline(list, x, t) {
  screen(); let y = 0;
  for (const L of list) { const k = seg(t, L.at, L.at + .18); const hgt = L.big ? 300 : 70; if (k <= 0) { y += hgt; continue; } out.save(); out.globalAlpha = k;
    if (L.big) { const s = .85 + .15 * eo(k); out.translate(x, 160 + y + 120); out.scale(s, s); out.font = '400 260px "Archivo Black"'; out.textBaseline = 'middle';
      const gr = out.createLinearGradient(0, -120, 0, 120); gr.addColorStop(0, '#fff2c0'); gr.addColorStop(1, '#ffb43a'); out.shadowColor = 'rgba(255,180,60,.6)'; out.shadowBlur = 40; out.fillStyle = gr; out.fillText(L.text, 0, 0); }
    else { out.font = '700 54px Poppins'; out.fillStyle = '#fff'; out.shadowColor = 'rgba(0,0,0,.7)'; out.shadowBlur = 16; out.textBaseline = 'middle'; out.fillText(L.text, x, 160 + y + 30); }
    out.restore(); y += hgt; }
  if (t >= list[list.length - 1].at + .18) say('head' + list[0].text, list.map(l => l.text).join(' '), x, 150, x + 900, 160 + y);
}
function readout(text, col, a = 1) { out.save(); out.globalAlpha = a; out.font = '700 110px "Space Mono"'; out.textAlign = 'right'; out.textBaseline = 'top'; out.shadowColor = rgba(col, .8); out.shadowBlur = 30; out.fillStyle = col; out.fillText(text, 1820, 60); out.restore(); }
function neon(text, sub, t0, t) {
  const k = seg(t, t0, t0 + .12); if (k <= 0) return; const fl = .85 + .15 * Math.sin(t * 40) * Math.sin(t * 7);
  out.save(); out.font = '400 230px "Archivo Black"'; out.textAlign = 'center'; out.textBaseline = 'middle'; out.globalAlpha = k * fl;
  out.lineWidth = 7; out.strokeStyle = '#ff5a6a'; out.shadowColor = 'rgba(255,60,80,.9)'; out.shadowBlur = 50; out.strokeText(text, 960, 460); out.shadowBlur = 20; out.strokeText(text, 960, 460);
  out.fillStyle = 'rgba(255,90,100,.12)'; out.fillText(text, 960, 460); out.font = '700 56px Poppins'; out.fillStyle = '#ffd6da'; out.shadowBlur = 10; out.fillText(sub, 960, 630); out.restore();
  if (k >= 1) say('neon', text + ' ' + sub, 360, 330, 1560, 670);
}
function card(x, y, w, h, head, rows, t) {    // a floating dark glass card
  g.save(); g.translate(x, y); g.fillStyle = 'rgba(14,16,34,.86)'; rr(g, 0, 0, w, h, 26); g.fill(); g.strokeStyle = 'rgba(160,190,255,.25)'; g.lineWidth = 2; g.stroke();
  g.font = '800 26px Poppins'; g.fillStyle = '#9fb4ff'; g.textBaseline = 'middle'; g.fillText(head, 30, 40);
  for (const r of rows) { const k = eo(seg(t, r.at, r.at + .25)); if (k <= 0) continue; g.globalAlpha = k; g.font = '700 34px Poppins'; const tw = g.measureText(r.text).width + 44;
    const bx = r.me ? w - 30 - tw : 30; g.fillStyle = r.me ? '#4a7cff' : r.check ? 'rgba(255,255,255,.05)' : '#e9ecf6'; rr(g, bx, r.y - 32 + 10 * (1 - k), tw, 64, 24); g.fill();
    g.fillStyle = r.me ? '#fff' : r.check ? '#e9ecf6' : '#1a1830'; g.fillText(r.text, bx + 22, r.y + 10 * (1 - k)); g.globalAlpha = 1; }
  g.restore();
}

// —— shots ——
const SH = {
  wake(t, u) {      // the alarm says 7:00, then 7:40; Sam is awake and not up
    camS(960, 560, lerp(1.0, 1.06, ss(u)));
    interior('cool', t, [[640, 860, 640, 600], ['r', 640, 760, 900, 100], ['r', 1600, 760, 160, 200], [1620, 760, 1620, 960], [1740, 760, 1740, 960]], { window: [250, 140, 420, 300, 'dawn'] });
    g.save(); g.translate(1230, 790); g.rotate(-Math.PI / 2); const P = SAM({ x: 0, y: 0, s: 560, face: 0, eyes: .9, brow: -.3, mouth: -.2, look: .3, lookY: -.8 }); bean(g, { thin: true, ...P, light: { lit: '#e8eefc', shade: '#6a78a8', dir: 1 } }); g.restore();
    g.fillStyle = vgrad(g, 640, 860, [[0, '#3a4a8a'], [1, '#232c58']]); g.beginPath(); g.moveTo(820, 860); g.bezierCurveTo(840, 700, 1100, 660, 1300, 700); g.bezierCurveTo(1450, 720, 1520, 760, 1540, 860); g.fill();
    g.fillStyle = '#0b0918'; rr(g, 1630, 712, 100, 48, 8); g.fill();
    headline([{ text: 'Meet Sam.', at: .4 }], 140, t);
  },
  start(t, u) {     // sitting on the edge of the bed: the first task floats there
    camS(1000, 560, lerp(1.08, 1.14, ss(u)));
    interior('cool', t, [[640, 860, 640, 600], ['r', 640, 760, 900, 100], ['r', 1600, 760, 160, 200]], { window: [250, 140, 420, 300, 'dawn'] });
    fig(SAM({ x: 1000, y: sitY(600, 770), sit: true, shin: 30, face: .5, eyes: .8, brow: -.5, mouth: -.2, look: .8, lookY: -.3 }));
    const k = seg(t, 4.5, 4.8); g.save(); g.globalAlpha = k; card(1260, 300, 460, 220, 'TODAY', [{ text: '1. Get up', at: 4.6, y: 120, check: true }], t); g.restore();
    if (k >= 1) say('todo', 'TODAY 1. Get up', 1260, 300, 1720, 520);
    emote(1000, 150, seg(t, 6.2, 6.45), '…');
  },
  keys(t, u) {      // the kitchen: where are the keys? in the fridge.
    camS(1000, 560, 1.0 + .05 * ss(u)); const open = eo(seg(t, 10.4, 10.9));
    interior('warm', t, [[1000, 700, 1460, 700], ['r', 1000, 420, 460, 160], [1230, 420, 1230, 580], ['r', 200, 760, 420, 20], [240, 780, 240, 960], [580, 780, 580, 960]], { window: [240, 160, 360, 280, 'dawn'] });
    g.fillStyle = vgrad(g, 360, 960, [[0, '#5a4034'], [1, '#3a281e']]); rr(g, 1540, 360, 260, 600, 18); g.fill();
    if (open > 0) { g.fillStyle = '#fff6e0'; g.fillRect(1556, 376, 228, 568); e.fillStyle = 'rgba(255,240,210,.8)'; e.fillRect(1556, 376, 228, 568 * .6);
      for (const c of [g, e]) { c.fillStyle = c === e ? 'rgba(255,210,63,.9)' : '#ffd23f'; c.beginPath(); c.arc(1660, 560, 16, 0, 7); c.fill(); c.fillRect(1672, 554, 50, 12); }
      g.fillStyle = '#4a342a'; g.beginPath(); g.moveTo(1540, 360); g.lineTo(1540 - 200 * open, 330); g.lineTo(1540 - 200 * open, 990); g.lineTo(1540, 960); g.fill(); pool(1660, 600, 520, '#fff0d0', .3 * open); }
    const look = Math.sin(t * 2.6);
    fig(SAM({ x: lerp(700, 1300, ss(seg(t, 8.5, 10.2))), y: 960, face: open > 0 ? .7 : look * .6, eyes: 1, brow: -.4, mouth: open > .5 ? .2 : -.2, gape: open > .5 ? .3 : 0, step: t < 10.2 ? t * 7 : NaN, look: open > 0 ? .9 : look }), 'warm');
    emote(1300, 250, seg(t, 10.9, 11.15), '!');
    emote(lerp(700, 1300, ss(seg(t, 8.5, 10.2))), 250, seg(t, 8.8, 9.05) * (1 - seg(t, 10.2, 10.4)), '?');
  },
  bus(t, u) {       // the bus stop: the bus pulls away, the clock says 8:12
    camS(960, 540, 1.0 + .04 * u);
    g.fillStyle = vgrad(g, -100, 900, [[0, '#2a3a7a'], [.7, '#9a7aa8'], [1, '#f4b89a']]); g.fillRect(-600, -600, 3120, 1560);
    for (const [x, w, h] of [[-100, 380, 520], [300, 300, 640], [1300, 340, 560], [1660, 400, 480]]) { g.fillStyle = '#1e2350'; g.fillRect(x, 900 - h, w, h);
      for (const c of [g, e]) { c.strokeStyle = c === e ? 'rgba(255,200,140,.25)' : 'rgba(255,210,160,.45)'; c.lineWidth = 3; for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++) c.strokeRect(x + 30 + q * 100, 900 - h + 40 + r * 90, 60, 50); } }
    g.fillStyle = '#141838'; g.fillRect(-600, 900, 3120, 600); g.fillStyle = '#2a3060'; g.fillRect(-600, 900, 3120, 14);
    for (const c of [g, e]) { c.strokeStyle = c === e ? 'rgba(127,160,255,.25)' : 'rgba(150,180,255,.6)'; c.lineWidth = 4; lines(c, [[760, 900, 760, 560], ['r', 700, 560, 120, 70], ['r', 860, 620, 300, 280]]); }
    const bx = lerp(1000, 2600, ss(seg(t, 12.6, 15))); g.fillStyle = '#e8c060'; rr(g, bx - 380, 620, 760, 270, 30); g.fill(); g.fillStyle = '#2a3060'; for (let i = 0; i < 5; i++) { rr(g, bx - 340 + i * 140, 660, 110, 90, 10); g.fill(); }
    g.fillStyle = '#0b0918'; g.beginPath(); g.arc(bx - 240, 890, 40, 0, 7); g.arc(bx + 240, 890, 40, 0, 7); g.fill();
    fig(SAM({ x: lerp(-100, 700, ss(seg(t, 12.6, 14.4))), y: 960, face: .7, eyes: 1, brow: -.6, mouth: -.3, gape: .3, step: t * 9, lean: .15, armR: { x: .2, y: -.1 } }));
    emote(lerp(-100, 700, ss(seg(t, 12.6, 14.4))), 260, seg(t, 14.6, 14.85), '!');
  },
  office(t, u) {    // pings everywhere: the head turns to each one
    camS(1000, 540, 1.04 + .04 * ss(u));
    interior('cool', t, [['r', 1200, 120, 520, 360], [1460, 120, 1460, 480], [1200, 300, 1720, 300], [500, 740, 1500, 740], [560, 740, 560, 960], [1440, 740, 1440, 960], ['c', 1640, 640, 60], [1640, 700, 1640, 740]]);
    g.fillStyle = '#0b0918'; rr(g, 560, 470, 440, 270, 14); g.fill(); g.fillStyle = '#1a2040'; g.fillRect(576, 486, 408, 238);
    for (let i = 0; i < 7; i++) { g.fillStyle = i === 6 ? '#3a4a8a' : '#2a3460'; rr(g, 584 + i * 57, 492, 52, 24, 6); g.fill(); }
    const pings = [[16.8, 460, 300], [17.3, 1500, 560], [17.7, 380, 600], [18.1, 1300, 240], [18.5, 640, 200], [18.9, 1560, 380]];
    let tgt = 0; for (const [at, x, y] of pings) { const k = eo(seg(t, at, at + .2)); if (k <= 0) continue; tgt = (x - 1000) / 700;
      const ring = ((t - at) * 1.1) % 1; g.strokeStyle = `rgba(143,243,230,${.6 * (1 - ring)})`; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 40 + 60 * ring, 0, 7); g.stroke();
      for (const [c, gl] of [[g, false], [e, true]]) { c.save(); c.translate(x, y); c.scale(k, k); c.fillStyle = gl ? rgba(PAL.teal, .8) : PAL.tealHot; rr(c, -60, -26, 120, 52, 20); c.fill(); c.restore(); }
      g.fillStyle = '#123a44'; g.beginPath(); g.arc(x - 30, y, 10 * k, 0, 7); g.fill(); g.fillRect(x - 12, y - 4, 50 * k, 8); }
    fig(SAM({ x: 1180, y: sitY(600, 820), sit: true, shin: 26, face: lerp(-.4, clamp(tgt, -.8, .8), .9), eyes: 1, brow: -.3, look: clamp(tgt * 1.2, -1, 1), armR: { x: -.14, y: .08 }, armL: { x: -.18, y: .1 } }));
  },
  cafe(t, u) {      // Jo means well: "Just focus!"
    camS(960, 560, 1.06 + .04 * ss(u));
    interior('warm', t, [[200, 520, 1720, 520], ['r', 260, 200, 400, 220], [300, 250, 600, 250], [300, 300, 560, 300], [300, 350, 580, 350], [960, 0, 960, 140], [760, 760, 1160, 760], [960, 760, 960, 960], [880, 960, 1040, 960]], { window: [1220, 140, 520, 330, 'night'] });
    for (const x of [560, 960, 1360]) { for (const [c, gl] of [[g, false], [e, true]]) { c.fillStyle = gl ? 'rgba(255,210,140,.9)' : '#ffe2b0'; c.beginPath(); c.arc(x, 150, 16, 0, 7); c.fill(); } pool(x, 220, 260, '#ffcf8a', .14); }
    fig(SAM({ x: 760, y: sitY(600, 800), sit: true, shin: 30, face: .5, eyes: .9, brow: t > 22.4 ? -.6 : -.1, mouth: t > 22.4 ? -.3 : .1, armR: { x: .16, y: .1 } }), 'warm');
    fig(JO({ x: 1160, y: sitY(600, 800), sit: true, shin: 30, face: -.5, eyes: .9, mouth: .3, gape: t > 21.6 && t < 22.3 ? .25 : 0, armL: { x: -.16, y: .1 } }), 'warm');
    g.fillStyle = '#7a3f5a'; rr(g, 860, 716, 40, 44, 6); g.fill(); g.fillStyle = '#3a5a7a'; rr(g, 1020, 716, 40, 44, 6); g.fill();
    // speech as light, then the bubble
    const k = seg(t, 21.5, 22.2); if (k > 0 && k < 1) for (let i = 0; i < 8; i++) { const q = clamp(k * 1.4 - i * .06); if (q <= 0 || q >= 1) continue; const x = lerp(1110, 820, q), y = 420 - Math.sin(q * Math.PI) * 160;
      for (const [c, gl] of [[g, false], [e, true]]) { c.fillStyle = gl ? 'rgba(255,210,120,.9)' : '#ffe2a0'; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); } }
    bubble(960, 250, seg(t, 22.2, 22.45), 'Just focus!', 340); if (t > 22.5) say('jf', 'Just focus!', 790, 200, 1130, 290);
    if (t > 23.6) { const c = seg(t, 23.6, 23.9); g.strokeStyle = PAL.red; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(800, 215); g.lineTo(800 + 320 * c, 225); g.stroke(); }
    emote(760, 230, seg(t, 23.2, 23.45), '?');
  },
  neon(t, u) { camS(960, 560, 1.12); interior('warm', t, [[760, 760, 1160, 760]]); screen(); g.fillStyle = 'rgba(4,4,12,.72)'; g.fillRect(0, 0, W, H); },
  hyper(t, u) {     // the right task: three hours gone, still going
    camS(1000, 560, lerp(1.0, 1.12, ss(u)));
    interior('cool', t, [[400, 760, 1500, 760], [440, 760, 440, 960], [1460, 760, 1460, 960], ...BOOKS(1180, 760, 6, 3)], { window: [240, 140, 400, 280, 'night'] });
    for (const c of [g, e]) { c.strokeStyle = c === e ? 'rgba(255,200,120,.4)' : 'rgba(255,210,150,.7)'; c.lineWidth = 5; lines(c, [[560, 760, 600, 600, 700, 560]]); }
    for (const [c, gl] of [[g, false], [e, true]]) { c.fillStyle = gl ? 'rgba(255,210,140,.9)' : '#ffe2b0'; c.beginPath(); c.moveTo(670, 540); c.lineTo(740, 540); c.lineTo(720, 590); c.lineTo(690, 590); c.fill(); }
    pool(760, 700, 520, '#ffcf8a', .3);
    g.fillStyle = '#0b0918'; g.beginPath(); g.moveTo(820, 756); g.lineTo(1120, 756); g.lineTo(1090, 600); g.lineTo(850, 600); g.fill(); g.fillStyle = '#fff0d8'; g.beginPath(); g.moveTo(860, 742); g.lineTo(1080, 742); g.lineTo(1060, 612); g.lineTo(870, 612); g.fill();
    e.fillStyle = 'rgba(255,230,190,.5)'; e.fillRect(870, 612, 190, 130);
    fig(SAM({ x: 1240, y: sitY(600, 800), sit: true, shin: 26, face: -.6, eyes: 1, brow: .3, mouth: .1, lean: -.15, look: -.9, lookY: .4, armL: { x: -.2, y: .12 }, armR: { x: -.18, y: .14 } }), 'warm');
    this.after = () => { const n = Math.min(3, 1 + Math.floor((t - 29.4) / .9)); if (t >= 29.4) { for (const [c, gl] of [[out, false]]) { c.save(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '400 240px "Archivo Black"'; c.fillStyle = '#ffffff'; c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 30; c.fillText(String(n), 1560, 330); c.font = '800 60px Poppins'; c.fillText(n === 1 ? 'hour.' : 'hours.', 1560, 490); c.restore(); } say('count', 'hours.', 1400, 200, 1720, 520, { pass: true }); } };
  },
  aerial(t, u) {    // about 1 in 40 adults: one teal pin per forty homes
    screen(); g.fillStyle = vgrad(g, 0, 1080, [[0, '#04060f'], [.35, '#0e1534'], [1, '#1a2450']]); g.fillRect(0, 0, W, H);
    const tilt = lerp(1.0, 1.1, ss(u)), R = mulberry(11); let idx = 0;
    for (let r = 0; r < 26; r++) { const z = (r + 1) / 26, y = 300 + Math.pow(z, 1.7) * 820, s0 = .25 + 1.9 * Math.pow(z, 1.7), n = Math.ceil(26 / s0) + 2;
      for (let i = -n; i <= n; i++) { const x = 960 + (i + (r % 2) * .5) * 120 * s0 * tilt, s = 22 * s0; if (x < -60 || x > 1980) continue; idx++;
        g.fillStyle = '#2a3670'; g.fillRect(x - s, y - s * .8, 2 * s, s * .8); g.beginPath(); g.moveTo(x - s * 1.1, y - s * .8); g.lineTo(x, y - s * 1.6); g.lineTo(x + s * 1.1, y - s * .8); g.fill();
        if (idx % 40 === 17) { const at = 33.9 + R() * 1.6, k = eo(seg(t, at, at + .25)); if (k > 0) { const py = y - s * 1.7 - 30 * (1 - k);
          for (const [c, gl] of [[g, false], [e, true]]) { c.fillStyle = gl ? rgba(PAL.teal, .9) : PAL.teal; c.beginPath(); c.arc(x, py - s, s * .8 + 5, 0, 7); c.fill(); } } }
        else if (R() < .3) { g.fillStyle = PAL.gold; g.fillRect(x - s * .5, y - s * .55, s * .35, s * .3); } } }
    composite(out, sc, gc, { vig: .55 }); this.post = true;
    headline([{ text: 'About', at: 33.8 }, { text: '1 in 40', at: 34.0, big: true }, { text: 'adults.', at: 34.3 }], 120, t);
  },
  crowd(t, u) {     // the study counter over a crowd, one in forty lit
    screen(); g.fillStyle = vgrad(g, 0, 1080, [[0, '#0a1030'], [1, '#1c2a62']]); g.fillRect(0, 0, W, H);
    for (let i = 0; i < 5; i++) { g.save(); g.globalCompositeOperation = 'lighter'; const x = 200 + i * 380; g.fillStyle = 'rgba(140,170,255,.07)'; g.beginPath(); g.moveTo(x - 20, 0); g.lineTo(x + 20, 0); g.lineTo(x + 260, 1080); g.lineTo(x - 140, 1080); g.fill(); g.restore(); }
    const R = mulberry(7); let idx = 0;
    for (let r = 0; r < 5; r++) { const s = 150 + r * 34, y = 520 + r * 120, n = Math.floor(1920 / (s * .42)) + 1;
      for (let i = 0; i < n; i++) { const x = (i + (r % 2) * .5) * s * .42 - 20, lit = (idx++ % 40) === 23 && t > 38.0, P = { x, y, s, thin: true, face: R() - .5, eyes: .8, acc: R() < .4 ? 'hair' : R() < .5 ? 'cap' : null };
        bean(g, { ...P, light: lit ? { lit: PAL.tealHot, shade: '#3b6a78', dir: 1 } : { lit: '#9aa6d8', shade: '#3a4680', dir: 1 } }); bean(e, P, lit ? rgba(PAL.teal, .5) : '#000'); } }
    composite(out, sc, gc, { vig: .5 }); this.post = true;
    out.save(); out.font = '700 120px "Space Mono"'; out.textAlign = 'center'; out.textBaseline = 'top'; out.fillStyle = '#ffd36a'; out.shadowColor = 'rgba(255,190,60,.7)'; out.shadowBlur = 30;
    out.fillText((lerp(0, 2.6, ss(seg(t, 37.5, 38.7)))).toFixed(1) + '%', 960, 60); out.font = '700 26px "Space Mono"'; out.shadowBlur = 0; out.fillStyle = 'rgba(220,226,255,.75)'; out.fillText('ADULTS WORLDWIDE · SONG ET AL., 2021', 960, 210); out.restore();
    say('cnt', '2.6% adults worldwide', 600, 60, 1320, 250, { pass: true });
  },
  park(t, u) {      // Jo asks the better question
    camS(960, 560, 1.04 + .04 * ss(u));
    g.fillStyle = vgrad(g, -200, 900, [[0, '#3a2a6a'], [.6, '#b0607a'], [1, '#f4a06a']]); g.fillRect(-600, -600, 3120, 1560);
    for (const [x, r] of [[200, 170], [460, 120], [1560, 190], [1820, 140]]) { g.fillStyle = '#3a2440'; g.fillRect(x - 12, 700, 24, 260); g.fillStyle = '#4a2c50'; g.beginPath(); g.arc(x, 620, r, 0, 7); g.fill(); }
    g.fillStyle = '#2a1830'; g.fillRect(-600, 960, 3120, 600);
    for (const c of [g, e]) { c.strokeStyle = c === e ? 'rgba(255,170,160,.25)' : 'rgba(255,200,190,.6)'; c.lineWidth = 5; lines(c, [[640, 800, 1280, 800], [640, 740, 1280, 740], [660, 800, 660, 960], [1260, 800, 1260, 960], [1460, 960, 1460, 520]]); }
    for (const [c, gl] of [[g, false], [e, true]]) { c.fillStyle = gl ? 'rgba(255,220,150,.9)' : '#fff0c8'; c.beginPath(); c.arc(1460, 510, 16, 0, 7); c.fill(); }
    fig(SAM({ x: 820, y: sitY(600, 800), sit: true, shin: 30, face: .5, eyes: .9, mouth: .1, brow: -.1 }), 'warm');
    fig(JO({ x: 1110, y: sitY(600, 800), sit: true, shin: 30, face: -.5, eyes: .9, mouth: .3 }), 'warm');
    bubble(1110, 250, seg(t, 42.3, 42.55), 'What helps you?', 420); if (t > 42.6) say('wh', 'What helps you?', 900, 200, 1320, 290);
    emote(820, 260, seg(t, 44.2, 44.45), 'heart');
  },
  library(t, u) {   // sitting together: two lamps, two people working
    camS(960, 560, 1.06 + .05 * ss(u));
    interior('warm', t, [['r', 160, 140, 1600, 420], [160, 280, 1760, 280], [160, 420, 1760, 420], ...BOOKS(180, 280, 40, 5), ...BOOKS(200, 420, 40, 8), ...BOOKS(190, 560, 40, 13), [420, 760, 1500, 760], [460, 760, 460, 960], [1460, 760, 1460, 960]]);
    for (const x of [700, 1220]) { for (const [c, gl] of [[g, false], [e, true]]) { c.fillStyle = gl ? 'rgba(255,210,140,.9)' : '#ffe2b0'; c.beginPath(); c.moveTo(x - 40, 650); c.lineTo(x + 40, 650); c.lineTo(x + 25, 690); c.lineTo(x - 25, 690); c.fill(); } pool(x, 720, 300, '#ffcf8a', .22); }
    fig(SAM({ x: 820, y: sitY(600, 820), sit: true, shin: 26, face: .1, eyes: .8, brow: .2, look: 0, lookY: .7, armR: { x: .1, y: .12 }, armL: { x: .08, y: .13 } }), 'warm');
    fig(JO({ x: 1100, y: sitY(600, 820), sit: true, shin: 26, face: -.1, eyes: .8, look: 0, lookY: .7, armR: { x: -.08, y: .13 }, armL: { x: -.1, y: .12 } }), 'warm');
    emote(820, 280, seg(t, 48.3, 48.55), 'heart');
  },
  remind(t, u) {    // a kind reminder, answered
    camS(980, 560, 1.06);
    interior('warm', t, [[1000, 700, 1460, 700], ['r', 1000, 420, 460, 160], [1230, 420, 1230, 580]], { window: [240, 160, 360, 280, 'dawn'] });
    fig(SAM({ x: 760, y: 960, face: .4, eyes: .9, mouth: .4, look: .7, lookY: .5, armR: { x: .12, y: .14 } }), 'warm'); phoneInHand(840, 620, .8, true);
    card(1040, 230, 640, 330, 'JO', [{ text: 'Train at 8:05!', at: 50.4, y: 120 }, { text: 'Leaving in 10?', at: 50.8, y: 200 }, { text: 'On my way!', at: 51.6, y: 280, me: true }], t);
    if (t > 50.65) say('r1', 'Train at 8:05!', 1040, 300, 1680, 380); if (t > 51.05) say('r2', 'Leaving in 10?', 1040, 380, 1680, 460); if (t > 51.85) say('r3', 'On my way!', 1040, 460, 1680, 540);
  },
  evening(t, u) {   // the same bus stop at dusk: this time both catch it
    camS(960, 540, lerp(1.0, 1.08, ss(u)));
    g.fillStyle = vgrad(g, -100, 900, [[0, '#3a2a6a'], [.6, '#b0607a'], [1, '#f4a06a']]); g.fillRect(-600, -600, 3120, 1560);
    for (const [x, w, h] of [[-100, 380, 520], [300, 300, 640], [1300, 340, 560], [1660, 400, 480]]) { g.fillStyle = '#2a1a3a'; g.fillRect(x, 900 - h, w, h);
      for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++) if ((r + q + x) % 3) { g.fillStyle = PAL.gold; g.fillRect(x + 30 + q * 100, 900 - h + 40 + r * 90, 60, 50); e.fillStyle = 'rgba(255,207,122,.4)'; e.fillRect(x + 30 + q * 100, 900 - h + 40 + r * 90, 60, 50); } }
    g.fillStyle = '#1a1024'; g.fillRect(-600, 900, 3120, 600);
    const bx = lerp(-600, 1250, eo(seg(t, 54.5, 56.5))); g.fillStyle = '#e8c060'; rr(g, bx - 380, 620, 760, 270, 30); g.fill(); g.fillStyle = '#ffe9c0'; for (let i = 0; i < 5; i++) { rr(g, bx - 340 + i * 140, 660, 110, 90, 10); g.fill(); e.fillStyle = 'rgba(255,230,180,.5)'; e.fillRect(bx - 340 + i * 140, 660, 110, 90); }
    g.fillStyle = '#0b0918'; g.beginPath(); g.arc(bx - 240, 890, 40, 0, 7); g.arc(bx + 240, 890, 40, 0, 7); g.fill();
    fig(SAM({ x: 560, y: 960, face: .3, eyes: .9, mouth: .6, happy: t > 57, s: 560 }), 'warm'); fig(JO({ x: 400, y: 960, face: .4, eyes: .9, mouth: .5, happy: t > 57.3, s: 560 }), 'warm');
    emote(560, 300, seg(t, 57.2, 57.45), 'heart');
  },
};

function render(t) {
  TX = []; for (const x of [g, e]) { x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.fillStyle = '#000'; x.fillRect(0, 0, W, H); }
  const sh = SHOTS.find(s => t >= s[0] && t < s[1]); const self = { post: false, after: null };
  if (sh) SH[sh[2]].call(self, t, (t - sh[0]) / (sh[1] - sh[0]));
  const st = sh && sh[2] === 'evening' ? stamp(g, e, t, { id: 'end', text: 'DIFFERENT, NOT LESS.', t0: 55.4, t1: 60, y: 160, size: 120, c1: '#fff2c0', c2: '#ffb43a' }) : null; if (st) TX.push(st);
  if (!self.post) composite(out, sc, gc, {});
  if (self.after) self.after();
  if (!sh) { out.setTransform(1, 0, 0, 1, 0, 0); out.fillStyle = '#000'; out.fillRect(0, 0, W, H); }      // dip to black between chapters
  if (sh && sh[2] === 'neon') neon('NOT LAZY.', 'a different brain.', 25.42, t);
  if (sh && sh[2] === 'wake') { readout(t < 2.2 ? '7:00' : '7:40', '#9fc0ff', seg(t, .1, .3)); say('clk', '7:00', 1500, 60, 1820, 180, { pass: true }); }
  if (sh && sh[2] === 'bus') { readout('8:12', '#ffd36a', seg(t, 12.6, 12.8)); if (t > 12.8) say('clk2', '8:12', 1500, 60, 1820, 180); }
  if (!qs.get('nosub')) for (const S of CAPS) { const b = caption(out, t, S); if (b) TX.push(b); }
  if (t > DUR - .6) { out.setTransform(1, 0, 0, 1, 0, 0); out.fillStyle = `rgba(0,0,0,${seg(t, DUR - .6, DUR)})`; out.fillRect(0, 0, W, H); }
}
window.TEXTS = t => { render(t); return TX; };
window.EV = (() => { const ev = [], add = (type, t, o = {}) => ev.push({ type, t, ...o });
  add('act', 0, { mood: 'night', d: 20.4 }); add('act', 20.6, { mood: 'warm', d: 8 }); add('act', 28.6, { mood: 'focus', d: 5 }); add('act', 33.6, { mood: 'study', d: 8 }); add('act', 41.8, { mood: 'dawn', d: 18.2 });
  add('alarm', .2); add('alarm', 2.2); SHOTS.forEach((s, i) => i && add('cut', s[0])); add('pop', 6.2); add('steps', 8.5); add('fridge', 10.4); add('pop', 10.9); add('pop', 8.8);
  add('bus', 12.6); add('steps', 12.6); add('pop', 14.6); [16.8, 17.3, 17.7, 18.1, 18.5, 18.9].forEach(x => add('ping', x)); add('shimmer', 21.5); add('pop', 22.2); add('scratch', 23.6); add('pop', 23.2);
  add('hush', 25.2, { d: .3 }); add('neon', 25.42); [29.4, 30.3, 31.2].forEach(x => add('tick', x)); add('pins', 33.9); add('swell', 37.5); add('pop', 42.3); add('pop', 44.2); add('pop', 48.3);
  add('pingsoft', 50.4); add('pingsoft', 50.8); add('send', 51.6); add('bus', 54.5); add('stamp', 55.4); add('pop', 57.2);
  return ev.sort((a, b) => a.t - b.t); })();
window.render = render; window.DUR = DUR;
render(parseFloat(qs.get('t') ?? '3'));
window.READY = true;
