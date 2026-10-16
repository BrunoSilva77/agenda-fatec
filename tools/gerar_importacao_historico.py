"""Gera o SQL de importação dos agendamentos antigos (banco SQLite antigo -> MySQL).

Lê o banco legado `src/AgendaFatec.Api/AgendaFatec.db` e escreve
`docs/migrations/003_Importar_Agendamentos_Antigos.sql` com comandos
INSERT IGNORE (podem rodar várias vezes sem duplicar registros).

Uso:
    python tools/gerar_importacao_historico.py
    # depois, com o MySQL ligado e a aplicação já executada 1x (cria o banco):
    C:\\xampp\\mysql\\bin\\mysql.exe -u root AgendaFatec < docs/migrations/003_Importar_Agendamentos_Antigos.sql
"""
import sqlite3
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
SQLITE = RAIZ / "src" / "AgendaFatec.Api" / "AgendaFatec.db"
SAIDA = RAIZ / "docs" / "migrations" / "003_Importar_Agendamentos_Antigos.sql"

# Ordem respeita as chaves estrangeiras. Laboratorios/SlotsHorario ficam de fora:
# ja sao criados pelos seeds do EF Core (EnsureCreated).
TABELAS = ["Usuarios", "Reservas", "AuditoriasLgpd"]


def lit(v):
    """Converte o valor do SQLite em literal MySQL."""
    if v is None:
        return "NULL"
    if isinstance(v, (bytes, bytearray)):
        return "X'" + bytes(v).hex() + "'"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


def main():
    if not SQLITE.exists():
        raise SystemExit(f"Banco antigo nao encontrado: {SQLITE}")

    con = sqlite3.connect(SQLITE)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    existentes = {
        r[0]
        for r in cur.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        )
    }

    linhas = [
        "-- Importacao dos agendamentos antigos (gerado por tools/gerar_importacao_historico.py)",
        f"-- Origem: {SQLITE.name} (SQLite legado)",
        "-- INSERT IGNORE: seguro para executar mais de uma vez (nao duplica).",
        "-- Requisito: banco AgendaFatec ja criado (rode a API 1 vez antes).",
        "SET NAMES utf8mb4;",
        "",
    ]

    total = 0
    for tabela in TABELAS:
        if tabela not in existentes:
            linhas.append(f"-- (tabela {tabela} nao existe no banco antigo, ignorada)")
            linhas.append("")
            continue

        cols = [c["name"] for c in cur.execute(f'PRAGMA table_info("{tabela}")')]
        if not cols:
            continue
        col_sql = ", ".join(f"`{c}`" for c in cols)
        linhas.append(f"-- {tabela}")
        for row in cur.execute(f'SELECT * FROM "{tabela}"'):
            vals = ", ".join(lit(row[c]) for c in cols)
            linhas.append(f"INSERT IGNORE INTO `{tabela}` ({col_sql}) VALUES ({vals});")
            total += 1
        linhas.append("")

    con.close()

    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text("\n".join(linhas) + "\n", encoding="utf-8")
    print(f"OK: {total} registro(s) -> {SAIDA}")


if __name__ == "__main__":
    main()
