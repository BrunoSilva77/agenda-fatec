namespace AgendaFatec.Application.DTOs;

/// <summary>
/// Registro de auditoria LGPD exposto na aba de Auditoria do sistema.
/// </summary>
public class AuditoriaLgpdDto
{
    public long Id { get; set; }
    public Guid? UsuarioId { get; set; }
    public string UsuarioEmail { get; set; } = string.Empty;
    public string Acao { get; set; } = string.Empty;
    public string EntidadeAfetada { get; set; } = string.Empty;
    public string RegistroId { get; set; } = string.Empty;
    public string Detalhes { get; set; } = string.Empty;
    public string? IpOrigem { get; set; }
    public DateTime DataHoraUtc { get; set; }
}
