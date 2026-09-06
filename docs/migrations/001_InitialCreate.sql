-- ==========================================================================================
-- Sistema de Agendamento de Laboratórios - Fatec Araçatuba
-- Script DDL Inicial (Migration 20260906180000_InitialCreate)
-- Compatibilidade: Microsoft SQL Server 2017+ / Azure SQL / LocalDB
-- ==========================================================================================

IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260906180000_InitialCreate'
)
BEGIN
    -- 1. Tabela de Auditoria LGPD
    CREATE TABLE [AuditoriasLgpd] (
        [Id] bigint NOT NULL IDENTITY(1, 1),
        [UsuarioId] uniqueidentifier NULL,
        [UsuarioEmail] nvarchar(150) NOT NULL,
        [Acao] nvarchar(100) NOT NULL,
        [EntidadeAfetada] nvarchar(100) NOT NULL,
        [RegistroId] nvarchar(100) NOT NULL,
        [Detalhes] nvarchar(2000) NOT NULL,
        [IpOrigem] nvarchar(50) NULL,
        [DataHoraUtc] datetime2 NOT NULL,
        CONSTRAINT [PK_AuditoriasLgpd] PRIMARY KEY ([Id])
    );

    -- 2. Tabela de Laboratórios
    CREATE TABLE [Laboratorios] (
        [Id] int NOT NULL,
        [Nome] nvarchar(100) NOT NULL,
        [CompartilhadoEtec] bit NOT NULL,
        [Capacidade] int NOT NULL,
        [Ativo] bit NOT NULL DEFAULT CAST(1 AS bit),
        CONSTRAINT [PK_Laboratorios] PRIMARY KEY ([Id])
    );

    -- 3. Tabela de Usuários (Professores e Coordenadores com dados do SIGA)
    CREATE TABLE [Usuarios] (
        [Id] uniqueidentifier NOT NULL,
        [Nome] nvarchar(150) NOT NULL,
        [Email] nvarchar(150) NOT NULL,
        [SigaId] nvarchar(50) NOT NULL,
        [Perfil] int NOT NULL,
        [Ativo] bit NOT NULL DEFAULT CAST(1 AS bit),
        [DataCadastro] datetime2 NOT NULL,
        CONSTRAINT [PK_Usuarios] PRIMARY KEY ([Id])
    );

    -- 4. Tabela de Slots de Horários (Suporte a blocos Fatec e horários diferenciados da ETEC)
    CREATE TABLE [SlotsHorario] (
        [Id] int NOT NULL IDENTITY(1, 1),
        [LaboratorioId] int NULL,
        [Turno] int NOT NULL,
        [HoraInicio] time NOT NULL,
        [HoraFim] time NOT NULL,
        [Descricao] nvarchar(100) NOT NULL,
        [ExclusivoEtec] bit NOT NULL DEFAULT CAST(0 AS bit),
        [Ativo] bit NOT NULL DEFAULT CAST(1 AS bit),
        CONSTRAINT [PK_SlotsHorario] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_SlotsHorario_Laboratorios_LaboratorioId] FOREIGN KEY ([LaboratorioId]) REFERENCES [Laboratorios] ([Id]) ON DELETE CASCADE
    );

    -- 5. Tabela de Reservas (Com Concorrência Otimista e Recorrência)
    CREATE TABLE [Reservas] (
        [Id] uniqueidentifier NOT NULL,
        [LaboratorioId] int NOT NULL,
        [UsuarioId] uniqueidentifier NOT NULL,
        [DataInicio] datetime2 NOT NULL,
        [DataFim] datetime2 NOT NULL,
        [Finalidade] nvarchar(150) NOT NULL,
        [Status] int NOT NULL,
        [RecorrenciaGrupoId] uniqueidentifier NULL,
        [Justificativa] nvarchar(500) NULL,
        [Observacao] nvarchar(500) NULL,
        [ResolvidoPorCoordenadorId] uniqueidentifier NULL,
        [CriadoEm] datetime2 NOT NULL,
        [AtualizadoEm] datetime2 NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_Reservas] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Reservas_Laboratorios_LaboratorioId] FOREIGN KEY ([LaboratorioId]) REFERENCES [Laboratorios] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Reservas_Usuarios_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuarios] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Reservas_Usuarios_ResolvidoPorCoordenadorId] FOREIGN KEY ([ResolvidoPorCoordenadorId]) REFERENCES [Usuarios] ([Id]) ON DELETE NO ACTION
    );

    -- Seed de Laboratórios Institucionais
    INSERT INTO [Laboratorios] ([Id], [Ativo], [Capacidade], [CompartilhadoEtec], [Nome])
    VALUES 
        (1, CAST(1 AS bit), 30, CAST(1 AS bit), N'Laboratório 1'),
        (2, CAST(1 AS bit), 30, CAST(1 AS bit), N'Laboratório 2'),
        (9, CAST(1 AS bit), 35, CAST(0 AS bit), N'Laboratório 9'),
        (10, CAST(1 AS bit), 35, CAST(0 AS bit), N'Laboratório 10');

    -- Seed dos Blocos Padrão de Horário (Fatec Araçatuba)
    SET IDENTITY_INSERT [SlotsHorario] ON;
    INSERT INTO [SlotsHorario] ([Id], [Ativo], [Descricao], [HoraFim], [HoraInicio], [LaboratorioId], [Turno])
    VALUES 
        (1, CAST(1 AS bit), N'Manhã - Bloco 1 (07:30 - 08:20)', '08:20:00', '07:30:00', NULL, 1),
        (2, CAST(1 AS bit), N'Manhã - Bloco 2 (08:20 - 09:10)', '09:10:00', '08:20:00', NULL, 1),
        (3, CAST(1 AS bit), N'Manhã - Bloco 3 (09:20 - 10:10)', '10:10:00', '09:20:00', NULL, 1),
        (4, CAST(1 AS bit), N'Manhã - Bloco 4 (10:10 - 11:00)', '11:00:00', '10:10:00', NULL, 1),
        (5, CAST(1 AS bit), N'Manhã - Bloco 5 (11:10 - 12:00)', '12:00:00', '11:10:00', NULL, 1),
        (6, CAST(1 AS bit), N'Manhã - Bloco 6 (12:00 - 12:50)', '12:50:00', '12:00:00', NULL, 1),
        (7, CAST(1 AS bit), N'Noite - Bloco 1 (18:40 - 19:30)', '19:30:00', '18:40:00', NULL, 3),
        (8, CAST(1 AS bit), N'Noite - Bloco 2 (19:30 - 20:20)', '20:20:00', '19:30:00', NULL, 3),
        (9, CAST(1 AS bit), N'Noite - Bloco 3 (20:20 - 21:10)', '21:10:00', '20:20:00', NULL, 3),
        (10, CAST(1 AS bit), N'Noite - Bloco 4 (21:20 - 22:10)', '22:10:00', '21:20:00', NULL, 3),
        (11, CAST(1 AS bit), N'Noite - Bloco 5 (22:10 - 23:00)', '23:00:00', '22:10:00', NULL, 3);
    SET IDENTITY_INSERT [SlotsHorario] OFF;

    -- Criação de Índices Otimizados
    CREATE INDEX [IX_AuditoriasLgpd_DataHoraUtc] ON [AuditoriasLgpd] ([DataHoraUtc]);
    CREATE INDEX [IX_AuditoriasLgpd_UsuarioId] ON [AuditoriasLgpd] ([UsuarioId]);
    CREATE INDEX [IX_Reservas_LaboratorioId_DataInicio_DataFim] ON [Reservas] ([LaboratorioId], [DataInicio], [DataFim]);
    CREATE INDEX [IX_Reservas_RecorrenciaGrupoId] ON [Reservas] ([RecorrenciaGrupoId]);
    CREATE INDEX [IX_Reservas_ResolvidoPorCoordenadorId] ON [Reservas] ([ResolvidoPorCoordenadorId]);
    CREATE INDEX [IX_Reservas_UsuarioId] ON [Reservas] ([UsuarioId]);
    CREATE INDEX [IX_SlotsHorario_LaboratorioId] ON [SlotsHorario] ([LaboratorioId]);
    CREATE UNIQUE INDEX [IX_Usuarios_Email] ON [Usuarios] ([Email]);
    CREATE UNIQUE INDEX [IX_Usuarios_SigaId] ON [Usuarios] ([SigaId]);

    -- Registro no Histórico de Migrations do EF Core
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260906180000_InitialCreate', N'8.0.8');
END;
GO

COMMIT;
GO
