# Testes de integração (frontend + backend + banco)

Scripts Python que exercitam o sistema de ponta a ponta com Playwright
(navegador headless) e conferem os dados direto na API/banco.

## Pré-requisitos

1. **MySQL** rodando (ex.: XAMPP) com o banco `agendafatec`
2. **Backend .NET** na porta 5000:
   ```powershell
   dotnet run --project src/AgendaFatec.Api
   ```
3. **Frontend** na porta 5173:
   ```powershell
   cd frontend; npm run dev
   ```
4. Dependências Python:
   ```powershell
   pip install playwright pymysql
   playwright install chromium
   ```

## Scripts

| Script | O que valida |
|---|---|
| `demo-agendamentos.py` | Cria (e recria) os agendamentos de demonstração de 12 a 25/11 — mesmos horários em salas diferentes, um conflito real, horários estendidos e equipamentos. Idempotente. |
| `equipamentos.py` | Fluxo completo: reserva com carrinho de notebooks → API recusa exclusivo para outro professor (409) → UI bloqueada ("Reservado neste horário") → coordenação adiciona/remove item do catálogo. |
| `painel-equipamentos.py` | Aba Coordenador: adicionar/remover itens do catálogo, bloqueio de item em uso por reserva ativa, professor sem acesso à aba. |
| `check-demo.py` | Conferência visual: chips por dia na visão mês e conflito no popup do dia 17. |
| `largura-bloco.py` | Visão Dia: bloco com largura fixa (não preenche a coluna); visão Semana proporcional. |
| `check-corte.py` | Visão Dia: texto do bloco (horário + professor) não é cortado. |

## Rodando

```powershell
python tests\integration\equipamentos.py
python tests\integration\demo-agendamentos.py
```

Saída no console com as asserções; screenshots (quando há) ficam nesta pasta.
