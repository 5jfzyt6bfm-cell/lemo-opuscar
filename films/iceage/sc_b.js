// Scenes, second half: Smilodon's hunt, healed bones, Homotherium, the cave lion and Chauvet, the bear, the turn, the coda.
import { C, TAU, clamp, lerp, seg, ss, eio, eo, ei, back, mix, rgba, gline, airbrush, toPath, sunburst, fan, glow, sparkle, vignette, arcPts, stepArchPts, hash, mulberry } from './engine/deco.js';
import { W, H, tw, mech, bg, stage, label, plaque, ruler, crossOut, steppe, A, ladder, LADDER, versus, goldText, titleBar, decoDigits, dial, FONTS, mammal, SP, person, walker, face, expr, YOU, ICE } from './common.js';
import { cub, strideOf } from './mammals.js';
import { permafrost } from './sc_a.js';

const ph = (sp, m) => m / strideOf(sp);
const blinkAt = (t, k = 0) => Math.abs(Math.sin(t * .6 + k)) < .045 ? 1 : 0;
export function weakBite(g, lt, D, t, o) {
  const m = o.marks;
  stage(g, t, { cy: 900 });
  mammal(g, 'smilodon', { x: 820, y: 900, s: 380, t, jaw: .2 + .8 * ss(seg(lt, .5, 1.5)), snarl: .6 });
  dial(g, 1560, 360, 190, lerp(.05, .32, ss(seg(lt, .8, 2.4))), { labels: ['WEAK', '', '', '', '', '', 'STRONG'] }); label(g, 'BITE FOR ITS SIZE', 1560, 460, { size: 22 });
  plaque(g, 'A FAIRLY WEAK BITE', 960, 110, { p: seg(lt, .6, 1.2), size: 28 });
  plaque(g, 'SO HOW DID IT KILL?', 960, 190, { p: seg(lt, m[0], m[0] + .6), size: 24, color: '#e8735a' });
  vignette(g, W, H, .4);
}
// the method: pin with the forelimbs first, then the bite; fragile teeth
export function pin(g, lt, D, t, o) {
  const m = o.marks;
  const cam = { x: 0, y: 1.4, z: 0, f: 1000, oy: 560 };
  const leap = ss(seg(lt, .6, 2.2)), down = ss(seg(lt, 1.8, 3));
  const actors = [A.fn(7, (g, C_) => { const [px, py] = C_.P(1.2, 0, 7), s = C_.scaleAt(0, 0, 7); g.save(); g.translate(px, py); g.rotate(down * .35); mammal(g, 'horse', { x: 0, y: 0, s, flip: -1, t, walk: 1 - down, phase: lt * 1.5, neck: -down * 20 }); g.restore(); }),
    A.fn(6.8, (g, C_) => { const X = lerp(-5, .2, leap), [px, py] = C_.P(X, 0, 6.8), s = C_.scaleAt(0, 0, 6.8); g.save(); g.translate(px, py - Math.sin(leap * Math.PI) * s * .8); g.rotate(-.25 * Math.sin(leap * Math.PI) + down * .1); mammal(g, 'smilodon', { x: 0, y: 0, s, t, walk: 1 - down, phase: lt * 1.6, snarl: 1, jaw: ss(seg(lt, m[0], m[0] + .5)) * .9, neck: down * 15 }); g.restore(); })];
  steppe(g, t, cam, { snow: .3, flora: .6, actors });
  plaque(g, '1 · PIN WITH THE FORELIMBS', 960, 110, { p: seg(lt, .3, .9) * (1 - seg(lt, m[0], m[0] + .3)), size: 26 });
  plaque(g, '2 · THEN THE CANINES', 960, 110, { p: seg(lt, m[0], m[0] + .6) * (1 - seg(lt, m[1], m[1] + .3)), size: 26 });
  plaque(g, 'DEADLY · BUT FRAGILE', 960, 110, { p: seg(lt, m[1], m[1] + .6), size: 26, color: '#e8735a' });
  vignette(g, W, H, .4);
}
// a gold-line skeleton over a ghosted cat, with healed injuries
function catSkeleton(g, sp, x, y, s, t, part = 1) {
  const S = SP[sp], P = S.spine.map(([a, b]) => [x + a * s, y - b * s]);
  mammal(g, sp, { x, y, s, t, alpha: .18, keyline: false, rim: false });
  const n = Math.max(2, Math.floor(P.length * part));
  gline(g, P.slice(0, n), { w: 3, glow: .3 });
  for (let i = 1; i < n; i++) { const [a, b] = P[i], th = S.spine[i][2] * s; gline(g, [[a, b + 4], [a, b - th * .8]], { w: 2 }); }
  for (let i = 3; i < Math.min(n, P.length - 3); i++) { const [a, b] = P[i], d = S.spine[i][3] * s; gline(g, arcPts(a + d * .1, b, d * .9, Math.PI * .35, Math.PI * .8, 8), { w: 1.6 }); }
  for (const L of [S.hind, S.fore]) { const hx = x + L.at[0] * s, hy = y - L.at[1] * s; gline(g, [[hx, hy], [hx + L.l[0] * s * .3, hy + L.l[0] * s * .9], [hx, y - L.l[2] * s], [hx + L.toe * s, y]], { w: 2.4 }); }
  return P;
}
export function healed(g, lt, D, t, o) {
  const m = o.marks;
  stage(g, t, { cy: 900 });
  const s = 380, x = 860, y = 900;
  catSkeleton(g, 'smilodon', x, y, s, t, ss(seg(lt, .2, 2)));
  const hips = [x + SP.smilodon.hind.at[0] * s, y - SP.smilodon.hind.at[1] * s];
  for (const [p, i, dx, dy] of [[hips, 0, 0, 0], [hips, 1, 80, 120], [hips, 1, 140, 280]]) { const a = seg(lt, m[i], m[i] + .4); if (a <= 0) continue; const healedK = seg(lt, m[2], m[2] + 1); glow(g, p[0] + dx, p[1] + dy, 70, mix('#e8735a', C.gold2, healedK), .7 * a); g.beginPath(); g.arc(p[0] + dx, p[1] + dy, 10, 0, TAU); g.fillStyle = mix('#e8735a', C.gold2, healedK); g.fill(); }
  plaque(g, 'DAMAGED HIPS', 960, 110, { p: seg(lt, m[0], m[0] + .6) * (1 - seg(lt, m[1], m[1] + .3)), size: 26, color: '#e8735a' });
  plaque(g, 'BROKEN BONES', 960, 110, { p: seg(lt, m[1], m[1] + .6) * (1 - seg(lt, m[2], m[2] + .3)), size: 26, color: '#e8735a' });
  plaque(g, 'HEALED · THEY SURVIVED', 960, 110, { p: seg(lt, m[2], m[2] + .6), size: 28 });
  vignette(g, W, H, .4);
}
// the debate: sharing food in a group vs scavenging alone
export function debate(g, lt, D, t, o) {
  const m = o.marks;
  stage(g, t, { cy: 880 });
  const L = stepArchPts(520, 880, 760, 640, { steps: 3 }), R = stepArchPts(1400, 880, 760, 640, { steps: 3 });
  for (const P of [L, R]) { g.fillStyle = 'rgba(8,24,28,.5)'; g.fill(toPath(P, true)); gline(g, P, { w: 2 }); }
  const pa = seg(lt, m[0] - .5, m[0] + .3), pb = seg(lt, m[1] - .3, m[1] + .5);
  g.save(); g.globalAlpha = ss(pa); mammal(g, 'smilodon', { x: 420, y: 860, s: 170, t, snarl: .1 }); mammal(g, 'smilodon', { x: 660, y: 870, s: 150, t, flip: -1, tint: ['#5a4a3a', .3], neck: -15 }); g.restore();
  g.save(); g.globalAlpha = ss(pb); mammal(g, 'smilodon', { x: 1380, y: 870, s: 170, t, neck: -18, tint: ['#5a4a3a', .3] }); g.lineCap = 'round'; g.strokeStyle = '#e0d2b2'; g.lineWidth = 12; g.beginPath(); g.moveTo(1520, 860); g.lineTo(1640, 840); g.stroke(); g.restore();
  plaque(g, 'HELPED · SHARED FOOD?', 520, 330, { p: pa, size: 22 }); plaque(g, 'SCAVENGED ALONE?', 1400, 330, { p: pb, size: 22 });
  plaque(g, 'NOT SETTLED', 960, 120, { p: seg(lt, m[2], m[2] + .6), size: 28 });
  if (lt > m[3]) plaque(g, 'NEVER JUST ONE', 960, 200, { p: seg(lt, m[3], m[3] + .6), size: 24, color: '#e8735a' });
  vignette(g, W, H, .4);
}
// Homotherium vs Smilodon: body plans compared
export function homoCompare(g, lt, D, t, o) {
  const m = o.marks;
  stage(g, t, { cy: 880 });
  mammal(g, 'smilodon', { x: 520, y: 880, s: 300, t, walk: .3, phase: lt * .3, alpha: .55, tint: ['#1f5560', .4] });
  mammal(g, 'homotherium', { x: 1360, y: 880, s: 300, t, walk: .3, phase: lt * .3 + .4, snarl: .4 });
  label(g, 'SMILODON', 520, 420, { size: 22 }); label(g, 'HOMOTHERIUM', 1360, 420, { size: 26 });
  plaque(g, 'SCIMITAR TEETH · SHORTER, BROADER', 960, 120, { p: seg(lt, m[0], m[0] + .6) * (1 - seg(lt, m[1], m[1] + .3)), size: 24 });
  plaque(g, 'LONG FRONT LEGS · SLOPING BACK', 960, 120, { p: seg(lt, m[1], m[1] + .6) * (1 - seg(lt, m[2], m[2] + .3)), size: 24 });
  if (lt > m[2]) { plaque(g, '≈ 3 WEEKS OLD · 35,000+ YEARS AGO', 960, 120, { p: seg(lt, m[2], m[2] + .6), size: 24 }); }
  vignette(g, W, H, .4);
}
// the frozen Homotherium cub in close-up: fur, paws, mouth
export function cubDetail(g, lt, D, t, o) {
  const m = o.marks;
  stage(g, t, { top: '#d8ecf4', bot: '#8ab4c8', floor: false, rays: true, cy: 1080 });
  const z = lerp(1, 1.25, ss(lt / D));
  g.save(); g.translate(960, 620); g.scale(z, z); cub(g, 0, 160, 900, { t, homo: true, color: '#3a2a1e', dark: '#120a06', frost: .4 }); g.restore();
  const marks = [['FUR', 560, 360, 0], ['PAWS', 900, 860, 1], ['MOUTH', 1500, 600, 2], ['THICK NECK', 1300, 280, 3], ['STURDY FRONT LEGS', 760, 940, 4]];
  for (const [n, x, y, i] of marks) plaque(g, n, x, y, { p: seg(lt, m[i], m[i] + .5), size: 22 });
  vignette(g, W, H, .35);
}
// a Homotherium group and a young mammoth (debated)
export function homoHunt(g, lt, D, t, o) {
  const m = o.marks;
  const cam = { x: 0, y: 1.8, z: 0, f: 1000, oy: 540 };
  const X = lerp(-8, 1, ss(seg(lt, 0, D)));
  steppe(g, t, cam, { snow: .5, flora: .5, dusk: .3, actors: [A.m('mammoth', 6, 16, { flip: -1, t, walk: .5, phase: lt * .3 }), A.m('mammoth', 4, 14, { flip: -1, t, walk: .5, phase: lt * .3 + .4, tint: ['#c0a080', .2] }),
    A.fn(13.9, (g, C_) => { const [px, py] = C_.P(4, 0, 13.9), s = C_.scaleAt(0, 0, 13.9) * .55; mammal(g, 'mammoth', { x: px, y: py, s, flip: -1, t, walk: .6, phase: lt * .5 }); }),
    A.m('homotherium', X, 10, { t, walk: 1, phase: ph('homotherium', X), snarl: .6 }), A.m('homotherium', X - 2.4, 11, { t, walk: 1, phase: ph('homotherium', X) + .4 }), A.m('homotherium', X - 1.2, 12.5, { t, walk: 1, phase: ph('homotherium', X) + .7 })] });
  plaque(g, 'HUNTED IN GROUPS?', 960, 110, { p: seg(lt, .3, .9) * (1 - seg(lt, m[0], m[0] + .3)), size: 28 });
  plaque(g, 'YOUNG MAMMOTHS? · STILL DEBATED', 960, 110, { p: seg(lt, m[0], m[0] + .6), size: 26 });
  vignette(g, W, H, .4);
}
// cave lion vs African lion; no mane
export function lionCompare(g, lt, D, t, o) {
  const m = o.marks;
  stage(g, t, { cy: 880 });
  mammal(g, 'cavelion', { x: 520, y: 880, s: 220, t, walk: .3, phase: lt * .3, tint: ['#d8a040', .25] });
  mammal(g, 'cavelion', { x: 1360, y: 880, s: 270, t, walk: .3, phase: lt * .3 + .5, snarl: .3 });
  label(g, 'AFRICAN LION · TODAY', 520, 470, { size: 20 }); label(g, 'CAVE LION', 1360, 470, { size: 26 });
  plaque(g, 'EUROPE · NORTHERN ASIA', 960, 120, { p: seg(lt, .2, .8) * (1 - seg(lt, m[0], m[0] + .3)), size: 26 });
  plaque(g, 'LARGER', 960, 120, { p: seg(lt, m[0], m[0] + .6) * (1 - seg(lt, m[1], m[1] + .3)), size: 28 });
  if (lt > m[1]) { dial(g, 1360, 300, 150, ss(seg(lt, m[1], m[1] + 1.4)) * .7, { labels: ['0', '', '', '150', '', '', '300'] }); decoDigits(g, '200+ KG', 1360, 400, 44, { rules: false }); }
  vignette(g, W, H, .4);
}
// Chauvet: torchlight, painters, lions drawn on the wall in ochre and charcoal
function cavePaintLion(g, x, y, s, part, flip = 1) {   // a lion painted in charcoal and ochre, revealed left to right as it is drawn
  if (part <= 0) return;
  const S = SP.cavelion, x0 = x + flip * S.spine[0][0] * s, x1 = x + flip * (S.spine[S.spine.length - 1][0] + S.headLen) * s, xa = Math.min(x0, x1), xb = Math.max(x0, x1);
  g.save(); g.beginPath(); g.rect(xa - 20, 0, (xb - xa + 40) * part, H); g.clip();
  g.save(); g.globalAlpha = .55; g.translate(0, s * .1); mammal(g, 'cavelion', { x, y, s, flip, tint: ['#b8562a', .9], keyline: false, rim: false }); g.restore();
  g.globalAlpha = .9; mammal(g, 'cavelion', { x, y, s, flip, tint: ['#1a1410', .88], keyline: false, rim: false, alpha: .55 });
  g.restore();
}
export function chauvet(g, lt, D, t, o) {
  const m = o.marks;
  // rock wall
  const rg = g.createRadialGradient(1100, 500, 50, 1000, 500, 1200); rg.addColorStop(0, '#d8b080'); rg.addColorStop(.5, '#8a6440'); rg.addColorStop(1, '#2a1a0e'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 18; i++) { const y = hash(i) * H; gline(g, [[0, y], [W, y + (hash(i * 3) - .5) * 200]], { w: 1, alpha: .15 }); }
  const flick = .8 + .2 * Math.sin(t * 9) * Math.sin(t * 5.3);
  glow(g, 360, 640, 900, '#ffb050', .35 * flick);
  // the lions appear as they are drawn, a group hunting
  const lions = [[820, 470, 170, 1], [1300, 430, 150, 1], [1640, 560, 130, -1], [1080, 760, 160, 1]];
  lions.forEach(([x, y, s, f], i) => cavePaintLion(g, x, y, s, ss(seg(lt, .3 + i * 1.2, 2 + i * 1.2)), f));
  // ochre hand prints
  for (let i = 0; i < 4; i++) { const a = seg(lt, m[2] + i * .2, m[2] + i * .2 + .4); if (a <= 0) continue; g.save(); g.globalAlpha = a * .7; g.translate(700 + i * 90, 820 + (i % 2) * 40); g.fillStyle = '#b8462a'; g.beginPath(); g.ellipse(0, 0, 26, 30, 0, 0, TAU); g.fill(); for (let k = 0; k < 5; k++) { g.save(); g.rotate(-.6 + k * .3); g.fillRect(-6, -70, 12, 44); g.restore(); } g.restore(); }
  // the painter, with a face, holding a torch
  person(g, 300, 1120, 900, { pal: ICE, pose: lt % 4 < 2 ? 'paint' : 'torch', ex: expr('awe', 'determined', seg(lt, m[1], m[1] + 1)), look: [.9, -.3], hairStyle: 'long', paint: true, t, blink: blinkAt(t) });
  plaque(g, 'CHAUVET CAVE · FRANCE · 30,000+ YEARS AGO', 1100, 90, { p: seg(lt, .2, .9) * (1 - seg(lt, m[0], m[0] + .3)), size: 24 });
  plaque(g, 'HUNTING · IN GROUPS', 1100, 90, { p: seg(lt, m[0], m[0] + .6) * (1 - seg(lt, m[1] + .5, m[1] + .8)), size: 26 });
  plaque(g, 'NO LARGE MANES', 1100, 90, { p: seg(lt, m[1] + .8, m[1] + 1.4) * (1 - seg(lt, m[3], m[3] + .3)), size: 26, color: '#e8735a' });
  plaque(g, 'DRAWN FROM LIFE', 1100, 90, { p: seg(lt, m[3], m[3] + .6), size: 28 });
  vignette(g, W, H, .5);
}
// the bear rears up and looks down on everything; a 3 m ruler beside You
export function bearRise(g, lt, D, t, o) {
  const m = o.marks;
  stage(g, t, { cy: 940 });
  const st = ss(seg(lt, .4, 2.2));
  const s = 230;
  mammal(g, 'bear', { x: 1180, y: 940, s, t, stand: st, snarl: .5, jaw: st * .4 });
  person(g, 600, 940, 1.75 * s, { pal: YOU, pose: 'down', ex: expr('curious', 'scared', st), look: [.6, -.8 * st], t, blink: blinkAt(t) });
  ruler(g, 1560, 940, 1560, 0, { p: 0 });
  const k = seg(lt, 1.5, 3); if (k > 0) { gline(g, [[1600, 940], [1600, 940 - 3.2 * s * eo(k)]], { w: 2.4 }); for (let i = 0; i <= 3; i++) if (i * s <= 3.2 * s * eo(k)) { gline(g, [[1585, 940 - i * s], [1615, 940 - i * s]], { w: 2 }); label(g, i + ' M', 1660, 948 - i * s, { size: 20 }); } }
  plaque(g, 'SHORT-FACED BEAR · NORTH AMERICA', 960, 90, { p: seg(lt, m[0] ?? 3, (m[0] ?? 3) + .6), size: 26 });
  vignette(g, W, H, .4);
}
// the old picture: a running super-predator (as once imagined), on the open plain
export function bearMyth(g, lt, D, t, o) {
  const m = o.marks;
  const cam = { x: 0, y: 1.6, z: 0, f: 1000, oy: 560 };
  const X = lerp(-14, 6, lt / D);
  steppe(g, t, cam, { snow: .1, flora: .4, dusk: .5, actors: [A.m('bison', X + 6, 12, { walk: 1, phase: ph('bison', X) * 1.6, t }), A.m('bear', X, 11, { walk: 1, phase: ph('bear', X) * 1.6, t, snarl: .6 })] });
  // sepia "old idea" treatment
  g.save(); g.globalCompositeOperation = 'color'; g.globalAlpha = .55; g.fillStyle = '#a07a4a'; g.fillRect(0, 0, W, H); g.restore();
  plaque(g, 'THE OLD PICTURE · A RUNNING SUPER-PREDATOR', 960, 110, { p: seg(lt, .4, 1), size: 24 });
  if (lt > m[0]) { dial(g, 1640, 330, 160, ss(seg(lt, m[0], m[0] + 1.4)) * .9, { labels: ['0', '', '', '½ T', '', '', '1 T'] }); decoDigits(g, '≈ 1 TONNE', 1640, 430, 44, { rules: false }); }
  vignette(g, W, H, .45);
}
// the new picture: chemistry, skull and teeth; meat + plants; scavenging off other predators' kills
export function bearNew(g, lt, D, t, o) {
  const m = o.marks;
  const cam = { x: 0, y: 1.6, z: 0, f: 1000, oy: 560 };
  const show = lt > m[1];
  if (!show) {
    stage(g, t, { cy: 900 });
    // a flask and a skull: chemistry
    const fx = 600, fy = 640; const F = [[fx - 50, fy - 220], [fx + 50, fy - 220], [fx + 50, fy - 120], [fx + 160, fy + 120], [fx - 160, fy + 120], [fx - 50, fy - 120]]; airbrush(g, F, { base: '#9ad8e0', dark: '#3a7a8a', light: '#ffffff' }); gline(g, [...F, F[0]], { w: 2.4 });
    g.fillStyle = 'rgba(232,115,90,.7)'; g.fillRect(fx - 150, fy + 30, 300, 90);
    for (let i = 0; i < 6; i++) { const u = (t * .5 + i / 6) % 1; g.beginPath(); g.arc(fx - 60 + i * 25, fy + 100 - u * 200, 6, 0, TAU); g.fillStyle = rgba('#ffffff', 1 - u); g.fill(); }
    mammal(g, 'bear', { x: 1300, y: 900, s: 230, t, alpha: .9 });
    const pie = seg(lt, m[0], m[0] + 1.2); if (pie > 0) { const cx = 1500, cy = 300, r = 120; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU * .5 * pie); g.fillStyle = '#e8735a'; g.fill(); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, -Math.PI / 2 + TAU * .5, -Math.PI / 2 + TAU * (.5 + .5 * pie)); g.fillStyle = '#7ab060'; g.fill(); gline(g, arcPts(cx, cy, r, 0, TAU, 60), { w: 2.4 }); label(g, 'MEAT', cx - 190, cy + 10, { size: 22 }); label(g, 'PLANTS', cx + 200, cy + 10, { size: 22 }); }
    plaque(g, 'BONE CHEMISTRY · SKULL · TEETH', 960, 100, { p: seg(lt, .3, .9), size: 24 });
  } else {
    const k = ss(seg(lt, m[1], m[1] + 3));
    steppe(g, t, cam, { snow: .2, flora: .5, actors: [A.fn(9, (g, C_) => { const [px, py] = C_.P(1, 0, 9), s = C_.scaleAt(0, 0, 9); g.fillStyle = '#6a3a2a'; g.beginPath(); g.ellipse(px, py, 1.4 * s, .3 * s, 0, 0, TAU); g.fill(); }),
      A.m('cavelion', lerp(0, 9, k), 8.5, { flip: 1, t, walk: k > 0 && k < 1 ? 1 : 0, phase: lt * 1.4, snarl: .9, ears: 1, look: -1 }), A.m('bear', lerp(-9, -1.5, ss(seg(lt, m[1], m[1] + 1.5))), 8, { t, walk: 1, phase: lt * .9, snarl: .7, stand: ss(seg(lt, m[1] + 1.4, m[1] + 2.4)) * (1 - seg(lt, m[1] + 3.5, m[1] + 4.5)) })] });
    plaque(g, 'OR A SCAVENGER THAT DROVE OTHERS OFF', 960, 110, { p: seg(lt, m[1] + .2, m[1] + .8), size: 24 });
  }
  if (lt > m[2]) plaque(g, 'THE DEBATE CONTINUES', 960, 190, { p: seg(lt, m[2], m[2] + .6), size: 26 });
  vignette(g, W, H, .4);
}
// none of them: the ladder, each step crossed in turn, and You's face falling
export function none(g, lt, D, t, o) {
  const m = o.marks;
  const out = []; [m[2], m[3], m[4], m[4], m[4], m[5]].forEach((a, i) => { if (lt > a) out.push(i); });
  ladder(g, t, { cur: -1, out });
  face(g, 260, 860, 120, { ex: expr('worried', 'sad', seg(lt, m[1], m[1] + 1.5)), look: [.6, -.5], blink: blinkAt(t), pal: YOU, hairStyle: 'hood' });
  plaque(g, 'NONE OF THEM', 960, 220, { p: seg(lt, m[1], m[1] + .6), size: 34, color: '#e8735a' });
}
// we stayed: spears, fire, a band that plans together
export function stayed(g, lt, D, t, o) {
  const m = o.marks;
  const cam = { x: 0, y: 1.6, z: 0, f: 1000, oy: 560 };
  const fire = A.fn(7.5, (g, C_) => { const [px, py] = C_.P(0, 0, 7.5), s = C_.scaleAt(0, 0, 7.5); const on = ss(seg(lt, m[2] - .2, m[2] + .5)); glow(g, px, py - s * .3, s * 4 * on, '#ffa040', .5 * on); for (let k = 0; k < 3; k++) { const wv = Math.sin(t * 9 + k) * s * .05; g.save(); g.globalAlpha = on; airbrush(g, [[px - s * .35 + k * s * .1, py], [px + wv, py - s * (.9 - k * .2)], [px + s * .35 - k * s * .1, py]], { base: k ? '#ffd890' : '#ff8a3a', dark: '#c84a1a', light: '#fff4d0' }); g.restore(); } });
  const band = [A.ice(-2.6, 8.4, { front: true, pose: 'spear', ex: expr('determined'), look: [.5, 0], t, blink: blinkAt(t, 1), beard: true }), A.ice(-1.2, 8.8, { front: true, pose: lt > m[1] ? 'spear' : 'down', ex: expr('neutral', 'smile', seg(lt, m[3], m[3] + 1)), look: [.3, 0], t, blink: blinkAt(t, 2) }),
    A.ice(1.3, 8.6, { front: true, pose: 'torch', ex: expr('smile'), look: [-.4, 0], t, blink: blinkAt(t, 4) }), A.ice(2.8, 9.2, { front: true, pose: 'down', ex: expr('curious', 'smile', seg(lt, m[3], m[3] + 1)), look: [-.6, 0], t, blink: blinkAt(t, 5), hairStyle: 'long' }), fire];
  steppe(g, t, cam, { snow: .4, dusk: .6, flora: .6, actors: band });
  plaque(g, 'WE STAYED', 960, 110, { p: seg(lt, m[0], m[0] + .5) * (1 - seg(lt, m[1], m[1] + .3)), size: 34 });
  const steps = [['SPEARS', m[1]], ['FIRE', m[2]], ['PLANNING · COOPERATION · KNOWLEDGE', m[3]]];
  steps.forEach(([n, a], i) => plaque(g, n, 960, 110 + (i === 2 ? 0 : 0), { p: seg(lt, a, a + .5) * (i < 2 ? 1 - seg(lt, steps[i + 1][1], steps[i + 1][1] + .3) : 1), size: i === 2 ? 24 : 32 }));
  vignette(g, W, H, .4);
}
// they disappeared: the predators fade off the ladder one by one
export function vanish(g, lt, D, t, o) {
  const m = o.marks, out = [];
  [m[0], m[1], m[2] + .4, m[2] + .9, m[2] + 1.4, m[2] + 1.9].forEach((a, i) => { if (lt > a) out.push([0, 2, 3, 4, 1, 5][i]); });
  ladder(g, t, { cur: -1, out });
  plaque(g, 'DISAPPEARED', 960, 220, { p: seg(lt, m[0], m[0] + .6), size: 30, color: '#e8735a' });
}
// why: the ice melts, and people hunt the same prey
export function why(g, lt, D, t, o) {
  const m = o.marks;
  const cam = { x: 0, y: 1.8, z: 0, f: 1000, oy: 540 };
  const melt = ss(seg(lt, m[1], m[1] + 3));
  steppe(g, t, cam, { snow: lerp(.7, 0, melt), dusk: .2, flora: lerp(.5, 1, melt), actors: [A.m('bison', 6, 22, { flip: -1, t, walk: .6, phase: lt * .4 }), A.m('reindeer', 9, 24, { flip: -1, t, walk: .6, phase: lt * .5 }), A.m('horse', 3, 26, { flip: -1, t, walk: .6, phase: lt * .5 }),
    A.ice(-4 + lt * .3, 10, { carry: 'spear', phase: lt * .8, t }), A.ice(-5.4 + lt * .3, 10.8, { carry: 'spear', phase: lt * .8 + .4, t })] });
  plaque(g, 'WHY?', 960, 110, { p: seg(lt, .1, .6) * (1 - seg(lt, m[1], m[1] + .3)), size: 36 });
  plaque(g, 'CLIMATE CHANGE', 960, 110, { p: seg(lt, m[1], m[1] + .6) * (1 - seg(lt, m[2], m[2] + .3)), size: 30 });
  plaque(g, 'HUNTERS · THE SAME PREY', 960, 110, { p: seg(lt, m[2], m[2] + .6), size: 28, color: '#e8735a' });
  vignette(g, W, H, .4);
}
// still standing: You beside an Ice Age hunter at sunset
export function standing(g, lt, D, t, o) {
  const cam = { x: 0, y: 1.6, z: lerp(-1.5, 0, ss(lt / D)), f: 1000, oy: 600 };
  steppe(g, t, cam, { snow: .3, dusk: .9, flora: .6, actors: [A.you(-.9, 5, { front: true, pose: 'down', ex: expr('sad', 'smile', seg(lt, 1, 3)), look: [.6, 0], t, blink: blinkAt(t) }), A.ice(.9, 5.2, { front: true, pose: 'spear', ex: expr('smile'), look: [-.6, 0], t, blink: blinkAt(t, 3), beard: true })] });
  vignette(g, W, H, .45);
}
// the coda: the script's last lines on the cave wall, by torchlight (not in the recording)
export function coda(g, lt, D, t, o) {
  const rg = g.createRadialGradient(960, 500, 50, 960, 500, 1200); rg.addColorStop(0, '#c8a070'); rg.addColorStop(.6, '#6a4a2c'); rg.addColorStop(1, '#1a0e06'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
  glow(g, 960, 520, 800, '#ffb050', .3 * (.85 + .15 * Math.sin(t * 8)));
  cavePaintLion(g, 520, 900, 150, 1); cavePaintLion(g, 1500, 940, 130, 1, -1);
  const a = seg(lt, .3, 1.5), b = seg(lt, 6.2, 7.4);
  titleBar(g, 'THE MOST DANGEROUS PREDATOR OF THE ICE AGE', 960, 330, { p: a, out: seg(lt, 5.4, 6), size: 40 });
  titleBar(g, 'WASN’T THE ONE WITH THE BIGGEST TEETH', 960, 470, { p: seg(lt, 1.6, 2.8), out: seg(lt, 5.4, 6), size: 40 });
  titleBar(g, 'IT WAS THE ONE PAINTING THE OTHERS', 960, 380, { p: b, out: seg(lt, D - 2.2, D - 1.2), size: 46 });
  titleBar(g, 'ON THE WALLS', 960, 520, { p: seg(lt, 7.4, 8.6), out: seg(lt, D - 2.2, D - 1.2), size: 46 });
  // an ochre hand print presses onto the wall
  const hp = seg(lt, 9.4, 10); if (hp > 0) { g.save(); g.globalAlpha = hp * .75; g.translate(960, 760); g.scale(1.4, 1.4); g.fillStyle = '#b8462a'; g.beginPath(); g.ellipse(0, 0, 26, 30, 0, 0, TAU); g.fill(); for (let k = 0; k < 5; k++) { g.save(); g.rotate(-.6 + k * .3); g.fillRect(-6, -70, 12, 44); g.restore(); } g.restore(); }
  vignette(g, W, H, .55);
}
