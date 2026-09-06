using AgendaFatec.Domain.Enums;

namespace AgendaFatec.Domain.Entities;

/// <summary>
/// Representa um usuário autenticado no sistema (Professor ou Coordenador).
/// Alinhado aos princípios de minimização da LGPD: armazena apenas dados estritamente
/// necessários para autenticação institucional e gestão de reservas.
/// </summary>
public class Usuario
{
    public Guid Id { get; set; }

    /// <summary>
    /// Nome completo do usuário obtido via integração com o SIGA.
    /// </summary>
    public string Nome { get; set; } = string.Empty;

    /// <summary>
    /// E-mail institucional do usuário (@fatec.sp.gov.br ou @cps.sp.gov.br).
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Identificador único institucional originário do sistema SIGA.
    /// </summary>
    public string SigaId { get; set; } = string.Empty;

    /// <summary>
    /// Papel do usuário no sistema (Professor ou Coordenador).
    /// </summary>
    public PerfilUsuario Perfil { get; set; } = PerfilUsuario.Professor;

    /// <summary>
    /// Indica se o cadastro está ativo no sistema.
    /// </summary>
    public bool Ativo { get; set; } = true;

    /// <summary>
    /// Data de cadastro inicial no sistema.
    /// </summary>
    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Coleção de reservas solicitadas pelo usuário.
    /// </summary>
    public virtual ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
}
