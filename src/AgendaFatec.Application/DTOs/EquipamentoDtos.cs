namespace AgendaFatec.Application.DTOs;

/// <summary>
/// Representação de um item do catálogo de equipamentos.
/// </summary>
public class EquipamentoDto
{
    /// <summary>Código estável (ex: "carrinho-notebooks") — valor usado nas reservas.</summary>
    public string Id { get; set; } = string.Empty;

    public string Nome { get; set; } = string.Empty;

    public string? Detalhe { get; set; }

    /// <summary>Exclusivo = só uma reserva ativa por intervalo de tempo.</summary>
    public bool Exclusivo { get; set; }

    public bool Ativo { get; set; }

    public DateTime CriadoEm { get; set; }
}

/// <summary>
/// Cadastro de um novo equipamento no catálogo — restrito à Coordenação.
/// </summary>
public class CriarEquipamentoDto
{
    /// <summary>Solicitante (identidade do SIGA) — o serviço valida o perfil.</summary>
    public Guid SolicitanteId { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string? Detalhe { get; set; }

    /// <summary>Marca o item como exclusivo (um por horário).</summary>
    public bool Exclusivo { get; set; } = false;
}
