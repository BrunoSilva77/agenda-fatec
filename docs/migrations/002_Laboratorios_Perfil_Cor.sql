-- =============================================================================
-- 002_Laboratorios_Perfil_Cor.sql
-- Adiciona as colunas de Perfil de uso e Cor de identidade visual das salas.
-- Execute este script em BANCOS JA CRIADOS (o 001 cobre instalacoes novas).
-- Em bancos novos, o 001_InitialCreate.sql ja contem essas colunas.
-- =============================================================================

IF COL_LENGTH('dbo.Laboratorios', 'Perfil') IS NULL
    ALTER TABLE [dbo].[Laboratorios] ADD [Perfil] nvarchar(20) NULL;
GO

IF COL_LENGTH('dbo.Laboratorios', 'Cor') IS NULL
    ALTER TABLE [dbo].[Laboratorios] ADD [Cor] nvarchar(7) NULL;
GO

-- Perfil das salas institucionais (exibido nos chips do frontend)
UPDATE [dbo].[Laboratorios] SET [Perfil] = N'Fatec/ETEC' WHERE [Id] IN (1, 2);
UPDATE [dbo].[Laboratorios] SET [Perfil] = N'Fatec' WHERE [Id] IN (9, 10);
GO

-- =============================================================================
-- REGRAS DE NEGOCIO (aplicadas em codigo, sem mudanca de schema):
--  * Professores: janela de 14 dias de antecedencia + recorrencia de 2 semanas.
--  * Coordenador/Administrador (perfil 2): sem limite de data.
--  * Cadastro de salas: somente Coordenador/Administrador (via SolicitanteId).
-- =============================================================================
