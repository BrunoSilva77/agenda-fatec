# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    page = b.new_page(viewport={"width": 1440, "height": 950})
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(900)
    page.locator("select").first.select_option(label="Dia")
    page.wait_for_timeout(600)
    info = page.evaluate("""() => {
      const s = document.querySelector('.gc-ev span');
      const ev = document.querySelector('.gc-ev');
      return {
        cortado: s.scrollWidth > s.clientWidth,
        spanClient: s.clientWidth,
        spanScroll: s.scrollWidth,
        bloco: Math.round(ev.getBoundingClientRect().width),
        blocoRight: Math.round(ev.getBoundingClientRect().right),
        colRight: Math.round(ev.closest('.gc-col').getBoundingClientRect().right)
      };
    }""")
    print(info)
    b.close()
