# Guia da rotina semanal de conteúdo da MM Sports

Este arquivo orienta a tarefa agendada que, toda segunda-feira, publica um artigo novo no blog e agenda 2 posts por semana no Instagram (@mmsports.me) e no LinkedIn do Matheus de Moraes, pelo Metricool. A pasta `conteudo/` não é publicada no site (o Netlify publica só `site/`).

## Calendário
- **Segunda:** a rotina roda. O artigo do blog vai ao ar no mesmo dia (PR com merge na main e conferência do deploy no Netlify).
- **Terça, 8h (America/Sao_Paulo):** post 1, que divulga o artigo novo do blog.
- **Quinta, 8h (America/Sao_Paulo):** post 2, com um tema diferente (dica, dado, bastidor, modalidade, idosos...).
- Antes de criar algo, registre em `pautas.md` e confira o que já saiu, para não repetir tema nem palavra-chave principal.

## Fatos que podem ser usados (não invente outros)
- A MM Sports é uma assessoria esportiva em condomínios de São Paulo, com foco no Morumbi, Panamby e Vila Andrade.
- É conduzida por Matheus de Moraes, professor de Educação Física (bacharel e licenciado), com 10 anos de experiência em esporte educacional. É técnico desportivo na Prefeitura de Taboão da Serra desde 2020 e atuou nas categorias de base do Clube Atlético Taboão da Serra.
- Atende o Misti Morumbi desde 2023, no modelo pay per use, com mais de 50 crianças por semana.
- As aulas têm 1 hora, uma vez por semana, com até 15 alunos por turma, separadas por idade.
- Modalidades: futsal e futebol (4 a 12 anos), vôlei e basquete (12 a 17 anos), ginástica e vôlei adaptado (60 anos ou mais). Não citar psicomotricidade.
- Modelos de contratação: pay per use (as famílias pagam, sem custo para o condomínio), rateio (valor fixo na cota condominial) e pacote com mais de uma turma. **Nunca cite preços nem valores.**
- Etapas: conversa com síndico e conselho, visita técnica, aula experimental e apresentação em assembleia.
- Dado externo de referência: a OMS recomenda 60 minutos por dia de atividade moderada a vigorosa para quem tem de 5 a 17 anos, e 150 a 300 minutos por semana para adultos e idosos, com exercícios de equilíbrio e força.

## Blog (SEO)
- Siga o formato dos artigos em `site/blog/` (cabeçalho, rodapé, JSON-LD `BlogPosting`, linha de autor e data, caixa de CTA no final).
- Escreva de 700 a 1.100 palavras, com uma palavra-chave principal no título, na URL (slug sem acentos), na meta description (até 155 caracteres), no primeiro parágrafo e em um H2. Inclua uma seção de perguntas frequentes e de 2 a 3 links internos para outros artigos.
- Atualize `site/blog/index.html` (novo artigo no topo), os 3 destaques "No blog" de `site/index.html` (os 3 mais recentes) e `site/sitemap.xml` (com `lastmod`).
- Alterne públicos: síndicos e administradoras, famílias com crianças, adolescentes, idosos (60+), conselho e assembleia. Alterne também a intenção de busca: guia, checklist, comparação, dúvidas, bairro ("aulas de futsal em condomínio no Morumbi").

## Instagram e LinkedIn
- **Instagram:** legenda curta (até cerca de 1.200 caracteres), gancho na primeira linha, quebras de linha, CTA "Link na bio" ou "Chame no WhatsApp pelo link da bio", e de 5 a 10 hashtags no fim (#condominio #sindico #morumbi #panamby #futsalinfantil #esporteinfantil ...).
- **LinkedIn (perfil pessoal do Matheus):** primeira pessoa, tom de professor e empreendedor, de 900 a 1.500 caracteres, gancho nas 2 primeiras linhas, parágrafos curtos, uma pergunta no final para gerar comentário, de 3 a 5 hashtags. No post de terça, coloque o link do artigo no texto.
- Mesmo tema nos dois, com texto adaptado a cada rede.

## Arte
- Uma arte por post, gerada com `NODE_PATH=$(npm root -g) node conteudo/render.js conteudo/posts/AAAA-MM-DD.json site/social/AAAA-MM-DD.jpg`.
- JSON: `kicker` (ex.: "Para síndicos", "Novo no blog", "Para famílias", "60+"), `titulo` (até cerca de 60 caracteres), `texto` (1 a 2 frases), `foto` (opcional: `turma.jpg`, `aula.jpg`, `hero.jpg`, `matheus.jpg` de `site/images/`) e `tema` (`navy`, `gol` ou `paper`). Alterne os temas e abra a imagem para conferir antes de publicar.
- A arte vai no mesmo PR do artigo. Depois do deploy, a URL pública é `https://mmsports.me/social/AAAA-MM-DD.jpg`, que é a que vai para o Metricool.

## Metricool
- Marca (blogId) 7617134, fuso America/Sao_Paulo. Confira em `getBrandSettings` quais redes estão conectadas e agende só nelas. Se o LinkedIn ainda não estiver conectado, publique só no Instagram e avise no resumo.
- Use `createScheduledPost` com `autoPublish: true`, `instagramData: {"type":"POST"}` e a imagem em `media`. No LinkedIn, `linkedinData: {}`.
- Depois de agendar, confira com `getScheduledPosts`.
