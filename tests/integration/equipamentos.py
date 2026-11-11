# -*- coding: utf-8 -*-
"""Integração frontend+backend: reserva com equipamento exclusivo, bloqueio
para outro professor no mesmo horário, e gestão do catálogo pela Coordenação."""
import json
import os
import urllib.request
from playwright.sync_api import sync_playwright

# Screenshots caem ao lado do próprio script (tests/integration/)
OUT = os.path.dirname(os.path.abspath(__file__))
API = "http://localhost:5000/api"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 950})
    erros = []
    page.on("console", lambda m: erros.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: erros.append("PAGEERROR: " + str(e)))

    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(700)

    def abrir_modal():
        page.locator(".gc-cell:not(.out) > .gc-num", has_text="20").click()
        page.wait_for_timeout(400)
        page.locator("button", has_text="Agendar neste dia").click()
        page.wait_for_timeout(700)
        return page.locator(".cps-modal-content")

    def escolher_slot(modal, hora_desejada=None):
        return page.evaluate(
            """(hora) => {
              const sels = [...document.querySelectorAll('.cps-modal-content select')];
              const slot = sels.find(s => s.options[0] && s.options[0].textContent.includes('Selecione o hor'));
              if (!slot) return null;
              const opts = [...slot.options].filter(o => !o.disabled && o.value !== '');
              const alvo = hora ? opts.find(o => o.textContent.trim().startsWith(hora)) : opts[0];
              if (!alvo) return null;
              slot.value = alvo.value;
              slot.dispatchEvent(new Event('change', { bubbles: true }));
              return alvo.textContent.trim();
            }""",
            hora_desejada,
        )

    def abrir_dropdown(modal):
        drop = modal.locator("button[aria-haspopup=listbox]")
        drop.click()
        page.wait_for_timeout(250)
        return drop

    # ---------- 1) Prof. Carlos reserva o carrinho de notebooks (Lab 1) ----------
    modal = abrir_modal()
    slot_texto = escolher_slot(modal)
    print("Carlos slot:", slot_texto)
    hora_inicio = slot_texto.split(" às ")[0]

    drop = abrir_dropdown(modal)
    carrinho = modal.locator("div[role=option]", has_text="Carrinho de notebooks")
    carrinho.locator("input").check()
    page.wait_for_timeout(150)
    print("add visivel p/ professor (deve ser 0):", modal.locator("input[placeholder='Novo equipamento...']").count())
    drop.click()

    page.locator("button", has_text="Revisar agendamento").click()
    page.wait_for_timeout(300)
    page.locator("button", has_text="Confirmar Reserva").click()
    page.wait_for_timeout(2500)
    ok_carlos = page.locator(".cps-modal-content").count() == 0
    print("Carlos confirmou:", ok_carlos)
    if not ok_carlos:
        print("ERRO modal:", modal.inner_text()[-300:].replace("\n", " | "))
        browser.close()
        raise SystemExit(1)

    # API deve devolver a reserva com equipamentos (join carregado)
    req = urllib.request.Request(API + "/reservas")
    reservas_api = json.loads(urllib.request.urlopen(req, timeout=5).read())
    r_carlos = [r for r in reservas_api if "2026-11-20" in r["dataInicio"] and r["laboratorioId"] == 1]
    print("api reserva carlos com carrinho:", any("carrinho-notebooks" in (r.get("equipamentos") or []) for r in r_carlos))

    # ---------- 2) API recusa exclusivo para quem chega depois (validação server-side) ----------
    corpo = json.dumps({
        "laboratorioId": 2,
        "usuarioId": "22222222-2222-2222-2222-222222222222",
        "dataInicio": "2026-11-20T07:30:00",
        "dataFim": "2026-11-20T09:10:00",
        "finalidade": "Aula",
        "equipamentos": ["carrinho-notebooks"],
        "recorrente": False,
        "quantidadeSemanas": 1
    }).encode("utf-8")
    req2 = urllib.request.Request(API + "/reservas", data=corpo, headers={"Content-Type": "application/json"}, method="POST")
    try:
        urllib.request.urlopen(req2, timeout=5)
        print("api recusou exclusivo: False (CRIOU!)")
    except urllib.error.HTTPError as e:
        msg = json.loads(e.read()).get("mensagem", "")
        print(f"api recusou exclusivo: {e.code == 400} (HTTP {e.code}) -> {msg[:90]}")

    # ---------- 3) Profa. Juliana via UI: "Todas as salas" → Lab 2, mesmo horário ----------
    page.locator(".gc-fchip", has_text="Todas as salas").click()
    page.wait_for_timeout(400)

    modal = abrir_modal()
    # escolhe a sala dentro do modal
    lab_sel = modal.locator("select", has=page.locator("option", has_text="Selecione a sala"))
    lab_sel.first.select_option(index=1)  # Laboratório 1 (lista ordenada)
    page.wait_for_timeout(300)
    # garante Laboratório 2 explicitamente
    lab_sel.first.select_option(label="Laboratório 2")
    page.wait_for_timeout(1500)

    slot_j = escolher_slot(modal, hora_inicio)
    print("Juliana slot (mesmo inicio):", slot_j)

    drop = abrir_dropdown(modal)
    carrinho = modal.locator("div[role=option]", has_text="Carrinho de notebooks")
    txt = carrinho.inner_text()
    print("carrinho texto:", txt.replace("\n", " | "))
    print("carrinho bloqueado:", "Reservado neste horário" in txt)
    print("carrinho checkbox disabled:", carrinho.locator("input").is_disabled())
    try:
        carrinho.locator("input").check(timeout=800)
        marcou = True
    except Exception:
        marcou = False
    print("conseguiu marcar bloqueado:", marcou)

    modal.locator("div[role=option]", has_text="Caixa de som").locator("input").check()
    page.wait_for_timeout(150)
    print("add visivel p/ professor (deve ser 0):", modal.locator("input[placeholder='Novo equipamento...']").count())
    drop.click()

    page.locator("button", has_text="Revisar agendamento").click()
    page.wait_for_timeout(300)
    page.locator("button", has_text="Confirmar Reserva").click()
    page.wait_for_timeout(2500)
    print("Juliana confirmou:", page.locator(".cps-modal-content").count() == 0)

    # ---------- 4) Coord. Marcelo gerencia o catálogo ----------
    page.locator("select[aria-label='Selecionar usuário de teste']").select_option("33333333-3333-3333-3333-333333333333")
    page.wait_for_timeout(400)

    modal = abrir_modal()
    drop = abrir_dropdown(modal)
    print("add visivel p/ admin:", modal.locator("input[placeholder='Novo equipamento...']").count())

    modal.locator("input[placeholder='Novo equipamento...']").fill("Webcam USB")
    modal.locator("button", has_text="Adicionar").click()
    page.wait_for_timeout(1200)
    print("webcam adicionada (UI):", modal.locator("div[role=option]", has_text="Webcam USB").count() == 1)
    itens_api = json.loads(urllib.request.urlopen(API + "/equipamentos", timeout=5).read())
    print("webcam no banco:", any(i["id"] == "webcam-usb" for i in itens_api))

    modal.locator("button[aria-label='Remover Webcam USB']").click()
    page.wait_for_timeout(1200)
    print("webcam removida (UI):", modal.locator("div[role=option]", has_text="Webcam USB").count() == 0)
    itens_api = json.loads(urllib.request.urlopen(API + "/equipamentos", timeout=5).read())
    print("webcam fora do banco:", not any(i["id"] == "webcam-usb" for i in itens_api))

    print("erros console:", erros if erros else "nenhum")
    page.screenshot(path=OUT + r"\equipamentos.png")
    browser.close()
