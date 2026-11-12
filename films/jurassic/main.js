const Q = new URLSearchParams(location.search);
const cv = document.getElementById('c'), g = cv.getContext('2d');
await Promise.all(['80px Limelight', '80px Poiret', '600 40px Josefin', '700 40px Josefin', '80px Italiana'].map(f => document.fonts.load(f)));
let film;
if (Q.has('sheet')) {
  const m = await import('./sheets.js');
  window.DUR = 1; window.render = t => { g.setTransform(1, 0, 0, 1, 0, 0); m[Q.get('sheet')](g, t); };
} else {
  film = await import('./film.js'); await film.init();
  window.DUR = film.DUR; window.EV = film.events(); window.TEXTS = t => film.texts(t);
  const clip = Q.get('clip') ? Q.get('clip').split(',').map(Number) : null;   // clip=start,duration renders a section only
  if (clip) { window.DUR = clip[1]; window.EV = []; }
  window.render = t => { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; film.renderFilm(g, clip ? t + clip[0] : t); };
}
window.READY = true;
