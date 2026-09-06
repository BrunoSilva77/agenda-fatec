using AgendaFatec.Domain.Enums;

namespace AgendaFatec.Domain.Entities;

/// <summary>
/// Representa uma faixa de horário (slot) pré-definida para agendamento.
/// Permite cadastrar tanto os blocos padrão da Fatec quanto grades divergentes da ETEC
/// para os Laboratórios 1 e 2.
/// </summary>
public class SlotHorario
{
    public int Id { get; set; }

    /// <summary>
    /// ID do laboratório específico, caso este slot pertença a uma grade customizada (ex: ETEC).
    /// Se for nulo, representa a grade padrão institucional da Fatec aplicada a qualquer laboratório.
    /// </summary>
    public int? LaboratorioId { get; set; }

    /// <summary>
    /// Turno ao qual o slot pertence (Manhã, Tarde ou Noite).
    /// </summary>
    public Turno Turno { get; set; }

    /// <summary>
    /// Horário inicial do bloco (ex: 07:30:00).
    /// </summary>
    public TimeSpan HoraInicio { get; set; }

    /// <summary>
    /// Horário final do bloco (ex: 08:20:00).
    /// </summary>
    public TimeSpan HoraFim { get; set; }

    /// <summary>
    /// Rótulo ou descrição do bloco (ex: "1º Horário Manhã - Fatec", "1º Horário ETEC").
    /// </summary>
    public string Descricao { get; set; } = string.Empty;

    /// <summary>
    /// Indica se o slot é exclusivo para uso da grade da ETEC.
    /// </summary>
    public bool ExclusivoEtec { get; set; } = false;

    /// <summary>
    /// Indica se o slot está ativo.
    /// </summary>
    public bool Ativo { get; set; } = true;

    /// <summary>
    /// Navegação para o laboratório caso seja um slot customizado.
    /// </summary>
    public virtual Laboratorio? Laboratorio { get; set; }
}
