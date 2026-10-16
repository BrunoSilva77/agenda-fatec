-- Importacao dos agendamentos antigos (gerado por tools/gerar_importacao_historico.py)
-- Origem: AgendaFatec.db (SQLite legado)
-- INSERT IGNORE: seguro para executar mais de uma vez (nao duplica).
-- Requisito: banco AgendaFatec ja criado (rode a API 1 vez antes).
SET NAMES utf8mb4;

-- Usuarios
INSERT IGNORE INTO `Usuarios` (`Id`, `Nome`, `Email`, `SigaId`, `Perfil`, `Ativo`, `DataCadastro`) VALUES ('11111111-1111-1111-1111-111111111111', 'Prof. Carlos Eduardo', 'carlos.eduardo@fatec.sp.gov.br', 'SIGA-PROF-1001', 1, 1, '2026-09-23 22:59:59.5433398');
INSERT IGNORE INTO `Usuarios` (`Id`, `Nome`, `Email`, `SigaId`, `Perfil`, `Ativo`, `DataCadastro`) VALUES ('22222222-2222-2222-2222-222222222222', 'Profa. Juliana Santos', 'juliana.santos@fatec.sp.gov.br', 'SIGA-PROF-1002', 1, 1, '2026-09-23 22:59:59.5434606');
INSERT IGNORE INTO `Usuarios` (`Id`, `Nome`, `Email`, `SigaId`, `Perfil`, `Ativo`, `DataCadastro`) VALUES ('33333333-3333-3333-3333-333333333333', 'Coord. Marcelo Oliveira', 'marcelo.oliveira@fatec.sp.gov.br', 'SIGA-COORD-2001', 2, 1, '2026-09-23 22:59:59.5434615');

-- Reservas
INSERT IGNORE INTO `Reservas` (`Id`, `LaboratorioId`, `UsuarioId`, `DataInicio`, `DataFim`, `Finalidade`, `Status`, `RecorrenciaGrupoId`, `Justificativa`, `Observacao`, `ResolvidoPorCoordenadorId`, `CriadoEm`, `AtualizadoEm`, `RowVersion`) VALUES ('D71DF764-2BC4-4E3A-9EEE-9D5B3CCFA32B', 1, '11111111-1111-1111-1111-111111111111', '2026-10-15 08:20:00', '2026-10-15 09:10:00', 'Banco de Dados', 1, NULL, NULL, '', NULL, '2026-10-15 01:52:04.9963761', NULL, X'');

-- AuditoriasLgpd
INSERT IGNORE INTO `AuditoriasLgpd` (`Id`, `UsuarioId`, `UsuarioEmail`, `Acao`, `EntidadeAfetada`, `RegistroId`, `Detalhes`, `IpOrigem`, `DataHoraUtc`) VALUES (1, '11111111-1111-1111-1111-111111111111', 'carlos.eduardo@fatec.sp.gov.br', 'CRIACAO_RESERVA', 'Reserva', 'd71df764-2bc4-4e3a-9eee-9d5b3ccfa32b', 'Reserva criada para Lab 1 (Banco de Dados) - Total instâncias: 1', '::1', '2026-10-15 01:52:05.0525853');

