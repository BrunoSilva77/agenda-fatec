-- Blocos ETEC da tarde para as salas compartilhadas (Labs 1 e 2)
-- Adicionado ao seed do EF Core (SlotHorarioConfiguration) e aplicado aqui aos
-- bancos ja criados pelo EnsureCreated (que nao reexecuta seeds).
-- INSERT IGNORE: seguro para executar mais de uma vez.
SET NAMES utf8mb4;

INSERT IGNORE INTO `SlotsHorario` (`Id`, `LaboratorioId`, `Turno`, `HoraInicio`, `HoraFim`, `Descricao`, `ExclusivoEtec`, `Ativo`)
VALUES
  (101, NULL, 2, '13:15:00', '14:05:00', 'ETEC Tarde - Bloco 1 (13:15 - 14:05)', TRUE, TRUE),
  (102, NULL, 2, '14:05:00', '14:55:00', 'ETEC Tarde - Bloco 2 (14:05 - 14:55)', TRUE, TRUE),
  (103, NULL, 2, '15:10:00', '16:00:00', 'ETEC Tarde - Bloco 3 (15:10 - 16:00)', TRUE, TRUE);
