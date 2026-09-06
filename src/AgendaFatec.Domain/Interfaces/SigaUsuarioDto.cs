using AgendaFatec.Domain.Enums;

namespace AgendaFatec.Domain.Interfaces;

/// <summary>
/// Dados retornados pela autenticação institucional do SIGA.
/// Contém apenas as informações mínimas necessárias para a sessão de agendamento (LGPD).
/// </summary>
public class SigaUsuarioDto
{
    public string SigaId { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public PerfilUsuario Perfil { get; set; }
    public string UnidadeFatec { get; set; } = "Fatec Araçatuba";
    public bool Autenticado { get; set; }
    public string? TokenAutenticacao { get; set; }
}
