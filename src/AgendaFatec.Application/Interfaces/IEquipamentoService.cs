using AgendaFatec.Application.DTOs;

namespace AgendaFatec.Application.Interfaces;

/// <summary>
/// Catálogo de equipamentos extras das reservas (carrinho de notebooks, projetor...).
/// Consulta liberada para todos; cadastro e exclusão restritos à Coordenação.
/// </summary>
public interface IEquipamentoService
{
    /// <summary>Lista o catálogo (por padrão apenas itens ativos).</summary>
    Task<IEnumerable<EquipamentoDto>> ListarAsync(bool incluirInativos = false);

    /// <summary>Cadastra um novo item — somente Coordenador/Administrador.</summary>
    Task<EquipamentoDto> CriarAsync(CriarEquipamentoDto dto, string? ipOrigem = null);

    /// <summary>
    /// Remove um item do catálogo — somente Coordenador/Administrador.
    /// Recusado enquanto o equipamento estiver em uso por reservas ativas.
    /// </summary>
    Task ExcluirAsync(string id, Guid solicitanteId, string? ipOrigem = null);
}
