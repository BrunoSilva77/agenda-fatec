namespace AgendaFatec.Domain.Entities;

/// <summary>
/// Tabela de junção Reserva × Equipamento: quais itens do catálogo
/// acompanham cada reserva de aula.
/// </summary>
public class ReservaEquipamento
{
    public Guid ReservaId { get; set; }

    public string EquipamentoId { get; set; } = string.Empty;

    // Propriedades de Navegação
    public virtual Reserva Reserva { get; set; } = null!;

    public virtual Equipamento Equipamento { get; set; } = null!;
}
