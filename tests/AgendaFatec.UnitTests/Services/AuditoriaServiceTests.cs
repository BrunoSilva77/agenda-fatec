using AgendaFatec.Application.Services;
using AgendaFatec.Domain.Entities;
using AgendaFatec.UnitTests.Helpers;
using FluentAssertions;
using Xunit;

namespace AgendaFatec.UnitTests.Services;

public class AuditoriaServiceTests
{
    [Fact]
    public async Task ListarAuditorias_DeveRetornarMaisRecentesPrimeiro()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(ListarAuditorias_DeveRetornarMaisRecentesPrimeiro));
        context.AuditoriasLgpd.AddRange(
            new AuditoriaLgpd
            {
                UsuarioEmail = "antiga@fatec.sp.gov.br",
                Acao = "CRIACAO_RESERVA",
                EntidadeAfetada = "Reserva",
                RegistroId = "aaaa-1111",
                Detalhes = "Reserva criada",
                IpOrigem = "127.0.0.1",
                DataHoraUtc = new DateTime(2026, 10, 10, 12, 0, 0, DateTimeKind.Utc)
            },
            new AuditoriaLgpd
            {
                UsuarioEmail = "nova@fatec.sp.gov.br",
                Acao = "CANCELAMENTO_RESERVA",
                EntidadeAfetada = "Reserva",
                RegistroId = "bbbb-2222",
                Detalhes = "Cancelamento deliberado",
                IpOrigem = "127.0.0.1",
                DataHoraUtc = new DateTime(2026, 10, 15, 12, 0, 0, DateTimeKind.Utc)
            });
        await context.SaveChangesAsync();

        var service = new AuditoriaService(context);

        // Act
        var resultado = (await service.ListarAuditoriasAsync()).ToList();

        // Assert
        resultado.Should().HaveCount(2);
        resultado[0].UsuarioEmail.Should().Be("nova@fatec.sp.gov.br");
        resultado[0].Acao.Should().Be("CANCELAMENTO_RESERVA");
        resultado[1].UsuarioEmail.Should().Be("antiga@fatec.sp.gov.br");
    }
}
