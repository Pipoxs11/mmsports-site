// Gera a arte de um post (1080x1350, PNG) na identidade da MM Sports.
// Uso: node conteudo/render.js conteudo/posts/2026-10-27.json site/social/2026-10-27.png
// JSON: {"kicker":"Para síndicos","titulo":"...","texto":"...","foto":"turma.jpg","tema":"navy|gol|paper"}
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [, , src, out] = process.argv;
const d = JSON.parse(fs.readFileSync(src, 'utf8'));
const root = path.resolve(__dirname, '..', 'site');
const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const temas = { navy: ['#0E1B3D', '#FFF6E8', '#FF6A2B'], gol: ['#FF6A2B', '#0E1B3D', '#FFF6E8'], paper: ['#FFF6E8', '#0E1B3D', '#2B4BFF'] };
const [bg, fg, ac] = temas[d.tema || 'navy'];
const logo = fs.readFileSync(path.join(root, 'logo.svg'), 'utf8').replace(/#FFF6E8/g, fg).replace(/#FF6A2B/g, ac === fg ? bg : (d.tema === 'gol' ? '#FFF6E8' : '#FF6A2B'));
const foto = d.foto ? 'data:image/jpeg;base64,' + fs.readFileSync(path.join(root, 'images', d.foto)).toString('base64') : '';
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Figtree:wght@400;600;700&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0}body{width:1080px;height:1350px;background:${bg};color:${fg};font-family:Figtree,sans-serif;display:flex;flex-direction:column;overflow:hidden}
.foto{height:${foto ? 560 : 0}px;background:url('${foto}') center/cover;border-bottom:14px solid ${ac}}
.c{flex:1;padding:${foto ? 64 : 110}px 80px 0;display:flex;flex-direction:column}.m{${foto ? '' : 'margin:auto 0'}}
.k{font-weight:700;font-size:30px;letter-spacing:.08em;text-transform:uppercase;color:${ac};margin-bottom:24px}
h1{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;letter-spacing:-.025em;line-height:1.02;font-size:${foto ? 76 : 104}px}
p{font-size:${foto ? 34 : 40}px;line-height:1.35;margin-top:28px;opacity:.92}
.f{margin-top:${foto ? 'auto' : '0'};padding:0 0 56px;display:flex;align-items:center;justify-content:space-between;font-weight:700;font-size:30px}
.f span{display:flex;align-items:center;gap:16px}.f svg{width:76px;height:60px}</style></head><body>
${foto ? '<div class="foto"></div>' : ''}<div class="c"><div class="m"><div class="k">${esc(d.kicker)}</div><h1>${esc(d.titulo)}</h1>${d.texto ? `<p>${esc(d.texto)}</p>` : ''}</div>
<div class="f"><span>${logo}MM Sports</span><span>mmsports.me</span></div></div></body></html>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: out, type: out.endsWith('.jpg') ? 'jpeg' : 'png', quality: out.endsWith('.jpg') ? 90 : undefined });
  await b.close();
})();
