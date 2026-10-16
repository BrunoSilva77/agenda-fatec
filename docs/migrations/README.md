# Migrations / Scripts de Banco

## MySQL (banco atual do projeto)

O schema é criado automaticamente pela aplicação com `db.Database.EnsureCreated()`
(`src/AgendaFatec.Api/Program.cs`), incluindo:

- tabelas do modelo (`Usuarios`, `Laboratorios`, `SlotsHorario`, `Reservas`, `AuditoriasLgpd`);
- seeds institucionais (Laboratórios 1, 2, 9 e 10 com perfil de uso);
- colunas novas `Laboratorios.Perfil` e `Laboratorios.Cor`.

Basta ter o servidor MySQL rodando (padrão: `localhost:3306`, database `AgendaFatec`,
usuário `root`) — a conexão fica em `src/AgendaFatec.Api/appsettings.json`.

Para recriar o banco do zero, basta apagar o database:

```sql
DROP DATABASE IF EXISTS AgendaFatec;
```

## Scripts legados (SQL Server)

`001_InitialCreate.sql` e `002_Laboratorios_Perfil_Cor.sql` foram escritos para
SQL Server/LocalDB (banco anterior do projeto) e ficam aqui apenas como referência
histórica. Não são executados pelo `EnsureCreated` do MySQL.
