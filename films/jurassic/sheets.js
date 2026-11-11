import { C } from './engine/deco.js';
import { goldText, FONTS } from './engine/type.js';
import { dino, skeleton, SPECIES } from './dinos.js';
export function dinos(g, t) {
  g.fillStyle = '#0d0b09'; g.fillRect(0, 0, 1920, 1080);
  const row = (y, list, s) => { let x = 80; for (const [k, ph, extra] of list) { const S = SPECIES[k]; const tail = -S.spine[0][0]; dino(g, k, { x: x + tail * s, y, s, phase: ph, walk: 1, t, ...(extra || {}) }); goldText(g, S.name.toUpperCase(), x + tail * s, y + 40, { size: 22, font: FONTS.sans, weight: 700, track: 4, shadow: false }); x += S.len * s + 60; } };
  for (const y of [330, 660, 1000]) { g.strokeStyle = 'rgba(201,162,75,.4)'; g.beginPath(); g.moveTo(0, y); g.lineTo(1920, y); g.stroke(); }
  row(330, [['allosaurus', .1, { jaw: .8 }], ['ceratosaurus', .4, {}], ['torvosaurus', .7, {}], ['ornitholestes', .2, {}]], 58);
  row(660, [['stegosaurus', .1, {}], ['diplodocus', .3, {}]], 30);
  row(1000, [['apatosaurus', .5, {}], ['brachiosaurus', .2, {}]], 24);
}
export function skel(g, t) {
  g.fillStyle = '#0d0b09'; g.fillRect(0, 0, 1920, 1080);
  skeleton(g, 'allosaurus', { x: 1000, y: 900, s: 150 });
}
import { soldier, soldierFront, soldierTop } from './humans.js';
import { conifer, treeFern, cycad, ginkgo, horsetails, ferns } from './plants.js';
export function cast(g, t) {
  g.fillStyle = '#2a2014'; g.fillRect(0, 0, 1920, 1080);
  const poses = ['stand', 'walk', 'aim', 'kneel', 'sit', 'crouch', 'sentry'];
  poses.forEach((p, i) => soldier(g, { x: 120 + i * 200, y: 470, s: 220, pose: p, phase: .2, nvg: p === 'sentry' }));
  soldierFront(g, { x: 1560, y: 470, s: 230 });
  for (let i = 0; i < 6; i++) soldierTop(g, 1700 + (i % 3) * 60, 120 + Math.floor(i / 3) * 70, 22);
  conifer(g, 160, 1060, 520); treeFern(g, 420, 1060, 420); cycad(g, 640, 1060, 260); ginkgo(g, 900, 1060, 420); horsetails(g, 1150, 1060, 300); ferns(g, 1350, 1060, 140);
  dino(g, 'allosaurus', { x: 1650, y: 1060, s: 50, jaw: .5, walk: 1, phase: .3 });
  soldier(g, { x: 1850, y: 1060, s: 50, pose: 'aim', flip: -1 });
}
