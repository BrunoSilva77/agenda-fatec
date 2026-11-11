namespace AgendaFatec.Domain.Entities;

/// <summary>
/// Item do catálogo de equipamentos que pode acompanhar uma reserva de aula
/// (ex: carrinho de notebooks, projetor, caixa de som).
/// O Id é um código estável em minúsculas (ex: "carrinho-notebooks"), gerado a
/// partir do nome — é o valor que o frontend envia em CriarReservaDto.Equipamentos.
/// </summary>
public class Equipamento
{
    /// <summary>
    /// Código estável do equipamento (PK): slug em minúsculas sem acento.
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Nome exibido no dropdown de equipamentos da reserva.
    /// </summary>
    public string Nome { get; set; } = string.Empty;

    /// <summary>
    /// Complemento curto exibido abaixo do nome (ex: "Projetor da sala").
    /// </summary>
    public string? Detalhe { get; set; }

    /// <summary>
    /// Equipamento exclusivo = só uma reserva ativa por intervalo de tempo
    /// (ex: o carrinho de notebooks é único — se já reservado, outro professor
    /// não pode pedir no mesmo horário).
    /// </summary>
    public bool Exclusivo { get; set; }

    /// <summary>
    /// Itens inativos saem do dropdown mas preservam o histórico nas reservas.
    /// </summary>
    public bool Ativo { get; set; } = true;

    /// <summary>
    /// Data/hora de cadastro (UTC).
    /// </summary>
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    // Propriedades de Navegação
    public virtual ICollection<ReservaEquipamento> ReservasEquipamentos { get; set; } = new List<ReservaEquipamento>();
}
