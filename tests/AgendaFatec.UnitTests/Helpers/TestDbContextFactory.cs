using AgendaFatec.Domain.Entities;
using AgendaFatec.Domain.Enums;
using AgendaFatec.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace AgendaFatec.UnitTests.Helpers;

public static class TestDbContextFactory
{
    public static AgendaFatecDbContext CreateInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AgendaFatecDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        var context = new AgendaFatecDbContext(options);
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();

        SeedTestData(context);

        return context;
    }

    private static void SeedTestData(AgendaFatecDbContext context)
    {
        var professor1 = new Usuario
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Nome = "Prof. Silva",
            Email = "silva@fatec.sp.gov.br",
            SigaId = "SIGA-001",
            Perfil = PerfilUsuario.Professor,
            Ativo = true
        };

        var professor2 = new Usuario
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Nome = "Profa. Maria",
            Email = "maria@fatec.sp.gov.br",
            SigaId = "SIGA-002",
            Perfil = PerfilUsuario.Professor,
            Ativo = true
        };

        var coordenador = new Usuario
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Nome = "Coord. Oliveira",
            Email = "oliveira@fatec.sp.gov.br",
            SigaId = "SIGA-COORD",
            Perfil = PerfilUsuario.Coordenador,
            Ativo = true
        };

        context.Usuarios.AddRange(professor1, professor2, coordenador);

        // Adiciona um slot customizado da ETEC no Laboratório 1 para testes da regra de flexibilidade
        context.SlotsHorario.Add(new SlotHorario
        {
            Id = 100,
            LaboratorioId = 1,
            Turno = Turno.Tarde,
            HoraInicio = new TimeSpan(13, 15, 0),
            HoraFim = new TimeSpan(14, 05, 0),
            Descricao = "ETEC - Tarde Bloco 1 (13:15 - 14:05)",
            ExclusivoEtec = true,
            Ativo = true
        });

        context.SaveChanges();
    }
}
