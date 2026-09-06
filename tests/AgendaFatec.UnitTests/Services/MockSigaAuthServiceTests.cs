using AgendaFatec.Domain.Enums;
using AgendaFatec.Infrastructure.Services.Siga;
using FluentAssertions;
using Xunit;

namespace AgendaFatec.UnitTests.Services;

public class MockSigaAuthServiceTests
{
    private readonly MockSigaAuthService _service = new();

    [Fact]
    public async Task Autenticar_ComCredenciaisValidasProfessor_DeveRetornarUsuarioAutenticado()
    {
        // Act
        var usuario = await _service.AutenticarAsync("carlos.eduardo@fatec.sp.gov.br", "fatec123");

        // Assert
        usuario.Should().NotBeNull();
        usuario!.Autenticado.Should().BeTrue();
        usuario.Perfil.Should().Be(PerfilUsuario.Professor);
        usuario.Nome.Should().Be("Prof. Carlos Eduardo");
    }

    [Fact]
    public async Task Autenticar_ComCredenciaisValidasCoordenador_DeveRetornarCoordenadorAutenticado()
    {
        // Act
        var usuario = await _service.AutenticarAsync("marcelo.oliveira@fatec.sp.gov.br", "fatec123");

        // Assert
        usuario.Should().NotBeNull();
        usuario!.Autenticado.Should().BeTrue();
        usuario.Perfil.Should().Be(PerfilUsuario.Coordenador);
        usuario.Nome.Should().Be("Coord. Marcelo Oliveira");
    }

    [Fact]
    public async Task Autenticar_ComSenhaIncorreta_DeveRetornarNulo()
    {
        // Act
        var usuario = await _service.AutenticarAsync("carlos.eduardo@fatec.sp.gov.br", "senhaErrada");

        // Assert
        usuario.Should().BeNull();
    }
}
