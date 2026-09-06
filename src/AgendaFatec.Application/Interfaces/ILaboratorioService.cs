using AgendaFatec.Application.DTOs;

namespace AgendaFatec.Application.Interfaces;

public interface ILaboratorioService
{
    Task<IEnumerable<LaboratorioDto>> ListarLaboratoriosAsync();
    Task<LaboratorioDto?> ObterPorIdAsync(int id);
    Task<IEnumerable<SlotHorarioDto>> ObterGradeLaboratorioAsync(int laboratorioId);
}
