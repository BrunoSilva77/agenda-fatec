using AgendaFatec.Domain.Enums;

namespace AgendaFatec.Domain.Entities;

/// <summary>
/// Representa o agendamento de um laboratório por um usuário.
/// Inclui token de concorrência otimista (RowVersion) para prevenir dupla reserva simultânea
/// e identificador de grupo para controle do teto de recorrência (máximo de 1 mês).
/// </summary>
public class Reserva
{
    public Guid Id { get; set; }

    /// <summary>
    /// Laboratório solicitado para o agendamento.
    /// </summary>
    public int LaboratorioId { get; set; }

    /// <summary>
    /// Usuário docente que solicitou a reserva.
    /// </summary>
    public Guid UsuarioId { get; set; }

    /// <summary>
    /// Data e hora de início da reserva.
    /// </summary>
    public DateTime DataInicio { get; set; }

    /// <summary>
    /// Data e hora de término da reserva.
    /// </summary>
    public DateTime DataFim { get; set; }

    /// <summary>
    /// Disciplina ou finalidade acadêmica da reserva (ex: "Estrutura de Dados").
    /// </summary>
    public string Finalidade { get; set; } = string.Empty;

    /// <summary>
    /// Status atual da reserva.
    /// </summary>
    public StatusReserva Status { get; set; } = StatusReserva.Confirmada;

    /// <summary>
    /// Identificador que agrupa reservas geradas por um agendamento recorrente.
    /// Limite de negócio: no máximo 1 mês de recorrência.
    /// </summary>
    public Guid? RecorrenciaGrupoId { get; set; }

    /// <summary>
    /// Justificativa preenchida pelo solicitante ou pelo coordenador em caso de alteração/conflito.
    /// </summary>
    public string? Justificativa { get; set; }

    /// <summary>
    /// Observações adicionais sobre equipamentos ou necessidades de software.
    /// </summary>
    public string? Observacao { get; set; }

    /// <summary>
    /// Caso a reserva tenha sido remanejada/resolvida por um Coordenador.
    /// </summary>
    public Guid? ResolvidoPorCoordenadorId { get; set; }

    /// <summary>
    /// Data e hora da criação da reserva (UTC).
    /// </summary>
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Data da última alteração ou resolução de conflito.
    /// </summary>
    public DateTime? AtualizadoEm { get; set; }

    /// <summary>
    /// Token de concorrência otimista (SQL Server ROWVERSION / timestamp).
    /// Evita concorrência e dupla reserva concorrente no mesmo milissegundo via EF Core.
    /// </summary>
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    // Propriedades de Navegação
    public virtual Laboratorio Laboratorio { get; set; } = null!;
    public virtual Usuario Usuario { get; set; } = null!;
    public virtual Usuario? ResolvidoPorCoordenador { get; set; }
}
