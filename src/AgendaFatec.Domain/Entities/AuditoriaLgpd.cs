namespace AgendaFatec.Domain.Entities;

/// <summary>
/// Registra trilha de auditoria para conformidade com a LGPD e governança institucional.
/// Rastreia quem executou operações críticas (criação de reservas, resolução de conflitos por
/// coordenador, cancelamentos forçados e acessos administrativos).
/// </summary>
public class AuditoriaLgpd
{
    public long Id { get; set; }

    /// <summary>
    /// Identificador do usuário que executou a ação.
    /// </summary>
    public Guid? UsuarioId { get; set; }

    /// <summary>
    /// E-mail institucional do usuário no momento da ação (para preservação histórica).
    /// </summary>
    public string UsuarioEmail { get; set; } = string.Empty;

    /// <summary>
    /// Tipo de ação realizada (ex: "CRIACAO_RESERVA", "RESOLUCAO_CONFLITO", "CANCELAMENTO_COORDENADOR").
    /// </summary>
    public string Acao { get; set; } = string.Empty;

    /// <summary>
    /// Entidade afetada (ex: "Reserva", "Usuario").
    /// </summary>
    public string EntidadeAfetada { get; set; } = string.Empty;

    /// <summary>
    /// ID do registro afetado (ex: ID da Reserva).
    /// </summary>
    public string RegistroId { get; set; } = string.Empty;

    /// <summary>
    /// Detalhes ou justificativa da operação (essencial para deliberações de coordenação).
    /// </summary>
    public string Detalhes { get; set; } = string.Empty;

    /// <summary>
    /// Endereço IP de origem da requisição (quando disponível na camada web).
    /// </summary>
    public string? IpOrigem { get; set; }

    /// <summary>
    /// Data e hora exata da ação (UTC).
    /// </summary>
    public DateTime DataHoraUtc { get; set; } = DateTime.UtcNow;
}
