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
//   para poder trocar a de alguém sem afetar os outros). Só quem tem
//   admin: true pode apagar respostas.
const PESQUISAS = {
  "solar-dos-amigos": {
    acessoSha256: "3639815b146aefcf88e11bfbe47b56885ec0b20bf6fd1fe6cd191149f1e90de9",
    leitores: {
      felipe: { sha256: "ef38d068460e344a48e2c615063b5fee2fc143094b2e1ed1e91c672493b1fa4b", admin: true },
      sindica: { sha256: "d2ce02b2a1241684f193d203b1be1564fbcea1e3a6d486cdf7cca62f36a68008" },
    },
  },
  "lavance-morumbi": {
    acessoSha256: "8502390b7ce38aabda1d75699069db7a0c02b9978ec4442c95fa3421e935f0a6",
    leitores: {
      felipe: { sha256: "ef38d068460e344a48e2c615063b5fee2fc143094b2e1ed1e91c672493b1fa4b", admin: true },
      sindico: { sha256: "5e4aaf35e001f5d266624929ef5bc659e2297a84a404605f0cbf4ebaf4eb25cd" },
    },
  },
  "lake-tahoe": {
    acessoSha256: "16c52a7840e04a85ccc152a5c469b8fc7bd47019641fe3bddccf264c09accc50",
    leitores: {
      felipe: { sha256: "ef38d068460e344a48e2c615063b5fee2fc143094b2e1ed1e91c672493b1fa4b", admin: true },
      sindico: { sha256: "4692c2bb32c1629df1ea8dab5c3d39641f95d0a0bf58e907267d9d2b8ed8b31a" },
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
  // Formato novo: uma entrada por pessoa da casa (pode haver 2 crianças da mesma idade).
  const pessoas = (Array.isArray(d.pessoas) ? d.pessoas : []).slice(0, 30)
    .map((p) => ({ faixa: texto(p && p.faixa, 60), atividades: lista(p && p.atividades, 20, 60) }))
    .filter((p) => p.faixa);
  return {
    pessoas,
    faixas: pessoas.length ? [...new Set(pessoas.map((p) => p.faixa))] : lista(d.faixas, 10, 60),
    atividades,
    outra: texto(d.outra, 200),
    dias: lista(d.dias, 2, 20),
    periodos: lista(d.periodos, 1, 40),
    nome: texto(d.nome, 80),
    bloco: texto(d.bloco, 20),
    apto: texto(d.apto, 10),
    unidade: [texto(d.bloco, 20) && "Bloco " + texto(d.bloco, 20).replace(/^(bloco|torre)\s*/i, ""), texto(d.apto, 10) && "ap. " + texto(d.apto, 10)].filter(Boolean).join(", "),
    dispositivo: /^[a-z0-9-]{8,40}$/i.test(d.dispositivo || "") ? d.dispositivo : "",
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
      if (!r.nome || !r.bloco || !r.apto) return json({ erro: "Informe nome, bloco e apartamento." }, 400);
      // Uma resposta por aparelho (celular ou computador): cookie do servidor + id guardado no
      // navegador. Por IP não dá: redes móveis e o Wi-Fi do condomínio fazem
      // vários vizinhos aparecerem com o mesmo IP.
      const nomeCookie = "mm_" + slug.replace(/-/g, "_");
      const cookie = (request.headers.get("cookie") || "").match(new RegExp("(?:^|;\\s*)" + nomeCookie + "=([a-z0-9-]{8,40})", "i"));
      const ids = [...new Set([cookie && cookie[1], r.dispositivo].filter(Boolean))];
      const id = ids[0] || crypto.randomUUID();
      delete r.dispositivo;
      // Só um resumo do IP, para o painel apontar respostas da mesma conexão.
      r.ip = (await sha256(slug + (request.headers.get("cf-connecting-ip") || ""))).slice(0, 12);
      const repetido = { erro: "Este aparelho já respondeu.", codigo: "repetido" };
      if (!(await stub.salvar(ids.length ? ids : [id], r))) return json(repetido, 409);
      return json({ ok: true }, 200, {
        "set-cookie": nomeCookie + "=" + id + "; Max-Age=31536000; Path=/; Secure; HttpOnly; SameSite=Lax",
      });
    }

    if (request.method !== "GET" && request.method !== "DELETE") return json({ erro: "Use GET." }, 405, { allow: "GET, DELETE" });
    const chave = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "") || url.searchParams.get("k") || "";
    const h = chave ? await sha256(chave) : "";
    const leitor = h && Object.values(pesquisa.leitores).find((x) => iguais(h, x.sha256));
    if (!leitor) return json({ erro: "Chave inválida." }, 401);
    if (request.method === "DELETE") {
      if (!leitor.admin) return json({ erro: "Sem permissão para apagar." }, 403);
      const id = Number(url.searchParams.get("id"));
      if (!Number.isInteger(id) || id < 1) return json({ erro: "Resposta inválida." }, 400);
      await stub.apagar(id);
      return json({ ok: true });
    }
    return json({ pesquisa: slug, admin: !!leitor.admin, respostas: await stub.listar() });
  },
};

export class Interesse extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS respostas (id INTEGER PRIMARY KEY AUTOINCREMENT, criado_em TEXT NOT NULL, dados TEXT NOT NULL)"
    );
    // v2: uma resposta por aparelho (respostas antigas ficam com dispositivo NULL).
    const cols = ctx.storage.sql.exec("PRAGMA table_info(respostas)").toArray().map((c) => c.name);
    if (!cols.includes("dispositivo")) ctx.storage.sql.exec("ALTER TABLE respostas ADD COLUMN dispositivo TEXT");
    ctx.storage.sql.exec("CREATE UNIQUE INDEX IF NOT EXISTS respostas_dispositivo ON respostas (dispositivo)");
  }

  // ids: identificadores conhecidos deste aparelho. Devolve false se algum já respondeu.
  salvar(ids, r) {
    for (const id of ids) {
      if (this.ctx.storage.sql.exec("SELECT 1 FROM respostas WHERE dispositivo = ?", id).toArray().length) return false;
    }
    this.ctx.storage.sql.exec(
      "INSERT INTO respostas (criado_em, dados, dispositivo) VALUES (?, ?, ?)", new Date().toISOString(), JSON.stringify(r), ids[0]
    );
    return true;
  }

  apagar(id) {
    this.ctx.storage.sql.exec("DELETE FROM respostas WHERE id = ?", id);
  }

  listar() {
    return this.ctx.storage.sql
      .exec("SELECT id, criado_em, dados FROM respostas ORDER BY id")
      .toArray()
      .map((l) => ({ id: l.id, criado_em: l.criado_em, ...JSON.parse(l.dados) }));
  }
}
