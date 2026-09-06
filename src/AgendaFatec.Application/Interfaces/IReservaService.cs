using AgendaFatec.Application.DTOs;
using AgendaFatec.Domain.Enums;

namespace AgendaFatec.Application.Interfaces;

public interface IReservaService
{
    Task<ReservaDto?> ObterPorIdAsync(Guid id);
    Task<IEnumerable<ReservaDto>> ListarAsync(int? laboratorioId, DateTime? dataInicio, DateTime? dataFim, StatusReserva? status);
    Task<DisponibilidadeLaboratorioDto> ObterDisponibilidadeAsync(int laboratorioId, DateTime data);
    Task<IEnumerable<ReservaDto>> CriarReservaAsync(CriarReservaDto dto, string? ipOrigem = null);
    Task<ReservaDto> ResolverConflitoAsync(Guid reservaId, ResolverConflitoDto dto, string? ipOrigem = null);
    Task CancelarReservaAsync(Guid reservaId, Guid solicitanteId, string? justificativa = null, string? ipOrigem = null);
}
