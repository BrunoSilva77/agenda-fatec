using AgendaFatec.Application.DTOs;

namespace AgendaFatec.Application.Interfaces;

public interface ILaboratorioService
{
    Task<IEnumerable<LaboratorioDto>> ListarLaboratoriosAsync();
    Task<LaboratorioDto?> ObterPorIdAsync(int id);
    Task<LaboratorioDto> CriarAsync(CriarLaboratorioDto dto);
    Task<IEnumerable<SlotHorarioDto>> ObterGradeLaboratorioAsync(int laboratorioId);

    /// <summary>
    /// Exclui uma sala. Restrito à Coordenação/Administração.
    /// Bloqueia a exclusão quando a sala ainda possui reservas ativas
    /// (o FK do banco é Restrict — apagaria o histórico da auditoria LGPD).
    /// </summary>
    Task ExcluirAsync(int laboratorioId, Guid solicitanteId, string? ipOrigem);
}
