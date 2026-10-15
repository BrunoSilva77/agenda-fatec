using AgendaFatec.Application.DTOs;

namespace AgendaFatec.Application.Interfaces;

public interface ILaboratorioService
{
    Task<IEnumerable<LaboratorioDto>> ListarLaboratoriosAsync();
    Task<LaboratorioDto?> ObterPorIdAsync(int id);
    Task<LaboratorioDto> CriarAsync(CriarLaboratorioDto dto);
    Task<IEnumerable<SlotHorarioDto>> ObterGradeLaboratorioAsync(int laboratorioId);
}
