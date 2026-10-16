using AgendaFatec.Application.DTOs;
using AgendaFatec.Application.Interfaces;
using AgendaFatec.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgendaFatec.Application.Services;

public class AuditoriaService : IAuditoriaService
{
    private readonly AgendaFatecDbContext _context;

    public AuditoriaService(AgendaFatecDbContext context)
    {
        _context = context;
    }

    /// <summary>Trilha de auditoria LGPD, mais recentes primeiro (sem rastreamento).</summary>
    public async Task<IEnumerable<AuditoriaLgpdDto>> ListarAuditoriasAsync()
    {
        var auditorias = await _context.AuditoriasLgpd
            .AsNoTracking()
            .OrderByDescending(a => a.DataHoraUtc)
            .ThenByDescending(a => a.Id)
            .ToListAsync();

        return auditorias.Select(a => new AuditoriaLgpdDto
        {
            Id = a.Id,
            UsuarioId = a.UsuarioId,
            UsuarioEmail = a.UsuarioEmail,
            Acao = a.Acao,
            EntidadeAfetada = a.EntidadeAfetada,
            RegistroId = a.RegistroId,
            Detalhes = a.Detalhes,
            IpOrigem = a.IpOrigem,
            DataHoraUtc = a.DataHoraUtc
        });
    }
}
