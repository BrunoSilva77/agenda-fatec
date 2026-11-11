# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    page = b.new_page(viewport={"width": 1440, "height": 950})
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(900)

    # vai pra visao Dia (select do toolbar)
    sel = page.locator("select").first
    sel.select_option(label="Dia")
    page.wait_for_timeout(600)

    info = page.evaluate("""() => {
      const ev = document.querySelector('.gc-ev');
      const col = document.querySelector('.gc-col');
      if (!ev) return null;
      const r = ev.getBoundingClientRect();
      const c = col.getBoundingClientRect();
      return { bloco: Math.round(r.width), coluna: Math.round(c.width),
               texto: ev.innerText.replace('\\n', ' | ') };
    }""")
    print("dia:", info)

    # visao semana continua normal
    sel.select_option(label="Semana")
    page.wait_for_timeout(600)
    evs = page.evaluate("""() => [...document.querySelectorAll('.gc-ev')].slice(0,3).map(ev => ({
      w: Math.round(ev.getBoundingClientRect().width),
      col: Math.round(ev.closest('.gc-col').getBoundingClientRect().width)
    }))""")
    print("semana:", evs)
    b.close()
