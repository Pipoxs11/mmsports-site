// Gera as onepages visuais da MM Sports (1080x1350, sem preços). Todo post sai em onepage, nunca foto solta.
// Uso: NODE_PATH=$(npm root -g) node conteudo/onepages.js [pasta de saída] [nome da arte ...]
// Saída padrão: site/social/onepages/ (URL pública https://mmsports.me/social/onepages/<nome>.jpg depois do deploy).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = process.argv[2] || path.resolve(__dirname, '..', 'site', 'social', 'onepages');
const SO = process.argv.slice(3);
const F = '/mnt/project-files/fotos/';
const L = '/mnt/project-files/logo/novo/svg/';
const uri = (f, t) => `data:${t};base64,` + fs.readFileSync(f).toString('base64');
const foto = f => uri(F + f, 'image/jpeg');
const logoNeg = 'data:image/svg+xml;base64,' + Buffer.from(fs.readFileSync(L + 'mmsports-horizontal-negativo.svg', 'utf8').replace(/<rect[^>]*fill="#0E1B3D"\/>/, '')).toString('base64');
const logoCor = uri(L + 'mmsports-horizontal-cor.svg', 'image/svg+xml');
const logoUma = uri(L + 'mmsports-horizontal-uma-cor.svg', 'image/svg+xml');

const C = { tinta: '#0E1B3D', cobalto: '#2B4BFF', creme: '#FFF6E8', laranja: '#FF6A2B', nevoa: '#DDE4FF' };

// Foto sempre inteira: contain sobre a própria foto desfocada.
const box = (src, h, extra = '') => `<div class="ph" style="height:${h}px;${extra}"><div class="b" style="background-image:url('${src}')"></div><div class="f" style="background-image:url('${src}')"></div></div>`;

const base = (bg, fg, body, logo) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Figtree:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1350px;background:${bg};color:${fg};font-family:Figtree,sans-serif;overflow:hidden;position:relative}
h1,h2,.num{font-family:'Bricolage Grotesque',sans-serif;letter-spacing:-.03em}
.k{font-weight:800;font-size:26px;letter-spacing:.12em;text-transform:uppercase}
.ph{position:relative;overflow:hidden;border-radius:28px}
.ph .b{position:absolute;inset:-40px;background:center/cover;filter:blur(26px) brightness(.65)}
.ph .f{position:absolute;inset:0;background:center/contain no-repeat}
.foot{position:absolute;left:80px;right:80px;bottom:56px;display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:26px}
.foot img{height:62px}
</style></head><body>${body}
<div class="foot"><img src="${logo}"><span>mmsports.me · @mmsports.me</span></div></body></html>`;

const pages = {
  // 1. Modalidades por faixa etária
  '01-modalidades-por-idade': base(C.tinta, C.creme, `
<style>
.top{padding:80px 80px 0}
h1{font-size:84px;line-height:.98;font-weight:800;margin-top:22px}
h1 em{font-style:normal;color:${C.laranja}}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:22px;padding:48px 80px 0}
.c{background:#17264f;border-radius:26px;padding:30px 32px;min-height:0;border-top:10px solid ${C.cobalto}}
.c:nth-child(2){border-color:${C.laranja}}.c:nth-child(3){border-color:${C.nevoa}}.c:nth-child(4){border-color:${C.laranja}}
.c h2{font-size:46px;font-weight:800;line-height:1}
.c .s{font-size:22px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.65;margin-top:8px}
.c p{font-size:29px;line-height:1.35;margin-top:18px;font-weight:500}
.strip{display:flex;gap:22px;padding:30px 80px 0}
.note{padding:28px 80px 0;font-size:28px;line-height:1.35;opacity:.9}
</style>
<div class="top"><div class="k" style="color:${C.laranja}">Para todas as idades</div>
<h1>Tem esporte para a família <em>inteira</em>.</h1></div>
<div class="grid">
 <div class="c"><h2>Crianças</h2><div class="s">4 a 12 anos</div><p>Futsal, futebol, dança, lutas e iniciação esportiva</p></div>
 <div class="c"><h2>Adolescentes</h2><div class="s">12 a 17 anos</div><p>Vôlei, basquete, ritmos, lutas e muito mais</p></div>
 <div class="c"><h2>Adultos</h2><div class="s">18 a 59 anos</div><p>Pilates, danças, lutas, funcional e alongamento</p></div>
 <div class="c"><h2>60+</h2><div class="s">60 anos ou mais</div><p>Ginástica, vôlei adaptado, pilates e alongamento</p></div>
</div>
<div class="strip">${box(foto('futebol-infantil/futebol-9a12-turma-predios-quadrada.jpg'), 270, 'flex:1')}${box(foto('60-mais/turma-60mais-quadra-vertical.jpg'), 270, 'flex:1')}</div>
<div class="note">A grade é montada conforme o interesse dos moradores.</div>
`, logoNeg),

  // 2. Como funciona
  '02-como-funciona': base(C.creme, C.tinta, `
<style>
.top{padding:80px 80px 0}
h1{font-size:88px;line-height:.98;font-weight:800;margin-top:22px}
h1 em{font-style:normal;color:${C.cobalto}}
.ph{margin:44px 80px 0}
.steps{padding:40px 80px 0;display:flex;flex-direction:column;gap:22px}
.st{display:flex;gap:26px;align-items:flex-start}
.n{flex:none;width:62px;height:62px;border-radius:50%;background:${C.laranja};color:${C.creme};font:800 32px 'Bricolage Grotesque';display:flex;align-items:center;justify-content:center}
.st b{display:block;font-size:37px;font-weight:800;line-height:1.1}
.st span{display:block;font-size:28px;line-height:1.3;margin-top:4px;opacity:.8}
</style>
<div class="top"><div class="k" style="color:${C.cobalto}">Como funciona</div>
<h1>Do primeiro papo à <em>primeira aula</em>.</h1></div>
${box(foto('futsal-infantil/futsal-5a8-turma-quadra-madeira-horizontal.jpg'), 400)}
<div class="steps">
 <div class="st"><div class="n">1</div><div><b>Conversa com o síndico</b><span>Entendemos o espaço, a rotina e o perfil dos moradores.</span></div></div>
 <div class="st"><div class="n">2</div><div><b>Grade sob medida</b><span>Modalidades e horários definidos pelo interesse do condomínio.</span></div></div>
 <div class="st"><div class="n">3</div><div><b>Professores especialistas</b><span>Equipe experiente, turmas separadas por faixa etária.</span></div></div>
 <div class="st"><div class="n">4</div><div><b>Aula na quadra de casa</b><span>Duas vezes por semana, sem trânsito e sem sair do condomínio.</span></div></div>
</div>
`, logoCor),

  // 3. Benefícios
  '03-beneficios': base(C.cobalto, C.creme, `
<style>
.top{padding:80px 80px 0}
h1{font-size:90px;line-height:.96;font-weight:800;margin-top:22px}
h1 em{font-style:normal;color:${C.tinta}}
.ph{margin:44px 80px 0}
.list{display:grid;grid-template-columns:1fr 1fr;gap:20px 34px;padding:44px 80px 0}
.it{border-top:4px solid ${C.creme};padding-top:16px}
.it b{display:block;font-size:40px;font-weight:800;line-height:1.08}
.it span{display:block;font-size:28px;line-height:1.3;margin-top:8px;opacity:.9}
</style>
<div class="top"><div class="k" style="color:${C.tinta}">Por que no condomínio</div>
<h1>A quadra parada vira <em>ponto de encontro</em>.</h1></div>
${box(foto('60-mais/turma-60mais-grupo-grande-horizontal.jpg'), 430)}
<div class="list">
 <div class="it"><b>Segurança</b><span>Crianças praticam esporte sem sair de casa.</span></div>
 <div class="it"><b>Praticidade</b><span>Nada de trânsito para levar e buscar.</span></div>
 <div class="it"><b>Convivência</b><span>Vizinhos de todas as idades se conhecem.</span></div>
 <div class="it"><b>Valorização</b><span>Área comum usada de verdade, todo mês.</span></div>
</div>
`, logoNeg),

  // 4. Misti Morumbi
  '04-misti-morumbi': base(C.laranja, C.tinta, `
<style>
.top{padding:80px 80px 0}
h1{font-size:80px;line-height:.98;font-weight:800;margin-top:22px}
.ph{margin:44px 80px 0}
.nums{display:flex;gap:24px;padding:44px 80px 0}
.nb{flex:1;background:${C.tinta};color:${C.creme};border-radius:26px;padding:30px 34px}
.num{font-size:110px;font-weight:800;line-height:.9;color:${C.laranja}}
.nb span{display:block;font-size:28px;font-weight:600;line-height:1.25;margin-top:12px}
.q{padding:36px 80px 0;font-size:30px;line-height:1.35;font-weight:600}
</style>
<div class="top"><div class="k" style="color:${C.creme}">Condomínio Misti Morumbi · São Paulo</div>
<h1>Onde tudo começou, e segue crescendo.</h1></div>
${box(foto('futebol-infantil/futebol-9a12-turma-goleiro-vertical.jpg'), 470)}
<div class="nums">
 <div class="nb"><div class="num">2023</div><span>aulas no condomínio desde então</span></div>
 <div class="nb"><div class="num">+50</div><span>crianças em aula toda semana</span></div>
</div>
<div class="q">O próximo condomínio pode ser o seu.</div>
`, logoUma),

  // 5. Leque de atividades (tipográfica)
  '05-muito-alem-da-bola': base(C.tinta, C.creme, `
<style>
.top{padding:80px 80px 0}
h1{font-size:96px;line-height:.95;font-weight:800;margin-top:22px}
h1 em{font-style:normal;color:${C.laranja}}
.tags{display:flex;flex-wrap:wrap;gap:16px;padding:46px 80px 0}
.t{font:800 40px 'Bricolage Grotesque';padding:14px 28px;border-radius:999px;border:3px solid ${C.creme};letter-spacing:-.02em}
.t.o{background:${C.laranja};border-color:${C.laranja};color:${C.tinta}}
.t.c{background:${C.cobalto};border-color:${C.cobalto}}
.ph{margin:44px 80px 0}
.note{padding:30px 80px 0;font-size:30px;line-height:1.35;opacity:.92}
</style>
<div class="top"><div class="k" style="color:${C.laranja}">Não é só bola</div>
<h1>Muito além do <em>futebol</em>.</h1></div>
<div class="tags">
 <span class="t o">Futsal</span><span class="t">Vôlei</span><span class="t c">Basquete</span><span class="t">Danças</span>
 <span class="t o">Ritmos</span><span class="t">Lutas</span><span class="t c">Pilates</span><span class="t">Ginástica</span>
 <span class="t o">Alongamento</span><span class="t">Funcional</span><span class="t c">e mais</span>
</div>
${box(foto('60-mais/alongamento-quadra-horizontal.jpg'), 360)}
<div class="note">Esporte no condomínio, para todas as idades, em São Paulo.</div>
`, logoNeg),
  // 6. Ilustrada: 60 minutos por dia (OMS)
  '06-60-minutos-por-dia': base(C.tinta, C.creme, `
<style>
.top{padding:80px 80px 0}
h1{font-size:80px;line-height:.98;font-weight:800;margin-top:22px}
h1 em{font-style:normal;color:${C.laranja}}
.il{display:flex;justify-content:center;margin-top:40px}
.p{padding:36px 80px 0;font-size:32px;line-height:1.38}
.p b{color:${C.laranja}}
</style>
<div class="top"><div class="k" style="color:${C.laranja}">Recomendação da OMS</div>
<h1>Uma hora por dia de <em>movimento</em>.</h1></div>
<div class="il"><svg width="560" height="560" viewBox="0 0 560 560">
 <circle cx="280" cy="280" r="250" fill="#17264f"/>
 ${Array.from({ length: 60 }, (_, i) => { const a = i * 6 * Math.PI / 180, r1 = i % 5 ? 222 : 208, r2 = 236; return `<line x1="${280 + r1 * Math.sin(a)}" y1="${280 - r1 * Math.cos(a)}" x2="${280 + r2 * Math.sin(a)}" y2="${280 - r2 * Math.cos(a)}" stroke="${C.creme}" stroke-opacity="${i % 5 ? .35 : .8}" stroke-width="${i % 5 ? 3 : 6}" stroke-linecap="round"/>`; }).join('')}
 <circle cx="280" cy="280" r="180" fill="none" stroke="${C.laranja}" stroke-width="34" stroke-linecap="round" stroke-dasharray="1131" stroke-dashoffset="0" transform="rotate(-90 280 280)"/>
 <circle cx="280" cy="100" r="30" fill="${C.creme}"/><path d="M262 92 q18 10 36 0 M262 108 q18 -10 36 0" stroke="${C.tinta}" stroke-width="4" fill="none"/>
 <text x="280" y="300" text-anchor="middle" font-family="Bricolage Grotesque" font-weight="800" font-size="150" fill="${C.creme}" letter-spacing="-6">60</text>
 <text x="280" y="356" text-anchor="middle" font-family="Figtree" font-weight="800" font-size="34" fill="${C.laranja}" letter-spacing="4">MIN POR DIA</text>
</svg></div>
<div class="p">É o que a OMS recomenda para quem tem de <b>5 a 17 anos</b>. Com aula no condomínio, sem trânsito, essa hora fica bem mais perto.</div>
`, logoNeg),

  // 7. Ilustrada: como é uma aula
  '07-como-e-uma-aula': base(C.creme, C.tinta, `
<style>
.top{padding:80px 80px 0}
h1{font-size:84px;line-height:.98;font-weight:800;margin-top:22px}
h1 em{font-style:normal;color:${C.cobalto}}
.tl{position:relative;padding:56px 80px 0}
.tl:before{content:'';position:absolute;left:146px;top:110px;bottom:60px;width:6px;background:${C.nevoa};border-radius:3px}
.row{display:flex;gap:34px;align-items:center;margin-bottom:34px;position:relative}
.ic{flex:none;width:138px;height:138px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.row b{display:block;font:800 42px 'Bricolage Grotesque';letter-spacing:-.02em}
.row span{display:block;font-size:28px;line-height:1.3;margin-top:6px;opacity:.8}
</style>
<div class="top"><div class="k" style="color:${C.laranja}">Bastidores</div>
<h1>Como é uma aula, do apito ao <em>tchau</em>.</h1></div>
<div class="tl">
 <div class="row"><div class="ic" style="background:${C.laranja}"><svg width="78" height="78" viewBox="0 0 78 78" fill="none" stroke="${C.creme}" stroke-width="7" stroke-linecap="round"><path d="M8 26 q10 -12 20 0 t20 0 t20 0"/><path d="M8 44 q10 -12 20 0 t20 0 t20 0"/><path d="M8 62 q10 -12 20 0 t20 0 t20 0"/></svg></div><div><b>Aquecimento</b><span>Com brincadeira, para ninguém chegar frio nem tímido.</span></div></div>
 <div class="row"><div class="ic" style="background:${C.cobalto}"><svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="${C.creme}" stroke-width="7"><circle cx="40" cy="40" r="32"/><circle cx="40" cy="40" r="18"/><circle cx="40" cy="40" r="5" fill="${C.creme}"/></svg></div><div><b>Um fundamento</b><span>Explicado em poucas palavras e muito praticado.</span></div></div>
 <div class="row"><div class="ic" style="background:${C.tinta}"><svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="${C.creme}" stroke-width="6"><circle cx="40" cy="40" r="32"/><path d="M40 22 l14 10 -5 17 h-18 l-5 -17z" fill="${C.creme}"/><path d="M40 8v14M54 32l14-6M49 49l9 13M31 49l-9 13M26 32l-14-6"/></svg></div><div><b>Jogo</b><span>Onde a criança usa o que aprendeu sem perceber.</span></div></div>
 <div class="row"><div class="ic" style="background:${C.laranja}"><svg width="80" height="80" viewBox="0 0 80 80" fill="${C.creme}"><path d="M40 68 C14 50 8 36 14 24 C20 12 36 14 40 26 C44 14 60 12 66 24 C72 36 66 50 40 68z"/></svg></div><div><b>Volta à calma</b><span>E uma conversa rápida sobre o que deu certo.</span></div></div>
</div>
`, logoCor),

  // 8. Ilustrada: atividade física não tem idade (60+)
  '08-nao-tem-idade': base(C.cobalto, C.creme, `
<style>
.top{padding:80px 80px 0}
h1{font-size:88px;line-height:.96;font-weight:800;margin-top:22px}
h1 em{font-style:normal;color:${C.tinta}}
.big{display:flex;align-items:flex-end;gap:30px;padding:46px 80px 0}
.num{font-size:150px;font-weight:800;line-height:.85}
.big span{font-size:32px;font-weight:700;line-height:1.2;padding-bottom:10px}
.bars{display:flex;align-items:flex-end;gap:16px;height:260px;padding:0 80px;margin-top:40px}
.bars i{flex:1;border-radius:14px 14px 0 0;background:${C.creme}}
.bars i:nth-child(2n){background:${C.laranja}}.bars i:nth-child(3n){background:${C.tinta}}
.base{height:6px;margin:0 80px;background:${C.creme};border-radius:3px}
.d{display:flex;justify-content:space-between;padding:12px 80px 0;font-weight:800;font-size:24px;opacity:.8}
.p{padding:40px 80px 0;font-size:33px;line-height:1.38}
</style>
<div class="top"><div class="k" style="color:${C.tinta}">60+ · Recomendação da OMS</div>
<h1>Atividade física <em>não tem idade</em>.</h1></div>
<div class="big"><div class="num">150–300</div><span>minutos<br>por semana</span></div>
<div class="bars"><i style="height:55%"></i><i style="height:80%"></i><i style="height:45%"></i><i style="height:95%"></i><i style="height:60%"></i><i style="height:75%"></i><i style="height:40%"></i></div>
<div class="base"></div>
<div class="d"><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span><span>D</span></div>
<div class="p">Com exercícios de equilíbrio e força, que ajudam a evitar quedas e a manter a autonomia. No condomínio, a turma ainda vira grupo de amigos.</div>
`, logoNeg),

  // 9. Só texto: frase
  '09-frase-comeca-para-ficar-bom': base(C.laranja, C.tinta, `
<style>
.q{position:absolute;left:80px;right:80px;top:120px}
.mark{font:800 300px/0.7 'Bricolage Grotesque';color:${C.creme}}
h1{font-size:96px;line-height:1;font-weight:800;margin-top:30px}
h1 em{font-style:normal;color:${C.creme}}
.who{margin-top:60px;font-size:32px;font-weight:700}
.who span{display:block;font-weight:500;opacity:.8;margin-top:6px}
.lines{position:absolute;right:-160px;bottom:200px;width:520px;height:520px;border:10px solid ${C.creme};border-radius:50%;opacity:.25}
.lines:after{content:'';position:absolute;left:50%;top:-10px;bottom:-10px;width:10px;background:${C.creme}}
</style>
<div class="lines"></div>
<div class="q"><div class="mark">“</div>
<h1>Ele não precisa ser bom para começar. <em>Ele começa para ficar bom.</em></h1>
<div class="who">Matheus de Moraes<span>MM Sports, esporte no condomínio</span></div></div>
`, logoUma),

  // 10. Só texto: mito ou verdade
  '10-mito-ou-verdade': base(C.tinta, C.creme, `
<style>
.top{padding:80px 80px 0}
h1{font-size:80px;line-height:.98;font-weight:800;margin-top:22px}
h1 em{font-style:normal;color:${C.laranja}}
.it{margin:24px 80px 0;padding:24px 34px;background:#17264f;border-radius:26px}
.it .t{font-size:34px;font-weight:700;line-height:1.2}
.tag{display:inline-block;font:800 22px Figtree;letter-spacing:.12em;padding:8px 16px;border-radius:999px;background:${C.laranja};color:${C.tinta};margin-bottom:14px}
.it p{font-size:27px;line-height:1.35;margin-top:12px;opacity:.85}
</style>
<div class="top"><div class="k" style="color:${C.laranja}">Esporte no condomínio</div>
<h1>Mito ou <em>verdade</em>?</h1></div>
<div class="it"><span class="tag">MITO</span><div class="t">“Só funciona em condomínio com quadra grande.”</div><p>As atividades são montadas conforme o espaço: quadra, salão ou área livre.</p></div>
<div class="it"><span class="tag">MITO</span><div class="t">“O condomínio sempre paga a conta.”</div><p>No modelo pay per use, só as famílias dos alunos pagam.</p></div>
<div class="it"><span class="tag">MITO</span><div class="t">“É só para crianças.”</div><p>Tem turma para adolescentes, adultos e 60+.</p></div>
<div class="it"><span class="tag" style="background:${C.cobalto};color:${C.creme}">VERDADE</span><div class="t">“Sem trânsito, fica mais fácil manter a rotina.”</div><p>A aula acontece onde a família já está.</p></div>
`, logoNeg),

  // 11. Só texto: checklist do síndico
  '11-checklist-do-sindico': base(C.creme, C.tinta, `
<style>
.top{padding:80px 80px 0}
h1{font-size:82px;line-height:.98;font-weight:800;margin-top:22px}
h1 em{font-style:normal;color:${C.cobalto}}
.ck{padding:50px 80px 0;display:flex;flex-direction:column;gap:26px}
.ck div{display:flex;gap:26px;align-items:center;font-size:36px;font-weight:700;line-height:1.2}
.ck i{flex:none;width:62px;height:62px;border-radius:16px;background:${C.cobalto};display:flex;align-items:center;justify-content:center}
.p{padding:44px 80px 0;font-size:28px;line-height:1.35;opacity:.8}
</style>
<div class="top"><div class="k" style="color:${C.laranja}">Para síndicos</div>
<h1>5 perguntas antes de <em>contratar aulas</em>.</h1></div>
<div class="ck">
${['Os professores são qualificados e experientes?', 'As turmas são separadas por idade?', 'Quantos alunos cabem com segurança no espaço?', 'Quem paga e como funciona a cobrança?', 'Dá para fazer uma aula experimental?'].map(t => `<div><i><svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="${C.creme}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18l7 7 15-16"/></svg></i>${t}</div>`).join('')}
</div>
<div class="p">Checklist completo no blog: mmsports.me/blog</div>
`, logoCor),

  // 12. Só texto: enquete
  '12-qual-atividade': base(C.cobalto, C.creme, `
<style>
.top{padding:80px 80px 0}
h1{font-size:86px;line-height:.98;font-weight:800;margin-top:22px}
h1 em{font-style:normal;color:${C.tinta}}
.op{padding:50px 80px 0;display:flex;flex-direction:column;gap:22px}
.op div{display:flex;align-items:center;gap:28px;background:${C.creme};color:${C.tinta};border-radius:999px;padding:18px 34px 18px 18px;font:800 44px 'Bricolage Grotesque';letter-spacing:-.02em}
.op b{flex:none;width:76px;height:76px;border-radius:50%;background:${C.laranja};color:${C.creme};display:flex;align-items:center;justify-content:center}
.p{padding:40px 80px 0;font-size:32px;font-weight:700}
</style>
<div class="top"><div class="k" style="color:${C.tinta}">Responda nos comentários</div>
<h1>Qual atividade faria sucesso no <em>seu condomínio</em>?</h1></div>
<div class="op"><div><b>1</b>Esportes com bola</div><div><b>2</b>Danças e ritmos</div><div><b>3</b>Lutas</div><div><b>4</b>Pilates e funcional</div></div>
<div class="p">Comente só o número. Faltou alguma? Conta pra gente.</div>
`, logoNeg),

};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const [name, html] of Object.entries(pages)) {
    if (SO.length && !SO.includes(name)) continue;
    await p.setContent(html, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(OUT, name + '.jpg'), type: 'jpeg', quality: 92 });
    console.log(name);
  }
  await b.close();
})();
