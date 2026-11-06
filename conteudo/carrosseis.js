// Gera os carrosséis em PDF da MM Sports para o LinkedIn (documento, 1080x1350 por página, sem preços).
// Uso: NODE_PATH=$(npm root -g) node conteudo/carrosseis.js <nome> [pasta de saída]
// Saída padrão: site/social/carrosseis/<nome>.pdf e <nome>-capa.jpg
// (URL pública https://mmsports.me/social/carrosseis/<nome>.pdf depois do deploy).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const NOME = process.argv[2];
const OUT = process.argv[3] || path.resolve(__dirname, '..', 'site', 'social', 'carrosseis');
const L = '/mnt/project-files/logo/novo/svg/';
const uri = (f, t) => `data:${t};base64,` + fs.readFileSync(f).toString('base64');
const logoNeg = 'data:image/svg+xml;base64,' + Buffer.from(fs.readFileSync(L + 'mmsports-horizontal-negativo.svg', 'utf8').replace(/<rect[^>]*fill="#0E1B3D"\/>/, '')).toString('base64');
const logoCor = uri(L + 'mmsports-horizontal-cor.svg', 'image/svg+xml');

const C = { tinta: '#0E1B3D', cobalto: '#2B4BFF', creme: '#FFF6E8', laranja: '#FF6A2B', nevoa: '#DDE4FF' };
const TEMAS = {
  navy: { bg: C.tinta, fg: C.creme, acc: C.laranja, card: '#17264f', logo: logoNeg },
  creme: { bg: C.creme, fg: C.tinta, acc: C.cobalto, card: '#FFFFFF', logo: logoCor },
};

// Tipos de página: capa, texto (titulo + paragrafos), lista (titulo + itens), modelo (titulo + cards com selo), fim.
function pagina(p, i, total) {
  const t = TEMAS[p.tema || (p.tipo === 'capa' || p.tipo === 'fim' ? 'navy' : 'creme')];
  const conta = p.tipo === 'capa' ? '' : `<div class="conta" style="color:${t.acc}">${i + 1}/${total}</div>`;
  let corpo = '';
  if (p.tipo === 'capa') {
    corpo = `<div class="k" style="color:${t.acc}">${p.kicker}</div><h1 class="capa">${p.titulo}</h1>
      <p class="sub">${p.sub}</p><div class="seta" style="background:${t.acc}">Arraste para o lado →</div>`;
  } else if (p.tipo === 'texto') {
    corpo = `${p.kicker ? `<div class="k" style="color:${t.acc}">${p.kicker}</div>` : ''}<h2>${p.titulo}</h2>
      ${p.paragrafos.map(x => `<p class="par">${x}</p>`).join('')}`;
  } else if (p.tipo === 'lista') {
    corpo = `${p.kicker ? `<div class="k" style="color:${t.acc}">${p.kicker}</div>` : ''}<h2>${p.titulo}</h2>
      <div class="lista">${p.itens.map((x, n) => `<div class="it"><div class="n" style="background:${t.acc}">${n + 1}</div><div>${x}</div></div>`).join('')}</div>`;
  } else if (p.tipo === 'modelo') {
    corpo = `<div class="k" style="color:${t.acc}">${p.kicker}</div><h2>${p.titulo}</h2>
      <div class="cards">${p.cards.map(c => `<div class="card" style="background:${t.card}"><div class="selo" style="color:${t.acc}">${c.selo}</div><div class="ct">${c.texto}</div></div>`).join('')}</div>`;
  } else if (p.tipo === 'fim') {
    corpo = `<div class="k" style="color:${t.acc}">${p.kicker}</div><h1 class="fim">${p.titulo}</h1>
      <p class="sub">${p.sub}</p><div class="cta" style="border-color:${t.acc}">${p.cta}</div>`;
  }
  return `<section style="background:${t.bg};color:${t.fg}">${conta}<div class="in">${corpo}</div>
    <div class="foot"><img src="${t.logo}"><span>mmsports.me · @mmsports.me</span></div></section>`;
}

const css = `
@page{size:1080px 1350px;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Figtree,sans-serif}
section{width:1080px;height:1350px;position:relative;overflow:hidden;page-break-after:always}
.in{position:absolute;top:120px;bottom:180px;left:90px;right:90px;display:flex;flex-direction:column;justify-content:center}
h1,h2,.n{font-family:'Bricolage Grotesque',sans-serif;letter-spacing:-.03em}
.k{font-weight:800;font-size:28px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:26px}
h1.capa{font-size:124px;line-height:.98;font-weight:800}
h1.fim{font-size:98px;line-height:1;font-weight:800}
h1 em,h2 em{font-style:normal;color:${C.laranja}}
section[style*="FFF6E8"] h2 em{color:${C.cobalto}}
h2{font-size:88px;line-height:1;font-weight:800;margin-bottom:56px}
.sub{font-size:42px;line-height:1.35;margin-top:44px;opacity:.85;font-weight:500}
.par{font-size:44px;line-height:1.4;margin-bottom:40px;font-weight:500}
.par b{font-weight:800}
.seta{align-self:flex-start;display:inline-block;margin-top:70px;padding:22px 34px;border-radius:999px;color:${C.creme};font-weight:800;font-size:30px}
.lista{display:flex;flex-direction:column;gap:40px}
.it{display:flex;gap:30px;align-items:flex-start;font-size:41px;line-height:1.32;font-weight:600}
.it b{font-weight:800}
.n{flex:none;width:72px;height:72px;border-radius:50%;color:${C.creme};font-weight:800;font-size:32px;display:flex;align-items:center;justify-content:center;margin-top:-4px}
.cards{display:flex;flex-direction:column;gap:30px}
.card{border-radius:28px;padding:38px 42px;box-shadow:0 2px 0 rgba(14,27,61,.08)}
.selo{font-weight:800;font-size:28px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px}
.ct{font-size:40px;line-height:1.35;font-weight:600}
.cta{align-self:flex-start;display:inline-block;margin-top:60px;padding:26px 38px;border:4px solid;border-radius:22px;font-weight:800;font-size:36px}
.conta{position:absolute;top:56px;right:90px;font-weight:800;font-size:26px;letter-spacing:.08em}
.foot{position:absolute;left:90px;right:90px;bottom:60px;display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:26px}
.foot img{height:62px}`;

const html = paginas => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Figtree:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${css}</style></head><body>${paginas.map((p, i) => pagina(p, i, paginas.length)).join('')}</body></html>`;

const CARROSSEIS = {
  'pay-per-use-rateio-pacote': [
    { tipo: 'capa', kicker: 'Guia para síndicos e administradoras', titulo: 'Pay per use, rateio ou <em>pacote</em>?', sub: 'Como funciona cada modelo de aulas esportivas no condomínio, e quando cada um faz sentido.' },
    { tipo: 'modelo', kicker: 'Em uma frase', titulo: 'Três jeitos de levar aulas ao condomínio', cards: [
      { selo: 'Pay per use', texto: 'As famílias inscrevem os alunos e pagam direto.' },
      { selo: 'Rateio', texto: 'O condomínio paga, e as aulas ficam abertas a todos os moradores.' },
      { selo: 'Pacote', texto: 'O condomínio monta mais de uma turma, para públicos diferentes.' } ] },
    { tipo: 'texto', kicker: 'Modelo 1', titulo: 'Pay <em>per use</em>', paragrafos: [
      '<b>Quem paga:</b> cada família, pelo aluno inscrito.',
      '<b>O condomínio:</b> cede o espaço e o horário. Não entra nada na cota.',
      '<b>Funciona melhor quando</b> há muitas crianças da mesma faixa de idade e parte dos moradores não quer custo novo.' ] },
    { tipo: 'texto', kicker: 'Modelo 2', titulo: '<em>Rateio</em>', paragrafos: [
      '<b>Quem paga:</b> o condomínio, com um valor fixo na cota.',
      '<b>Quem participa:</b> todos os moradores, dentro das vagas de cada turma.',
      '<b>Funciona melhor quando</b> o condomínio quer oferecer o benefício a todos e valorizar a área de lazer.' ] },
    { tipo: 'texto', kicker: 'Modelo 3', titulo: '<em>Pacote</em> de turmas', paragrafos: [
      '<b>O que é:</b> duas ou mais turmas para públicos diferentes, como crianças no fim da tarde e 60+ pela manhã.',
      '<b>Funciona melhor</b> em condomínios grandes, com procura variada e espaço para mais de um horário.',
      'As atividades são escolhidas conforme a procura dos moradores.' ] },
    { tipo: 'lista', kicker: 'Na assembleia', titulo: 'O que precisa de <em>aprovação</em>', itens: [
      '<b>Em todos os modelos:</b> o uso do espaço, os dias e os horários das aulas.',
      '<b>No rateio e no pacote:</b> também a nova despesa, conforme a convenção do condomínio.',
      '<b>Antes da votação:</b> uma aula experimental ajuda os moradores a decidir vendo, não só lendo.' ] },
    { tipo: 'lista', kicker: 'No contrato', titulo: 'O que pedir por <em>escrito</em>', itens: [
      'Professores qualificados e com experiência na faixa de idade',
      'Turmas separadas por idade e limite de alunos por espaço',
      'Dias, horários e regras de cancelamento',
      'Aula experimental antes de começar',
      'Relatório de frequência para o síndico' ] },
    { tipo: 'fim', kicker: 'Resumo', titulo: 'Não existe modelo certo. Existe o que combina com os <em>moradores</em>.', sub: 'A MM Sports monta a proposta conforme o perfil do condomínio, em qualquer um dos três modelos.', cta: 'Fale com a gente: mmsports.me' },
  ],
};

(async () => {
  const paginas = CARROSSEIS[NOME];
  if (!paginas) { console.error('Carrossel desconhecido. Opções: ' + Object.keys(CARROSSEIS).join(', ')); process.exit(1); }
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.setContent(html(paginas), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.join(OUT, NOME + '.pdf'), width: '1080px', height: '1350px', printBackground: true });
  await page.screenshot({ path: path.join(OUT, NOME + '-capa.jpg'), type: 'jpeg', quality: 88, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
  // Prévia de cada página para revisão (fora do site): PREVIA=<pasta>.
  if (process.env.PREVIA) {
    fs.mkdirSync(process.env.PREVIA, { recursive: true });
    for (let i = 0; i < paginas.length; i++) {
      await page.screenshot({ path: path.join(process.env.PREVIA, `${NOME}-${i + 1}.jpg`), type: 'jpeg', quality: 80, clip: { x: 0, y: i * 1350, width: 1080, height: 1350 }, fullPage: true });
    }
  }
  await browser.close();
  console.log('ok', NOME, paginas.length, 'páginas');
})();
