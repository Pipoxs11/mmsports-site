// Worker do site mmsports.me.
// Os arquivos da pasta `site` continuam sendo servidos direto pelo Cloudflare.
// Este código só responde às rotas /api/interesse/..., usadas pelas pesquisas de
// interesse dos condomínios (ex.: mmsports.me/solar-dos-amigos/).
// As respostas ficam guardadas num Durable Object (SQLite), um por pesquisa.

import { DurableObject } from "cloudflare:workers";

// Pesquisas aceitas. Só os SHA-256 das chaves ficam no repositório:
// - acessoSha256: código que vai no link do formulário enviado aos moradores
//   (sem ele, a página não abre o formulário e o envio é recusado);
// - leitores: chaves que abrem o painel de resultados (uma por pessoa,
//   para poder trocar a de alguém sem afetar os outros).
const PESQUISAS = {
  "solar-dos-amigos": {
    acessoSha256: "3639815b146aefcf88e11bfbe47b56885ec0b20bf6fd1fe6cd191149f1e90de9",
    leitores: {
      felipe: "ef38d068460e344a48e2c615063b5fee2fc143094b2e1ed1e91c672493b1fa4b",
      sindica: "d2ce02b2a1241684f193d203b1be1564fbcea1e3a6d486cdf7cca62f36a68008",
    },
  },
};

const LIMITE_CORPO = 8 * 1024;

function json(dados, status = 200, extra = {}) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });
}

async function sha256(texto) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function iguais(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

const texto = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const lista = (v, maxItens, maxTam) =>
  Array.isArray(v) ? [...new Set(v.filter((x) => typeof x === "string").map((x) => x.trim().slice(0, maxTam)).filter(Boolean))].slice(0, maxItens) : [];

function limpar(d) {
  const atividades = {};
  if (d && typeof d.atividades === "object" && !Array.isArray(d.atividades)) {
    for (const [faixa, itens] of Object.entries(d.atividades).slice(0, 10)) {
      const l = lista(itens, 20, 60);
      if (l.length) atividades[texto(faixa, 60)] = l;
    }
  }
  return {
    faixas: lista(d.faixas, 10, 60),
    atividades,
    outra: texto(d.outra, 200),
    dias: lista(d.dias, 7, 20),
    periodos: lista(d.periodos, 4, 40),
    nome: texto(d.nome, 80),
    unidade: texto(d.unidade, 40),
    whatsapp: texto(d.whatsapp, 30),
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const m = url.pathname.match(/^\/api\/interesse\/([a-z0-9-]+)(\/respostas|\/acesso)?\/?$/);
    if (!m) return env.ASSETS.fetch(request);

    const slug = m[1];
    const pesquisa = PESQUISAS[slug];
    if (!pesquisa) return json({ erro: "Pesquisa não encontrada." }, 404);
    const stub = env.INTERESSE.get(env.INTERESSE.idFromName(slug));

    const acessoOk = async (c) => !!c && iguais(await sha256(c), pesquisa.acessoSha256);

    if (m[2] === "/acesso") {
      return (await acessoOk(url.searchParams.get("c") || "")) ? json({ ok: true }) : json({ erro: "Código inválido." }, 401);
    }

    if (!m[2]) {
      if (request.method !== "POST") return json({ erro: "Use POST." }, 405, { allow: "POST" });
      const origem = request.headers.get("origin");
      if (origem && origem !== url.origin) return json({ erro: "Origem não permitida." }, 403);
      const corpo = await request.text();
      if (corpo.length > LIMITE_CORPO) return json({ erro: "Resposta grande demais." }, 413);
      let d;
      try { d = JSON.parse(corpo); } catch { return json({ erro: "Formato inválido." }, 400); }
      if (!(await acessoOk(d && typeof d.acesso === "string" ? d.acesso : ""))) return json({ erro: "Link sem permissão." }, 403);
      if (d && d.site) return json({ ok: true }); // campo-isca contra robôs
      const r = limpar(d);
      if (!r.faixas.length) return json({ erro: "Escolha ao menos uma faixa etária." }, 400);
      await stub.salvar(r);
      return json({ ok: true });
    }

    if (request.method !== "GET") return json({ erro: "Use GET." }, 405, { allow: "GET" });
    const chave = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "") || url.searchParams.get("k") || "";
    const h = chave ? await sha256(chave) : "";
    if (!h || !Object.values(pesquisa.leitores).some((x) => iguais(h, x))) return json({ erro: "Chave inválida." }, 401);
    return json({ pesquisa: slug, respostas: await stub.listar() });
  },
};

export class Interesse extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS respostas (id INTEGER PRIMARY KEY AUTOINCREMENT, criado_em TEXT NOT NULL, dados TEXT NOT NULL)"
    );
  }

  salvar(r) {
    this.ctx.storage.sql.exec("INSERT INTO respostas (criado_em, dados) VALUES (?, ?)", new Date().toISOString(), JSON.stringify(r));
  }

  listar() {
    return this.ctx.storage.sql
      .exec("SELECT id, criado_em, dados FROM respostas ORDER BY id")
      .toArray()
      .map((l) => ({ id: l.id, criado_em: l.criado_em, ...JSON.parse(l.dados) }));
  }
}
