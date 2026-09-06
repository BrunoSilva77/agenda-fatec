namespace AgendaFatec.Domain.Enums;

/// <summary>
/// Status do ciclo de vida de uma solicitação de reserva de laboratório.
/// </summary>
public enum StatusReserva
{
    /// <summary>
    /// Reserva confirmada e garantida (modelo First-Come, First-Served).
    /// </summary>
    Confirmada = 1,

    /// <summary>
    /// Reserva identificada em situação de atrito/conflito aguardando deliberação da coordenação.
    /// </summary>
    EmConflito = 2,

    /// <summary>
    /// Reserva cancelada pelo solicitante ou revogada pela coordenação.
    /// </summary>
    Cancelada = 3,

    /// <summary>
    /// Reserva pendente de autorização especial quando aplicável.
    /// </summary>
    PendenteCoordenacao = 4
}
