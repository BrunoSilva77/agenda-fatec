# -*- coding: utf-8 -*-
"""Painel da Coordenação: adicionar/remover itens do catálogo de equipamentos."""
import json
import os
import urllib.request
from playwright.sync_api import sync_playwright

API = "http://localhost:5000/api"
# Screenshots caem ao lado do próprio script (tests/integration/)
OUT = os.path.dirname(os.path.abspath(__file__))


def api_post(path, corpo):
    req = urllib.request.Request(
        API + path, data=json.dumps(corpo).encode("utf-8"),
        headers={"Content-Type": "application/json"}, method="POST")
    return json.loads(urllib.request.urlopen(req, timeout=8).read())


def api_get(path):
    return json.loads(urllib.request.urlopen(API + path, timeout=8).read())


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 950})
    erros = []
    page.on("console", lambda m: erros.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: erros.append("PAGEERROR: " + str(e)))

    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(700)

    # 1) Prepara: reserva ativa usando o carrinho de notebooks (20/11 07:30 lab 1)
    api_post("/reservas", {
        "laboratorioId": 1,
        "usuarioId": "11111111-1111-1111-1111-111111111111",
        "dataInicio": "2026-11-20T07:30:00",
        "dataFim": "2026-11-20T09:10:00",
        "finalidade": "Aula",
        "equipamentos": ["carrinho-notebooks"],
        "recorrente": False,
        "quantidadeSemanas": 1,
    })
    print("reserva com carrinho criada: ok")

    # 2) Entra como Coordenador e abre a aba
    page.locator("select[aria-label='Selecionar usuário de teste']").select_option("33333333-3333-3333-3333-333333333333")
    page.wait_for_timeout(400)
    page.locator(".main-nav a", has_text="Coordenador").click()
    page.wait_for_timeout(800)

    secao = page.locator("#sec-coordenador")
    print("secao coordenador visivel:", secao.count() == 1)
    print("lista itens:", secao.locator("li strong").all_inner_texts())

    # 3) Adiciona item novo
    secao.locator("input[placeholder='Ex: Mesa digitalizadora']").fill("Mesa digital")
    secao.locator("input[placeholder='Ex: Guarda no laboratório 2']").fill("Acesso restrito")
    secao.locator("label", has_text="Exclusivo (1 por horário)").locator("input").check()
    secao.locator("button", has_text="Adicionar").click()
    page.wait_for_timeout(1200)

    itens = [i["id"] for i in api_get("/equipamentos")]
    print("mesa-digital no banco:", "mesa-digital" in itens)
    print("mesa-digital na UI:", secao.locator("li strong", has_text="Mesa digital").count() == 1)
    print("badge exclusivo visivel:", secao.locator("li", has_text="Mesa digital").locator("text=EXCLUSIVO").count() == 1)

    # 4) Remove o item novo
    secao.locator("button[aria-label='Remover Mesa digital']").click()
    page.wait_for_timeout(1200)
    itens = [i["id"] for i in api_get("/equipamentos")]
    print("mesa-digital fora do banco:", "mesa-digital" not in itens)
    print("mesa-digital fora da UI:", secao.locator("li strong", has_text="Mesa digital").count() == 0)

    # 5) Item em uso NÃO pode ser removido (backend bloqueia)
    secao.locator("button[aria-label='Remover Carrinho de notebooks']").click()
    page.wait_for_timeout(1200)
    erro_txt = secao.locator("div", has_text="vinculado a").first.inner_text() if secao.locator("div", has_text="vinculado a").count() else ""
    print("bloqueou item em uso:", "vinculado a" in erro_txt)
    itens = [i["id"] for i in api_get("/equipamentos")]
    print("carrinho continua no banco:", "carrinho-notebooks" in itens)

    # 6) Professor NÃO vê a aba Coordenador
    page.locator("select[aria-label='Selecionar usuário de teste']").select_option("11111111-1111-1111-1111-111111111111")
    page.wait_for_timeout(500)
    page.locator(".main-nav a", has_text="Coordenador").click()
    page.wait_for_timeout(500)
    print("professor sem painel:", page.locator("#sec-coordenador").count() == 0)

    print("erros console:", erros if erros else "nenhum")
    page.screenshot(path=OUT + r"\painel-equipamentos.png")
    browser.close()

# Limpeza: cancela a reserva de teste criada no passo 1
import pymysql
conn = pymysql.connect(host="localhost", port=3306, user="root", password="",
                       database="agendafatec", charset="utf8mb4", autocommit=True)
cur = conn.cursor()
cur.execute("SELECT Id FROM Reservas WHERE DataInicio = '2026-11-20 07:30:00'")
ids = [str(r[0]) for r in cur.fetchall()]
if ids:
    ph = ",".join(["%s"] * len(ids))
    cur.execute(f"DELETE FROM ReservaEquipamentos WHERE ReservaId IN ({ph})", ids)
    cur.execute(f"DELETE FROM Reservas WHERE Id IN ({ph})", ids)
print("limpeza: reservas removidas:", len(ids))
conn.close()
