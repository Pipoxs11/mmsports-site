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
const F = '/mnt/project-files/fotos/';
// Foto sempre inteira: contain sobre a própria foto desfocada.
const box = (f, h) => { const src = uri(F + f, 'image/jpeg'); return `<div class="ph" style="height:${h}px"><div class="b" style="background-image:url('${src}')"></div><div class="f" style="background-image:url('${src}')"></div></div>`; };

const C = { tinta: '#0E1B3D', cobalto: '#2B4BFF', creme: '#FFF6E8', laranja: '#FF6A2B', nevoa: '#DDE4FF' };
const TEMAS = {
  navy: { bg: C.tinta, fg: C.creme, acc: C.laranja, card: '#17264f', logo: logoNeg },
  creme: { bg: C.creme, fg: C.tinta, acc: C.cobalto, card: '#FFFFFF', logo: logoCor },
};

// Tipos de página: capa, texto (titulo + paragrafos), lista (titulo + itens, numeração a partir de 'inicio'),
// modelo (titulo + cards com selo), foto (foto real inteira + titulo + legenda), fim.
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
      <div class="lista">${p.itens.map((x, n) => `<div class="it"><div class="n" style="background:${t.acc}">${(p.inicio || 1) + n}</div><div>${x}</div></div>`).join('')}</div>`;
  } else if (p.tipo === 'modelo') {
    corpo = `<div class="k" style="color:${t.acc}">${p.kicker}</div><h2>${p.titulo}</h2>
      <div class="cards">${p.cards.map(c => `<div class="card" style="background:${t.card}"><div class="selo" style="color:${t.acc}">${c.selo}</div><div class="ct">${c.texto}</div></div>`).join('')}</div>`;
  } else if (p.tipo === 'foto') {
    corpo = `${box(p.foto, p.altura || 560)}${p.kicker ? `<div class="k" style="color:${t.acc};margin-top:44px">${p.kicker}</div>` : '<div style="height:44px"></div>'}<h2 class="ft">${p.titulo}</h2>
      <p class="par">${p.legenda}</p>`;
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
.foot img{height:62px}
.ph{position:relative;width:100%;border-radius:28px;overflow:hidden;flex:none}
.ph .b{position:absolute;inset:-30px;background-size:cover;background-position:center;filter:blur(24px) brightness(.75)}
.ph .f{position:absolute;inset:0;background-size:contain;background-repeat:no-repeat;background-position:center}
h2.ft{font-size:64px;margin-bottom:26px}
h2.ft+.par{font-size:38px;margin-bottom:0}`;

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
  'regras-da-quadra': [
    { tipo: 'capa', kicker: 'Gestão da área de lazer', titulo: '7 regras para dividir a <em>quadra</em> sem briga', sub: 'O que colocar no regulamento quando o condomínio passa a ter aulas esportivas.' },
    { tipo: 'texto', kicker: 'Antes das regras', titulo: 'A briga não é pela <em>quadra</em>', paragrafos: [
      'É pela falta de combinado. Quando ninguém sabe quem usa e quando, cada morador decide por conta própria.',
      'Aula e jogo livre cabem no mesmo espaço. O que resolve é <b>regra escrita, aprovada e publicada</b>.' ] },
    { tipo: 'lista', kicker: 'Tempo', titulo: 'Quem usa e <em>quando</em>', itens: [
      '<b>Grade fixa e publicada</b> no mural e no app do condomínio, com dias e horários das aulas.',
      '<b>Jogo livre garantido:</b> horários reservados para os moradores usarem a quadra sem aula.',
      '<b>Prioridade clara:</b> no horário da aula, a turma tem preferência. Fora dele, vale a reserva.' ] },
    { tipo: 'lista', kicker: 'Segurança', titulo: 'Quantos e <em>como</em>', inicio: 4, itens: [
      '<b>Limite de alunos por espaço,</b> conforme o tamanho da quadra e a atividade.',
      '<b>Material guardado e conferido:</b> o professor confere bolas, redes e cones no fim de cada aula.' ] },
    { tipo: 'lista', kicker: 'Convivência', titulo: 'Como <em>conviver</em>', inicio: 6, itens: [
      '<b>Crianças pequenas com responsável</b> fora do horário de aula.',
      '<b>Um canal só para sugestões e problemas:</b> por escrito, para o síndico ou a administradora. O grupo de WhatsApp não é canal oficial.' ] },
    { tipo: 'fim', kicker: 'Resumo', titulo: 'Regra escrita evita a <em>discussão</em> na assembleia.', sub: 'Quando a MM Sports começa num condomínio, a proposta já leva uma sugestão de regras de uso da quadra.', cta: 'Fale com a gente: mmsports.me' },
  ],
  'da-ideia-a-assembleia': [
    { tipo: 'capa', kicker: 'Passo a passo para síndicos', titulo: 'Da ideia à <em>assembleia</em>', sub: 'Como levar aulas esportivas ao condomínio, do primeiro pedido dos moradores até a primeira aula.' },
    { tipo: 'lista', kicker: 'Antes de tudo', titulo: '<em>Ouvir</em> e mapear', itens: [
      '<b>Ouvir os moradores:</b> uma pesquisa rápida com idades, interesses e horários livres.',
      '<b>Mapear o espaço:</b> quadra, salão de festas, área verde e os horários em que ficam vazios.',
      '<b>Pedir proposta por escrito:</b> turmas, horários, modelo de contratação e regras de uso.' ] },
    { tipo: 'lista', kicker: 'Mostrar antes de votar', titulo: 'Ver para <em>decidir</em>', inicio: 4, itens: [
      '<b>Visita técnica:</b> o professor conhece o espaço e ajusta a proposta à realidade do prédio.',
      '<b>Aula experimental aberta:</b> os moradores decidem vendo a aula, não só lendo a proposta.' ] },
    { tipo: 'lista', kicker: 'Aprovar e começar', titulo: 'Assembleia e <em>largada</em>', inicio: 6, itens: [
      '<b>Pauta clara no edital:</b> uso do espaço, dias, horários e, se houver, a nova despesa.',
      '<b>Comunicar e começar:</b> grade publicada, inscrições abertas e data da primeira aula.' ] },
    { tipo: 'texto', kicker: 'Cuidado', titulo: 'Três erros que <em>travam</em> a aprovação', paragrafos: [
      '<b>Votar em "assuntos gerais".</b> Despesa nova precisa estar na pauta do edital.',
      '<b>Levar só a ideia.</b> Sem proposta escrita, a discussão vira opinião contra opinião.',
      '<b>Esquecer quem não tem filhos.</b> Mostre turmas para adultos e 60+ e as regras do jogo livre.' ] },
    { tipo: 'fim', kicker: 'Resumo', titulo: 'Assembleia bem preparada aprova em <em>uma</em> reunião.', sub: 'A MM Sports faz a visita técnica, a proposta por escrito e a aula experimental antes da votação.', cta: 'Fale com a gente: mmsports.me' },
  ],
  'bastidores-das-aulas': [
    { tipo: 'capa', kicker: 'Bastidores reais', titulo: 'O que acontece numa <em>aula</em> no condomínio', sub: 'Desde 2023, mais de 50 crianças por semana no Misti Morumbi. Por dentro do nosso jeito de dar aula.' },
    { tipo: 'modelo', kicker: 'Em números', titulo: 'Uma operação <em>real</em>', cards: [
      { selo: 'Desde 2023', texto: 'No mesmo condomínio, o Misti Morumbi, em São Paulo.' },
      { selo: '50+ crianças por semana', texto: 'Em turmas separadas por idade.' },
      { selo: 'Pay per use', texto: 'As famílias inscrevem os filhos. O condomínio não tem custo na cota.' } ] },
    { tipo: 'foto', foto: 'futsal-infantil/futsal-5a8-roda-de-conversa-vertical.jpg', altura: 600, kicker: 'Antes do jogo', titulo: 'Toda aula começa com uma <em>conversa</em>', legenda: 'Combinados do dia, quem ajuda quem e por que o exercício importa.' },
    { tipo: 'foto', foto: 'futebol-infantil/futebol-4a7-turma-elasticos-panoramica.jpg', altura: 480, kicker: 'Os pequenos', titulo: 'Brincar também é <em>treino</em>', legenda: 'Coordenação, equilíbrio e regras de convivência, com material pensado para a idade.' },
    { tipo: 'foto', foto: 'volei/volei-12a17-turma-quadra-aberta-horizontal.jpg', altura: 520, kicker: 'Os adolescentes', titulo: 'Técnica e <em>time</em>', legenda: 'Fundamentos, autonomia e a turma como um grupo de amigos fora da tela.' },
    { tipo: 'foto', foto: 'adultos/turma-adultos-quadra-rede-vermelha.jpg', altura: 560, kicker: 'Os adultos', titulo: 'A quadra não é só das <em>crianças</em>', legenda: 'Turmas no horário de quem trabalha. A grade segue a procura dos moradores.' },
    { tipo: 'fim', kicker: 'O que fica', titulo: 'Quadra cheia num dia <em>comum</em> de semana.', sub: 'É assim que a gente mede uma área de lazer bem usada.', cta: 'Conheça a MM Sports: mmsports.me' },
  ],
  'cada-idade': [
    { tipo: 'capa', kicker: 'Esporte em cada fase da vida', titulo: 'Cada idade precisa de uma <em>coisa</em>', sub: 'Por que turmas separadas por idade fazem toda a diferença, e o que cada uma precisa.' },
    { tipo: 'modelo', kicker: 'Crianças e adolescentes', titulo: 'Do brincar ao <em>treinar</em>', cards: [
      { selo: '4 a 6 anos', texto: 'Coordenação, equilíbrio e regras simples. Aulas curtas e muita brincadeira.' },
      { selo: '7 a 11 anos', texto: 'Fundamentos, jogo em equipe e aprender a ganhar e a perder.' },
      { selo: '12 a 17 anos', texto: 'Técnica, autonomia e pertencimento. A turma vira grupo de amigos.' } ] },
    { tipo: 'modelo', kicker: 'Adultos e 60+', titulo: 'Saúde e <em>convivência</em>', cards: [
      { selo: 'Adultos', texto: 'Funcional, pilates, ritmos e lutas, no horário depois do trabalho.' },
      { selo: '60 anos ou mais', texto: 'Força, equilíbrio e mobilidade. Menos risco de queda, mais autonomia.' },
      { selo: 'Para todos', texto: 'Professor que adapta o exercício a quem está na turma.' } ] },
    { tipo: 'lista', kicker: 'Para o síndico', titulo: 'Como montar a <em>grade</em>', itens: [
      '<b>Separar por idade,</b> com limite de alunos por espaço.',
      '<b>Horário que cabe na rotina:</b> crianças depois da escola, 60+ pela manhã, adultos à noite.',
      '<b>Variar as atividades</b> conforme a procura: esportes, danças, lutas, ginástica.' ] },
    { tipo: 'fim', kicker: 'Resumo', titulo: 'Turma misturada <em>afasta</em>. Turma certa fideliza.', sub: 'A MM Sports monta a grade do condomínio por faixa de idade, conforme o perfil dos moradores.', cta: 'Fale com a gente: mmsports.me' },
  ],
  'ferias-no-condominio': [
    { tipo: 'capa', kicker: 'Guia para síndicos', titulo: 'Férias de verão no <em>condomínio</em>', sub: 'Como planejar dezembro e janeiro com as crianças em casa e as áreas comuns cheias.' },
    { tipo: 'texto', kicker: 'O cenário', titulo: 'Dezembro chega <em>rápido</em>', paragrafos: [
      'Escola fechada, crianças em casa o dia todo e quadra, piscina e playground lotados ao mesmo tempo.',
      'Sem planejamento, sobram <b>reclamação de barulho, disputa por espaço e risco</b> de acidente.' ] },
    { tipo: 'lista', kicker: 'Planejar em novembro', titulo: 'O que fazer <em>agora</em>', itens: [
      '<b>Levantar</b> quantas crianças ficam no condomínio e em quais idades.',
      '<b>Definir</b> espaços e horários para atividades orientadas.',
      '<b>Revisar</b> as regras de uso da quadra e da piscina para o período.',
      '<b>Comunicar cedo,</b> antes de as famílias fecharem a programação das férias.' ] },
    { tipo: 'lista', kicker: 'Ideias que funcionam', titulo: 'Atividades para o <em>verão</em>', itens: [
      'Circuito esportivo pela manhã, antes do sol forte',
      'Gincana e torneio entre blocos ou torres',
      'Dança e ritmos em área coberta nos dias de calor',
      'Aula aberta para pais e filhos no fim de semana' ] },
    { tipo: 'lista', kicker: 'Segurança', titulo: 'O que não pode <em>faltar</em>', itens: [
      'Professor responsável e limite de crianças por atividade',
      'Hidratação, protetor solar e pausas na sombra',
      'Autorização dos responsáveis para cada criança' ] },
    { tipo: 'fim', kicker: 'Resumo', titulo: 'Férias organizadas viram <em>lembrança</em> boa.', sub: 'A MM Sports monta atividades orientadas conforme o perfil e o espaço de cada condomínio.', cta: 'Conheça a MM Sports: mmsports.me' },
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
