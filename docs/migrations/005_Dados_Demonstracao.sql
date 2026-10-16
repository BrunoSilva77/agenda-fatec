-- Dados de demonstracao: agendamentos para visualizacao no calendario
-- Motivo: a API rejeita datas passadas (regra institucional em ReservaService),
-- entao reservas de demonstracao entram direto no banco.
-- INSERT IGNORE: seguro para executar mais de uma vez.
-- Obs.: execute antes o 003 (importacao do banco antigo).
SET NAMES utf8mb4;

INSERT IGNORE INTO `Reservas`
  (`Id`, `LaboratorioId`, `UsuarioId`, `DataInicio`, `DataFim`, `Finalidade`,
   `Status`, `RecorrenciaGrupoId`, `Justificativa`, `Observacao`,
   `ResolvidoPorCoordenadorId`, `CriadoEm`, `AtualizadoEm`, `RowVersion`)
VALUES
  -- Historico: ontem no Laboratorio 1 (feito anteontem)
  ('E4C7A9D2-3B51-4F6E-8C20-9D4A6B1E7F05', 1, '22222222-2222-2222-2222-222222222222',
   '2026-10-15 19:30:00', '2026-10-15 21:10:00', 'Modelagem de Dados',
   1, NULL, NULL, 'Reserva registrada - historico para organizacao',
   NULL, '2026-10-14 21:45:00', NULL, X''),
  -- Historico: terca, Laboratorio 9
  ('5F1B8C7A-9E34-4A6D-B2C8-7A0D5E3F1B62', 9, '22222222-2222-2222-2222-222222222222',
   '2026-10-13 19:30:00', '2026-10-13 20:20:00', 'Redes de Computadores',
   1, NULL, NULL, NULL,
   NULL, '2026-10-12 18:10:00', NULL, X''),
  -- Historico: sexta, Laboratorio 2 (reunião da coordenação)
  ('A9D3E5F7-1C28-4B6A-8D90-3E7F2A4C8B17', 2, '33333333-3333-3333-3333-333333333333',
   '2026-10-09 18:40:00', '2026-10-09 19:30:00', 'Reunião de Coordenação',
   1, NULL, NULL, NULL,
   NULL, '2026-10-08 09:30:00', NULL, X''),
  -- Hoje: Laboratorio 1 (manha)
  ('B7C9D1E3-5A42-4F80-9B6E-1D3A7C9E5F28', 1, '11111111-1111-1111-1111-111111111111',
   '2026-10-16 07:30:00', '2026-10-16 08:20:00', 'Estruturas de Dados',
   1, NULL, NULL, 'Projetor e compilador C# instalado',
   NULL, '2026-10-15 20:05:00', NULL, X''),
  -- Hoje: Laboratorio 2 (noite)
  ('C8D0E2F4-6B53-4A91-8C7F-2E4B8D0F6A39', 2, '22222222-2222-2222-2222-222222222222',
   '2026-10-16 19:30:00', '2026-10-16 21:10:00', 'Banco de Dados SQL Server',
   1, NULL, NULL, NULL,
   NULL, '2026-10-15 21:15:00', NULL, X''),
  -- Hoje: Laboratorio 9 (noite, em conflito)
  ('D1E3F5A7-7C64-4B02-9D8A-3F5C9E1A7B40', 9, '11111111-1111-1111-1111-111111111111',
   '2026-10-16 20:20:00', '2026-10-16 22:10:00', 'Inteligência Artificial',
   2, NULL, 'Horário solicitado simultaneamente por outro docente para reposição de aula.',
   NULL, NULL, '2026-10-16 07:02:00', NULL, X'');
