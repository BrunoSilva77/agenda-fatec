using AgendaFatec.Domain.Enums;

namespace AgendaFatec.Application.DTOs;

/// <summary>
/// Dados para solicitação de uma nova reserva de laboratório.
/// </summary>
public class CriarReservaDto
{
    public int LaboratorioId { get; set; }
    public Guid UsuarioId { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public string Finalidade { get; set; } = string.Empty;
    public string? Observacao { get; set; }

    /// <summary>
    /// Indica se o agendamento deve se repetir semanalmente.
    /// </summary>
    public bool Recorrente { get; set; } = false;

    /// <summary>
    /// Quantidade de semanas para a recorrência.
    /// REGRA DE NEGÓCIO: Máximo permitido de 4 semanas (1 mês).
    /// </summary>
    public int QuantidadeSemanas { get; set; } = 1;
}

/// <summary>
/// Representação de uma reserva para exibição e consulta (LGPD-compliant).
/// </summary>
public class ReservaDto
{
    public Guid Id { get; set; }
    public int LaboratorioId { get; set; }
    public string LaboratorioNome { get; set; } = string.Empty;
    public Guid UsuarioId { get; set; }
    public string UsuarioNome { get; set; } = string.Empty;
    public string UsuarioEmail { get; set; } = string.Empty;
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public string Finalidade { get; set; } = string.Empty;
    public StatusReserva Status { get; set; }
    public Guid? RecorrenciaGrupoId { get; set; }
    public string? Justificativa { get; set; }
    public string? Observacao { get; set; }
    public DateTime CriadoEm { get; set; }
    public Guid? ResolvidoPorCoordenadorId { get; set; }
}

/// <summary>
/// Parâmetros para um Coordenador arbitrar ou resolver um conflito de horários.
/// </summary>
public class ResolverConflitoDto
{
    public Guid CoordenadorId { get; set; }
    public Guid? NovoUsuarioId { get; set; }
    public StatusReserva NovoStatus { get; set; } = StatusReserva.Confirmada;
    public string Justificativa { get; set; } = string.Empty;
}

/// <summary>
/// Consulta de disponibilidade de laboratório em uma data específica.
/// </summary>
public class DisponibilidadeLaboratorioDto
{
    public int LaboratorioId { get; set; }
    public string LaboratorioNome { get; set; } = string.Empty;
    public bool CompartilhadoEtec { get; set; }
    public DateTime Data { get; set; }
    public List<SlotDisponibilidadeDto> Slots { get; set; } = new();
}

public class SlotDisponibilidadeDto
{
    public int SlotId { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public TimeSpan HoraInicio { get; set; }
    public TimeSpan HoraFim { get; set; }
    public Turno Turno { get; set; }
    public bool Disponivel { get; set; }
    public bool ExclusivoEtec { get; set; }
    public Guid? ReservaId { get; set; }
    public string? FinalidadeOcupacao { get; set; }
    public string? ProfessorOcupante { get; set; }
}
