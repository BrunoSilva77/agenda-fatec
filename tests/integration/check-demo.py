# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    page = b.new_page(viewport={"width": 1440, "height": 950})
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1200)

    # chips por dia na visão mês
    info = page.evaluate("""() => {
      const dias = {};
      document.querySelectorAll('.gc-cell:not(.out)').forEach(c => {
        const n = c.querySelector('.gc-num');
        const chips = c.querySelectorAll('.gc-chip');
        const conf = c.querySelectorAll('.gc-chip-conf');
        if (n && chips.length) dias[n.textContent.trim()] = {chips: chips.length, conflito: conf.length};
      });
      return dias;
    }""")
    print("dias com chips:", info)

    # conflito na visão: clica no dia 17
    page.locator(".gc-cell:not(.out) > .gc-num", has_text="17").click()
    page.wait_for_timeout(500)
    modal = page.locator(".cps-modal-content")
    if modal.count():
        txt = modal.inner_text().replace("\n", " | ")
        print("modal dia 17:", txt[:400])
    b.close()
