// Late Jurassic plants in the deco manner. No grass, no flowers. x,y = base on screen, h = height in px.
import { C, TAU, clamp, lerp, mix, rgba, gline, airbrush, fan, glow, hash } from './engine/deco.js';

const BR = typeof location !== 'undefined' && new URLSearchParams(location.search).get('look') === 'bright';
export const PC = BR ? { jade: '#2a9a72', jadeD: '#0e4a3a', jadeL: '#86e0b4', olive: '#6e9236', oliveD: '#2a3a14', oliveL: '#c4dc74', bark: '#6e4c34', barkD: '#2a180e', barkL: '#c09468' }
  : { jade: '#1d6b57', jadeD: '#0b2e26', jadeL: '#4fa486', olive: '#4a5a2a', oliveD: '#1a2410', oliveL: '#8a9a5a', bark: '#3a2a20', barkD: '#140c08', barkL: '#7a5a40' };

function trunk(g, x, y, w0, w1, h, bend = 0, dark = 0) {
  const P = [[x - w0, y], [x + w0, y], [x + bend + w1, y - h], [x + bend - w1, y - h]];
  airbrush(g, P, { base: mix(PC.bark, '#000', dark), dark: PC.barkD, light: PC.barkL, dir: -2.3, rim: dark ? 0 : 1.2, rimColor: C.gold1 });
}
// Araucarian conifer: tall straight trunk, tiers of drooping tufts near the top (a stepped crown).
export function conifer(g, x, y, h, { dark = 0, sway = 0, seed = 1 } = {}) {
  trunk(g, x, y, h * .022, h * .012, h * .98, 0, dark);
  const tiers = 7;
  for (let i = 0; i < tiers; i++) {
    const ty = y - h * (.45 + .52 * i / tiers), w = h * (.26 - .028 * i) * (1 + (hash(seed + i) - .5) * .2), th = h * .07;
    for (const sg of [-1, 1]) {
      const sw = Math.sin(sway + i) * h * .004;
      const P = [[x, ty - th * .3], [x + sg * w * .5, ty - th * .55 + sw], [x + sg * w, ty + th * .35 + sw], [x + sg * w * .85, ty + th * .65 + sw], [x + sg * w * .4, ty + th * .25], [x, ty + th * .2]];
      airbrush(g, P, { base: mix(PC.jade, '#000', dark * .6), dark: PC.jadeD, light: dark ? PC.jade : PC.jadeL, dir: -2.3 });
      if (!dark) gline(g, [[x, ty - th * .3], [x + sg * w * .5, ty - th * .55 + sw], [x + sg * w, ty + th * .35 + sw]], { w: 1, alpha: .6 });
    }
  }
}
// Tree fern: slender trunk + a crown of arching fronds with leaflet ribs.
export function treeFern(g, x, y, h, { dark = 0, sway = 0, n = 9 } = {}) {
  trunk(g, x, y, h * .035, h * .03, h * .7, h * .02, dark);
  const tx = x + h * .02, ty = y - h * .7;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * .36 + Math.sin(sway + i) * .03, L = h * (.38 + .06 * Math.cos(i * 1.7));
    const pts = []; for (let k = 0; k <= 14; k++) { const u = k / 14; const ang = a + u * u * 1.4 * Math.sign(Math.cos(a) || 1) * Math.abs(Math.cos(a)) + (Math.abs(i - (n - 1) / 2) < .6 ? 0 : 0); pts.push([tx + Math.cos(a) * L * u + Math.cos(ang) * 0, ty + Math.sin(a) * L * u + u * u * L * .55 * Math.abs(Math.cos(a))]); }
    const side = pts.map(([px, py], k) => [px, py - Math.sin(k / 14 * Math.PI) * h * .035]);
    airbrush(g, [...pts, ...side.reverse()], { base: mix(PC.olive, '#000', dark * .6), dark: PC.oliveD, light: dark ? PC.olive : PC.oliveL, dir: -2.3 });
    if (!dark) { gline(g, pts, { w: 1.1, alpha: .7 }); for (let k = 2; k < 14; k += 2) { const [px, py] = pts[k]; gline(g, [[px, py], [px + Math.cos(a + 1.4) * h * .03, py + h * .035]], { w: .7, alpha: .5 }); } }
  }
}
// Cycad: thick scaly trunk + stiff fan of fronds.
export function cycad(g, x, y, h, { dark = 0, sway = 0 } = {}) {
  const tw = h * .16, th = h * .42;
  airbrush(g, [[x - tw, y], [x + tw, y], [x + tw * .8, y - th], [x - tw * .8, y - th]], { base: mix(PC.bark, '#000', dark), dark: PC.barkD, light: PC.barkL, dir: -2.3, rim: dark ? 0 : 1.2, rimColor: C.gold1 });
  if (!dark) for (let i = 1; i < 6; i++) gline(g, [[x - tw * .85, y - th * i / 6 + h * .02], [x, y - th * i / 6], [x + tw * .85, y - th * i / 6 + h * .02]], { w: .9, alpha: .7 });
  for (let i = 0; i < 11; i++) {
    const a = -Math.PI / 2 + (i - 5) * .27 + sway * .03, L = h * (.62 - Math.abs(i - 5) * .02);
    const ex = x + Math.cos(a) * L, ey = y - th + Math.sin(a) * L * .75 + Math.abs(i - 5) * h * .07;
    const pts = []; for (let k = 0; k <= 10; k++) { const u = k / 10; pts.push([lerp(x, ex, u), lerp(y - th, ey, u) - Math.sin(u * Math.PI) * h * .1]); }
    const side = pts.map(([px, py], k) => [px, py + h * .04 * Math.sin(k / 10 * Math.PI)]);
    airbrush(g, [...pts, ...side.reverse()], { base: mix(PC.jade, '#000', dark * .6), dark: PC.jadeD, light: dark ? PC.jade : PC.jadeL, dir: -2.3 });
    if (!dark) gline(g, pts, { w: 1, alpha: .7 });
  }
}
// Ginkgo: branching trunk with rounded clumps of fan leaves.
export function ginkgo(g, x, y, h, { dark = 0, sway = 0 } = {}) {
  trunk(g, x, y, h * .04, h * .02, h * .75, 0, dark);
  const cl = [[0, .78, .26], [-.18, .62, .2], [.2, .6, .2], [-.08, .92, .18], [.12, .85, .17]];
  for (const [dx, dy, r] of cl) {
    const cx = x + dx * h, cy = y - dy * h, R = r * h;
    g.beginPath(); g.ellipse(cx, cy, R, R * .8, 0, 0, TAU);
    airbrush(g, (() => { const p = []; for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; p.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R * .8]); } return p; })(), { base: mix(PC.olive, '#000', dark * .6), dark: PC.oliveD, light: dark ? PC.olive : '#b4b46a', dir: -2.3 });
    if (!dark) for (let k = 0; k < 4; k++) fan(g, cx + (hash(k + dx * 9) - .5) * R, cy + (hash(k * 3 + dy) - .5) * R * .6, R * .28, { a0: Math.PI * 1.15, a1: Math.PI * 1.85, ribs: 4, fill: '#9aa25a', ring: .2 });
  }
}
// Horsetails: a cluster of jointed upright stems with whorls of thin branches.
export function horsetails(g, x, y, h, { dark = 0, sway = 0, n = 7, seed = 3 } = {}) {
  for (let i = 0; i < n; i++) {
    const sx = x + (i - (n - 1) / 2) * h * .07 + (hash(seed + i) - .5) * h * .05, hh = h * (.6 + .4 * hash(seed * 7 + i)), lean = (hash(i + seed * 3) - .5) * h * .08 + Math.sin(sway + i) * h * .01;
    const w = h * .016;
    airbrush(g, [[sx - w, y], [sx + w, y], [sx + lean + w * .6, y - hh], [sx + lean - w * .6, y - hh]], { base: mix(PC.olive, '#000', dark * .6), dark: PC.oliveD, light: dark ? PC.olive : PC.oliveL, dir: -2.3 });
    for (let k = 1; k < 7; k++) {
      const u = k / 7, jx = sx + lean * u, jy = y - hh * u, bl = h * .07 * (1 - u * .6);
      gline(g, [[jx - w * 1.4, jy], [jx + w * 1.4, jy]], { w: 1, alpha: dark ? .2 : .6 });
      if (!dark && u > .25) for (const sg of [-1, 1]) gline(g, [[jx, jy], [jx + sg * bl, jy + bl * .4]], { w: .7, color: PC.oliveL, alpha: .55 });
    }
    g.beginPath(); g.ellipse(sx + lean, y - hh - h * .02, w * 1.1, h * .03, 0, 0, TAU); g.fillStyle = mix('#8a7a3a', '#000', dark * .6); g.fill();
  }
}
// Low fern clump (ground cover).
export function ferns(g, x, y, h, { dark = 0, sway = 0, n = 7 } = {}) {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * .38 + Math.sin(sway * 1.3 + i) * .05, L = h * (.9 - Math.abs(i - (n - 1) / 2) * .06);
    const pts = []; for (let k = 0; k <= 10; k++) { const u = k / 10; pts.push([x + Math.cos(a) * L * u * 1.2, y + Math.sin(a) * L * u + u * u * L * .6 * Math.abs(Math.cos(a))]); }
    const side = pts.map(([px, py], k) => [px, py - Math.sin(k / 10 * Math.PI) * h * .1]);
    airbrush(g, [...pts, ...side.reverse()], { base: mix(PC.jade, '#000', dark * .6), dark: PC.jadeD, light: dark ? PC.jade : PC.jadeL, dir: -2.3 });
    if (!dark) gline(g, pts, { w: .9, alpha: .55 });
  }
}
