# -*- coding: utf-8 -*-
"""Insere agendamentos de demonstração nos próximos dias úteis (12 a 25/11/2026).

- Mesmos horários em salas diferentes (permitido)
- Um conflito real: mesma sala, mesmo horário (status 2 = Em conflito)
- Horários estendidos (vários slots numa reserva só)
- Equipamentos em 3 reservas (carrinho exclusivo sem colisão)
"""
import uuid
import pymysql

CARLOS = "11111111-1111-1111-1111-111111111111"
JULIANA = "22222222-2222-2222-2222-222222222222"
MARCELO = "33333333-3333-3333-3333-333333333333"

CONFIRMADA, EM_CONFLITO, CANCELADA = 1, 2, 3

# (lab, usuario, inicio, fim, finalidade, status, [equipamentos])
RESERVAS = [
    # --- qui 12/11: manhã extendida + mesmo horário em outra sala ---
    (1, CARLOS,  "2026-11-12 07:30:00", "2026-11-12 11:00:00", "Banco de Dados",      CONFIRMADA, ["carrinho-notebooks"]),
    (2, JULIANA, "2026-11-12 07:30:00", "2026-11-12 09:10:00", "Estrutura de Dados",  CONFIRMADA, []),
    (9, MARCELO, "2026-11-12 19:30:00", "2026-11-12 21:20:00", "Reunião de Coordenação", CONFIRMADA, []),

    # --- sex 13/11: tarde extendida ---
    (1, JULIANA, "2026-11-13 13:15:00", "2026-11-13 16:00:00", "Desenvolvimento Web", CONFIRMADA, ["projetor"]),

    # --- seg 16/11: mesmo horário em duas salas ---
    (1, CARLOS,  "2026-11-16 09:20:00", "2026-11-16 11:00:00", "Aula de Reposição",   CONFIRMADA, []),
    (2, JULIANA, "2026-11-16 09:20:00", "2026-11-16 11:00:00", "Programação II",      CONFIRMADA, []),

    # --- ter 17/11: CONFLITO (mesma sala, mesmo horário) ---
    (1, CARLOS,  "2026-11-17 07:30:00", "2026-11-17 09:10:00", "Banco de Dados",      CONFIRMADA, []),
    (1, JULIANA, "2026-11-17 07:30:00", "2026-11-17 09:10:00", "Tópicos Especiais",   EM_CONFLITO, []),

    # --- qua 18/11: noite longa ---
    (10, MARCELO, "2026-11-18 18:40:00", "2026-11-18 21:20:00", "Oficina de Inovação", CONFIRMADA, []),

    # --- qui 19/11: manhã extendida + carrinho (exclusivo, sem colisão com 12/11) ---
    (9, CARLOS,  "2026-11-19 07:30:00", "2026-11-19 11:00:00", "Projeto Integrador",  CONFIRMADA, ["carrinho-notebooks", "caixa-som"]),

    # --- sex 20/11: tarde extendida ---
    (2, JULIANA, "2026-11-20 13:15:00", "2026-11-20 16:00:00", "Laboratório Prático", CONFIRMADA, []),

    # --- seg 23/11: bloco curto da noite ---
    (1, CARLOS,  "2026-11-23 19:30:00", "2026-11-23 20:20:00", "Sala de Estudos",     CONFIRMADA, []),

    # --- ter 24/11 ---
    (1, MARCELO, "2026-11-24 07:30:00", "2026-11-24 09:10:00", "Visita Técnica",      CONFIRMADA, []),

    # --- qua 25/11: último dia da janela de 14 dias ---
    (9, JULIANA, "2026-11-25 09:20:00", "2026-11-25 11:00:00", "Revisão de Prova",    CONFIRMADA, []),
]

conn = pymysql.connect(host="localhost", port=3306, user="root", password="",
                       database="agendafatec", charset="utf8mb4", autocommit=True)
cur = conn.cursor()

# idempotente: remove os agendamentos dessas datas antes de reinserir
cur.execute("SELECT Id FROM Reservas WHERE DataInicio >= '2026-11-12' AND DataInicio < '2026-11-26'")
antigos = [str(r[0]) for r in cur.fetchall()]
if antigos:
    ph = ",".join(["%s"] * len(antigos))
    cur.execute(f"DELETE FROM ReservaEquipamentos WHERE ReservaId IN ({ph})", antigos)
    cur.execute(f"DELETE FROM Reservas WHERE Id IN ({ph})", antigos)
print("removidas para recriar:", len(antigos))

criadas = 0
for lab, usuario, ini, fim, finalidade, status, equipamentos in RESERVAS:
    rid = str(uuid.uuid4()).upper()
    cur.execute("""
        INSERT INTO Reservas
          (Id, LaboratorioId, UsuarioId, DataInicio, DataFim, Finalidade,
           Status, RecorrenciaGrupoId, Justificativa, Observacao,
           ResolvidoPorCoordenadorId, CriadoEm, AtualizadoEm, RowVersion)
        VALUES (%s, %s, %s, %s, %s, %s, %s, NULL, NULL, NULL, NULL, %s, NULL, UUID())
    """, (rid, lab, usuario, ini, fim, finalidade, status, ini))
    for eq in equipamentos:
        cur.execute("INSERT INTO ReservaEquipamentos (ReservaId, EquipamentoId) VALUES (%s, %s)",
                    (rid, eq))
    criadas += 1

cur.execute("""
    SELECT DATE(r.DataInicio), COUNT(*) FROM Reservas r
    WHERE r.DataInicio >= '2026-11-12' AND r.DataInicio < '2026-11-26' AND r.Status <> 3
    GROUP BY DATE(r.DataInicio) ORDER BY 1
""")
print("criadas:", criadas)
for data, qtd in cur.fetchall():
    print(" ", data, "->", qtd, "reserva(s)")
conn.close()
