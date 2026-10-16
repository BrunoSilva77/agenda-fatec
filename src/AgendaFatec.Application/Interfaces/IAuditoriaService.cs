using AgendaFatec.Application.DTOs;

namespace AgendaFatec.Application.Interfaces;

public interface IAuditoriaService
{
    Task<IEnumerable<AuditoriaLgpdDto>> ListarAuditoriasAsync();
}
