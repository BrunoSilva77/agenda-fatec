using AgendaFatec.Domain.Enums;
using AgendaFatec.Domain.Interfaces;

namespace AgendaFatec.Infrastructure.Services.Siga;

/// <summary>
/// Implementação Mock do serviço de autenticação SIGA para desenvolvimento local,
/// homologação e execução de testes automatizados sem necessidade da API real do SIGA no ar.
/// </summary>
public class MockSigaAuthService : ISigaAuthService
{
    private static readonly List<SigaUsuarioDto> UsuariosMock = new()
    {
        new SigaUsuarioDto
        {
            SigaId = "SIGA-PROF-1001",
            Nome = "Prof. Carlos Eduardo",
            Email = "carlos.eduardo@fatec.sp.gov.br",
            Perfil = PerfilUsuario.Professor,
            UnidadeFatec = "Fatec Araçatuba",
            Autenticado = true,
            TokenAutenticacao = "mock-token-siga-prof-1001"
        },
        new SigaUsuarioDto
        {
            SigaId = "SIGA-PROF-1002",
            Nome = "Profa. Juliana Santos",
            Email = "juliana.santos@fatec.sp.gov.br",
            Perfil = PerfilUsuario.Professor,
            UnidadeFatec = "Fatec Araçatuba",
            Autenticado = true,
            TokenAutenticacao = "mock-token-siga-prof-1002"
        },
        new SigaUsuarioDto
        {
            SigaId = "SIGA-COORD-2001",
            Nome = "Coord. Marcelo Oliveira",
            Email = "marcelo.oliveira@fatec.sp.gov.br",
            Perfil = PerfilUsuario.Coordenador,
            UnidadeFatec = "Fatec Araçatuba",
            Autenticado = true,
            TokenAutenticacao = "mock-token-siga-coord-2001"
        }
    };

    public Task<SigaUsuarioDto?> AutenticarAsync(string loginInstitucional, string senha)
    {
        // Simulação: qualquer senha "fatec123" ou "123456" autentica as contas mockadas por e-mail ou SigaId
        var usuario = UsuariosMock.FirstOrDefault(u =>
            u.Email.Equals(loginInstitucional, StringComparison.OrdinalIgnoreCase) ||
            u.SigaId.Equals(loginInstitucional, StringComparison.OrdinalIgnoreCase));

        if (usuario != null && (senha == "fatec123" || senha == "123456" || senha == "admin"))
        {
            return Task.FromResult<SigaUsuarioDto?>(usuario);
        }

        // Se não encontrar exatamente, mas tiver formato @fatec.sp.gov.br, simula professor genérico
        if (loginInstitucional.EndsWith("@fatec.sp.gov.br", StringComparison.OrdinalIgnoreCase) && senha == "fatec123")
        {
            var nomeGerado = loginInstitucional.Split('@')[0].Replace(".", " ");
            var novoMock = new SigaUsuarioDto
            {
                SigaId = $"SIGA-PROF-{Math.Abs(loginInstitucional.GetHashCode()) % 10000}",
                Nome = char.ToUpper(nomeGerado[0]) + nomeGerado[1..],
                Email = loginInstitucional.ToLowerInvariant(),
                Perfil = PerfilUsuario.Professor,
                UnidadeFatec = "Fatec Araçatuba",
                Autenticado = true,
                TokenAutenticacao = Guid.NewGuid().ToString("N")
            };
            return Task.FromResult<SigaUsuarioDto?>(novoMock);
        }

        return Task.FromResult<SigaUsuarioDto?>(null);
    }

    public Task<SigaUsuarioDto?> ObterPorSigaIdAsync(string sigaId)
    {
        var usuario = UsuariosMock.FirstOrDefault(u => u.SigaId.Equals(sigaId, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(usuario);
    }
}
