import { C } from './engine/deco.js';
import { goldText, FONTS } from './engine/type.js';
import { mammal, SP, cub } from './mammals.js';
import { person, walker, face, expr, YOU, ICE } from './people.js';
export function animals(g, t) {
  g.fillStyle = '#2a6e8a'; g.fillRect(0, 0, 1920, 1080); g.fillStyle = '#a8b870'; g.fillRect(0, 380, 1920, 700);
  const row = (y, list, s) => { let x = 60; for (const [k, o] of list) { const S = SP[k]; const tail = -S.spine[0][0]; mammal(g, k, { x: x + tail * s, y, s, t, walk: 1, phase: .2, ...(o || {}) }); goldText(g, S.name.toUpperCase(), x + S.len * s / 2, y + 34, { size: 20, font: FONTS.sans, weight: 700, track: 3, shadow: false }); x += S.len * s + 40; } };
  row(330, [['direwolf', { snarl: 1 }], ['hyena', { jaw: .6 }], ['smilodon', { jaw: 1 }], ['homotherium', {}], ['cavelion', { snarl: .6 }]], 110);
  row(700, [['bear', {}], ['bison', {}], ['horse', {}], ['reindeer', {}]], 105);
  row(1040, [['mammoth', {}], ['bear', { stand: 1 }]], 55);
  cub(g, 1600, 1020, 170, { t }); cub(g, 1820, 1020, 130, { t, homo: true, color: '#3a2a1e' });
}
export function people(g, t) {
  g.fillStyle = '#1f5560'; g.fillRect(0, 0, 1920, 1080);
  const exs = ['neutral', 'curious', 'worried', 'scared', 'determined', 'awe', 'sad'];
  exs.forEach((e, i) => { face(g, 140 + i * 230, 180, 90, { ex: expr(e), look: [i % 3 - 1, 0], hairStyle: 'hood' }); goldText(g, e.toUpperCase(), 140 + i * 230, 320, { size: 20, font: FONTS.sans, weight: 700, track: 3, shadow: false }); });
  const poses = ['down', 'guard', 'fists', 'cold', 'shrug'];
  poses.forEach((p, i) => person(g, 140 + i * 230, 760, 400, { pose: p, ex: expr(['curious', 'scared', 'determined', 'worried', 'sad'][i]), t }));
  person(g, 1300, 760, 400, { pal: ICE, pose: 'spear', ex: expr('determined'), hairStyle: 'long', beard: true, t });
  person(g, 1520, 760, 400, { pal: ICE, pose: 'torch', ex: expr('neutral'), hairStyle: 'long', t, paint: true });
  person(g, 1740, 760, 400, { pal: ICE, pose: 'paint', ex: expr('awe'), hairStyle: 'long', t });
  walker(g, { x: 300, y: 1060, s: 150, phase: .3, t }); walker(g, { x: 600, y: 1060, s: 150, phase: .6, pal: ICE, carry: 'spear', t }); walker(g, { x: 900, y: 1060, s: 150, phase: .1, pal: ICE, carry: 'torch', t });
}
