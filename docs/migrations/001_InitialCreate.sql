-- Agenda Fatec - estrutura inicial para MySQL 8.0+
-- A API tambÃ©m pode criar o banco e as tabelas na primeira execuÃ§Ã£o via EnsureCreated().
CREATE DATABASE IF NOT EXISTS AgendaFatec
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE AgendaFatec;

CREATE TABLE IF NOT EXISTS AuditoriasLgpd (
  Id BIGINT NOT NULL AUTO_INCREMENT,
  UsuarioId CHAR(36) NULL,
  UsuarioEmail VARCHAR(150) NOT NULL,
  Acao VARCHAR(100) NOT NULL,
  EntidadeAfetada VARCHAR(100) NOT NULL,
  RegistroId VARCHAR(100) NOT NULL,
  Detalhes VARCHAR(2000) NOT NULL,
  IpOrigem VARCHAR(50) NULL,
  DataHoraUtc DATETIME(6) NOT NULL,
  PRIMARY KEY (Id),
  INDEX IX_AuditoriasLgpd_DataHoraUtc (DataHoraUtc),
  INDEX IX_AuditoriasLgpd_UsuarioId (UsuarioId)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Laboratorios (
  Id INT NOT NULL AUTO_INCREMENT,
  Nome VARCHAR(100) NOT NULL,
  CompartilhadoEtec TINYINT(1) NOT NULL,
  Capacidade INT NOT NULL,
  Perfil VARCHAR(20) NULL,
  Cor VARCHAR(7) NULL,
  Ativo TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (Id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Usuarios (
  Id CHAR(36) NOT NULL,
  Nome VARCHAR(150) NOT NULL,
  Email VARCHAR(150) NOT NULL,
  SigaId VARCHAR(50) NOT NULL,
  Perfil INT NOT NULL,
  Ativo TINYINT(1) NOT NULL DEFAULT 1,
  DataCadastro DATETIME(6) NOT NULL,
  PRIMARY KEY (Id),
  UNIQUE INDEX IX_Usuarios_Email (Email),
  UNIQUE INDEX IX_Usuarios_SigaId (SigaId)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS SlotsHorario (
  Id INT NOT NULL AUTO_INCREMENT,
  LaboratorioId INT NULL,
  Turno INT NOT NULL,
  HoraInicio TIME(6) NOT NULL,
  HoraFim TIME(6) NOT NULL,
  Descricao VARCHAR(100) NOT NULL,
  ExclusivoEtec TINYINT(1) NOT NULL DEFAULT 0,
  Ativo TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (Id),
  INDEX IX_SlotsHorario_LaboratorioId (LaboratorioId),
  CONSTRAINT FK_SlotsHorario_Laboratorios_LaboratorioId
    FOREIGN KEY (LaboratorioId) REFERENCES Laboratorios (Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Reservas (
  Id CHAR(36) NOT NULL,
  LaboratorioId INT NOT NULL,
  UsuarioId CHAR(36) NOT NULL,
  DataInicio DATETIME(6) NOT NULL,
  DataFim DATETIME(6) NOT NULL,
  Finalidade VARCHAR(150) NOT NULL,
  Status INT NOT NULL,
  RecorrenciaGrupoId CHAR(36) NULL,
  Justificativa VARCHAR(500) NULL,
  Observacao VARCHAR(500) NULL,
  ResolvidoPorCoordenadorId CHAR(36) NULL,
  CriadoEm DATETIME(6) NOT NULL,
  AtualizadoEm DATETIME(6) NULL,
  RowVersion CHAR(36) NOT NULL,
  PRIMARY KEY (Id),
  INDEX IX_Reservas_LaboratorioId_DataInicio_DataFim (LaboratorioId, DataInicio, DataFim),
  INDEX IX_Reservas_RecorrenciaGrupoId (RecorrenciaGrupoId),
  INDEX IX_Reservas_ResolvidoPorCoordenadorId (ResolvidoPorCoordenadorId),
  INDEX IX_Reservas_UsuarioId (UsuarioId),
  CONSTRAINT FK_Reservas_Laboratorios_LaboratorioId
    FOREIGN KEY (LaboratorioId) REFERENCES Laboratorios (Id) ON DELETE RESTRICT,
  CONSTRAINT FK_Reservas_Usuarios_UsuarioId
    FOREIGN KEY (UsuarioId) REFERENCES Usuarios (Id) ON DELETE RESTRICT,
  CONSTRAINT FK_Reservas_Usuarios_ResolvidoPorCoordenadorId
    FOREIGN KEY (ResolvidoPorCoordenadorId) REFERENCES Usuarios (Id) ON DELETE RESTRICT
) ENGINE=InnoDB;

INSERT IGNORE INTO Laboratorios (Id, Nome, CompartilhadoEtec, Capacidade, Perfil, Cor, Ativo) VALUES
  (1, 'Laboratório 1', 1, 30, 'Fatec/ETEC', NULL, 1),
  (2, 'Laboratório 2', 1, 30, 'Fatec/ETEC', NULL, 1),
  (9, 'Laboratório 9', 0, 35, 'Fatec', NULL, 1),
  (10, 'Laboratório 10', 0, 35, 'Fatec', NULL, 1);

INSERT IGNORE INTO SlotsHorario (Id, LaboratorioId, Turno, HoraInicio, HoraFim, Descricao, ExclusivoEtec, Ativo) VALUES
  (1, NULL, 1, '07:30:00', '09:10:00', 'Manhã - Período 1 (07:30 - 09:10)', 0, 1),
  (2, NULL, 1, '09:20:00', '11:00:00', 'Manhã - Período 2 (09:20 - 11:00)', 0, 1),
  (3, NULL, 1, '11:10:00', '12:50:00', 'Manhã - Período 3 (11:10 - 12:50)', 0, 1),
  (7, NULL, 3, '18:40:00', '19:30:00', 'Noite - Bloco 1 (18:40 - 19:30)', 0, 1),
  (8, NULL, 3, '19:30:00', '20:20:00', 'Noite - Bloco 2 (19:30 - 20:20)', 0, 1),
  (9, NULL, 3, '20:20:00', '21:10:00', 'Noite - Bloco 3 (20:20 - 21:10)', 0, 1),
  (10, NULL, 3, '21:20:00', '22:10:00', 'Noite - Bloco 4 (21:20 - 22:10)', 0, 1),
  (11, NULL, 3, '22:10:00', '23:00:00', 'Noite - Bloco 5 (22:10 - 23:00)', 0, 1);