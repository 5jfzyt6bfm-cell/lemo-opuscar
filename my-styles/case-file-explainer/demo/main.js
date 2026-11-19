// "Attention That Won't Steer": 30 s demo film for the Case File Explainer style
import { clamp, lerp, seg, ss, eio, eo, mulberry } from '/core/lib.js';
import { W, H, canvas, cam, toScreen, rr, vgrad, mix, rgba, PAL, bean, composite, caption, stamp, nightTown, cork } from './kit.js';
import { DUR, T, SPOT, CAPS, shotAt } from './story.js';

const qs = new URLSearchParams(location.search);
const out = document.getElementById('c').getContext('2d');
const [sc, g] = canvas(), [gc, e] = canvas();
await document.fonts.load('800 58px Poppins'); await document.fonts.load('700 40px Poppins'); await document.fonts.load('400 100px "Archivo Black"');

const CORK = cork(1100, 600, 7);
let TX = [];
const say = (id, text, b, extra = {}) => TX.push({ id, text, x0: b[0], y0: b[1], x1: b[2], y1: b[3], ...extra });
const SCREEN = '#dcd8f7';                       // laptop light: a cool lavender, not the reserved teal

// ——————————————————————— the bedroom (wide + hyperfocus) ———————————————————————
const FLOOR = 860, SEAT = 700, MAYA_S = 480;
function moon(c, x, y, r) { c.fillStyle = '#fff3dc'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
function bedroom(t, C, mode) {
  cam([g, e], ...C);
  g.fillStyle = vgrad(g, 0, FLOOR, [[0, '#120f28'], [1, '#251c46']]); g.fillRect(-500, -500, 2900, FLOOR + 500);
  g.fillStyle = vgrad(g, FLOOR, 1300, [[0, '#211839'], [1, '#0c0919']]); g.fillRect(-500, FLOOR, 2900, 900);
  // window: the town, and a moon that crosses during the hyperfocus
  g.save(); g.beginPath(); g.rect(260, 130, 640, 400); g.clip();
  nightTown(g, e, 260, 130, 640, 400, 21, mode === 'focus' ? .6 : 1);
  const mt = mode === 'focus' ? seg(t, 10.7, 13.6) : 0, mx = lerp(380, 820, mt), my = lerp(230, 190, Math.sin(mt * Math.PI));
  moon(g, mx, my, 26); e.fillStyle = 'rgba(255,240,215,.6)'; e.beginPath(); e.arc(mx, my, 26, 0, 7); e.fill();
  g.restore();
  g.strokeStyle = '#0b0918'; g.lineWidth = 18; g.strokeRect(260, 130, 640, 400); g.fillStyle = '#0b0918'; g.fillRect(574, 130, 12, 400);
  // poster on the wall
  g.fillStyle = '#1d1638'; g.fillRect(1380, 200, 260, 330); g.fillStyle = '#c7586a'; g.beginPath(); g.arc(1510, 330, 70, 0, 7); g.fill(); g.fillStyle = '#2c2150'; g.fillRect(1420, 440, 180, 14);
  // desk
  g.fillStyle = '#1a1433'; g.fillRect(250, 626, 28, FLOOR - 626); g.fillRect(1040, 626, 28, FLOOR - 626);
  g.fillStyle = vgrad(g, 626, 800, [[0, '#2a2150'], [1, '#1c1638']]); g.fillRect(240, 626, 230, 174);
  g.fillStyle = '#3e3170'; g.fillRect(220, 600, 870, 26); g.fillStyle = '#4c3d86'; g.fillRect(220, 600, 870, 5);
  // desk clock (only the wide shot sees it)
  g.fillStyle = '#0d0a1c'; rr(g, 300, 548, 170, 52, 8); g.fill();
  g.font = '700 30px Poppins'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ff7a45'; g.fillText('9:00 PM', 385, 575);
  e.font = g.font; e.textAlign = 'center'; e.textBaseline = 'middle'; e.fillStyle = 'rgba(255,110,60,.85)'; e.fillText('9:00 PM', 385, 575);
  if (mode === 'room') say('clock', '9:00 PM', [...toScreen(305, 552, C), ...toScreen(465, 598, C)]);
  // mug of tea
  g.fillStyle = '#7a3f5a'; rr(g, 560, 548, 52, 54, 8); g.fill(); g.strokeStyle = '#7a3f5a'; g.lineWidth = 8; g.beginPath(); g.arc(616, 574, 14, -1.3, 1.3); g.stroke();
  // laptop: base + a lit screen turned toward her (dims to sleep during the hyperfocus)
  const dim = mode === 'focus' ? .15 : 1;
  // the lid faces her: we see its back, and its light spilling past the edges onto her
  e.fillStyle = rgba(SCREEN, .5 * dim); e.beginPath(); e.moveTo(1004, 590); e.lineTo(1030, 446); e.lineTo(1046, 448); e.lineTo(1022, 590); e.fill();
  g.fillStyle = '#2b2550'; g.fillRect(880, 590, 170, 10);
  g.fillStyle = vgrad(g, 440, 592, [[0, '#2e2856'], [1, '#1b1636']]); g.beginPath(); g.moveTo(900, 592); g.lineTo(930, 440); g.lineTo(1032, 446); g.lineTo(1010, 592); g.fill();
  g.fillStyle = mix('#3a3366', SCREEN, dim * .8); g.beginPath(); g.moveTo(1010, 592); g.lineTo(1032, 446); g.lineTo(1040, 447); g.lineTo(1018, 592); g.fill();
  g.fillStyle = '#3d3570'; g.beginPath(); g.arc(968, 515, 10, 0, 7); g.fill();
  if (dim > .5) { g.save(); g.globalCompositeOperation = 'lighter'; const w = g.createRadialGradient(1060, 500, 20, 1100, 480, 420); w.addColorStop(0, 'rgba(190,180,255,.22)'); w.addColorStop(1, 'rgba(190,180,255,0)'); g.fillStyle = w; g.fillRect(600, 0, 1200, 1100); g.restore(); }
  // chair back, Maya, chair seat
  g.fillStyle = '#16112c'; rr(g, 1236, 440, 26, 280, 10); g.fill();
  const P = maya(t, mode);
  bean(g, P); bean(e, P, true);
  g.fillStyle = '#1f1940'; rr(g, 1080, 700, 200, 20, 8); g.fill(); g.fillStyle = '#16112c'; g.fillRect(1170, 720, 18, FLOOR - 720);
  g.fillStyle = 'rgba(5,3,14,.4)'; g.beginPath(); g.ellipse(1170, FLOOR + 4, 140, 14, 0, 0, 7); g.fill();
  // the phone: on the desk, or in her hands, lit
  if (mode === 'room') { g.fillStyle = '#0d0b18'; rr(g, 780, 592, 66, 9, 3); g.fill(); }
  else {
    const [px, py] = P.phone;
    g.save(); g.translate(px, py); g.rotate(-.35); g.fillStyle = '#0d0b18'; rr(g, -16, -30, 32, 60, 6); g.fill(); g.fillStyle = PAL.tealHot; rr(g, -13, -26, 26, 52, 4); g.fill(); g.restore();
    e.save(); e.translate(px, py); e.rotate(-.35); e.fillStyle = rgba(PAL.teal, .95); rr(e, -13, -26, 26, 52, 4); e.fill(); e.restore();
    g.save(); g.globalCompositeOperation = 'lighter'; const w = g.createRadialGradient(px, py, 5, px, py, 380); w.addColorStop(0, 'rgba(120,240,225,.35)'); w.addColorStop(1, 'rgba(120,240,225,0)'); g.fillStyle = w; g.fillRect(px - 400, py - 400, 800, 800); g.restore();
  }
}
function armTo(P, wx, wy, side = 1) {
  const u = P.s / 100, lean = P.lean || 0;
  const sx = P.x + Math.sin(lean) * 36 * u + side * 9 * u, sy = P.y - 42 * u - Math.cos(lean) * 36 * u + 4 * u;
  return { x: (wx - sx) / P.s, y: (wy - sy) / P.s };
}
function maya(t, mode) {
  const u = MAYA_S / 100;
  const P = { x: 1150, y: SEAT + 42 * u, s: MAYA_S, sit: true, shin: 33, face: -.6 };
  if (mode === 'room') {
    P.lean = -.12; P.light = { lit: '#d6d0f2', shade: '#5b5190', dir: -1 };
    P.eyes = (t > 1.6 && t < 1.72) ? .05 : .62; P.brow = -.25; P.mouth = -.25; P.look = -.3;
    P.armR = armTo(P, 1040, 586, 1); P.armL = armTo(P, 1020, 588, -1);
    P.headY = Math.sin(t * 1.4) * .6;
  } else {
    const k = seg(t, 10.7, 13.6);
    P.lean = lerp(-.2, -.26, k); P.light = { lit: PAL.tealHot, shade: '#3b5a78', dir: -1 };
    P.eyes = .95; P.brow = .3; P.mouth = .05; P.look = -.6; P.lookY = .6;
    const head = [P.x + Math.sin(P.lean) * 50 * u, P.y - 91 * u];
    P.phone = [head[0] - 62 + Math.sin(t * 2.2) * 2, head[1] + 58];
    P.armR = armTo(P, P.phone[0] + 8, P.phone[1] + 18, 1); P.armL = armTo(P, P.phone[0] - 4, P.phone[1] + 22, -1);
  }
  return P;
}

// ——————————————————————— the essay on screen ———————————————————————
function screen(t, lt) {
  const z = 1 + .07 * ss(lt / 2.6), C = [960, 520, z];
  cam([g, e], ...C);
  g.fillStyle = '#0b0918'; g.fillRect(-200, -200, 2320, 1480);
  g.fillStyle = '#121020'; rr(g, 120, 30, 1680, 860, 34); g.fill();
  g.fillStyle = vgrad(g, 70, 850, [[0, '#cfcaee'], [1, '#a9a2d6']]); g.fillRect(170, 70, 1580, 780);
  e.fillStyle = rgba(SCREEN, .06); e.fillRect(170, 70, 1580, 780);
  g.fillStyle = 'rgba(40,30,80,.18)'; g.fillRect(588, 150, 760, 620);
  g.fillStyle = '#eeecf8'; g.fillRect(580, 140, 760, 640);
  g.fillStyle = '#2a2233'; g.font = '800 70px Poppins'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText('ESSAY', 660, 270);
  g.fillStyle = '#e8322a'; g.font = '700 40px Poppins'; g.fillText('Due 8:00 AM', 660, 330);
  if (Math.floor(lt * 2.2) % 2 === 0) { g.fillStyle = '#2a2233'; g.fillRect(662, 390, 5, 52); }
  g.fillStyle = '#8f88c0'; g.fillRect(170, 790, 1580, 60);
  g.fillStyle = '#231d3d'; g.font = '700 34px Poppins'; g.textBaseline = 'middle'; g.fillText('0 words', 220, 821);
  say('essay', 'ESSAY Due 8:00 AM', [...toScreen(655, 210, C), ...toScreen(1000, 340, C)]);
  say('words', '0 words', [...toScreen(215, 800, C), ...toScreen(360, 842, C)]);
}

// ——————————————————————— the laptop's point of view ———————————————————————
function laptop(t, lt) {
  const z = 1 + .05 * ss(lt / 2.5);
  cam([g, e], 960, 540, 1 + .02 * ss(lt / 2.5));
  g.fillStyle = vgrad(g, 0, H, [[0, '#110e26'], [1, '#1d1639']]); g.fillRect(-100, -100, W + 200, H + 200);
  g.save(); g.beginPath(); g.rect(1340, 120, 420, 300); g.clip(); nightTown(g, e, 1340, 120, 420, 300, 9, .8); g.restore();
  g.strokeStyle = '#0b0918'; g.lineWidth = 14; g.strokeRect(1340, 120, 420, 300);
  g.fillStyle = '#1d1638'; g.fillRect(200, 160, 220, 280); g.fillStyle = '#c7586a'; g.beginPath(); g.arc(310, 280, 56, 0, 7); g.fill();
  cam([g, e], 960, 540, z);
  // eyes drift: to the window, back, away again
  const look = lerp(0, -.9, ss(seg(lt, .7, .95))) + lerp(0, .9, ss(seg(lt, 1.35, 1.55))) + lerp(0, .95, ss(seg(lt, 1.95, 2.15)));
  const blink = (lt > 1.62 && lt < 1.72);
  const P = { x: 960, y: 1460, s: 1100, face: look * .12, eyes: blink ? .05 : .7, brow: -.35, mouth: -.25, look, lookY: -.1,
    light: { lit: '#e4e0fb', shade: '#4f4785', dir: .2 }, headX: look * 1.2 };
  bean(g, P); bean(e, P, true);
  g.save(); g.globalCompositeOperation = 'lighter'; const w = g.createRadialGradient(960, 600, 40, 960, 700, 900); w.addColorStop(0, 'rgba(200,190,255,.12)'); w.addColorStop(1, 'rgba(200,190,255,0)'); g.fillStyle = w; g.fillRect(0, 0, W, H); g.restore();
  // the laptop bezel frames the shot: we are the screen
  cam([g, e], 960, 540, 1);
  g.fillStyle = '#0c0a17'; g.beginPath(); g.rect(-10, -10, W + 20, H + 20); g.roundRect(70, 64, W - 140, H - 120, 26); g.fill('evenodd');
  g.fillStyle = '#1f1c33'; g.beginPath(); g.arc(960, 34, 8, 0, 7); g.fill();
}

// ——————————————————————— the phone lights up ———————————————————————
function phone(t, lt) {
  const z = 1 + .05 * ss(lt / 2.7), C = [960, 560, z];
  cam([g, e], ...C);
  g.fillStyle = vgrad(g, 0, 620, [[0, '#0d0b20'], [1, '#191433']]); g.fillRect(-200, -200, 2320, 820);
  g.fillStyle = vgrad(g, 620, 1200, [[0, '#2f2558'], [1, '#120e26']]); g.fillRect(-200, 620, 2320, 700);
  // the laptop's light, out of focus, at the left; the mug at the right
  g.fillStyle = rgba(SCREEN, .22); rr(g, -120, 180, 560, 420, 40); g.fill(); e.fillStyle = rgba(SCREEN, .18); rr(e, -120, 180, 560, 420, 40); e.fill();
  g.fillStyle = '#5a2f48'; rr(g, 1560, 420, 200, 230, 30); g.fill();
  const on = t >= T.notify ? (t - T.notify < .06 ? .5 : 1) : 0;
  // the hand comes in and lifts the phone away
  const gk = ss(seg(t, T.grab[0], T.grab[1] - .3)), lift = eio(seg(t, T.grab[1] - .3, T.grab[1] + .35));
  const px = 960 + 200 * lift, py = 730 - 620 * lift;
  if (on > 0) { g.save(); g.globalCompositeOperation = 'lighter'; const w = g.createRadialGradient(px, py, 10, px, py - 40, 760); w.addColorStop(0, `rgba(120,240,225,${.45 * on})`); w.addColorStop(1, 'rgba(120,240,225,0)'); g.fillStyle = w; g.fillRect(-200, -200, 2320, 1500); g.restore(); }
  g.save(); g.translate(px, py); g.rotate(-.08 * lift);
  g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(10, 70, 300 * (1 - lift * .6), 22, 0, 0, 7); g.fill();
  g.fillStyle = '#0d0b18'; rr(g, -260, -66, 520, 132, 26); g.fill();
  g.fillStyle = 'rgba(255,255,255,.12)'; rr(g, -256, -66, 512, 8, 4); g.fill();
  if (on > 0) { g.fillStyle = mix('#0d0b18', PAL.tealHot, on); rr(g, -244, -54, 488, 108, 18); g.fill(); }
  g.restore();
  if (on > 0) {
    e.save(); e.translate(px, py); e.rotate(-.08 * lift); e.fillStyle = rgba(PAL.teal, on); rr(e, -244, -54, 488, 108, 18); e.fill(); e.restore();
    // the notification floats up from it
    const nk = eo(seg(t, T.notify, T.notify + .3)), ny = 730 - 190 - 30 * nk, nx = 960;   // the card stays in the air when the phone is lifted
    g.save(); g.globalAlpha = nk; g.fillStyle = 'rgba(8,20,26,.5)'; rr(g, nx - 248, ny - 64, 500, 140, 28); g.fill();
    g.fillStyle = '#effffc'; rr(g, nx - 250, ny - 72, 500, 140, 28); g.fill();
    g.fillStyle = '#2f6e68'; g.font = '700 28px Poppins'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('NEW VIDEO', nx - 210, ny - 30);
    g.fillStyle = '#14303a'; g.font = '800 46px Poppins'; g.fillText('Octopus facts', nx - 210, ny + 20); g.restore();
    e.save(); e.globalAlpha = nk * .3; e.fillStyle = PAL.teal; rr(e, nx - 250, ny - 72, 500, 140, 28); e.fill(); e.restore();
    if (nk >= 1) { say('notif', 'Octopus facts', [...toScreen(nx - 220, ny - 10, C), ...toScreen(nx + 120, ny + 50, C)]); say('notif-tag', 'NEW VIDEO', [...toScreen(nx - 220, ny - 50, C), ...toScreen(nx - 40, ny - 10, C)], { pass: true }); }
  }
  if (gk > 0) {   // Maya's arm, from off the right edge: a tube with a round end, lit teal from below
    const hx = lerp(2300, px + 150, gk), hy = lerp(260, py - 20, gk);
    g.lineCap = 'round'; g.lineWidth = 120; const gr = g.createLinearGradient(0, hy - 60, 0, hy + 60); gr.addColorStop(0, '#5f86a0'); gr.addColorStop(1, PAL.tealHot); g.strokeStyle = gr;
    g.beginPath(); g.moveTo(2300, -200); g.quadraticCurveTo(hx + 220, hy - 260, hx, hy); g.stroke();
    e.lineCap = 'round'; e.lineWidth = 120; e.strokeStyle = '#000'; e.beginPath(); e.moveTo(2300, -200); e.quadraticCurveTo(hx + 220, hy - 260, hx, hy); e.stroke();
  }
}

// ——————————————————————— the case board ———————————————————————
const CARDS = [['ESSAY', '0 words', 'laptop'], ['OCTOPUS', '4 hrs', 'phone'], ['TEA', 'cold ×3', 'mug']];
const cardPos = i => [520 + i * 480, 600];
function photo(c, kind) {
  c.fillStyle = '#141029'; c.fillRect(-147, -182, 294, 250);
  if (kind === 'laptop') { c.fillStyle = '#2b2550'; c.fillRect(-90, 30, 180, 12); c.fillStyle = '#e9e6fb'; c.fillRect(-80, -120, 160, 140); c.fillStyle = '#fff'; c.fillRect(-40, -110, 80, 120); c.fillStyle = '#2a2233'; c.fillRect(-30, -96, 4, 16); }
  if (kind === 'phone') { c.fillStyle = 'rgba(140,240,225,.25)'; c.beginPath(); c.arc(0, -55, 110, 0, 7); c.fill(); c.fillStyle = '#0d0b18'; rr(c, -40, -130, 80, 150, 12); c.fill(); c.fillStyle = PAL.tealHot; rr(c, -33, -122, 66, 134, 8); c.fill(); }
  if (kind === 'mug') { c.fillStyle = '#7a3f5a'; rr(c, -55, -90, 110, 120, 14); c.fill(); c.strokeStyle = '#7a3f5a'; c.lineWidth = 14; c.beginPath(); c.arc(62, -32, 26, -1.3, 1.3); c.stroke(); c.fillStyle = '#3a1f2c'; c.fillRect(-48, -90, 96, 12); }
}
function card(c, x, y, rot, i, glowCtx) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = 'rgba(30,12,4,.45)'; rr(c, -160, -184, 330, 400, 6); c.fill();
  c.fillStyle = PAL.paper; rr(c, -165, -200, 330, 400, 6); c.fill();
  photo(c, CARDS[i][2]);
  c.fillStyle = '#9a8f86'; c.font = '700 26px Poppins'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('#' + (i + 1), -140, 104);
  c.fillStyle = '#2a2233'; c.font = '800 34px Poppins'; c.fillText(CARDS[i][0], -140, 150);
  c.fillStyle = '#e8322a'; c.font = '800 46px Poppins'; c.textAlign = 'right'; c.fillText(CARDS[i][1], 145, 108);
  c.restore();
  if (CARDS[i][2] === 'phone') { glowCtx.save(); glowCtx.translate(x, y); glowCtx.rotate(rot); glowCtx.fillStyle = rgba(PAL.teal, .4); rr(glowCtx, -33, -122, 66, 134, 8); glowCtx.fill(); glowCtx.restore(); }
}
function pin(c, x, y) { c.fillStyle = 'rgba(30,10,4,.4)'; c.beginPath(); c.arc(x + 5, y + 7, 15, 0, 7); c.fill(); c.fillStyle = '#d8313a'; c.beginPath(); c.arc(x, y, 15, 0, 7); c.fill(); c.fillStyle = 'rgba(255,220,210,.7)'; c.beginPath(); c.arc(x - 5, y - 5, 5, 0, 7); c.fill(); }
function board(t) {
  const k = eio(seg(t, 13.6, 15.4)), hit = t - T.stamp;
  const shake = hit > 0 && hit < .12 ? Math.sin(hit * 160) * 8 * (1 - hit / .12) : 0;
  const C = [lerp(700, 1000, k) + shake, 560, lerp(1.25, .92, k) * (1 + .04 * ss(seg(t, T.stamp, 19.2)))];
  cam([g, e], ...C);
  g.drawImage(CORK, -300, -300, 2600, 1700);
  g.save(); g.globalCompositeOperation = 'lighter';
  const lamp = g.createRadialGradient(1000, 420, 50, 1000, 520, 1100); lamp.addColorStop(0, 'rgba(255,170,90,.22)'); lamp.addColorStop(1, 'rgba(255,170,90,0)');
  g.fillStyle = lamp; g.fillRect(-300, -300, 2600, 1700); g.restore();
  g.save(); g.translate(1000, 170); g.rotate(-.015); g.fillStyle = 'rgba(30,12,4,.4)'; g.fillRect(-326, -36, 660, 92);
  g.fillStyle = PAL.paper; g.fillRect(-330, -46, 660, 92);
  g.fillStyle = '#2a2233'; g.font = '800 44px Poppins'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CASE: MAYA · ONE NIGHT', 0, 2); g.restore();
  pin(g, 1000, 132);
  say('title', 'CASE: MAYA · ONE NIGHT', [...toScreen(670, 124, C), ...toScreen(1330, 216, C)]);
  const pins = [];
  CARDS.forEach((_, i) => {
    const d = t - T.pins[i]; if (d < 0) return;
    const q = clamp(d / .22), [x, y] = cardPos(i), rot = [-.035, .03, -.02][i];
    const yy = y - 40 * (1 - eo(q)), s = 1.08 - .08 * eo(q);
    g.save(); g.translate(x, yy); g.scale(s, s); g.translate(-x, -yy); g.globalAlpha = Math.min(1, q * 2.5);
    card(g, x, yy, rot * (1 + (1 - q) * 2), i, e); g.restore();
    pin(g, x, yy - 178); pins.push([x, y - 178]);
    if (q >= 1) say('card' + i, `#${i + 1} ${CARDS[i][0]} ${CARDS[i][1]}`, [...toScreen(x - 165, y - 200, C), ...toScreen(x + 165, y + 200, C)]);
  });
  const sk = seg(t, ...T.string);
  if (sk > 0 && pins.length === 3) {
    g.strokeStyle = '#c92a33'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(...pins[0]);
    const segs = 2, upto = sk * segs;
    for (let s = 0; s < segs; s++) { const f = clamp(upto - s); if (f <= 0) break;
      const [ax, ay] = pins[s], [bx, by] = pins[s + 1], mx = (ax + bx) / 2, my = (ay + by) / 2 + 60;
      for (let j = 1; j <= 16 * f; j++) { const v = j / 16; g.lineTo((1 - v) ** 2 * ax + 2 * (1 - v) * v * mx + v * v * bx, (1 - v) ** 2 * ay + 2 * (1 - v) * v * my + v * v * by); } }
    g.stroke();
  }
  if (hit > 0) { cam([g], 960, 540, 1); g.fillStyle = `rgba(20,8,10,${.3 * ss(hit / .2)})`; g.fillRect(0, 0, W, H); }
}

// ——————————————————————— the spotlight that won't steer ———————————————————————
function spotAt(t) {
  let i = 0; while (i < SPOT.length - 2 && t >= SPOT[i + 1][0]) i++;
  const [t0, x0, y0, n0] = SPOT[i], [t1, x1, y1, n1] = SPOT[i + 1], k = eio(seg(t, t0, t1));
  return { x: lerp(x0, x1, k), y: lerp(y0, y1, k), on: k > .5 ? n1 : n0, moving: k > 0 && k < 1 };
}
function spot(t, lt) {
  const z = 1 + .06 * ss(lt / 6.6);
  cam([g, e], 960, 540, z);
  const S = spotAt(t);
  g.fillStyle = vgrad(g, 0, 700, [[0, '#0a091a'], [1, '#141230']]); g.fillRect(-200, -200, 2320, 900);
  g.save(); g.beginPath(); g.rect(160, 200, 300, 300); g.clip(); nightTown(g, e, 160, 200, 300, 300, 3, .4); g.restore();
  g.strokeStyle = '#08070f'; g.lineWidth = 12; g.strokeRect(160, 200, 300, 300);
  g.fillStyle = '#161230'; g.fillRect(1460, 170, 230, 270); g.fillStyle = '#7a3550'; g.beginPath(); g.arc(1575, 290, 60, 0, 7); g.fill();
  // Maya behind the desk: her face follows the light
  const fx = clamp((S.x - 960) / 520, -.85, .85), onPhone = S.on === 'phone' && !S.moving;
  const P = { x: 960, y: 924, s: 620, face: fx, look: fx * .8, lookY: S.y > 600 ? .6 : -.3, eyes: onPhone ? .95 : (S.on === 'essay' ? .45 : .8),
    brow: S.on === 'essay' ? -.45 : .1, mouth: onPhone ? .25 : -.2, light: { lit: '#cfc9ea', shade: '#3a3466', dir: fx >= 0 ? 1 : -1 } };
  // she grabs the beam and drags it back to the essay
  const pk = seg(t, T.pull[0] - .25, T.pull[0]) * (1 - seg(t, T.pull[1] + .2, T.pull[1] + .6));
  if (pk > 0) { const a = armTo(P, S.x + 10, S.y + 20, -1); P.armL = { x: lerp(-.02, a.x, ss(pk)), y: lerp(.33, a.y, ss(pk)) }; }
  bean(g, P); bean(e, P, true);
  g.fillStyle = vgrad(g, 700, 1080, [[0, '#2a2350'], [.08, '#1a1534'], [1, '#0d0b1d']]); g.fillRect(-200, 700, 2320, 600);
  g.fillStyle = '#3a3168'; g.fillRect(300, 694, 1320, 10);
  g.fillStyle = '#d9d4e8'; g.beginPath(); g.moveTo(560, 694); g.lineTo(720, 694); g.lineTo(740, 678); g.lineTo(580, 678); g.fill();
  g.fillStyle = '#c4bedb'; g.beginPath(); g.moveTo(566, 680); g.lineTo(716, 680); g.lineTo(734, 666); g.lineTo(584, 666); g.fill();
  const phoneLit = S.on === 'phone' && Math.hypot(S.x - 1290, S.y - 702) < 120;
  g.fillStyle = phoneLit ? PAL.tealHot : '#0d0b18'; rr(g, 1248, 684, 84, 12, 4); g.fill();
  if (phoneLit) { e.fillStyle = PAL.teal; rr(e, 1248, 684, 84, 12, 4); e.fill(); }
  // the cone from above and its pool
  const apex = [960, -220], rx = S.y > 600 ? 170 : 140, ry = S.y > 600 ? 46 : 140;
  g.save(); g.globalCompositeOperation = 'lighter';
  const cg = g.createLinearGradient(apex[0], apex[1], S.x, S.y); cg.addColorStop(0, 'rgba(255,236,200,.02)'); cg.addColorStop(1, 'rgba(255,236,200,.16)');
  g.fillStyle = cg; g.beginPath(); g.moveTo(apex[0] - 20, apex[1]); g.lineTo(apex[0] + 20, apex[1]); g.lineTo(S.x + rx, S.y); g.lineTo(S.x - rx, S.y); g.fill();
  const pg = g.createRadialGradient(S.x, S.y, 4, S.x, S.y, rx); pg.addColorStop(0, 'rgba(255,240,210,.55)'); pg.addColorStop(1, 'rgba(255,240,210,0)');
  g.fillStyle = pg; g.beginPath(); g.ellipse(S.x, S.y, rx, ry, 0, 0, 7); g.fill();
  if (phoneLit) { const tg = g.createRadialGradient(1290, 690, 4, 1290, 690, 300); tg.addColorStop(0, 'rgba(120,240,225,.4)'); tg.addColorStop(1, 'rgba(120,240,225,0)'); g.fillStyle = tg; g.fillRect(900, 300, 800, 800); }
  g.restore();
  e.fillStyle = 'rgba(255,236,200,.35)'; e.beginPath(); e.ellipse(S.x, S.y, rx * .7, ry * .7, 0, 0, 7); e.fill();
}

// ——————————————————————— 1 window in 20 ———————————————————————
const ROOMS = []; { const R = mulberry(41); for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) ROOMS.push({ i, j, r: R(), warm: R() < .42 }); }
const MAYA_ROOM = ROOMS.find(w => w.i === 1 && w.j === 3); MAYA_ROOM.warm = false;
function block(t) {
  const k = eio(seg(t, ...T.pullback)), z = lerp(5.2, 1, k) * (1 + .02 * seg(t, T.pullback[1], DUR));
  const C = [lerp(700 + 3 * 130, 960, k), lerp(220 + 150, 520, k), z];
  const par = f => cam([g, e], lerp(C[0], 960, 1 - f), lerp(C[1], 520, 1 - f), 1 + (z - 1) * f);
  par(.12);
  g.fillStyle = vgrad(g, -300, 1300, [[0, '#0e0b26'], [.5, '#2c1f55'], [.8, '#6b3366'], [1, '#c4566a']]); g.fillRect(-1000, -1000, 3920, 3080);
  const R = mulberry(5); for (let s = 0; s < 70; s++) { g.fillStyle = `rgba(255,240,235,${.2 + R() * .5})`; g.fillRect(-200 + R() * 2320, -200 + R() * 700, 2, 2); }
  moon(g, 1620, 170, 34); e.fillStyle = 'rgba(255,240,215,.6)'; e.beginPath(); e.arc(1620, 170, 34, 0, 7); e.fill();
  par(.55);
  for (const [bx, bw, top] of [[-80, 560, 470], [1380, 640, 400]]) {
    g.fillStyle = '#1a1336'; g.fillRect(bx, top, bw, 1200);
    const Q = mulberry(bx + 900); for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) if (Q() < .22) { const x = bx + 50 + c * 125, y = top + 60 + r * 120; g.fillStyle = PAL.gold; g.fillRect(x, y, 50, 64); e.fillStyle = rgba(PAL.gold, .6); e.fillRect(x, y, 50, 64); }
  }
  par(1);
  g.fillStyle = vgrad(g, 120, 1080, [[0, '#2a2050'], [1, '#1a1436']]); g.fillRect(600, 120, 720, 1200);
  g.fillStyle = '#342866'; g.fillRect(586, 110, 748, 22);
  g.fillStyle = '#120e24'; g.fillRect(600, 880, 720, 400);
  for (const w of ROOMS) {
    const cx = 700 + w.j * 130, cy = 220 + w.i * 150, x = cx - 42, y = cy - 52;
    g.fillStyle = '#0d0a1c'; g.fillRect(x, y, 84, 104);
    if (w.warm) { const lg = g.createRadialGradient(x + 42, y + 30, 4, x + 42, y + 52, 80); lg.addColorStop(0, '#ffc98a'); lg.addColorStop(1, '#a8573d'); g.fillStyle = lg; g.fillRect(x, y, 84, 104); e.fillStyle = 'rgba(255,184,107,.25)'; e.fillRect(x, y, 84, 104); }
    if (w === MAYA_ROOM) {
      g.save(); g.beginPath(); g.rect(x, y, 84, 104); g.clip();
      g.fillStyle = '#100c22'; g.fillRect(x, y, 84, 104);
      const gr = g.createRadialGradient(x + 30, y + 52, 2, x + 30, y + 52, 70); gr.addColorStop(0, PAL.tealHot); gr.addColorStop(.3, '#5fcfc4'); gr.addColorStop(1, '#143040'); g.fillStyle = gr; g.fillRect(x, y, 84, 104);
      const P = { x: x + 52, y: y + 112, s: 70, sit: true, shin: 30, face: -.6, lean: -.2, eyes: .95, look: -.6, lookY: .6, light: { lit: PAL.tealHot, shade: '#33546c', dir: -1 } };
      bean(g, P); g.fillStyle = PAL.tealHot; g.fillRect(x + 28, y + 46, 6, 10); g.restore();
      e.fillStyle = rgba(PAL.teal, .6); e.fillRect(x, y, 84, 104);
      e.save(); e.beginPath(); e.rect(x, y, 84, 104); e.clip(); bean(e, P, true); e.restore();
    }
    g.fillStyle = '#3b2e70'; g.fillRect(x - 6, y + 104, 96, 8);
  }
}

// ——————————————————————— frame ———————————————————————
function render(t) {
  TX = [];
  for (const x of [g, e]) { x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none'; }
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H); e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
  const [t0, t1, name] = shotAt(t), lt = t - t0, u = lt / (t1 - t0);
  let post = {};
  if (name === 'room') bedroom(t, [lerp(940, 880, ss(u)), lerp(540, 520, ss(u)), lerp(1.0, 1.08, ss(u))], 'room');
  else if (name === 'screen') { screen(t, lt); post = { b1: .3, b2: .25, b3: .2 }; }
  else if (name === 'laptop') laptop(t, lt);
  else if (name === 'phone') phone(t, lt);
  else if (name === 'focus') bedroom(t, [lerp(1040, 1060, u), lerp(470, 480, u), lerp(1.75, 1.92, ss(u))], 'focus');
  else if (name === 'board') { board(t); post = { vig: .62, b1: .6, b2: .5, b3: .4 }; }
  else if (name === 'spot') spot(t, lt);
  else block(t);
  // counter during the hyperfocus: hours
  if (name === 'focus') {
    const n = T.ticks.filter(x => t >= x).length;
    if (n > 0) {
      const k = clamp((t - T.ticks[n - 1]) / .14), s = 1.25 - .25 * eo(k);
      for (const [x, glow] of [[g, false], [e, true]]) {
        x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.translate(1480, 420); x.scale(s, s); x.textAlign = 'center'; x.textBaseline = 'middle';
        x.font = '400 300px "Archivo Black"'; x.fillStyle = glow ? 'rgba(255,255,255,.22)' : '#ffffff';
        if (!glow) { x.shadowColor = 'rgba(0,10,20,.6)'; x.shadowBlur = 30; x.shadowOffsetY = 10; }
        x.fillText(String(n), 0, 0); x.font = '800 64px Poppins'; x.fillText(n === 1 ? 'hour.' : 'hours.', 0, 190); x.restore();
      }
      say('count', '4 hours.', [1340, 260, 1620, 640]);
    }
  }
  const st = stamp(g, e, t, { id: 'wrong', text: 'WRONG.', t0: T.stamp, t1: 19.2, y: 470, size: 230 }); if (st) TX.push(st);
  composite(out, sc, gc, post);
  if (!qs.get('nosub')) for (const S of CAPS) { const b = caption(out, t, S); if (b) TX.push(b); }
}
window.TEXTS = t => { render(t); return TX; };

// ——————————————————————— sound events (mix.py reads events.json) ———————————————————————
function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ type, t: +t.toFixed(3), ...o });
  add('room', 0, { d: 19.2 });
  for (let k = 0; k < 6; k++) add('blink', 2.9 + k / 2.2, { v: .35 });              // the cursor, louder than it should be
  add('notify', T.notify); add('buzz', T.notify + .02); add('buzz', T.notify + .45, { v: .7 });
  add('grab', T.grab[1] - .3);
  T.ticks.forEach((t, i) => { add('tick', t); add('lapse', t - .12, { v: .25 + .05 * i }); });
  add('cut', 13.6); T.pins.forEach((t, i) => add('pin', t + .2, { v: .85 + .05 * i })); add('string', T.string[0], { d: T.string[1] - T.string[0] });
  add('hush', T.hush, { d: T.stamp - T.hush }); add('stamp', T.stamp);
  for (let i = 1; i < SPOT.length; i++) if (SPOT[i][1] !== SPOT[i - 1][1] || SPOT[i][2] !== SPOT[i - 1][2]) add('swing', SPOT[i - 1][0], { d: SPOT[i][0] - SPOT[i - 1][0], pan: (SPOT[i][1] - 960) / 960 });
  add('tug', T.pull[0]);
  add('buzz', 20.85, { v: .5 }); add('buzz', 24.85, { v: .6 });
  add('city', 25.4, { d: DUR - 25.4 });                                               // J-cut: night air before the building
  add('glow', 26.0);
  return ev.sort((a, b) => a.t - b.t);
}
window.EV = events();
window.render = render; window.DUR = DUR;
render(parseFloat(qs.get('t') ?? '6'));
window.READY = true;
