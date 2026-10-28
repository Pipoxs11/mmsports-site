# Guia da rotina semanal de conteúdo da MM Sports

Este arquivo orienta a tarefa agendada que, toda segunda-feira, publica um artigo novo no blog e agenda 2 posts por semana no Instagram (@mmsports.me) pelo Metricool. O LinkedIn ficou de fora (plano gratuito do Metricool). A pasta `conteudo/` não é publicada no site (o Netlify publica só `site/`).

## Calendário
- **Segunda:** a rotina roda. O artigo do blog vai ao ar no mesmo dia (PR com merge na main e conferência do deploy no Netlify).
- **Terça, 8h (America/Sao_Paulo):** post 1, que divulga o artigo novo do blog.
- **Quinta, 8h (America/Sao_Paulo):** post 2, com um tema diferente (dica, dado, bastidor, uma atividade diferente a cada vez, idosos...).
- Antes de criar algo, registre em `pautas.md` e confira o que já saiu, para não repetir tema nem palavra-chave principal.

## Fatos que podem ser usados (não invente outros)
- A MM Sports leva esporte para condomínios de São Paulo. O descritor oficial é "Esporte no condomínio" (não use "assessoria esportiva").
- Fale em "São Paulo". Não restrinja a comunicação a bairros (pedido do Felipe). Citar um bairro como exemplo ou como palavra-chave de um artigo pontual é aceitável, mas não como a única área de atuação.
- É conduzida por Matheus de Moraes, professor de Educação Física (bacharel e licenciado), com 10 anos de experiência em esporte educacional. É técnico desportivo na Prefeitura de Taboão da Serra desde 2020 e atuou nas categorias de base do Clube Atlético Taboão da Serra.
- **Não repita "formado em Educação Física"** (pedido do Felipe, 26/10/2026). Use no máximo uma vez por texto, e só quando a formação for o ponto. Prefira variações mais chamativas e alterne: "especialistas em esporte", "professores experientes", "equipe especializada", "profissionais qualificados", "professores com anos de quadra", "especialistas em esporte educacional", "time de professores apaixonados por esporte". Na assinatura dos artigos use "Por Matheus de Moraes, especialista em esporte educacional".
- Atende o Misti Morumbi desde 2023, no modelo pay per use, com mais de 50 crianças por semana.
- Cada turma tem 2 horas de aula por semana, divididas em dois dias, com 15 a 20 alunos conforme modalidade, espaço e condições de segurança, separadas por idade.
- Atividades: a MM Sports oferece um leque amplo, não só esportes com bola. Exemplos: futsal, futebol, vôlei, basquete, ritmos e danças, pilates, lutas, ginástica, funcional e vôlei adaptado para 60+. As atividades são montadas conforme o condomínio e a procura. Não citar psicomotricidade.
- **Não foque sempre nas mesmas modalidades** (pedido do Felipe). Ao citar atividades, varie e mostre a amplitude (danças, pilates, lutas etc.). Alterne o tema dos posts e artigos entre atividades diferentes. Sem inventar detalhes: não diga que uma modalidade "já acontece" em um condomínio sem confirmação. A turma do Misti Morumbi é de esporte com crianças.
- Modelos de contratação: pay per use (as famílias pagam, sem custo para o condomínio), rateio (valor fixo na cota condominial) e pacote com mais de uma turma. **Nunca cite preços nem valores.**
- Etapas: conversa com síndico e conselho, visita técnica, aula experimental e apresentação em assembleia.
- Dado externo de referência: a OMS recomenda 60 minutos por dia de atividade moderada a vigorosa para quem tem de 5 a 17 anos, e 150 a 300 minutos por semana para adultos e idosos, com exercícios de equilíbrio e força.

## Blog (SEO)
- Siga o formato dos artigos em `site/blog/` (cabeçalho, rodapé, JSON-LD `BlogPosting`, linha de autor e data, caixa de CTA no final).
- Escreva de 700 a 1.100 palavras, com uma palavra-chave principal no título, na URL (slug sem acentos), na meta description (até 155 caracteres), no primeiro parágrafo e em um H2. Inclua uma seção de perguntas frequentes e de 2 a 3 links internos para outros artigos.
- Atualize `site/blog/index.html` (novo artigo no topo), os 3 destaques "No blog" de `site/index.html` (os 3 mais recentes) e `site/sitemap.xml` (com `lastmod`).
- Alterne públicos: síndicos e administradoras, famílias com crianças, adolescentes, idosos (60+), conselho e assembleia. Alterne também a intenção de busca: guia, checklist, comparação, dúvidas, termos locais ("aulas de dança em condomínio em São Paulo", "pilates no condomínio", "aulas de luta para crianças no condomínio").

## Instagram e LinkedIn
- **Instagram:** legenda curta (até cerca de 1.200 caracteres), gancho na primeira linha, quebras de linha, CTA "Link na bio" ou "Chame no WhatsApp pelo link da bio", e de 5 a 10 hashtags no fim (#esportenocondominio #condominio #sindico #atividadefisica #qualidadedevida #saopaulo, mais hashtags da atividade do post ...).
- **LinkedIn (perfil pessoal do Matheus):** primeira pessoa, tom de professor e empreendedor, de 900 a 1.500 caracteres, gancho nas 2 primeiras linhas, parágrafos curtos, uma pergunta no final para gerar comentário, de 3 a 5 hashtags. No post de terça, coloque o link do artigo no texto.
- Mesmo tema nos dois, com texto adaptado a cada rede.
- **Fotos sem repetição (regra do Felipe, 28/10/2026):** nunca use a mesma foto no perfil do Matheus e na página da MM Sports no LinkedIn, e evite repetir foto no mesmo perfil. Antes de agendar, confira no Buffer (`list_posts`) quais fotos já saíram ou estão na fila. Use o banco de fotos em `/mnt/project-files/fotos/` (catálogo no README de lá), sempre dentro de uma onepage (veja **Arte**). Só use foto de criança com autorização dos responsáveis.
- **Onepages em vez de fotos soltas (regra do Felipe, 28/10/2026):** não poste mais foto solta. Posts com imagem usam uma onepage visual sem preços (gerador `conteudo/onepages.js`, modelos e legendas em `/mnt/project-files/onepages/`; veja **Arte**), variando entre onepage com foto real, só texto, ou imagem ilustrativa gerada e atrativa. Cada arte vai para um canal só, sem repetir a mesma arte em canais diferentes em datas próximas.

## Arte
- **Sempre onepage, nunca foto solta (regra do Felipe, 28/10/2026).** Todo post com imagem, no Instagram e no LinkedIn (página e perfil do Matheus), leva uma onepage: arte de uma página, 1080x1350, na identidade da marca e sem preços. A foto real, quando houver, entra dentro da arte.
- Varie o formato: com foto real, só texto (frase, mito ou verdade, checklist, enquete) e com ilustração (gráfico, ícones, número grande). Não repita o mesmo formato em posts seguidos.
- Gerador das onepages: `NODE_PATH=$(npm root -g) node conteudo/onepages.js` (gera tudo em `site/social/onepages/`; passe a pasta e os nomes para gerar só algumas). Para uma arte nova, acrescente uma entrada em `pages` seguindo os modelos que já existem. URL pública depois do deploy: `https://mmsports.me/social/onepages/<nome>.jpg`.
- Cada onepage vai para um canal só. Registre em `/mnt/project-files/onepages/legendas.md` onde e quando cada uma saiu.
- Uma arte por post, gerada com `NODE_PATH=$(npm root -g) node conteudo/render.js conteudo/posts/AAAA-MM-DD.json site/social/AAAA-MM-DD.jpg`.
- JSON: `kicker` (ex.: "Para síndicos", "Novo no blog", "Para famílias", "60+"), `titulo` (até cerca de 60 caracteres), `texto` (1 a 2 frases), `foto` (opcional: `turma.jpg`, `aula.jpg`, `hero.jpg`, `matheus.jpg` de `site/images/`) e `tema` (`navy`, `gol` ou `paper`). Alterne os temas e abra a imagem para conferir antes de publicar.
- A arte vai no mesmo PR do artigo. Depois do deploy, a URL pública é `https://mmsports.me/social/AAAA-MM-DD.jpg`, que é a que vai para o Metricool.

## Metricool
- Marca (blogId) 7617134, fuso America/Sao_Paulo. Confira em `getBrandSettings` quais redes estão conectadas e agende só nelas. Se o LinkedIn ainda não estiver conectado, publique só no Instagram e avise no resumo.
- Use `createScheduledPost` com `autoPublish: true`, `instagramData: {"type":"POST"}` e a imagem em `media`. No LinkedIn, `linkedinData: {}`.
- Depois de agendar, confira com `getScheduledPosts`.
