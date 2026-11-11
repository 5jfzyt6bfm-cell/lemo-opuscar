import { C, gline, sunburst, fan } from './engine/deco.js';
// ---------- door leaves (lacquer, gold stepped panels) hinged at the frame edges ----------
// open: 0 = closed on the seam, 1 = fully open (leaves out of frame).
export function doorsLeaves(g, open, { W = 1920, H = 1080, sheen = .4 } = {}) {
  if (open >= 1) return;
  const half = W / 2, off = half * open;
  for (const sg of [-1, 1]) {
    g.save();
    const x0 = sg < 0 ? -off : half + off, x1 = x0 + half;
    const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, '#120e09'); gr.addColorStop(.5, '#1d160d'); gr.addColorStop(1, '#0a0806');
    g.fillStyle = gr; g.fillRect(x0, 0, half, H);
    const cx = sg < 0 ? x1 - 60 : x0 + 60;                   // ornament anchored at the seam
    g.beginPath(); g.rect(x0, 0, half, H); g.clip();
    sunburst(g, sg < 0 ? x1 : x0, H / 2, { rays: 40, r0: 70, r1: 720, mode: 'both', w: 1.4, alpha: .55, colorA: 'rgba(201,162,75,.07)', sheen });
    for (let i = 0; i < 4; i++) { const ins = 40 + i * 26; gline(g, [[x0 + ins, ins], [x1 - ins, ins], [x1 - ins, H - ins], [x0 + ins, H - ins], [x0 + ins, ins]], { w: i ? 1.1 : 2.4, sheen: sheen + i * .05 }); }
    fan(g, sg < 0 ? x1 : x0, H / 2, 90, { a0: sg < 0 ? Math.PI / 2 : -Math.PI / 2, a1: sg < 0 ? Math.PI * 1.5 : Math.PI / 2, ribs: 7, fill: C.gold1 });
    g.restore();
    gline(g, [[sg < 0 ? x1 : x0, 0], [sg < 0 ? x1 : x0, H]], { w: 2.4 });
  }
}

