namespace AgendaFatec.Domain.Entities;

/// <summary>
/// Representa um dos laboratórios de informática gerenciados pela instituição.
/// Ex: Laboratório 1, 2 (compartilhados com ETEC), 9 e 10.
/// </summary>
public class Laboratorio
{
    /// <summary>
    /// Identificador do laboratório (ex: 1, 2, 9, 10).
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Nome ou descrição do laboratório (ex: "Laboratório 1").
    /// </summary>
    public string Nome { get; set; } = string.Empty;

    /// <summary>
    /// Identifica se o laboratório é compartilhado com a ETEC.
    /// Exige grade de horários flexível / customizada.
    /// </summary>
    public bool CompartilhadoEtec { get; set; }

    /// <summary>
    /// Capacidade total de máquinas/estações de trabalho do laboratório.
    /// </summary>
    public int Capacidade { get; set; }

    /// <summary>
    /// Indica se o laboratório está ativo para novos agendamentos.
    /// </summary>
    public bool Ativo { get; set; } = true;

    /// <summary>
    /// Slots de horários cadastrados para este laboratório (quando possuir grade específica, como ETEC).
    /// </summary>
    public virtual ICollection<SlotHorario> SlotsHorario { get; set; } = new List<SlotHorario>();

    /// <summary>
    /// Histórico e reservas agendadas para o laboratório.
    /// </summary>
    public virtual ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
}
