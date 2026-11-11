// "How Long Would You Last?" — 32 s, Art Deco. Picture = render(t), deterministic.
import { C, TAU, clamp, lerp, seg, ss, eio, eo, ei, back, mix, rgba, gline, airbrush, toPath, sunburst, fan, glow, sparkle, vignette, fishScale, chevrons, arcPts, stepArchPts, archFrame, hash } from './engine/deco.js';
import { goldText, titleBar, decoDigits, dial, clockFace, subtitleCard, floorMedallion, FONTS } from './engine/type.js';
import { buildSign, drawSign, litSequence } from './engine/bulbs.js';
import { makeCam } from './engine/cam.js';
import { P, traveller, sauropod, cycad, mesa, flame, shimmer, doors, stars } from './props.js';
import { T, VO, DUR, events } from './timeline.js';

export { DUR, events };
const W = 1920, H = 1080;
const tw = t => Math.floor(t * 12) / 12;           // characters on twos
const settle = (u, amp = .06) => { u = clamp(u); return eio(u) + amp * Math.sin(u * Math.PI) * Math.exp(-u * 3) * 0; };
const mech = (u) => { u = clamp(u); const e = eio(Math.min(1, u * 1.12)); return e + (u > .89 ? Math.sin((u - .89) / .11 * Math.PI) * .025 : 0); };  // firm + small settle

function bg(g, top = C.black, bot = C.ink) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, W, H);
}

// ---------- S1: the chronometer (0 – 4.0) ----------
function s1(g, t) {
  const lt = t - T.s1;
  bg(g, '#120d08', C.ink);
  const z = lerp(1, 1.14, ss(seg(lt, 0, 4)));
  g.save(); g.translate(960, 500); g.scale(z, z); g.translate(-960, -500);
  sunburst(g, 960, 500, { rays: 64, r0: 0, r1: 1500, mode: 'wedges', rot: lt * .03, colorA: 'rgba(201,162,75,.06)' });
  sunburst(g, 960, 500, { rays: 48, r0: 380, r1: 380 + 520 * eo(seg(lt, .1, 1.4)), mode: 'lines', w: 1.4, alpha: .55, rot: lt * .03 });
  // medallion draws itself on
  const dr = eo(seg(lt, 0, 1.0));
  g.save(); g.beginPath(); g.arc(960, 500, 330, 0, TAU); const fg = g.createRadialGradient(900, 420, 0, 960, 500, 330); fg.addColorStop(0, '#2a1f12'); fg.addColorStop(1, '#060504'); g.globalAlpha = dr; g.fillStyle = fg; g.fill(); g.restore();
  gline(g, arcPts(960, 500, 340, -Math.PI / 2, -Math.PI / 2 + TAU, 120), { w: 3, part: dr, glow: .4 });
  gline(g, arcPts(960, 500, 318, -Math.PI / 2, -Math.PI / 2 + TAU, 120), { w: 1.2, part: dr });
  for (let i = 0; i < 60; i++) { const a = i / 60 * TAU + lt * .02; if (i / 60 > dr) break; const big = i % 5 === 0; gline(g, [[960 + Math.cos(a) * (big ? 282 : 296), 500 + Math.sin(a) * (big ? 282 : 296)], [960 + Math.cos(a) * 308, 500 + Math.sin(a) * 308]], { w: big ? 2 : 1 }); }
  // date counter: years ago rolls 0 → 200,000,000 (exponential, locks with a bell)
  const u = seg(lt, .6, 3.1), e = u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.pow(1 - u, 3);
  const n = u >= 1 ? 2e8 : Math.round(Math.pow(10, e * 8.30103)) - 1;
  const str = Math.max(0, n).toLocaleString('en-US');
  const sh = lerp(-.2, 1.2, seg(lt, 3.1, 3.9));
  if (dr > .5) {
    const a = ss(seg(lt, .5, 1));
    goldText(g, 'YEARS AGO', 960, 395, { size: 34, font: FONTS.sans, weight: 600, track: 10, alpha: a, shadow: false });
    decoDigits(g, str, 960, 560, str.length > 9 ? 92 : 112, { sheen: sh, alpha: a });
    goldText(g, 'TIME MACHINE · MODEL 1930', 960, 680, { size: 22, font: FONTS.sans, weight: 600, track: 8, alpha: a * .8, shadow: false });
  }
  if (lt > 3.1) sparkle(g, 1180, 470, 40 * Math.sin(seg(lt, 3.1, 3.6) * Math.PI), {});
  g.restore();
  titleBar(g, 'THE MESOZOIC', 960, 150, { p: seg(lt, .3, 1.3), size: 72 });
  vignette(g, W, H, .6);
  // the leaves slide shut on the present
  const close = mech(seg(lt, 3.45, 4.0));
  if (close > 0) doors(g, 1 - close);
}

// ---------- S2: through the door (4.0 – 7.6) ----------
function mesozoicSet(g, cam, t, { night = 0, sunR = 150 } = {}) {
  const hz = cam.P(0, 0, 1e4)[1];
  // sky: lacquer black → emerald at the horizon
  const sk = g.createLinearGradient(0, 0, 0, hz); sk.addColorStop(0, mix('#0b0a08', '#05070a', night)); sk.addColorStop(.7, mix('#0f2a22', '#08140f', night)); sk.addColorStop(1, mix('#2f6b4f', '#0f2a22', night));
  g.fillStyle = sk; g.fillRect(0, 0, W, hz + 2);
  if (night > 0) stars(g, t, { n: 70, y1: hz - 80, a: night });
  // the sun (sunburst) on the axis
  const [sx, sy] = cam.P(0, 22, 400);
  if (night < 1) {
    g.save(); g.globalAlpha = 1 - night;
    sunburst(g, sx, sy, { rays: 56, r0: sunR * 1.15, r1: 1300, mode: 'both', w: 1.6, alpha: .7, colorA: 'rgba(243,217,139,.08)', rot: t * .01 });
    glow(g, sx, sy, sunR * 3, '#ffcf7a', .45);
    g.beginPath(); g.arc(sx, sy, sunR, 0, TAU); const sg = g.createRadialGradient(sx - sunR * .3, sy - sunR * .3, 0, sx, sy, sunR); sg.addColorStop(0, C.goldHi); sg.addColorStop(.5, C.gold2); sg.addColorStop(1, C.gold1); g.fillStyle = sg; g.fill();
    gline(g, arcPts(sx, sy, sunR + 10, 0, TAU, 80), { w: 2 });
    g.restore();
  }
  // ground: warm ochre-black, mode-7 gold floor lines
  const gg = g.createLinearGradient(0, hz, 0, H); gg.addColorStop(0, mix('#3a2a14', '#1a130b', night)); gg.addColorStop(1, '#0a0806'); g.fillStyle = gg; g.fillRect(0, hz, W, H - hz);
  g.save(); g.globalAlpha = .55;
  for (let x = -40; x <= 40; x += 4) { const a = cam.P(x, 0, Math.max(cam.z + .5, 1)), b = cam.P(x, 0, 300); gline(g, [[a[0], a[1]], [b[0], b[1]]], { w: x === 0 ? 1.6 : .8 }); }
  for (let z = Math.ceil(cam.z) + 1; z < 120; z += (z < 20 ? 2 : 8)) { const a = cam.P(-60, 0, z), b = cam.P(60, 0, z); gline(g, [[a[0], a[1]], [b[0], b[1]]], { w: .7, alpha: clamp(1 - z / 120) }); }
  g.restore();
  // mesas, symmetric pairs
  for (const [x, z, w, h] of [[-46, 110, 34, 16], [46, 110, 34, 16], [-24, 160, 26, 22], [24, 160, 26, 22]]) {
    const b = cam.P(x, 0, z), s = cam.scaleAt(x, 0, z);
    mesa(g, b[0], b[1], w * s, h * s, { color: mix(P.plum, '#000', night * .4) });
  }
}
function s2(g, t, lt = t - T.s2) {
  const cz = lerp(-3, 1.6, ss(seg(lt, 0, 3.6)));
  const cam = makeCam({ x: 0, y: 1.6, z: cz, f: 1100, oy: 470 });
  mesozoicSet(g, cam, t);
  // the sauropod crosses far off
  const sp = cam.P(lerp(14, 6, lt / 3.6), 0, 70), ss_ = cam.scaleAt(0, 0, 70);
  sauropod(g, sp[0], sp[1], ss_ * 9, { flip: -1, phase: tw(t) * 4 });
  // cycads frame the axis
  for (const sg of [-1, 1]) { const c = cam.P(sg * 5.5, 0, 12), s = cam.scaleAt(0, 0, 12); cycad(g, c[0], c[1], s * 3.4, { sway: Math.sin(t * 1.3 + sg) }); }
  // the traveller on the axis
  const tp = cam.P(0, 0, 7), ts = cam.scaleAt(0, 0, 7) * 1.8;
  traveller(g, tp[0], tp[1], ts, { pose: 'stand' });
  vignette(g, W, H, .5);
  doors(g, mech(seg(lt, .05, 1.25)));
}

// ---------- S3: the oxygen gauge (7.6 – 12.2) ----------
function s3(g, t) {
  const lt = t - T.s3;
  bg(g, '#0d0b09', '#050403');
  const z = lerp(1, 1.08, ss(seg(lt, 0, 4.6)));
  g.save(); g.translate(960, 560); g.scale(z, z); g.translate(-960, -560);
  sunburst(g, 960, 640, { rays: 44, r0: 0, r1: 1500, a0: Math.PI, a1: TAU, mode: 'wedges', colorA: 'rgba(63,154,127,.08)' });
  // mountain town skyline (ziggurats) behind the gauge
  for (const [x, w, h] of [[960, 900, 300], [560, 520, 200], [1360, 520, 200]]) mesa(g, x, 700, w, h, { color: '#16231f', steps: 5, rim: 1 });
  const needle = (() => {   // swings past, then settles on ≈ 2,500 m
    const u = seg(lt, .5, 2.6); const target = 2500 / 6000;
    return lerp(0, target, mech(u)) + Math.sin(seg(lt, 1.9, 3.2) * Math.PI * 3) * .03 * (1 - seg(lt, 1.9, 3.2)) * (u > .7 ? 1 : 0);
  })();
  dial(g, 960, 640, 380, needle, { labels: ['0', '1', '2', '3', '4', '5', '6'] });
  goldText(g, 'THE AIR FEELS LIKE THIS ALTITUDE · KILOMETRES', 960, 760, { size: 28, font: FONTS.sans, weight: 600, track: 6, shadow: false });
  g.restore();
  titleBar(g, 'OXYGEN', 960, 120, { p: seg(lt, 0, 1.0), size: 60, sub: '21% TODAY  ·  ABOUT 16% THEN', subSize: 30 });
  const pl = seg(lt, 1.4, 2.2);
  titleBar(g, 'A MOUNTAIN TOWN', 960, 860, { p: pl, size: 40, wings: false });
  vignette(g, W, H, .55);
}

// ---------- S4: the heat (12.2 – 16.6), low-angle tilt ----------
function s4(g, t) {
  const lt = t - T.s4;
  const tilt = ss(seg(lt, 0, 4.4));                     // camera tilts up: near layers drop faster
  const sunY = 320 + tilt * 60, hz = 720 + tilt * 120, fy = 1380 + tilt * 100;
  const sk = g.createLinearGradient(0, 0, 0, hz); sk.addColorStop(0, '#1a0f08'); sk.addColorStop(.6, '#4a2410'); sk.addColorStop(1, '#a8541e');
  g.fillStyle = sk; g.fillRect(0, 0, W, hz + 2);
  const R = 250;
  sunburst(g, 960, sunY, { rays: 72, r0: R * 1.1, r1: 1600, mode: 'both', w: 2, alpha: .9, colorA: 'rgba(255,190,90,.10)', rot: -lt * .02 });
  glow(g, 960, sunY, R * 3.2, '#ffb45a', .55);
  g.beginPath(); g.arc(960, sunY, R, 0, TAU); const sg = g.createRadialGradient(900, sunY - 60, 0, 960, sunY, R); sg.addColorStop(0, '#fff4d2'); sg.addColorStop(.55, '#f3c46b'); sg.addColorStop(1, '#c9802b'); g.fillStyle = sg; g.fill();
  gline(g, arcPts(960, sunY, R + 12, 0, TAU, 90), { w: 3, glow: .5 });
  // temperature counts up inside the sun
  const deg = Math.round(lerp(22, 40, eo(seg(lt, .4, 2.6))));
  g.save(); g.globalAlpha = .92;
  goldText(g, `${deg}°C`, 960, sunY + 62, { size: 170, font: FONTS.deco, sy: 1.25, fill: '#3a1a08', shadow: false, track: 6 });
  g.restore();
  goldText(g, 'IN THE SHADE', 960, sunY + 118, { size: 24, font: FONTS.sans, weight: 700, track: 8, fill: '#3a1a08', shadow: false });
  // cracked, dry ground
  const gg = g.createLinearGradient(0, hz, 0, H); gg.addColorStop(0, '#6a3a18'); gg.addColorStop(1, '#1a0e06'); g.fillStyle = gg; g.fillRect(0, hz, W, H - hz + 400);
  for (let i = 0; i < 26; i++) {
    const x0 = hash(i * 2.1) * W, pts = [[x0, hz + 10 + hash(i) * 40]];
    for (let k = 1; k < 6; k++) pts.push([pts[k - 1][0] + (hash(i * 7 + k) - .5) * 160, pts[k - 1][1] + 30 + hash(i * 3 + k) * 60]);
    gline(g, pts, { w: 1.4, alpha: .7 });
  }
  shimmer(g, hz - 120, hz + 60, t, .3);
  for (const sg of [-1, 1]) mesa(g, 960 + sg * 700, hz, 520, 210, { color: '#3a1d10', steps: 4 });
  // the traveller, huge, low angle, shading their eyes
  traveller(g, 960, fy, 820, { pose: 'shade', k: seg(tw(lt), .6, 1.6) });
  vignette(g, W, H, .5);
  // arch-opening wipe in from S3
  return;
}

// ---------- S5: the survival clock (16.6 – 21.0) ----------
let SIGNS = null;
function sign(text) { SIGNS = SIGNS || {}; return SIGNS[text] || (SIGNS[text] = buildSign(text, { size: 200, spacing: 18 })); }
function s5(g, t) {
  const lt = t - T.s5;
  bg(g, '#0d0b09', '#050403');
  const z = lerp(1, 1.06, ss(seg(lt, 0, 4.4)));
  g.save(); g.translate(960, 500); g.scale(z, z); g.translate(-960, -500);
  sunburst(g, 960, 360, { rays: 60, r0: 0, r1: 1500, mode: 'wedges', colorA: 'rgba(201,162,75,.05)' });
  fishScale(g, 0, 0, 260, H, 34, {}); fishScale(g, W - 260, 0, 260, H, 34, {});
  gline(g, [[262, 0], [262, H]], { w: 2 }); gline(g, [[W - 262, 0], [W - 262, H]], { w: 2 });
  // hands: still (tick) → spin through 72 hours → lock on 3 days
  const spin = mech(seg(lt, .85, 2.15));
  const hrs = 72 * spin, tick = Math.floor(seg(lt, 0, .85) * 4);
  const lock = seg(lt, 2.15, 2.6);
  clockFace(g, 960, 360, 230, { h: 12 + hrs, m: (hrs % 1) * 60, s: spin > 0 ? null : tick * 5, lit: .3 + .5 * lock });
  goldText(g, 'WITHOUT WATER', 960, 680, { size: 30, font: FONTS.sans, weight: 700, track: 10, shadow: false, alpha: ss(seg(lt, .2, .8)) });
  const sg = sign('3 DAYS'), sc = .9, x = 960 - sg.w * sc / 2;
  const L = [T.bulb1, T.bulb2, T.bulb2 + .12, T.bulb2 + .24, T.bulb2 + .36].map(v => v);
  drawSign(g, sg, x, 700, sc, { lit: litSequence(t, L, { chaseFrom: T.bulb2 + 1.0 }) });
  g.restore();
  vignette(g, W, H, .55);
}

// ---------- S6: fire (21.0 – 26.0) ----------
function camp(g, t, { cam, sx = 0 } = {}) {
  mesozoicSet(g, cam, t, { night: 1 });
  for (const sg of [-1, 1]) { const c = cam.P(sg * 6, 0, 14), s = cam.scaleAt(0, 0, 14); cycad(g, c[0], c[1], s * 3.6, { sway: Math.sin(t + sg) * .5 }); }
  // fire on the axis, pot on a gold tripod, steam
  const f = cam.P(0, 0, 6), s = cam.scaleAt(0, 0, 6);
  glow(g, f[0], f[1] - s * .3, s * 5, P.coral, .35);
  flame(g, f[0], f[1], s * .45, t);
  const pw = s * .32, py = f[1] - s * .78;
  for (const sg of [-1, 1]) gline(g, [[f[0] + sg * s * .55, f[1] + s * .05], [f[0], py - s * .35]], { w: 2.2 });
  g.beginPath(); g.moveTo(f[0] - pw, py - s * .12); g.lineTo(f[0] + pw, py - s * .12); g.quadraticCurveTo(f[0] + pw * 1.05, py + s * .22, f[0], py + s * .24); g.quadraticCurveTo(f[0] - pw * 1.05, py + s * .22, f[0] - pw, py - s * .12);
  const pot = new Path2D(); pot.moveTo(f[0] - pw, py - s * .12); pot.lineTo(f[0] + pw, py - s * .12); pot.quadraticCurveTo(f[0] + pw * 1.05, py + s * .22, f[0], py + s * .24); pot.quadraticCurveTo(f[0] - pw * 1.05, py + s * .22, f[0] - pw, py - s * .12);
  airbrush(g, pot, { base: '#2a2420', dark: '#0a0806', light: '#5a4c40', dir: -2.3, bbox: [f[0] - pw, py - s * .12, f[0] + pw, py + s * .24], rim: 2 });
  gline(g, pot, { w: 2 });
  const boil = seg(t, T.s6 + 1.2, T.s6 + 2.4);
  for (let i = 0; i < 3; i++) {
    const ph = (t * .5 + i / 3) % 1, a = boil * Math.sin(ph * Math.PI) * .8;
    const pts = []; for (let k = 0; k <= 16; k++) { const u = k / 16; pts.push([f[0] + (i - 1) * pw * .5 + Math.sin(u * 6 + t * 2 + i) * s * .08, py - s * .15 - u * s * (.6 + ph * .9)]); }
    gline(g, pts, { w: 2.4, color: C.ivory, alpha: a });
  }
  // the traveller kneels at the left of the fire (resolves to the axis via the fire)
  const tp = cam.P(-1.25, 0, 5.6), ts = cam.scaleAt(0, 0, 5.6) * 1.8;
  traveller(g, tp[0], tp[1], ts, { pose: 'kneel', k: seg(tw(t), T.s6 + .4, T.s6 + 1.2) });
}
function s6(g, t) {
  const lt = t - T.s6;
  const cam = makeCam({ x: 0, y: lerp(3.2, 1.4, ss(seg(lt, 0, 2.2))), z: lerp(-1, .4, ss(seg(lt, 0, 5))), f: 1100, oy: 520, pitch: lerp(.18, .02, ss(seg(lt, 0, 2.2))) });
  camp(g, t, { cam });
  // the sign in the sky counts up
  const texts = [['3 WEEKS', T.up1], ['3 MONTHS', T.up2], ['YEARS?', T.up3]];
  let cur = ['3 DAYS', -1]; for (const q of texts) if (t >= q[1]) cur = q;
  const sg = sign(cur[0]), sc = Math.min(.62, 1000 / sg.w), x = 960 - sg.w * sc / 2;
  const t0 = cur[1], n = sg.letters.length;
  const L = cur[1] < 0 ? sg.letters.map(() => -1) : sg.letters.map((_, i) => t0 + i * .07);
  drawSign(g, sg, x, 70, sc, { lit: litSequence(t, L, { chaseFrom: cur[0] === 'YEARS?' ? T.up3 + .7 : Infinity }), color: cur[0] === 'YEARS?' ? P.coralL : null });
  vignette(g, W, H, .5);
}

// ---------- S7: the epoch medallion (26.0 – 32.0) ----------
function s7(g, t) {
  const lt = t - T.s7;
  bg(g, '#0d0b09', '#050403');
  const k = lerp(4.2, 1, eio(seg(lt, 0, 2.4)));
  const cx = 960, cy = 440, R = 330, r0 = 92;
  g.save(); g.translate(cx, cy); g.scale(k, k); g.translate(-cx, -cy);
  sunburst(g, cx, cy, { rays: 72, r0: R * 1.08, r1: R * 3, mode: 'both', w: 1.4, alpha: .6, colorA: 'rgba(201,162,75,.06)', rot: lt * .02 });
  g.beginPath(); g.arc(cx, cy, R, 0, TAU); const fg = g.createRadialGradient(cx - 80, cy - 80, 0, cx, cy, R); fg.addColorStop(0, '#22190f'); fg.addColorStop(1, '#060504'); g.fillStyle = fg; g.fill();
  gline(g, arcPts(cx, cy, R, 0, TAU, 140), { w: 3, glow: .3 }); gline(g, arcPts(cx, cy, R - 16, 0, TAU, 140), { w: 1 });
  gline(g, arcPts(cx, cy, r0 + 10, 0, TAU, 80), { w: 2 }); gline(g, arcPts(cx, cy, r0 + 22, 0, TAU, 80), { w: 1 });
  // machine kaleidoscope: eight sauropods walk the ring
  const rot = tw(lt) * .12;
  for (let i = 0; i < 6; i++) {
    const a = rot + i * TAU / 6;
    g.save(); g.translate(cx + Math.cos(a) * 128, cy + Math.sin(a) * 128); g.rotate(a + Math.PI / 2);
    sauropod(g, 0, 0, 66, { flip: 1, phase: tw(lt) * 5 + i, base: P.plumL });
    g.restore();
  }
  // the window: you, still by the fire
  g.save(); g.beginPath(); g.arc(cx, cy, r0, 0, TAU); g.clip();
  g.fillStyle = '#05070a'; g.fillRect(cx - r0, cy - r0, r0 * 2, r0 * 2);
  g.translate(cx, cy); g.scale(.11, .11); g.translate(-960, -620);
  camp(g, t, { cam: makeCam({ x: 0, y: 1.4, z: .4, f: 1100, oy: 520, pitch: .02 }) });
  g.restore();
  g.restore();
  titleBar(g, '165,000,000 YEARS', 960, 860, { p: seg(lt, 1.0, 2.0), size: 64 });
  vignette(g, W, H, .55);
  // the leaves close; one coral bulb remains
  const close = mech(seg(lt, 4.55, 5.2));
  if (close > 0) doors(g, 1 - close);
  if (lt > 5.2) {
    const a = 1 - seg(lt, 5.5, 6.0);
    glow(g, 960, 540, 160, P.coral, .6 * a); g.beginPath(); g.arc(960, 540, 12, 0, TAU); g.fillStyle = rgba(P.coralL, a); g.fill();
  }
}

// ---------- transitions ----------
function archWipe(g, t, t0, dur, drawOld, drawNew) {
  const u = eio(seg(t, t0, t0 + dur));
  drawOld(g, t);
  if (u <= 0) return;
  const w = lerp(10, 3400, u), h = lerp(10, 2600, u);
  const pts = stepArchPts(960, 1080 + 40, w, h, { steps: 3 });
  g.save(); g.clip(toPath(pts, true)); drawNew(g, t); g.restore();
  gline(g, pts, { w: 3, glow: .6 }); gline(g, stepArchPts(960, 1080 + 40, w + 30, h + 15, { steps: 3 }), { w: 1.2 });
}

export function renderFilm(g, t) {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (t < T.s2) s1(g, t);
  else if (t < T.s3) s2(g, t);
  else if (t < T.s4) s3(g, t);
  else if (t < T.s4 + .7) archWipe(g, t, T.s4, .7, s3, s4);
  else if (t < T.s5) s4(g, t);
  else if (t < T.s6) s5(g, t);
  else if (t < T.s6 + .8) {        // crane down: the clock rises out of frame, the camp rises into it
    const u = eio(seg(t, T.s6, T.s6 + .8));
    g.save(); g.translate(0, -H * u); s5(g, t); g.restore();
    g.save(); g.translate(0, H * (1 - u)); s6(g, t); g.restore();
    gline(g, [[0, H * (1 - u)], [W, H * (1 - u)]], { w: 2.4 });
  }
  else if (t < T.s7) s6(g, t);
  else s7(g, t);
  // subtitles
  for (const v of VO) {
    const a = v.t0 - .15, b = v.t1 + .45;
    if (t >= a - .05 && t <= b + .35) subtitleCard(g, v.text, { p: seg(t, a, a + .35), out: seg(t, b, b + .3) });
  }
}

export function texts(t) {
  const out = [];
  for (const v of VO) { const a = v.t0 - .15 + .35, b = v.t1 + .45; if (t >= a && t <= b) out.push({ id: 'sub_' + v.id, text: v.text, x0: 200, y0: 945, x1: 1720, y1: 1025, pass: true }); }
  const add = (id, text, a, b, box) => { if (t >= a && t <= b) out.push({ id, text, x0: box[0], y0: box[1], x1: box[2], y1: box[3] }); };
  add('t1', 'THE MESOZOIC', T.s1 + 1.2, T.s1 + 3.45, [500, 60, 1420, 240]);
  add('t3', 'OXYGEN 21% TODAY · ABOUT 16% THEN', T.s3 + .9, T.s4, [500, 40, 1420, 200]);
  add('t3b', 'A MOUNTAIN TOWN', T.s3 + 2.1, T.s4, [600, 820, 1320, 900]);
  add('t5', 'WITHOUT WATER 3 DAYS', T.s5 + .8, T.s6, [600, 640, 1320, 900]);
  add('t7', '165,000,000 YEARS', T.s7 + 1.9, T.s7 + 4.6, [400, 780, 1520, 940]);
  return out;
}
