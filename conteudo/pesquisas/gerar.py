"""Gera as páginas das pesquisas de interesse dos condomínios.

Edite os modelos (modelo-formulario.html e modelo-resultados.html) e a lista
PESQUISAS abaixo; depois rode, na raiz do repositório:

    python3 conteudo/pesquisas/gerar.py

Cada pesquisa vira site/<slug>/index.html e site/<slug>/resultados.html.
O código do link e as chaves dos painéis ficam em src/worker.js (só os hashes).
"""
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
VERSAO = "2026-11-16-modelo"

# Atividades padrão por faixa etária. "d" marca destaques (★ e borda laranja).
def faixas(c46, c711, c1217, adultos, mais60, destaques=None):
    destaques = destaques or {}
    base = [
        ("Crianças de 4 a 6 anos", "Crianças", "Criança", "4 a 6 anos", c46),
        ("Crianças de 7 a 11 anos", "Crianças", "Criança", "7 a 11 anos", c711),
        ("Adolescentes de 12 a 17 anos", "Adolescentes", "Adolescente", "12 a 17 anos", c1217),
        ("Adultos", "Adultos", "Adulto", "18 a 59 anos", adultos),
        ("60 anos ou mais", "60 anos ou mais", "Pessoa", "Terceira idade", mais60),
    ]
    out = []
    for fid, t, p, s, a in base:
        f = {"id": fid, "t": t, "p": p, "s": s, "a": a}
        if destaques.get(fid):
            f["d"] = destaques[fid]
        out.append(f)
    return out

PESQUISAS = [
    {
        "slug": "solar-dos-amigos",
        "nome": "Solar dos Amigos",
        "faixas": faixas(
            ["Futsal/Futebol", "Judô", "Ballet e dança", "Ginástica e recreação"],
            ["Futsal/Futebol", "Vôlei", "Basquete", "Judô", "Dança", "Ginástica"],
            ["Vôlei", "Futsal/Futebol", "Basquete", "Judô e lutas", "Danças e ritmos", "Funcional"],
            ["Pilates", "Funcional", "Danças e ritmos", "Vôlei", "Futsal/Futebol", "Judô e lutas", "Alongamento", "Hidroginástica"],
            ["Ginástica", "Hidroginástica", "Pilates", "Alongamento", "Danças e ritmos", "Vôlei adaptado"],
        ),
    },
    {
        # Formulário padronizado, igual ao do Solar dos Amigos (pedido do Felipe, 16/11/2026).
        "slug": "lavance-morumbi",
        "versao": "lavance-padrao-1",
        "nome": "Lavance Morumbi",
        "faixas": faixas(
            ["Futsal/Futebol", "Judô", "Ballet e dança", "Ginástica e recreação"],
            ["Futsal/Futebol", "Vôlei", "Basquete", "Judô", "Dança", "Ginástica"],
            ["Vôlei", "Futsal/Futebol", "Basquete", "Judô e lutas", "Danças e ritmos", "Funcional"],
            ["Pilates", "Funcional", "Danças e ritmos", "Vôlei", "Futsal/Futebol", "Judô e lutas", "Alongamento", "Hidroginástica"],
            ["Ginástica", "Hidroginástica", "Pilates", "Alongamento", "Danças e ritmos", "Vôlei adaptado"],
        ),
    },
    {
        # Formulário padrão, igual ao do Solar. Tem piscina, então inclui hidroginástica (Felipe, 16/11/2026).
        "slug": "lake-tahoe",
        "nome": "Lake Tahoe",
        "versao": "lake-tahoe-hidro-1",
        "faixas": faixas(
            ["Futsal/Futebol", "Judô", "Ballet e dança", "Ginástica e recreação"],
            ["Futsal/Futebol", "Vôlei", "Basquete", "Judô", "Dança", "Ginástica"],
            ["Vôlei", "Futsal/Futebol", "Basquete", "Judô e lutas", "Danças e ritmos", "Funcional"],
            ["Pilates", "Funcional", "Danças e ritmos", "Vôlei", "Futsal/Futebol", "Judô e lutas", "Alongamento", "Hidroginástica"],
            ["Ginástica", "Hidroginástica", "Pilates", "Alongamento", "Danças e ritmos", "Vôlei adaptado"],
        ),
    },
]


def main():
    pasta = Path(__file__).resolve().parent
    form = (pasta / "modelo-formulario.html").read_text(encoding="utf-8")
    res = (pasta / "modelo-resultados.html").read_text(encoding="utf-8")
    for p in PESQUISAS:
        js = json.dumps(p["faixas"], ensure_ascii=False, indent=None)
        trocas = {"{{SLUG}}": p["slug"], "{{NOME}}": p["nome"], "{{VERSAO}}": p.get("versao", VERSAO), "{{FAIXAS}}": js}
        destino = RAIZ / "site" / p["slug"]
        destino.mkdir(parents=True, exist_ok=True)
        for modelo, nome in ((form, "index.html"), (res, "resultados.html")):
            t = modelo
            for k, v in trocas.items():
                t = t.replace(k, v)
            assert "{{" not in t, nome
            (destino / nome).write_text(t, encoding="utf-8")
        print("ok", p["slug"])


if __name__ == "__main__":
    main()
